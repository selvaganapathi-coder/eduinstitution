# ADR-003 — Authentication Architecture

## Status
Proposed

## Context

The system requires centralized authentication for administrative and academic users and must establish trusted identity before authorization and tenant resolution.

## Decision

Authentication will be centralized and server-enforced. The specific authentication library and credential model remain a bootstrap decision and must be verified against Next.js 16 and Cloudflare Workers before implementation.

## Required Outcomes

- Secure login/logout.
- Session lifecycle.
- Password reset/security policy as required.
- Account status handling.
- A trusted authenticated user context for authorization.

## Consequence

No business feature should implement its own authentication logic.
