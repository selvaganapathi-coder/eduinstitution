import { isMembershipActiveOnDate } from "./validation";

export type AttendanceMode = "DAILY" | "SESSION";
export type AttendanceSessionStatus = "OPEN" | "FINALIZED" | "CANCELLED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendancePrismaClient {
  academicGroup: { findFirst: (args: unknown) => Promise<unknown> };
  attendanceSession: {
    upsert: (args: unknown) => Promise<unknown>;
    findFirst: (args: unknown) => Promise<{
      id: string;
      tenantId: string;
      academicGroupId: string;
      attendanceDate: Date;
      status: AttendanceSessionStatus;
    } | null>;
  };
  studentAcademicGroupMembership: {
    findMany: (args: unknown) => Promise<Array<{
      status: string;
      startDate: Date;
      endDate: Date | null;
      student: { id: string; tenantId: string; status: string };
    }>>;
  };
  attendanceRecord: { upsert: (args: unknown) => Promise<unknown> };
}

function dayBounds(date: Date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function createOrGetAttendanceSession(
  db: AttendancePrismaClient,
  input: { tenantId: string; academicGroupId: string; attendanceDate: Date; mode?: AttendanceMode },
) {
  const mode = input.mode ?? "DAILY";
  const group = await db.academicGroup.findFirst({ where: { id: input.academicGroupId, tenantId: input.tenantId } });
  if (!group) throw new Error("Academic group was not found for this institution.");

  return db.attendanceSession.upsert({
    where: {
      academicGroupId_attendanceDate_mode: {
        academicGroupId: input.academicGroupId,
        attendanceDate: input.attendanceDate,
        mode,
      },
    },
    create: {
      tenantId: input.tenantId,
      academicGroupId: input.academicGroupId,
      attendanceDate: input.attendanceDate,
      mode,
      status: "OPEN",
    },
    update: {},
  });
}

export async function getEligibleStudents(
  db: AttendancePrismaClient,
  input: { tenantId: string; academicGroupId: string; attendanceDate: Date },
) {
  const { start, end } = dayBounds(input.attendanceDate);
  const memberships = await db.studentAcademicGroupMembership.findMany({
    where: {
      tenantId: input.tenantId,
      academicGroupId: input.academicGroupId,
      student: { tenantId: input.tenantId, status: "ACTIVE" },
      startDate: { lt: end },
      OR: [{ endDate: null }, { endDate: { gte: start } }],
    },
    include: { student: true },
  });

  return memberships
    .filter((membership) => isMembershipActiveOnDate(membership, start))
    .map((membership) => membership.student);
}

export async function markAttendance(
  db: AttendancePrismaClient,
  input: {
    tenantId: string;
    attendanceSessionId: string;
    studentId: string;
    status: AttendanceStatus;
    remarks?: string | null;
  },
) {
  const session = await db.attendanceSession.findFirst({
    where: { id: input.attendanceSessionId, tenantId: input.tenantId },
  });
  if (!session) throw new Error("Attendance session was not found for this institution.");
  if (session.status !== "OPEN") throw new Error("Attendance can only be marked while the session is open.");

  const eligibleStudents = await getEligibleStudents(db, {
    tenantId: input.tenantId,
    academicGroupId: session.academicGroupId,
    attendanceDate: session.attendanceDate,
  });
  if (!eligibleStudents.some((student) => student.id === input.studentId)) {
    throw new Error("Student is not eligible for attendance in this academic group on this date.");
  }

  return db.attendanceRecord.upsert({
    where: {
      attendanceSessionId_studentId: {
        attendanceSessionId: input.attendanceSessionId,
        studentId: input.studentId,
      },
    },
    create: {
      tenantId: input.tenantId,
      attendanceSessionId: input.attendanceSessionId,
      studentId: input.studentId,
      status: input.status,
      remarks: input.remarks ?? null,
    },
    update: {
      status: input.status,
      remarks: input.remarks ?? null,
      markedAt: new Date(),
    },
  });
}
