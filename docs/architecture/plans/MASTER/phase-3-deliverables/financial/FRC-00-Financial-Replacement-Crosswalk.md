# FRC-00 — Financial Replacement Crosswalk

| Property | Value |
|----------|-------|
| **Doc ID** | FRC-00 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Replacement Crosswalk (master index) |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |
| **Related Contracts** | [P3-E3](../P3-E3-Spreadsheet-Document-Replacement-Reference-Note-Set.md) §2; [P3-E4](../P3-E4-Financial-Module-Field-Specification.md); [P3-E4-T01](../P3-E4-T01-Module-Doctrine-and-Authority.md)–[T09](../P3-E4-T09-Implementation-and-Acceptance.md); [P3-G1](../P3-G1-Lane-Capability-Matrix.md) §4.1; [P3-H1](../P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md) §6.1; [P3-B1](../P3-B1-Project-Context-Continuity-and-Switching-Contract.md); [P3-F1](../P3-F1-Governed-Reporting-System-Contract.md) |

---

## 1. Purpose

This package maps every current-state financial workbook, CSV export, and manual workflow to its future Project Hub Financial runtime equivalent. It extends [P3-E3 §2 (Financial Replacement Notes)](../P3-E3-Spreadsheet-Document-Replacement-Reference-Note-Set.md) from high-level replacement intent to implementation-grade detail with 14 required mapping columns per crosswalk row.

The crosswalk is intended for:

- **Implementation teams** — to know exactly what each current artifact maps to in the future runtime model, including which TypeScript interfaces, repository methods, and route surfaces apply.
- **Acceptance validation** — to trace each acceptance criterion (P3-E4-T09 §20) back to the specific current-state artifact and workflow step it replaces.
- **Migration planning** — to identify what data remains imported/read-only, what becomes native runtime state, and what becomes derived/generated output.
- **Cutover readiness** — to confirm that every current-state process has a clear replacement path before decommissioning workbook-driven workflows.

---

## 2. Scope Boundary

### This package governs

- Per-artifact replacement mapping (current workbook/export → Project Hub Financial surface)
- Current-state source inventory with structure, roles, data flow, and pain points
- Role transition from spreadsheet-based workflows to governed runtime authority model
- Gap identification and open-decision tracking
- Data lineage classification (imported vs. native vs. derived)

### This package does NOT govern

- Module field definitions and data model contracts — see [P3-E4](../P3-E4-Financial-Module-Field-Specification.md) and T01–T09
- Implementation sequencing and staged sub-scopes — see [P3-E4-T09 §17](../P3-E4-T09-Implementation-and-Acceptance.md)
- Acceptance criteria definitions — see [P3-E4-T09 §20](../P3-E4-T09-Implementation-and-Acceptance.md)
- Lane capability differences — see [P3-G1 §4.1](../P3-G1-Lane-Capability-Matrix.md)

---

## 3. Current-State Artifact Summary

The operational baseline consists of 9 files in [`docs/reference/example/financial/`](../../../../reference/example/financial/). These are the real company operating files, not generic examples.

| # | File | Format | Primary Function |
|---|------|--------|------------------|
| 1 | `Procore_Budget.csv` | CSV (21 columns) | Budget baseline and actuals from Procore export |
| 2 | `Financial Forecast Summary & Checklist.xlsx` | Excel | Monthly forecast summary, checklist, and line-level FTC |
| 3 | `GC-GR Forecast.xlsm` | Excel (macro-enabled) | GC/GR projections with VBA-computed variances |
| 4 | `HB Draw Schedule -Cash Flow.xlsx` | Excel | Monthly cash flow projection and draw schedule |
| 5 | `Buyout Log_Template 2025.xlsx` | Excel | Subcontractor buyout procurement tracking |
| 6 | `cash-flow.json` | JSON | Monthly inflows/outflows, cumulative tracking, forecast accuracy |
| 7 | `ar-aging.json` | JSON | A/R aging by project with age buckets and retainage |
| 8 | `Procore budget report.pdf` | PDF | Rendered budget report (consumption artifact) |
| 9 | `budget_details.numbers` | Numbers | Alternate-format budget detail (consumption artifact) |

