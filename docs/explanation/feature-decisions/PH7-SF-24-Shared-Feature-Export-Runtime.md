# PH7-SF-24: Export Runtime — Shared Branded Output, Table Export & Report Rendering Infrastructure

**Priority Tier:** 2 — Application Layer (shared package; cross-module output infrastructure)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Addendum A — Recommended package candidate (not yet interview-locked)
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

---

## Mold Breaker Rationale

The Work Graph and Implementation Truth principles both matter here. A user should be able to export what the system actually knows — not a disconnected screenshot or an ad hoc report whose relationship to the underlying record is ambiguous. Export should be a reliable projection of record state, selected filters, visible columns, or a configured report narrative.

`@hbc/export-runtime` is the package that makes output trustworthy and reusable:

1. It provides a normalized way to turn tables, reports, and summary cards into artifacts.
2. It keeps file structure, naming, branding, and formatting consistent across modules.
3. It preserves context: filters, sort order, selected record version, and export timestamp.
4. It becomes the base layer for formal publishing workflows without itself taking on approval and governance responsibilities.

This package is not a one-off report generator. It is the platform’s shared output engine.

---

## Export Runtime Model

The package should support several export intents while keeping the data-to-artifact path explicit.

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
4. Generate artifact
5. Return artifact metadata, filename, status, and optional publish hook

### Supported Output Formats
- `csv`
- `xlsx`
- `pdf`
- `print`
- future: `json`, `pptx` packaging hook if ever needed

---

## Export Surface Structure

The package should support two shared output structures:

### Structure A — Table Export
For:
- data grids
- filtered work queues
- logs
- benchmark tables
- schedule or cost tables

Includes:
- column mapping
- visible column honor / override rules
- formatting transforms
- totals/footer rows
- filter/sort stamp in metadata

### Structure B — Report Export
For:
- narrative summaries
- scorecards
- meeting/report packets
- executive-ready one-pagers
- multi-section review outputs

Includes:
- title page / cover metadata
- section composition
- brand header/footer
- charts/tables inserted from configured adapters
- issue/version metadata

---

## Interface Contract

```typescript
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
│   └── useExportRuntime.ts
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
- shows artifact type hints such as “Export filtered table to XLSX” or “Export current report snapshot to PDF”
- disables unavailable formats rather than hiding them silently

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

It gives module teams a consistent way to build polished report output without each team writing its own print/PDF assembly stack.

### `ExportReceiptCard` — Post-Export Truth Surface

Shows:
- file name
- format
- export timestamp
- record/version/view state that the artifact reflects
- artifact availability (download ready, render failed, etc.)

This is important because the platform should make it obvious what was exported, not just that “something downloaded.”

---

## Output Truth & Version Discipline

The package should preserve export truth by stamping:

- export timestamp
- module and record context
- record version ID where applicable
- active saved-view ID or filter summary where applicable
- exporting user identity
- export format and file name

When a user exports a scorecard, log, or report, the artifact should be traceable to the system state that produced it. That traceability is what differentiates a controlled operational platform from generic ad hoc exports.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/ui-kit` | action menus, dialogs, layout sections, status toasts |
| `@hbc/versioned-record` | optional record-version stamp on artifact metadata |
| `@hbc/saved-views` | exports can honor current view definitions and filter states |
| `@hbc/activity-timeline` | optional event emission that an export occurred |
| `@hbc/publish-workflow` | publishes artifacts that were first generated by export-runtime |
| `@hbc/data-access` | future server-side export jobs and artifact retrieval |
| domain chart/table packages | source projections for report sections |

---

## Expected Consumers

- Business Development: scorecards, pursuit summaries, strategic intelligence packets
- Estimating: bid summaries, comparison tables, review outputs
- Project Hub: meeting minutes packages, logs, report packets, turnover-related exports
- Executive dashboards: forecast summaries, variance tables, KPI packets
- Scheduler / analytics: status snapshots, milestone tables, comparison reports
- Admin / governance: audit extracts, configuration lists, change logs

---

## Priority & ROI

**Priority:** P1 — should be implemented before polished export patterns diverge across modules  
**Estimated build effort:** 4–5 sprint-weeks (projection helpers, renderer pipeline, action menu, naming rules, version/context stamps, basic PDF/XLSX support)  
**ROI:** avoids repeated export logic, standardizes executive-ready outputs, protects artifact quality, and creates a shared artifact engine that future publish workflows can build on

---

## Definition of Done

- [ ] export contracts defined for table and report payloads
- [ ] CSV and XLSX renderers implemented
- [ ] PDF / print renderer path implemented for branded reports
- [ ] centralized file naming convention implemented
- [ ] `ExportActionMenu` implemented with standard UX pattern
- [ ] table projection helper honors columns, filters, sort order, and optional row selection
- [ ] report composition helper supports multi-section exports
- [ ] export receipt includes version/view/timestamp metadata
- [ ] export failure states normalized and user-visible
- [ ] optional event emission hook available for timeline tracking
- [ ] unit tests on file naming, projection helpers, renderer contracts, and error handling
- [ ] E2E test: export filtered table to XLSX and export report snapshot to PDF

---

## ADR Reference

Create `docs/architecture/adr/0033-export-runtime.md` documenting the separation between export generation and formal publish workflows, the requirement to preserve record/view/version truth in all artifacts, the supported renderer strategy, and the decision to make artifact composition a shared platform service rather than a per-module implementation.
