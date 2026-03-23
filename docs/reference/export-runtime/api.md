# @hbc/export-runtime API Reference

> **Doc Classification:** Living Reference (Diataxis) — Reference quadrant; developer audience; export-runtime API reference.

## Types

### Foundation Types (T01)

| Type | Description |
|------|-------------|
| `ExportFormat` | `'csv' \| 'xlsx' \| 'pdf' \| 'print'` |
| `ExportIntent` | `'working-data' \| 'current-view' \| 'record-snapshot' \| 'presentation' \| 'composite-report'` |
| `ExportRenderMode` | `'local' \| 'offline-queued' \| 'server-render'` |
| `ExportStatus` | 7 receipt lifecycle states |
| `ExportArtifactConfidence` | 5 confidence levels |
| `ExportComplexityTier` | `'essential' \| 'standard' \| 'expert'` |

### Core Interfaces (T01/T02)

| Interface | Description |
|-----------|-------------|
| `IExportSourceTruthStamp` | Source record/view/version/filter/sort/column context |
| `IExportReceiptState` | Receipt lifecycle: status, confidence, timestamps, artifact URL |
| `IExportReviewStepState` | Review step: blocking, owner, status, reassignment history |
| `IExportNextRecommendedAction` | Next recommended action with reason |
| `IExportFailureState` | Failure code, user message, technical detail |
| `IExportRetryState` | Attempt count, max attempts, canRetry |
| `IExportArtifactMetadata` | Artifact ID, file name, format, size, checksum |
| `IExportRequest` | Top-level orchestration contract |

### T02 Contracts

| Type/Interface | Description |
|----------------|-------------|
| `IExportTruthState` | Aggregate truth/explainability state |
| `ITableExportPayload` | Table export payload (CSV/XLSX) |
| `IReportExportPayload` | Composite report payload |
| `ExportPayload` | Discriminated union of table and report |
| `IExportBicStepConfig` | BIC ownership step configuration |
| `IExportVersionRef` | Version provenance reference |
| `IExportTelemetryState` | 5 UX KPI telemetry state |
| `IExportSuppressedFormatState` | Why a format is unavailable |
| `IExportContextDeltaState` | Source truth change detection |

### Reason Codes

`ExportUnavailableReasonCode`, `ExportTrustDowngradeReasonCode`, `ExportRetryReasonCode`, `ExportQueueReasonCode`, `ExportFailureReasonCode`

## Constants

| Constant | Description |
|----------|-------------|
| `EXPORT_FORMATS` | All supported formats |
| `EXPORT_STATUSES` | All receipt lifecycle statuses |
| `EXPORT_CONFIDENCE_LEVELS` | All confidence levels |
| `EXPORT_COMPLEXITY_TIERS` | All complexity tiers |
| `EXPORT_RUNTIME_SYNC_QUEUE_KEY` | IndexedDB queue key |
| `EXPORT_RUNTIME_SYNC_STATUSES` | Offline-queued statuses |
| `EXPORT_RUNTIME_COMPLEXITY_PROFILES` | Complexity profiles |
| `EXPORT_RUNTIME_CONFIDENCE_STATES` | Confidence states |

## Model Functions (T03)

### `createExportRequest(input, now?): IExportRequest`

Create a new export request with initial `saved-locally` state.

### `transitionExportStatus(request, targetStatus, now?): IExportRequest`

Transition to a new lifecycle status. Enforces monotonic transitions via `VALID_TRANSITIONS`.

### `computeArtifactConfidence(request): ExportArtifactConfidence`

Derive confidence from receipt state, truth downgrades, and context delta.

### `detectContextDelta(original, current, now?): IExportContextDeltaState | null`

Compare truth stamps. Returns null if no material changes.

### `generateExportFileName(request): string`

Deterministic naming: `{moduleKey}_{recordId}_{intent}_{YYYYMMDD_HHmmss}.{ext}`

### `createAuditEntry(requestId, action, performedByUpn, detail?, now?): IExportAuditEntry`

Create an immutable audit trail entry. 10 auditable actions.

## Storage (T03)

### `IExportStorageAdapter`

Interface: `save`, `getByRequestId`, `listByProject`, `listPendingSync`, `update`, `appendAudit`.

### `InMemoryExportStorageAdapter`

Dev/test implementation with `clear()` and `size()` utilities.

## Hooks (T04)

### `useExportRuntimeState(options): UseExportRuntimeStateResult`

Query orchestration + derived explainability. Returns `requests`, `isLoading`, `isError`, `error`, `suppressedFormats`, `topRecommended`, `queueCount`, `refetch`.

### `useExportCompositionState(options?): UseExportCompositionStateResult`

Report composition state. Returns `sections`, `setSections`, `toggleSection`, `reorderSection`, `isValid`, `includedCount`, `resetComposition`.

### `useExportQueue(options): UseExportQueueResult`

Offline queue management. Returns `pendingRequests`, `pendingCount`, `isLoading`, `error`, `replayRequest`, `restoreReceipt`, `refetch`.

### `exportRuntimeKeys`

Query key factory: `all`, `requests(moduleKey)`, `composition(moduleKey)`, `queue(moduleKey)`, `receipts(moduleKey)`.

## Component Shells (T05/T06)

### `ExportActionMenuShell`

Wires `useExportRuntimeState` to `@hbc/ui-kit` `ExportActionMenu`.

### `ExportFormatPickerShell`

Derives format options and context preview from `IExportRequest`.

### `ExportProgressToastShell`

Wires receipt/failure/retry state to `ExportProgressToast`.

### `ExportReceiptCardShell`

Wires artifact/truth/review state to `ExportReceiptCard`.

## Adapters (T07)

### `ExportModuleRegistry`

Singleton: `register`, `getAll`, `getByModule`, `getEnabled`, `_resetForTesting`.

### `createModuleExportRequest(moduleKey, recordId, projectId, format, intent, options?, now?): IExportRequest`

Compose registry lookup with `createExportRequest`.

## Testing Exports (`@hbc/export-runtime/testing`)

| Export | Description |
|--------|-------------|
| `createMockExportRequest(overrides?)` | IExportRequest factory |
| `createMockReceiptState(overrides?)` | IExportReceiptState factory |
| `createMockTruthState(overrides?)` | IExportTruthState factory |
| `createMockReviewStepState(overrides?)` | IExportReviewStepState factory |
| `createMockQueueState(count?)` | IExportStorageRecord[] factory |
| `mockExportScenarios` | 11 canonical fixtures |
| `mockExportComplexityProfiles` | Essential/standard/expert profiles |

## Related

- [ADR-0119 — Export Runtime Architecture](../../architecture/adr/ADR-0119-export-runtime.md)
- [Adoption Guide](../../how-to/developer/export-runtime-adoption-guide.md)
- [SF24 Master Plan](../../architecture/plans/shared-features/SF24-Export-Runtime.md)
