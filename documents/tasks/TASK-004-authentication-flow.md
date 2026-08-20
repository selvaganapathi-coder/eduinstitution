# TASK-004 — Authentication Flow

## Status

IN PROGRESS

## Objective

Implement the server-side authentication flow on top of the merged multi-tenant authorization and session foundations.

## Scope

- Credential verification
- Password hashing/verification integration
- Active membership resolution
- Explicit tenant selection from authenticated memberships
- Secure session creation through TASK-003
- Authenticated-session resolution
- Logout integration
- Authentication error handling
- Unit/integration tests

## Security requirements

- Never trust a client-supplied tenant ID as authorization evidence.
- Tenant selection must be limited to memberships belonging to the authenticated user.
- Passwords must never be stored or logged in plaintext.
- Authentication errors must not expose sensitive account information.
- Session creation must use the existing TASK-003 lifecycle.
- Authorization remains server-side through the existing tenant context/permission layer.

## Non-goals

- Registration
- Password reset
- OAuth/social login
- Email verification
- Student/faculty/business modules
- Dashboard business logic

## Definition of Done

- [ ] Authentication service implemented
- [ ] Credential verification implemented
- [ ] Membership/tenant resolution implemented
- [ ] Session creation integrated
- [ ] Authenticated-session resolution implemented
- [ ] Logout integrated
- [ ] Security tests added
- [ ] Local test/lint/typecheck/build validation passes
- [ ] GitHub Actions green
- [ ] Documentation updated
- [ ] PR merged to `master`

## Issue

GitHub issue #6.
