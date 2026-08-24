import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient, Prisma, StudentEnrollmentStatus, StudentStatus } from "@/src/generated/prisma/client";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  neonConfig.fetchConnectionCache = true;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}

function failure(error: unknown, fallback: string) {
  if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
  if (error instanceof AuthorizationError || error instanceof TenantAccessError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

function positiveInteger(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export async function GET(request: Request) {
  try {
    const context = await requirePermission("student:view");
    const params = new URL(request.url).searchParams;
    const page = positiveInteger(params.get("page"), 1, 1000000);
    const pageSize = positiveInteger(params.get("pageSize"), 20, 100);
    const search = params.get("search")?.trim();
    const academicYearId = params.get("academicYearId")?.trim();
    const departmentId = params.get("departmentId")?.trim();
    const programId = params.get("programId")?.trim();
    const status = params.get("status") === "ARCHIVED" ? StudentStatus.ARCHIVED : StudentStatus.ACTIVE;
    const prisma = getPrisma();

    const enrollmentFilters = {
      ...(academicYearId ? { academicYearId } : {}),
      ...(departmentId ? { departmentId } : {}),
      ...(programId ? { programId } : {}),
    };

    const where: Prisma.StudentWhereInput = {
      tenantId: context.tenantId,
      status,
      ...(Object.keys(enrollmentFilters).length > 0
        ? {
            enrollments: {
              some: {
                tenantId: context.tenantId,
                status: StudentEnrollmentStatus.ACTIVE,
                ...enrollmentFilters,
              },
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { studentNumber: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, students] = await prisma.$transaction([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          studentNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          photoUrl: true,
          status: true,
          createdAt: true,
          enrollments: {
            where: { tenantId: context.tenantId, status: StudentEnrollmentStatus.ACTIVE, ...enrollmentFilters },
            orderBy: [{ academicYear: { startDate: "desc" } }, { createdAt: "desc" }],
            take: 1,
            select: {
              id: true,
              enrollmentNumber: true,
              academicYear: { select: { id: true, name: true } },
              department: { select: { id: true, name: true, code: true } },
              program: { select: { id: true, name: true, code: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    return failure(error, "Unable to load students. Please try again.");
  }
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission("student:create");
    const body = (await request.json()) as Record<string, unknown>;
    const studentNumber = typeof body.studentNumber === "string" ? body.studentNumber.trim().toUpperCase() : "";
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() || null : null;
    const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
    const photoUrl = typeof body.photoUrl === "string" ? body.photoUrl.trim() || null : null;
    const academicYearId = typeof body.academicYearId === "string" ? body.academicYearId : "";
    const departmentId = typeof body.departmentId === "string" ? body.departmentId : "";
    const programId = typeof body.programId === "string" ? body.programId : "";
    const enrollmentNumber = typeof body.enrollmentNumber === "string" ? body.enrollmentNumber.trim().toUpperCase() : "";
    const dateOfBirth = typeof body.dateOfBirth === "string" && body.dateOfBirth ? new Date(body.dateOfBirth) : null;

    if (!studentNumber) return NextResponse.json({ error: "Enter a student number." }, { status: 400 });
    if (!firstName) return NextResponse.json({ error: "Enter the student's first name." }, { status: 400 });
    if (!lastName) return NextResponse.json({ error: "Enter the student's last name." }, { status: 400 });
    if (!academicYearId) return NextResponse.json({ error: "Select an academic year." }, { status: 400 });
    if (!departmentId) return NextResponse.json({ error: "Select a department." }, { status: 400 });
    if (!programId) return NextResponse.json({ error: "Select a program." }, { status: 400 });
    if (!enrollmentNumber) return NextResponse.json({ error: "Enter an enrollment number." }, { status: 400 });
    if (dateOfBirth && Number.isNaN(dateOfBirth.getTime())) return NextResponse.json({ error: "Enter a valid date of birth." }, { status: 400 });

    const prisma = getPrisma();
    const [academicYear, department, program, duplicateStudent, duplicateEnrollment] = await Promise.all([
      prisma.academicYear.findFirst({ where: { id: academicYearId, tenantId: context.tenantId, status: "ACTIVE" }, select: { id: true } }),
      prisma.department.findFirst({ where: { id: departmentId, tenantId: context.tenantId, status: "ACTIVE" }, select: { id: true } }),
      prisma.program.findFirst({ where: { id: programId, tenantId: context.tenantId, departmentId, status: "ACTIVE" }, select: { id: true } }),
      prisma.student.findUnique({ where: { tenantId_studentNumber: { tenantId: context.tenantId, studentNumber } }, select: { id: true } }),
      prisma.studentEnrollment.findUnique({ where: { tenantId_enrollmentNumber: { tenantId: context.tenantId, enrollmentNumber } }, select: { id: true } }),
    ]);

    if (!academicYear) return NextResponse.json({ error: "Select an active academic year." }, { status: 400 });
    if (!department) return NextResponse.json({ error: "Select an active department." }, { status: 400 });
    if (!program) return NextResponse.json({ error: "Select an active program in the selected department." }, { status: 400 });
    if (duplicateStudent) return NextResponse.json({ error: "A student with this student number already exists." }, { status: 409 });
    if (duplicateEnrollment) return NextResponse.json({ error: "An enrollment with this number already exists." }, { status: 409 });

    const student = await prisma.student.create({
      data: {
        tenantId: context.tenantId,
        studentNumber,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        photoUrl,
        enrollments: {
          create: {
            tenantId: context.tenantId,
            academicYearId,
            departmentId,
            programId,
            enrollmentNumber,
          },
        },
      },
      include: {
        enrollments: {
          include: {
            academicYear: { select: { id: true, name: true } },
            department: { select: { id: true, name: true, code: true } },
            program: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    return failure(error, "Unable to create the student. Please try again.");
  }
}
