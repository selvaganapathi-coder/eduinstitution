import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import { createSession } from "./session";
import { verifyPassword } from "./credentials";
import { AuthenticationError } from "./errors";
import { selectTenantId } from "./tenant-selection";

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

export type InstitutionOption = {
  id: string;
  name: string;
  slug: string;
};

type AuthenticatedUser = {
  id: string;
  memberships: Array<{
    tenantId: string;
    tenant: InstitutionOption;
  }>;
};

async function verifyCredentials(emailInput: string, password: string): Promise<AuthenticatedUser> {
  const email = emailInput.trim().toLowerCase();
  if (!email || !password) throw new AuthenticationError(INVALID_CREDENTIALS);

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
        select: {
          tenantId: true,
          tenant: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new AuthenticationError(INVALID_CREDENTIALS);
  }

  return user;
}

export async function getInstitutionOptions(
  input: Pick<AuthenticateInput, "email" | "password">,
): Promise<InstitutionOption[]> {
  const user = await verifyCredentials(input.email, input.password);

  return user.memberships.map(({ tenant }) => tenant);
}

export async function authenticate(input: AuthenticateInput): Promise<AuthenticateResult> {
  const user = await verifyCredentials(input.email, input.password);
  const selectedTenantId = selectTenantId(user.memberships, input.tenantId);

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