---

## 4. Findings

### 4.1 What the company actually does today

Project Managers manually maintain 5+ spreadsheets and workbooks per project per month. The budget baseline originates from a Procore CSV export (21 columns, multi-project via Sub Job). Forecast summary, GC/GR projections, cash flow, and buyout tracking each live in separate Excel files that PMs maintain locally and share via email or SharePoint. Monthly review packets are manually assembled from all sources. Portfolio Executives review emailed PDFs. Portfolio Executive Reviewers annotate printed copies.

There is no version immutability, no enforced checklist gate, no annotation audit trail, and no structured approval workflow. GC/GR results are manually transcribed from a macro-enabled workbook into the forecast summary. Buyout completion is tracked by line count, not dollar-weighted.

### 4.2 What must remain imported / read-only

| Data | Current Source | Future Source | Classification |
|------|---------------|---------------|----------------|
| Budget baseline (21 columns) | Procore CSV export | P1-F5 Procore connector (future); CSV import (interim) | Imported |
| A/R aging | ERP (Sage Intacct) | P1-F6 Sage Intacct connector (future); JSON reference (interim) | Imported, read-only |
| Cash flow actuals | Accounting system records | Accounting system sync | Imported, read-only |
| Cost code dictionary | `cost-code-dictionary.csv` (7,566 CSI codes) | Reference data loader | Imported, read-only |

### 4.3 What must become native runtime state

| Data | Current Process | Future Runtime State |
|------|----------------|---------------------|
| Forecast-to-complete edits | PM edits FTC in Excel, no provenance | `IBudgetLineItem.forecastToComplete` on Working version with edit provenance |
| GC/GR line projections | PM maintains macro workbook, manually transcribes | `IGCGRLine` records on Working version; aggregation auto-feeds summary |
| Forecast checklist completion | Tabs in Excel; no enforcement | `IForecastChecklistItem` with gate that blocks version confirmation |
| Buyout procurement status | Excel template, count-based tracking | `IBuyoutLineItem` with 7-state lifecycle and dollar-weighted completion |
| Savings disposition | Not tracked | `IBuyoutSavingsDisposition` with 3-destination workflow |
| Cash flow forecasts | PM edits Excel grid | `ICashFlowForecastRecord` on Working version |
| Forecast version lifecycle | Does not exist | Working → ConfirmedInternal → ReportCandidate → PublishedMonthly |
| Forecast summary fields | PM fills summary tab in Excel | `IFinancialForecastSummary` with PM-editable and calculated fields |

### 4.4 What must become derived / generated outputs

| Output | Current Process | Future Derivation |
|--------|----------------|-------------------|
| EAC per budget line | Excel formula | `costExposureToDate + forecastToComplete` (auto-recomputed) |
| Over/under variance | Excel formula | `revisedBudget - EAC` (positive = favorable) |
| Profit margin | Manual calculation in summary | `currentProfit / currentContractValue × 100` with alerts |
| GC variance | VBA macro in `.xlsm` | `computeGCGRVariances()` from GC/GR line aggregation |
| Buyout dollar-weighted completion | Not computed (count-based) | `sum(contractAmount for executed) / totalBudget × 100` |
| Cumulative cash flow | Excel running sum | `computeCumulativeCashFlowSeries()` |
| Forecast accuracy | Not tracked | Actual-vs-prior-forecast comparison per month |
| Health spine metrics | Do not exist | 10 metrics published on version confirmation |
| Work queue items | Do not exist | 8 item types triggered by business rule conditions |
| Annotation carry-forward | Does not exist | Auto-copied on version derivation with value-change detection |

### 4.5 Required review gates

