# TASK-009 — Academic Year & Term Management

## Status

IN PROGRESS

## Objective

Provide each institution with a tenant-scoped way to define academic years and their terms/semesters. This becomes a shared foundation for school, engineering, pharmacy, arts & science, university, polytechnic, and other education workflows.

## Supported Institution Types

All institution categories are supported by the core model. The terminology shown in the UI may vary through the future capability/terminology layer.

Examples:

- School: Academic Year → Term 1 / Term 2 / Term 3
- Engineering: Academic Year → Semester 1 / Semester 2
- Pharmacy: Academic Year → Semester 1 / Semester 2
- Arts & Science: Academic Year → Semester 1 / Semester 2
- University: Academic Year → Semester / Term as configured
- Polytechnic: Academic Year → Semester as configured

The core data model must not hard-code a school-only or college-only structure.

## Scope

- List academic years for the current institution.
- Create an academic year.
- Edit an academic year.
- Set one academic year as current/active.
- Archive an academic year without deleting historical records.
- Add, edit, reorder, and archive terms within an academic year.
- Validate date ranges and uniqueness within the current institution.
- Provide empty, loading, success, validation, and error states.
- Add server-side permission and tenant checks.
- Provide responsive desktop/mobile routes following the approved Google-inspired UI reference.

## Non-goals

- Departments
- Programs
- Courses/subjects
- Students
- Attendance
- Examinations
- Fees
- Institution-type capability configuration UI
- Cross-institution administration

## Data Model

### Academic Year

| Field | Type | Required | Editable | Validation | Tenant scope | Notes |
|---|---|---:|---:|---|---|---|
| id | cuid | Yes | No | System generated | Yes | Primary key |
| tenantId | string | Yes | No | Must equal authenticated tenant | Yes | Never accepted as authorization input |
| name | string | Yes | Yes | 2–100 chars | Yes | Example: 2026–2027 |
| startDate | date | Yes | Yes | Valid date | Yes | Inclusive |
| endDate | date | Yes | Yes | After startDate | Yes | Inclusive |
| isCurrent | boolean | Yes | Controlled | Maximum one current year per tenant | Yes | Current working year |
| status | enum | Yes | Controlled | ACTIVE / ARCHIVED | Yes | Archive preserves history |
| createdAt | datetime | Yes | No | System generated | Yes | Audit metadata |
| updatedAt | datetime | Yes | No | System generated | Yes | Audit metadata |

### Term

| Field | Type | Required | Editable | Validation | Tenant scope | Notes |
|---|---|---:|---:|---|---|---|
| id | cuid | Yes | No | System generated | Yes | Primary key |
| academicYearId | string | Yes | No | Must belong to current tenant | Yes | Parent year |
| name | string | Yes | Yes | 1–100 chars | Yes | Terminology may be configured later |
| startDate | date | Yes | Yes | Within academic year | Yes | Inclusive |
| endDate | date | Yes | Yes | After startDate | Yes | Inclusive |
| sortOrder | integer | Yes | Yes | Positive integer | Yes | Display order |
| status | enum | Yes | Controlled | ACTIVE / ARCHIVED | Yes | Historical terms are retained |
| createdAt | datetime | Yes | No | System generated | Yes | Audit metadata |
| updatedAt | datetime | Yes | No | System generated | Yes | Audit metadata |

## Business Rules

1. An academic year belongs to exactly one tenant.
2. A tenant may have many academic years.
3. At most one non-archived academic year may be marked current.
4. An academic year end date must be after its start date.
5. A term must belong to its academic year and its dates must fall within the parent year.
6. A term end date must be after its start date.
7. Active terms in one academic year must not overlap.
8. Academic-year names should be unique within a tenant.
9. Term names should be unique within one academic year.
10. Archived records remain available for historical reporting.
11. Deletion is intentionally excluded from this task.
12. All reads and writes are scoped through the authenticated tenant context.

## Routes

```text
Dashboard
  ↓
Academic
  ↓
Academic Years                  /academic/years
  ├── Overview                  /academic/years
  ├── Create                    /academic/years/new
  ├── Details                   /academic/years/[id]
  ├── Edit                      /academic/years/[id]/edit
  └── Terms                     /academic/years/[id]/terms
```

The route structure must remain compatible with future Academic navigation without exposing unimplemented modules.

## User Flow

### Create Academic Year

```text
Academic Years
 → Add academic year
 → Enter name + start date + end date
 → Validate
 → Permission check
 → Tenant check
 → Create record
 → Success message
 → Open academic year details
```

### Make Current

```text
Academic Year details
 → Make current
 → Confirm
 → Server checks tenant + permission
 → Previous current year is cleared
 → Selected year becomes current
 → Success confirmation
```

