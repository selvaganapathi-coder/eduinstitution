# TASK-005 — Authentication Completion & Tenant Selection

## Status

IN PROGRESS

## Objective

Complete the authentication boundary after TASK-004 by making tenant selection explicit and hardening the end-to-end authentication lifecycle.

## Scope

- Replace manual tenant-ID entry with server-derived institution selection.
- Support users with one or multiple active memberships.
- Never trust a client-supplied tenant ID as authorization evidence.
- Create sessions only for memberships belonging to the authenticated user.
- Preserve TASK-003 session security and TASK-002 authorization contracts.
- Complete login, logout, expired/revoked session behavior.
- Add comprehensive authentication and tenant-selection tests.
- Keep the green Google-inspired login UI consistent with the established design system.

## Non-goals

- Public signup/registration
- Password reset
- OAuth/social login
- Email verification
- Student/faculty/business modules

## Definition of Done

- [ ] Institution selector implemented for multi-membership users
- [ ] Single-membership login works without manual tenant ID
- [ ] Unauthorized tenant selection rejected server-side
- [ ] Invalid credentials return generic errors
- [ ] Logout revokes the session and clears the cookie
- [ ] Expired/revoked sessions redirect to `/login`
- [ ] Authentication/security tests cover the lifecycle
- [ ] Local test/lint/typecheck/build/build:cloudflare pass
- [ ] GitHub Actions green
- [ ] Code review completed
- [ ] Documentation updated
- [ ] PR merged to `master`

## Issue

GitHub issue #7.
