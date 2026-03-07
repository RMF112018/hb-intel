# ADR-0053: Shared Shimmer Utility Convention

**Status:** Accepted
**Date:** 2026-03-07
**Blueprint Reference:** §2c — ui-kit component consistency and accessibility
**Foundation Plan Reference:** PH4C.7

## Context

PH4C.7 identified duplicated shimmer keyframes and inconsistent loading-state animation
implementations across ui-kit components. Divergent shimmer implementations created maintenance
risk, accessibility drift, and inconsistent perceived performance.

## Decision

Adopt one shared shimmer utility convention for ui-kit loading surfaces:

1. Centralize shimmer keyframes and timing helpers in `packages/ui-kit/src/shared/shimmer.ts`.
2. Consume shared shimmer utilities from feature components (no local duplicate keyframes).
3. Keep shimmer timing aligned to approximately 1.5 seconds and respect reduced-motion.
4. Enforce reuse through review and static checks in PH4C quality gates.

## Consequences

1. Loading behavior is consistent across components.
2. Accessibility controls for motion are standardized.
3. Future shimmer changes happen in one place.
4. Code duplication is reduced and auditability improves.

## References

- `packages/ui-kit/src/shared/shimmer.ts`
- `docs/architecture/plans/PH4C.7-Shimmer-Infrastructure.md`
