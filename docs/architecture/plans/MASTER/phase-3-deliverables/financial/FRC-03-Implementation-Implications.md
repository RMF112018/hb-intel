# FRC-03 — Financial Implementation Implications

| Property | Value |
|----------|-------|
| **Doc ID** | FRC-03 |
| **Parent** | [FRC-00 Financial Replacement Crosswalk](FRC-00-Financial-Replacement-Crosswalk.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Implementation Implications |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file analyzes the gaps, role transitions, data lineage, backend seams, and open decisions identified by the crosswalk in [FRC-02](FRC-02-Detailed-Crosswalk.md). It provides recommended sequencing for remaining implementation work.*

---

## 1. Implementation Status Summary

Based on [P3-E4-T09 §17](../P3-E4-T09-Implementation-and-Acceptance.md) staged sub-scopes and verified repo truth:

| Stage | Scope | Status | Evidence |
|-------|-------|--------|----------|
| FIN.0 | Blocker resolution assessment | **COMPLETE** | B-FIN-01/02 resolved; B-FIN-03 stub implemented |
| FIN.1 | Data model foundation | **COMPLETE** (T04 pending) | Types T01–T03, T05–T08 in `src/financial/types/index.ts` (628 lines) |
| FIN.2 | Budget line identity and import pipeline | **COMPLETE** | `src/financial/import/`, `src/financial/validation/`; 35 tests passing |
| FIN.3 | Forecast ledger versioning and checklist | **COMPLETE** | `src/financial/versioning/`, `src/financial/governance/`; 19 tests passing |
| FIN.4 | Forecast summary and GC/GR working model | **PENDING T04** | Computation functions exist; `IFinancialForecastSummary` and `IGCGRLine` interfaces not in source |
| FIN.5 | Cash flow working model | **COMPLETE** | `src/financial/cash-flow/`; 27 tests passing |
| FIN.6 | Buyout sub-domain | **COMPLETE** | `src/financial/buyout/`; 25 tests passing |
| FIN.7 | FTC editing and budget line UX | **COMPLETE** | `src/financial/business-rules/`; 33 tests passing |
| FIN.8 | Executive review annotation integration | **COMPLETE** | `src/financial/annotations/`, `src/financial/spine-events/`; 28 tests passing |
| FIN.9 | P3-F1 integration, export, acceptance | **PARTIAL** | `promoteToPublished()` stub ready; B-FIN-03 integration contract pending; UAT scope |

**Summary:** Domain logic is substantially complete (233+ tests across 19 test files). The primary gaps are the T04 data model, factory registration, PWA surfaces, and P3-F1 integration.

### Acceptance gate status (P3-E4-T09 §20)

- **37 of 48** acceptance criteria satisfied at contract level
- **4 items** pending T04 data model (AC-FIN-22 through AC-FIN-25)
- **7 items** are runtime/integration/UAT scope (AC-FIN-04, AC-FIN-30, AC-FIN-43, AC-FIN-44, AC-FIN-47, AC-FIN-48)

---

## 2. Gaps Identified by Crosswalk

### 2.1 T04 data model interfaces

**Gap:** `IFinancialForecastSummary` and `IGCGRLine` are imported by `IFinancialRepository` (from `@hbc/features-project-hub`) but are not defined in `packages/features/project-hub/src/financial/types/index.ts`. They exist only in the compiled `dist/` output.

**Impact:** Blocks FIN.4 completion, Forecast Summary surface, GC/GR surface, and acceptance criteria AC-FIN-22 through AC-FIN-25.

**Resolution:** Define `IFinancialForecastSummary` and `IGCGRLine` interfaces in source per P3-E4-T04 specification. Computation functions already exist and reference these types.

### 2.2 IFinancialRepository factory registration

**Gap:** `IFinancialRepository` port is implemented at `packages/data-access/src/ports/IFinancialRepository.ts` (8 methods). `MockFinancialRepository` is implemented at `packages/data-access/src/adapters/mock/MockFinancialRepository.ts` (332 lines). Neither is exported from `ports/index.ts` nor registered in the data-access `factory.ts`.

**Impact:** Blocks any PWA page that needs to query financial data through the standard data-access pattern. Currently 11 repositories are registered; Financial is the 12th.

**Resolution:** Export `IFinancialRepository` from `ports/index.ts`; add `createFinancialRepository()` to `factory.ts`.

### 2.3 PWA Financial pages

**Gap:** Only `apps/pwa/src/pages/AccountingPage.tsx` exists as a placeholder with hardcoded mock data (summary cards for Total Budget, Spent to Date, Remaining, % Complete). No budget, forecast, cash-flow, or buyout pages exist. No hooks or components consume `IFinancialRepository`.

**Impact:** Blocks all user-facing Financial module functionality. The entire domain logic layer is ready but has no UI surface.

**Resolution:** Create PWA pages for each financial sub-section under `/project-hub/$projectId/financial/`. Pages should consume `IFinancialRepository` through the standard hook pattern and apply governance computations from `@hbc/features-project-hub/financial`.

### 2.4 Route registration

**Gap:** Current routes support only `/project-hub/$projectId/health` and `/project-hub/$projectId/reports` as Project Hub sections. No `/financial` route or sub-routes exist in `apps/pwa/src/router/workspace-routes.ts`.

**Impact:** Blocks navigation to Financial module surfaces. Users cannot reach any financial pages from Project Hub.

**Resolution:** Register `/project-hub/$projectId/financial` with sub-routes for `budget`, `forecast`, `gcgr`, `cash-flow`, `buyout`.

### 2.5 B-FIN-03 — P3-F1 report publication handoff

**Gap:** P3-F1 does not yet define a `ReportPublishedEvent` or equivalent callback. The Financial module has a `promoteToPublished()` stub ready to accept this event, but the integration contract is pending.

**Impact:** Blocks the `ConfirmedInternal → PublishedMonthly` version transition. The monthly review/release cycle cannot be fully closed without this.

**Resolution:** Pending P3-F1 resolution. The Financial module is structurally ready; wiring is a one-line connection when the event schema is defined.

---

## 3. Role Transition Map

| Current Role | Current Workflow | Future Authority Role | Future Access |
|-------------|-----------------|----------------------|---------------|
| **PM** | Edits 5+ spreadsheets; assembles review packet; emails to PE | `PM` (`FinancialAuthorityRole`) | Write access on `Working` version; read on all versions; cannot annotate; initiates confirmation and report-candidate designation |
| **PE** | Reviews emailed PDFs; provides feedback informally | `Leadership` (`FinancialAuthorityRole`) | Project-scoped read access on confirmed and published versions; cannot edit; cannot annotate |
| **PER** | Annotates printed copies; discusses in review meetings | `PER` (`FinancialAuthorityRole`) | Annotate access on `ConfirmedInternal` and `PublishedMonthly`; `Working` version hidden; push-to-project-team via work queue |
| **Accounting** | Exports from Procore; manages A/R; billing | System / Connector | Budget import trigger (CSV upload; future P1-F5 API); A/R aging source (future P1-F6 sync) |
| **Leadership** | Receives final distributed packet | `Leadership` | Read access on published versions; consumption via P3-F1 reports |

---

## 4. Data Lineage: Imported vs Native vs Derived

| Runtime Record | Type | Data Origin | Source |
|---------------|------|-------------|--------|
| `IBudgetLineItem` (budget fields) | Imported | Procore CSV / P1-F5 API | External |
| `IBudgetLineItem.forecastToComplete` | Native | PM edits on Working version | Internal |
| `IBudgetLineItem.estimatedCostAtCompletion` | Derived | `costExposureToDate + forecastToComplete` | Computed |
| `IBudgetLineItem.projectedOverUnder` | Derived | `revisedBudget - EAC` | Computed |
| `IFinancialForecastSummary` (editable fields) | Native | PM edits on Working version | Internal |
| `IFinancialForecastSummary` (calculated fields) | Derived | Business rule computations | Computed |
| `IGCGRLine` | Native | PM edits on Working version | Internal |
| `IGCGRVarianceResult` | Derived | `computeGCGRVariances()` | Computed |
| `IForecastVersion` | Native | Version lifecycle transitions | Internal |
| `IForecastChecklistItem` | Native | PM toggles completion | Internal |
| `IConfirmationGateResult` | Derived | Gate validation logic | Computed |
| `ICashFlowActualRecord` | Imported | Accounting system | External |
| `ICashFlowForecastRecord` | Native | PM edits on Working version | Internal |
| `ICashFlowSummary` | Derived | `computeCashFlowSummary()` | Computed |
| `IARAgingRecord` | Imported | ERP daily sync (read-only) | External |
| `IBuyoutLineItem` | Native | PM creates and maintains | Internal |
| `IBuyoutSummaryMetrics` | Derived | `computeBuyoutSummaryMetrics()` | Computed |
| `IBuyoutSavingsDisposition` | Native | PM disposition actions | Internal |
| `IFinancialActivityEvent` | Derived | Spine event factories | Computed |
| `IFinancialHealthMetric` | Derived | `createFinancialHealthSnapshot()` | Computed |
| `IFinancialWorkQueueItem` | Derived | Business rule conditions | Computed |
| `IFinancialAnnotationAnchor` | Native | PER annotation actions | Internal |
| `ICarriedForwardAnnotation` | Derived | Version derivation carry-forward | Computed |

---

## 5. Repository and Backend Seam Analysis

### 5.1 IFinancialRepository port interface

Located at `packages/data-access/src/ports/IFinancialRepository.ts`. Defines 8 methods:

| Method | Purpose | Crosswalk Section |
|--------|---------|-------------------|
| `getFinancialData(projectId)` | Retrieve all financial data for current working forecast | §2–§7 (all surfaces) |
| `updateBudgetLineFTC(projectId, lineId, forecastToComplete)` | Edit FTC on a budget line | §2 (FTC Working Model) |
| `updateGCGRLine(projectId, lineId, edits)` | Edit GC/GR line EAC or notes | §5 (GC/GR) |
| `toggleChecklistItem(projectId, itemId, completed, completedBy)` | Toggle checklist item completion | §4 (Forecast Checklist) |
| `confirmVersion(projectId, confirmedBy)` | Working → ConfirmedInternal | §8 (Version Confirmation) |
| `deriveVersion(projectId, reason, createdBy)` | Create new Working from confirmed | §8 (Version Lifecycle) |
| `designateCandidate(projectId)` | Set report-candidate flag | §8 (Report Candidate) |
| `updateForecastSummary(projectId, field, value)` | Edit forecast summary field | §3 (Forecast Summary) |

Return type for all mutation methods: `Promise<IFinancialRawData>` — full data reload for cache replacement. `IFinancialRawData` aggregates: `version`, `summary`, `budgetLines`, `gcgrLines`, `buyoutLines`, `checklist`, `cashFlowActuals`, `cashFlowForecasts`.

### 5.2 MockFinancialRepository

Located at `packages/data-access/src/adapters/mock/MockFinancialRepository.ts` (332 lines). Complete in-memory implementation that:

- Seeds test data on first access per project
- Maintains budget lines, GC/GR lines, buyout lines, checklist, cash flow actual/forecast records
- Implements all 8 methods with full business logic
- Ready for PWA development before real backend exists

### 5.3 Factory registration gap

`packages/data-access/src/ports/index.ts` exports 11 repository interfaces. `IFinancialRepository` is not among them. `factory.ts` registers 11 repository creators. `MockFinancialRepository` is not registered.

**Action required:** Add export and factory registration to enable standard data-access consumption.

### 5.4 Connector dependencies

| Connector | Purpose | Status | Impact |
|-----------|---------|--------|--------|
| P1-F5 Procore | Budget import via API (replaces CSV) | Future | B-FIN-04; CSV path is functional interim |
| P1-F6 Sage Intacct | A/R aging daily sync | Future | JSON reference is functional interim |

---

## 6. Open Decisions

### 6.1 Cash flow structured upload

**Question:** Should Phase 3 support a structured cash flow data upload (e.g., CSV import for forecast months), or should all cash flow forecast data be manually entered?

**Context:** P3-E4-T09 §19 lists "Cash flow manual entry or import: PM enters 18-month forecast manually or via spreadsheet upload" but does not specify whether structured upload is in Phase 3 scope.

**Recommendation:** Defer structured upload to post-Phase 3. Manual entry is sufficient for initial delivery. The `ICashFlowForecastRecord` interface supports either entry path.

### 6.2 Draw schedule surface

**Question:** Does the draw schedule component of `HB Draw Schedule -Cash Flow.xlsx` map to a distinct future surface, or is it absorbed entirely into the cash flow working model?

**Context:** The current workbook combines draw schedule timing with cash flow projections. The Future model has `ICashFlowForecastRecord` with `calendarDate` alignment but no separate draw schedule entity.

**Recommendation:** Absorb into cash flow model. Draw schedule timing is captured via the `calendarDate` field on forecast records. If a distinct draw schedule surface is needed later, it can be added without breaking the cash flow model.

### 6.3 T04 implementation priority

**Question:** Should T04 data model interfaces (`IFinancialForecastSummary`, `IGCGRLine`) be implemented before or in parallel with PWA surface work?

**Context:** T04 interfaces are imported by `IFinancialRepository` and consumed by the mock repository. PWA Forecast Summary and GC/GR pages cannot be built without them.

**Recommendation:** T04 types first. They unblock FIN.4, acceptance criteria AC-FIN-22 through AC-FIN-25, and both the Forecast Summary and GC/GR PWA surfaces.

### 6.4 SPFx lane depth for buyout savings disposition

**Question:** Should SPFx support the buyout savings disposition workflow inline, or should it escalate to PWA?

**Context:** P3-G1 §4.1 lists Financial as SPFx Broad, but the savings disposition workflow involves modal approval steps. P3-E4-T09 §18.4 notes this gap and recommends a Launch-to-PWA escalation path.

**Recommendation:** Escalate to PWA. Add a "Launch-to-PWA" capability for savings disposition in P3-G1 §4.1 per the follow-up note in T09 §18.4.

---

## 7. Acceptance Crosswalk

Traceability from acceptance gate items (P3-E4-T09 §20) to crosswalk sections in [FRC-02](FRC-02-Detailed-Crosswalk.md):

| AC Item | Description | FRC-02 Section | Current Artifact |
|---------|-------------|----------------|------------------|
| AC-FIN-01–07 | Budget line identity and import | §2 (Procore Budget) | `Procore_Budget.csv` |
| AC-FIN-08–14 | Budget line working model | §2 (FTC, EAC, Over/Under rows) | `Procore_Budget.csv` |
| AC-FIN-15–21 | Forecast ledger versioning | §4 (Checklist), §8 (Version Lifecycle) | `Financial Forecast Summary & Checklist.xlsx` |
| AC-FIN-22–25 | Forecast summary and GC/GR | §3 (Forecast Summary), §5 (GC/GR) | `Financial Forecast Summary & Checklist.xlsx`, `GC-GR Forecast.xlsm` |
| AC-FIN-26–30 | Cash flow model | §6 (Cash Flow) | `HB Draw Schedule -Cash Flow.xlsx`, `cash-flow.json`, `ar-aging.json` |
| AC-FIN-31–36 | Buyout sub-domain | §7 (Buyout Log) | `Buyout Log_Template 2025.xlsx` |
| AC-FIN-37–39 | Platform integration | §2–§8 (spine events across all surfaces) | All artifacts |
| AC-FIN-40–42 | Executive review annotation | §8 (Monthly Review) | Composite workflow |
| AC-FIN-43–48 | Quality and integration | §2–§8 (all surfaces) | All artifacts |

---

## 8. Recommended Sequencing

Based on crosswalk dependency analysis and gap severity:

| Priority | Work Item | Unblocks | Estimated Complexity |
|----------|-----------|----------|---------------------|
| **1** | T04 data model interfaces (`IFinancialForecastSummary`, `IGCGRLine`) | FIN.4; AC-FIN-22–25; Forecast Summary and GC/GR surfaces | Low (interface definitions; computation functions exist) |
| **2** | `IFinancialRepository` factory registration | All PWA pages | Low (export + factory entry) |
| **3** | PWA Budget page | FTC editing, import UI, reconciliation UI; AC-FIN-04 | Medium (highest data volume, import workflow) |
| **4** | PWA Forecast Summary + Checklist page | Version lifecycle, confirmation gate; core monthly workflow | Medium (multi-tab surface, version state management) |
| **5** | PWA GC/GR page | GC/GR editing, variance display; feeds Forecast Summary | Medium (line editing grid, category management) |
| **6** | PWA Cash Flow page | Actual + forecast grid, charts, A/R aging display; AC-FIN-30 | Medium (chart rendering, dual-mode grid) |
| **7** | PWA Buyout page | Buyout lifecycle, savings disposition; AC-FIN-32 UI | Medium (lifecycle management, disposition workflow) |
| **8** | B-FIN-03 integration with P3-F1 | PublishedMonthly promotion; monthly review cycle closure | Low (wiring stub to P3-F1 event when available) |
| **9** | Route registration | Navigation to all Financial surfaces | Low (add routes to workspace-routes.ts) |
| **10** | Performance benchmarks and UAT | AC-FIN-43, AC-FIN-44, AC-FIN-48 | Medium (benchmarking, multi-project UAT) |

**Note:** Items 1–2 are prerequisites and should be completed first. Items 3–7 can proceed in parallel after prerequisites are met. Items 8–10 are integration and validation scope.

---

## 9. Related Implementation-Grade References

For deeper implementation detail beyond the scope of this gap/sequencing analysis:

- **Runtime record family, mutability matrix, backend ties, workflow states, cutover readiness:** [FRC-04](FRC-04-Runtime-Record-Family.md)
- **Field-level mappings, edit/recompute workflows, three-way gap analysis (15 gaps):** [FRC-05](FRC-05-Field-Level-Mapping.md)

---

*Navigation: [← FRC-02 Detailed Crosswalk](FRC-02-Detailed-Crosswalk.md) | [FRC-00 Master Index](FRC-00-Financial-Replacement-Crosswalk.md) | [FRC-04 Runtime Record Family →](FRC-04-Runtime-Record-Family.md)*
