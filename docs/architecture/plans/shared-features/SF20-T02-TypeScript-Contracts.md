# SF20-T02 - TypeScript Contracts: Heritage & Strategic Intelligence

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** D-02 through D-07, D-10
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF20-T02 contracts task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Lock public contracts for heritage data, intelligence entries, approval states, queue items, and hook return types.

---

## Types to Define

```ts
export interface IBdHeritageData {
  scorecardId: string;
  scorecardVersion: number;
  projectName: string;
  ownerName: string;
  ownerContactName: string;
  ownerContactRole: string;
  decision: 'GO' | 'NO-GO' | 'WAIT';
  decisionRationale: string;
  clientPriorities: string[];
  competitiveContext: string;
  keyRelationships: string;
  estimatedValue: number;
  projectType: string;
  intelligenceEntries: IStrategicIntelligenceEntry[];
  bdTeam: IBicOwner[];
  handoffDate: string;
}

export type IntelligenceEntryType =
  | 'client-preference'
  | 'competitor-intel'
  | 'market-condition'
  | 'relationship-note'
  | 'risk-observation'
  | 'win-loss-factor';

export interface IStrategicIntelligenceEntry {
  entryId: string;
  type: IntelligenceEntryType;
  title: string;
  body: string;
  tags: string[];
  projectId: string;
  clientName: string;
  contributor: IBicOwner;
  submittedAt: string;
  approvalStatus: 'pending-approval' | 'approved' | 'rejected';
  approver: IBicOwner | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  version: number;
  relatedScorecardId?: string;
}

export interface IStrategicIntelligenceApprovalAction {
  entryId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

export interface IStrategicIntelligenceApprovalQueueItem {
  entry: IStrategicIntelligenceEntry;
  requestedApproverId: string;
  queuedAt: string;
}
```

---

## Hook Return Contracts

- `useBdHeritage` returns heritage data, loading/error, refresh.
- `useStrategicIntelligence` returns approved/pending entries, submit/revise actions.
- `useIntelligenceApprovalQueue` returns pending queue and approve/reject actions.

---

## Constants to Lock

- `HERITAGE_DATA_STALE_MS = 300_000`
- `INTELLIGENCE_APPROVAL_QUEUE_LIST_TITLE = 'HBC_StrategicIntelligenceQueue'`
- `INTELLIGENCE_ENTRIES_LIST_TITLE = 'HBC_StrategicIntelligenceEntries'`
- `INTELLIGENCE_INDEXING_VISIBILITY = 'approved-only'`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-business-development test -- contracts
```
