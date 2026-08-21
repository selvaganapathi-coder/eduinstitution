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
    const context = await requirePermission("program:update");
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const departmentId = typeof body.departmentId === "string" ? body.departmentId : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const type = body.type === "DIPLOMA" || body.type === "CERTIFICATE" || body.type === "OTHER" ? body.type : "DEGREE";
    const durationMonths = typeof body.durationMonths === "number" && Number.isInteger(body.durationMonths) && body.durationMonths > 0 ? body.durationMonths : null;
    const description = typeof body.description === "string" ? body.description.trim() || null : null;
    if (!departmentId) return NextResponse.json({ error: "Select a department." }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Enter a program name." }, { status: 400 });
    if (!code) return NextResponse.json({ error: "Enter a program code." }, { status: 400 });
    const prisma = getPrisma();
    const existing = await prisma.program.findFirst({ where: { id, tenantId: context.tenantId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Program not found." }, { status: 404 });
    const department = await prisma.department.findFirst({ where: { id: departmentId, tenantId: context.tenantId, status: "ACTIVE" }, select: { id: true } });
    if (!department) return NextResponse.json({ error: "Select an active department." }, { status: 400 });
    const duplicate = await prisma.program.findFirst({ where: { tenantId: context.tenantId, code, NOT: { id } }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "A program with this code already exists." }, { status: 409 });
    const updated = await prisma.program.update({ where: { id }, data: { departmentId, name, code, type, durationMonths, description }, include: { department: { select: { id: true, name: true, code: true } } } });
    return NextResponse.json({ program: updated });
  } catch (error) {
    return failure(error, "Unable to update the program. Please try again.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await requirePermission("program:archive");
    const { id } = await params;
    const prisma = getPrisma();
    const program = await prisma.program.findFirst({ where: { id, tenantId: context.tenantId }, select: { id: true, status: true } });
    if (!program) return NextResponse.json({ error: "Program not found." }, { status: 404 });
    if (program.status === "ARCHIVED") return NextResponse.json({ error: "This program is already archived." }, { status: 400 });
    const updated = await prisma.program.update({ where: { id }, data: { status: "ARCHIVED" }, include: { department: { select: { id: true, name: true, code: true } } } });
    return NextResponse.json({ program: updated });
  } catch (error) {
    return failure(error, "Unable to archive the program. Please try again.");
  }
}
