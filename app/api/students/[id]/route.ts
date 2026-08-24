import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@/src/generated/prisma/client";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

type Context = { params: Promise<{ id: string }> };

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

export async function GET(_request: Request, { params }: Context) {
  try {
    const context = await requirePermission("student:view");
    const { id } = await params;
    const prisma = getPrisma();
    const student = await prisma.student.findFirst({
      where: { id, tenantId: context.tenantId },
      include: {
        enrollments: {
          where: { tenantId: context.tenantId },
          orderBy: [{ academicYear: { startDate: "desc" } }, { createdAt: "desc" }],
          include: {
            academicYear: { select: { id: true, name: true, status: true } },
            department: { select: { id: true, name: true, code: true } },
            program: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });
    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    return NextResponse.json({ student });
  } catch (error) {
    return failure(error, "Unable to load the student. Please try again.");
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const context = await requirePermission("student:update");
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const studentNumber = typeof body.studentNumber === "string" ? body.studentNumber.trim().toUpperCase() : "";
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() || null : null;
    const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
    const photoUrl = typeof body.photoUrl === "string" ? body.photoUrl.trim() || null : null;
    const dateOfBirth = typeof body.dateOfBirth === "string" && body.dateOfBirth ? new Date(body.dateOfBirth) : null;

    if (!studentNumber) return NextResponse.json({ error: "Enter a student number." }, { status: 400 });
    if (!firstName) return NextResponse.json({ error: "Enter the student's first name." }, { status: 400 });
    if (!lastName) return NextResponse.json({ error: "Enter the student's last name." }, { status: 400 });
    if (dateOfBirth && Number.isNaN(dateOfBirth.getTime())) return NextResponse.json({ error: "Enter a valid date of birth." }, { status: 400 });

    const prisma = getPrisma();
    const existing = await prisma.student.findFirst({ where: { id, tenantId: context.tenantId, status: "ACTIVE" }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    const duplicate = await prisma.student.findFirst({
      where: { tenantId: context.tenantId, studentNumber, id: { not: id } },
      select: { id: true },
    });
    if (duplicate) return NextResponse.json({ error: "A student with this student number already exists." }, { status: 409 });

    const student = await prisma.student.update({
      where: { id },
      data: { studentNumber, firstName, lastName, email, phone, dateOfBirth, photoUrl },
    });
    return NextResponse.json({ student });
  } catch (error) {
    return failure(error, "Unable to update the student. Please try again.");
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const context = await requirePermission("student:archive");
    const { id } = await params;
    const prisma = getPrisma();
    const existing = await prisma.student.findFirst({ where: { id, tenantId: context.tenantId, status: "ACTIVE" }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    await prisma.student.update({ where: { id }, data: { status: "ARCHIVED" } });
    return NextResponse.json({ message: "Student archived successfully." });
  } catch (error) {
    return failure(error, "Unable to archive the student. Please try again.");
  }
}
