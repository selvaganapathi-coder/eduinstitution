# TASK-012 — Departments & Programs

## Status
Completed and merged.

## Source of record
- Pull request: #57
- Merge commit: `5d949ee8dc52f0b5db1d8841fc600aae061a8593`
- Title: `Task 012 departments and programs`

## Objective
Implement the reusable academic structure foundation for departments and programs across institution types.

## Completed scope
- Department and Program schema and migration.
- Tenant-scoped Department and Program APIs.
- Department and Program permissions.
- Development seed updates.
- Responsive Departments & Programs management UI.
- Production-safe API error handling.
- TASK-010 shared visual language applied to the module.
- Department and Program create/update flows.
- Department and Program archive flows.
- Active Program counting and display.
- Department archive safety requiring programs to be archived first.
- Academic navigation integration.
- User-facing success, error, and information feedback.

## User workflow
1. Create or select a Department.
2. Add Programs under the selected Department.
3. Edit Departments or Programs from their action menus.
4. Archive Programs when no longer offered.
5. Archive a Department only after its Programs are archived.

## Tenant and safety behavior
- Department and Program operations are tenant-scoped.
- Existing records are not deleted by archive actions.
- Department archive is protected when active programs remain.
- API failures return user-facing messages instead of raw technical errors.

## Verification
Before merge, the task required:
- Typecheck
- Lint
- Tests
- Build
- Local manual verification

## Outcome
TASK-012 delivered the Departments & Programs academic management foundation and established the relationship pattern used by later academic structure features.
