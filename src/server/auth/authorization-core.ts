import { AuthorizationError } from "./errors";
import type { TenantContext } from "./types";

export function requirePermissionFromContext(
  context: TenantContext,
  permissionCode: string,
): TenantContext {
  if (!context.permissionCodes.includes(permissionCode)) {
    throw new AuthorizationError(`Missing permission: ${permissionCode}`);
  }

  return context;
}
