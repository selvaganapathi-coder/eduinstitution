-- TASK-009: Academic year and term management

CREATE TYPE "AcademicYearStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "AcademicTermStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

CREATE TABLE "AcademicYear" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  "status" "AcademicYearStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AcademicYear_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AcademicTerm" (
  "id" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "status" "AcademicTermStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicTerm_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AcademicTerm_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AcademicYear_tenantId_name_key" ON "AcademicYear"("tenantId", "name");
CREATE INDEX "AcademicYear_tenantId_status_idx" ON "AcademicYear"("tenantId", "status");
CREATE INDEX "AcademicYear_tenantId_isCurrent_idx" ON "AcademicYear"("tenantId", "isCurrent");
CREATE UNIQUE INDEX "AcademicTerm_academicYearId_name_key" ON "AcademicTerm"("academicYearId", "name");
CREATE INDEX "AcademicTerm_academicYearId_status_sortOrder_idx" ON "AcademicTerm"("academicYearId", "status", "sortOrder");

-- Enforce the one-current-year business rule at the database level.
CREATE UNIQUE INDEX "AcademicYear_one_current_per_tenant_idx"
  ON "AcademicYear"("tenantId")
  WHERE "isCurrent" = true AND "status" <> 'ARCHIVED';
