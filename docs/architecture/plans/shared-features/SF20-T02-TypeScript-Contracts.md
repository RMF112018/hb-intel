# SF20-T02 - TypeScript Contracts: Strategic Intelligence Primitive + BD Adapter

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 1.2 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF20-T02 contracts task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Lock primitive-owned public contracts for heritage snapshot, living intelligence entries, trust/reliability, commitment lifecycle, handoff acknowledgment workflow, sensitivity/redaction, conflict/supersession, reuse explainability, telemetry, and version metadata.

---

## Primitive Contracts to Define (`@hbc/strategic-intelligence`)

```ts
export type ReliabilityTier = 'high' | 'moderate' | 'low' | 'review-required';
export type ProvenanceClass =
  | 'firsthand-observation'
  | 'meeting-summary'
  | 'project-outcome-learning'
  | 'inferred-observation'
  | 'ai-assisted-draft';

export type IntelligenceLifecycleState =
  | 'submitted'
  | 'pending-approval'
  | 'approved'
  | 'rejected'
  | 'revision-requested'
  | 'superseded';

export type SensitivityClass =
  | 'public-internal'
  | 'restricted-role'
  | 'restricted-project'
  | 'confidential';

export interface IHeritageSnapshot {
  snapshotId: string;
  scorecardId: string;
  scorecardVersion: number;
  capturedAt: string;
  capturedBy: string;
  decision: 'GO' | 'NO-GO' | 'WAIT';
  decisionRationale: string;
  clientPriorities: string[];
  competitiveContext: string;
  relationshipIntelligence: string;
  riskAssumptions: string[];
  pursuitStrategy: string;
  immutable: true;
  version: VersionedRecord;
}

export interface ICommitmentRegisterItem {
  commitmentId: string;
  description: string;
  source: string;
  responsibleRole: string;
  fulfillmentStatus: 'open' | 'in-progress' | 'fulfilled' | 'not-applicable';
  dueBy?: string;
  reviewedAt?: string;
  bicRecordId?: string;
}

export interface IIntelligenceTrustMetadata {
  reliabilityTier: ReliabilityTier;
  provenanceClass: ProvenanceClass;
  lastValidatedAt: string | null;
  reviewBy: string | null;
  isStale: boolean;
  staleReason?: string;
  aiTrustDowngraded: boolean;
}

export interface IIntelligenceConflict {
  conflictId: string;
  type: 'contradiction' | 'supersession';
  relatedEntryIds: string[];
  resolutionStatus: 'open' | 'resolved';
  resolutionNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ISuggestedIntelligenceMatch {
  suggestionId: string;
  entryId: string;
  matchScore: number;
  matchedDimensions: string[];
  reason: string;
  reuseHistoryCount: number;
}

export interface IStrategicIntelligenceEntry {
  entryId: string;
  type: string;
  title: string;
  body: string;
  metadata: {
    client?: string;
    ownerOrganization?: string;
    projectType?: string;
    sector?: string;
    deliveryMethod?: string;
    geography?: string;
    competitorReferences?: string[];
    lifecyclePhase?: string;
    riskCategory?: string;
    confidenceTier?: ReliabilityTier;
    tags: string[];
  };
  trust: IIntelligenceTrustMetadata;
  sensitivity: {
    class: SensitivityClass;
    redactionRequired: boolean;
    visibleToRoles?: string[];
  };
  contributor: IBicOwner;
  submittedAt: string;
  approvalStatus: IntelligenceLifecycleState;
  approver: IBicOwner | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  conflicts: IIntelligenceConflict[];
  suggestions: ISuggestedIntelligenceMatch[];
  version: number;
  bicRecordId?: string;
  relatedScorecardId?: string;
}

export interface IHandoffParticipantAcknowledgment {
  participantRole: 'project-manager' | 'project-executive' | 'estimating-lead' | 'bd-lead';
  userId: string;
  acknowledgedAt: string | null;
  status: 'pending' | 'acknowledged' | 'declined';
  declineReason?: string;
}

export interface IHandoffReviewState {
  reviewId: string;
  snapshotId: string;
  stepsCompleted: Array<
    'snapshot-walkthrough' | 'commitment-verification' | 'strategic-risk-discussion' | 'acknowledgment-confirmation'
  >;
  participantAcknowledgments: IHandoffParticipantAcknowledgment[];
  isComplete: boolean;
  completedAt: string | null;
}

export interface IStrategicIntelligenceTelemetryState {
  timeToHandoffContextReviewMs: number | null;
  intelligenceContributionLatencyMs: number | null;
  pctHeritagePanelsViewed: number | null;
  heritageReuseRate: number | null;
  strategicIntelligenceCes: number | null;
  handoffReviewCompletionLatency: number | null;
  acknowledgmentCompletionRate: number | null;
  commitmentFulfillmentRate: number | null;
  staleIntelligenceBacklog: number | null;
  conflictResolutionLatency: number | null;
  suggestionAcceptanceRate: number | null;
  suggestionExplainabilityEngagementRate: number | null;
  redactedProjectionAccessRate: number | null;
}

export interface IStrategicIntelligenceState {
  heritageSnapshot: IHeritageSnapshot;
  commitmentRegister: ICommitmentRegisterItem[];
  livingEntries: IStrategicIntelligenceEntry[];
  handoffReview: IHandoffReviewState | null;
  approvalQueue: IStrategicIntelligenceApprovalQueueItem[];
  telemetry: IStrategicIntelligenceTelemetryState;
  version: VersionedRecord;
  syncStatus: 'synced' | 'saved-locally' | 'queued-to-sync';
}
```

---

## Adapter Contracts (`@hbc/features-business-development`)

- adapter contracts map primitive outputs into BD panel/feed/form/review/queue view models
- adapter contracts must preserve primitive provenance, trust, redaction, conflict, and sync-status fields
- adapter contracts must not re-implement primitive workflow state machines or telemetry semantics

---

## Constants to Lock

- `STRATEGIC_INTELLIGENCE_STALE_MS = 2_592_000_000`
- `STRATEGIC_INTELLIGENCE_SYNC_QUEUE_KEY = 'strategic-intelligence-sync-queue'`
- `STRATEGIC_INTELLIGENCE_INDEXING_VISIBILITY = 'approved-redacted-policy-aware'`
- `STRATEGIC_INTELLIGENCE_REVIEW_REMINDER_DAYS = 30`

---

## Verification Commands

```bash
pnpm --filter @hbc/strategic-intelligence check-types
pnpm --filter @hbc/strategic-intelligence test -- contracts
pnpm --filter @hbc/features-business-development check-types
```
