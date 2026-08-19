import { describe, expect, it } from "vitest";

import { AuthorizationError } from "./errors";
import { requirePermissionFromContext } from "./authorization";
import type { TenantContext } from "./tenant-context";

const baseContext: TenantContext = {
  userId: "user-1",
  tenantId: "tenant-1",
  sessionId: "session-1",
  membershipId: "membership-1",
  roleIds: ["role-admin"],
  permissionCodes: ["students.read", "students.write"],
};

describe("requirePermissionFromContext", () => {
  it("returns the validated tenant context when permission is granted", () => {
    expect(requirePermissionFromContext(baseContext, "students.read")).toBe(
      baseContext,
    );
  });

  it("rejects a permission that is not assigned", () => {
    expect(() =>
      requirePermissionFromContext(baseContext, "fees.read"),
    ).toThrow(AuthorizationError);
  });

  it("rejects an empty permission code", () => {
    expect(() => requirePermissionFromContext(baseContext, "")).toThrow(
      AuthorizationError,
    );
  });

  it("does not grant permissions based on the tenant id alone", () => {
    const contextWithoutPermissions: TenantContext = {
      ...baseContext,
      tenantId: "tenant-2",
      permissionCodes: [],
    };

    expect(() =>
      requirePermissionFromContext(
        contextWithoutPermissions,
        "students.read",
      ),
    ).toThrow(AuthorizationError);
  });
});
