# ADR-0074: Shared Shimmer Utility Module Convention for @hbc/ui-kit

**Status:** Accepted  
**Date:** 2026-03-07  
**Blueprint Reference:** §2c — ui-kit shared utilities  
**Foundation Plan Reference:** PH4C.7  
**Decision References:** D-PH4C-03, D-PH4C-05, D-PH4C-06

## Context

Multiple components in @hbc/ui-kit require loading skeleton animations:
- **HbcDataTable**: Virtual table with row placeholders during data fetch
- **HbcCommandPalette**: AI response shimmer while processing

Without a shared convention, shimmer animation code is duplicated across components, causing:
- Visual inconsistency (animation speed, colors, behavior vary per component)
- Maintenance burden (updating animation must be done in multiple places)
- Inaccessibility (each component must independently implement prefers-reduced-motion)
- Bundle bloat (same CSS keyframes emitted multiple times)

## Decision

### Centralized Shimmer Styles

All shimmer loading animations in @hbc/ui-kit are defined in `packages/ui-kit/src/shared/shimmer.ts`
and exported via the `useShimmerStyles` makeStyles hook. No component may define its own shimmer
keyframe animation or class names.

### Shared Module Convention

The `packages/ui-kit/src/shared/` directory is the approved location for makeStyles hooks that
are **consumed by 2+ components**. Single-component makeStyles remain in the component directory.

### Accessibility Requirements

All shimmer styles include:
- `@media (prefers-reduced-motion: reduce)` to disable animation for motion-sensitive users
- `@media (forced-colors: active)` for Windows High Contrast Mode support
- Components using shimmer must add `aria-busy="true"` and `aria-label` to the container

## Consequences

1. **Consistency**: All shimmer animations use the same duration (1.5s), timing function (linear),
   and color gradient across the application.

2. **Maintenance**: Animation updates are made in one place (`shared/shimmer.ts`), automatically
   propagating to all consuming components.

3. **Accessibility**: Prefers-reduced-motion handling is guaranteed via the shared styles; no
   component can accidentally bypass it.

4. **Future Utilities**: Any new cross-component utility follows the same pattern:
   create in `shared/`, export via barrel, consume in 2+ components.

5. **Bundle Impact**: Griffel's atomic CSS extraction keeps shimmer declarations de-duplicated
   in output CSS even when multiple components consume the shared classes.

## Alternatives Considered

1. **Inline shimmer styles in each component** — Rejected due to duplication and maintenance burden.
2. **Global CSS file with shimmer keyframes** — Rejected because it bypasses Griffel conventions.
3. **Animation utility library** — Rejected as unnecessary complexity for current scope.

## Validation

- [x] HbcDataTable migrated to use `useShimmerStyles`
- [x] HbcCommandPalette migrated to use `useShimmerStyles`
- [x] `shared/` directory created with barrel export
- [x] Prefers-reduced-motion handling included in shared utility
- [x] Forced-colors support included in shared utility
- [x] Storybook build/test verification completed for ui-kit

## References

- `packages/ui-kit/src/shared/shimmer.ts` — Implementation
- `packages/ui-kit/src/shared/index.ts` — Barrel export
- `packages/ui-kit/src/HbcDataTable/index.tsx` — Consumer example
- `packages/ui-kit/src/HbcCommandPalette/index.tsx` — Consumer example
- `docs/architecture/plans/PH4C.7-Shimmer-Infrastructure.md` — Governing plan
