# TASK-002 — Multi-Tenant + Authentication + Authorization Foundation

## Status

COMPLETED — MERGED

## Objective

Establish the security and tenancy foundation before introducing Student, Faculty, Attendance, Fees, Examination, or other business modules.

## Completed vertical slice

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

All tenant-owned business operations must enforce the tenant boundary server-side. Client-supplied tenant identifiers are not sufficient authorization evidence.

### Implemented services

- Tenant context resolver
- Centralized authorization guard
- Pure permission-checking core for deterministic unit tests
- Authentication/authorization error types

### Validation

- Prisma client generation — passed
- Prisma schema validation — passed
- Neon migration — passed
- Migration status — passed
- Security unit tests — passed
- ESLint — passed
- TypeScript — passed
- Next.js production build — passed
- OpenNext Cloudflare build — passed
- `npm ci` / CI dependency installation — passed
- GitHub Actions — passed

## Explicit non-goals

The following remain future work:

- Student management
- Faculty management
- Attendance
- Fees
- Examinations
- Business dashboards
- Production authentication UI
- OAuth/social login
- Password reset

## Architectural decisions

- User identity is global and is separate from tenant membership.
- A user may belong to multiple institutions through `Membership` records.
- Sessions carry the active tenant context.
- Tenant-owned resources must have an explicit tenant boundary.
- Authorization is enforced server-side.
- Roles are runtime-configurable through tenant membership and permission mappings.
- Permissions are stable capability definitions identified by codes.
- Authentication/session token lifecycle is intentionally not part of this completed slice; it is the next implementation boundary.

## Definition of Done

- [x] Multi-tenant schema defined
- [x] User/membership separation defined
- [x] Runtime-configurable tenant roles represented
- [x] Permission catalog represented
- [x] Session model represented
- [x] ADR accepted
- [x] Prisma client generation passes
- [x] Neon migration validation passes
- [x] Tenant-context service implemented
- [x] Authorization service implemented
- [x] Security tests pass
- [x] Local validation passes
- [x] Linux/GitHub Actions validation passes
- [x] TASK-002 merged to `master`

## Next task

`TASK-003 — Authentication Session Lifecycle`

The next slice will implement secure session token generation, hashing, creation, lookup, expiry, revocation, secure HTTP-only cookies, and logout. Authentication UI and business modules remain out of scope until the session lifecycle is stable and tested.
