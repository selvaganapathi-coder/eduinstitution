# TASK-009 — Academic Year & Term Management

## Status

COMPLETED AND MERGED

## Objective

Provide each institution with a tenant-scoped way to define academic years and their terms/semesters. This becomes a shared foundation for school, engineering, pharmacy, arts & science, university, polytechnic, and other education workflows.

## Completion Summary

The Academic Year and Term workflows were implemented and merged. The final UI was redesigned to match the EduInstitution application direction while preserving the existing API, routes, permissions, database schema, and business logic.

Final UI work includes:

- Academic Years list redesign.
- Academic Year create form redesign.
- Academic Year detail redesign.
- Academic Year edit redesign.
- Terms management redesign.
- Reference-aligned Academic Year cards and guidance.
- Plain-language labels, examples, and tips.
- Empty/loading/error/success states.
- Responsive desktop, tablet, and mobile layouts.
- Alignment and readability corrections.
- Bottom-right notification behavior consistent with the wider application.

## Supported Institution Types

All institution categories are supported by the core model. The terminology shown in the UI may vary through the future capability/terminology layer.

Examples:

- School: Academic Year → Term 1 / Term 2 / Term 3
- Engineering: Academic Year → Semester 1 / Semester 2
- Pharmacy: Academic Year → Semester 1 / Semester 2
- Arts & Science: Academic Year → Semester 1 / Semester 2
- University: Academic Year → Semester / Term as configured
- Polytechnic: Academic Year → Semester as configured

The core data model does not hard-code a school-only or college-only structure.

## Implemented Scope

- List academic years for the current institution.
- Create an academic year.
- Edit an academic year.
- Set one academic year as current/active.
- Archive an academic year without deleting historical records.
- Add, edit, reorder, and archive terms within an academic year.
- Validate date ranges and uniqueness within the current institution.
- Provide empty, loading, success, validation, and error states.
- Enforce server-side permission and tenant checks.
- Provide responsive routes following the approved EduInstitution management UI direction.

## Data Model

### Academic Year

- Tenant-scoped academic year.
- Name.
- Start date.
- End date.
- Current-year flag.
- Active or archived status.
- Created and updated timestamps.

### Term

- Parent academic year.
- Name.
- Start date.
- End date.
- Sort order.
- Active or archived status.
- Created and updated timestamps.

## Business Rules

1. An academic year belongs to exactly one tenant.
2. A tenant may have many academic years.
3. At most one non-archived academic year may be marked current.
4. An academic year end date must be after its start date.
5. A term belongs to its academic year and its dates must fall within the parent year.
6. A term end date must be after its start date.
7. Active terms in one academic year must not overlap.
8. Academic-year names are unique within a tenant according to the implemented validation rules.
9. Term names are unique within one academic year according to the implemented validation rules.
10. Archived records remain available for historical reporting.
11. Deletion is intentionally excluded from this scope.
12. All reads and writes are scoped through the authenticated tenant context.

## Routes

```text
/academic/years
/academic/years/new
/academic/years/[id]
/academic/years/[id]/edit
/academic/years/[id]/terms
```

## Security Contract

- Tenant identity is derived from authenticated `TenantContext`.
- Client input does not choose the tenant for reads or writes.
- Academic-year IDs are verified within the authenticated tenant.
- Term IDs are resolved through the academic-year relationship and tenant context.
- Protected operations require explicit permissions.
- Current-year changes use a database transaction.
- Cross-tenant records are not returned.

## Permissions

- `academic_year:view`
- `academic_year:create`
- `academic_year:update`
- `academic_year:archive`
- `academic_term:view`
- `academic_term:create`
- `academic_term:update`
- `academic_term:archive`

## UI Rules Used for Final Implementation

- Google-inspired clean application shell.
- EduInstitution green for primary actions.
- Thin borders and restrained shadows.
- One clear page title with short supporting text.
- Plain-language labels.
- Example values and contextual tips where useful.
- Readable secondary text; small text must not use pale low-contrast gray.
- Bottom-right success/error/warning/information feedback.
- Responsive desktop, tablet, and mobile layouts.

## Validation and Merge

- Final Academic Year UI runtime issue caused by a missing `InfoCircleOutlined` import was fixed.
- The user reported the final checks as green after verification.
- The work was merged to `master` through the latest TASK-014 UI redesign merge.
- Future sessions must still verify current repository health and CI rather than assuming historical validation results.

## Definition of Done

- [x] Tenant-scoped server layer
- [x] Permission definitions and seed
- [x] Academic-year workflows except deletion
- [x] Current-year workflow
- [x] Term management
- [x] Route hierarchy
- [x] Responsive UI
- [x] Plain-language content
- [x] Empty/loading/error/success states
- [x] Documentation updated
- [x] Final runtime import issue fixed
- [x] User-reported local verification green
- [x] Merged to master

## Continuation Notes

Do not redesign or modify this workflow without first inspecting the current merged implementation. UI-only work must preserve the existing API, database schema, permissions, routes, and business logic unless a minimal related bug fix is required.
