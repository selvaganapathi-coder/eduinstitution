# UI Design System

## Design Direction

EduInstitution uses a **Google-inspired enterprise interface**: familiar, clean, calm, accessible, and information-first.

This is a design direction, not a reproduction of Google branding or proprietary assets.

## Core Principles

1. Clarity before decoration.
2. Familiar patterns before custom interactions.
3. One obvious primary action per screen.
4. Short labels and plain language.
5. Strong information hierarchy.
6. Generous whitespace without wasting screen space.
7. Consistent navigation across modules.
8. Mobile-first responsive behavior.
9. Accessible contrast and keyboard/focus behavior.
10. Reusable components rather than page-specific styling.

## Visual Language

### Base palette

Use the established product identity as the brand layer, while following Google's restrained interaction language:

- Primary dark green: `#06231D`
- Secondary green: `#0C342C`
- Action green: `#076653`
- Accent lime: `#E3EF26`
- Soft green surface: `#E2FBCE`
- Warm surface: `#FFFDEE`
- Neutral page background: `#F8F9FA`
- Text primary: `#202124`
- Text secondary: `#5F6368`
- Border: `#DADCE0`
- Focus/action blue for utility links where appropriate: `#1A73E8`

Green remains the product identity. Blue may be used sparingly for familiar links and secondary navigation cues.

## Typography

- Large page title: clear, restrained weight.
- Section title: medium weight.
- Body: readable and neutral.
- Metadata: smaller, muted, never the main information.
- Avoid excessive uppercase text.
- Avoid dense decorative typography.

## Layout

Desktop:

```text
Global shell
├── Sidebar / primary navigation
├── Header / page context
└── Main content
    ├── Breadcrumbs
    ├── Page title + description
    ├── Primary action area
    └── Content sections
```

Mobile:

```text
Mobile header
└── Page context
    ├── Breadcrumb / back affordance
    ├── Page title
    ├── Primary action
    └── Stacked content
```

## Component Rules

### Cards

Use cards for grouping related information, not for every individual field.

Preferred:

- white surface
- subtle border
- minimal shadow
- consistent radius
- clear heading

Avoid:

- excessive gradients
- heavy shadows
- decorative cards with no function
- multiple competing primary buttons

### Forms

- Label every field.
- Use familiar field names.
- Explain unusual fields with short helper text.
- Show validation near the field.
- Keep forms vertically ordered on mobile.
- Place the primary action at the end on mobile unless a sticky action is materially better.
- Preserve user input when validation fails.

### Tables

Desktop tables may use columns and controls.

On mobile, do not force users to horizontally scroll for routine workflows. Transform rows into readable cards or prioritized stacked fields when the data permits.

### Navigation

Every module should have:

- global entry point
- module landing route
- local navigation for related subroutes
- breadcrumbs on deeper pages
- clear active state

Do not expose routes for capabilities that do not exist.

## Content Rules

User-facing content must answer:

1. What is this page?
2. What can I do here?
3. What should I do next?

Examples:

Bad:

`Tenant Configuration`

Better:

`Institution profile`

Bad:

`Mutation failed`

Better:

`We couldn't save the institution details. Try again.`

Bad:

`CRUD`

Better:

`Add`, `Edit`, `Archive`

## Empty States

Every list/management page must have a meaningful empty state:

- what is empty
- why it matters
- primary next action
- optional short guidance

## Loading States

Use skeletons or meaningful loading indicators that preserve layout. Avoid full-page spinners for small operations.

## Error States

Errors must:

- explain the problem in user language
- avoid exposing internal implementation details
- identify the next action where possible
- distinguish validation, permission, and temporary server errors

## Responsive Breakpoints

Design mobile-first and progressively enhance for larger screens.

Minimum expectations:

- phone portrait
- phone landscape
- tablet
- desktop
- large desktop

No fixed-width content that breaks on small screens.

## Accessibility

Every feature should consider:

- semantic HTML
- keyboard navigation
- visible focus
- sufficient color contrast
- accessible labels
- screen-reader-friendly states
- touch-friendly controls

## Design Review Checklist

Before a UI task is considered complete:

- [ ] Page purpose is immediately clear.
- [ ] Primary action is obvious.
- [ ] Labels use familiar language.
- [ ] Content hierarchy is easy to scan.
- [ ] Empty/loading/error states exist.
- [ ] Desktop layout is clean.
- [ ] Mobile layout is intentionally designed.
- [ ] No unnecessary visual decoration.
- [ ] Navigation/route flow is obvious.
- [ ] Accessibility basics are satisfied.
