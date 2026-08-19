import { AuthorizationError } from "./errors";
import { requireTenantContext, type TenantContext } from "./tenant-context";

export function requirePermissionFromContext(
  context: TenantContext,
  permissionCode: string,
): TenantContext {
  if (!context.permissionCodes.includes(permissionCode)) {
    throw new AuthorizationError(`Missing permission: ${permissionCode}`);
  }

  return context;
}

export async function requirePermission(permissionCode: string) {
  const context = await requireTenantContext();
  return requirePermissionFromContext(context, permissionCode);
}
