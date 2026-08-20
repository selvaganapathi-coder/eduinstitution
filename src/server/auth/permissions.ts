import { requireTenantContext } from "./tenant-context";

export async function requirePermission(permissionCode: string) {
  const context = await requireTenantContext();

  if (!context.permissionCodes.includes(permissionCode)) {
    throw new Error("FORBIDDEN");
  }

  return context;
}
