-- TASK-017 dependency: explicit academic attendance scope for restricted staff.

CREATE TABLE "StaffAttendanceScope" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "staffMemberId" TEXT NOT NULL,
  "departmentId" TEXT,
  "programId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StaffAttendanceScope_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StaffAttendanceScope_scope_required_check" CHECK (
    "departmentId" IS NOT NULL OR "programId" IS NOT NULL
  )
);

CREATE INDEX "StaffAttendanceScope_tenantId_staffMemberId_idx"
  ON "StaffAttendanceScope"("tenantId", "staffMemberId");

CREATE INDEX "StaffAttendanceScope_tenantId_departmentId_idx"
  ON "StaffAttendanceScope"("tenantId", "departmentId");

CREATE INDEX "StaffAttendanceScope_tenantId_programId_idx"
  ON "StaffAttendanceScope"("tenantId", "programId");

CREATE UNIQUE INDEX "StaffAttendanceScope_staff_department_key"
  ON "StaffAttendanceScope"("staffMemberId", "departmentId")
  WHERE "departmentId" IS NOT NULL AND "programId" IS NULL;

CREATE UNIQUE INDEX "StaffAttendanceScope_staff_program_key"
  ON "StaffAttendanceScope"("staffMemberId", "programId")
  WHERE "programId" IS NOT NULL AND "departmentId" IS NULL;

CREATE UNIQUE INDEX "StaffAttendanceScope_staff_department_program_key"
  ON "StaffAttendanceScope"("staffMemberId", "departmentId", "programId")
  WHERE "departmentId" IS NOT NULL AND "programId" IS NOT NULL;

ALTER TABLE "StaffAttendanceScope"
  ADD CONSTRAINT "StaffAttendanceScope_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffAttendanceScope"
  ADD CONSTRAINT "StaffAttendanceScope_staffMemberId_fkey"
  FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffAttendanceScope"
  ADD CONSTRAINT "StaffAttendanceScope_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffAttendanceScope"
  ADD CONSTRAINT "StaffAttendanceScope_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "Program"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Cross-tenant and Program -> Department validation is intentionally enforced
-- in the application service using tenant-scoped lookups. PostgreSQL foreign
-- keys alone cannot guarantee all four referenced rows share the same tenant.
