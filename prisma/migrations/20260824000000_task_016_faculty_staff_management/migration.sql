-- TASK-016: Faculty / Staff Management

CREATE TYPE "StaffType" AS ENUM ('TEACHING', 'NON_TEACHING');
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'ARCHIVED');

CREATE TABLE "StaffMember" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeNumber" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "photoUrl" TEXT,
  "dateOfBirth" TIMESTAMP(3),
  "gender" TEXT,
  "address" TEXT,
  "staffType" "StaffType" NOT NULL,
  "designation" TEXT NOT NULL,
  "departmentId" TEXT,
  "employmentType" TEXT NOT NULL,
  "joiningDate" TIMESTAMP(3) NOT NULL,
  "roleName" TEXT,
  "accessLevel" TEXT,
  "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffMember_tenantId_employeeNumber_key" ON "StaffMember"("tenantId", "employeeNumber");
CREATE INDEX "StaffMember_tenantId_status_lastName_firstName_idx" ON "StaffMember"("tenantId", "status", "lastName", "firstName");
CREATE INDEX "StaffMember_tenantId_staffType_status_idx" ON "StaffMember"("tenantId", "staffType", "status");
CREATE INDEX "StaffMember_tenantId_departmentId_status_idx" ON "StaffMember"("tenantId", "departmentId", "status");
CREATE INDEX "StaffMember_tenantId_email_idx" ON "StaffMember"("tenantId", "email");

ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
