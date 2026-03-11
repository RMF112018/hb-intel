# SF18-T02 - TypeScript Contracts: Bid Readiness

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** D-02 through D-07, D-10
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF18-T02 contracts task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Lock all public contracts for readiness criteria, computed state, threshold policy, configuration, and hook return types.

---

## Types to Define

```ts
export type BidReadinessStatus =
  | 'ready-to-bid'
  | 'nearly-ready'
  | 'attention-needed'
  | 'not-ready';

export interface IBidReadinessCriterion {
  criterionId: string;
  label: string;
  weight: number;
  isBlocker: boolean;
  isComplete: (pursuit: IEstimatingPursuit) => boolean;
  completionDescription: (pursuit: IEstimatingPursuit) => string;
  actionHref: (pursuit: IEstimatingPursuit) => string;
  resolveAssignee: (pursuit: IEstimatingPursuit) => IBicOwner | null;
}

export interface IBidReadinessCriterionEvaluation {
  criterion: IBidReadinessCriterion;
  isComplete: boolean;
  assignee: IBicOwner | null;
  actionHref: string;
  completedAt?: string;
}

export interface IBidReadinessThresholdPolicy {
  readyMinScore: number;
  nearlyReadyMinScore: number;
  attentionNeededMinScore: number;
}

export interface IBidReadinessConfig {
  criteria: IBidReadinessCriterion[];
  thresholdPolicy: IBidReadinessThresholdPolicy;
  tradeCoverageThreshold: number;
}

export interface IBidReadinessState {
  score: number;
  status: BidReadinessStatus;
  criteria: IBidReadinessCriterionEvaluation[];
  blockers: IBidReadinessCriterion[];
  daysUntilDue: number | null;
  isOverdue: boolean;
}
```

---

## Hook Return Contracts

- `useBidReadiness` returns `IBidReadinessState`, loading/error state, and refresh.
- `useBidReadinessCriteria` returns resolved criteria set and source metadata.
- `useBidReadinessConfig` returns merged config and admin override state.

---

## Constants to Lock

- `BID_READINESS_DEFAULT_THRESHOLDS`
- `BID_READINESS_CONFIG_LIST_TITLE = 'HBC_BidReadinessConfig'`
- `BID_READINESS_POLL_MS = 60_000`
- `BID_READINESS_NOTIFICATION_URGENCY_WINDOW_HOURS = 48`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating test -- contracts
```
