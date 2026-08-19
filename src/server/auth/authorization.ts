import { requireTenantContext } from "./tenant-context";
import { requirePermissionFromContext } from "./authorization-core";

export { requirePermissionFromContext } from "./authorization-core";

export async function requirePermission(permissionCode: string) {
  const context = await requireTenantContext();
  return requirePermissionFromContext(context, permissionCode);
}
