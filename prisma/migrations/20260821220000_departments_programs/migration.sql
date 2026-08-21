-- TASK-012: Reusable department and program structure

CREATE TYPE "DepartmentStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "ProgramStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "ProgramType" AS ENUM ('DEGREE', 'DIPLOMA', 'CERTIFICATE', 'OTHER');

CREATE TABLE "Department" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "DepartmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Department_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Program" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "type" "ProgramType" NOT NULL DEFAULT 'DEGREE',
  "durationMonths" INTEGER,
  "description" TEXT,
  "status" "ProgramStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Program_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Program_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Department_tenantId_code_key" ON "Department"("tenantId", "code");
CREATE INDEX "Department_tenantId_status_displayOrder_idx" ON "Department"("tenantId", "status", "displayOrder");
CREATE UNIQUE INDEX "Program_tenantId_code_key" ON "Program"("tenantId", "code");
CREATE INDEX "Program_tenantId_status_idx" ON "Program"("tenantId", "status");
CREATE INDEX "Program_departmentId_status_idx" ON "Program"("departmentId", "status");
