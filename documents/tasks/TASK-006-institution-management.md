# TASK-006 — Institution Management

## Status

IN PROGRESS

## Objective

Introduce the first institution-management vertical slice on top of the existing multi-tenant identity, RBAC, session, and tenant-context foundations.

## Scope

- View the authenticated institution's profile.
- Edit institution name through a tenant-scoped server action/API boundary.
- Preserve the existing institution slug as the stable tenant identifier.
- Enforce authentication and active membership on every institution-management operation.
- Require an explicit tenant-management permission for mutation.
- Add validation and authorization tests.
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
3. Mutations require an explicit institution-management permission resolved through the authenticated membership's roles.
4. The tenant slug is not editable in this task because it is the stable routing/identity key.
5. Validation errors are explicit; authorization failures do not reveal data from another tenant.

## Planned API

- `GET /api/institution` — authenticated tenant profile.
- `PATCH /api/institution` — authenticated, permission-checked name update.

## Planned Permission

`institution:update`

## Definition of Done

- [ ] Tenant-scoped institution read endpoint
- [ ] Permission-checked institution update endpoint
- [ ] Institution management UI
- [ ] Input validation
- [ ] Authorization tests
- [ ] Cross-tenant isolation test
- [ ] Documentation updated
- [ ] CI: test, lint, typecheck, Next build, Cloudflare build green
- [ ] Code review completed
- [ ] PR merged to `master`
