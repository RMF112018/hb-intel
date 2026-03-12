# SF18-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF18-T04 hooks task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define adapter hooks that consume primitive health state and expose Estimating UX state, offline indicators, and KPI wiring.

---

## `useBidReadiness`

Responsibilities:

- map pursuit data into `@hbc/health-indicator` item format
- invoke primitive state hooks and map output to `IBidReadinessViewState`
- expose loading/error/refresh and optimistic sync indicators
- surface blockers-first ownership and urgency metadata

Cache key:

- `['health-indicator', 'estimating-bid-readiness', pursuitId]`

---

## `useBidReadinessProfile`

Responsibilities:

- return effective profile + override metadata
- expose profile refresh and admin mutation guards
- publish immutable version metadata from `@hbc/versioned-record`

Cache key:

- `['health-indicator', 'estimating-bid-readiness', 'profile']`

---

## `useBidReadinessTelemetry`

Responsibilities:

- stream primitive KPI payloads for the five locked metrics
- provide role/complexity filtered views for canvas and admin dashboards
- expose emitter health and backfill status for offline replay

Cache key:

- `['health-indicator', 'estimating-bid-readiness', 'telemetry']`

---

## State Guarantees

- stable return shape across loading/success/error
- deterministic blocker-first criterion ordering
- sync indicator accuracy: `saved-locally` and `queued-to-sync`
- no stale KPI state after background sync replay

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- useBidReadiness
pnpm --filter @hbc/features-estimating test -- useBidReadinessTelemetry
pnpm --filter @hbc/features-estimating check-types
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF18-T04 completed: 2026-03-12
- Replaced hook scaffold with canonical SF18 hook/state-model layer in
  `packages/features/estimating/src/bid-readiness/hooks/index.ts`:
  - `useBidReadiness`
  - `useBidReadinessProfile`
  - `useBidReadinessTelemetry`
- Hook orchestration is strictly T03/T02-driven:
  - `useBidReadiness` composes adapter mappings (`mapPursuitToHealthIndicatorItem`,
    `mapHealthIndicatorStateToBidReadinessView`) and exposes deterministic
    blocker-first/grouped derived state.
  - `useBidReadinessProfile` resolves profile/config via
    `resolveBidReadinessProfileConfig` with stable source/validation metadata.
  - `useBidReadinessTelemetry` consumes deterministic emitter snapshots via
    `bidReadinessKpiEmitter.getView(...)` with stale/degraded/backfill flags.
- Added T04 hook/state return contracts in `src/types`:
  - `BidReadinessDataState`
  - `UseBidReadinessResult`
  - `UseBidReadinessProfileResult`
  - `UseBidReadinessTelemetryResult`
- Updated public export surfaces:
  - `src/bid-readiness/index.ts` now exports all three hooks and hook params
  - `src/types/index.ts` exports T04 hook/state contracts
  - `src/index.ts` exports T04 hook/state contracts and hook params
- Added T04 hook tests:
  - `src/bid-readiness/hooks/useBidReadiness.test.tsx`
  - `src/bid-readiness/hooks/useBidReadinessTelemetry.test.tsx`
  - tests cover loading/success/empty/degraded states, deterministic ordering/grouping,
    profile fallback behavior, telemetry stale/backfill behavior, and fallback snapshot behavior.
- Verification (zero errors):
  - `pnpm --filter @hbc/features-estimating test -- useBidReadiness` ✓
  - `pnpm --filter @hbc/features-estimating test -- useBidReadinessTelemetry` ✓
  - `pnpm --filter @hbc/features-estimating check-types` ✓
  - `pnpm --filter @hbc/features-estimating build` ✓
- T04 success criteria complete. Work stopped before T05 per phase instruction.
-->
