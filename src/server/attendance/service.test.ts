import { describe, expect, it } from "vitest";
import { markAttendance } from "./service";

function createDb(overrides: Record<string, unknown> = {}) {
  const records: unknown[] = [];
  const db = {
    attendanceSession: {
      findFirst: async () => ({ id: "session-1", tenantId: "tenant-1", academicGroupId: "group-1", attendanceDate: new Date("2026-08-29T00:00:00.000Z"), status: "OPEN" }),
    },
    studentAcademicGroupMembership: {
      findMany: async () => [{ status: "ACTIVE", startDate: new Date("2026-08-01"), endDate: null, student: { id: "student-1", tenantId: "tenant-1", status: "ACTIVE" } }],
    },
    attendanceRecord: {
      upsert: async (args: unknown) => { records.push(args); return args; },
    },
    ...overrides,
  };
  return { db, records };
}

describe("markAttendance", () => {
  it("marks attendance for an eligible student", async () => {
    const { db, records } = createDb();
    await markAttendance(db as never, { tenantId: "tenant-1", attendanceSessionId: "session-1", studentId: "student-1", status: "PRESENT" });
    expect(records).toHaveLength(1);
  });

  it("rejects a student who is not eligible for the group", async () => {
    const { db } = createDb({ studentAcademicGroupMembership: { findMany: async () => [] } });
    await expect(markAttendance(db as never, { tenantId: "tenant-1", attendanceSessionId: "session-1", studentId: "student-2", status: "PRESENT" })).rejects.toThrow("Student is not eligible");
  });

  it("rejects a non-open attendance session", async () => {
    const { db } = createDb({ attendanceSession: { findFirst: async () => ({ id: "session-1", tenantId: "tenant-1", academicGroupId: "group-1", attendanceDate: new Date("2026-08-29"), status: "FINALIZED" }) } });
    await expect(markAttendance(db as never, { tenantId: "tenant-1", attendanceSessionId: "session-1", studentId: "student-1", status: "PRESENT" })).rejects.toThrow("session is open");
  });

  it("rejects cross-tenant session access", async () => {
    const { db } = createDb({ attendanceSession: { findFirst: async () => null } });
    await expect(markAttendance(db as never, { tenantId: "tenant-2", attendanceSessionId: "session-1", studentId: "student-1", status: "PRESENT" })).rejects.toThrow("was not found for this institution");
  });
});
