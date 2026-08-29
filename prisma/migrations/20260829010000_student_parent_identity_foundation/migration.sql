-- TASK-017: Student and parent portal identity foundation

CREATE TYPE "GuardianStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

ALTER TABLE "Student"
ADD COLUMN "membershipId" TEXT;

CREATE TABLE "Guardian" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "membershipId" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "alternatePhone" TEXT,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "country" TEXT,
  "status" "GuardianStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentGuardian" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "guardianId" TEXT NOT NULL,
  "relationship" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Student_membershipId_key" ON "Student"("membershipId");
CREATE INDEX "Guardian_tenantId_status_lastName_firstName_idx" ON "Guardian"("tenantId", "status", "lastName", "firstName");
CREATE INDEX "Guardian_tenantId_email_idx" ON "Guardian"("tenantId", "email");
CREATE INDEX "Guardian_tenantId_phone_idx" ON "Guardian"("tenantId", "phone");
CREATE UNIQUE INDEX "Guardian_membershipId_key" ON "Guardian"("membershipId");
CREATE UNIQUE INDEX "StudentGuardian_studentId_guardianId_key" ON "StudentGuardian"("studentId", "guardianId");
CREATE INDEX "StudentGuardian_tenantId_studentId_idx" ON "StudentGuardian"("tenantId", "studentId");
CREATE INDEX "StudentGuardian_tenantId_guardianId_idx" ON "StudentGuardian"("tenantId", "guardianId");

ALTER TABLE "Student"
ADD CONSTRAINT "Student_membershipId_fkey"
FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Guardian"
ADD CONSTRAINT "Guardian_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Guardian"
ADD CONSTRAINT "Guardian_membershipId_fkey"
FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StudentGuardian"
ADD CONSTRAINT "StudentGuardian_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentGuardian"
ADD CONSTRAINT "StudentGuardian_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentGuardian"
ADD CONSTRAINT "StudentGuardian_guardianId_fkey"
FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;
