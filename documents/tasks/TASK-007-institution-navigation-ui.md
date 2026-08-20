# TASK-007 — Institution Management Navigation & UI

## Status

IN PROGRESS

## Objective

Make institution management feel like a coherent product area rather than a standalone edit form.

## UX Direction

- Google-inspired enterprise UI: white surfaces, restrained borders, clear typography, generous spacing, subtle elevation.
- Keep EduInstitution's own brand palette; Google styling is a visual reference, not copied branding.
- `/institution` is the management landing page.
- `/institution/profile` contains editable institution identity.
- Local navigation and breadcrumbs make the route hierarchy explicit.

## Scope

- Institution management overview route.
- Profile route.
- Institution-local navigation.
- Breadcrumbs.
- Sidebar route correction.
- Responsive/mobile route continuity.
- No new backend capabilities.

## Routes

- `/institution` — Overview
- `/institution/profile` — Profile

Future management routes will be added only when their backend capability exists.

## Definition of Done

- [ ] Overview route explains what institution management controls.
- [ ] Profile route owns editing.
- [ ] Local navigation is visible and route-aware.
- [ ] Breadcrumbs are visible.
- [ ] Sidebar links to `/institution`.
- [ ] Mobile navigation preserves the same routes.
- [ ] Existing API/security behavior remains unchanged.
- [ ] Tests, lint, typecheck, Next build, and Cloudflare build green.
- [ ] PR reviewed and merged.
