# SF18-T02 - TypeScript Contracts: Bid Readiness Adapter

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF18-T02 contracts task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Lock SF18 adapter contracts around canonical `@hbc/health-indicator` types and explicitly retire `IBidReadiness*` as core contracts.

---

## Canonical Contract Direction

- canonical core contracts: `IHealthIndicatorCriterion`, `IHealthIndicatorState`, `IHealthIndicatorProfile`, `IHealthIndicatorTelemetry`
- SF18 may expose compatibility aliases for consuming Estimating surfaces only
- adapter contracts must carry immutable version metadata from `@hbc/versioned-record`

---

## Types to Define

```ts
export type BidReadinessStatus =
  | 'ready'
  | 'nearly-ready'
  | 'attention-needed'
  | 'not-ready';

export interface IEstimatingBidReadinessProfile {
  profileId: 'estimating-bid-readiness';
  criteria: IHealthIndicatorCriterion[];
  thresholds: {
    readyMinScore: number;
    nearlyReadyMinScore: number;
    attentionNeededMinScore: number;
  };
}

/** Compatibility alias for adapter-level usage only. */
export type IBidReadinessState = IHealthIndicatorState;

export interface IBidReadinessViewState {
  status: BidReadinessStatus;
  score: number;
  blockers: IHealthIndicatorCriterion[];
  criteria: Array<{
    criterion: IHealthIndicatorCriterion;
    isComplete: boolean;
    assignee: IBicOwner | null;
    actionHref: string;
  }>;
  daysUntilDue: number | null;
  isOverdue: boolean;
  version: VersionedRecord;
  syncIndicator: 'synced' | 'saved-locally' | 'queued-to-sync';
}

export interface IBidReadinessTelemetry {
  timeToReadinessMs: number | null;
  blockerResolutionLatencyMs: number | null;
  readyToBidRate: number | null;
  submissionErrorRateReduction: number | null;
  checklistCes: number | null;
}
```

---

## Hook Return Contracts

- `useBidReadiness` returns mapped `IBidReadinessViewState`, loading/error, and refresh/mutate actions
- `useBidReadinessProfile` returns effective profile + configuration source metadata
- `useBidReadinessTelemetry` returns KPI snapshots emitted by primitive events

---

## Constants to Lock

- `BID_READINESS_PROFILE_ID = 'estimating-bid-readiness'`
- `BID_READINESS_SYNC_INDICATORS = ['saved-locally', 'queued-to-sync']`
- `BID_READINESS_URGENCY_WINDOW_HOURS = 48`
- `BID_READINESS_TELEMETRY_KEYS = ['time-to-readiness','blocker-resolution-latency','readyToBidRate','submission-error-rate-reduction','checklist-ces']`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating test -- contracts
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF18-T02 completed: 2026-03-12
- Contract-only surface implemented in `packages/features/estimating/src/types` with full D-SF18-T02 JSDoc across all public interfaces/types.
- Added expanded readiness contract coverage:
  - readiness score structures and summary payload types
  - estimator/package readiness criteria contracts
  - qualification/risk metadata and completeness metadata
  - recommendation/action payload contracts
  - governance metadata and readiness category breakdown contracts
  - scoring dimension utility types
  - status/severity/confidence typing
- Canonical barrels added:
  - `src/types/index.ts`
  - `src/constants/index.ts`
  - root `src/index.ts` extended to expose full public contract surface.
- Constants layer added in `src/constants/readiness.ts` with `as const` groups and derived union types:
  - readiness states, scoring bands, risk levels, recommendation categories, priority levels
  - governance states, telemetry keys, readiness profile identifiers, sync indicators
  - confidence/severity taxonomies for metadata typing.
- Runtime logic remained unchanged (no scoring engine, evaluation pipeline, or registry additions).
- Verification:
  - `pnpm --filter @hbc/features-estimating check-types` ✓
  - `pnpm --filter @hbc/features-estimating build` ✓
Next: SF18-T03 (Readiness Profile and Configuration)
-->
