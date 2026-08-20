# TASK-006 UI Follow-up — Institution Management Navigation

## Objective

Correct the institution-management information architecture so `/institution` is the management landing page and `/institution/profile` is the editable institution profile.

## UX Direction

- Google-inspired enterprise UI: white surfaces, restrained borders, clear typography, generous spacing, subtle elevation.
- Keep the existing EduInstitution brand colors rather than copying Google branding.
- Make the route hierarchy visible through breadcrumbs and local navigation.
- Keep the management area extensible for future modules without pretending those modules already exist.

## Routes

- `/institution` — Institution overview / management landing page.
- `/institution/profile` — Institution profile and name editing.

Future routes may include members, roles, academic configuration, integrations, and billing only when those capabilities are implemented.

## Acceptance Criteria

- [ ] `/institution` is a useful landing page rather than a raw edit form.
- [ ] Profile editing lives at `/institution/profile`.
- [ ] Institution local navigation clearly indicates the current route.
- [ ] Breadcrumbs expose Dashboard → Institution → current page.
- [ ] Sidebar Institution item links to `/institution`.
- [ ] Mobile navigation preserves the same route structure.
- [ ] Existing API/security behavior remains unchanged.
- [ ] Existing CI gates remain green.
