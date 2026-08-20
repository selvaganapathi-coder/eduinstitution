import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import {
  AuthenticationError,
  TenantAccessError,
} from "./errors";
import { getAuthenticatedSession } from "./session";
import type { TenantContext } from "./types";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  neonConfig.fetchConnectionCache = true;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}

export async function requireTenantContext(): Promise<TenantContext> {
  const session = await getAuthenticatedSession();

  if (!session) {
    throw new AuthenticationError();
  }

  const prisma = getPrisma();
  const membership = await prisma.membership.findUnique({
    where: {
      userId_tenantId: {
        userId: session.userId,
        tenantId: session.tenantId,
      },
    },
    include: {
      roles: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    throw new TenantAccessError();
  }

  const roleIds = membership.roles.map((role) => role.id);
  const permissionCodes = [
    ...new Set(
      membership.roles.flatMap((role) =>
        role.permissions.map((rolePermission) => rolePermission.permission.code),
      ),
    ),
  ];

  return {
    userId: session.userId,
    tenantId: session.tenantId,
    sessionId: session.id,
    membershipId: membership.id,
    roleIds,
    permissionCodes,
  };
}
