# Database Architecture

## Database

PostgreSQL is the selected relational database.

## Provider

Neon PostgreSQL is the selected managed PostgreSQL provider.

## ORM

Prisma is the selected ORM.

## Cloudflare Runtime

The application is intended to run on Cloudflare Workers/OpenNext. Database connectivity must use a Cloudflare-compatible Neon approach, with `@prisma/adapter-neon` to be evaluated and verified during TASK-000 implementation.

## Rules

- Preserve referential integrity.
- Use explicit relations and constraints.
- Add indexes for real query patterns.
- Use migrations for schema changes.
- Do not create future business tables speculatively.
- Do not store large binary documents in PostgreSQL.
- Tenant-owned data must be isolated by trusted institution context.

## Initial Schema Rule

Only foundation entities required by authentication, authorization, and tenant context should be introduced before the first business vertical slice. Student, attendance, fees, examination, and other business tables are deferred until their respective features.
