export type TenantContext = {
  userId: string;
  tenantId: string;
  sessionId: string;
  membershipId: string;
  roleIds: string[];
  permissionCodes: string[];
};
