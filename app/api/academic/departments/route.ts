import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@/src/generated/prisma/client";
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
  if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
const activeProgramCount = { select: { programs: { where: { status: "ACTIVE" } } } };

export async function GET() {
  try {
    const context = await requirePermission("department:view");
    const prisma = getPrisma();
    const departments = await prisma.department.findMany({ where: { tenantId: context.tenantId }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }], include: { _count: activeProgramCount } });
    return NextResponse.json({ departments });
  } catch (error) {
    return failure(error, "Unable to load departments. Please try again.");
  }
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission("department:create");
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const description = typeof body.description === "string" ? body.description.trim() || null : null;
    const displayOrder = typeof body.displayOrder === "number" && Number.isInteger(body.displayOrder) ? body.displayOrder : 0;
    if (!name) return NextResponse.json({ error: "Enter a department name." }, { status: 400 });
    if (!code) return NextResponse.json({ error: "Enter a department code." }, { status: 400 });
    if (code.length > 30) return NextResponse.json({ error: "Department code must be 30 characters or fewer." }, { status: 400 });

    const prisma = getPrisma();
    const existing = await prisma.department.findUnique({ where: { tenantId_code: { tenantId: context.tenantId, code } }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "A department with this code already exists." }, { status: 409 });
    const department = await prisma.department.create({ data: { tenantId: context.tenantId, name, code, description, displayOrder }, include: { _count: activeProgramCount } });
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    return failure(error, "Unable to create the department. Please try again.");
  }
}