| Gate | Current Process | Future Enforcement |
|------|----------------|-------------------|
| Forecast checklist completion | Honor system; no enforcement | `IConfirmationGateResult` blocks Working → ConfirmedInternal |
| Report-candidate designation | Does not exist | `isReportCandidate = true` on one ConfirmedInternal version per project |
| Executive review annotation | Printed copy markup | `@hbc/field-annotations` with version-aware anchors on ConfirmedInternal/PublishedMonthly |
| Report publication handoff | Manual email distribution | P3-F1 `ReportPublishedEvent` callback promotes to PublishedMonthly (B-FIN-03) |
| Buyout compliance gate | Not enforced | `ContractExecuted` blocked until P3-E12 checklist satisfied |

### 4.6 Required backend ties

| Component | Status | Location |
|-----------|--------|----------|
| `IFinancialRepository` port (8 methods) | Implemented, **NOT registered in factory** | `packages/data-access/src/ports/IFinancialRepository.ts` |
| `MockFinancialRepository` (332 lines) | Complete | `packages/data-access/src/adapters/mock/MockFinancialRepository.ts` |
| Financial domain types (628 lines) | Complete (T04 types pending) | `packages/features/project-hub/src/financial/types/index.ts` |
| Financial computors, validation, governance | Complete | `packages/features/project-hub/src/financial/` |
| P1-F5 Procore connector | Planned (future) | CSV import is interim path |
| P1-F6 Sage Intacct connector | Planned (future) | JSON reference is interim path |

### 4.7 Required surfacing model

The Financial module surfaces under Project Hub at `/project-hub/$projectId/financial/` with sub-sections:

| Sub-Section | Route | PWA Depth | SPFx Depth |
|-------------|-------|-----------|------------|
| Budget | `/financial/budget` | Full (import, grid, inline FTC edit, export) | Broad (grid view, FTC edit) |
| Forecast | `/financial/forecast` | Full (summary, checklist, version lifecycle) | Broad (summary view, checklist) |
| GC/GR | `/financial/gcgr` | Full (line editing, variance analysis) | Broad (view, basic edits) |
| Cash Flow | `/financial/cash-flow` | Full (actual + forecast grid, charts, A/R aging) | Broad (summary view) |
| Buyout | `/financial/buyout` | Full (lifecycle, savings disposition) | Broad (status view; disposition escalates to PWA) |

Per [P3-G1 §4.1](../P3-G1-Lane-Capability-Matrix.md): PWA = Full depth; SPFx = Broad (CRUD, no deep forecasting workflows).

---

## 5. File Index

| File | Part | Contents |
|------|------|----------|
| **[FRC-01-Source-Inventory.md](FRC-01-Source-Inventory.md)** | Source Inventory | Per-file inventory of all 9 current-state operating files with structure, roles, data flow, and pain points; composite monthly review workflow |
| **[FRC-02-Detailed-Crosswalk.md](FRC-02-Detailed-Crosswalk.md)** | Detailed Crosswalk | 14-column mapping table organized by current artifact (~41 rows across 7 sections) |
| **[FRC-03-Implementation-Implications.md](FRC-03-Implementation-Implications.md)** | Implementation Implications | Gap analysis, role transition, data lineage, backend seams, open decisions, recommended sequencing |

---

## 6. Reading Guide

- **For current-state artifact details:** [FRC-01](FRC-01-Source-Inventory.md) — deep inventory of each operating file
- **For the complete replacement mapping:** [FRC-02](FRC-02-Detailed-Crosswalk.md) — every current artifact/tab/section mapped to its future runtime equivalent
- **For gaps, open decisions, and next steps:** [FRC-03](FRC-03-Implementation-Implications.md) — what is built, what is missing, and recommended sequencing
- **For field definitions and data model:** [P3-E4 T01–T09](../P3-E4-Financial-Module-Field-Specification.md) — the governing specification
- **For acceptance criteria:** [P3-E4-T09 §20](../P3-E4-T09-Implementation-and-Acceptance.md) — 48 acceptance gate items

---

*Navigation: [FRC-01 Source Inventory →](FRC-01-Source-Inventory.md) | [FRC-02 Detailed Crosswalk →](FRC-02-Detailed-Crosswalk.md) | [FRC-03 Implementation Implications →](FRC-03-Implementation-Implications.md)*
