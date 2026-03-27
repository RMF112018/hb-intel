# FRC-05 — Financial Field-Level and Workflow-Level Mapping

| Property | Value |
|----------|-------|
| **Doc ID** | FRC-05 |
| **Parent** | [FRC-00 Financial Replacement Crosswalk](FRC-00-Financial-Replacement-Crosswalk.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Field-Level Mapping |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file deepens the [FRC-02 crosswalk](FRC-02-Detailed-Crosswalk.md) with field-level mappings for each major workbook section and workflow-level mappings for each operational process. Where the current operating files have visible structure (CSV columns, JSON fields, known workbook tabs), the mapping is exact. Where the workbook structure is inferred from the governing spec and reference data, the mapping is noted as spec-derived.*

---

## 1. Forecast Summary — Field-Level Mapping

Source: `Financial Forecast Summary & Checklist.xlsx` → Summary tab
Target: `IFinancialForecastSummary` (P3-E4-T04 §5)

### 1.1 Project Metadata Section

| Workbook Field | Runtime Field | Type | Tier | Source/Derivation |
|---------------|--------------|------|------|-------------------|
| Project Name | `projectName` | `string` | I | From project record |
| Project Number | `projectNumber` | `string` | I | From project record |
| Contract Type (GMP / Lump Sum / etc.) | `contractType` | `FinancialContractType` | W | PM selects: `GMP`, `LumpSum`, `CostPlus`, `UnitPrice`, `TimeAndMaterials` |
| Project Type | `projectType` | `FinancialProjectType` | W | PM selects: `Commercial`, `Residential`, `Healthcare`, `Education`, `Industrial`, `Infrastructure`, `Other` |
| Damage Clause / LDs | `damageClauseLDs` | `string \| null` | W | PM free text |

### 1.2 Schedule Section

| Workbook Field | Runtime Field | Type | Tier | Source/Derivation |
|---------------|--------------|------|------|-------------------|
| Original Contract Completion | `originalContractCompletion` | `string` (date) | W | PM sets once; rarely changed |
| Approved Days Extensions | `approvedDaysExtensions` | `number` | W | PM updates when extensions approved |
| Revised Contract Completion | `revisedContractCompletion` | `string` (date) | D | **Derived**: `originalContractCompletion + approvedDaysExtensions` calendar days |

### 1.3 Financial Summary Section

| Workbook Field | Runtime Field | Type | Tier | Source/Derivation |
|---------------|--------------|------|------|-------------------|
| Original Contract Value | `originalContractValue` | `number` | I | From contract; set at project setup |
| Original Estimated Cost | `originalEstimatedCost` | `number` | I | From initial budget |
| Original Profit | `originalProfit` | `number` | D | **Derived**: `originalContractValue - originalEstimatedCost` |
| Original Buyout Savings | `originalBuyoutSavings` | `number` | D | **Derived**: from initial buyout |
| Current Contract Value | `currentContractValue` | `number` | W | PM edits on Working (reflects COs, amendments) |
| Estimated Cost at Completion | `estimatedCostAtCompletion` | `number` | D | **Derived**: `sum(budgetLine.EAC) + gcEstimateAtCompletion` |
| Current Profit | `currentProfit` | `number` | D | **Derived**: `currentContractValue - estimatedCostAtCompletion` |
| Profit Margin | `profitMargin` | `number` | D | **Derived**: `currentProfit / currentContractValue × 100`. Alert: warn < 5%, critical < 0% |

### 1.4 Contingency Section

| Workbook Field | Runtime Field | Type | Tier | Source/Derivation |
|---------------|--------------|------|------|-------------------|
| Original Contingency | `originalContingency` | `number` | I | From initial budget |
| Current Contingency | `currentContingency` | `number` | W | PM edits; also affected by buyout `HeldInContingency` disposition |
| Expected Contingency at Completion | `expectedContingencyAtCompletion` | `number` | W | PM projection |
| Expected Contingency Use | `expectedContingencyUse` | `number` | D | **Derived**: `currentContingency - expectedContingencyAtCompletion` |

### 1.5 GC Summary Section (within Forecast Summary)

| Workbook Field | Runtime Field | Type | Tier | Source/Derivation |
|---------------|--------------|------|------|-------------------|
| Original GC Estimate | `originalGCEstimate` | `number` | I | From initial budget |
| GC Estimate at Completion | `gcEstimateAtCompletion` | `number` | D | **Derived**: `aggregateGCEstimateAtCompletion(gcgrLines)` — sum of all `IGCGRLine.gcEstimateAtCompletion` |

### 1.6 Workflow: Forecast Summary Edit Cycle

```
1. PM opens Working version → Forecast Summary surface
2. PM edits any W-tier field (contractType, approvedDaysExtensions, currentContractValue, etc.)
3. System validates edit via validateForecastSummaryEdit() [T04 §5.6]
4. System recomputes all D-tier fields via recomputeForecastSummary() [T04 §5, T07 §10.3]
   - revisedContractCompletion recalculated
   - EAC = sum(budgetLine EACs) + gcEstimateAtCompletion
   - profit and margin recalculated
   - contingency use recalculated
5. If profitMargin < 0%: critical alert + NegativeProfitForecast work queue item
6. Updated summary persisted via IFinancialRepository.updateForecastSummary()
```

---

## 2. Forecast Checklist — Field-Level Mapping

Source: `Financial Forecast Summary & Checklist.xlsx` → Checklist tab
Target: `IForecastChecklistItem` (P3-E4-T03 §4)

### 2.1 Checklist Template (19 items across 4 groups)

| Group | Items | `required` | Runtime Group Enum |
|-------|-------|-----------|-------------------|
| **Required Documents** | Insurance certificates current, bonds reviewed, permits current, subcontractor compliance docs, owner-required submittals | `true` | `RequiredDocuments` |
| **Profit Forecast** | Budget reconciled against Procore, FTC reviewed per line, GC/GR projections updated, exposure items flagged, profit margin acceptable | `true` | `ProfitForecast` |
| **Schedule** | Schedule status reviewed, milestone dates confirmed, delay impacts assessed, weather/force majeure considered | `true` | `Schedule` |
| **Additional** | Cash flow projections updated, buyout status current, pending COs documented, contingency use reviewed | `false` | `Additional` |

### 2.2 Per-Item Field Mapping

| Workbook Element | Runtime Field | Type | Tier |
|-----------------|--------------|------|------|
| Checkbox | `completed` | `boolean` | W |
| *(not in workbook)* | `completedBy` | `string \| null` | W (system-captured) |
| *(not in workbook)* | `completedAt` | `string \| null` | W (system-captured) |
| Notes column (if present) | `notes` | `string \| null` | W |
| Item label | `label` | `string` | Template (immutable) |
| Group header | `group` | `ForecastChecklistGroup` | Template (immutable) |
| Required indicator | `required` | `boolean` | Template (immutable) |

### 2.3 Workflow: Checklist Completion and Confirmation Gate

```
1. PM opens Working version → Forecast Checklist surface
2. PM toggles each item via IFinancialRepository.toggleChecklistItem()
3. System captures completedBy and completedAt per toggle
4. When PM attempts confirmVersion():
   a. validateConfirmationGate() checks:
      - All required items (RequiredDocuments, ProfitForecast, Schedule) complete
      - staleBudgetLineCount = 0
      - Summary fields valid
   b. If canConfirm = false: returns blockers list; confirmation blocked
   c. If canConfirm = true: version transitions to ConfirmedInternal
5. On version derivation: new Working version starts with EMPTY checklist
   (checklist is version-scoped; prior completion does not carry forward)
```

**Gap vs. current process:** Today the checklist is honor-system — PM self-certifies without enforcement. The future model enforces gate-blocking on required items. This is a behavioral change that requires PM training.

---

## 3. GC/GR Model — Field-Level Mapping

Source: `GC-GR Forecast.xlsm` (macro-enabled workbook)
Target: `IGCGRLine` (P3-E4-T04 §6)

### 3.1 Line-Level Field Mapping

| Workbook Column | Runtime Field | Type | Tier | Notes |
|----------------|--------------|------|------|-------|
| Division Number | `divisionNumber` | `string` | W | CSI division code |
| Division Description | `divisionDescription` | `string` | W | Human-readable name |
| Category | `gcGrCategory` | `GCGRCategory` | W | 11-value enum replaces free-text category. Values: `Labor`, `Material`, `Equipment`, `Subcontract`, `Supervision`, `Insurance`, `BondsInsurance`, `TaxPermit`, `FieldOffice`, `Miscellaneous`, `Other` |
| Original GC Budget | `originalGCBudget` | `number` | I | From initial budget; immutable |
| GC Estimate at Completion | `gcEstimateAtCompletion` | `number` | W | PM edits on Working version |
| GC Variance | `gcVariance` | `number` | D | **Derived**: `originalGCBudget - gcEstimateAtCompletion` |
| Original GR Budget | `originalGRBudget` | `number` | I | From initial budget; immutable |
| GR Estimate at Completion | `grEstimateAtCompletion` | `number` | W | PM edits on Working version |
| GR Variance | `grVariance` | `number` | D | **Derived**: `originalGRBudget - grEstimateAtCompletion` |
| Total Variance | `totalVariance` | `number` | D | **Derived**: `gcVariance + grVariance` |
| Notes | `notes` | `string \| null` | W | Free text |
| *(not in workbook)* | `gcGrId` | `string` | System | UUID assigned on creation |
| *(not in workbook)* | `forecastVersionId` | `string` | System | FK to version (version-scoped) |
| *(not in workbook)* | `lastEditedBy` | `string \| null` | System | Edit provenance |
| *(not in workbook)* | `lastEditedAt` | `string \| null` | System | Edit provenance |

### 3.2 Workflow: GC/GR Edit and Aggregation

```
1. PM opens Working version → GC/GR surface
2. PM edits gcEstimateAtCompletion or grEstimateAtCompletion on any line
3. System validates via validateGCGRLineEdit() [T04 §6.1] — edit allowed only on Working
4. System recomputes line via recomputeGCGRLine() [T04 §6.1]:
   - gcVariance = originalGCBudget - gcEstimateAtCompletion
   - grVariance = originalGRBudget - grEstimateAtCompletion
   - totalVariance = gcVariance + grVariance
5. System persists via IFinancialRepository.updateGCGRLine()
6. System publishes GCGRUpdated spine event
7. System recomputes Forecast Summary:
   - gcEstimateAtCompletion = aggregateGCEstimateAtCompletion(allGCGRLines)
   - Summary EAC, profit, margin cascaded
8. On version derivation: GC/GR lines copied via copyGCGRLinesForDerivation()
   - New UUIDs generated; field values preserved as starting state
```

**Gap vs. current process:** Today, GC/GR variance is computed by VBA macros, and GC totals are manually transcribed to the Forecast Summary. The future model eliminates both — variances are pure functions, and GC aggregation auto-feeds the summary.

---

## 4. Cash Flow / Draw Schedule — Field-Level Mapping

Source: `HB Draw Schedule -Cash Flow.xlsx` + `cash-flow.json` + `ar-aging.json`
Target: `ICashFlowActualRecord`, `ICashFlowForecastRecord`, `ICashFlowSummary`, `IARAgingRecord`

### 4.1 Actual Month Record (13 months)

Source structure from `cash-flow.json` → `monthlyData[]`:

| JSON Field | Runtime Field | Type | Tier | Notes |
|-----------|--------------|------|------|-------|
| `month` | `calendarDate` | `string` | I | `YYYY-MM` format |
| *(sequence)* | `periodMonth` | `number` | I | Ordinal month number |
| `inflows.ownerPayments` | `inflowOwnerPayments` | `number` | I | Read-only |
| `inflows.other` | `inflowOtherInflows` | `number` | I | Combines loans, COs, retentionRelease, other from JSON |
| `inflows.total` | `totalInflows` | `number` | D | **Derived**: sum of inflow fields |
| `outflows.subcontractorPayments` | `outflowSubcontractorPayments` | `number` | I | Read-only |
| `outflows.materialCosts` | `outflowMaterialCosts` | `number` | I | Read-only |
| `outflows.laborCosts` | `outflowLaborCosts` | `number` | I | Read-only |
| `outflows.overhead` | `outflowOverhead` | `number` | I | Read-only |
| `outflows.equipmentCosts` | `outflowEquipment` | `number` | I | Read-only |
| `outflows.total` | `totalOutflows` | `number` | D | **Derived**: sum of outflow fields |
| `netCashFlow` | `netCashFlow` | `number` | D | **Derived**: totalInflows - totalOutflows |
| `cumulativeCashFlow` | `cumulativeCashFlow` | `number` | D | **Derived**: running sum from project start |
| `workingCapital` | `workingCapital` | `number \| null` | I | From accounting system |
| `retentionHeld` | `retentionHeld` | `number` | I | From accounting system |
| `forecastAccuracy` | `forecastAccuracy` | `number \| null` | D | **Derived**: actual vs. prior forecast comparison |
| *(not in JSON)* | `recordedAt` | `string` | I | Import timestamp; immutable |

### 4.2 Forecast Month Record (18 months)

| Workbook Column | Runtime Field | Type | Tier | Notes |
|----------------|--------------|------|------|-------|
| Projected Inflows | `projectedInflows` | `number` | W | PM edits on Working version |
| Projected Outflows | `projectedOutflows` | `number` | W | PM edits on Working version |
| *(calculated)* | `projectedNetCashFlow` | `number` | D | **Derived**: projectedInflows - projectedOutflows |
| *(running sum)* | `projectedCumulativeCashFlow` | `number` | D | **Derived**: running sum from project start |
| *(not in workbook)* | `confidenceScore` | `number` | W | PM assigns confidence (0-100) per forecast month |
| Notes | `notes` | `string \| null` | W | PM free text |
| *(not in workbook)* | `lastEditedBy` | `string \| null` | System | Edit provenance |
| *(not in workbook)* | `lastEditedAt` | `string \| null` | System | Edit provenance |

### 4.3 A/R Aging Record

Source from `ar-aging.json`:

| JSON Field | Runtime Field | Type | Tier | Notes |
|-----------|--------------|------|------|-------|
| `project_id` | `projectId` | `string` | I | Project identifier |
| `project_name` | `projectName` | `string` | I | Display name |
| `project_manager` | `projectManager` | `string` | I | PM name |
| `percent_complete` | `percentComplete` | `number` | I | Project completion % |
| `balance_to_finish` | `balanceToFinish` | `number` | I | Remaining contract balance |
| `retainage` | `retainage` | `number` | I | Held retainage |
| `total_ar` | `totalAR` | `number` | I | Total accounts receivable |
| `current` | `current0To30` | `number` | I | Current (0-30 days) |
| `days_1_30` | `current30To60` | `number` | I | 30-60 days |
| `days_31_60` | `current60To90` | `number` | I | 60-90 days |
| `days_60_plus` | `current90Plus` | `number` | I | 90+ days |
| `comments` | `comments` | `string \| null` | I | Free text |
| *(not in JSON)* | `refreshedAt` | `string` | I | Last sync timestamp |

### 4.4 Cash Flow Summary (aggregate)

| Runtime Field | Type | Tier | Derivation |
|--------------|------|------|------------|
| `totalActualInflows` | `number` | D | Sum of actual month inflows |
| `totalActualOutflows` | `number` | D | Sum of actual month outflows |
| `totalActualNetCashFlow` | `number` | D | Sum of actual month nets |
| `totalForecastedInflows` | `number` | D | Sum of forecast month inflows |
| `totalForecastedOutflows` | `number` | D | Sum of forecast month outflows |
| `totalForecastedNetCashFlow` | `number` | D | Sum of forecast month nets |
| `combinedNetCashFlow` | `number` | D | Actual + forecasted net |
| `peakCashRequirement` | `number` | D | Minimum cumulative value (most negative) |
| `cashFlowAtRisk` | `number` | D | Deficit exposure metric |

### 4.5 Workflow: Monthly Cash Flow Update

```
1. Accounting system imports actual cash flow data for completed months
   → ICashFlowActualRecord created (read-only, immutable)
   → forecastAccuracy computed for months that transition from forecast to actual
2. PM opens Working version → Cash Flow surface
3. PM edits projected inflows/outflows for forecast months (up to 18)
4. PM sets confidenceScore per month
5. System recomputes:
   - projectedNetCashFlow per month
   - projectedCumulativeCashFlow (running sum across actual + forecast)
   - ICashFlowSummary aggregate (peakCashRequirement, cashFlowAtRisk)
6. CashFlowProjectionUpdated spine event published
7. If peakCashRequirement indicates deficit: CashFlowDeficit work queue item
8. Health spine metrics updated: peakCashRequirement, cashFlowAtRisk
```

**Gap vs. current process:** Today, the workbook has no forecast accuracy tracking, no confidence scoring, no automated actual-vs-forecast comparison, and no deficit alerting. The future model adds all of these.

---

## 5. Buyout Log — Field-Level Mapping

Source: `Buyout Log_Template 2025.xlsx`
Target: `IBuyoutLineItem`, `IBuyoutSummaryMetrics`, `IBuyoutSavingsDisposition`

### 5.1 Line-Level Field Mapping

| Workbook Column | Runtime Field | Type | Tier | Notes |
|----------------|--------------|------|------|-------|
| Division Code | `divisionCode` | `string` | W | CSI division |
| Division Description | `divisionDescription` | `string` | W | Human-readable |
| *(not in template)* | `lineItemDescription` | `string` | W | Specific scope description |
| Subcontractor/Vendor | `subcontractorVendorName` | `string` | W | Contracted party name |
| Original Budget | `originalBudget` | `number` | I | From budget baseline; immutable |
| Contract Amount | `contractAmount` | `number \| null` | W | Set when contract executed |
| *(calculated if at all)* | `overUnder` | `number \| null` | D | **Derived**: `originalBudget - contractAmount` (when contractAmount non-null) |
| *(not tracked)* | `buyoutSavingsAmount` | `number` | D | **Derived**: max(0, overUnder) — savings recognized only when contract < budget |
| *(not tracked)* | `savingsDispositionStatus` | `BuyoutSavingsDispositionStatus` | D | **Derived**: NoSavings, Undispositioned, PartiallyDispositioned, FullyDispositioned |
| LOI Date to be Sent | `loiDateToBeSent` | `string \| null` | W | Target date |
| LOI Returned/Executed | `loiReturnedExecuted` | `string \| null` | W | Actual return date |
| Contract Executed Date | `contractExecutedDate` | `string \| null` | W | Gate-blocked by P3-E12 |
| Status (informal text) | `status` | `BuyoutLineStatus` | W | 7-value enum replaces free text: `NotStarted`, `LoiPending`, `LoiExecuted`, `ContractPending`, `ContractExecuted`, `Complete`, `Void` |
| *(not in template)* | `subcontractChecklistId` | `string \| null` | W | Link to P3-E12 compliance checklist |
| Notes | `notes` | `string \| null` | W | Free text |
| *(not in template)* | `lastEditedBy` | `string \| null` | System | Edit provenance |
| *(not in template)* | `lastEditedAt` | `string \| null` | System | Edit provenance |

### 5.2 Summary Metrics (not in current workbook)

| Runtime Field | Type | Tier | Derivation |
|--------------|------|------|------------|
| `totalBudget` | `number` | D | Sum of all non-Void line originalBudget |
| `totalContractAmount` | `number` | D | Sum of all non-Void line contractAmount |
| `totalOverUnder` | `number` | D | Sum of all non-Void line overUnder |
| `totalRealizedBuyoutSavings` | `number` | D | Sum of savings from ContractExecuted+ lines |
| `totalUndispositionedSavings` | `number` | D | Sum of undispositioned amounts |
| `percentBuyoutCompleteDollarWeighted` | `number` | D | `sum(contractAmount for executed+complete) / totalBudget × 100` |
| `linesNotStarted` | `number` | D | Count |
| `linesInProgress` | `number` | D | Count (LoiPending through ContractPending) |
| `linesComplete` | `number` | D | Count (ContractExecuted + Complete) |
| `linesVoid` | `number` | D | Count |
| `totalLinesActive` | `number` | D | Count (all non-Void) |

### 5.3 Savings Disposition Fields (not in current workbook)

| Runtime Field | Type | Tier | Notes |
|--------------|------|------|-------|
| `dispositionId` | `string` | System | UUID |
| `buyoutLineId` | `string` | System | FK to buyout line |
| `totalSavingsAmount` | `number` | D | = buyoutSavingsAmount from line |
| `dispositionedAmount` | `number` | D | Sum of disposition item amounts |
| `undispositionedAmount` | `number` | D | = totalSavingsAmount - dispositionedAmount |
| `dispositionItems[]` | `IBuyoutSavingsDispositionItem[]` | W | PM creates each disposition action |

Per disposition item:
| Field | Type | Tier | Notes |
|-------|------|------|-------|
| `destination` | `BuyoutSavingsDestination` | W | `AppliedToForecast`, `HeldInContingency`, `ReleasedToGoverned` |
| `amount` | `number` | W | Dollar amount for this destination |
| `dispositionedBy` | `string` | System | PM identity |
| `dispositionedAt` | `string` | System | Timestamp |
| `notes` | `string \| null` | W | Justification |
| `linkedForecastVersionId` | `string \| null` | W | For AppliedToForecast: which version the savings adjust |

### 5.4 Workflow: Buyout Lifecycle with Savings

```
1. PM creates buyout line (status: NotStarted)
2. PM sets loiDateToBeSent → status: LoiPending
3. PM sets loiReturnedExecuted → status: LoiExecuted
4. PM advances → status: ContractPending
5. PM sets contractExecutedDate → system checks P3-E12 compliance gate:
   a. validateContractExecutedGate() [T06 §8.3]
   b. If gate fails: API rejects; BuyoutComplianceGateBlocked work queue item
   c. If gate passes: status → ContractExecuted
      - overUnder computed: originalBudget - contractAmount
      - If contractAmount < originalBudget:
        → buyoutSavingsAmount = originalBudget - contractAmount
        → IBuyoutSavingsDisposition created (status: Undispositioned)
        → UndispositionedBuyoutSavings work queue item
      - BuyoutLineExecuted spine event published
6. PM dispositions savings:
   - AppliedToForecast: PM manually adjusts FTC on a Working version budget line
   - HeldInContingency: system increases currentContingency on disposition confirmation
   - ReleasedToGoverned: system publishes event; notifies PE
   - BuyoutSavingsDispositioned spine event published per disposition action
7. PM marks line Complete → status: Complete
```

**Gap vs. current process:** The current buyout log has no compliance gate, no savings recognition, no savings disposition workflow, no dollar-weighted completion metric, and no structured lifecycle states. All of these are new capabilities.

---

## 6. Three-Way Gap Analysis

### 6.1 Gap Categories

| Code | Meaning |
|------|---------|
| **WB→PH** | Gap between workbook process and Project Hub design (behavioral change) |
| **PH→RI** | Gap between Phase 3 plan and repo implementation (build gap) |
| **WB→RI** | Gap between workbook process and repo implementation (end-to-end gap) |

### 6.2 Gap Inventory

| # | Domain | Gap Code | Description | Severity | Resolution Path |
|---|--------|----------|-------------|----------|----------------|
| G-01 | Forecast Summary | **PH→RI** | `IFinancialForecastSummary` (24 fields) and `IGCGRLine` (17 fields) exist only in `dist/`, not in source `types/index.ts`. T04 computation functions exist in `dist/src/financial/forecast-summary/` but not in source barrel. | **Critical** — blocks FIN.4, AC-FIN-22–25, and Forecast Summary + GC/GR surfaces | Define T04 interfaces in source; wire forecast-summary module into source barrel |
| G-02 | Data Access | **PH→RI** | `IFinancialRepository` (8 methods) and `MockFinancialRepository` (332 lines) are implemented but not exported from `ports/index.ts` and not registered in `factory.ts`. | **Critical** — blocks all PWA page development | Add export + factory registration |
| G-03 | PWA Surfaces | **WB→RI** | No Financial pages exist in PWA. Only `AccountingPage.tsx` placeholder with hardcoded mock data. No budget, forecast, GC/GR, cash flow, or buyout pages. | **Critical** — no user-facing Financial module | Build 5 PWA page surfaces |
| G-04 | Routes | **PH→RI** | No `/project-hub/$projectId/financial` route or sub-routes in `workspace-routes.ts`. Only `health` and `reports` sections registered. | **High** — blocks navigation | Register financial route with sub-routes |
| G-05 | Publication | **PH→RI** | B-FIN-03 open: P3-F1 does not define `ReportPublishedEvent`. Financial has `promoteToPublished()` stub and `IReportPublicationHandoffEvent` / `IPublicationHandoffResult` in dist/, but wiring is blocked. | **Medium** — blocks PublishedMonthly promotion; stub ready | Pending P3-F1 resolution |
| G-06 | Forecast Summary | **WB→PH** | Forecast Summary workbook has no structured narrative per section. P3-E4 captures narrative via `notes` fields on version, lines, and checklist items, not as a standalone record. | **Low** — current design is sufficient | No action needed unless structured narrative requirement surfaces |
| G-07 | Cash Flow | **WB→PH** | Draw schedule timing in the workbook is integrated with cash flow projections. The runtime model absorbs draw schedule into `ICashFlowForecastRecord.calendarDate` alignment — no separate draw schedule entity. | **Low** — deliberate design choice | Absorbed into cash flow model per FRC-03 §6.2 |
| G-08 | Cash Flow | **PH→RI** | No dedicated repository method for cash flow forecast edits. Cash flow data returned via `getFinancialData()` but forecast edits have no explicit mutation method. | **Medium** — needs repository seam for PWA | Add `updateCashFlowForecast()` to `IFinancialRepository` or handle via generic `getFinancialData()` cache replacement |
| G-09 | Buyout | **PH→RI** | No dedicated repository methods for buyout line CRUD, status advancement, or savings disposition. Buyout data returned via `getFinancialData()` but mutations have no explicit seam. | **Medium** — needs repository seam for PWA | Add buyout mutation methods to `IFinancialRepository` or use a separate buyout repository |
| G-10 | Export | **PH→RI** | `FinancialExportRun` record not defined. T09 §17.9 specifies export formats but no audit trail record exists. | **Low** — deferred to FIN.9 | Define export run record when export functionality is built |
| G-11 | Cross-Module | **PH→RI** | Schedule module integration (AC-FIN-47) pending. `percentComplete` for A/R aging context and milestone dates for forecast summary schedule fields are not wired. | **Medium** — pending Schedule module | Wire when Schedule module surfaces |
| G-12 | Checklist | **WB→PH** | Current workbook checklist is honor-system. Future model enforces gate-blocking. This is a behavioral change requiring PM training. | **Low** — by design | Training/change-management during cutover |
| G-13 | Buyout | **WB→PH** | Current buyout log uses free-text status. Future model enforces 7-state enum lifecycle with compliance gate. Behavioral change for PM. | **Low** — by design | Training/change-management during cutover |
| G-14 | GC/GR | **WB→PH** | Current GC/GR workbook uses VBA macros. Future model eliminates macro dependency entirely. PM must use Project Hub GC/GR surface instead of Excel. | **Low** — by design | Training; retire `.xlsm` per cutover plan |
| G-15 | T04 Types | **PH→RI** | `FinancialContractType`, `FinancialProjectType`, `GCGRCategory` enums exist only in dist/. Not in source. | **Critical** — part of T04 gap (G-01) | Define in source alongside T04 interfaces |

---

*Navigation: [← FRC-04 Runtime Record Family](FRC-04-Runtime-Record-Family.md) | [FRC-00 Master Index](FRC-00-Financial-Replacement-Crosswalk.md)*
