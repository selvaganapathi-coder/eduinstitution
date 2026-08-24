-- TASK-015: Student Management Foundation
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "StudentEnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'WITHDRAWN', 'ARCHIVED');

CREATE TABLE "Student" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "studentNumber" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "dateOfBirth" TIMESTAMP(3),
  "photoUrl" TEXT,
  "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Student_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Student_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudentEnrollment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "programId" TEXT NOT NULL,
  "enrollmentNumber" TEXT NOT NULL,
  "status" "StudentEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentEnrollment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudentEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudentEnrollment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "StudentEnrollment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "StudentEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Student_tenantId_studentNumber_key" ON "Student"("tenantId", "studentNumber");
CREATE INDEX "Student_tenantId_status_lastName_firstName_idx" ON "Student"("tenantId", "status", "lastName", "firstName");
CREATE INDEX "Student_tenantId_email_idx" ON "Student"("tenantId", "email");
CREATE INDEX "Student_tenantId_phone_idx" ON "Student"("tenantId", "phone");

CREATE UNIQUE INDEX "StudentEnrollment_tenantId_enrollmentNumber_key" ON "StudentEnrollment"("tenantId", "enrollmentNumber");
CREATE UNIQUE INDEX "StudentEnrollment_studentId_academicYearId_key" ON "StudentEnrollment"("studentId", "academicYearId");
CREATE INDEX "StudentEnrollment_tenantId_status_academicYearId_idx" ON "StudentEnrollment"("tenantId", "status", "academicYearId");
CREATE INDEX "StudentEnrollment_tenantId_departmentId_status_idx" ON "StudentEnrollment"("tenantId", "departmentId", "status");
CREATE INDEX "StudentEnrollment_tenantId_programId_status_idx" ON "StudentEnrollment"("tenantId", "programId", "status");
CREATE INDEX "StudentEnrollment_studentId_status_idx" ON "StudentEnrollment"("studentId", "status");

INSERT INTO "Permission" ("id", "code", "description") VALUES
  ('seed-student-view','student:view','View student records'),
  ('seed-student-create','student:create','Create student records'),
  ('seed-student-update','student:update','Edit student records'),
  ('seed-student-archive','student:archive','Archive student records')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";

INSERT INTO "RolePermission" ("roleId","permissionId")
SELECT r."id", p."id" FROM "Role" r CROSS JOIN "Permission" p
WHERE r."scope" = 'SYSTEM' AND p."code" IN ('student:view','student:create','student:update','student:archive')
ON CONFLICT DO NOTHING;
