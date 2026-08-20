import { TenantAccessError } from "./errors";

export type ActiveMembership = {
  tenantId: string;
};

export function selectTenantId(
  memberships: ActiveMembership[],
  requestedTenantId?: string,
): string {
  if (memberships.length === 0) {
    throw new TenantAccessError("Your account does not have an active institution membership");
  }

  if (!requestedTenantId) {
    if (memberships.length !== 1) {
      throw new TenantAccessError("Select an institution before signing in");
    }

    return memberships[0].tenantId;
  }

  if (!memberships.some((membership) => membership.tenantId === requestedTenantId)) {
    throw new TenantAccessError("You do not have access to this institution");
  }

  return requestedTenantId;
}
