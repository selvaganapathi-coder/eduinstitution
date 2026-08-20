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
- Google-inspired sign-in UI using the existing Tailwind design system
- Unit/integration tests

## Implemented

- [x] Password hashing and verification using Cloudflare-compatible Web Crypto PBKDF2-SHA-256
- [x] Credential authentication service
- [x] Active membership resolution
- [x] Tenant selection constrained to the user's active memberships
- [x] TASK-003 session creation integration
- [x] Authenticated session lookup using the stored token hash
- [x] Session `lastSeenAt` refresh
- [x] Login API endpoint
- [x] Logout API endpoint
- [x] Google-inspired responsive login page
- [x] Password security tests
- [x] Tenant-context integration corrected to use hashed session tokens

## Security requirements

- Never trust a client-supplied tenant ID as authorization evidence.
- Tenant selection must be limited to memberships belonging to the authenticated user.
- Passwords must never be stored or logged in plaintext.
- Password verification uses a constant-time comparison of derived keys.
- Authentication errors must not expose whether an account exists or whether its password is wrong.
- Session creation must use the existing TASK-003 lifecycle.
- Authorization remains server-side through the existing tenant context/permission layer.
- Raw session tokens are never queried from the database; only SHA-256 token hashes are stored and compared.

## Non-goals

- Registration
- Password reset
- OAuth/social login
- Email verification
- Student/faculty/business modules
- Dashboard business logic

## Definition of Done

- [x] Authentication service implemented
- [x] Credential verification implemented
- [x] Membership/tenant resolution implemented
- [x] Session creation integrated
- [x] Authenticated-session resolution implemented
- [x] Logout integrated
- [x] Security tests added
- [ ] Local test/lint/typecheck/build validation passes
- [ ] GitHub Actions green
- [ ] Documentation finalization
- [ ] PR merged to `master`

## Issue

GitHub issue #6.
