import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import { createSession } from "./session";
import { verifyPassword } from "./credentials";
import { AuthenticationError, TenantAccessError } from "./errors";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

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

const INVALID_CREDENTIALS = "Invalid email or password";

export type AuthenticateInput = {
  email: string;
  password: string;
  tenantId?: string;
};

export type AuthenticateResult = {
  userId: string;
  tenantId: string;
  sessionId: string;
  expiresAt: Date;
};

export async function authenticate(input: AuthenticateInput): Promise<AuthenticateResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) throw new AuthenticationError(INVALID_CREDENTIALS);

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
        select: { tenantId: true },
      },
    },
  });

  if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AuthenticationError(INVALID_CREDENTIALS);
  }

  const tenantId = input.tenantId;
  if (!tenantId) {
    if (user.memberships.length !== 1) {
      throw new TenantAccessError(
        user.memberships.length === 0
          ? "Your account does not have an active institution membership"
          : "Select an institution before signing in",
      );
    }
  }

  const selectedTenantId = tenantId ?? user.memberships[0]?.tenantId;
  if (!selectedTenantId || !user.memberships.some((membership) => membership.tenantId === selectedTenantId)) {
    throw new TenantAccessError("You do not have access to this institution");
  }

  const session = await createSession({
    userId: user.id,
    tenantId: selectedTenantId,
  });

  return {
    userId: session.userId,
    tenantId: session.tenantId,
    sessionId: session.id,
    expiresAt: session.expiresAt,
  };
}
