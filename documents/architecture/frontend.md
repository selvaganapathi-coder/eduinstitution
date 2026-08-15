# Frontend Architecture

## Framework

The repository currently uses Next.js 16.3.1, React 19.2.8, and TypeScript. We will keep the existing Next.js version unless compatibility verification requires a deliberate change.

## UI System

Ant Design 5 is the planned primary component system. Tailwind CSS is currently present in the starter repository but will not be the primary application component architecture.

## Rendering

Prefer Server Components for server-rendered/data-oriented screens. Use Client Components only for genuinely interactive browser behavior such as form state, interactive tables, dialogs, uploads, and controls that require browser APIs.

## UI Principles

- Simple and familiar ERP workflows.
- Readable typography.
- Large, clear actions.
- No icon-only primary actions.
- Mobile-first responsive behavior.
- Avoid unnecessary animation and visual trends.

## Brand Tokens

- Primary: `#076653`
- Deep: `#0C342C`
- Darkest: `#06231D`
- Accent: `#E3EF26`
- Light surface: `#E2FBCE`
- Application background: `#FFFDEE`

These values must be centralized in the application theme rather than scattered through components.
