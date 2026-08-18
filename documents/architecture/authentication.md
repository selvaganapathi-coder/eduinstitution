# Authentication Architecture

## Status

PLANNED / NOT IMPLEMENTED.

## Principles

Authentication will be centralized rather than implemented independently inside business modules.

The authentication layer must establish a trusted user identity before authorization or tenant resolution.

## Required Capabilities

- Login
- Logout
- Session handling
- Password/security policy
- Password reset
- Account status
- Session expiration
- Clear authentication errors

## Planned Flow

```text
Request
  ↓
Authentication
  ↓
Authenticated User
  ↓
Membership / Tenant Context
  ↓
Authorization
```

The exact authentication library and credential model must be finalized before implementation and recorded in an ADR.
