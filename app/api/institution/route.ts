import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import {
  AuthenticationError,
  AuthorizationError,
  TenantAccessError,
} from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";
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

function institutionResponse(tenant: { id: string; name: string; slug: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

export async function GET() {
  try {
    const context = await requireTenantContext();
    const prisma = getPrisma();
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });

    if (!tenant) throw new TenantAccessError();
    return NextResponse.json({ institution: institutionResponse(tenant) });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error("Institution read failed", error);
    return NextResponse.json({ error: "Unable to load institution" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requirePermission("institution:update");
    const body = (await request.json()) as { name?: unknown };

    if (typeof body.name !== "string") {
      return NextResponse.json({ error: "Institution name is required" }, { status: 400 });
    }

    const name = body.name.trim();
    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: "Institution name must be between 2 and 120 characters" }, { status: 400 });
    }

    const prisma = getPrisma();
    const tenant = await prisma.tenant.update({
      where: { id: context.tenantId },
      data: { name },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ institution: institutionResponse(tenant) });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error("Institution update failed", error);
    return NextResponse.json({ error: "Unable to update institution" }, { status: 500 });
  }
}
