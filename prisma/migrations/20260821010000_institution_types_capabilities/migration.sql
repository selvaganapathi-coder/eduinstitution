-- CreateEnum
CREATE TYPE "InstitutionTypeStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "InstitutionType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "InstitutionTypeStatus" NOT NULL DEFAULT 'ACTIVE',
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionCapability" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionTypeCapability" (
    "institutionTypeId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionTypeCapability_pkey" PRIMARY KEY ("institutionTypeId", "capabilityId")
);

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "institutionTypeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionType_code_key" ON "InstitutionType"("code");
CREATE INDEX "InstitutionType_status_name_idx" ON "InstitutionType"("status", "name");
CREATE UNIQUE INDEX "InstitutionCapability_code_key" ON "InstitutionCapability"("code");
CREATE INDEX "InstitutionCapability_name_idx" ON "InstitutionCapability"("name");
CREATE INDEX "InstitutionTypeCapability_capabilityId_idx" ON "InstitutionTypeCapability"("capabilityId");
CREATE INDEX "Tenant_institutionTypeId_idx" ON "Tenant"("institutionTypeId");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_institutionTypeId_fkey" FOREIGN KEY ("institutionTypeId") REFERENCES "InstitutionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InstitutionTypeCapability" ADD CONSTRAINT "InstitutionTypeCapability_institutionTypeId_fkey" FOREIGN KEY ("institutionTypeId") REFERENCES "InstitutionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstitutionTypeCapability" ADD CONSTRAINT "InstitutionTypeCapability_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "InstitutionCapability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
