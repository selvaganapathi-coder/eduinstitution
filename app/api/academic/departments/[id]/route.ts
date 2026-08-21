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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await requirePermission("department:update");
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const description = typeof body.description === "string" ? body.description.trim() || null : null;
    const displayOrder = typeof body.displayOrder === "number" && Number.isInteger(body.displayOrder) ? body.displayOrder : 0;
    if (!name) return NextResponse.json({ error: "Enter a department name." }, { status: 400 });
    if (!code) return NextResponse.json({ error: "Enter a department code." }, { status: 400 });

    const prisma = getPrisma();
    const department = await prisma.department.findFirst({ where: { id, tenantId: context.tenantId } });
    if (!department) return NextResponse.json({ error: "Department not found." }, { status: 404 });
    const duplicate = await prisma.department.findFirst({ where: { tenantId: context.tenantId, code, NOT: { id } }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "A department with this code already exists." }, { status: 409 });
    const updated = await prisma.department.update({ where: { id }, data: { name, code, description, displayOrder } });
    return NextResponse.json({ department: updated });
  } catch (error) {
    return failure(error, "Unable to update the department. Please try again.");
  }
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await requirePermission("department:archive");
    const { id } = await params;
    const prisma = getPrisma();
    const department = await prisma.department.findFirst({ where: { id, tenantId: context.tenantId } });
    if (!department) return NextResponse.json({ error: "Department not found." }, { status: 404 });
    const updated = await prisma.department.update({ where: { id }, data: { status: "ARCHIVED" } });
    return NextResponse.json({ department: updated });
  } catch (error) {
    return failure(error, "Unable to archive the department. Please try again.");
  }
}
