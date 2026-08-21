import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";
import { validateAcademicYearInput } from "@/src/server/academic/validation";

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

export async function GET() {
  try {
    const context = await requirePermission("academic_year:view");
    const prisma = getPrisma();
    const years = await prisma.academicYear.findMany({ where: { tenantId: context.tenantId }, orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }], include: { _count: { select: { terms: true } } } });
    return NextResponse.json({ academicYears: years });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error("Academic year list failed", error);
    return NextResponse.json({ error: "Unable to load academic years" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission("academic_year:create");
    const body = (await request.json()) as { name?: unknown; startDate?: unknown; endDate?: unknown };
    const validated = validateAcademicYearInput(body);
    if (!validated.value) return NextResponse.json({ error: validated.error }, { status: 400 });
    const prisma = getPrisma();
    const academicYear = await prisma.academicYear.create({ data: { tenantId: context.tenantId, ...validated.value } });
    return NextResponse.json({ academicYear }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof Error && "code" in error && error.code === "P2002") return NextResponse.json({ error: "An academic year with this name already exists." }, { status: 409 });
    console.error("Academic year create failed", error);
    return NextResponse.json({ error: "Unable to create academic year" }, { status: 500 });
  }
}
