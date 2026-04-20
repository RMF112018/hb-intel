# P3-E4 — Financial Module: Business Rules and Calculations

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4-T07 |
| **Parent** | [P3-E4 Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T07: Business Rules and Calculations |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: sign convention and display rules for all financial domains, all calculated field formulas, status and lifecycle enumerations, and an alphabetical field summary index. This is the single reference for sign convention across the entire Financial module.*

---

## 9. Sign Convention and Financial Display Rules

Consistent sign convention prevents misreading of favorable/unfavorable financial signals. This section is the **single source of truth** for sign and display convention across the Financial module.

### 9.1 Budget line `projectedOverUnder`

`projectedOverUnder = revisedBudget - estimatedCostAtCompletion`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Under budget (favorable) | Green |
| Zero | Exactly on budget | Neutral |
| Negative | Over budget (unfavorable) | Red |

### 9.2 GC/GR variances

`gcVariance = gcEstimateAtCompletion - originalGCBudget`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Cost overrun (unfavorable) | Red |
| Negative | Cost savings (favorable) | Green |

**Note:** GC/GR and buyout use cost-minus-budget direction; forecast summary uses budget-minus-cost direction. This is intentional and matches the underlying financial logic for each domain.

### 9.3 Buyout `overUnder`

`overUnder = contractAmount - originalBudget`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Over budget (unfavorable) | Red |
| Negative | Under budget (favorable = potential savings) | Green |

### 9.4 Profit and margin

`currentProfit = currentContractValue - estimatedCostAtCompletion`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Forecasting a profit | Green |
| Negative | Forecasting a loss | Red; explicit alert |

- Profit margin < 5%: warning alert.
- Profit margin < 0%: critical alert requiring PE visibility.

### 9.5 Cash flow

`netCashFlow = totalInflows - totalOutflows`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Cash surplus for month | Green |
| Negative | Cash deficit for month | Red |

### 9.6 Display precision

All currency fields: two decimal places (cents). Percentages: two decimal places. Dates: display in project locale; store as ISO 8601.

---

## 10. Business Rules and Calculations

### 10.1 Budget line item calculations

1. `revisedBudget` = `originalBudget + budgetModifications + approvedCOs`
2. `projectedBudget` = `revisedBudget + pendingBudgetChanges`
3. `costExposureToDate` = `jobToDateActualCost + committedCosts`
4. `projectedCosts` = `costExposureToDate + pendingCostChanges`
5. `estimatedCostAtCompletion` = `costExposureToDate + forecastToComplete`
6. `projectedOverUnder` = `revisedBudget - estimatedCostAtCompletion` (positive = favorable)

### 10.2 `forecastToComplete` validation rules

`forecastToComplete` is a **PM estimate of future cost** — it is distinct from past spend. The following rules apply:

- Must be `>= 0` (no negative remaining work).
- Has **no lower bound tied to historical cost**. FTC can be lower than `revisedBudget - costExposureToDate` (PM may believe work can be completed under remaining budget). FTC can also be higher (PM forecasts an overrun). The system derives EAC and `projectedOverUnder` and presents them; it does not block valid estimates.
- System warns if `estimatedCostAtCompletion > revisedBudget × 1.10` (10% over-budget threshold) to prompt PM to add a note, but does not block.
- Default on import: `max(0, revisedBudget - costExposureToDate)` — the remaining budget after accounting for known exposure.

### 10.3 Forecast summary calculations

1. `revisedContractCompletion` = `originalContractCompletion + approvedDaysExtensions` (calendar days)
2. `estimatedCostAtCompletion` = Sum of budget line `estimatedCostAtCompletion` + `gcEstimateAtCompletion`
3. `currentProfit` = `currentContractValue - estimatedCostAtCompletion`
4. `profitMargin` = `(currentProfit / currentContractValue) × 100`
5. `expectedContingencyUse` = `originalContingency - expectedContingencyAtCompletion`

### 10.4 GC/GR calculations

1. `gcVariance` = `gcEstimateAtCompletion - originalGCBudget` (positive = overrun)
2. `grVariance` = `grEstimateAtCompletion - originalGRBudget`
3. `totalVariance` = `gcVariance + grVariance`

### 10.5 Cash flow calculations

1. `totalInflows` = `inflowOwnerPayments + inflowOtherInflows`
2. `totalOutflows` = Sum of all outflow fields (`outflowSubcontractorPayments + outflowMaterialCosts + outflowLaborCosts + outflowOverhead + outflowEquipment`)
3. `netCashFlow` = `totalInflows - totalOutflows`
4. `cumulativeCashFlow` = Running sum of monthly `netCashFlow` from project start
5. `forecastAccuracy` = `(|actualNet - priorForecastNet| / |priorForecastNet|) × 100` (Actual records only, when prior forecast exists)
6. `peakCashRequirement` = Minimum (most negative) value in cumulative cash flow series
7. `cashFlowAtRisk` = Sum of all months where `projectedNetCashFlow < 0`

### 10.6 Buyout calculations

1. `overUnder` = `contractAmount - originalBudget` (positive = over, unfavorable)
2. `buyoutSavingsAmount` = `max(0, originalBudget - contractAmount)` when contract is executed
3. `percentBuyoutCompleteDollarWeighted` = `sum(contractAmount for ContractExecuted + Complete) / totalBudget × 100`

### 10.7 Edit provenance requirements

Every edit to a PM-editable field in a working version creates an audit record:
- `lastEditedBy` (userId)
- `lastEditedAt` (ISO 8601 UTC)
- Prior value saved for comparison

Edit history is retained indefinitely. Confirmed versions are immutable — no edit records are created on confirmed versions.

---

## 11. Status and Lifecycle Enumerations

### 11.1 Forecast version type

| Enum Value | Description |
|------------|-------------|
| `Working` | Current draft; PM-editable |
| `ConfirmedInternal` | Immutable snapshot; PER-annotatable |
| `PublishedMonthly` | Official monthly version; immutable |
| `Superseded` | Replaced by a later version; immutable; read-only |

### 11.2 Forecast derivation reason

| Enum Value | Description |
|------------|-------------|
| `InitialSetup` | First version created for the project |
| `BudgetImport` | New budget import triggered derivation |
| `PostConfirmationEdit` | PM derived working version from a confirmed version to make edits |
| `ScheduleRefresh` | Downstream source refresh triggered derivation |
| `ManualDerivation` | PM explicitly created a new working version |

### 11.3 Forecast checklist group

| Enum Value | Description |
|------------|-------------|
| `RequiredDocuments` | Documents and attachments required before confirmation |
| `ProfitForecast` | Profit and cost forecast review items |
| `Schedule` | Schedule-related confirmation items |
| `Additional` | Contingency, GC, A/R, and savings disposition items |

### 11.4 Buyout line status

| Enum Value | Description |
|------------|-------------|
| `NotStarted` | Scope identified; solicitation not yet issued |
| `LoiPending` | LOI issued; awaiting subcontractor execution |
| `LoiExecuted` | LOI signed by both parties |
| `ContractPending` | Formal contract in drafting/review |
| `ContractExecuted` | Formal subcontract signed; commitment finalized |
| `Complete` | Subcontract work finished; final invoice reconciled |
| `Void` | Cancelled or scope eliminated |

### 11.5 Buyout savings disposition status

| Enum Value | Description |
|------------|-------------|
| `NoSavings` | No savings exist on this line (`contractAmount >= originalBudget` or contract not yet executed) |
| `Undispositioned` | Savings recognized; no disposition action taken yet |
| `PartiallyDispositioned` | Some savings dispositioned; remainder pending |
| `FullyDispositioned` | All savings dispositioned |

---

## 12. Field Summary Index

**Quick reference — alphabetical.**

| Field Name | T-file / Section | Type | Editable |
|------------|-----------------|------|----------|
| `approvedCOs` | T02 §3.1 | number | No |
| `approvedDaysExtensions` | T04 §5.2 | integer | Yes (working) |
| `arAgeId` | T05 §7.5 | string | No (read-only) |
| `budgetCode` | T02 §3.1 | string | No |
| `budgetCodeDescription` | T02 §3.1 | string | No |
| `budgetImportRowId` | T02 §3.1 | string | No |
| `budgetModifications` | T02 §3.1 | number | No |
| `buyoutLineId` | T06 §8.1 | string | No |
| `buyoutSavingsAmount` | T06 §8.1 | number | No (calculated) |
| `canonicalBudgetLineId` | T02 §3.1 | string | No |
| `cashFlowAtRisk` | T05 §7.3 | number | No (calculated) |
| `committedCosts` | T02 §3.1 | number | No |
| `contractAmount` | T06 §8.1 | number | Yes |
| `costExposureToDate` | T02 §3.1 | number | No (calculated) |
| `costType` | T02 §3.1 | CostType | No |
| `cumulativeCashFlow` | T05 §7.1 | number | No (calculated) |
| `currentContingency` | T04 §5.4 | number | Yes (working) |
| `currentContractValue` | T04 §5.3 | number | Yes (working) |
| `currentProfit` | T04 §5.3 | number | No (calculated) |
| `damageClauseLDs` | T04 §5.1 | string | Yes (working) |
| `derivedFromVersionId` | T03 §3.3 | string | No |
| `derivationReason` | T03 §3.3 | ForecastDerivationReason | No |
| `divisionCode` | T06 §8.1 | string | No |
| `estimatedCostAtCompletion` (line) | T02 §3.1 | number | No (calculated) |
| `estimatedCostAtCompletion` (summary) | T04 §5.3 | number | No (calculated) |
| `expectedContingencyAtCompletion` | T04 §5.4 | number | Yes (working) |
| `expectedContingencyUse` | T04 §5.4 | number | No (calculated) |
| `externalSourceLineId` | T02 §3.1 | string \| null | No |
| `externalSourceSystem` | T02 §3.1 | string | No |
| `fallbackCompositeMatchKey` | T02 §3.1 | string | No |
| `forecastAccuracy` | T05 §7.1 | number \| null | No (calculated) |
| `forecastToComplete` | T02 §3.1 | number | **Yes (working only)** |
| `forecastVersionId` | T03 §3.3 | string | No |
| `gcEstimateAtCompletion` (GC/GR line) | T04 §6.1 | number | **Yes (working)** |
| `gcEstimateAtCompletion` (summary) | T04 §5.5 | number | No (calculated) |
| `gcGrId` | T04 §6.1 | string | No |
| `gcVariance` | T04 §6.1 | number | No (calculated) |
| `grEstimateAtCompletion` | T04 §6.1 | number | **Yes (working)** |
| `grVariance` | T04 §6.1 | number | No (calculated) |
| `importBatchId` | T02 §3.1 | string | No |
| `importedAt` | T02 §3.1 | string | No |
| `isReportCandidate` | T03 §3.3 | boolean | Yes (PM designation) |
| `jobToDateActualCost` | T02 §3.1 | number | No |
| `loiDateToBeSent` | T06 §8.1 | string \| null | Yes |
| `loiReturnedExecuted` | T06 §8.1 | string \| null | Yes |
| `netCashFlow` | T05 §7.1 | number | No (calculated) |
| `notes` (buyout) | T06 §8.1 | string \| null | Yes |
| `notes` (GC/GR) | T04 §6.1 | string \| null | Yes |
| `notes` (cash flow) | T05 §7.1 | string \| null | Yes |
| `notes` (budget line) | T02 §3.1 | string \| null | Yes (working) |
| `originalBudget` (budget line) | T02 §3.1 | number | No |
| `originalBudget` (buyout) | T06 §8.1 | number | No |
| `originalContingency` | T04 §5.4 | number | No |
| `originalContractCompletion` | T04 §5.2 | string | No |
| `originalContractValue` | T04 §5.3 | number | No |
| `originalEstimatedCost` | T04 §5.3 | number | No |
| `originalGCEstimate` | T04 §5.5 | number | No |
| `originalProfit` | T04 §5.3 | number | No |
| `originalBuyoutSavings` | T04 §5.3 | number | No |
| `overUnder` (buyout) | T06 §8.1 | number \| null | No (calculated) |
| `peakCashRequirement` | T05 §7.3 | number | No (calculated) |
| `pendingBudgetChanges` | T02 §3.1 | number | No |
| `pendingCostChanges` | T02 §3.1 | number | No |
| `percentBuyoutCompleteDollarWeighted` | T06 §8.4 | number | No (calculated) |
| `priorForecastToComplete` | T02 §3.1 | number \| null | No |
| `profitMargin` | T04 §5.3 | number | No (calculated) |
| `projectId` | T02 §3.1 | string | No |
| `projectedBudget` | T02 §3.1 | number | No (calculated) |
| `projectedCosts` | T02 §3.1 | number | No (calculated) |
| `projectedNetCashFlow` | T05 §7.2 | number | No (calculated) |
| `projectedOverUnder` | T02 §3.1 | number | No (calculated) |
| `publishedAt` | T03 §3.3 | string \| null | No |
| `reportingMonth` | T03 §3.3 | string \| null | No |
| `retainage` | T05 §7.5 | number | No (read-only) |
| `retentionHeld` | T05 §7.1 | number | No |
| `revisedBudget` | T02 §3.1 | number | No (calculated) |
| `revisedContractCompletion` | T04 §5.2 | string | No (calculated) |
| `savingsDispositionStatus` | T06 §8.1 | BuyoutSavingsDispositionStatus | No |
| `staleBudgetLineCount` | T03 §3.3 | number | No (calculated) |
| `status` (buyout) | T06 §8.1 | BuyoutLineStatus | Yes |
| `subcontractChecklistId` | T06 §8.1 | string \| null | Yes |
| `subcontractorVendorName` | T06 §8.1 | string | Yes |
| `totalInflows` | T05 §7.1 | number | No (calculated) |
| `totalOutflows` | T05 §7.1 | number | No (calculated) |
| `totalVariance` (GC/GR) | T04 §6.1 | number | No (calculated) |
| `versionNumber` | T03 §3.3 | number | No |
| `versionType` | T03 §3.3 | ForecastVersionType | No |

---

*Navigation: [← T06 Buyout Sub-Domain](P3-E4-T06-Buyout-Sub-Domain.md) | [Master Index](P3-E4-Financial-Module-Field-Specification.md) | [T08 Platform Integration and Annotation Scope →](P3-E4-T08-Platform-Integration-and-Annotation-Scope.md)*
