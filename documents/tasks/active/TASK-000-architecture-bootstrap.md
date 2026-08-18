# TASK-000 — Architecture Bootstrap

## Status
IN PROGRESS — LINUX CI VALIDATION

## Priority
CRITICAL

## Feature
Project Foundation

## Objective
Verify and establish the technical foundation for the new EduInstitution application before implementing business modules.

## Current Repository Reality

The repository started as a clean Next.js 16.3.1 starter using React 19.2.8, TypeScript, Tailwind CSS 4, and ESLint. The foundation branch now contains the initial Ant Design, Prisma/Neon, OpenNext/Cloudflare, R2 configuration, documentation, and validation infrastructure.

## In Scope

- Verify Next.js 16 runtime and Cloudflare deployment compatibility.
- Add Ant Design and App Router integration.
- Establish the centralized application theme.
- Add Prisma and Neon architecture.
- Verify Cloudflare-compatible Prisma/Neon database access.
- Establish R2 configuration strategy.
- Establish environment variable conventions.
- Create project documentation and ADR foundation.
- Establish testing/lint/build validation.

## Out of Scope

- Student Management
- Faculty Management
- Attendance
- Timetable
- Examinations
- Results
- Fees
- Library
- Reports
- Notifications
- Student Portal

## Dependencies

- Next.js 16 repository baseline.
- Cloudflare Workers/OpenNext compatibility verification.
- Neon database availability for runtime verification.
- Cloudflare R2 credentials only when storage integration is exercised.

## Security

- No secrets committed.
- Server/client boundaries must remain explicit.
- Tenant isolation architecture must be documented before tenant-owned business data exists.

## Performance

- Avoid making the whole application a Client Component.
- Avoid unnecessary dependencies.
- Verify database connection behavior in the actual target runtime.

## Validation Results

Local developer validation passed on 2026-08-18:

- `npm run lint` — PASS after excluding generated `.open-next` output from ESLint.
- `npm run typecheck` — PASS.
- `npm run build` — PASS.
- `npm run build:cloudflare` — PASS.

Windows local Workers runtime validation remains blocked by `workerd` access violation `0xc0000005` during `wrangler types` / `wrangler dev`. Linux GitHub Actions is therefore the authoritative Cloudflare runtime/build validation environment.

## Acceptance Criteria

- Repository foundation is documented.
- Major architecture decisions are recorded as ADRs.
- Ant Design integration is verified.
- Prisma + Neon integration is verified against the target runtime.
- R2 architecture is documented and configuration is safe.
- Environment conventions are documented.
- Build, lint, and relevant tests pass after implementation.
- No business module is implemented as part of TASK-000.
- Current state and changelog are updated.
- Linux CI foundation validation passes.
