import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@/src/generated/prisma/client";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";
import { createOrGetAttendanceSession, getEligibleStudents } from "@/src/server/attendance/service";
import { validateAttendanceDate } from "@/src/server/attendance/validation";

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
  if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
  if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 400 });
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const context = await requirePermission("student:view");
    const params = new URL(request.url).searchParams;
    const academicGroupId = params.get("academicGroupId")?.trim();
    const date = validateAttendanceDate(params.get("attendanceDate"));
    if (!academicGroupId) return NextResponse.json({ error: "Academic group is required." }, { status: 400 });
    if ("error" in date) return NextResponse.json(date, { status: 400 });

    const prisma = getPrisma();
    const session = await createOrGetAttendanceSession(prisma, {
      tenantId: context.tenantId,
      academicGroupId,
      attendanceDate: date.value,
    });
    const students = await getEligibleStudents(prisma, {
      tenantId: context.tenantId,
      academicGroupId,
      attendanceDate: date.value,
    });

    return NextResponse.json({ session, students });
  } catch (error) {
    return failure(error, "Unable to load attendance session.");
  }
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission("student:view");
    const body = await request.json();
    const academicGroupId = typeof body.academicGroupId === "string" ? body.academicGroupId.trim() : "";
    const date = validateAttendanceDate(body.attendanceDate);
    const mode = body.mode === "SESSION" ? "SESSION" : "DAILY";
    if (!academicGroupId) return NextResponse.json({ error: "Academic group is required." }, { status: 400 });
    if ("error" in date) return NextResponse.json(date, { status: 400 });

    const session = await createOrGetAttendanceSession(getPrisma(), {
      tenantId: context.tenantId,
      academicGroupId,
      attendanceDate: date.value,
      mode,
    });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return failure(error, "Unable to create attendance session.");
  }
}
