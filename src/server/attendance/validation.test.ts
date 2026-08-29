import { describe, expect, it } from "vitest";
import { isMembershipActiveOnDate, validateAttendanceDate, validateAttendanceRecordInput } from "./validation";

describe("attendance validation", () => {
  it("accepts a valid attendance date", () => {
    expect(validateAttendanceDate("2026-08-29").value).toBeInstanceOf(Date);
  });

  it("rejects an invalid attendance date", () => {
    expect(validateAttendanceDate("not-a-date")).toEqual({ error: "Enter a valid attendance date." });
  });

  it("validates attendance records", () => {
    expect(validateAttendanceRecordInput({ studentId: "student-1", status: "PRESENT" }).value).toEqual({
      studentId: "student-1",
      status: "PRESENT",
      remarks: null,
    });
  });

  it("rejects unsupported attendance status", () => {
    expect(validateAttendanceRecordInput({ studentId: "student-1", status: "UNKNOWN" })).toEqual({ error: "Enter a valid attendance status." });
  });

  it("resolves active membership eligibility by date", () => {
    const membership = { status: "ACTIVE", startDate: new Date("2026-08-01"), endDate: null };
    expect(isMembershipActiveOnDate(membership, new Date("2026-08-29"))).toBe(true);
    expect(isMembershipActiveOnDate(membership, new Date("2026-07-31"))).toBe(false);
    expect(isMembershipActiveOnDate({ ...membership, status: "COMPLETED" }, new Date("2026-08-29"))).toBe(false);
  });
});
