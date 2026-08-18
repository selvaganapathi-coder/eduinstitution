# Storage Architecture

## Object Storage

Cloudflare R2 is the selected object storage platform.

## Use Cases

R2 is intended for large or binary objects such as:

- Student documents
- Certificates
- Mark sheets
- Assignments
- College documents
- Generated reports and PDFs

## Metadata

PostgreSQL stores metadata such as ownership, institution, object key, file name, MIME type, size, uploader, and timestamps.

## Security Model

Sensitive objects must not be publicly exposed by default. Access should follow:

```text
Authenticated user
  ↓
Permission check
  ↓
Institution check
  ↓
Object ownership/access check
  ↓
Short-lived authorized access
```

Presigned URLs may be used for temporary object access and direct browser uploads when appropriate.

## Object Key Principle

Object keys should include a trusted institution boundary and stable entity/document identifiers. Client-provided tenant identifiers must never be trusted for authorization.
