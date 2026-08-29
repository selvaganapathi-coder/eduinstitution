-- CreateEnum
CREATE TYPE "AttendanceMode" AS ENUM ('DAILY', 'SESSION');

-- CreateEnum
CREATE TYPE "AttendanceSessionStatus" AS ENUM ('OPEN', 'FINALIZED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "academicGroupId" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "mode" "AttendanceMode" NOT NULL DEFAULT 'DAILY',
    "status" "AttendanceSessionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "attendanceSessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSession_academicGroupId_attendanceDate_mode_key" ON "AttendanceSession"("academicGroupId", "attendanceDate", "mode");

-- CreateIndex
CREATE INDEX "AttendanceSession_tenantId_attendanceDate_status_idx" ON "AttendanceSession"("tenantId", "attendanceDate", "status");

-- CreateIndex
CREATE INDEX "AttendanceSession_tenantId_academicGroupId_attendanceDate_idx" ON "AttendanceSession"("tenantId", "academicGroupId", "attendanceDate");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_attendanceSessionId_studentId_key" ON "AttendanceRecord"("attendanceSessionId", "studentId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_tenantId_studentId_markedAt_idx" ON "AttendanceRecord"("tenantId", "studentId", "markedAt");

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_academicGroupId_fkey" FOREIGN KEY ("academicGroupId") REFERENCES "AcademicGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_attendanceSessionId_fkey" FOREIGN KEY ("attendanceSessionId") REFERENCES "AttendanceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
