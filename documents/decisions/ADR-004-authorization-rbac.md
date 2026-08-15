# ADR-004 — Authorization and RBAC

## Status
Accepted

## Context

The system will serve multiple user categories with different operational responsibilities. Security cannot depend on frontend visibility.

## Decision

Use centralized server-side role and permission checks. Model authorization conceptually as:

```text
User → Institution Membership → Role → Permissions
```

Permissions should describe capabilities rather than requiring role checks throughout presentation components.

## Consequences

- API/server operations must authorize before sensitive work.
- UI visibility is not a security boundary.
- Roles can evolve without rewriting every feature.
- Permission tests become part of every protected vertical slice.
