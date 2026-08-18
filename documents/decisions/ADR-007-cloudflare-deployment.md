# ADR-007 — Cloudflare Deployment

## Status
Proposed

## Context

The application is planned for Cloudflare infrastructure while using Next.js App Router, server-side application logic, Prisma, Neon, and R2.

## Decision

Target Cloudflare Workers using the OpenNext deployment model for the full-stack Next.js application. Verify the exact Next.js 16 compatibility and build configuration during TASK-000 before treating deployment as complete.

## Consequences

- The runtime is edge-oriented and package compatibility must be verified.
- Node.js-only assumptions must not be introduced without runtime validation.
- Database and authentication choices must work in the selected Cloudflare runtime.
