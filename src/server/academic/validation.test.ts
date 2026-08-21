import { describe, expect, it } from "vitest";

import { datesOverlap, validateAcademicTermInput, validateAcademicYearInput } from "./validation";

const year = {
  startDate: new Date("2026-06-01T00:00:00.000Z"),
  endDate: new Date("2027-05-31T00:00:00.000Z"),
};

describe("academic validation", () => {
  it("accepts a valid academic year", () => {
    const result = validateAcademicYearInput({ name: "2026–2027", startDate: "2026-06-01", endDate: "2027-05-31" });
    expect(result.value?.name).toBe("2026–2027");
  });

  it("rejects an academic year with an invalid date range", () => {
    expect(validateAcademicYearInput({ name: "2026–2027", startDate: "2027-05-31", endDate: "2026-06-01" }).error).toContain("End date");
  });

  it("accepts a term inside the academic year", () => {
    const result = validateAcademicTermInput({ name: "Semester 1", startDate: "2026-06-01", endDate: "2026-10-31", sortOrder: "1" }, year);
    expect(result.value?.sortOrder).toBe(1);
  });

  it("rejects a term outside the academic year", () => {
    expect(validateAcademicTermInput({ name: "Semester 1", startDate: "2026-05-01", endDate: "2026-10-31", sortOrder: 1 }, year).error).toContain("within the academic year");
  });

  it("rejects an invalid term order", () => {
    expect(validateAcademicTermInput({ name: "Semester 1", startDate: "2026-06-01", endDate: "2026-10-31", sortOrder: 0 }, year).error).toContain("positive");
  });

  it("detects overlapping terms", () => {
    expect(datesOverlap(new Date("2026-06-01"), new Date("2026-10-31"), new Date("2026-10-01"), new Date("2027-01-31"))).toBe(true);
    expect(datesOverlap(new Date("2026-06-01"), new Date("2026-09-30"), new Date("2026-10-01"), new Date("2027-01-31"))).toBe(false);
  });
});
