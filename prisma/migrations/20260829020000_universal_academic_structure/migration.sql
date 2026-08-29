-- CreateEnum
CREATE TYPE "AcademicGroupType" AS ENUM ('CLASS', 'SECTION', 'COHORT', 'BATCH', 'SEMESTER', 'GROUP');

-- CreateEnum
CREATE TYPE "AcademicGroupStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StudentAcademicGroupMembershipStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'WITHDRAWN', 'ARCHIVED');

-- CreateTable
CREATE TABLE "AcademicGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "parentGroupId" TEXT,
    "type" "AcademicGroupType" NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "AcademicGroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAcademicGroupMembership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicGroupId" TEXT NOT NULL,
    "status" "StudentAcademicGroupMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAcademicGroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicGroup_tenantId_academicYearId_type_name_key" ON "AcademicGroup"("tenantId", "academicYearId", "type", "name");

-- CreateIndex
CREATE INDEX "AcademicGroup_tenantId_academicYearId_status_sortOrder_idx" ON "AcademicGroup"("tenantId", "academicYearId", "status", "sortOrder");

-- CreateIndex
CREATE INDEX "AcademicGroup_tenantId_parentGroupId_status_sortOrder_idx" ON "AcademicGroup"("tenantId", "parentGroupId", "status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAcademicGroupMembership_studentId_academicGroupId_key" ON "StudentAcademicGroupMembership"("studentId", "academicGroupId");

-- CreateIndex
CREATE INDEX "StudentAcademicGroupMembership_tenantId_studentId_status_idx" ON "StudentAcademicGroupMembership"("tenantId", "studentId", "status");

-- CreateIndex
CREATE INDEX "StudentAcademicGroupMembership_tenantId_academicGroupId_status_idx" ON "StudentAcademicGroupMembership"("tenantId", "academicGroupId", "status");

-- AddForeignKey
ALTER TABLE "AcademicGroup" ADD CONSTRAINT "AcademicGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicGroup" ADD CONSTRAINT "AcademicGroup_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicGroup" ADD CONSTRAINT "AcademicGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "AcademicGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcademicGroupMembership" ADD CONSTRAINT "StudentAcademicGroupMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcademicGroupMembership" ADD CONSTRAINT "StudentAcademicGroupMembership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcademicGroupMembership" ADD CONSTRAINT "StudentAcademicGroupMembership_academicGroupId_fkey" FOREIGN KEY ("academicGroupId") REFERENCES "AcademicGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
