# PH7-SF-24: Export Runtime — Shared Branded Output, Table Export & Report Rendering Infrastructure

**Priority Tier:** 2 — Application Layer (shared package; cross-module output infrastructure)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Addendum A — Recommended package candidate (now fully interview-locked)
**Mold Breaker Source:** UX-MB §3 (Unified Work Graph); UX-MB §11 (Implementation Truth)

---

## Problem Solved

HB Intel will need to export information from many modules in a polished, consistent, and operationally trustworthy way. The data sources differ — scorecards, logs, tables, reports, dashboards, schedules, forecasts, analytics summaries — but the output problem is shared:

- users need CSV and XLSX exports for working data
- managers need print/PDF output for review, meetings, and executive circulation
- project teams need repeatable naming, branding, and pagination
- the platform needs exports that match the actual system state and version being viewed
- modules need this capability without each re-building rendering, formatting, and file-generation logic

Without a shared export layer, each module will produce its own export implementation. The result is familiar:

- inconsistent file names and packaging
- inconsistent column treatment and date/number formatting
- inconsistent branding and print quality
- repeated PDF/print composition code
- output surfaces that do not clearly show what record version or filter state the export represents
- increased QA burden because every module invents its own export logic

The **Export Runtime** package is the shared infrastructure that generates polished artifacts from live module data while preserving output consistency, version context, and downstream portability.

Every export intent that includes review/approval automatically creates a granular BIC record in `@hbc/bic-next-move`, with ownership avatars surfaced in `ExportActionMenu` and in the `@hbc/project-canvas` "My Work" lane.

---

## Mold Breaker Rationale

The Work Graph and Implementation Truth principles both matter here. A user should be able to export what the system actually knows — not a disconnected screenshot or an ad hoc report whose relationship to the underlying record is ambiguous. Export should be a reliable projection of record state, selected filters, visible columns, or a configured report narrative.

`@hbc/export-runtime` is the package that makes output trustworthy and reusable and the foundation of a new Tier-1 primitive:

1. It provides a normalized way to turn tables, reports, and summary cards into artifacts.
2. It keeps file structure, naming, branding, and formatting consistent across modules.
3. It preserves context: filters, sort order, selected record version, and export timestamp.
4. It binds review/approval and handoff accountability directly into export flow using granular BIC ownership.
5. It emits role-aware telemetry so export quality and operational handoff performance are measurable over time.

This package is not a one-off report generator. It is the platform’s shared output engine with implementation truth, ownership, and governance integrity.

---

## Export Runtime Model

The package supports several export intents while keeping the data-to-artifact path explicit and primitive-owned.

### Export Intents
- **Working Data Export** — CSV / XLSX outputs for analysis and operational handling
- **Presentation Export** — branded PDF / print output for formal circulation
- **Record Snapshot Export** — point-in-time export of a specific record version or review state
- **View-State Export** — export of exactly what the user is seeing (filters, columns, groupings)
- **Composite Report Export** — assembled narrative + tables + charts + metadata

### Standard Export Stages
1. Resolve source data and export intent
2. Project source data into normalized export models
3. Apply formatting and branding rules
4. Generate artifact with version/view truth stamps and owner-ready receipt metadata
5. Return artifact metadata, filename, status, BIC handoff projection, and optional publish hook

### Supported Output Formats
- `csv`
- `xlsx`
- `pdf`
- `print`
- future: `json`, `pptx` packaging hook if ever needed

### Complexity-Aware Disclosure
- Essential: simple "Export current view" action limited to CSV/XLSX
- Standard: full export menu with branded PDF/Print and summary receipt metadata
- Expert: report composition layer, full receipt card, and configure-link access

---

## Export Surface Structure

The runtime supports two canonical composition structures:
- Table Export: normalized column/row projection with filter and sort stamps
- Report Export: section-based narrative composition with brand templates and metadata cover
Both structures preserve version/view stamps, BIC handoff metadata, and receipt context.

---

## Interface Contract

