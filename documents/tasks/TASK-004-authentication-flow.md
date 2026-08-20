# TASK-004 — Authentication Flow

## Status

READY FOR PR REVIEW

## Objective

Implement the server-side authentication flow on top of the merged multi-tenant authorization and session foundations.

## Scope

- Credential verification
- Password hashing/verification integration
- Active membership resolution
- Explicit tenant selection constrained to authenticated memberships
- Secure session creation through TASK-003
- Authenticated-session resolution
- Logout integration
- Authentication error handling
- Google-inspired sign-in UI using the existing Tailwind design system
- Security-focused tests
- Development-only authentication seed

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
- [x] Server-side dashboard protection
- [x] Google-inspired responsive green login page
- [x] Password security tests
- [x] Tenant-context integration using hashed session tokens
- [x] Node-specific Prisma generator for development seed execution
- [x] Idempotent development seed for a demo administrator account
- [x] `db:seed` now generates Prisma clients before seeding

## Security review

- Client-supplied tenant IDs are treated only as a requested selection and are accepted only when the authenticated user's active membership contains that tenant.
- Invalid email/password responses use the same generic authentication error.
- Passwords are never persisted in plaintext.
- Password verification uses a constant-time comparison of derived keys.
- Raw session tokens are not queried from the database; the stored SHA-256 token hash is used.
- Dashboard access is enforced server-side through `requireTenantContext()`.
- Inactive or revoked memberships cannot establish an authenticated tenant context.
- Development seed execution is blocked in production.
- The seed uses a Node-specific Prisma client; the application continues using the Cloudflare `workerd` client.

## Code-review findings and resolutions

### Resolved

1. Prisma seed initially attempted to execute the Cloudflare `workerd` client under Node. A separate `nodejs` Prisma generator was added for seed tooling.
2. Generated ESM imports required explicit TypeScript extensions. `importFileExtension = "ts"` was added to both generators.
3. `db:seed` previously assumed generated clients already existed. It now runs `prisma generate` first.
4. Session lookup was verified to hash the raw cookie before database lookup.
5. Dashboard authentication is enforced on the server rather than only in the client UI.

### Follow-up, intentionally outside TASK-004

- Production rate limiting / brute-force protection for login.
- Password reset and account recovery.
- Registration and email verification.
- OAuth/social authentication.
- A richer multi-institution picker UX instead of manual tenant ID entry.

These remain separate slices and are not prerequisites for the current authentication contract.

## Development seed

```text
Email:       admin@eduinstitution.local
Password:    ChangeMe123!
Institution: Demo Institution
Role:        Administrator
```

The seed is development-only and idempotent.

## Validation

Local verification reported successful by the developer:

- [x] Prisma client generation
- [x] Development database seed
- [x] Login flow
- [x] Protected dashboard redirect
- [x] Session/authentication flow
- [x] Logout flow

Repository CI status must still be confirmed on the final PR head before merge.

## Definition of Done

- [x] Authentication service implemented
- [x] Credential verification implemented
- [x] Membership/tenant resolution implemented
- [x] Session creation integrated
- [x] Authenticated-session resolution implemented
- [x] Logout integrated
- [x] Security tests added
- [x] Development seed added
- [x] Documentation finalized for PR review
- [ ] GitHub Actions green on final PR head
- [ ] PR merged to `master`

## Issue

GitHub issue #6.

## Next step

Create the TASK-004 pull request, wait for the complete CI gate, review any CI findings, and merge only after all required checks are green.
