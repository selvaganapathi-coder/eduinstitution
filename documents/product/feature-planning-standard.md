# Feature Planning Standard

Every feature must have a detailed pre-implementation plan before coding.

## 1. Feature Definition

Document:

- Feature name
- User problem
- Business objective
- Actors/users
- Institution types affected
- Dependencies
- Assumptions
- Non-goals
- Definition of done

## 2. Field-Level Specification

For every data field, document:

| Field | Type | Required | Editable | Default | Validation | Visibility | Tenant Scope | Notes |
|---|---|---:|---:|---|---|---|---|---|

Also specify:

- database representation
- uniqueness
- indexing
- nullable vs required
- allowed values/enums
- create/update behavior
- audit requirements
- deletion/archive behavior
- whether the field is common or institution-type-specific

Do not introduce a field without identifying its owner and lifecycle.

## 3. User Flow

Document the complete flow before implementation:

```text
Entry point
  -> page / route
  -> user action
  -> validation
  -> server request
  -> authorization
  -> database operation
  -> response
  -> success state
  -> next route/action
```

Include:

- first-time flow
- normal flow
- edit flow
- cancel/back flow
- empty state
- loading state
- validation error
- authorization error
- server failure
- mobile behavior

## 4. Route Specification

Every feature must define:

- route(s)
- parent route
- breadcrumbs
- local navigation
- entry points from dashboard/sidebar
- allowed roles
- redirect behavior
- mobile navigation behavior
- whether the route is tenant-scoped

Example:

```text
/                         Dashboard
/institution              Institution overview
/institution/profile      Institution profile
```

## 5. Access / Permission Matrix

Every feature must define access before implementation.

| Action | Admin | Manager | Staff | Teacher | Student | Parent | Other |
|---|---:|---:|---:|---:|---:|---:|---:|
| View | | | | | | | |
| Create | | | | | | | |
| Edit | | | | | | | |
| Delete/Archive | | | | | | | |
| Export | | | | | | | |
| Approve | | | | | | | |

Rules:

- Authorization is enforced server-side.
- UI hiding is not authorization.
- Tenant ID from the client is never authorization evidence.
- Cross-tenant access must be explicitly tested.
- Permission codes must have stable naming and documentation.

## 6. Institution-Type Compatibility

For every feature, document:

| Institution Type | Supported | Terminology | Special Fields | Special Workflow |
|---|---:|---|---|---|
| School | | | | |
| Engineering | | | | |
| Pharmacy | | | | |
| Arts & Science | | | | |
| Polytechnic | | | | |
| University | | | | |
| Training/Vocational | | | | |
| Other | | | | |

The feature plan must explain whether the feature is:

- shared
- configurable
- institution-type-specific
- disabled for a category

## 7. UI Specification

Before coding UI, document:

- page purpose
- information hierarchy
- primary action
- secondary actions
- content labels
- form field order
- table/list behavior
- empty state
- loading state
- error state
- confirmation behavior
- responsive behavior

UI content must use plain, familiar language. Avoid technical labels where a user-facing term is clearer.

## 8. Mobile Specification

Every page must be designed for small screens first.

Define:

- mobile layout
- desktop layout
- navigation behavior
- table-to-card transformation
- form stacking
- touch target sizes
- sticky actions where appropriate
- overflow behavior
- readable text hierarchy

No feature is complete if the desktop workflow works but the mobile workflow is unusable.

## 9. Data / API Specification

Document:

- endpoint/server action
- request fields
- response fields
- validation rules
- authorization check
- tenant boundary
- pagination/search/filter behavior
- transaction requirements
- expected failure responses

## 10. Database Specification

Before schema changes, document:

- entities
- relationships
- indexes
- uniqueness
- tenant constraints
- lifecycle/status fields
- archive/delete policy
- migration impact
- seed impact

Avoid premature schema expansion.

## 11. Testing Specification

Every feature plan must identify tests for:

- happy path
- invalid input
- empty state
- unauthorized role
- unauthenticated access
- cross-tenant access
- inactive/revoked membership
- edge cases
- mobile-critical interactions where practical

## 12. UX / Product Review

Before implementation, ask:

- Is the workflow understandable without training?
- Is the primary action obvious?
- Is there unnecessary complexity?
- Can an older/non-technical user understand the labels?
- Does the workflow scale for large institutions?
- Does this support future institution types?
- Is the feature actually needed in this phase?

## 13. Required Plan Output

Every substantial task plan must contain:

```text
STATUS

OBJECTIVE

USER PROBLEM

SUPPORTED INSTITUTION TYPES

SCOPE

NON-GOALS

DEPENDENCIES

ROUTES / NAVIGATION

FIELDS / DATA MODEL

USER FLOW

ACCESS / PERMISSION MATRIX

API / SERVER FLOW

DATABASE IMPACT

UI / CONTENT SPECIFICATION

MOBILE RESPONSIVE SPECIFICATION

SECURITY

TESTING

PERFORMANCE / SCALE

CI/CD

DOCUMENTATION

RISKS / TRADE-OFFS

DEFINITION OF DONE

RECOMMENDATION
```
