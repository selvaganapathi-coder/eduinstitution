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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("institution_type:view");
    const { id } = await params;
    const prisma = getPrisma();
    const institutionType = await prisma.institutionType.findUnique({
      where: { id },
      include: {
        capabilities: {
          orderBy: { capability: { name: "asc" } },
          include: { capability: true },
        },
        _count: { select: { tenants: true } },
      },
    });
    if (!institutionType) return NextResponse.json({ error: "Institution type not found." }, { status: 404 });
    return NextResponse.json({ institutionType });
  } catch (error) {
    return failure(error, "Unable to load institution type");
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("institution_capability:manage");
    const { id } = await params;
    const body = (await request.json()) as { capabilities?: unknown };
    if (!Array.isArray(body.capabilities) || !body.capabilities.every((value) => typeof value === "object" && value !== null && "capabilityId" in value && "enabled" in value && typeof value.capabilityId === "string" && typeof value.enabled === "boolean")) {
      return NextResponse.json({ error: "Please provide a valid capability selection." }, { status: 400 });
    }

    const updates = body.capabilities as Array<{ capabilityId: string; enabled: boolean }>;
    const prisma = getPrisma();
    const institutionType = await prisma.institutionType.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!institutionType) return NextResponse.json({ error: "Institution type not found." }, { status: 404 });

    const capabilityIds = [...new Set(updates.map((item) => item.capabilityId))];
    const count = await prisma.institutionCapability.count({ where: { id: { in: capabilityIds } } });
    if (count !== capabilityIds.length) return NextResponse.json({ error: "One or more selected capabilities are not available." }, { status: 400 });

    await prisma.$transaction(
      updates.map((item) =>
        prisma.institutionTypeCapability.update({
          where: { institutionTypeId_capabilityId: { institutionTypeId: id, capabilityId: item.capabilityId } },
          data: { enabled: item.enabled },
        }),
      ),
    );

    const updated = await prisma.institutionType.findUnique({
      where: { id },
      include: { capabilities: { orderBy: { capability: { name: "asc" } }, include: { capability: true } } },
    });
    return NextResponse.json({ institutionType: updated });
  } catch (error) {
    return failure(error, "Unable to update capabilities");
  }
}
