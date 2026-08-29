export type AttendanceStatusInput = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

const ATTENDANCE_STATUSES: AttendanceStatusInput[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

function parseDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function validateAttendanceDate(value: unknown) {
  const date = parseDate(value);
  if (!date) return { error: "Enter a valid attendance date." as const };
  return { value: date } as const;
}

export function validateAttendanceRecordInput(input: { studentId?: unknown; status?: unknown; remarks?: unknown }) {
  const studentId = typeof input.studentId === "string" ? input.studentId.trim() : "";
  const status = typeof input.status === "string" ? input.status : "";
  const remarks = typeof input.remarks === "string" ? input.remarks.trim() : undefined;

  if (!studentId) return { error: "Student is required." as const };
  if (!ATTENDANCE_STATUSES.includes(status as AttendanceStatusInput)) return { error: "Enter a valid attendance status." as const };
  if (remarks && remarks.length > 500) return { error: "Remarks cannot exceed 500 characters." as const };

  return { value: { studentId, status: status as AttendanceStatusInput, remarks: remarks || null } } as const;
}

export function isMembershipActiveOnDate(membership: { status: string; startDate: Date; endDate: Date | null }, attendanceDate: Date) {
  if (membership.status !== "ACTIVE") return false;
  if (membership.startDate > attendanceDate) return false;
  if (membership.endDate && membership.endDate < attendanceDate) return false;
  return true;
}
