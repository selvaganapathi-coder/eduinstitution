# Institution Type Strategy

## Objective

EduInstitution must support multiple institution categories without redesigning the core product for each category.

Initial target categories:

- School
- College / University
- Pharmacy College
- Engineering College
- Arts & Science College
- Polytechnic
- Training / Vocational Institute
- Coaching / Learning Institute
- Other education institutions that fit the common education model

## Core Principle

The platform has one **institution/tenant core**. Institution category changes configuration, terminology, enabled modules, workflows, fields, and permissions; it must not create a separate application or separate authentication model.

```text
Tenant / Institution
        |
        +-- institutionType
        |
        +-- enabledModules
        |
        +-- configuration
        |
        +-- terminology
        |
        +-- academic structure
        |
        +-- role / permission policy
        |
        +-- feature settings
```

## Do Not Hard-Code Category Logic Into Shared Entities

Avoid patterns such as:

```ts
if (institution.type === "PHARMACY") { ... }
```

inside every business component.

Prefer capability/configuration boundaries:

```text
Institution Type
    -> Capability Registry
    -> Module Configuration
    -> Field Configuration
    -> Workflow Configuration
```

Category-specific behavior belongs inside the relevant module/capability boundary.

## Common Foundation Across All Institution Types

Every institution can use the shared foundation:

- Identity and profile
- Authentication
- Tenant isolation
- Users and memberships
- Roles and permissions
- Academic years / terms
- Departments or organizational units
- Programs / courses
- Subjects / curriculum
- Students
- Faculty / staff
- Attendance
- Timetable
- Examinations
- Results
- Fees / payments
- Documents
- Notifications
- Reports

A specific institution type may enable only the capabilities it needs.

## Category Examples

### School

Potential terminology/configuration:

- Classes
- Sections
- Subjects
- Academic terms
- Students
- Teachers
- Parents/guardians
- Attendance
- Exams
- Report cards

### Engineering College

Potential specialization:

- Departments
- Programs
- Regulation / curriculum version
- Semesters
- Courses
- Laboratories
- Practical sessions
- Internal assessment
- University examination mapping
- Projects / internships

### Pharmacy College

Potential specialization:

- B.Pharm / M.Pharm / Pharm.D programs
- Departments
- Semester structure
- Theory / practical subjects
- Laboratory allocation
- Clinical / hospital training where applicable
- Internship / practical training
- PCI-related academic records where required

### Arts & Science College

Potential specialization:

- Departments
- UG / PG programs
- Semester structure
- Courses / papers
- Internal assessment
- Electives
- Projects
- University examination mapping

### Polytechnic / Vocational

Potential specialization:

- Trades / programs
- Terms / semesters
- Workshops / practicals
- Competency-oriented records
- Internship / apprenticeship where applicable

## Field Strategy

Shared entities should contain only universally meaningful fields.

Category-specific fields should use one of these strategies, in order of preference:

1. A proper module-specific relational entity when the data is important and queryable.
2. A configuration table for institution-defined metadata.
3. A typed extension mechanism when a stable optional field set is justified.
4. JSON only for genuinely flexible, low-query configuration—not as a replacement for relational design.

## Future-Proofing Requirement

Before implementing a new module, explicitly answer:

- Is this common to all institution types?
- Is this category-specific?
- Is the field academic, operational, financial, or configuration data?
- Should it be relational/queryable?
- Can another institution type reuse it with different terminology?
- What happens when a new institution type is added later?

## Acceptance Rule

A new institution type must be addable primarily through configuration/capability definitions and module-specific extensions, without rewriting authentication, tenancy, navigation shell, shared users, or core authorization.
