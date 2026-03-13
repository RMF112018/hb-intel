# SF24-T02 - TypeScript Contracts: Export Runtime Primitive + Adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF24-T02 contracts task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Lock primitive-owned public contracts for export lifecycle truth, receipt semantics, artifact confidence, context stamping, BIC handoff steps, provenance/versioning, and operational telemetry. Module contracts remain projection-only.

---

## Types to Define

```ts
export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'print';
export type ExportIntent =
  | 'working-data'
  | 'current-view'
  | 'record-snapshot'
  | 'presentation'
  | 'composite-report';

export type ExportStatus =
  | 'saved-locally'
  | 'queued-to-sync'
  | 'rendering'
  | 'complete'
  | 'failed'
  | 'degraded'
  | 'restored-receipt';

export type ExportArtifactConfidence =
  | 'trusted-synced'
  | 'queued-local-only'
  | 'completed-with-degraded-truth'
  | 'failed-or-partial'
  | 'restored-needs-review';

export interface IExportRequest {
  requestId: string;
  format: ExportFormat;
  intent: ExportIntent;
  context: IExportSourceTruthStamp;
  payload: ITableExportPayload | IReportExportPayload;
  receipt: IExportReceiptState | null;
  reviewSteps: IExportReviewStepState[];
  nextRecommendedAction: IExportNextRecommendedAction | null;
  failure: IExportFailureState | null;
  retry: IExportRetryState | null;
  confidence: ExportArtifactConfidence;
  bicSteps?: IExportBicStepConfig[];
  version: VersionedRecord;
  telemetry: IExportTelemetryState;
}
```

Additional contracts must include:

- `IExportSourceTruthStamp`
- `IExportTruthState`
- `IExportReceiptState`
- `IExportArtifactMetadata`
- `IExportReviewStepState`
- `IExportReviewHistoryEntry`
- `IExportNextRecommendedAction`
- `IExportFailureState`
- `IExportRetryState`
- `IExportSuppressedFormatState`
- `IExportContextDeltaState`

---

## Semantic Contract Requirements

- truth state must answer:
  - what record/view/version the artifact represents
  - whether filters, sorts, visible columns, selected rows, or composed sections were applied
  - whether the artifact is a snapshot or current-view projection
  - whether source truth changed materially before render completion
- receipt state must distinguish:
  - local-only queued request
  - remote render in progress
  - completed artifact
  - failed artifact
  - restored receipt
- review-step state must distinguish:
  - blocking vs non-blocking
  - current owner
  - reassignment history
  - completion semantics
- next recommended action must include:
  - export option or follow-up action kind
  - human-readable reason
  - whether the next step is download, review, approve, circulate, or publish
  - whether the export is intended for analysis, presentation, audit, or handoff

---

## Reason-Code Enums to Lock

- `ExportUnavailableReasonCode`
- `ExportTrustDowngradeReasonCode`
- `ExportRetryReasonCode`
- `ExportQueueReasonCode`
- `ExportFailureReasonCode`

These enums are required so user-facing explanations and telemetry are deterministic and testable.

---

## Constants to Lock

- `EXPORT_RUNTIME_SYNC_QUEUE_KEY = 'export-runtime-sync-queue'`
- `EXPORT_RUNTIME_SYNC_STATUSES = ['Saved locally', 'Queued to sync']`
- `EXPORT_RUNTIME_COMPLEXITY_PROFILES = ['essential', 'standard', 'expert']`
- `EXPORT_RUNTIME_CONFIDENCE_STATES = ['trusted-synced', 'queued-local-only', 'completed-with-degraded-truth', 'failed-or-partial', 'restored-needs-review']`

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime check-types
pnpm --filter @hbc/export-runtime test -- contracts
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```
