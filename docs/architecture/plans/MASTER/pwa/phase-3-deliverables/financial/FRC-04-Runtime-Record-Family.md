# FRC-04 — Financial Runtime Record Family

| Property | Value |
|----------|-------|
| **Doc ID** | FRC-04 |
| **Parent** | [FRC-00 Financial Replacement Crosswalk](FRC-00-Financial-Replacement-Crosswalk.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Runtime Record Family |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the complete runtime record family for the Financial replacement model, the mutability/ownership matrix for every record, the backend ties for each domain, and the workflow-state machine governing the forecast lifecycle.*

---

## 1. Runtime Record Family

The Financial module's runtime model is organized into 7 domain groups. Each record is mapped to its governing T-file, its repo-truth implementation status, and its TypeScript interface name when implemented.

### 1.1 Budget Import Domain

| # | Record | Interface | T-File | Repo Status | Description |
|---|--------|-----------|--------|-------------|-------------|
| 1 | **BudgetImportBatch** | `IBudgetImportResult` | T02 §3.5 | **Implemented** `src/financial/import/` | Aggregate result of a CSV import operation: batch ID, matched/created/ambiguous counts, validation errors |
| 2 | **BudgetLine** | `IBudgetLineItem` | T02 §3.1 | **Implemented** `src/financial/types/` | 26-field budget line: identity, cost codes, budget amounts, cost exposure, PM forecast, edit provenance |
| 3 | **BudgetImportRow** | `IBudgetImportRow` | T02 §3.5 | **Implemented** `src/financial/types/` | Raw CSV row before transformation (all string values) |
| 4 | **BudgetLineReconciliation** | `IBudgetLineReconciliationCondition` | T02 §2.5 | **Implemented** `src/financial/types/` | Ambiguous match condition requiring PM resolution (MergedInto or CreatedNew) |
| 5 | **IdentityResolution** | `IIdentityResolutionResult` | T02 §2.3 | **Implemented** `src/financial/types/` | Per-row identity outcome: matched, new, or ambiguous |

### 1.2 Forecast Version Domain

| # | Record | Interface | T-File | Repo Status | Description |
|---|--------|-----------|--------|-------------|-------------|
| 6 | **ForecastVersion** | `IForecastVersion` | T03 §3.3 | **Implemented** `src/financial/types/` | Version ledger entry: ID, state, reporting month, derivation chain, report-candidate flag, confirmation/publication timestamps |
| 7 | **ForecastSummarySnapshot** | `IFinancialForecastSummary` | T04 §5 | **In dist/ only** — not in source | Version-scoped summary: project metadata, schedule, financial summary, contingency, GC aggregate. 24 fields. |
| 8 | **ForecastChecklistItem** | `IForecastChecklistItem` | T03 §4.2 | **Implemented** `src/financial/types/` | Per-version checklist entry: group, label, completion state, provenance |
| 9 | **ForecastChecklistTemplate** | `IForecastChecklistTemplateEntry` | T03 §4.1 | **Implemented** `src/financial/types/` | Static template (19 items across 4 groups) for checklist generation |
| 10 | **ForecastConfirmationAttestation** | `IConfirmationGateResult` | T03 §4.3 | **Implemented** `src/financial/governance/` | Gate validation result: `canConfirm` boolean + blocker list. Not a persisted record — computed on demand. |
| 11 | **ReportCandidateDesignation** | `IReportCandidateDesignationResult` | T03 §3.6 | **Implemented** `src/financial/types/` | Result of designating a report candidate: designated version + cleared prior candidate |

**Note on ForecastNarrativeSection:** The governing spec (P3-E4) does not define a standalone narrative section record. Free-text narrative is captured via `IForecastVersion.notes`, `IBudgetLineItem.notes`, and `IForecastChecklistItem.notes`. If a structured narrative per reporting section is needed, it would be an extension requiring an ADR. **Status: Not in scope for Phase 3.**

### 1.3 Forecast Summary and GC/GR Domain

| # | Record | Interface | T-File | Repo Status | Description |
|---|--------|-----------|--------|-------------|-------------|
| 12 | **ForecastSummarySnapshot** | `IFinancialForecastSummary` | T04 §5 | **In dist/ only** | 24 fields: project metadata (name, number, contractType, projectType), schedule (originalCompletion, approvedDays, revisedCompletion), financial (contractValue, EAC, profit, margin), contingency (original, current, expected, use), GC (originalEstimate, EAC) |
| 13 | **GCGRLine** | `IGCGRLine` | T04 §6.1 | **In dist/ only** | 17-field version-scoped overhead line: division identity, GC/GR category, budget, EAC, variance per GC and GR, notes, edit provenance |
| 14 | **GCGRVariance** | `IGCGRVarianceResult` | T07 §10.4 | **Implemented** `src/financial/types/` | Computed variance aggregate: gcVariance, grVariance, totalVariance |

**ForecastSummarySnapshot field inventory** (from dist/ `IFinancialForecastSummary`):

| Field | Type | Editable | Derivation |
|-------|------|----------|------------|
| `forecastVersionId` | `string` | No | FK to version |
| `projectId` | `string` | No | FK to project |
| `projectName` | `string` | No | From project record |
| `projectNumber` | `string` | No | From project record |
| `contractType` | `FinancialContractType` | PM on Working | GMP, LumpSum, CostPlus, UnitPrice, TimeAndMaterials |
| `projectType` | `FinancialProjectType` | PM on Working | Commercial, Residential, Healthcare, Education, Industrial, Infrastructure, Other |
| `damageClauseLDs` | `string \| null` | PM on Working | Free text |
| `originalContractCompletion` | `string` | PM on Working | Date |
| `approvedDaysExtensions` | `number` | PM on Working | Calendar days |
| `revisedContractCompletion` | `string` | No | **Derived**: original + extensions |
| `originalContractValue` | `number` | No | From contract |
| `originalEstimatedCost` | `number` | No | From initial budget |
| `originalProfit` | `number` | No | **Derived**: originalContractValue - originalEstimatedCost |
| `originalBuyoutSavings` | `number` | No | **Derived**: from initial buyout |
| `currentContractValue` | `number` | PM on Working | Current contract amount |
| `estimatedCostAtCompletion` | `number` | No | **Derived**: sum of budget line EACs + GC EAC |
| `currentProfit` | `number` | No | **Derived**: currentContractValue - EAC |
| `profitMargin` | `number` | No | **Derived**: currentProfit / currentContractValue × 100 |
| `originalContingency` | `number` | No | From initial setup |
| `currentContingency` | `number` | PM on Working | Affected by buyout savings HeldInContingency |
| `expectedContingencyAtCompletion` | `number` | PM on Working | PM projection |
| `expectedContingencyUse` | `number` | No | **Derived**: currentContingency - expectedContingencyAtCompletion |
| `originalGCEstimate` | `number` | No | From initial budget |
| `gcEstimateAtCompletion` | `number` | No | **Derived**: aggregated from IGCGRLine records |

**GCGRLine field inventory** (from dist/ `IGCGRLine`):

| Field | Type | Editable | Derivation |
|-------|------|----------|------------|
| `gcGrId` | `string` | No | UUID |
| `forecastVersionId` | `string` | No | FK to version |
| `projectId` | `string` | No | FK to project |
| `divisionNumber` | `string` | PM on Working | Division identifier |
| `divisionDescription` | `string` | PM on Working | Description |
| `gcGrCategory` | `GCGRCategory` | PM on Working | 11-value enum: Labor, Material, Equipment, Subcontract, Supervision, Insurance, BondsInsurance, TaxPermit, FieldOffice, Miscellaneous, Other |
| `originalGCBudget` | `number` | No | From initial budget |
| `gcEstimateAtCompletion` | `number` | PM on Working | PM projection |
| `gcVariance` | `number` | No | **Derived**: originalGCBudget - gcEstimateAtCompletion |
| `originalGRBudget` | `number` | No | From initial budget |
| `grEstimateAtCompletion` | `number` | PM on Working | PM projection |
| `grVariance` | `number` | No | **Derived**: originalGRBudget - grEstimateAtCompletion |
| `totalVariance` | `number` | No | **Derived**: gcVariance + grVariance |
| `notes` | `string \| null` | PM on Working | Free text |
| `lastEditedBy` | `string \| null` | No | System-set on edit |
| `lastEditedAt` | `string \| null` | No | System-set on edit |

### 1.4 Cash Flow Domain

| # | Record | Interface | T-File | Repo Status | Description |
|---|--------|-----------|--------|-------------|-------------|
| 15 | **CashFlowActualMonth** | `ICashFlowActualRecord` | T05 §7.1 | **Implemented** `src/financial/types/` | 21-field read-only monthly record: inflows (owner, other), outflows (sub, material, labor, overhead, equipment), net, cumulative, working capital, retention, forecast accuracy |
| 16 | **CashFlowForecastMonth** | `ICashFlowForecastRecord` | T05 §7.2 | **Implemented** `src/financial/types/` | 14-field PM-editable forecast record: projected inflows/outflows, net, cumulative, confidence score, notes, edit provenance |
| 17 | **CashFlowSummary** | `ICashFlowSummary` | T05 §7.3 | **Implemented** `src/financial/types/` | Aggregate: total actual/forecasted inflows/outflows/net, combined net, peak cash requirement, cash flow at risk |
| 18 | **RetentionConfig** | `IRetentionConfig` | T05 §7.4 | **Implemented** `src/financial/types/` | Project-level retention rate and release schedule |
| 19 | **ARAgingRecord** | `IARAgingRecord` | T05 §7.5 | **Implemented** `src/financial/types/` | 13-field read-only: project metadata, aging buckets (0-30, 30-60, 60-90, 90+), retainage, refreshedAt |

**Note on CashFlowLineAllocation:** The governing spec does not define a sub-line allocation record within cash flow months. Inflows and outflows are tracked at the category level (e.g., ownerPayments, subcontractorPayments), not at individual line-item granularity. If line-level cash flow allocation is needed (e.g., which subcontractor's payment caused this month's outflow), that would be an extension. **Status: Not in scope for Phase 3.**

### 1.5 Buyout Domain

| # | Record | Interface | T-File | Repo Status | Description |
|---|--------|-----------|--------|-------------|-------------|
| 20 | **BuyoutLine** | `IBuyoutLineItem` | T06 §8.1 | **Implemented** `src/financial/types/` | 19-field procurement line: division, vendor, budget, contract, over/under, savings, LOI/contract dates, status (7-state lifecycle), compliance checklist link, notes, edit provenance |
| 21 | **BuyoutSummaryMetrics** | `IBuyoutSummaryMetrics` | T06 §8.4 | **Implemented** `src/financial/types/` | Aggregate: totals, dollar-weighted completion, savings, line counts by status |
| 22 | **BuyoutSavingsDisposition** | `IBuyoutSavingsDisposition` | T06 §8.5 | **Implemented** `src/financial/types/` | Disposition container: total savings, dispositioned amount, undispositioned remainder, item list |
| 23 | **BuyoutSavingsDispositionItem** | `IBuyoutSavingsDispositionItem` | T06 §8.5 | **Implemented** `src/financial/types/` | Individual disposition action: destination (AppliedToForecast, HeldInContingency, ReleasedToGoverned), amount, provenance |
| 24 | **BuyoutComplianceGate** | `IContractExecutedGateResult` | T06 §8.3 | **Implemented** `src/financial/buyout/` | Gate validation: canTransition + blocker list. Computed on demand. |
| 25 | **BuyoutReconciliation** | `IBuyoutReconciliationResult` | T06 §8.7 | **Implemented** `src/financial/buyout/` | Variance check: amount, percent, within tolerance (5%) |

**Note on BuyoutBidLine:** The governing spec does not define a distinct bid-tracking record. Buyout tracks procurement at the subcontract/vendor scope level (`IBuyoutLineItem`), not individual bid submissions. The status lifecycle (NotStarted → LoiPending → LoiExecuted → ContractPending → ContractExecuted → Complete) captures the procurement progression. If multi-bid tracking per scope is needed, it would be an extension. **Status: Not in scope for Phase 3.**

### 1.6 Platform Integration Domain

| # | Record | Interface | T-File | Repo Status | Description |
|---|--------|-----------|--------|-------------|-------------|
| 26 | **FinancialActivityEvent** | `IFinancialActivityEvent` | T08 §14.1 | **Implemented** `src/financial/spine-events/` | 10 event types: BudgetImported, ForecastVersionConfirmed/Derived, ReportCandidateDesignated, ForecastVersionPublished, GCGRUpdated, BuyoutLineExecuted, BuyoutSavingsDispositioned, CashFlowProjectionUpdated, ReconciliationConditionResolved |
| 27 | **FinancialHealthMetric** | `IFinancialHealthMetric` | T08 §14.2 | **Implemented** `src/financial/spine-events/` | 10 metric keys: projectedOverUnder, profitMargin, EAC, totalCostExposure, buyoutCompletion/savings, cashFlowPeak/AtRisk, buyoutReconciliation |
| 28 | **FinancialWorkQueueItem** | `IFinancialWorkQueueItem` | T08 §14.3 | **Implemented** `src/financial/spine-events/` | 8 item types: BudgetReconciliation, ChecklistIncomplete, Overbudget, NegativeProfit, CashFlowDeficit, BuyoutOverbudget, UndispositionedSavings, ComplianceGateBlocked |

### 1.7 Annotation and Publication Domain

| # | Record | Interface | T-File | Repo Status | Description |
|---|--------|-----------|--------|-------------|-------------|
| 29 | **FinancialAnnotationAnchor** | `IFinancialAnnotationAnchor` | T08 §15.4 | **Implemented** `src/financial/annotations/` | Version-aware anchor: forecastVersionId + anchorType (field/section/block) + optional canonicalBudgetLineId, fieldKey, sectionKey, blockKey |
| 30 | **CarriedForwardAnnotation** | `ICarriedForwardAnnotation` | T08 §15.5 | **Implemented** `src/financial/annotations/` | Derivation carry-forward: source → target version mapping, inheritance status, PM disposition, value-changed flag |
| 31 | **PublicationCandidate** | `IReportPublicationHandoffEvent` | T09 §16, T03 §3.6 | **In dist/ only** | Cross-module handoff event from P3-F1: runId, reportingMonth, projectId, familyKey, triggeredAt, triggeredByUPN |
| 32 | **PublicationHandoffResult** | `IPublicationHandoffResult` | T09 §16 | **In dist/ only** | Handoff result: success, promotedVersion, reason |

### 1.8 Export and Derived Records

| # | Record | Interface | T-File | Repo Status | Description |
|---|--------|-----------|--------|-------------|-------------|
| 33 | **FinancialExportRun** | *(not yet defined)* | T09 §17.9 | **Not implemented** | Export operation record: format (CSV, snapshot), target (P3-F1, download), timestamp, triggeredBy. Needed for audit trail of data exports. |
| 34 | **FinancialRawData** | `IFinancialRawData` | Port | **Implemented** `ports/IFinancialRepository.ts` | Repository response aggregate: version + summary + budgetLines + gcgrLines + buyoutLines + checklist + cashFlowActuals + cashFlowForecasts |

---

## 2. Mutability / Ownership Matrix

Every runtime record is classified into exactly one ownership tier. The tier determines who creates the data, who may modify it, and under what conditions.

### 2.1 Tier Definitions

| Tier | Label | Meaning |
|------|-------|---------|
| **E** | Externally Authoritative | Source of truth is an external system. Project Hub imports but never authors. Changes come only from re-import. |
| **I** | Imported, Not User-Authored | Data arrives from an external feed or bulk operation. Displayed in Project Hub but not editable by users. Refresh is automated or batch-triggered. |
| **W** | Native Working State | Created and edited by users in Project Hub. Mutable on Working versions only. Becomes immutable once the version is confirmed. |
| **G** | Native Governed/Confirmed State | Records in a confirmed or published state. Immutable after confirmation. Only system-level transitions (publication, supersession) may change metadata fields. |
| **D** | Derived Output Only | Computed from other records. Never directly edited. Recomputed on trigger (source edit, confirmation, derivation). |

### 2.2 Record-by-Record Classification

| Record | Tier | Owner | Mutability Rules |
|--------|------|-------|-----------------|
| `IBudgetImportResult` | **E** | Procore (via CSV / future P1-F5 API) | Created on import; immutable after creation |
| `IBudgetImportRow` | **E** | Procore CSV | Raw row; immutable; discarded after transformation |
| `IBudgetLineItem` (budget fields) | **E→I** | Procore → import pipeline | Budget amounts imported from Procore; immutable on all versions |
| `IBudgetLineItem.forecastToComplete` | **W** | PM | Editable on Working version only; provenance captured per edit |
| `IBudgetLineItem` (derived fields: EAC, overUnder) | **D** | System | Recomputed on every FTC edit |
| `IBudgetLineReconciliationCondition` | **W** | PM | Created on ambiguous import; resolved by PM action |
| `IForecastVersion` (Working) | **W** | PM | PM creates, edits, and confirms |
| `IForecastVersion` (ConfirmedInternal) | **G** | System | Immutable after confirmation; only `isReportCandidate` can be toggled |
| `IForecastVersion` (PublishedMonthly) | **G** | System (via P3-F1) | Immutable; promoted by P3-F1 publication handoff |
| `IForecastVersion` (Superseded) | **G** | System | Immutable; historical reference |
| `IFinancialForecastSummary` (editable fields) | **W** | PM | Editable on Working; immutable on confirmed/published |
| `IFinancialForecastSummary` (derived fields) | **D** | System | Recomputed on any upstream edit |
| `IGCGRLine` (editable fields) | **W** | PM | EAC and notes editable on Working; immutable on confirmed |
| `IGCGRLine` (derived fields: variances) | **D** | System | Recomputed on edit |
| `IForecastChecklistItem` | **W** | PM | Toggle completion on Working; starts empty on derivation |
| `IConfirmationGateResult` | **D** | System | Computed on demand; not persisted |
| `ICashFlowActualRecord` | **I** | Accounting system | Imported; read-only on all versions; `recordedAt` immutable |
| `ICashFlowForecastRecord` | **W** | PM | Editable on Working only |
| `ICashFlowSummary` | **D** | System | Recomputed on any actual or forecast change |
| `IARAgingRecord` | **I** | ERP (Sage Intacct) | Daily sync; read-only; `refreshedAt` tracked |
| `IRetentionConfig` | **W** | PM | Project-level config; editable independently of version |
| `IBuyoutLineItem` | **W** | PM | Editable always (not version-scoped in the forecast sense) |
| `IBuyoutSummaryMetrics` | **D** | System | Recomputed from all non-Void lines |
| `IBuyoutSavingsDisposition` | **W** | PM | Created on ContractExecuted when savings exist; PM dispositions |
| `IBuyoutSavingsDispositionItem` | **W** | PM | Individual disposition actions |
| `IContractExecutedGateResult` | **D** | System | Computed on demand |
| `IBuyoutReconciliationResult` | **D** | System | Computed on demand |
| `IFinancialActivityEvent` | **D** | System | Published to activity spine; not user-editable |
| `IFinancialHealthMetric` | **D** | System | Published on confirmation events |
| `IFinancialWorkQueueItem` | **D** | System | Published when business rule conditions met |
| `IFinancialAnnotationAnchor` | **W** | PER | Created by PER annotation; anchored to version |
| `ICarriedForwardAnnotation` | **D** | System | Created on version derivation; PM disposition is **W** |
| `IReportPublicationHandoffEvent` | **E** | P3-F1 Reports module | External event; Financial module receives and processes |
| `IFinancialRawData` | **D** | System | Repository response aggregate; not persisted independently |

---

## 3. Backend Ties by Domain

### 3.1 Budget Import

| Seam | Detail |
|------|--------|
| **Provider/query** | `IFinancialRepository.getFinancialData()` returns `budgetLines` |
| **Mutation** | CSV import pipeline in `src/financial/import/` → creates new Working version with imported lines |
| **Repository** | `IFinancialRepository.updateBudgetLineFTC()` for FTC edits |
| **Publication hook** | `BudgetImported` spine event; `BudgetReconciliationRequired` work queue item |
| **External dependency** | Procore CSV export (current); P1-F5 Procore connector (future) |
| **Stale/recompute** | EAC and overUnder recomputed on every FTC edit; `staleBudgetLineCount` recomputed on import |

### 3.2 Forecast Version and Checklist

| Seam | Detail |
|------|--------|
| **Provider/query** | `IFinancialRepository.getFinancialData()` returns `version` and `checklist` |
| **Mutation** | `confirmVersion()`, `deriveVersion()`, `designateCandidate()`, `toggleChecklistItem()` |
| **Repository** | `IFinancialRepository` (all 8 methods touch version state directly or indirectly) |
| **Publication hook** | `ForecastVersionConfirmed`, `ForecastVersionDerived`, `ReportCandidateDesignated`, `ForecastVersionPublished` spine events; `ForecastChecklistIncomplete` work queue item |
| **External dependency** | P3-F1 publication handoff (B-FIN-03) for PublishedMonthly promotion |
| **Stale/recompute** | Confirmation gate recomputed on any checklist toggle, summary edit, or budget line change; staleBudgetLineCount recomputed on import |

### 3.3 Forecast Summary and GC/GR

| Seam | Detail |
|------|--------|
| **Provider/query** | `IFinancialRepository.getFinancialData()` returns `summary` and `gcgrLines` |
| **Mutation** | `updateForecastSummary()` for summary edits; `updateGCGRLine()` for GC/GR edits |
| **Repository** | `IFinancialRepository` |
| **Publication hook** | `GCGRUpdated` spine event; `NegativeProfitForecast` work queue item; health metrics on confirmation |
| **External dependency** | None (summary and GC/GR are native working state) |
| **Stale/recompute** | Summary EAC recomputed on any budget line FTC edit; gcEstimateAtCompletion recomputed on any GC/GR line edit; profit/margin recomputed on summary field edit; T04 computation functions in `src/financial/forecast-summary/` (dist only) and `src/financial/business-rules/` (source) |

### 3.4 Cash Flow

| Seam | Detail |
|------|--------|
| **Provider/query** | `IFinancialRepository.getFinancialData()` returns `cashFlowActuals` and `cashFlowForecasts` |
| **Mutation** | Cash flow forecast edits (not yet exposed as dedicated repository method — included in raw data update) |
| **Repository** | `IFinancialRepository` (via `getFinancialData`) |
| **Publication hook** | `CashFlowProjectionUpdated` spine event; `CashFlowDeficit` work queue item; `peakCashRequirement` and `cashFlowAtRisk` health metrics |
| **External dependency** | Accounting system for actuals import; P1-F6 Sage Intacct for A/R aging sync |
| **Stale/recompute** | Cumulative cash flow, summary, peak requirement, and forecast accuracy all recomputed on any actual or forecast record change |

### 3.5 Buyout

| Seam | Detail |
|------|--------|
| **Provider/query** | `IFinancialRepository.getFinancialData()` returns `buyoutLines` |
| **Mutation** | Buyout line CRUD, status advancement, savings disposition (not yet exposed as dedicated repository methods) |
| **Repository** | `IFinancialRepository` (via `getFinancialData`) |
| **Publication hook** | `BuyoutLineExecuted`, `BuyoutSavingsDispositioned` spine events; `BuyoutOverbudget`, `UndispositionedBuyoutSavings`, `BuyoutComplianceGateBlocked` work queue items; buyout health metrics |
| **External dependency** | P3-E12 compliance checklist for ContractExecuted gate |
| **Stale/recompute** | Summary metrics recomputed on any line status change; savings disposition status recomputed on disposition action; reconciliation recomputed on line or committed cost change |

### 3.6 Annotation and Publication

| Seam | Detail |
|------|--------|
| **Provider/query** | Annotation queries via `@hbc/field-annotations` library |
| **Mutation** | Annotation create/update via `@hbc/field-annotations`; carry-forward via `src/financial/annotations/`; PM disposition |
| **Repository** | Annotation storage via `@hbc/field-annotations` (external to `IFinancialRepository`) |
| **Publication hook** | Push-to-project-team via `@hbc/my-work-feed` work queue with provenance |
| **External dependency** | `@hbc/field-annotations` v0.2.0 (B-FIN-01 resolved); `@hbc/my-work-feed` v0.0.37 (B-FIN-02 resolved) |
| **Stale/recompute** | Carry-forward triggered on version derivation; `valueChangedFlag` set by comparing FTC values between source and target version |

### 3.7 Cross-Module Ties

| Tie | Direction | Detail |
|-----|-----------|--------|
| **Schedule → Financial** | Inbound | Schedule milestones and `percentComplete` may inform A/R aging context and forecast summary schedule fields. Not currently wired (AC-FIN-47 pending). |
| **Financial → Health Spine** | Outbound | 10 health metrics published via `createFinancialHealthSnapshot()` on version confirmation |
| **Financial → Work Queue** | Outbound | 8 work queue item types published on business rule conditions |
| **Financial → Activity Spine** | Outbound | 10 event types published on lifecycle transitions |
| **P3-F1 Reports → Financial** | Inbound | Publication handoff event promotes ConfirmedInternal → PublishedMonthly (B-FIN-03 open) |
| **Financial → P3-F1 Reports** | Outbound | Module snapshot pull for report generation |
| **P3-E12 Compliance → Financial** | Inbound | ContractExecuted gate checks compliance checklist before buyout status transition |

---

## 4. Workflow State Machine

### 4.1 Forecast Version Lifecycle

```
                    ┌─────────────┐
                    │ InitialSetup│  (first version for a project)
                    └──────┬──────┘
                           │ create
                           ▼
                    ┌─────────────┐
              ┌────▶│   Working    │◀─── derive (from any confirmed)
              │     └──────┬──────┘
              │            │ confirmVersion()
              │            │ [gate: checklist complete + staleBudgetLineCount=0 + summary valid]
              │            ▼
              │     ┌──────────────────┐
              │     │ConfirmedInternal │
              │     └──────┬───┬──────┘
              │            │   │ designateCandidate()
              │            │   ▼
              │            │  ┌────────────────────────┐
              │            │  │ConfirmedInternal       │
              │            │  │(isReportCandidate=true) │
              │            │  └───────────┬────────────┘
              │            │              │ P3-F1 ReportPublishedEvent (B-FIN-03)
              │            │              ▼
              │            │  ┌──────────────────┐
              │            │  │ PublishedMonthly  │
              │            │  └──────────────────┘
              │            │
              │            │ (when new Working is derived, prior Working→Superseded)
              │            ▼
              │     ┌─────────────┐
              │     │ Superseded  │
              │     └─────────────┘
              │
              └── derive (creates new Working from confirmed)
```

### 4.2 State Definitions and Applicability

| State | Applies To | Meaning | Entry Trigger | Exit Trigger | Mutability |
|-------|-----------|---------|---------------|-------------|------------|
| **Working** | `IForecastVersion`, `IFinancialForecastSummary`, `IBudgetLineItem` (FTC), `IGCGRLine`, `ICashFlowForecastRecord`, `IForecastChecklistItem` | Active editing state. PM maintains the forecast. | Version creation (initial or derived) | `confirmVersion()` or superseded by import | PM may edit all W-tier fields |
| **ConfirmedInternal** | `IForecastVersion`, associated snapshot records | Immutable review snapshot. PE reviews; PER annotates. | `confirmVersion()` with gate passed | `designateCandidate()` (metadata only); derivation (creates new Working) | Fully immutable. Only `isReportCandidate` toggleable. |
| **PublishedMonthly** | `IForecastVersion` | Official published version for the reporting month. | P3-F1 publication handoff | Never — terminal state | Fully immutable |
| **Superseded** | `IForecastVersion` | Prior Working version replaced by new derivation or import. | New Working version derived | Never — terminal state | Fully immutable; historical reference |
| **Stale** | Budget line flag (`staleBudgetLineCount`) | Working version contains budget lines that have not been updated since the last import. | Budget import creates new lines that were not in the prior version | PM reviews and resolves all stale lines | Blocks confirmation gate |

**Note:** There is no explicit "Ready for Review" state. The confirmation gate (`IConfirmationGateResult`) serves this function — when `canConfirm = true`, the version is effectively ready for review. The PM triggers confirmation explicitly.

**Note:** There is no explicit "Archived" state. All Superseded and PublishedMonthly versions are retained indefinitely. If archival is needed (e.g., for storage optimization), it would be an operational concern, not a domain state.

### 4.3 Buyout Line Lifecycle

```
NotStarted → LoiPending → LoiExecuted → ContractPending → ContractExecuted → Complete
                                                              │
                                                              ▼
                                                           [gate: P3-E12 checklist]
                                                              │
                                                     (on ContractExecuted, if savings exist:
                                                      create BuyoutSavingsDisposition)

Any state → Void  (PM may void at any point)
```

| Status | Meaning | Trigger |
|--------|---------|---------|
| `NotStarted` | Scope identified; no procurement action | Line creation |
| `LoiPending` | LOI to be sent | PM sets `loiDateToBeSent` |
| `LoiExecuted` | LOI returned executed | PM sets `loiReturnedExecuted` |
| `ContractPending` | Contract being negotiated | PM advances status |
| `ContractExecuted` | Contract signed — **gate-blocked** by P3-E12 checklist | PM sets `contractExecutedDate`; gate validates |
| `Complete` | Procurement fully closed | PM marks complete |
| `Void` | Line cancelled/abandoned | PM voids at any state |

### 4.4 Buyout Savings Disposition Lifecycle

```
NoSavings ──(no savings on ContractExecuted)──▶ (no disposition record)

Undispositioned ──(PM chooses destination(s))──▶ PartiallyDispositioned
                                                        │
                                               (PM dispositions remaining)
                                                        ▼
                                               FullyDispositioned
```

Three destinations per `IBuyoutSavingsDispositionItem`:
- **AppliedToForecast** — PM manually updates FTC on a budget line (system does not auto-apply)
- **HeldInContingency** — System increases `currentContingency` on confirmation
- **ReleasedToGoverned** — System publishes event; notifies PE

---

## 5. Cutover Readiness

### 5.1 Per-Artifact Retirement Criteria

| Artifact | Retirement Condition | Parallel-Run Proof |
|----------|---------------------|-------------------|
| **Procore_Budget.csv** (manual download) | CSV import pipeline operational; identity resolution verified on 3+ real projects; reconciliation UI functional | Run 2 consecutive monthly imports through Project Hub in parallel with manual CSV review. Import results must match within tolerance. |
| **Financial Forecast Summary & Checklist.xlsx** | Forecast Summary surface operational with all PM-editable and derived fields; checklist gate enforced; version confirmation lifecycle proven | Run 1 full monthly forecast cycle through Project Hub for 2+ projects. Compare confirmed version values against spreadsheet values. Checklist completion must match. |
| **GC-GR Forecast.xlsm** | GC/GR working model operational; variance calculations match VBA output; aggregation auto-feeds Forecast Summary | Side-by-side: enter same GC/GR values in workbook and Project Hub. Variance output must match. Summary GC EAC must match. |
| **HB Draw Schedule -Cash Flow.xlsx** | Cash flow actual + forecast grid operational; cumulative calculation correct; A/R aging display functional | Run 1 monthly cash flow update through Project Hub. Compare cumulative cash flow output against spreadsheet. |
| **Buyout Log_Template 2025.xlsx** | Buyout working state operational; 7-state lifecycle functional; savings disposition proven; dollar-weighted completion metric verified | Track 5+ buyout lines through full lifecycle in Project Hub. Savings disposition for 2+ lines. Compare completion metrics. |
| **Monthly review packet** (composite) | Version confirmation + report-candidate designation + executive annotation + P3-F1 publication handoff all operational | Complete 1 full monthly cycle end-to-end: Working → ConfirmedInternal → ReportCandidate → PER annotation → PublishedMonthly via P3-F1. |

### 5.2 Retirement Sequencing

| Order | Artifact Class | Rationale |
|-------|---------------|-----------|
| **1 (First)** | **Buyout Log** | Lowest external dependency; self-contained lifecycle; no version coupling to forecast. Can be retired independently. |
| **2** | **GC/GR Forecast workbook** | Eliminates macro dependency and manual transcription. Once GC/GR values auto-feed Forecast Summary, the `.xlsm` adds no value. Requires T04 implementation. |
| **3** | **Procore Budget CSV** (manual download) | Import pipeline replaces manual download/reconciliation. Requires identity resolution confidence from parallel run. Note: the CSV *import path* remains until P1-F5 API is available; what retires is the *manual download and reconciliation* process. |
| **4** | **Financial Forecast Summary & Checklist** | Central artifact — only retire after GC/GR, Budget, and Cash Flow surfaces all proven. Requires full version lifecycle confidence. |
| **5** | **Cash Flow / Draw Schedule** | Retire alongside or after Forecast Summary. Cash flow projections depend on forecast maturity. |
| **6 (Last)** | **Monthly review packet** (composite) | Only retire after all component artifacts are retired and P3-F1 publication handoff (B-FIN-03) is operational. This is the capstone. |

### 5.3 Parallel-Run Duration

Recommended minimum: **2 consecutive monthly reporting cycles** per artifact class, running both the workbook process and the Project Hub process in parallel. Each cycle must demonstrate:

1. Data equivalence within tolerance (values match between workbook and Project Hub)
2. Workflow equivalence (same review gates, same approval checkpoints)
3. No data loss or corruption during the cycle
4. PM confidence (PM reports that Project Hub surface is functionally sufficient)

---

*Navigation: [← FRC-03 Implementation Implications](FRC-03-Implementation-Implications.md) | [FRC-00 Master Index](FRC-00-Financial-Replacement-Crosswalk.md) | [FRC-05 Field-Level Mapping →](FRC-05-Field-Level-Mapping.md)*
