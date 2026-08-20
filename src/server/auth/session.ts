import { cookies } from "next/headers";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import { PrismaClient } from "@/src/generated/prisma/client";
import {
  generateSessionToken,
  getSessionCookieOptions,
  hashSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "./session-core";

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

export async function createSession(input: {
  userId: string;
  tenantId: string;
  expiresInSeconds?: number;
}) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(
    Date.now() + (input.expiresInSeconds ?? SESSION_TTL_SECONDS) * 1000,
  );

  const prisma = getPrisma();
  const session = await prisma.session.create({
    data: {
      userId: input.userId,
      tenantId: input.tenantId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions(expiresAt));

  return {
    id: session.id,
    userId: session.userId,
    tenantId: session.tenantId,
    expiresAt: session.expiresAt,
  };
}

export async function revokeSession(token: string) {
  const tokenHash = hashSessionToken(token);
  const prisma = getPrisma();

  await prisma.session.deleteMany({
    where: { tokenHash },
  });
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) await revokeSession(token);

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function cleanupExpiredSessions() {
  const prisma = getPrisma();
  return prisma.session.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
}
