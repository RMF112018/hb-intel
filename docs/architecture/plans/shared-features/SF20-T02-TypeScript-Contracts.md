# SF20-T02 - TypeScript Contracts: Strategic Intelligence Primitive + BD Adapter

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF20-T02 contracts task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Lock primitive-owned public contracts for heritage data, intelligence entries, approval/queue state, telemetry, and version metadata. BD contracts are adapter projections only.

---

## Primitive Contracts to Define (`@hbc/strategic-intelligence`)

```ts
export interface IBdHeritageData {
  scorecardId: string;
  scorecardVersion: number;
  projectName: string;
  ownerName: string;
  decision: 'GO' | 'NO-GO' | 'WAIT';
  decisionRationale: string;
  clientPriorities: string[];
  competitiveContext: string;
  keyRelationships: string;
  intelligenceEntries: IStrategicIntelligenceEntry[];
  handoffDate: string;
  version: VersionedRecord;
}

export interface IStrategicIntelligenceEntry {
  entryId: string;
  type: IntelligenceEntryType;
  title: string;
  body: string;
  tags: string[];
  projectId: string;
  contributor: IBicOwner;
  submittedAt: string;
  approvalStatus: 'pending-approval' | 'approved' | 'rejected';
  approver: IBicOwner | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  version: number;
  bicRecordId?: string;
  relatedScorecardId?: string;
}

export interface IStrategicIntelligenceTelemetryState {
  timeToHandoffContextReviewMs: number | null;
  intelligenceContributionLatencyMs: number | null;
  pctHeritagePanelsViewed: number | null;
  heritageReuseRate: number | null;
  strategicIntelligenceCes: number | null;
}

export interface IStrategicIntelligenceApprovalQueueItem {
  entry: IStrategicIntelligenceEntry;
  requestedApproverId: string;
  queuedAt: string;
}
```

---

## Adapter Contracts (`@hbc/features-business-development`)

- adapter contracts map primitive outputs into BD panel/feed/form/queue view models
- adapter contracts must preserve primitive provenance and sync-status fields
- adapter contracts must not re-implement approval-state machine or telemetry schema

---

## Constants to Lock

- `STRATEGIC_INTELLIGENCE_STALE_MS = 300_000`
- `STRATEGIC_INTELLIGENCE_SYNC_QUEUE_KEY = 'strategic-intelligence-sync-queue'`
- `STRATEGIC_INTELLIGENCE_INDEXING_VISIBILITY = 'approved-only'`

---

## Verification Commands

```bash
pnpm --filter @hbc/strategic-intelligence check-types
pnpm --filter @hbc/strategic-intelligence test -- contracts
pnpm --filter @hbc/features-business-development check-types
```