```typescript
// In @hbc/export-runtime primitive (new Tier-1 package)

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'print';
export type ExportStatus = 'queued' | 'rendering' | 'complete' | 'failed';

export interface IExportContext {
  moduleKey: string;
  exportIntent: 'working-data' | 'presentation' | 'record-snapshot' | 'view-state' | 'composite-report';
  currentUserId: string;
  projectId?: string;
  recordId?: string;
  recordVersionId?: string;
  viewId?: string;
  exportedAtIso: string;
}

export interface IExportArtifact {
  artifactId: string;
  format: ExportFormat;
  fileName: string;
  mimeType: string;
  sizeBytes?: number;
  downloadUrl?: string;
  checksum?: string;
}

export interface IColumnExportDefinition<T> {
  key: keyof T & string;
  label: string;
  include?: boolean;
  formatter?: (value: unknown, row: T) => string | number | null;
}

export interface ITableExportConfig<TRow> {
  type: 'table';
  title: string;
  rows: TRow[];
  columns: IColumnExportDefinition<TRow>[];
  visibleColumnKeys?: string[];
  appliedFiltersSummary?: string[];
  totals?: Record<string, number>;
}

export interface IReportSectionConfig {
  key: string;
  title: string;
  narrative?: string;
  chartRef?: string;
  tableRef?: string;
  pageBreakBefore?: boolean;
}

export interface IReportExportConfig {
  type: 'report';
  title: string;
  subtitle?: string;
  coverMetadata?: Record<string, string>;
  sections: IReportSectionConfig[];
  brandingKey?: string;
}

export interface IExportRequest {
  format: ExportFormat;
  context: IExportContext;
  payload: ITableExportConfig<unknown> | IReportExportConfig;
  bicSteps?: IExportBicStepConfig[]; // granular review/approval/handoff steps
  version: VersionedRecord; // from @hbc/versioned-record
  telemetry: IExportTelemetryState;
}

export interface IExportTelemetryState {
  exportCompletionTime: number | null;
  artifactConsistencyRate: number | null;
  handoffLatency: number | null;
  auditTraceabilityScore: number | null;
  exportRuntimeCes: number | null;
}

export interface IExportResult {
  status: ExportStatus;
  artifact?: IExportArtifact;
  message?: string;
  errorCode?: string;
}

export interface IExportAdapter {
  render(request: IExportRequest): Promise<IExportResult>;
}
```

(The entire model, offline logic, AI actions, BIC steps, receipt metadata, and telemetry are now provided by the new `@hbc/export-runtime` primitive.)

---

## Component Architecture

```
packages/export-runtime/src/
├── components/
│   ├── ExportActionMenu.tsx            # user-facing export action trigger
│   ├── ExportFormatPicker.tsx          # CSV / XLSX / PDF / Print selector
│   ├── ExportProgressToast.tsx         # queued / rendering / complete / failed status
│   └── ExportReceiptCard.tsx           # artifact metadata + version/view stamp
├── composers/
│   ├── composeTableExport.ts           # maps table/grid state to export payload
│   ├── composeReportExport.ts          # assembles multi-section report payload
│   └── buildFileName.ts                # centralized naming convention
├── renderers/
│   ├── csvRenderer.ts
│   ├── xlsxRenderer.ts
│   ├── pdfRenderer.ts
│   └── printRenderer.ts
├── adapters/
│   ├── localBrowserExportAdapter.ts    # immediate browser-based export
│   └── serverRenderExportAdapter.ts    # future long-running/server-side export
├── hooks/
│   └── useExportRuntime.ts           # delegates to @hbc/export-runtime
├── templates/
│   ├── brandHeader.ts
│   ├── brandFooter.ts
│   └── reportLayouts.ts
├── types.ts
└── index.ts
```

---

## Component Specifications

### `ExportActionMenu` — Standard Export Trigger

```typescript
interface ExportActionMenuProps {
  availableFormats: ExportFormat[];
  onExport: (format: ExportFormat) => void;
  isBusy?: boolean;
}
```

**Visual behavior:**
- appears in the same location and interaction pattern across modules
- exposes only valid formats for the current payload
- projects BIC owner avatars for review/approval handoff exports
- supports complexity-adaptive behavior:
  - Essential: simple export action limited to CSV/XLSX
  - Standard: full menu with branded PDF/Print options
  - Expert: full menu + report composition entrypoint + configure link

### `composeTableExport` — Shared Table Projection Helper

This helper receives the active table state and converts it into an export payload that can be consumed by CSV/XLSX/PDF renderers.

It should honor:
- selected view / saved view
- visible columns
- applied filters
- sort order
- row selection when exporting a subset

