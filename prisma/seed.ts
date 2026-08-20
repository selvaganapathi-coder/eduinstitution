import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/server/auth/credentials";

const DEV_EMAIL = "admin@eduinstitution.local";
const DEV_PASSWORD = "ChangeMe123!";
const DEV_TENANT_SLUG = "demo-institution";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed must not run in production.");
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to run the development seed.");
  }

  neonConfig.fetchConnectionCache = true;

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });

  try {
    const passwordHash = await hashPassword(DEV_PASSWORD);

    const tenant = await prisma.tenant.upsert({
      where: { slug: DEV_TENANT_SLUG },
      update: { name: "Demo Institution" },
      create: {
        name: "Demo Institution",
        slug: DEV_TENANT_SLUG,
      },
    });

    const user = await prisma.user.upsert({
      where: { email: DEV_EMAIL },
      update: {
        name: "Demo Administrator",
        passwordHash,
      },
      create: {
        email: DEV_EMAIL,
        name: "Demo Administrator",
        passwordHash,
      },
    });

    const role = await prisma.role.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "Administrator",
        },
      },
      update: {
        description: "Development administrator role",
        scope: "TENANT",
        isSystem: true,
      },
      create: {
        tenantId: tenant.id,
        name: "Administrator",
        description: "Development administrator role",
        scope: "TENANT",
        isSystem: true,
      },
    });

    const membership = await prisma.membership.upsert({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: tenant.id,
        },
      },
      update: {
        status: "ACTIVE",
        roles: { set: [{ id: role.id }] },
      },
      create: {
        userId: user.id,
        tenantId: tenant.id,
        status: "ACTIVE",
        roles: { connect: [{ id: role.id }] },
      },
    });

    console.log("Development authentication seed ready:");
    console.log(`  Email: ${DEV_EMAIL}`);
    console.log(`  Password: ${DEV_PASSWORD}`);
    console.log(`  Tenant: ${tenant.name} (${tenant.id})`);
    console.log(`  Membership: ${membership.id}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
