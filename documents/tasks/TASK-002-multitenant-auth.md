# TASK-002 — Multi-Tenant + Authentication + Authorization Foundation

## Status

IN PROGRESS

## Objective

Establish the security and tenancy foundation before introducing Student, Faculty, Attendance, Fees, Examination, or other business modules.

## Current vertical slice

### Schema foundation

- Tenant
- User
- Membership
- Role
- Permission
- RolePermission
- Session

### Security boundary

`authenticated user → active membership → tenant → role → permission → resource`

All tenant-owned business operations must enforce the tenant boundary server-side.

## Explicit non-goals

- Student management
- Faculty management
- Attendance
- Fees
- Examinations
- Business dashboards
- Production authentication UI
- OAuth/social login decisions

Those belong to later vertical slices.

## Definition of Done

- [x] Multi-tenant schema defined
- [x] User/membership separation defined
- [x] Runtime-configurable tenant roles represented
- [x] Permission catalog represented
- [x] Session model represented
- [x] ADR accepted
- [ ] Prisma client generation passes
- [ ] Neon migration validation passes
- [ ] Tenant-context service implemented
- [ ] Authorization service implemented
- [ ] Authentication/session implementation completed
- [ ] Seed data implemented
- [ ] Tests pass
- [ ] Linux CI passes

## Next implementation order

1. Validate Prisma schema and generate client.
2. Create the initial Neon migration only after schema validation.
3. Implement tenant context resolution.
4. Implement centralized permission checks.
5. Implement authentication/session lifecycle.
6. Add deterministic development seed data.
7. Add unit/integration tests.
8. Run full local and Linux CI validation.
