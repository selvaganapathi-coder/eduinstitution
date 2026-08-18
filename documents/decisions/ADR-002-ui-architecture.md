# ADR-002 — UI Architecture

## Status
Accepted

## Context

The product is a data-heavy education management system with many forms, tables, filters, dialogs, uploads, and administrative workflows. The target users include non-technical and older college staff.

## Decision

Use Ant Design 5 as the primary UI component system. Integrate it with the Next.js App Router using the official Ant Design Next.js registry approach. Tailwind may remain available for limited layout/custom styling needs, but it is not the primary component architecture.

Use a centralized application theme for the project brand colors.

## Brand Tokens

- `#06231D` — deepest green
- `#0C342C` — dark green
- `#076653` — primary green
- `#E3EF26` — lime accent
- `#E2FBCE` — light green surface
- `#FFFDEE` — warm application background

## Consequences

Positive:
- Strong enterprise component coverage.
- Consistent forms and tables.
- Less custom UI code.
- Familiar administrative interaction patterns.

Constraint:
- Ant Design must be themed so the product does not look like an unmodified default Ant Design application.