### Manage Terms

```text
Academic Year details
 → Terms
 → Add term
 → Enter name + dates
 → Validate against parent academic year
 → Save
 → Return to terms list
```

### Archive

```text
Academic Year details
 → Archive
 → Confirmation
 → Server permission + tenant validation
 → Status becomes ARCHIVED
 → Return to academic year list
```

## Access / Permission Matrix

Initial permissions:

- `academic_year:view`
- `academic_year:create`
- `academic_year:update`
- `academic_year:archive`
- `academic_term:view`
- `academic_term:create`
- `academic_term:update`
- `academic_term:archive`

| Action | Administrator | Manager/Academic Admin | Staff | Teacher | Student/Parent |
|---|---:|---:|---:|---:|---:|
| View academic years | Yes | Yes | By permission | By permission | No by default |
| Create academic year | Yes | Yes | No by default | No | No |
| Edit academic year | Yes | Yes | No by default | No | No |
| Make current | Yes | Yes | No by default | No | No |
| Archive academic year | Yes | Yes | No by default | No | No |
| Manage terms | Yes | Yes | By permission | No by default | No |

UI visibility is not authorization. Every protected operation must be permission-checked server-side.

## Tenant Security

- Tenant ID is derived from the authenticated `TenantContext`.
- Client input must never choose the tenant for a read/write operation.
- A requested academic-year ID must be verified as belonging to the authenticated tenant before access.
- A requested term ID must be verified through its academic-year relationship and tenant.
- Cross-tenant IDs return a safe not-found/unauthorized response without leaking another institution's data.

## API / Server Flow

```text
Request
 → authenticate session
 → require tenant context
 → require required permission
 → validate input
 → query by tenant-scoped relation
 → apply business rules
 → transaction where multiple records change
 → return safe response
```

Making one academic year current must be transactional so two current years cannot be created by concurrent requests.

## UI Specification

Use the approved first EduInstitution sample image as the visual reference.

### Desktop

- Google-inspired clean white/neutral surfaces.
- EduInstitution green remains the primary brand/action color.
- Blue is reserved for familiar links/utility actions.
- Thin neutral borders and minimal elevation.
- Clear page title: `Academic years`.
- One short explanation below the title.
- Primary action: `Add academic year`.
- Search/filter only when the number of records justifies it.
- Current year clearly marked with a simple status badge.

### Mobile

- Same route and content hierarchy.
- Stacked cards instead of dense tables.
- Full-width primary action.
- Touch-friendly controls.
- Breadcrumbs replaced with clear back navigation where appropriate.
- No horizontal scrolling for the main workflow.

### Plain-language UI

Use:

- `Academic years`
- `Add academic year`
- `Current year`
- `Edit`
- `Make current`
- `Manage terms`
- `Archive`
- `Save changes`
- `Cancel`

Avoid technical terms such as `tenant`, `entity`, `mutation`, `payload`, or `resource` in normal user-facing content.

## States

### Empty

> No academic years yet
>
> Add your first academic year to start setting up your institution.
>
> **Add academic year**

### Loading

Use local skeleton/loading states without replacing the entire application shell.

### Validation

Examples:

- `Enter an academic year name.`
- `End date must be after the start date.`
- `Term dates must be within the academic year.`
- `This term overlaps another term.`

### Error

> We couldn't save the academic year. Check the details and try again.

### Success

> Academic year created successfully.

## Institution-Type Compatibility

The data model is common across institution types. Institution-specific terminology and workflow differences must be introduced through the capability/terminology architecture rather than separate copies of the academic-year model.

Examples:

- School may display `Term`.
- Engineering may display `Semester`.
- Pharmacy may display `Semester`.
- University may allow configured term labels.

The underlying domain remains `AcademicYear` and `AcademicTerm`.

## Testing

Must cover:

- tenant isolation
- permission checks
- create/update/archive validation
- current-year uniqueness
- current-year transaction behavior
- term date boundaries
- term overlap prevention
- cross-tenant academic-year ID
- cross-tenant term ID
- single/multiple institution fixtures
- supported institution-category compatibility
- mobile route/content smoke checks where practical

## Definition of Done

- [ ] Prisma model and migration
- [ ] Tenant-scoped server layer
- [ ] Permission definitions and seed
- [ ] Academic-year CRUD except deletion
- [ ] Current-year workflow
- [ ] Term management
- [ ] Route hierarchy
- [ ] Desktop UI following approved reference
- [ ] Mobile UI following approved reference
- [ ] Plain-language content
- [ ] Empty/loading/error/success states
- [ ] Unit/integration/security tests
- [ ] Documentation updated
- [ ] Test/lint/typecheck/build/build:cloudflare green
- [ ] PR review completed
- [ ] Merged to master
