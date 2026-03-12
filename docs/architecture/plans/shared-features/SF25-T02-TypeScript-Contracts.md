# SF25-T02 - TypeScript Contracts: Publish Workflow Primitive + Adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF25-T02 contracts task; sub-plan of `SF25-Publish-Workflow.md`.

---

## Objective

Lock primitive-owned public contracts for publish lifecycle, readiness/approval/supersession rules, receipt context stamping, BIC steps, provenance/versioning, and telemetry. Module contracts remain projection-only.

---

## Types to Define

```ts
export type PublishState =
  | 'draft'
  | 'ready-for-review'
  | 'approved-for-publish'
  | 'publishing'
  | 'published'
  | 'superseded'
  | 'revoked'
  | 'failed';

export interface IPublishRequest {
  publishRequestId: string;
  sourceModuleKey: string;
  sourceRecordId: string;
  sourceVersionId?: string;
  artifactId?: string;
  issueLabel?: string;
  requestedByUserId: string;
  targets: IPublishTarget[];
  approvalRules?: IPublishApprovalRule[];
  bicSteps?: IPublishBicStepConfig[];
  version: VersionedRecord;
  telemetry: IPublishTelemetryState;
}

export interface IPublishTelemetryState {
  publishCompletionLatency: number | null;
  approvalCycleTimeReduction: number | null;
  supersessionTraceabilityScore: number | null;
  publishGovernanceCes: number | null;
  formalIssueAdoptionRate: number | null;
}

export interface IPublishReceiptContextStamp {
  sourceRecordId: string;
  sourceVersionId?: string;
  issueLabel?: string;
  publishedByUserId: string;
  publishedAtIso: string;
  supersedesPublishId?: string;
}
```

---

## Hook Return Contracts

- primitive hooks return state, loading/error, refresh, queue status, and commit metadata
- adapter hooks return module-projected view models and route labels only

---

## Constants to Lock

- `PUBLISH_WORKFLOW_SYNC_QUEUE_KEY = 'publish-workflow-sync-queue'`
- `PUBLISH_WORKFLOW_SYNC_STATUSES = ['Saved locally', 'Queued to sync']`
- `PUBLISH_WORKFLOW_VISIBILITY_POLICY = 'panel-visible-all-modes'`

---

## Verification Commands

```bash
pnpm --filter @hbc/publish-workflow check-types
pnpm --filter @hbc/publish-workflow test -- contracts
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```

