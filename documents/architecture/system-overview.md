# System Architecture

## Current State

The repository is a clean Next.js starter. The application has no business modules, database integration, authentication, authorization, R2 integration, or Cloudflare deployment configuration yet.

## Target Architecture

```text
Browser
  ↓
Cloudflare Workers / OpenNext
  ↓
Next.js App Router
  ├── Ant Design UI
  └── Server-side application logic
        ├── Authentication
        ├── Authorization / RBAC
        ├── Tenant context
        ├── Services
        ├── Prisma
        │     ↓
        │   Neon PostgreSQL
        └── R2 storage access
              ↓
          Cloudflare R2
```

## Architectural Style

Start as a modular monolith. Do not introduce microservices, message brokers, CQRS, event sourcing, or additional databases without a verified project requirement and an ADR.

## Runtime Boundary

Server-side code owns authentication, authorization, tenant resolution, business rules, database access, and secure storage access. Client components are used only where browser interactivity is required.

## Development Principle

Implement one vertical slice at a time. Each slice should contain the necessary data model, business logic, authorization, API/server interaction, UI, validation, testing, and documentation.
