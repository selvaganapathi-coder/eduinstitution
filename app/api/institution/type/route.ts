import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermissionFromContext } from "@/src/server/auth/authorization";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

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

export async function GET() {
  try {
    const context = await requireTenantContext();
    const prisma = getPrisma();
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
      include: { institutionType: { include: { capabilities: { include: { capability: true } } } } },
    });
    if (!tenant) throw new TenantAccessError();
    return NextResponse.json({ institutionType: tenant.institutionType });
  } catch (error) {
    return failure(error, "Unable to load institution type");
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireTenantContext();
    requirePermissionFromContext(context, "institution:update");
    const body = (await request.json()) as { institutionTypeId?: unknown };
    if (typeof body.institutionTypeId !== "string" || !body.institutionTypeId.trim()) {
      return NextResponse.json({ error: "Please select an institution type." }, { status: 400 });
    }

    const prisma = getPrisma();
    const institutionType = await prisma.institutionType.findFirst({ where: { id: body.institutionTypeId, status: "ACTIVE" } });
    if (!institutionType) return NextResponse.json({ error: "The selected institution type is not available." }, { status: 400 });

    const tenant = await prisma.tenant.update({
      where: { id: context.tenantId },
      data: { institutionTypeId: institutionType.id },
      include: { institutionType: { include: { capabilities: { include: { capability: true } } } } },
    });
    return NextResponse.json({ institutionType: tenant.institutionType });
  } catch (error) {
    return failure(error, "Unable to update institution type");
  }
}
