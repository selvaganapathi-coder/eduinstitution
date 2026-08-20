import { describe, expect, it } from "vitest";

import { TenantAccessError } from "./errors";
import { selectTenantId } from "./tenant-selection";

const memberships = [{ tenantId: "tenant-a" }, { tenantId: "tenant-b" }];

describe("tenant selection", () => {
  it("selects the only membership when no tenant is requested", () => {
    expect(selectTenantId([{ tenantId: "tenant-a" }])).toBe("tenant-a");
  });

  it("requires an explicit selection for multiple memberships", () => {
    expect(() => selectTenantId(memberships)).toThrow(TenantAccessError);
  });

  it("accepts a requested tenant only when it is an active membership", () => {
    expect(selectTenantId(memberships, "tenant-b")).toBe("tenant-b");
  });

  it("rejects a tenant outside the active memberships", () => {
    expect(() => selectTenantId(memberships, "tenant-c")).toThrow(TenantAccessError);
  });

  it("rejects users without an active membership", () => {
    expect(() => selectTenantId([])).toThrow(TenantAccessError);
  });
});
