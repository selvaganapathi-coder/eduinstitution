# TASK-011 — Institution Types & Capabilities

## Status
Completed and merged.

## Source of record
- Pull request: #56
- Merge commit: `f6359ef2d69430af7a013590cf635fcadf958dbc`
- Title: `Task 011 institution types capabilities v2`

## Objective
Add institution type and capability management so institution configuration can drive reusable product behavior across different education institution types.

## Completed scope
- Institution type support and capability relationships in the data model.
- Tenant institution type assignment and update flow.
- Institution type listing and detail APIs.
- Capability management for institution types.
- Permission-protected institution type and capability operations.
- Active institution type validation.
- Institution type and capability UI integration.
- Institution settings integration.
- Development seed updates.
- Production-safe API error handling for authentication, authorization, tenant access, validation, and server failures.
- Supporting UI refinements and loading/authorization corrections included in the merged task.

## Authorization and tenant behavior
- Tenant context is required for tenant-scoped institution type access.
- Institution type updates require `institution:update` permission.
- Institution type viewing requires `institution_type:view` permission.
- Capability management requires `institution_capability:manage` permission.
- Invalid or unavailable institution types are rejected.

## Preserved principles
- Existing tenant isolation remains server-side.
- Authorization remains permission-based.
- API responses use user-facing error messages.

## Outcome
TASK-011 established the institution-type and capability foundation used to support reusable academic structures across different institution categories.
