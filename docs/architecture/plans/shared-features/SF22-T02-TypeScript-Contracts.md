# SF22-T02 - TypeScript Contracts: Post-Bid Autopsy Primitive + Adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF22-T02 contracts task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Lock primitive-owned public contracts for autopsy lifecycle, section payloads, BIC ownership, provenance, and telemetry. BD/Estimating contracts remain projection-only.

---

## Types to Define

```ts
export type AutopsyOutcome = 'won' | 'lost' | 'no-bid';
export type AutopsyStatus = 'not-started' | 'in-progress' | 'complete' | 'overdue';

export interface IPostBidAutopsy {
  autopsyId: string;
  pursuitId: string;
  scorecardId: string;
  outcome: AutopsyOutcome;
  status: AutopsyStatus;
  primaryAuthor: IBicOwner;
  coAuthor: IBicOwner;
  dueDate: string;
  completedAt: string | null;
  sections: IAutopsySections;
  pursuitSnapshotId: string;
  bicRecords: IBicRecord[];
  version: VersionedRecord;
  telemetry: IAutopsyTelemetryState;
}

export interface IAutopsySections {
  outcomeContext: IAutopsyOutcomeContext | null;
  winLossFactors: IAutopsyWinLossFactors | null;
  estimatingAccuracy: IAutopsyEstimatingAccuracy | null;
  goNoGoRetrospective: IAutopsyGoNoGoRetro | null;
  intelligenceContributions: IStrategicIntelligenceEntry[];
}

export interface IAutopsyTelemetryState {
  autopsyCompletionLatency: number | null;
  repeatErrorReductionRate: number | null;
  intelligenceSeedingConversionRate: number | null;
  benchmarkAccuracyLift: number | null;
  autopsyCes: number | null;
}
```

---

## Hook Return Contracts

- primitive hooks return state, loading/error, refresh, queue status, and commit metadata
- adapter hooks return projected view models for BD/Estimating surfaces

---

## Constants to Lock

- `AUTOPSY_SLA_BUSINESS_DAYS = 5`
- `AUTOPSY_SYNC_QUEUE_KEY = 'post-bid-autopsy-sync-queue'`
- `AUTOPSY_STATUS_BADGES = ['not-started', 'in-progress', 'complete', 'overdue']`

---

## Verification Commands

```bash
pnpm --filter @hbc/post-bid-autopsy check-types
pnpm --filter @hbc/post-bid-autopsy test -- contracts
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```
