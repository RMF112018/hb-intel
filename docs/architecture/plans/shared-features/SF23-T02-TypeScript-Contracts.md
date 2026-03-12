# SF23-T02 - TypeScript Contracts: Record Form Primitive + Adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF23-T02 contracts task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Lock primitive-owned public contracts for record lifecycle runtime, BIC handoff steps, provenance/versioning, and telemetry. Module contracts remain projection-only.

---

## Types to Define

```ts
export type RecordFormMode = 'create' | 'edit' | 'duplicate' | 'template';
export type RecordFormStatus = 'draft' | 'ready-for-review' | 'submitted' | 'failed';

export interface IRecordFormDefinition<TRecord> {
  formId: string;
  moduleId: string;
  recordType: string;
  mode: RecordFormMode;
  schemaVersion: string;
  record: TRecord;
  validation: IRecordValidationState;
  bicSteps?: IRecordBicStepConfig[];
  version: VersionedRecord;
  telemetry: IRecordFormTelemetryState;
}

export interface IRecordFormTelemetryState {
  formCompletionTime: number | null;
  submissionSuccessRate: number | null;
  draftRecoveryRate: number | null;
  handoffLatency: number | null;
  recordFormCes: number | null;
}
```

---

## Hook Return Contracts

- primitive hooks return state, loading/error, refresh, queue status, and commit metadata
- adapter hooks return module-projected view models and route labels only

---

## Constants to Lock

- `RECORD_FORM_SYNC_QUEUE_KEY = 'record-form-sync-queue'`
- `RECORD_FORM_SYNC_STATUSES = ['Saved locally', 'Queued to sync']`
- `RECORD_FORM_COMPLEXITY_PROFILES = ['essential', 'standard', 'expert']`

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form check-types
pnpm --filter @hbc/record-form test -- contracts
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```
