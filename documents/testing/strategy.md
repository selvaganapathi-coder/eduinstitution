# Testing Strategy

## Foundation Checks

Every foundation change should be validated with:

- TypeScript type checking where configured.
- ESLint.
- Production build.
- Relevant unit/integration tests.

## Feature Checks

Each vertical slice must include meaningful tests for:

- Functional behavior.
- Validation.
- Authorization.
- Tenant isolation where applicable.
- Error handling.
- Important responsive behavior.

## Security Regression

Protected operations must verify that:

- Unauthenticated users cannot access them.
- Users without permission cannot perform protected actions.
- One institution cannot access another institution's data.
- Sensitive fields/files are not exposed unnecessarily.

## Quality Principle

Test behavior, not test count. Do not add low-value tests merely to increase coverage numbers.
