# TASK-008 — Product Architecture, Feature Planning & Responsive UI System

## Status

IN PROGRESS

## Objective

Establish the architecture and delivery contracts required to grow EduInstitution into a multi-category education platform while preserving tenant isolation, authorization correctness, predictable route flows, and a consistent mobile-first UI.

## Supported Institution Categories

Initial architecture must support:

- School
- Engineering College
- Pharmacy College
- Arts & Science College
- University
- Polytechnic
- Training / Vocational Institute
- Coaching / Learning Institute
- Other compatible education institutions

Institution category is configuration/domain data. It must not create a separate authentication or tenant model.

## Feature Planning Contract

Before substantial implementation, the task plan must document:

1. Objective and user problem
2. Actors and roles
3. Supported institution categories
4. Field-level data specification
5. Validation rules
6. Lifecycle and archive/delete semantics
7. Route map and navigation
8. Complete user flow
9. Permission/access matrix
10. Tenant-isolation rules
11. API/server flow
12. Database impact and migration strategy
13. Audit requirements
14. UI copy/content
15. Desktop behavior
16. Mobile behavior
17. Loading, empty, validation, permission and server-error states
18. Dependencies and downstream consumers
19. Non-goals
20. Tests and CI gates
21. Definition of Done

A task missing these sections is not implementation-ready; sections that genuinely do not apply must be explicitly marked not applicable with a reason.

## Field Specification Contract

Every business field must define:

| Property | Required |
|---|---|
| Name | Yes |
| Data type | Yes |
| Required/optional | Yes |
| Editable/read-only | Yes |
| Validation | Yes |
| Uniqueness/indexing | Where applicable |
| Default | Where applicable |
| Visibility | Yes |
| Tenant scope | Yes |
| Institution-specific | Yes |
| Lifecycle behavior | Yes |
| Audit requirement | Where applicable |

Shared entities should contain universally meaningful fields. Institution-specific data belongs in the appropriate module/extension boundary.

## User Flow Contract

Each feature must document:

```text
Entry point
 → Route
 → User action
 → Client validation
 → Server request
 → Authentication
 → Capability check
 → Permission check
 → Tenant-scoped operation
 → Audit/event where required
 → Success / validation / permission / server error
 → Next route or action
```

The flow must also cover first use, edit, cancel/back, empty state, loading state, unauthorized access, failure recovery, and mobile behavior.

## Permission Contract

Every feature defines action-level access:

- View
- Create
- Edit
- Archive/deactivate
- Delete where explicitly allowed
- Export where applicable
- Approve where applicable

UI visibility is not authorization. All protected operations require server-side authentication, tenant validation, capability evaluation where applicable, and permission enforcement.

## Institution Compatibility Contract

Each feature must classify itself as:

- Common — applicable across institution categories
- Configurable — same capability with different terminology/settings
- Category-specific — implemented behind an extension boundary
- Not applicable — unavailable for a category

A new institution category must be addable without rewriting authentication, tenancy, shared users, or core authorization.

## UI Contract

The UI follows the canonical Google-inspired enterprise direction documented in `documents/architecture/ui-design-system.md`.

Requirements:

- clear page purpose
- one obvious primary action
- plain-language labels
- predictable route hierarchy
- breadcrumbs on deeper pages
- consistent module navigation
- restrained white/neutral surfaces
- product green as brand identity
- limited utility blue accents
- minimal visual noise
- accessible controls
- meaningful empty/loading/error states
- mobile-first responsive layout

Google is a usability/reference direction only; proprietary Google branding/assets are not copied.

## Mobile Contract

Every UI feature must be intentionally designed for:

- phone portrait
- phone landscape
- tablet
- desktop
- large desktop

Forms stack naturally, controls remain touch-friendly, tables transform to cards/prioritized fields where appropriate, and routine workflows must not depend on horizontal scrolling on small screens.

## Capability Architecture

The canonical capability/type/terminology architecture is defined in `documents/architecture/capability-architecture.md`.

The mandatory security relationship is:

```text
Tenant
  + Capability enabled
  + User permission granted
  + Valid input
  = Authorized operation
```

Capability configuration can restrict availability but can never grant authorization by itself.

## Dependency and Release Rule

Every feature must identify upstream dependencies and downstream consumers. Routes must not be exposed before their required capability, data, permission, and migration dependencies exist.

## Definition of Done

- [ ] Detailed feature plan complete
- [ ] Field contract complete
- [ ] Route/flow contract complete
- [ ] Permission matrix complete
- [ ] Tenant isolation reviewed
- [ ] Institution compatibility reviewed
- [ ] Database/migration impact reviewed
- [ ] UI copy/design reviewed
- [ ] Desktop and mobile behavior defined
- [ ] States defined
- [ ] Tests defined and implemented
- [ ] Documentation synchronized
- [ ] Test, lint, typecheck, Next.js build and Cloudflare build green
- [ ] Code review complete
- [ ] PR merged only after all gates are green
