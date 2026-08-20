# Capability Architecture

## Status

TASK-008 — Architecture baseline

## Purpose

Define how EduInstitution supports different institution categories without creating separate application forks or weakening tenant and permission boundaries.

## Architectural Layers

```text
Authenticated User
        |
        v
Tenant / Institution
        |
        +--> Institution Type
        |
        +--> Enabled Capabilities
        |
        +--> Terminology Profile
        |
        +--> Configuration
        |
        +--> Module Data
        |
        v
Route / UI visibility
        |
        v
Server capability check
        |
        v
Permission check
        |
        v
Tenant-scoped domain operation
```

UI visibility is presentation only. A hidden route or disabled navigation item is never an authorization mechanism.

## Canonical Institution Type Codes

| Code | Display name | Initial scope |
|---|---|---|
| `SCHOOL` | School | K-12 / school workflows |
| `ENGINEERING` | Engineering College | Engineering degree workflows |
| `PHARMACY` | Pharmacy College | Pharmacy degree workflows |
| `ARTS_SCIENCE` | Arts & Science College | UG/PG arts and science workflows |
| `UNIVERSITY` | University | Faculty/program/research workflows |
| `POLYTECHNIC` | Polytechnic | Diploma/trade workflows |
| `VOCATIONAL` | Training / Vocational Institute | Batch/competency workflows |
| `COACHING` | Coaching / Learning Institute | Course/batch workflows |
| `OTHER_EDUCATION` | Other Education Institution | Configurable common foundation |

Codes are stable identifiers. Display labels are presentation content and may be localized or overridden by terminology configuration.

## Capability Model

A capability is a product-level ability that can be enabled or disabled for an institution. Capability availability must be evaluated independently from user permissions.

### Initial capability codes

| Code | Capability | Typical categories |
|---|---|---|
| `INSTITUTION_PROFILE` | Institution profile | All |
| `ACADEMIC_CALENDAR` | Academic years / terms | All |
| `ORG_STRUCTURE` | Departments / organizational units | College, University, Polytechnic |
| `PROGRAMS` | Programs / courses of study | College, University, Polytechnic, Vocational |
| `CURRICULUM` | Subjects / curriculum | All |
| `STUDENTS` | Student records | All |
| `STAFF` | Faculty / staff records | All |
| `GUARDIANS` | Parent / guardian records | School, selected training models |
| `ATTENDANCE` | Attendance | All |
| `TIMETABLE` | Timetable / scheduling | All |
| `EXAMINATIONS` | Examinations | All |
| `RESULTS` | Results / report cards | All |
| `FEES` | Fees / payments | All where applicable |
| `DOCUMENTS` | Documents | All |
| `NOTIFICATIONS` | Notifications | All |
| `REPORTS` | Reports | All |
| `LABS_PRACTICALS` | Laboratories / practical sessions | Engineering, Pharmacy, Arts & Science, Polytechnic |
| `CLINICAL_TRAINING` | Clinical / hospital training | Pharmacy |
| `PROJECTS_INTERNSHIPS` | Projects / internships | Engineering, Pharmacy, Arts & Science, University |
| `RESEARCH` | Research management | University, selected colleges |
| `WORKSHOPS` | Workshops / trade practicals | Polytechnic, Vocational |
| `COMPETENCY_RECORDS` | Competency-oriented records | Vocational, Polytechnic |

This list is a planning baseline. New capabilities require an explicit task and compatibility assessment before implementation.

## Capability Matrix

`C` = core/expected, `O` = optional, `—` = not enabled by default.

