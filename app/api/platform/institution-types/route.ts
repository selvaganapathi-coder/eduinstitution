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

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
  if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 });
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function GET() {
  try {
    await requirePermission("institution_type:view");
    const prisma = getPrisma();
    const institutionTypes = await prisma.institutionType.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      include: {
        capabilities: {
          orderBy: { capability: { name: "asc" } },
          include: { capability: true },
        },
        _count: { select: { tenants: true } },
      },
    });
    return NextResponse.json({ institutionTypes });
  } catch (error) {
    return errorResponse(error, "Unable to load institution types");
  }
}
