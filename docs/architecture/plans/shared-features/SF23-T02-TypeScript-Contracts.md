# SF23-T02 - TypeScript Contracts: Record Form Primitive + Adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF23-T02 contracts task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Lock primitive-owned public contracts for lifecycle truth, review-step semantics, trust/explainability state, recovery state, provenance/versioning, and operational telemetry. Module contracts remain projection-only.

---

## Types to Define

```ts
export type RecordFormMode =
  | 'create'
  | 'edit'
  | 'duplicate'
  | 'template'
  | 'review';

export type RecordFormStatus =
  | 'not-started'
  | 'draft'
  | 'dirty'
  | 'valid-with-warnings'
  | 'blocked'
  | 'submitting'
  | 'submitted'
  | 'failed';

export type RecordSyncState =
  | 'local-only'
  | 'saved-locally'
  | 'queued-to-sync'
  | 'synced'
  | 'degraded'
  | 'partially-recovered';

export type RecordStateConfidence =
  | 'trusted-synced'
  | 'local-unsynced'
  | 'recovered-needs-review'
  | 'degraded-submission'
  | 'partially-resolved';

export interface IRecordFormDefinition<TRecord> {
  formId: string;
  moduleId: string;
  recordType: string;
  mode: RecordFormMode;
  schemaVersion: string;
  record: TRecord;
  validation: IRecordValidationState;
  explanation: IRecordFormExplanationState;
  recovery: IRecordRecoveryState | null;
  reviewSteps: IRecordReviewStepState[];
  nextRecommendedAction: IRecordNextRecommendedAction | null;
  sync: IRecordSyncState;
  confidence: IRecordStateConfidence;
  bicSteps?: IRecordBicStepConfig[];
  version: VersionedRecord;
  telemetry: IRecordFormTelemetryState;
}
```

Additional contracts must include:

- `IRecordFormExplanationState`
- `IRecordValidationState`
- `IRecordValidationWarning`
- `IRecordBlockedReason`
- `IRecordRecoveryState`
- `IRecordDraftComparisonState`
- `IRecordReviewStepState`
- `IRecordReviewStepHistoryEntry`
- `IRecordNextRecommendedAction`
- `IRecordSubmitGuardState`
- `IRecordConflictState`
- `IRecordRetryState`

---

## Semantic Contract Requirements

- explanation state must answer:
  - why the form is blocked
  - why a warning is visible
  - why a review step exists
  - why recovery is offered
  - why submission is suppressed, deferred, or retryable
- recovery state must distinguish:
  - local draft
  - server draft
  - restored draft
  - stale restored draft
- review-step state must distinguish:
  - blocking vs non-blocking
  - pre-submit vs post-submit
  - current owner
  - reassignment history
  - completion semantics
- next recommended action must include:
  - action kind
  - human-readable reason
  - whether the action is author-side or downstream-owner-side
  - whether the issue is data completion, sync completion, review completion, or approval dependency

---

## Reason-Code Enums to Lock

- `RecordBlockedReasonCode`
- `RecordWarningReasonCode`
- `RecordRecoveryReasonCode`
- `RecordDeferReasonCode`
- `RecordRetryReasonCode`

These enums are required so user-facing explanations and telemetry are deterministic and testable.

---

## Constants to Lock

- `RECORD_FORM_SYNC_QUEUE_KEY = 'record-form-sync-queue'`
- `RECORD_FORM_SYNC_STATUSES = ['Saved locally', 'Queued to sync']`
- `RECORD_FORM_COMPLEXITY_PROFILES = ['essential', 'standard', 'expert']`
- `RECORD_FORM_TRUST_STATES = ['trusted-synced', 'local-unsynced', 'recovered-needs-review', 'degraded-submission', 'partially-resolved']`

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form check-types
pnpm --filter @hbc/record-form test -- contracts
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```