| Capability | School | Engineering | Pharmacy | Arts & Science | University | Polytechnic | Vocational | Coaching |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Institution profile | C | C | C | C | C | C | C | C |
| Academic calendar | C | C | C | C | C | C | C | C |
| Org structure | O | C | C | C | C | C | O | — |
| Programs | O | C | C | C | C | C | C | C |
| Curriculum | C | C | C | C | C | C | C | C |
| Students | C | C | C | C | C | C | C | C |
| Staff | C | C | C | C | C | C | C | C |
| Guardians | C | — | — | — | — | — | O | O |
| Attendance | C | C | C | C | C | C | C | C |
| Timetable | C | C | C | C | C | C | C | C |
| Examinations | C | C | C | C | C | C | C | O |
| Results | C | C | C | C | C | C | C | O |
| Fees | O | C | C | C | C | C | C | C |
| Documents | C | C | C | C | C | C | C | C |
| Notifications | C | C | C | C | C | C | C | C |
| Reports | C | C | C | C | C | C | C | C |
| Labs / practicals | O | C | C | O | O | C | C | — |
| Clinical training | — | — | C | — | O | — | — | — |
| Projects / internships | O | C | C | C | C | O | C | — |
| Research | — | O | O | O | C | — | — | — |
| Workshops | — | O | — | — | — | C | C | — |
| Competency records | — | — | — | — | O | C | C | O |

The matrix controls capability defaults only. A tenant administrator may receive configurable choices where the product supports them, but configuration cannot grant a permission that the user's role does not have.

## Terminology Architecture

Terminology is separated from capability.

Examples:

| Concept key | School | Engineering | Pharmacy | Arts & Science |
|---|---|---|---|---|
| `academic_unit` | Class / Section | Department / Program | Department / Program | Department / Program |
| `learner` | Student | Student | Student | Student |
| `instructor` | Teacher | Faculty | Faculty | Faculty |
| `assessment_result` | Report Card | Result | Result | Result |
| `guardian` | Parent / Guardian | — | — | — |

The internal domain model should use stable canonical terms. User-facing labels may use terminology keys.

## Server-Side Evaluation Contract

A protected operation must satisfy all applicable checks:

```text
1. Authenticate session
2. Resolve active tenant from session/membership
3. Resolve capability for that tenant
4. Resolve user permission for the operation
5. Validate request input
6. Execute tenant-scoped domain operation
```

Capability disabled:

```text
→ route may be hidden
→ direct request is rejected server-side
```

Permission missing:

```text
→ route may be visible depending on product policy
→ mutation/read operation is rejected server-side
```

Tenant mismatch:

```text
→ operation is rejected
→ no cross-tenant data is returned
```

## Extension Rules

Institution-specific workflows must be implemented as extensions of a shared capability boundary.

Examples:

- School → class/section + guardian workflows
- Engineering → branch/lab/project workflows
- Pharmacy → practical/clinical-training workflows
- Arts & Science → program/elective/project workflows
- University → faculty/research workflows
- Polytechnic → trade/workshop workflows
- Vocational → batch/competency workflows

Do not spread institution-type conditionals throughout shared authentication, tenant, navigation, or authorization code.

## Data Modeling Rules

1. Shared entities contain universally meaningful fields only.
2. Queryable business data uses relational models.
3. Configuration uses explicit configuration records.
4. JSON is reserved for genuinely flexible, low-query configuration.
5. Institution type and capability configuration are tenant-scoped.
6. All business records remain tenant-isolated.
7. Permission checks remain independent from capability configuration.

## Route Visibility Contract

A route can be presented only when:

```text
feature state = available
AND capability = enabled
```

Authorization still occurs server-side when the route is requested.

Deep links must not expose disabled or unauthorized modules.

## Migration Strategy

- Existing institutions receive a deterministic default type during the institution-type migration.
- Existing common modules remain available where their data already exists.
- New capabilities are opt-in/defaulted according to the capability matrix.
- Migrations must be backward-compatible where practical and must not reinterpret existing tenant data silently.
- Capability changes must not delete business data.

## Testing Strategy

Every capability-aware feature should test:

1. supported institution type + enabled capability + authorized user
2. supported institution type + disabled capability
3. unsupported/default institution type
4. enabled capability + missing permission
5. authorized user from another tenant
6. direct deep-link access
7. mobile route visibility
8. terminology override where applicable

## Acceptance Criteria

- No institution category requires a separate authentication or tenant model.
- Capability configuration cannot bypass RBAC.
- Route visibility cannot be treated as authorization.
- Institution-specific workflows remain isolated behind capability/module boundaries.
- Adding a supported institution category does not require rewriting shared identity, tenancy, or authorization.
