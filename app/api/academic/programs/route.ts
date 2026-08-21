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

export async function GET(request: Request) {
  try {
    const context = await requirePermission("program:view");
    const departmentId = new URL(request.url).searchParams.get("departmentId");
    const prisma = getPrisma();
    const programs = await prisma.program.findMany({
      where: { tenantId: context.tenantId, ...(departmentId ? { departmentId } : {}) },
      orderBy: [{ name: "asc" }],
      include: { department: { select: { id: true, name: true, code: true } } },
    });
    return NextResponse.json({ programs });
  } catch (error) {
    return failure(error, "Unable to load programs. Please try again.");
  }
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission("program:create");
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
    const department = await prisma.department.findFirst({ where: { id: departmentId, tenantId: context.tenantId, status: "ACTIVE" }, select: { id: true } });
    if (!department) return NextResponse.json({ error: "Select an active department." }, { status: 400 });
    const duplicate = await prisma.program.findUnique({ where: { tenantId_code: { tenantId: context.tenantId, code } }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "A program with this code already exists." }, { status: 409 });

    const program = await prisma.program.create({ data: { tenantId: context.tenantId, departmentId, name, code, type, durationMonths, description }, include: { department: { select: { id: true, name: true, code: true } } } });
    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    return failure(error, "Unable to create the program. Please try again.");
  }
}
