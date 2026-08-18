# ADR-006 — Cloudflare R2 Storage

## Status
Accepted

## Context

The application will handle student and institutional documents. Large binary objects should not be stored in PostgreSQL.

## Decision

Use Cloudflare R2 for object storage and PostgreSQL for object metadata and ownership relationships.

Sensitive files should be private by default. Authorized temporary access or direct upload flows may use presigned URLs.

## Consequences

- PostgreSQL remains focused on relational data.
- R2 handles large objects.
- Authorization must occur before issuing access to protected files.
- Storage keys must preserve trusted institution boundaries.
