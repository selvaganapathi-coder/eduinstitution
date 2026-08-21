import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";
import { validateAcademicTermInput, datesOverlap } from "@/src/server/academic/validation";

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
    const context = await requirePermission("academic_term:view");
    const { id } = await params;
    const prisma = getPrisma();
    const academicYear = await prisma.academicYear.findFirst({
      where: { id, tenantId: context.tenantId },
      include: { terms: { orderBy: { sortOrder: "asc" } } },
    });
    if (!academicYear) throw new TenantAccessError("We couldn't find that academic year.");
    return NextResponse.json({ academicYear, terms: academicYear.terms });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error("Academic term list failed", error);
    return NextResponse.json({ error: "Unable to load terms" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await requirePermission("academic_term:create");
    const { id } = await params;
    const body = (await request.json()) as { name?: unknown; startDate?: unknown; endDate?: unknown; sortOrder?: unknown };
    const prisma = getPrisma();
    const academicYear = await prisma.academicYear.findFirst({ where: { id, tenantId: context.tenantId } });
    if (!academicYear) throw new TenantAccessError("We couldn't find that academic year.");

    const validated = validateAcademicTermInput(body, academicYear);
    if (!validated.value) return NextResponse.json({ error: validated.error }, { status: 400 });

    const existingTerms = await prisma.academicTerm.findMany({ where: { academicYearId: id, status: "ACTIVE" }, select: { startDate: true, endDate: true } });
    if (existingTerms.some((term) => datesOverlap(validated.value!.startDate, validated.value!.endDate, term.startDate, term.endDate))) {
      return NextResponse.json({ error: "This term overlaps another term." }, { status: 400 });
    }

    const term = await prisma.academicTerm.create({ data: { academicYearId: id, ...validated.value } });
    return NextResponse.json({ term }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof Error && "code" in error && error.code === "P2002") return NextResponse.json({ error: "A term with this name already exists." }, { status: 409 });
    console.error("Academic term create failed", error);
    return NextResponse.json({ error: "Unable to create the term" }, { status: 500 });
  }
}
