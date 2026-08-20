# TASK-006 — Institution Management

## Status

IN PROGRESS

## Objective

Introduce the first institution-management vertical slice on top of the existing multi-tenant identity, RBAC, session, and tenant-context foundations.

## Scope

- View the authenticated institution's profile.
- Edit institution name through a tenant-scoped API boundary.
- Preserve the existing institution slug as the stable tenant identifier.
- Enforce authentication and active membership on every institution-management operation.
- Require an explicit `institution:update` permission for mutation.
- Add validation and security-focused tests.
- Add the management UI without changing the existing authentication flow.

## Non-goals

- Institution creation from the application UI
- Institution deletion
- Billing/subscriptions
- Institution branding/logo uploads
- User/member management
- Academic year management
- Student/faculty modules
- Cross-tenant administration UI

## Security Contract

1. The active tenant comes from `requireTenantContext()` and never from a client-supplied tenant ID.
2. Reads are limited to the tenant represented by the authenticated session.
3. Mutations require `institution:update` resolved through the authenticated membership's roles.
4. The tenant slug is not editable because it is the stable tenant identity key.
5. Validation errors are explicit; authorization failures do not reveal another tenant's data.

## API

- `GET /api/institution` — authenticated tenant profile.
- `PATCH /api/institution` — authenticated, permission-checked name update.

## Implementation

- [x] Tenant-scoped institution read endpoint
- [x] Permission-checked institution update endpoint
- [x] Institution management UI
- [x] Input validation
- [x] Development permission seed
- [x] Unit coverage for profile validation
- [ ] Integration/security tests against a real database
- [ ] CI: test, lint, typecheck, Next build, Cloudflare build green
- [ ] Code review completed
- [ ] PR merged to `master`

## Validation Note

The repository connector can inspect and publish GitHub changes, but local Node/npm execution is not available through the connector. Linux GitHub Actions is the authoritative validation gate for this task.
