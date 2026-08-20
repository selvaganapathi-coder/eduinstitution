# ADR-009 — Multi-Tenancy, Identity, Membership, and RBAC

## Status

Accepted

## Context

EduInstitution is a multi-tenant education management SaaS. A single human identity may belong to multiple institutions and may have different responsibilities in each institution. Tenant isolation must therefore be represented independently from user identity.

Business modules must not be introduced with ad-hoc authorization rules. The foundation needs a stable boundary for tenant membership, roles, permissions, and sessions.

## Decision

Use the following foundation models:

- `Tenant` — institution boundary and tenant-owned root.
- `User` — global human identity, independent of tenant membership.
- `Membership` — relationship between a user and a tenant, including membership status.
- `Role` — permission bundle. Tenant roles belong to a tenant; system roles may be global.
- `Permission` — globally defined capability identified by a stable `code`.
- `RolePermission` — many-to-many role/capability mapping.
- `Session` — authenticated session bound to both a user and an active tenant.

A user may have multiple memberships. Tenant authorization is resolved from the authenticated user, active membership, tenant, assigned roles, and requested permission/resource.

## Tenant isolation rules

1. Every tenant-owned business model introduced later must carry an explicit `tenantId` boundary unless it is intentionally global.
2. Tenant access must be checked on the server.
3. The UI must never be treated as the security boundary.
4. A user must have an active membership for the requested tenant.
5. A session carries the active tenant context so tenant switching is explicit.
6. Database queries for tenant-owned resources must include the resolved tenant boundary.

## Role rules

- `SYSTEM` roles are global definitions and have no tenant owner.
- `TENANT` roles belong to one tenant.
- Tenant roles may be customized without changing application code.
- Permissions are global capability definitions; assignments are tenant-aware through roles.

## Session rules

Session tokens are stored as hashes, not plaintext bearer tokens. Sessions have an explicit expiry and active tenant context. Session creation, rotation, revocation, and lookup will be implemented in the authentication vertical slice.

## Consequences

### Positive

- Identity is reusable across institutions.
- Tenant boundaries are explicit in the data model.
- Runtime-configurable tenant roles are possible.
- Permission checks can be centralized.
- Future modules inherit one authorization model.

### Trade-offs

- Queries and services must carry tenant context deliberately.
- Membership and role joins add complexity compared with a single-tenant user table.
- Authorization requires centralized server-side infrastructure before business modules can safely ship.

## Rejected alternatives

### User-owned single `tenantId`

Rejected because one user can legitimately belong to multiple institutions.

### Frontend-only authorization

Rejected because client-side navigation is not a security boundary.

### Hard-coded roles only

Rejected because the product requires tenant administrators to manage roles and permissions without code changes.
