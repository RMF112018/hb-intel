# ADR-0054: Dev Auth Bypass — @hbc/auth MockAdapter in Storybook

**Status:** Accepted
**Date:** 2026-03-07
**Blueprint Reference:** §4e — dev-harness and Storybook integration
**Foundation Plan Reference:** PH4C.9

## Context

@hbc/ui-kit components that depend on authentication context (e.g., HbcUserMenu, HbcAppShell)
cannot be properly previewed in Storybook without a real auth session. This creates friction
for UI development and blocks reliable accessibility verification in Storybook.

Developers must either:
- Mock the entire auth context manually in every affected story
- Use a real MSAL session (slow, requires Azure AD setup)
- Skip testing auth-dependent components in Storybook

## Decision

### MockAdapter Integration

@hbc/auth (from Phase 5) is added as a **devDependency** of @hbc/ui-kit for Storybook use only.
The MockAdapter is wired into Storybook's global preview decorator to provide all stories
with a consistent mock HB Intel user context.

### Implementation

1. `@hbc/auth` added to `packages/ui-kit/package.json` devDependencies
2. Storybook preview (`packages/ui-kit/.storybook/preview.tsx`) includes a global `withMockAuth` decorator
3. MockAdapter initialized with a mock HB Intel user (roles, email, avatar)
4. Decorator guards against production environment activation

### Boundary Rules

1. **devDependency Only** — @hbc/auth must never appear in @hbc/ui-kit's production dependencies
   or production bundle. Verified by CI bundle size check.

2. **Guard Against Production** — The `withMockAuth` decorator includes environment check:
   ```typescript
   if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
     return <Story />;
   }
   ```

3. **No Production Exports** — MockAdapter configuration and STORYBOOK_MOCK_USER are
   internal to Storybook; they are **not** exported from @hbc/ui-kit's barrel.

4. **Bundle Analysis Enforcement** — CI pipeline includes a bundle-check task that
   fails if @hbc/auth is detected in production bundles.

## Consequences

1. **Developer Experience** — All 44 ui-kit component stories render auth-dependent states
   without real MSAL/SPFx auth, speeding up local development.

2. **Reliable A11y Testing** — Storybook accessibility addon can test auth-dependent components
   without network or auth setup, enabling confident verification.

3. **Consistent Mock User** — All stories see the same mock persona (same name, roles, avatar),
   ensuring reproducible story states across developers.

4. **Bundle Safety** — The devDependency boundary is enforced; @hbc/auth cannot accidentally
   leak into production builds.

5. **Maintenance Burden** — If @hbc/auth's MockAdapter API changes, Storybook integration must
   be updated. This is low overhead (1 file: preview.tsx).

## Alternatives Considered

1. **No MockAdapter in Storybook** — Rejected; this forces developers to use real auth
   or manually mock, both costly.

2. **Full @hbc/auth as production dependency** — Rejected; violates the ui-kit's lean dependency
   model and bloats production bundles.

3. **Custom mock auth provider** — Rejected; duplicates @hbc/auth's MockAdapter and creates
   maintenance burden.

## Validation

- [x] MockAdapter added to @hbc/auth package (Phase 5)
- [x] Global decorator implemented in Storybook preview
- [x] All auth-dependent stories render without errors
- [x] Bundle analysis confirms no @hbc/auth in production build
- [x] Environment guard tested (production build skips decorator)
- [x] devDependency confirmed in package.json

## Enforcement

- **CI Gate:** Bundle size check fails if `@hbc/auth` is imported in production code paths
- **Code Review:** PRs adding new @hbc/auth imports to ui-kit production code are rejected
- **Documentation:** This ADR is linked in `docs/how-to/developer/phase-4c-storybook-guide.md`

## References

- `packages/ui-kit/package.json` — devDependency declaration
- `packages/ui-kit/.storybook/preview.tsx` — Global decorator
- `packages/ui-kit/.storybook/mockAuth.ts` — Mock user configuration
- `packages/auth/src/adapters/MockAdapter.ts` — MockAdapter implementation (Phase 5)
