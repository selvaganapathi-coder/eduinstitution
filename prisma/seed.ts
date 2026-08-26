import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma-node/client.ts";
import { hashPassword } from "../src/server/auth/credentials.ts";

const DEV_EMAIL = "admin@eduinstitution.local";
const DEV_PASSWORD = "ChangeMe123!";
const DEV_TENANT_SLUG = "demo-institution";
const DEV_ROLE_NAME = "Platform Super Admin";

const INSTITUTION_TYPES = [
  ["SCHOOL", "School", "Schools, K-12 institutions, and similar general education providers."],
  ["ENGINEERING", "Engineering", "Engineering colleges and technical institutions."],
  ["PHARMACY", "Pharmacy", "Pharmacy colleges and institutions with pharmacy programs."],
  ["ARTS_SCIENCE", "Arts & Science", "Arts, science, commerce, and multidisciplinary colleges."],
  ["POLYTECHNIC", "Polytechnic", "Diploma-level technical and vocational institutions."],
  ["UNIVERSITY", "University", "Universities and higher-education institutions."],
  ["VOCATIONAL", "Vocational", "Skill-focused and vocational education institutions."],
  ["GENERAL", "General Institution", "A flexible starting type for institutions that need general platform capabilities."],
] as const;

const CAPABILITIES = [
  ["ACADEMIC_YEARS", "Academic years", "Manage academic years and their active periods."],
  ["ACADEMIC_TERMS", "Academic terms", "Manage terms within an academic year."],
  ["DEPARTMENTS", "Departments", "Organize the institution into departments."],
  ["PROGRAMS", "Programs", "Manage academic programs and courses of study."],
  ["STUDENTS", "Students", "Manage student records and enrollment."],
  ["FACULTY_STAFF", "Faculty and staff", "Manage teaching and administrative staff."],
  ["ATTENDANCE", "Attendance", "Record and review attendance."],
  ["ATTENDANCE_MORNING", "Morning attendance", "Record attendance for the morning session."],
  ["ATTENDANCE_AFTERNOON", "Afternoon attendance", "Record attendance for the afternoon session."],
  ["ATTENDANCE_FULL_DAY", "Full day attendance", "Record attendance for the full day."],
  ["ATTENDANCE_PERIOD", "Period attendance", "Record attendance by academic period."],
  ["ATTENDANCE_SUBJECT_SESSION", "Subject session attendance", "Record attendance for a subject session."],
  ["ATTENDANCE_LECTURE", "Lecture attendance", "Record attendance for a lecture."],
  ["ATTENDANCE_LAB", "Lab attendance", "Record attendance for a laboratory session."],
  ["ATTENDANCE_TUTORIAL", "Tutorial attendance", "Record attendance for a tutorial."],
  ["ATTENDANCE_SESSION", "Session attendance", "Record attendance for a training session."],
  ["ATTENDANCE_CUSTOM", "Custom attendance", "Record attendance using an institution-defined session type."],
  ["EXAMS_GRADES", "Exams and grades", "Manage examinations, assessments, and grades."],
  ["FEES", "Fees", "Manage fee structures, payments, and dues."],
  ["REPORTS", "Reports", "Generate operational and academic reports."],
] as const;

const BASE_CAPABILITY_CODES = [
  "ACADEMIC_YEARS",
  "ACADEMIC_TERMS",
  "DEPARTMENTS",
  "PROGRAMS",
  "STUDENTS",
  "FACULTY_STAFF",
  "ATTENDANCE",
  "EXAMS_GRADES",
  "FEES",
  "REPORTS",
] as const;

const ATTENDANCE_CAPABILITY_CODES_BY_TYPE: Record<string, readonly string[]> = {
  SCHOOL: ["ATTENDANCE_MORNING", "ATTENDANCE_AFTERNOON", "ATTENDANCE_FULL_DAY"],
  ENGINEERING: ["ATTENDANCE_PERIOD", "ATTENDANCE_SUBJECT_SESSION", "ATTENDANCE_FULL_DAY"],
  PHARMACY: ["ATTENDANCE_PERIOD", "ATTENDANCE_SUBJECT_SESSION", "ATTENDANCE_FULL_DAY"],
  ARTS_SCIENCE: ["ATTENDANCE_PERIOD", "ATTENDANCE_SUBJECT_SESSION", "ATTENDANCE_FULL_DAY"],
  POLYTECHNIC: ["ATTENDANCE_PERIOD", "ATTENDANCE_SUBJECT_SESSION", "ATTENDANCE_FULL_DAY"],
  UNIVERSITY: ["ATTENDANCE_LECTURE", "ATTENDANCE_LAB", "ATTENDANCE_TUTORIAL", "ATTENDANCE_CUSTOM"],
  VOCATIONAL: ["ATTENDANCE_SESSION", "ATTENDANCE_CUSTOM"],
  GENERAL: [],
};

