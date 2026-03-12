# SF22-T02 - TypeScript Contracts: Post-Bid Autopsy Primitive + Adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently missing) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Decisions Applied:** L-01 through L-14
**Estimated Effort:** 1.1 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF22-T02 contracts task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Lock primitive-owned public contracts for evidence/confidence/taxonomy/lifecycle/governance/publication/flywheel telemetry. BD/Estimating contracts remain projection-only.

---

## Types to Define

```ts
export type AutopsyOutcome = 'won' | 'lost' | 'no-bid';

export type AutopsyStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'superseded'
  | 'archived'
  | 'overdue';

export type ConfidenceTier = 'high' | 'moderate' | 'low' | 'unreliable';

export interface IAutopsyEvidence {
  evidenceId: string;
  type: 'interview-note' | 'cost-artifact' | 'schedule-artifact' | 'field-observation' | 'client-signal' | 'other';
  sourceRef: string;
  capturedBy: string;
  capturedAt: string;
  reliabilityHint?: 'primary' | 'secondary' | 'inferred';
  sensitivity: 'internal' | 'restricted-role' | 'restricted-project' | 'confidential';
}

export interface IAutopsyConfidence {
  tier: ConfidenceTier;
  score: number;
  reasons: string[];
  evidenceCoverage: number;
}

export interface IRootCauseTag {
  tagId: string;
  domain: 'strategy' | 'pricing' | 'scope' | 'execution' | 'coordination' | 'market' | 'client';
  label: string;
  normalizedCode: string;
}

export interface ISensitivityPolicy {
  visibility: 'role-scoped' | 'project-scoped' | 'cross-module-redacted' | 'confidential';
  redactionRequired: boolean;
}

export interface IReviewDecision {
  stage: 'author-review' | 'cross-functional-review' | 'approver-review';
  decision: 'approved' | 'changes-requested' | 'rejected';
  reviewer: string;
  decidedAt: string;
  notes?: string;
}

export interface IDisagreementRecord {
  disagreementId: string;
  criterion: string;
  participants: string[];
  summary: string;
  escalationRequired: boolean;
  resolutionStatus: 'open' | 'resolved' | 'escalated';
}

export interface IOverrideGovernance {
  overrideReason: string;
  overriddenBy: string;
  overriddenAt: string;
  approvalRequired: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface IPublicationGate {
  publishable: boolean;
  blockers: string[];
  minimumConfidenceTier: ConfidenceTier;
  requiredEvidenceCount: number;
}

export interface ISupersessionLink {
  supersedesAutopsyId?: string;
  supersededByAutopsyId?: string;
  reason?: string;
}

export interface IPostBidAutopsy {
  autopsyId: string;
  pursuitId: string;
  scorecardId: string;
  outcome: AutopsyOutcome;
  status: AutopsyStatus;
  confidence: IAutopsyConfidence;
  evidence: IAutopsyEvidence[];
  rootCauseTags: IRootCauseTag[];
  sensitivity: ISensitivityPolicy;
  reviewDecisions: IReviewDecision[];
  disagreements: IDisagreementRecord[];
  publicationGate: IPublicationGate;
  supersession: ISupersessionLink;
  overrideGovernance: IOverrideGovernance | null;
  telemetry: IAutopsyTelemetryState;
}

export interface IAutopsyTelemetryState {
  autopsyCompletionLatency: number | null;
  repeatErrorReductionRate: number | null;
  intelligenceSeedingConversionRate: number | null;
  benchmarkAccuracyLift: number | null;
  corroborationRate: number | null;
  staleIntelligenceRate: number | null;
  revalidationLatency: number | null;
  reinsertionAdoptionRate: number | null;
  autopsyCes: number | null;
}
```

---

## Hook Return Contracts

- primitive hooks return state, loading/error, refresh, queue status, commit metadata, confidence/evidence completeness, publication blockers
- adapter hooks return projected view models for BD/Estimating surfaces only

---

## Constants to Lock

- `AUTOPSY_SLA_BUSINESS_DAYS = 5`
- `AUTOPSY_SYNC_QUEUE_KEY = 'post-bid-autopsy-sync-queue'`
- `AUTOPSY_STATUS_ORDER = ['draft','review','approved','published','superseded','archived','overdue']`
- `AUTOPSY_MIN_PUBLISH_CONFIDENCE = 'moderate'`

---

## Verification Commands

```bash
pnpm --filter @hbc/post-bid-autopsy check-types
pnpm --filter @hbc/post-bid-autopsy test -- contracts
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```
