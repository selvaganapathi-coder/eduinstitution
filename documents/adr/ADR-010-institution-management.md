# ADR-010 — Institution Management Boundary

## Status

Accepted

## Context

The application now has tenant-bound sessions and tenant context. Institution management must not introduce a second source of tenant identity or allow client-selected tenant IDs to cross the authorization boundary.

## Decision

Institution management uses the authenticated `TenantContext` as the only tenant identity source. The profile API reads and writes the tenant represented by the current session. Mutations additionally require the `institution:update` permission resolved from the current membership's roles.

The institution `slug` remains immutable through this profile UI because it is the stable tenant identifier. The first management slice only changes the institution display name.

## Consequences

- Client requests cannot select another tenant for institution management.
- Permission checks remain centralized in the existing authorization context.
- Institution creation/deletion and member administration remain separate future tasks.
- Database-backed integration tests remain a required CI follow-up before the task is considered complete.
