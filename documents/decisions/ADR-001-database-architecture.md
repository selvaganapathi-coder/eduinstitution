# ADR-001 — Database Architecture

## Status
Accepted

## Context

EduInstitution requires strongly relational data, transactional integrity, reporting, and future multi-institution isolation. The application is intended to run on Next.js with Cloudflare Workers and therefore needs a database access approach compatible with the deployment runtime.

## Decision

Use PostgreSQL as the primary database, Neon as the managed PostgreSQL provider, and Prisma as the ORM.

For Cloudflare Workers, verify and use Prisma's Neon-compatible adapter approach (`@prisma/adapter-neon`) where required by the runtime.

## Options Considered

- PostgreSQL + Prisma + Neon — selected.
- PostgreSQL with a different ORM — not selected.
- A second database technology — rejected as unnecessary.
- Firebase/MongoDB as the primary database — rejected because the product is strongly relational and PostgreSQL is already selected.

## Consequences

Positive:
- Strong relational modeling.
- Type-safe Prisma client.
- Managed PostgreSQL through Neon.
- Clear migration history.
- Suitable foundation for multi-tenant relational data.

Trade-off:
- Cloudflare runtime compatibility must be verified during bootstrap.
- Prisma client generation and deployment behavior must be handled correctly for the chosen runtime.
