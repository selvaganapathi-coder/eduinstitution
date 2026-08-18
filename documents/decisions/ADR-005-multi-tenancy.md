# ADR-005 — Multi-Tenant Isolation

## Status
Accepted

## Context

The product is intended to evolve into a multi-institution education SaaS platform. Institution data must never cross tenant boundaries.

## Decision

Use institution membership as the trusted tenant context. Tenant-owned records should carry an `institutionId` relation where appropriate. Server-side operations must resolve the institution from authenticated membership rather than trusting a client-supplied tenant identifier.

The same isolation principle applies to database queries, APIs, exports, reports, notifications, and R2 objects.

## Consequences

- Tenant context is a security boundary.
- Database access patterns must make institution filtering explicit.
- R2 object keys must include trusted institution context.
- Cross-tenant access must be included in security tests.
