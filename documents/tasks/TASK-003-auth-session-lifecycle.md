# TASK-003 — Authentication Session Lifecycle

## Status

IN PROGRESS

## Objective

Implement the server-side session lifecycle required by the existing multi-tenant authentication foundation without introducing login UI or business modules.

## Scope

- Cryptographically random session token generation
- SHA-256 token hashing
- Session persistence through the existing Prisma `Session` model
- Secure HTTP-only session cookie
- Session revocation
- Logout and cookie invalidation
- Expired-session cleanup
- Unit tests for security primitives

## Security contract

The raw session token is delivered only to the browser through the HTTP-only cookie. The database stores only the SHA-256 digest in `Session.tokenHash`.

The session remains tenant-bound through `Session.userId` and `Session.tenantId`.

Cookie policy:

- `HttpOnly: true`
- `Secure: true` in production
- `SameSite: Lax`
- `Path: /`
- Explicit expiry

## Non-goals

- Login page
- Registration
- Password reset
- OAuth/social authentication
- Email verification flow
- Student/faculty/business modules

## Definition of Done

- [x] Session token generation implemented
- [x] Token hashing implemented
- [x] Session creation implemented
- [x] Secure session cookie implemented
- [x] Session revocation implemented
- [x] Logout implemented
- [x] Expired-session cleanup implemented
- [x] Security primitive tests added
- [ ] Local test/lint/typecheck/build validation
- [ ] GitHub Actions green
- [ ] PR merged to `master`

## Next step

After this task is validated and merged, the login/authentication flow can consume the session lifecycle without changing its security contract.
