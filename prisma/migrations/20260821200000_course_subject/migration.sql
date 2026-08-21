-- TASK-013: Course / Subject Management
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "CourseType" AS ENUM ('CORE', 'ELECTIVE', 'PRACTICAL', 'PROJECT', 'OTHER');
CREATE TABLE "Course" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "programId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "type" "CourseType" NOT NULL DEFAULT 'CORE',
  "credits" INTEGER,
  "weeklyHours" INTEGER,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Course_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Course_tenantId_code_key" ON "Course"("tenantId", "code");
CREATE INDEX "Course_tenantId_status_displayOrder_idx" ON "Course"("tenantId", "status", "displayOrder");
CREATE INDEX "Course_programId_status_displayOrder_idx" ON "Course"("programId", "status", "displayOrder");

INSERT INTO "Permission" ("id", "code", "description") VALUES
  ('seed-course-view','course:view','View courses and subjects'),
  ('seed-course-create','course:create','Create courses and subjects'),
  ('seed-course-update','course:update','Edit courses and subjects'),
  ('seed-course-archive','course:archive','Archive courses and subjects')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
INSERT INTO "RolePermission" ("roleId","permissionId")
SELECT r."id", p."id" FROM "Role" r CROSS JOIN "Permission" p
WHERE r."scope" = 'SYSTEM' AND p."code" IN ('course:view','course:create','course:update','course:archive')
ON CONFLICT DO NOTHING;
