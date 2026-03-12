# SF24-T02 - TypeScript Contracts: Export Runtime Primitive + Adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF24-T02 contracts task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Lock primitive-owned public contracts for export lifecycle, artifact context stamping, BIC handoff steps, provenance/versioning, and telemetry. Module contracts remain projection-only.

---

## Types to Define

```ts
export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'print';
export type ExportStatus = 'queued' | 'rendering' | 'complete' | 'failed';

export interface IExportRequest {
  requestId: string;
  format: ExportFormat;
  context: IExportContextStamp;
  payload: ITableExportPayload | IReportExportPayload;
  bicSteps?: IExportBicStepConfig[];
  version: VersionedRecord;
  telemetry: IExportTelemetryState;
}

export interface IExportContextStamp {
  moduleKey: string;
  projectId?: string;
  recordId?: string;
  recordVersionId?: string;
  viewId?: string;
  exportedByUserId: string;
  exportedAtIso: string;
  fileName: string;
}

export interface IExportTelemetryState {
  exportCompletionTime: number | null;
  artifactConsistencyRate: number | null;
  handoffLatency: number | null;
  auditTraceabilityScore: number | null;
  exportRuntimeCes: number | null;
}
```

---

## Hook Return Contracts

- primitive hooks return state, loading/error, refresh, queue status, and commit metadata
- adapter hooks return module-projected view models and route labels only

---

## Constants to Lock

- `EXPORT_RUNTIME_SYNC_QUEUE_KEY = 'export-runtime-sync-queue'`
- `EXPORT_RUNTIME_SYNC_STATUSES = ['Saved locally', 'Queued to sync']`
- `EXPORT_RUNTIME_COMPLEXITY_PROFILES = ['essential', 'standard', 'expert']`

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime check-types
pnpm --filter @hbc/export-runtime test -- contracts
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```

