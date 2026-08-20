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
- Add authentication and tenant-selection tests.
- Keep the established green Google-inspired login UI consistent.

## Non-goals

- Public signup/registration
- Password reset
- OAuth/social login
- Email verification
- Student/faculty/business modules
- Login rate limiting / brute-force protection

## Implementation Plan

1. Derive active institutions from the authenticated user's memberships.
2. Expose only institution metadata needed by the login selector.
3. Replace free-form tenant ID entry with a selector populated from the server.
4. Keep final tenant authorization server-side in `authenticate`.
5. Add pure tenant-selection tests covering single membership, multiple memberships, invalid selection, and no membership.
6. Preserve existing session/logout behavior and verify it through the repository test/build gates.

## Security

- Institution choices are derived from active memberships.
- A submitted institution ID is treated only as a requested selection and is revalidated against the user's active memberships before session creation.
- Invalid credentials remain generic.
- No tenant membership data is returned for invalid credentials.

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
