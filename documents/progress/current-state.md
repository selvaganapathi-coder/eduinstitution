# Current Project State

## Date
2026-08-21

## Project Status

TASK-006 — INSTITUTION MANAGEMENT IN PROGRESS

## Repository

`selvaganapathi-coder/eduinstitution`

## Current Branch

`task-006-institution-management`

## Verified Existing Stack

- Next.js 16.3.1
- React 19.2.8
- TypeScript
- Tailwind CSS 4
- Ant Design 5
- Prisma 7.9.1
- Neon PostgreSQL
- Cloudflare Workers / OpenNext
- Cloudflare R2 foundation
- Vitest
- ESLint

## Completed Tasks

- TASK-000 — Architecture Bootstrap
- TASK-001 — Application Foundation & Design System
- TASK-002 — Multi-Tenant Authentication/Authorization Foundation
- TASK-003 — Authentication Session Lifecycle
- TASK-004 — Authentication Flow
- TASK-005 — Authentication Completion & Tenant Selection

## Active Task

TASK-006 — Institution Management

## TASK-006 Implementation

- Added authenticated tenant-scoped institution profile read API.
- Added permission-checked institution name update API.
- Added `institution:update` permission guard.
- Added institution profile management UI.
- Kept institution slug immutable in the management UI.
- Added shared institution-name validation and unit coverage.
- Updated development seed so the development Administrator receives `institution:update`.
- Existing tenant context remains the source of tenant identity; no client tenant ID is accepted by institution management endpoints.

## Security Notes

- Institution reads resolve the tenant exclusively from the authenticated session's tenant context.
- Institution updates require an active membership plus `institution:update`.
- Cross-tenant access cannot be selected through request parameters.
- Invalid profile names are rejected before persistence.

## Validation

Pending CI validation for the TASK-006 branch:

- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run build:cloudflare`

The existing repository uses Linux GitHub Actions as the authoritative Cloudflare runtime validation gate.

## Next Action

Open the TASK-006 pull request, inspect CI, address failures, complete review, then merge only after all gates are green.
