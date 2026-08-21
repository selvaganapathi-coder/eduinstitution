# UI Design System

## Design Direction

EduInstitution uses a **Google-inspired application style**: clean, simple, calm, familiar, accessible, and focused on helping people complete work quickly.

This is a usability and visual-language reference, not a reproduction of Google branding or proprietary assets.

## Core Principles

1. Make the page understandable in a few seconds.
2. Use familiar patterns instead of custom interactions.
3. Give each screen one clear main action.
4. Use simple words that teachers, students, parents, staff, and administrators can understand.
5. Show important information first.
6. Use whitespace to separate information clearly.
7. Keep navigation consistent across the whole product.
8. Design for phones first, then expand for larger screens.
9. Keep text and controls accessible and easy to read.
10. Reuse the same components and interaction patterns across modules.

## Brand + Google-Inspired Visual Language

Google-style usability is the interaction reference. **EduInstitution's brand colors remain the product identity.**

### Brand colors

- Brand dark: `#06231D`
- Brand green: `#0C342C`
- Primary action: `#076653`
- Brand accent: `#E3EF26`
- Soft brand surface: `#E2FBCE`
- Warm surface: `#FFFDEE`

### Application neutrals

Use neutral application colors for most of the interface, similar to modern Google applications:

- Page background: `#F8F9FA`
- Surface: `#FFFFFF`
- Primary text: `#202124`
- Secondary text: `#5F6368`
- Border: `#DADCE0`
- Hover surface: `#F1F3F4`
- Focus/link blue: `#1A73E8`
- Success: `#188038`
- Warning: `#F9AB00`
- Error: `#D93025`

### Color usage rule

Do not make every component green.

Use:

- **Brand green** for product identity and important primary actions.
- **Neutral white/gray** for most surfaces, navigation, forms, tables, and content areas.
- **Brand lime** only for selected emphasis or product highlights.
- **Blue** for familiar links, navigation cues, and utility actions when it improves recognition.
- **Semantic colors** only for status, success, warning, and error.

The result should feel like a clean Google-style application while remaining visibly EduInstitution.

## Typography

Typography must prioritize readability over decoration.

- Page title: short, clear, normal/medium weight.
- Section title: concise and easy to scan.
- Body text: plain language and comfortable line height.
- Helper text: short and muted.
- Metadata: small and secondary.
- Avoid excessive uppercase text.
- Avoid decorative typography.
- Avoid technical jargon in user-facing content.

## Plain-Language Content Standard

Write for a person who is using the system for the first time.

### Prefer

- `Institution profile`
- `Add student`
- `Edit details`
- `Save changes`
- `Cancel`
- `Delete`
- `Archive`
- `Search students`
- `Choose academic year`
- `You don't have permission to change this.`
- `We couldn't save the details. Try again.`

### Avoid

- `Tenant Configuration`
- `CRUD`
- `Mutation failed`
- `Execute`
- `Payload`
- `Entity`
- `Resource`
- `Invalid request` when a clearer explanation is possible

Technical terms may appear in developer documentation, API contracts, logs, and architecture documents. They should not appear unnecessarily in normal user-facing screens.

## Screen Structure

Every major screen should follow a predictable structure.

### Desktop

```text
Global application shell
├── Primary navigation
├── Header / page context
└── Main content
    ├── Breadcrumbs when needed
    ├── Page title
    ├── One-sentence explanation
    ├── Primary action
    └── Content sections
```

### Mobile

```text
Mobile header
├── Back / menu
├── Page title
└── Main content
    ├── Short explanation
    ├── Primary action
    └── Stacked sections
```

## Navigation

Every module must provide a clear route hierarchy.

Example:

```text
Dashboard
  ↓
Institution
  ├── Overview
  └── Profile
```

For deeper modules:

```text
Dashboard
  ↓
Students
  ├── All students
  ├── Add student
  └── Student profile
```

Rules:

- One obvious global entry point.
- A module landing page before deep management screens where useful.
- Breadcrumbs for deeper routes.
- Clear active navigation state.
- Back navigation on mobile where appropriate.
- Never show a navigation item for a capability the institution cannot use.

## Cards

Cards are for grouping related information, not decorating every field.

Preferred:

- white surface
- thin neutral border
- subtle radius
- little or no shadow
- clear heading
- meaningful content

Avoid:

- heavy shadows
- gradients everywhere
- decorative cards with no action or information
- multiple competing primary buttons

## Forms

Forms should be easy to understand without training.

Every field must have:

- clear label
- familiar name
- useful placeholder only when needed
- short helper text when necessary
- inline validation

Rules:

- Group related fields.
- Keep the order natural.
- Use sensible defaults.
- Preserve entered values after validation errors.
- Put the primary action at the bottom of the form on mobile.
- Avoid unnecessarily long forms; split complex workflows into logical steps.

## Lists and Tables

Desktop may use tables when comparison is useful.

On mobile:

- prioritize the most important information
- convert rows to cards when appropriate
- use expandable details where useful
- avoid forcing routine workflows into horizontal scrolling

Every list should support appropriate:

- search
- filter
- sort
- empty state
- loading state
- error state

Only include controls that are actually needed for that screen.

## Empty States

Every management/list page must explain:

1. What is empty?
2. Why does it matter?
3. What should the user do next?

Example:

> No students yet
>
> Add your first student to start managing attendance, classes, and results.
>
> **Add student**

## Loading States

Use skeletons or local loading indicators that preserve the page layout.

Avoid replacing the entire application with a spinner for a small operation.

## Error States

Errors must use normal user language.

Explain:

- what happened
- whether the user's data was saved
- what they should do next

Example:

> We couldn't save the student details.
> Check the highlighted fields and try again.

Never expose stack traces, SQL errors, internal identifiers, or implementation details to normal users.

## Success States

After a successful action:

- confirm what happened
- keep the user in the expected workflow
- provide the next useful action where appropriate

Example:

> Student added successfully.
>
> **View student**

## Responsive Design

Design mobile-first and progressively enhance for:

- phone portrait
- phone landscape
- tablet
- desktop
- large desktop

Requirements:

- no fixed-width content that breaks on phones
- touch-friendly controls
- readable text without zooming
- stacked forms on narrow screens
- accessible mobile navigation
- appropriately sized action buttons
- no accidental horizontal overflow
- tables transformed where appropriate

## Accessibility

Every feature should include:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient color contrast
- accessible labels
- screen-reader-friendly status messages
- touch-friendly controls
- meaningful button labels

Color must never be the only way to communicate status.

## Component Consistency

Prefer shared components for:

- page headers
- breadcrumbs
- buttons
- form fields
- alerts
- cards
- tables
- empty states
- loading states
- confirmation dialogs
- mobile navigation
- module navigation

A new module should look like part of the same product without needing to learn a new interface.

## Design Review Checklist

Before a UI task is complete:

- [ ] A new user can understand the page quickly.
- [ ] Plain-language labels are used.
- [ ] The main action is obvious.
- [ ] Brand colors are used intentionally, not everywhere.
- [ ] Neutral Google-inspired application styling is maintained.
- [ ] Navigation and route flow are obvious.
- [ ] Breadcrumbs/local navigation are present where needed.
- [ ] Empty state exists.
- [ ] Loading state exists.
- [ ] Error state exists.
- [ ] Success state exists where appropriate.
- [ ] Desktop layout is clean.
- [ ] Mobile layout is intentionally designed.
- [ ] No unnecessary decoration.
- [ ] Accessibility basics are satisfied.
- [ ] Shared components are reused where appropriate.
