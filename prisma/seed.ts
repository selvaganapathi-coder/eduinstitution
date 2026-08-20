import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma-node/client";
import { hashPassword } from "../src/server/auth/credentials";

const DEV_EMAIL = "admin@eduinstitution.local";
const DEV_PASSWORD = "ChangeMe123!";
const DEV_TENANT_SLUG = "demo-institution";
const INSTITUTION_UPDATE_PERMISSION = "institution:update";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed must not run in production.");
  }

  const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_DATABASE_URL or DATABASE_URL is required to run the development seed.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });

  try {
    const passwordHash = await hashPassword(DEV_PASSWORD);

    const tenant = await prisma.tenant.upsert({
      where: { slug: DEV_TENANT_SLUG },
      update: { name: "Demo Institution" },
      create: { name: "Demo Institution", slug: DEV_TENANT_SLUG },
    });

    const user = await prisma.user.upsert({
      where: { email: DEV_EMAIL },
      update: { name: "Demo Administrator", passwordHash },
      create: { email: DEV_EMAIL, name: "Demo Administrator", passwordHash },
    });

    const permission = await prisma.permission.upsert({
      where: { code: INSTITUTION_UPDATE_PERMISSION },
      update: { description: "Update the current institution profile" },
      create: {
        code: INSTITUTION_UPDATE_PERMISSION,
        description: "Update the current institution profile",
      },
    });

    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "Administrator" } },
      update: {
        description: "Development administrator role",
        scope: "TENANT",
        isSystem: true,
        permissions: {
          connect: [
            {
              roleId_permissionId: {
                roleId: "__ROLE_ID__",
                permissionId: permission.id,
              },
            },
          ],
        },
      },
      create: {
        tenantId: tenant.id,
        name: "Administrator",
        description: "Development administrator role",
        scope: "TENANT",
        isSystem: true,
        permissions: { create: { permissionId: permission.id } },
      },
    });

    const membership = await prisma.membership.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
      update: { status: "ACTIVE", roles: { set: [{ id: role.id }] } },
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
