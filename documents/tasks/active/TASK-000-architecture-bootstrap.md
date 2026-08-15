# TASK-000 — Architecture Bootstrap

## Status
IN PROGRESS

## Priority
CRITICAL

## Feature
Project Foundation

## Objective
Verify and establish the technical foundation for the new EduInstitution application before implementing business modules.

## Current Repository Reality

The repository is a clean Next.js starter using Next.js 16.3.1, React 19.2.8, TypeScript, Tailwind CSS 4, and ESLint. No database, authentication, authorization, R2 integration, or business modules are implemented.

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
