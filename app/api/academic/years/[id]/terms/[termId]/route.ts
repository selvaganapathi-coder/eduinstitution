import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";
import { datesOverlap, validateAcademicTermInput } from "@/src/server/academic/validation";

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

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string; termId: string }> }) {
  try {
    const context = await requirePermission("academic_term:update");
    const { id, termId } = await params;
    const body = (await _request.json()) as { name?: unknown; startDate?: unknown; endDate?: unknown; sortOrder?: unknown; action?: unknown };
    const prisma = getPrisma();
    const academicYear = await prisma.academicYear.findFirst({ where: { id, tenantId: context.tenantId } });
    if (!academicYear) throw new TenantAccessError("We couldn't find that academic year.");

    const existing = await prisma.academicTerm.findFirst({ where: { id: termId, academicYearId: id } });
    if (!existing) throw new TenantAccessError("We couldn't find that term.");

    if (body.action === "archive") {
      const term = await prisma.academicTerm.update({ where: { id: termId }, data: { status: "ARCHIVED" } });
      return NextResponse.json({ term });
    }

    const validated = validateAcademicTermInput(body, academicYear);
    if (!validated.value) return NextResponse.json({ error: validated.error }, { status: 400 });

    const otherTerms = await prisma.academicTerm.findMany({ where: { academicYearId: id, status: "ACTIVE", id: { not: termId } }, select: { startDate: true, endDate: true } });
    if (otherTerms.some((term) => datesOverlap(validated.value!.startDate, validated.value!.endDate, term.startDate, term.endDate))) {
      return NextResponse.json({ error: "This term overlaps another term." }, { status: 400 });
    }

    const term = await prisma.academicTerm.update({ where: { id: termId }, data: validated.value });
    return NextResponse.json({ term });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof Error && "code" in error && error.code === "P2002") return NextResponse.json({ error: "A term with this name already exists." }, { status: 409 });
    console.error("Academic term update failed", error);
    return NextResponse.json({ error: "Unable to update the term" }, { status: 500 });
  }
}
