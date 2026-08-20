import { describe, expect, it } from "vitest";

import { validateInstitutionName } from "./validation";

describe("institution profile validation", () => {
  it("trims and accepts a valid name", () => {
    expect(validateInstitutionName("  Demo College  ")).toBe("Demo College");
  });

  it("rejects missing and non-string names", () => {
    expect(validateInstitutionName(undefined)).toBeNull();
    expect(validateInstitutionName(42)).toBeNull();
  });

  it("rejects names shorter than two characters", () => {
    expect(validateInstitutionName("A")).toBeNull();
    expect(validateInstitutionName("  ")).toBeNull();
  });

  it("rejects names longer than 120 characters", () => {
    expect(validateInstitutionName("x".repeat(121))).toBeNull();
  });
});
