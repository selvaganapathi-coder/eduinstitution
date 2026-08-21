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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await requirePermission("academic_year:view");
    const { id } = await params;
    const prisma = getPrisma();
    const academicYear = await prisma.academicYear.findFirst({ where: { id, tenantId: context.tenantId }, include: { terms: { orderBy: { sortOrder: "asc" } } } });
    if (!academicYear) throw new TenantAccessError("We couldn't find that academic year.");
    return NextResponse.json({ academicYear });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error("Academic year read failed", error);
    return NextResponse.json({ error: "Unable to load the academic year" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { name?: unknown; startDate?: unknown; endDate?: unknown; action?: unknown };
    const permission = body.action === "make-current" ? "academic_year:update" : body.action === "archive" ? "academic_year:archive" : "academic_year:update";
    const context = await requirePermission(permission);
    const prisma = getPrisma();
    const existing = await prisma.academicYear.findFirst({ where: { id, tenantId: context.tenantId } });
    if (!existing) throw new TenantAccessError("We couldn't find that academic year.");

    if (body.action === "make-current") {
      const academicYear = await prisma.$transaction(async (tx) => {
        await tx.academicYear.updateMany({ where: { tenantId: context.tenantId, isCurrent: true, id: { not: id } }, data: { isCurrent: false } });
        return tx.academicYear.update({ where: { id }, data: { isCurrent: true, status: "ACTIVE" } });
      });
      return NextResponse.json({ academicYear });
    }

    if (body.action === "archive") {
      if (existing.isCurrent) return NextResponse.json({ error: "Choose another current year before archiving this academic year." }, { status: 400 });
      const academicYear = await prisma.academicYear.update({ where: { id }, data: { status: "ARCHIVED", isCurrent: false } });
      return NextResponse.json({ academicYear });
    }

    const validated = validateAcademicYearInput(body);
    if (!validated.value) return NextResponse.json({ error: validated.error }, { status: 400 });
    const academicYear = await prisma.academicYear.update({ where: { id }, data: validated.value });
    return NextResponse.json({ academicYear });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof Error && "code" in error && error.code === "P2002") return NextResponse.json({ error: "An academic year with this name already exists." }, { status: 409 });
    console.error("Academic year update failed", error);
    return NextResponse.json({ error: "Unable to update the academic year" }, { status: 500 });
  }
}
