# ADR-0075: Dev Auth Bypass — @hbc/auth MockAdapter in Storybook

**Status:** Accepted
**Date:** 2026-03-07
**Blueprint Reference:** §4e — dev-harness and Storybook integration
**Foundation Plan Reference:** PH4C.9 (Storybook MockAdapter Integration)
**Decision References:** D-PH4C-15, D-PH4C-16

## Context

@hbc/ui-kit components that depend on authentication context (e.g., HbcAppShell, HbcUserMenu,
HbcHeader, HbcCommandPalette, HbcSidebar permission-gated sections) cannot be properly previewed
in Storybook without a consistent auth/session state.

This creates friction for UI development:
- Developers manually mock auth state per story
- Accessibility verification becomes unreliable when auth hooks/stores are uninitialized
- Auth-dependent UI states are slower and more error-prone to test

## Decision

### MockAdapter Integration in Storybook

`@hbc/auth` `MockAdapter` is integrated into Storybook's global preview decorator. The decorator
initializes `@hbc/auth` Zustand stores (`useAuthStore`, `usePermissionStore`) so all stories run
with the same mock HB Intel user by default.

### Implementation Architecture

```text
packages/ui-kit/
├── .storybook/
│   ├── preview.tsx                           (register withMockAuth decorator)
│   ├── mockAuth.ts                           (mock personas)
│   └── decorators/
│       └── withMockAuth.tsx                  (MockAdapter bootstrap + guard)
├── package.json                              (@hbc/auth kept in dependencies)
└── src/
    └── HbcAppShell/HbcSidebar.tsx            (runtime usePermission() from @hbc/auth)
```

### Boundary Rules

1. **Runtime Dependency Classification**
   - `@hbc/auth` remains in `dependencies` of `@hbc/ui-kit/package.json` (intentional).
   - `HbcSidebar` uses `usePermission()` at runtime, so demoting to dev-only would break consumers.
   - Storybook bypass scope is enforced at file level in `.storybook/`.

2. **Guard Against Production**
   - `withMockAuth` includes production guards (`process.env.NODE_ENV` / `import.meta.env.PROD`).
   - If executed in production context, decorator becomes no-op (`<Story />`).

3. **No Production Exports of Mock Data**
   - `STORYBOOK_MOCK_USER` and related personas live only under `.storybook/`.
   - No mock auth symbols are exported from `packages/ui-kit/src/index.ts`.
   - CI checks verify mock identifiers are absent from `dist/`.

4. **Bundle Integrity Enforcement**
   - Build checks verify mock user identifiers do not appear in `packages/ui-kit/dist`.
   - Presence of `@hbc/auth` in runtime bundle is expected due to legitimate runtime imports.

## Consequences

### Positive
1. **Developer Experience** — Auth-dependent stories work without per-story setup.
2. **A11y Reliability** — Storybook accessibility checks run against initialized auth state.
3. **Consistency** — One mock user/persona baseline for all story contexts.
4. **Isolation** — Storybook-only mocking stays out of production sources/exports.

### Constraints
1. Storybook decorator must track `@hbc/auth` API evolution.
2. Mock personas must remain representative of real permission models.
3. Review discipline is required to prevent `.storybook` imports from `src/`.

## Alternatives Considered

1. **No global MockAdapter decorator** — Rejected due to repeated per-story setup.
2. **Move `@hbc/auth` to devDependencies only** — Rejected due to runtime `usePermission()` usage.
3. **Custom Storybook auth shim** — Rejected because it duplicates auth package logic.

## Validation

- [x] MockAdapter API reviewed for current package shape
- [x] Storybook mock auth module created (`mockAuth.ts`)
- [x] Global decorator created (`withMockAuth.tsx`)
- [x] Decorator registered in `.storybook/preview.tsx`
- [x] Build/type-check/lint/storybook validations executed
- [x] Mock identifiers verified absent in production `dist/`

## Enforcement

### Code-Level

```typescript
if (process.env.NODE_ENV === 'production' || import.meta.env?.PROD) {
  return <Story />;
}
```

### CI-Level

```bash
pnpm --filter @hbc/ui-kit build
! grep -r "STORYBOOK_MOCK_USER\|storybook-dev-user-001\|hbcorp-dev-tenant" packages/ui-kit/dist
```

### Review-Level

- Reject imports from `.storybook/*` into `packages/ui-kit/src/*`.
- Require boundary verification whenever Storybook auth files change.

## References

- `packages/ui-kit/.storybook/mockAuth.ts` — Mock user configuration
- `packages/ui-kit/.storybook/decorators/withMockAuth.tsx` — Decorator implementation
- `packages/ui-kit/.storybook/preview.tsx` — Decorator registration
- `packages/auth/src/adapters/MockAdapter.ts` — Adapter implementation
- `docs/architecture/plans/PH4C.9-DevAuthBypass-Storybook.md` — Governing plan

## Decision Log

**Approved:** 2026-03-07
- Decision: Wire `@hbc/auth` MockAdapter into Storybook decorator path
- Justification: Reliable auth-dependent story rendering and accessibility verification
- Risk: Storybook-only state leaking into production (mitigated by file-level boundary + guard checks)
- Owner: UI Architecture Lead