const PERMISSIONS = [
  ["institution:update", "Update the current institution profile"],
  ["institution_type:view", "View institution types"],
  ["institution_type:manage", "Manage institution types"],
  ["institution_capability:view", "View institution capabilities"],
  ["institution_capability:manage", "Manage institution capabilities"],
  ["department:view", "View departments"],
  ["department:create", "Create departments"],
  ["department:update", "Edit departments"],
  ["department:archive", "Archive departments"],
  ["program:view", "View programs"],
  ["program:create", "Create programs"],
  ["program:update", "Edit programs"],
  ["program:archive", "Archive programs"],
  ["academic_year:view", "View academic years"],
  ["academic_year:create", "Create academic years"],
  ["academic_year:update", "Edit academic years"],
  ["academic_year:archive", "Archive academic years"],
  ["academic_term:view", "View academic terms"],
  ["academic_term:create", "Create academic terms"],
  ["academic_term:update", "Edit academic terms"],
  ["academic_term:archive", "Archive academic terms"],
  ["student:view", "View student records"],
  ["student:create", "Create student records"],
  ["student:update", "Edit student records"],
  ["student:archive", "Archive student records"],
  ["staff:view", "View faculty and staff records"],
  ["staff:create", "Create faculty and staff records"],
  ["staff:update", "Edit faculty and staff records"],
  ["staff:archive", "Archive faculty and staff records"],
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
    const institutionTypes = new Map<string, { id: string }>();
    for (const [code, name, description] of INSTITUTION_TYPES) {
      const type = await prisma.institutionType.upsert({
        where: { code },
        update: { name, description, status: "ACTIVE", isSystem: true },
        create: { code, name, description, status: "ACTIVE", isSystem: true },
        select: { id: true },
      });
      institutionTypes.set(code, type);
    }

    const capabilities = new Map<string, { id: string }>();
    for (const [code, name, description] of CAPABILITIES) {
      const capability = await prisma.institutionCapability.upsert({
        where: { code },
        update: { name, description },
        create: { code, name, description },
        select: { id: true },
      });
      capabilities.set(code, capability);
    }

    for (const [typeCode, type] of institutionTypes) {
      const allowedCodes = new Set([
        ...BASE_CAPABILITY_CODES,
        ...(ATTENDANCE_CAPABILITY_CODES_BY_TYPE[typeCode] ?? []),
      ]);

      for (const [capabilityCode, capability] of capabilities) {
        const enabled = allowedCodes.has(capabilityCode);
        await prisma.institutionTypeCapability.upsert({
          where: { institutionTypeId_capabilityId: { institutionTypeId: type.id, capabilityId: capability.id } },
          update: { enabled },
          create: { institutionTypeId: type.id, capabilityId: capability.id, enabled },
        });
      }
    }

    const generalType = institutionTypes.get("GENERAL");
    if (!generalType) throw new Error("The GENERAL institution type was not seeded.");

    const tenant = await prisma.tenant.upsert({
      where: { slug: DEV_TENANT_SLUG },
      update: { name: "Demo Institution", institutionTypeId: generalType.id },
      create: { name: "Demo Institution", slug: DEV_TENANT_SLUG, institutionTypeId: generalType.id },
    });

    const user = await prisma.user.upsert({
      where: { email: DEV_EMAIL },
      update: { name: "Development Super Admin", passwordHash: await hashPassword(DEV_PASSWORD) },
      create: { email: DEV_EMAIL, name: "Development Super Admin", passwordHash: await hashPassword(DEV_PASSWORD) },
    });

    const existingRole = await prisma.role.findFirst({
      where: { tenantId: null, name: DEV_ROLE_NAME, scope: "SYSTEM" },
    });
    const role = existingRole
      ? await prisma.role.update({
          where: { id: existingRole.id },
          data: { description: "Development-only platform super admin", isSystem: true },
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
      create: { userId: user.id, tenantId: tenant.id, status: "ACTIVE", roles: { connect: [{ id: role.id }] } },
    });

    console.log("Development Platform Super Admin seed ready:");
    console.log(`  Email: ${DEV_EMAIL}`);
    console.log(`  Password: ${DEV_PASSWORD}`);
    console.log(`  Role: ${DEV_ROLE_NAME} (SYSTEM)`);
    console.log(`  Demo tenant: ${tenant.name} (${tenant.id})`);
    console.log(`  Institution type: General Institution`);
    console.log(`  Membership: ${membership.id}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
