# Changelog

## 2026-08-24

### TASK-016 — Faculty / Staff Management

- Added the first production-oriented Faculty / Staff Management vertical slice.
- Added tenant-scoped Faculty / Staff list, server-side search, filtering, pagination, summary metrics, and archive workflow.
- Added dedicated `/staff/new` and `/staff/[id]/edit` workflows instead of a side drawer.
- Added Teaching and Non-Teaching staff support with department and employment information.
- Added staff statuses for Active, Inactive, On Leave, and Archived records.
- Added staff photo upload and update workflow.
- Added tenant-isolated server-side CRUD behavior and RBAC enforcement.
- Added redirect-safe bottom-right notifications for create and update workflows.
- Aligned the Faculty / Staff list and form UI with the approved EduInstitution reference design, including responsive behavior.
- Merged through pull request #61.
- User-reported final lint, typecheck, build, UI, and functionality checks were green before merge.

### Documentation Recovery — TASK-016

- Updated project state, roadmap, and changelog to reflect the actual merged TASK-016 implementation.


### TASK-015 — Student Management

- Added the first production-oriented Student Management vertical slice.
- Added tenant-scoped student list, server-side search, filtering, pagination, summary metrics, and student actions.
- Added dedicated `/students/new` and `/students/[id]/edit` workflows instead of a side drawer.
- Recreated the approved EduInstitution Student UI while preserving application design consistency.
- Added student photo file upload with preview, removal, JPG/PNG/WEBP support, and a 2MB limit.
- Added extended personal, admission, contact, and parent/guardian student profile fields.
- Added Prisma migration `20260824160000_extend_student_profile` for the expanded Student model.
- Added semantic bottom-right notification backgrounds for success, error, warning, and information states.
- Fixed the create/update redirect flow so success notifications survive navigation and remain visible on the Students list.
- User-reported validation is green and manual create, update, photo, redirect, notification, and responsive workflows are working.

### Documentation Recovery — TASK-010 through TASK-012

- Recovered and documented the previously completed but undocumented task sequence from actual merged Git history.
- Added TASK-010 — UI Design System & Production Feedback.
- Added TASK-011 — Institution Types & Capabilities.
- Added TASK-012 — Departments & Programs.
- Updated current project state and roadmap so the completed task sequence is explicit through TASK-014.

### TASK-014 — UI Redesign & Scalable Data Management

- Merged the UI redesign and scalable data management work to `master`.
- Standardized the EduInstitution management application shell and readability direction.
- Improved small-text contrast so secondary text, labels, metadata, helper text, and placeholders remain visible.
- Corrected Academic navigation so the submenu opens automatically only for Academic routes and remains closed on unrelated routes unless manually expanded.
- Rebuilt the Academic Years UI from scratch while preserving existing APIs, routes, permissions, database schema, and business logic.
- Rebuilt the Academic Year create, detail, edit, and Term management UI to use one consistent design language.
- Added clearer examples, contextual tips, plain-language guidance, empty/loading/error/success states, and responsive layouts.
- Added reference-aligned Academic Year cards with clear status, date range, term count, and action hierarchy.
- Fixed the missing `InfoCircleOutlined` import that caused a runtime error in the Academic Years list.
- Final implementation merged through pull request #59.

### Engineering Lessons Carried Forward

- Fetch the latest file SHA before every GitHub update.
- On `409`, refetch and reapply rather than retrying a stale write.
- Verify imports before using a component or icon.
- Do not report intended work as implemented work.
- UI-only tasks must preserve existing business logic unless a minimal related bug fix is required.
- Check alignment and responsive behavior on desktop and mobile before completion.

## 2026-08-18

### Foundation Validation

- Added and verified the initial technical package foundation for Ant Design, Prisma + Neon, and Cloudflare OpenNext.
- Added Linux GitHub Actions validation for Prisma generation, lint, typecheck, Next.js build, and OpenNext Cloudflare build.
- Excluded generated `.open-next` output from ESLint so generated deployment artifacts are not treated as application source.
- Local validation passed: `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run build:cloudflare`.
- Confirmed Windows local Workers runtime remains blocked by `workerd` access violation `0xc0000005`; Linux CI is the authoritative Cloudflare runtime validation gate.

## 2026-08-15

### Added

- Architecture bootstrap branch.
- Project documentation knowledge base.
- Product vision, scope, roles, and module plan.
- System, frontend, database, storage, authentication, authorization, and infrastructure architecture baselines.
- ADRs for database, UI, authorization, multi-tenancy, R2, and Cloudflare deployment.
- TASK-000 and initial development backlog.
- Testing strategy and roadmap.
- Current project state.