### `composeReportExport` — Report Assembly Layer

This helper assembles:
- title / subtitle
- section order
- metadata stamp
- narrative blocks
- embedded tables / charts
- brand template selection
- receipt card stamps for version/view/export context and sync status

It gives module teams a consistent way to build polished report output without each team writing its own print/PDF assembly stack.

### `ExportReceiptCard` — Post-Export Truth Surface

Shows:
- file name
- format
- export timestamp
- record/version/view state that the artifact reflects
- artifact availability (download ready, render failed, queued, etc.)
- optimistic offline indicators (`Saved locally`, `Queued to sync`)
- projected handoff ownership and deep-link references for downstream review

This is important because the platform should make it obvious what was exported, not just that “something downloaded.”

---

## AI Action Layer Integration

AI suggestions ("Summarize narrative from this table data", "Suggest branded PDF layout from module template", "Explain this version/context stamp in plain English", "Recommend file-naming convention") appear as contextual inline buttons and smart placeholders inside `ExportActionMenu`, the composition layer, and `ExportReceiptCard`.

AI guardrails are mandatory:
- inline only (no sidecar chat)
- source citation required for every recommendation
- explicit user approval required before artifact mutation or persistence
- AI-generated actions can auto-create linked BIC records for review/handoff where configured

This keeps AI assist contextual, auditable, and compatible with immutable export provenance.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/export-runtime` | New Tier-1 primitive providing the entire model |
| `@hbc/bic-next-move` | Granular BIC for review/approval steps and post-export handoffs |
| `@hbc/complexity` | Essential/Standard/Expert progressive disclosure |
| `@hbc/versioned-record` | Immutable provenance, audit trail, snapshot freezing, offline state |
| `@hbc/related-items` | Direct deep-links from every export artifact and receipt row |
| `@hbc/project-canvas` | Automatic placement in role-aware My Work lane |
| `@hbc/export-runtime` telemetry | Five KPIs (export-completion time, artifact-consistency rate, handoff latency, audit-traceability score, export-runtime CES) surfaced in canvas and admin dashboard |

---

## Offline / PWA Resilience

Full tablet-native behavior: service worker caches `ExportActionMenu`, composition surfaces, and `ExportReceiptCard`; IndexedDB + `@hbc/versioned-record` persists export requests and receipt state; Background Sync replays queued export generations with optimistic UI and `Saved locally / Queued to sync` indicators shown on the receipt card.

Operational guarantees:
- queued exports replay in deterministic order with immutable version snapshots
- version/view/context stamps are preserved through offline/online transitions
- failed replays remain queued for retry and surface actionable error details
- ownership avatars and deep-links are restored after reconnect without state drift

---

## Priority & ROI

**Priority:** P1 — should be implemented before polished export patterns diverge across modules; seed for the platform-wide `@hbc/export-runtime` primitive.  
**Estimated build effort:** 4–5 sprint-weeks (now accelerated by reusing existing primitives).  
**ROI:** avoids repeated export logic, standardizes executive-ready outputs, protects artifact quality, and creates a shared artifact engine; measurable impact via UX telemetry.

---

## Definition of Done

- [ ] New `@hbc/export-runtime` Tier-1 primitive created and published
- [ ] All six locked integration patterns implemented and tested
- [ ] Offline/PWA resilience verified on tablet
- [ ] Embedded AI actions with provenance and approval guardrails
- [ ] Progressive disclosure via `@hbc/complexity` across all three modes
- [ ] Deep-links and canvas integration via `@hbc/related-items` and `@hbc/project-canvas`
- [ ] Versioned audit trail and admin governance via `@hbc/versioned-record`
- [ ] Five UX telemetry KPIs wired and surfaced
- [ ] Unit tests, Storybook stories for all modes and offline states
- [ ] ADR-0108-export-runtime-primitive created

---

## ADR Reference

Create `docs/architecture/adr/0108-export-runtime.md` (and companion ADR for the new `@hbc/export-runtime` primitive) documenting the separation between export generation and formal publish workflows, the requirement to preserve record/view/version truth in all artifacts, granular BIC integration, complexity-adaptive disclosure, offline strategy, AI Action Layer embedding, cross-module deep-linking, versioning/governance, and telemetry KPIs.
