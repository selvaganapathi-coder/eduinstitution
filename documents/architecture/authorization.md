# Authorization Architecture

## Status

PLANNED / NOT IMPLEMENTED.

## Principles

Authorization must be enforced server-side. Frontend visibility is only a usability concern and is never the security boundary.

## Model

```text
User
  ↓
Institution Membership
  ↓
Role
  ↓
Permissions
```

Permissions should be represented as capabilities such as `students.view`, `students.create`, and `students.update` rather than scattered role checks throughout the UI.

## Tenant Isolation

For multi-institution operation, every protected request must resolve a trusted institution context from authenticated membership before querying tenant-owned data.

A client-provided `tenantId` or `institutionId` must never be treated as sufficient authorization evidence.
