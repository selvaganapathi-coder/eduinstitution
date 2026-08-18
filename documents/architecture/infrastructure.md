# Infrastructure Architecture

## Deployment Target

Cloudflare Workers with the OpenNext deployment model is the intended target for the Next.js application, subject to repository-level compatibility verification.

## Components

- Next.js application
- Cloudflare Workers / OpenNext
- Neon PostgreSQL
- Cloudflare R2
- GitHub source control

## Environment Separation

The project should support separate development, preview/test, and production environments. Secrets must be supplied through environment configuration and must never be committed to Git.

## Compatibility Principle

Before adopting a package in application code, verify that it is compatible with the actual Next.js and Cloudflare runtime used by the repository. Do not assume Node.js-only behavior is available in Workers.
