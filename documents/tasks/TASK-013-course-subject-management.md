# TASK-013 — Course / Subject Management

## Objective
Build a reusable tenant-scoped Course/Subject foundation under Program for all supported institution types.

## Scope
- Course/Subject data model linked to Tenant and Program
- Tenant-scoped CRUD/archive APIs
- Explicit course permissions
- Development seed updates
- Responsive UI using TASK-010 visual language and EduInstitution brand color
- Simple wording, realistic examples, and placeholders
- Success, error, information, and warning feedback
- Search/filter-ready list structure
- Tenant isolation and authorization tests
- Documentation and CI verification

## Non-goals
- Student enrollment
- Faculty assignment
- Attendance
- Examinations/marks
- Timetable
- Fees
- Student portal

## Domain direction
Use one generic Course model. UI terminology may later be configurable as Course, Subject, Module, or Paper without creating institution-specific database models.

## Proposed fields
- tenantId
- programId
- code
- name
- description
- type
- credits
- weeklyHours
- displayOrder
- status

Exact fields and types must be verified against the existing repository before migration.

## Security
- Tenant is derived from authenticated TenantContext.
- Mutations require explicit permissions.
- Course IDs are always resolved through tenant-scoped queries.
- Cross-tenant access must be denied.
- Program ownership must be validated before course creation/update.

## UI standard
Follow TASK-010 and existing Dashboard, Institution, and Academic Years patterns. Use EduInstitution brand green for primary actions. Every input must have a clear label and an understandable example placeholder.

Examples:
- Course name: `Example: Database Management Systems`
- Course code: `Example: CS301`
- Description: `Example: Introduction to database design, SQL, and data management.`
- Department/Program: `Select a department` / `Select a program`
- Credits: `Example: 4`
- Weekly hours: `Example: 5`

## Validation gate
- npm run typecheck
- npm run lint
- npm test
- npm run build
- npm run build:cloudflare
- Manual desktop/tablet/mobile verification
