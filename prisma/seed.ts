import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma-node/client";
import { hashPassword } from "../src/server/auth/credentials";

const DEV_EMAIL = "admin@eduinstitution.local";
const DEV_PASSWORD = "ChangeMe123!";
const DEV_TENANT_SLUG = "demo-institution";
const DEV_ROLE_NAME = "Platform Super Admin";
const PERMISSIONS = [
  ["institution:update", "Update the current institution profile"],
  ["academic_year:view", "View academic years"],
  ["academic_year:create", "Create academic years"],
  ["academic_year:update", "Edit academic years"],
  ["academic_year:archive", "Archive academic years"],
  ["academic_term:view", "View academic terms"],
  ["academic_term:create", "Create academic terms"],
  ["academic_term:update", "Edit academic terms"],
  ["academic_term:archive", "Archive academic terms"],
] as const;

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed must not run in production.");
  }

  const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_DATABASE_URL or DATABASE_URL is required to run the development seed.");
  }

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

  try {
    const passwordHash = await hashPassword(DEV_PASSWORD);

    const tenant = await prisma.tenant.upsert({
      where: { slug: DEV_TENANT_SLUG },
      update: { name: "Demo Institution" },
      create: { name: "Demo Institution", slug: DEV_TENANT_SLUG },
    });

    const user = await prisma.user.upsert({
      where: { email: DEV_EMAIL },
      update: { name: "Development Super Admin", passwordHash },
      create: { email: DEV_EMAIL, name: "Development Super Admin", passwordHash },
    });

    // Temporary development-only system role. The full platform-admin product is intentionally deferred.
    const existingRole = await prisma.role.findFirst({
      where: { tenantId: null, name: DEV_ROLE_NAME, scope: "SYSTEM" },
    });
    const role = existingRole
      ? await prisma.role.update({
          where: { id: existingRole.id },
          data: {
            description: "Development-only platform super admin",
            isSystem: true,
          },
        })
      : await prisma.role.create({
          data: {
            tenantId: null,
            name: DEV_ROLE_NAME,
            description: "Development-only platform super admin",
            scope: "SYSTEM",
            isSystem: true,
          },
        });

    for (const [code, description] of PERMISSIONS) {
      const permission = await prisma.permission.upsert({
        where: { code },
        update: { description },
        create: { code, description },
      });

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }

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

    console.log("Development Platform Super Admin seed ready:");
    console.log(`  Email: ${DEV_EMAIL}`);
    console.log(`  Password: ${DEV_PASSWORD}`);
    console.log(`  Role: ${DEV_ROLE_NAME} (SYSTEM)`);
    console.log(`  Demo tenant: ${tenant.name} (${tenant.id})`);
    console.log(`  Membership: ${membership.id}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
