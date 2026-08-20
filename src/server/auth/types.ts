export type TenantContext = {
  userId: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  sessionId: string;
  membershipId: string;
  roleIds: string[];
  permissionCodes: string[];
};
