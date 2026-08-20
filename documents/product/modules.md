# Product Modules

The product is a multi-tenant education platform. Modules are shared where possible and configurable by institution type.

| Module | Status | Institution Scope | Notes |
|---|---|---|---|
| Authentication | Completed | All | Foundation dependency |
| Authorization / RBAC | Completed | All | Server-side enforcement |
| Institution | Completed | All | Tenant boundary and profile |
| Institution Type / Capability Configuration | Planned | All | Enables school, pharmacy, engineering, arts, university and other variants without separate products |
| Academic Year / Term | Planned | Most | Configurable terminology and calendar structure |
| Departments / Programs / Courses | Planned | Colleges / universities / training | Configurable academic structure |
| Classes / Sections | Planned | Schools and selected institutions | Institution-type capability |
| Students | Planned | All | Core business module |
| Guardians / Parents | Planned | Schools and optional elsewhere | Configurable |
| Faculty / Staff | Planned | All | Core business module |
| Subjects / Curriculum | Planned | All academic institutions | Configurable by program and institution type |
| Attendance | Planned | All | Supports theory, practical, clinical and other session types |
| Timetable | Planned | All | Configurable periods, rooms, labs and sessions |
| Examinations | Planned | All academic institutions | Configurable exam/assessment models |
| Results / Report Cards | Planned | All academic institutions | Terminology varies by institution type |
| Fees / Payments | Planned | All | Financial module |
| Documents | Planned | All | Cloudflare R2 integration |
| Notifications | Planned | All | Users and event driven |
| Reports / Analytics | Planned | All | Dependent on operational modules |
| Pharmacy-specific Academic Extensions | Planned | Pharmacy | Programs, practical/clinical training and related records |
| Engineering-specific Academic Extensions | Planned | Engineering | Departments, labs, regulations, projects/internships and related records |
| Arts & Science Extensions | Planned | Arts & Science | UG/PG programs, electives, papers and related records |
| School Extensions | Planned | School | Classes, sections, guardians, report cards and related records |
| Polytechnic / Vocational Extensions | Planned | Polytechnic / Vocational | Trades, workshops, practical and competency records |
| University Extensions | Planned | University | Faculty/program structures and institution-specific academic workflows |
| Student Portal | Planned | Configurable | Later phase |
| Faculty Portal | Planned | Configurable | Later phase |

## Architecture Rule

Institution-specific modules must extend the common platform rather than fork it.

A new institution category should primarily select:

- capabilities
- terminology
- configuration
- role/permission policy
- module-specific extensions

It should not require a separate authentication, tenancy, navigation shell, or user model.

No business module should be implemented without a feature plan that defines its fields, flow, routes, permissions, institution-type behavior, UI content, mobile behavior, tests, and database impact.
