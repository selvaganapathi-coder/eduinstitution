import { cookies } from "next/headers";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import {
  AuthenticationError,
  TenantAccessError,
} from "./errors";
import type { TenantContext } from "./types";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrisma() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  neonConfig.fetchConnectionCache = true;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export async function requireTenantContext(): Promise<TenantContext> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    throw new AuthenticationError();
  }

  const prisma = getPrisma();

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: sessionToken,
    },
  });

  if (!session) {
    throw new AuthenticationError("Invalid session");
  }

  if (session.expiresAt <= new Date()) {
    throw new AuthenticationError("Session expired");
  }

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
            include: {
              permission: true,
            },
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
