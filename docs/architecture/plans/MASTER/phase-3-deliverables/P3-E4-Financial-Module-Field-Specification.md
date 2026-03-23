# P3-E4: Financial Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-22 |
| **Related Contracts** | P3-E1 §3.1, P3-E2 §3, P3-F1, P3-H1 §18.5 |
| **Source Examples** | docs/reference/example/ |

---

## Purpose

This specification defines the complete data model, field definitions, status enumerations, business rules, and required workflows for the Financial module implementation. Every field listed here **MUST** be implemented. A developer reading this specification must have no ambiguity about what to build.

This document is grounded in the company's working templates and operational data models. The source example files in `docs/reference/example/` are the living templates that this module replaces and digitizes.

### Source Files

- `docs/reference/example/Procore_Budget.csv` — budget line item model (21 columns)
- `docs/reference/example/Financial Forecast Summary & Checklist.xlsx` — forecast summary and checklist
- `docs/reference/example/GC-GR Forecast.xlsm` — GC/GR working model
- `docs/reference/example/HB Draw Schedule -Cash Flow.xlsx` — cash flow projection
- `docs/reference/example/cash-flow.json` — JSON cash flow model
- `docs/reference/example/ar-aging.json` — AR aging display model
- `docs/reference/example/Buyout Log_Template 2025.xlsx` — buyout tracking
- `docs/reference/example/cost-code-dictionary.csv` — 7,566 CSI cost codes
- `docs/reference/example/csi-code-dictionary.csv` — CSI code reference

---

## 1. Budget Line Item Working Model

The budget line item is the fundamental unit of financial tracking in Project Hub. The model is imported from Procore CSV export and represents a single budget code assignment within the project.

### 1.1 Complete Field Table

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source Column (Procore) | Business Rule / Formula |
|------------------------|-----------------|----------|------------|-------------------------|------------------------|
| budgetLineId | `string` | Yes | Yes | — | UUID generated on import; stable line identifier |
| projectId | `string` | Yes | No | — | FK to project record |
| subJob | `string` | No | No | Sub Job | Cost center or phase code (e.g., "Phase 1A", "Building A") |
| costCodeTier1 | `string` | Yes | No | Cost Code Tier 1 | First-level CSI category; validated against cost-code-dictionary.csv |
| costCodeTier2 | `string` | No | No | Cost Code Tier 2 | Second-level detail; optional |
| costCodeTier3 | `string` | No | No | Cost Code Tier 3 | Third-level detail; optional |
| costType | `enum` | Yes | No | Cost Type | Enum: `Labor` \| `Material` \| `Equipment` \| `Subcontract` \| `Other` |
| budgetCode | `string` | Yes | No | Budget Code | Procore budget code identifier; unique within project |
| budgetCodeDescription | `string` | Yes | No | Budget Code Description | Human-readable description of budget line (e.g., "Foundation Concrete Work") |
| originalBudget | `number` | Yes | No | Original Budget | Planned budget in USD; decimal to 2 places; must be > 0 |
| budgetModifications | `number` | Yes | No | Budget Modifications | Net budget add/remove in USD (can be positive or negative); cumulative |
| approvedCOs | `number` | Yes | No | Approved COs | Net approved change order adjustments; cumulative; can be negative (credit) |
| revisedBudget | `number` | Yes | Yes | — | **Calculated**: `originalBudget + budgetModifications + approvedCOs` |
| pendingBudgetChanges | `number` | Yes | No | Pending Budget Changes | Submitted but not yet approved change orders; can be positive or negative |
| projectedBudget | `number` | Yes | Yes | — | **Calculated**: `revisedBudget + pendingBudgetChanges` |
| committedCosts | `number` | Yes | No | Committed Costs | Purchase orders, subcontracts, and known commitments not yet invoiced; USD |
| directCosts | `number` | Yes | No | Direct Costs | Material and direct labor actually incurred and invoiced; USD |
| jobToDateCosts | `number` | Yes | No | Job to Date Costs | Sum of all actual costs to date: `directCosts + committedCosts + other indirect allocations`; USD |
| pendingCostChanges | `number` | Yes | No | Pending Cost Changes | Costs submitted for approval/allocation but not finalized; USD |
| projectedCosts | `number` | Yes | Yes | — | **Calculated**: `jobToDateCosts + pendingCostChanges` |
| forecastToComplete | `number` | Yes | No | Forecast To Complete | **PM-EDITABLE FIELD** — PM's best estimate of remaining cost to finish this line; USD; default = `revisedBudget - jobToDateCosts` |
| estimatedCostAtCompletion | `number` | Yes | Yes | Estimated Cost at Completion | **Calculated**: `jobToDateCosts + forecastToComplete` |
| projectedOverUnder | `number` | Yes | Yes | Projected over/Under | **Calculated**: `revisedBudget - estimatedCostAtCompletion`. **Sign convention**: Positive = under budget (favorable); Negative = over budget (unfavorable) |
| importedAt | `datetime` | Yes | Yes | — | Timestamp of CSV import; immutable |
| importBatchId | `string` | Yes | Yes | — | UUID of import transaction; groups all lines from single upload |
| lastEditedBy | `string` | No | No | — | userId of PM who last edited `forecastToComplete`; null if not edited since import |
| lastEditedAt | `datetime` | No | No | — | Timestamp of last edit to `forecastToComplete`; null if not edited since import |
| priorForecastToComplete | `number` | No | No | — | Previous value of `forecastToComplete` before current edit; enables audit trail |
| notes | `string` | No | No | — | Optional PM notes about forecast or issues with this line |

### 1.2 Budget Line Import Workflow

**CSV Import Process:**
1. PM uploads Procore_Budget.csv file via the Financial module UI
2. System validates all rows:
   - Each row must have: `budgetCode`, `budgetCodeDescription`, `costType`, `originalBudget`
   - `costCodeTier1` is validated against `cost-code-dictionary.csv` (7,566 records); if not found, import fails with specific line error
   - `originalBudget` must be a positive decimal
   - Duplicate `budgetCode` values within same import are rejected
3. All rows from single import receive same `importBatchId`
4. System calculates all `Calculated` fields immediately
5. `forecastToComplete` defaults to `revisedBudget - jobToDateCosts` for each line
6. Import status displayed: parsing → validation → success/failure with line-specific errors
7. On success, all lines are written atomically; on failure, no lines are written

**Cost-Code Dictionary Reference:**
- File: `cost-code-dictionary.csv`
- Structure: `stage | csi_code (XX-XX-XXX format) | csi_code_description`
- 7,566 valid cost codes loaded into reference table at system startup
- Validation: `costCodeTier1` must be exact match to `csi_code` in dictionary; case-sensitive
- CSI Code alternate format: `csi-code-dictionary.csv` contains same codes in `XX XX XX` format (spaces); both formats must be supported for user input

### 1.3 Cost Type Enumeration

| Enum Value | Description | Usage |
|------------|-------------|-------|
| `Labor` | Direct labor (wages, burden, payroll taxes) | Manage crew/staffing costs |
| `Material` | Materials, supplies, and consumables | Manage procurement |
| `Equipment` | Equipment rental, purchase, or lease | Manage equipment deployment |
| `Subcontract` | Subcontractor and vendor invoices | Manage buyout log reconciliation |
| `Other` | Miscellaneous or unclassified costs | Default when cost type unclear |

### 1.4 PM Editing Rules and Provenance

**Only one field is PM-editable after import:** `forecastToComplete`

**Edit Rules:**
- All other fields are immutable post-import (read-only)
- Each edit to `forecastToComplete` creates an audit record:
  - `lastEditedBy` = userId of PM
  - `lastEditedAt` = current datetime (UTC)
  - `priorForecastToComplete` = value before edit (enables comparison)
- Edit triggers recalculation of:
  - `estimatedCostAtCompletion = jobToDateCosts + forecastToComplete`
  - `projectedOverUnder = revisedBudget - estimatedCostAtCompletion`
- A new import for the same project completely replaces the prior budget (old importBatchId is marked historical but retained for audit)

**Validation on edit:**
- `forecastToComplete` cannot be negative; system enforces >= 0
- `forecastToComplete` cannot be less than the amount already spent (`jobToDateCosts`); system enforces: `forecastToComplete >= jobToDateCosts - revisedBudget` (otherwise estimated cost exceeds any reasonable completion scenario)

---

## 2. Financial Forecast Summary Model

The Financial Forecast Summary is the high-level financial projection for the entire project. It aggregates budget line data, schedule data, and PM manual overrides into a single coherent forecast document.

### 2.1 Project Metadata Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (Excel Sheet 1) | Business Rule |
|------------------------|-----------------|----------|------------|------------------------|---------------|
| forecastId | `string` | Yes | Yes | — | UUID; identifies this forecast version; immutable |
| projectId | `string` | Yes | No | — | FK to project |
| projectName | `string` | Yes | No | PROJECT NAME | Display name; must match project record |
| projectNumber | `string` | Yes | No | PROJECT NO. | Unique project identifier (e.g., "PH-2024-001"); matches project record |
| contractType | `enum` | Yes | No | Contract Type | Enum: `GMP` (Guaranteed Maximum Price) \| `LumpSum` (Lump Sum) \| `CostPlus` (Cost Plus Fixed Fee) \| `UnitPrice` (Unit Price) \| `TimeAndMaterials` (T&M) |
| projectType | `enum` | Yes | No | Project Type | Enum: `Commercial` \| `Residential` \| `Healthcare` \| `Education` \| `Industrial` \| `Infrastructure` \| `Other` |
| damageClauseLDs | `string` | No | No | Damage Clause/LD's | Text description of liquidated damages clause (e.g., "$1,000 per day after 2026-12-31"); informational; no calculation impact |

### 2.2 Schedule Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| originalContractCompletion | `date` | Yes | No | Original Contract Completion | Contract baseline completion date; read-only reference |
| approvedDaysExtensions | `integer` | Yes | No | Approved Days | Total calendar days granted via approved change orders; >= 0 |
| revisedContractCompletion | `date` | Yes | Yes | — | **Calculated**: `originalContractCompletion + approvedDaysExtensions days` |

### 2.3 Financial Summary Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| originalContractValue | `number` | Yes | No | Original Contract Value | Initial contract amount in USD; immutable reference |
| originalEstimatedCost | `number` | Yes | No | Original Cost | Original estimated total cost in USD; immutable reference |
| originalProfit | `number` | Yes | No | Original Profit | **Calculated at time of contract**: `originalContractValue - originalEstimatedCost` |
| originalBuyoutSavings | `number` | Yes | No | Original Buyout Savings | Original estimated savings from competitive buyout; USD |
| currentContractValue | `number` | Yes | No | — | **PM-EDITABLE**; current contract value after approved change orders; starts equal to `originalContractValue`; modified via change order approval workflow |
| estimatedCostAtCompletion | `number` | Yes | Yes | — | **Calculated**: Sum of `estimatedCostAtCompletion` across all budget lines plus GC/GR totals |
| currentProfit | `number` | Yes | Yes | — | **Calculated**: `currentContractValue - estimatedCostAtCompletion` |
| profitMargin | `number` | Yes | Yes | — | **Calculated**: `(currentProfit / currentContractValue) × 100`; format as percentage to 2 decimal places; negative indicates loss |

### 2.4 Contingency Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| originalContingency | `number` | Yes | No | Original Contingency | Original contingency reserve in USD; typically 5-10% of estimated cost |
| currentContingency | `number` | Yes | No | Current Contingency | **PM-EDITABLE**; contingency remaining (consumed via change orders and cost adjustments) |
| expectedContingencyAtCompletion | `number` | Yes | No | Expected at Completion | PM forecast of contingency remaining at project end; USD |
| expectedContingencyUse | `number` | Yes | No | Expected Use | **Calculated**: `originalContingency - expectedContingencyAtCompletion` |

### 2.5 General Conditions Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| originalGCEstimate | `number` | Yes | No | Original Estimate (GC) | Original General Conditions budget; USD |
| gcEstimateAtCompletion | `number` | Yes | Yes | — | **Calculated**: Sum of all `gcEstimateAtCompletion` values from GC/GR working model (§4) |

### 2.6 Metadata and Status

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| createdAt | `datetime` | Yes | Yes | — | Timestamp when forecast was first created; immutable |
| createdBy | `string` | Yes | Yes | — | userId of PM who created forecast |
| lastConfirmedAt | `datetime` | No | No | — | Timestamp when PM last confirmed (locked) this forecast for reporting; null if in Draft |
| lastConfirmedBy | `string` | No | No | — | userId of PM who confirmed; null if in Draft |
| status | `enum` | Yes | No | — | Enum: `Draft` (working, editable) \| `Confirmed` (locked, used for reporting) \| `Stale` (source data changed after confirmation—see §2.7) |
| statusReason | `string` | No | No | — | If status = `Stale`, explains which source changed (e.g., "Budget import on 2026-03-21") |

### 2.7 Staleness Detection

**Rule:** When a new budget import occurs after a forecast is Confirmed, the forecast is automatically marked `Stale` because the underlying budget line data has changed. PM must reconcile and re-confirm the forecast before it is valid for reporting.

- `statusReason` is set to: `"Stale: Budget import [importBatchId] on [date] replaced prior data. Please review and re-confirm."`
- UI marks Stale forecasts prominently to prevent stale data from being reported
- Historical Stale forecasts are retained (not deleted) for audit trail

---

## 3. Forecast Checklist Model

The Forecast Checklist is a structured checklist that PM completes before locking a forecast for reporting. It ensures that all required documents, reviews, and confirmations are in place. The forecast cannot be moved to Confirmed status until the checklist is 100% complete.

### 3.1 Checklist Structure

| itemId (stable identifier) | group | label (exact from template) | description | required |
|----------------------------|-------|-------------------------|-------------|----------|
| doc_procore_budget | RequiredDocuments | Procore Budget export attached | Most recent Procore CSV budget export uploaded and validated | Yes |
| doc_forecast_summary | RequiredDocuments | Forecast Summary completed | All fields in Financial Forecast Summary (§2) are populated and reviewed | Yes |
| doc_gc_gr_log | RequiredDocuments | GC/GR Log completed | General Conditions and General Requirements forecast completed (§4) | Yes |
| doc_cash_flow | RequiredDocuments | Cash Flow projection completed | 18-month cash flow projection entered and reviewed (§5) | Yes |
| doc_sdi_log | RequiredDocuments | SDI Log attached | Shop Drawing and Submittal tracking log current and attached | Yes |
| doc_buyout_log | RequiredDocuments | Buyout Log completed | Buyout log (§6) updated with all subcontract and vendor commitments | Yes |
| profit_changes_noted | ProfitForecast | Profit changes noted in working files | All changes to profit forecast documented and explained | Yes |
| profit_negative_flagged | ProfitForecast | Negative profit values flagged for review | If `currentProfit` is negative, PM has flagged for executive review | Yes |
| profit_gc_savings_confirmed | ProfitForecast | GC/buyout savings confirmed | Estimated savings from value engineering and competitive buyout confirmed with subcontractor agreements | Yes |
| profit_events_documented | ProfitForecast | Projected events documented | All anticipated cost-affecting events (delays, claims, change orders) documented in notes | Yes |
| schedule_status_current | Schedule | Schedule status current (within 7 days) | Schedule milestone list (from Schedule module) reviewed and current; not older than 7 days | Yes |
| schedule_brewing_items_noted | Schedule | Brewing issues noted | Forthcoming schedule risks and potential delays documented | Yes |
| schedule_gc_gr_confirmed | Schedule | GC/GR schedule confirmed | General Conditions/Requirements schedule alignment with overall project schedule confirmed | Yes |
| schedule_delay_notices_sent | Schedule | Delay notices sent (if applicable) | If schedule has slipped > 5 days from baseline, delay notice sent per contract terms | Conditional |
| reserve_contingency_confirmed | Additional | Contingency reserve confirmed | Current contingency amount reconciled against cost approvals; amount is realistic given remaining work | Yes |
| reserve_gc_confirmed | Additional | GC estimate at completion confirmed | General Conditions estimate reviewed and confirmed by site leadership | Yes |
| ar_aging_reviewed | Additional | A/R aging reviewed (cash flow impact) | Accounts receivable aging (§5.4) reviewed; collections plan noted if issues exist | Yes |
| executive_approval_noted | Additional | Executive review completed (optional) | If forecast indicates issues (negative profit, schedule delay > 10 days, low contingency), executive review comment documented | Conditional |

### 3.2 Checklist Item Record Structure

| Field Name (camelCase) | TypeScript Type | Required | Description |
|------------------------|-----------------|----------|-------------|
| checklistId | `string` | Yes | UUID; identifies this checklist instance |
| forecastId | `string` | Yes | FK to Financial Forecast Summary |
| itemId | `string` | Yes | Stable item identifier from §3.1 above |
| group | `enum` | Yes | Enum: `RequiredDocuments` \| `ProfitForecast` \| `Schedule` \| `Additional` |
| label | `string` | Yes | Display text of checklist item (exact from §3.1) |
| description | `string` | No | Explanatory text |
| completed | `boolean` | Yes | true = PM has checked off this item; false = not yet completed |
| completedBy | `string` | No | userId of PM who checked item; null if `completed = false` |
| completedAt | `datetime` | No | Timestamp when item was checked; null if `completed = false` |
| notes | `string` | No | Optional PM notes explaining completion or flagging concerns |
| required | `boolean` | Yes | true = item must be completed to lock forecast; false = informational only |

### 3.3 Checklist Completion and Locking

**Forecast Lock Rule:**
- A forecast may only transition from `Draft` to `Confirmed` when:
  1. All required checklist items (`required = true`) have `completed = true`
  2. All financial fields in Forecast Summary (§2) are populated and valid
  3. Budget line forecast totals are sensible (no line has `projectedOverUnder` > ±100% of `revisedBudget`)
  4. No Stale conditions exist (§2.7)

**Confirmation Action:**
- PM clicks "Lock & Confirm Forecast" button
- System validates all conditions above; if any fail, displays clear error listing unfulfilled requirements
- On success, sets `status = Confirmed`, `lastConfirmedAt = now`, `lastConfirmedBy = userId`
- Confirmed forecast is immutable; PM may not edit any financial fields while locked
- To make changes, PM must explicitly "Unlock" the forecast (sets `status = Draft`), edit, and re-confirm

**Checklist UI Behavior:**
- Incomplete items display in red; completed items in green
- Item groups summarized: "6 of 6 Required Documents", "4 of 4 Profit Forecast items", etc.
- "Lock & Confirm" button disabled until all required items complete
- Clear message: "Complete all required items before locking forecast for reporting."

---

## 4. GC/GR Working Model

General Conditions (GC) and General Requirements (GR) are overhead and jobsite costs managed separately from direct construction costs. This model tracks GC/GR by CSI division and cost category, with PM updating estimates-at-completion as project progresses.

### 4.1 GC/GR Line Record Structure

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (Excel sheet) | Business Rule |
|------------------------|-----------------|----------|------------|----------------------|---------------|
| gcGrId | `string` | Yes | Yes | — | UUID; stable identifier for this GC/GR line |
| projectId | `string` | Yes | No | — | FK to project |
| divisionNumber | `string` | Yes | No | Division # | CSI division number (e.g., "01" for General Requirements, "02" for Sitework); standard CSI format (XX) |
| divisionDescription | `string` | Yes | No | Division description | Display name from CSI division list (e.g., "General Requirements", "Sitework") |
| gcGrCategory | `enum` | Yes | No | GC category types | Enum: `Labor` \| `Material` \| `Equipment` \| `Subcontract` \| `Supervision` \| `Insurance` \| `BondsInsurance` \| `TaxPermit` \| `FieldOffice` \| `Miscellaneous` \| `Other` |
| originalGCBudget | `number` | Yes | No | Original GC Budget | Original estimate for General Conditions in this division/category; USD; immutable reference |
| gcEstimateAtCompletion | `number` | Yes | No | GC EAC | **PM-EDITABLE**; PM's current forecast of total GC cost for this line; USD; may exceed originalGCBudget |
| gcVariance | `number` | Yes | Yes | — | **Calculated**: `gcEstimateAtCompletion - originalGCBudget`. Sign convention: Positive = cost overrun (unfavorable); Negative = cost savings (favorable) |
| originalGRBudget | `number` | Yes | No | Original GR Budget | Original estimate for General Requirements in this division/category; USD; immutable reference |
| grEstimateAtCompletion | `number` | Yes | No | GR EAC | **PM-EDITABLE**; PM's current forecast of total GR cost for this line; USD |
| grVariance | `number` | Yes | Yes | — | **Calculated**: `grEstimateAtCompletion - originalGRBudget` |
| totalVariance | `number` | Yes | Yes | — | **Calculated**: `gcVariance + grVariance` |
| notes | `string` | No | No | Notes | PM commentary explaining variance or forecasting rationale |
| lastEditedBy | `string` | No | No | — | userId of PM who last edited `gcEstimateAtCompletion` or `grEstimateAtCompletion` |
| lastEditedAt | `datetime` | No | No | — | Timestamp of last edit |

### 4.2 GC/GR Category Enumeration

| Enum Value | Description | Example |
|------------|-------------|---------|
| `Labor` | Site supervision, project management, administrative staff | Superintendent, office manager payroll |
| `Material` | Consumables used for general site operations | Temporary fencing, site signage, fuel |
| `Equipment` | Equipment rental for site operations | Cranes, hoists, temporary power |
| `Subcontract` | GC subcontracts (e.g., site management, safety) | Safety consultant, temporary facility provider |
| `Supervision` | Dedicated supervisory and quality control staff | Quality assurance manager |
| `Insurance` | Builders Risk, GL insurance premiums | Project insurance costs |
| `BondsInsurance` | Performance and payment bonds | Contract bond premiums |
| `TaxPermit` | Permits, licenses, and tax allocations | Building permit, sales tax on materials |
| `FieldOffice` | Temporary field office and storage facilities | Trailer rental, utilities |
| `Miscellaneous` | Small tools, minor consumables, cleanup | Tool purchase, waste disposal |
| `Other` | Unclassified GC/GR expense | Default when category unclear |

### 4.3 GC/GR Aggregation and Feed to Forecast Summary

**Aggregation Rule:**
- System automatically sums all `gcEstimateAtCompletion` values across all divisions and categories
- Total feeds into Forecast Summary field `gcEstimateAtCompletion` (§2.5)
- GC/GR lines are editable independently; changes automatically propagate to Forecast Summary totals

**Display on Canvas:**
- GC/GR summary tile shows:
  - `totalOriginalBudget = sum of (originalGCBudget + originalGRBudget)`
  - `totalEstimateAtCompletion = sum of (gcEstimateAtCompletion + grEstimateAtCompletion)`
  - `totalVariance = totalEstimateAtCompletion - totalOriginalBudget`
  - Variance color-coded: red if negative (over budget), green if positive (under budget)

### 4.4 PM Editing Rules

- PM may edit `gcEstimateAtCompletion` and `grEstimateAtCompletion` at any time (working forecast)
- Each edit creates provenance record:
  - `lastEditedBy = userId`
  - `lastEditedAt = now`
- Forecast Summary is marked `Stale` if GC/GR estimates change after the forecast is Confirmed
- Validation: neither EAC field can be negative; system enforces >= 0

---

## 5. Cash Flow Working Model

The Cash Flow model projects monthly inflows (owner billings/draws) and outflows (subcontractor payments, material costs, labor, overhead) for the remaining project duration. It includes 13 months of actuals (historical) and 18 months of forward projection.

### 5.1 Monthly Actual Cash Flow Record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (cash-flow.json) | Business Rule |
|------------------------|-----------------|----------|------------|-------------------------|---------------|
| monthlyRecordId | `string` | Yes | Yes | — | UUID; identifies this month's record |
| projectId | `string` | Yes | No | project_id | FK to project |
| periodMonth | `integer` | Yes | No | month | Month index: 1 = Jan, 2 = Feb, ..., 12 = Dec (annual), 13+ for multi-year projects; cycle every 12 months |
| calendarDate | `date` | Yes | No | — | First day of month (e.g., 2024-01-01, 2024-02-01); immutable; drives sorting |
| recordType | `enum` | Yes | No | — | Enum: `Actual` (historical data) \| `Forecast` (projected data) |
| inflowOwnerPayments | `number` | Yes | No | inflows.owner_payments | Owner progress billing received and deposited; USD |
| inflowOtherInflows | `number` | Yes | No | inflows.other_inflows | Other revenue (change order billings, retainage releases); USD |
| totalInflows | `number` | Yes | Yes | — | **Calculated**: `inflowOwnerPayments + inflowOtherInflows` |
| outflowSubcontractorPayments | `number` | Yes | No | outflows.subcontractor_payments | Subcontractor and vendor invoices paid in month; USD |
| outflowMaterialCosts | `number` | Yes | No | outflows.material_costs | Material and procurement costs paid; USD |
| outflowLaborCosts | `number` | Yes | No | outflows.labor_costs | Direct labor and crew wages paid; USD |
| outflowOverhead | `number` | Yes | No | outflows.overhead | Office, insurance, and general overhead allocated to month; USD |
| outflowEquipment | `number` | Yes | No | outflows.equipment | Equipment rental and operating costs; USD |
| totalOutflows | `number` | Yes | Yes | — | **Calculated**: `outflowSubcontractorPayments + outflowMaterialCosts + outflowLaborCosts + outflowOverhead + outflowEquipment` |
| netCashFlow | `number` | Yes | Yes | — | **Calculated**: `totalInflows - totalOutflows`. Sign: positive = surplus, negative = deficit |
| cumulativeCashFlow | `number` | Yes | Yes | — | **Calculated**: Sum of `netCashFlow` from first month to current month; represents cumulative cash position |
| workingCapital | `number` | No | No | working_capital | Current assets minus current liabilities (informational; pulled from accounting system if available) |
| retentionHeld | `number` | Yes | No | retention_held | Cumulative retainage held by owner at end of month; calculated per standard retention model (see §5.5) |
| forecastAccuracy | `number` | Yes | Yes | forecast_accuracy | **For Actual records ONLY** (Forecast records = null). Calculated: `(|actualNetCashFlow - priorForecastNetCashFlow| / |priorForecastNetCashFlow|) × 100` if prior forecast exists; null if no comparable forecast |
| recordedAt | `datetime` | Yes | Yes | — | Timestamp when actual was recorded; immutable |
| notes | `string` | No | No | — | Optional PM notes (e.g., "Delayed sub payment due to invoice discrepancy") |

### 5.2 Monthly Forecast Cash Flow Record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| monthlyRecordId | `string` | Yes | Yes | — | UUID; identifies this forecast month |
| projectId | `string` | Yes | No | — | FK to project |
| periodMonth | `integer` | Yes | No | month | Month index; continues from actuals (e.g., if 13 actual months, forecast starts at month 14) |
| calendarDate | `date` | Yes | No | — | First day of month; drives sorting |
| recordType | `enum` | Yes | No | — | Always `Forecast` for projected records |
| projectedInflows | `number` | Yes | No | — | **PM-EDITABLE**; forecasted owner draws/billings expected in month; USD |
| projectedOutflows | `number` | Yes | No | — | **PM-EDITABLE**; forecasted subcontractor payments, material, labor, overhead for month; USD |
| projectedNetCashFlow | `number` | Yes | Yes | — | **Calculated**: `projectedInflows - projectedOutflows` |
| projectedCumulativeCashFlow | `number` | Yes | Yes | — | **Calculated**: Sum of `projectedNetCashFlow` from last actual month through current forecast month |
| confidenceScore | `integer` | Yes | No | confidence | PM-estimated accuracy of forecast for this month; range: 0-100; 100 = high confidence (e.g., locked subcontracts); 0 = speculative |
| notes | `string` | No | No | — | Optional PM explanation of forecast assumptions for month |
| lastEditedBy | `string` | No | No | — | userId of PM who last edited this month's projection |
| lastEditedAt | `datetime` | No | No | — | Timestamp of last edit |

### 5.3 Cash Flow Summary Aggregate

The Cash Flow Summary is a single record aggregating the entire cash flow projection. It is computed on demand and published to the Health spine.

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule |
|------------------------|-----------------|----------|------------|---------------|
| summaryId | `string` | Yes | Yes | UUID |
| projectId | `string` | Yes | No | FK to project |
| totalActualInflows | `number` | Yes | Yes | Sum of `totalInflows` across all actual months |
| totalActualOutflows | `number` | Yes | Yes | Sum of `totalOutflows` across all actual months |
| totalActualNetCashFlow | `number` | Yes | Yes | Sum of `netCashFlow` across all actual months |
| totalForecastedInflows | `number` | Yes | Yes | Sum of `projectedInflows` across all forecast months |
| totalForecastedOutflows | `number` | Yes | Yes | Sum of `projectedOutflows` across all forecast months |
| totalForecastedNetCashFlow | `number` | Yes | Yes | Sum of `projectedNetCashFlow` across all forecast months |
| combinedNetCashFlow | `number` | Yes | Yes | `totalActualNetCashFlow + totalForecastedNetCashFlow` |
| peakCashRequirement | `number` | Yes | Yes | Minimum (most negative) value in entire `cumulativeCashFlow` series (actual + forecast); indicates largest cash shortfall |
| cashFlowAtRisk | `number` | Yes | Yes | Sum of all months where `projectedNetCashFlow < 0` (forecasted deficit months); indicates cumulative cash risk |
| workingCapital | `number` | No | No | Current assets - current liabilities (informational; pulled from accounting if available) |
| computedAt | `datetime` | Yes | Yes | Timestamp when summary was last computed |
| lastUpdated | `datetime` | Yes | Yes | Timestamp of last data change (any inflow/outflow edit) |

### 5.4 Retention Calculation Model

Retention is typically 10% of invoice amount, released on project completion or per contract schedule.

**Standard Retention Model (configurable per project):**
- Retainage rate: default 10% (may be different per contract; stored in project settings)
- Release schedule: Full retention held until Substantial Completion; then released per contract (e.g., 50% on completion, 50% after punch list)
- Calculation rule per month:
  ```
  monthlyRetentionHeld = sum of all invoices to date × retainageRate
  - (sum of retainage releases to date per contract schedule)
  ```
- Shown in: `retentionHeld` field in Monthly Actual record
- Impacts `cumulativeCashFlow` (retention reduces available cash until released)

**Contract Schedule Configuration:**
- Project may define custom retention release schedule (e.g., 50% release on Substantial Completion, 50% after punch list closeout)
- If not specified, default: 100% retention held until project completion

### 5.5 A/R Aging Display Model (READ-ONLY)

**Important:** A/R Aging data is **READ-ONLY** and sourced from the accounting/ERP system. Project Hub Financial module does not create or modify A/R records. This is a display/reporting surface only.

| Field Name (camelCase) | TypeScript Type | Required | Source | Description |
|------------------------|-----------------|----------|--------|-------------|
| arAgeId | `string` | Yes | — | UUID; record identifier |
| projectId | `string` | Yes | — | FK to project |
| projectName | `string` | Yes | Accounting ERP | Display name |
| projectManager | `string` | Yes | Accounting ERP | PM name or ID |
| percentComplete | `number` | Yes | Schedule module | Project completion percentage (0-100); pulled from Schedule spine |
| balanceToFinish | `number` | Yes | Accounting ERP | Estimated remaining work value in USD |
| retainage | `number` | Yes | Cash Flow model | Total retainage held by owner; USD |
| totalAR | `number` | Yes | Accounting ERP | Total accounts receivable (all invoices outstanding); USD |
| current0To30 | `number` | Yes | Accounting ERP | Invoices due 0-30 days ago (current aging bucket); USD |
| current30To60 | `number` | Yes | Accounting ERP | Invoices due 30-60 days ago; USD |
| current60To90 | `number` | Yes | Accounting ERP | Invoices due 60-90 days ago; USD |
| current90Plus | `number` | Yes | Accounting ERP | Invoices due >90 days ago (severely past due); USD |
| comments | `string` | No | Accounting ERP | Collection notes or issues noted by accounting |
| refreshedAt | `datetime` | Yes | — | Last sync from accounting system; users should see age of data |

**Display Rule:** A/R Aging is displayed on Financial module dashboard as a read-only report tile. PM cannot edit any field. If issues exist (e.g., high 90+ balance), PM is prompted to contact accounting for collection follow-up.

**Integration:** Daily sync job pulls A/R data from accounting system and updates display. If sync fails, dashboard shows last successful sync time and warning.

---

## 6. Buyout Sub-Domain

The Buyout Log tracks subcontract and vendor agreements against the budget. It enables PM to manage commitments and monitor overages as subcontracts are executed. This sub-domain follows a hierarchical CSI division structure.

### 6.1 Buyout Line Item Record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (Buyout Log Excel) | Business Rule |
|------------------------|-----------------|----------|------------|---------------------------|---------------|
| buyoutLineId | `string` | Yes | Yes | — | UUID; stable identifier for this buyout line |
| projectId | `string` | Yes | No | — | FK to project |
| divisionCode | `string` | Yes | No | DIVISION # | CSI division number (e.g., "02" for Sitework, "03" for Concrete, "04" for Masonry); standard CSI XX format; validated against cost-code-dictionary |
| divisionDescription | `string` | Yes | No | DIVISION DESCRIPTION | CSI division name (e.g., "Sitework", "Concrete") |
| lineItemDescription | `string` | Yes | No | (sub-category within division) | Specific scope line within division (e.g., "Foundation Concrete - Labor and Materials") |
| subcontractorVendorName | `string` | Yes | No | SUBCONTRACTOR / VENDOR | Name of subcontractor or vendor |
| contractAmount | `number` | Yes | No | CONTRACT AMOUNT | Executed contract or PO amount in USD; represents the actual agreement price; must match LOI amount or explain variance in notes |
| originalBudget | `number` | Yes | No | ORIGINAL BUDGET | Budget line amount for this scope from budget model (§1); immutable reference for comparison |
| overUnder | `number` | Yes | Yes | — | **Calculated**: `contractAmount - originalBudget`. **Sign convention**: Positive = over budget (unfavorable); Negative = under budget (favorable) |
| loiDateToBeSent | `date` | Yes | No | LOI DATE TO BE SENT | Planned date to send Letter of Intent; null if LOI not yet planned |
| loiReturnedExecuted | `date` | No | No | LOI Returned Executed | Actual date LOI was signed and returned by subcontractor; null if pending |
| contractExecutedDate | `date` | No | No | (tracking column) | Actual date formal contract was signed; null if pending |
| status | `enum` | Yes | No | (tracking column) | Enum: `NotStarted` (not yet solicited) \| `LoiPending` (LOI sent, awaiting signature) \| `LoiExecuted` (LOI signed) \| `ContractPending` (LOI signed, formal contract in progress) \| `ContractExecuted` (formal contract signed; commitment finalized) \| `Complete` (subcontract work completed and invoiced) \| `Void` (cancelled or no longer needed) |
| subcontractChecklistId | `string \| null` | No | No | — | FK to `ISubcontractChecklist.checklistId` in P3-E12; required before `ContractPending` status; MUST be set before status can advance to `ContractExecuted` — see gate rule below |
| notes | `string` | No | No | — | Optional PM commentary on variance, issues, or negotiation notes |
| lastEditedBy | `string` | No | No | — | userId of PM who last edited this line |
| lastEditedAt | `datetime` | No | No | — | Timestamp of last edit |

### 6.2 Buyout Status Enumeration

| Enum Value | Description | Triggers | Typical Duration |
|------------|-------------|----------|------------------|
| `NotStarted` | Scope identified but not yet solicited | Formal scope definition complete | Varies |
| `LoiPending` | LOI issued to subcontractor; awaiting execution | LOI sent to sub; awaiting return | 5-10 days |
| `LoiExecuted` | LOI signed by both parties | Both signatures obtained | Until formal contract drafted |
| `ContractPending` | Formal contract drafted; awaiting execution | LOI executed; contract in review | 10-20 days |
| `ContractExecuted` | Formal subcontract signed and finalized | Final contract signatures obtained | Until work begins/completion |
| `Complete` | Subcontract work finished; all invoices paid | Final invoice paid and reconciled | — |
| `Void` | Cancelled or no longer needed | Scope eliminated or brought in-house | — |

### 6.2a ContractExecuted Gate Rule (Subcontract Compliance)

Transition to `ContractExecuted` is subject to a compliance gate enforced by the Subcontract Compliance module (P3-E12):

```
IBuyoutLineItem.status MUST NOT transition to 'ContractExecuted'
  UNLESS ALL of the following are true:
    1. subcontractChecklistId is non-null (a checklist exists for this subcontract)
    2. ISubcontractChecklist.status === 'Complete'
    3. ISubcontractChecklist.complianceWaiver === null
       OR ISubcontractChecklist.complianceWaiver.status === 'Approved'
```

This gate is enforced in the Financial module's Buyout status update API. If the gate is not satisfied, the API MUST reject the status transition with a specific error code indicating which condition is unmet. The Subcontract Compliance module is the source-of-truth for gate satisfaction; the Financial module reads that state to enforce the gate.

**UI behavior:** When a PM attempts to advance a Buyout Line Item to `ContractExecuted` and the gate is not satisfied, the interface MUST display a clear error identifying whether the checklist is missing, incomplete, or has a pending/rejected waiver — and provide a direct link to the Subcontract Compliance record.

### 6.3 Buyout Summary Metrics (rolled up for canvas tile)

These are aggregate calculations published to the Financial module canvas tile.

| Field Name (camelCase) | TypeScript Type | Calculated | Business Rule |
|------------------------|-----------------|-----------|---------------|
| totalBudget | `number` | Yes | Sum of `originalBudget` across all buyout lines; represents total budgeted subcontract spend |
| totalContractAmount | `number` | Yes | Sum of `contractAmount` across all buyout lines with `status != Void`; represents total commitment |
| totalOverUnder | `number` | Yes | Sum of `overUnder` across all lines; **Sign convention**: Positive = cumulative over budget (unfavorable); Negative = cumulative under budget (favorable) |
| linesNotStarted | `integer` | Yes | Count of lines with `status = NotStarted` |
| linesInProgress | `integer` | Yes | Count of lines with `status` in [LoiPending, LoiExecuted, ContractPending, ContractExecuted] |
| linesComplete | `integer` | Yes | Count of lines with `status = Complete` |
| linesVoid | `integer` | Yes | Count of lines with `status = Void` |
| percentBuyoutComplete | `number` | Yes | Calculation: `(linesComplete / (total lines - linesVoid)) × 100`; represents buyout execution progress |

### 6.4 Buyout Reconciliation to Budget

**Health Metric (from P3-H1 §18.5):**
The Financial module publishes a buyout reconciliation metric to the Health spine:
- `buyoutToCommittedCostsReconciliation`: Compares total `contractAmount` from executed buyouts (status = ContractExecuted or Complete) against `committedCosts` total from Budget Line Item model
- Acceptable tolerance: Within 5% (difference <= 5% × committedCosts)
- If variance exceeds tolerance: Health spine flags "Buyout discrepancy — contract amounts do not reconcile to budget. Review and investigate."

**Reconciliation Workflow:**
- After each buyout line is set to `ContractExecuted`, PM should verify that a corresponding budget line item has been updated with `committedCosts`
- Finance team monitors reconciliation metric as part of Financial health spine review

---

## 7. Status Enumerations (Complete)

### 7.1 Forecast Status

| Enum Value | Description | Locked | Can Edit Financial Fields |
|------------|-------------|--------|---------------------------|
| `Draft` | Working forecast; editable | No | Yes |
| `Confirmed` | Locked forecast used for reporting; immutable | Yes | No |
| `Stale` | Source data changed after confirmation; must be re-confirmed | Yes (read-only) | No (must unlock first) |

**Transitions:**
- Draft → Confirmed: when checklist 100% complete and PM clicks "Lock & Confirm"
- Confirmed → Stale: automatic, when budget import or GC/GR edit occurs after confirmation
- Stale → Draft: when PM clicks "Unlock & Revise" (rare; should only do this to reconcile changes)
- Draft → Confirmed → Draft: PM may "Unlock" a confirmed forecast to make changes, then re-confirm

### 7.2 Checklist Status

| Enum Value | Description |
|------------|-------------|
| `Incomplete` | One or more required items not completed |
| `PartiallyComplete` | Some required items completed; some remain |
| `Complete` | All required items (`required = true`) are checked and completed |

### 7.3 Buyout Line Status (see §6.2)

---

## 8. Business Rules and Calculations (Complete)

### 8.1 Budget Line Item Calculations

1. **revisedBudget** = `originalBudget + budgetModifications + approvedCOs`
   - Formula is cumulative; any change order or budget modification flows here
   - Used as baseline for variance comparison

2. **projectedBudget** = `revisedBudget + pendingBudgetChanges`
   - Includes submitted but not-yet-approved changes
   - Used for early warning if pending changes will cause overage

3. **projectedCosts** = `jobToDateCosts + pendingCostChanges`
   - Combines actual costs to date with estimated remaining
   - When pending costs are approved, they are rolled into `jobToDateCosts`

4. **estimatedCostAtCompletion** = `jobToDateCosts + forecastToComplete`
   - The PM's projection of total cost to finish
   - Includes actual costs incurred plus PM estimate of remaining work
   - Only PM-editable field is `forecastToComplete`; all others are import-driven or calculated

5. **projectedOverUnder** = `revisedBudget - estimatedCostAtCompletion`
   - **Sign convention**: Positive = under budget (favorable, green); Negative = over budget (unfavorable, red)
   - Used as primary financial health metric
   - If negative and magnitude > 10% of `revisedBudget`, budget line flagged for attention

### 8.2 Financial Forecast Summary Calculations

1. **revisedContractCompletion** = `originalContractCompletion + approvedDaysExtensions`
   - Days extension converted to calendar days (not working days)
   - Used as baseline for schedule variance

2. **estimatedCostAtCompletion** = Sum of `estimatedCostAtCompletion` from all budget lines + `gcEstimateAtCompletion`
   - Aggregate of all direct and indirect costs

3. **currentProfit** = `currentContractValue - estimatedCostAtCompletion`
   - If negative, project is forecasting a loss
   - Highlighted in red on dashboard if negative

4. **profitMargin** = `(currentProfit / currentContractValue) × 100`
   - Expressed as percentage with 2 decimal places
   - e.g., "8.35%" or "-2.10%" (if loss)
   - Baseline target margin typically 10-12%; alert if < 5%

### 8.3 GC/GR Calculations

1. **gcVariance** = `gcEstimateAtCompletion - originalGCBudget`
   - Positive = cost overrun; Negative = cost savings

2. **grVariance** = `grEstimateAtCompletion - originalGRBudget`
   - Positive = cost overrun; Negative = cost savings

3. **totalVariance** = `gcVariance + grVariance`
   - Sum of both GC and GR variances; indicates total GC/GR trend

### 8.4 Cash Flow Calculations

1. **totalInflows** = `inflowOwnerPayments + inflowOtherInflows`
   - All money coming into project

2. **totalOutflows** = `outflowSubcontractorPayments + outflowMaterialCosts + outflowLaborCosts + outflowOverhead + outflowEquipment`
   - All cash going out

3. **netCashFlow** = `totalInflows - totalOutflows`
   - Positive = cash surplus for month; Negative = cash deficit (must draw from reserves)

4. **cumulativeCashFlow** = Running sum of monthly `netCashFlow` from project start
   - Shows cumulative cash position over time
   - Most negative value = peak cash requirement (minimum cash needed on hand)

5. **forecastAccuracy** = `(|actualNetCashFlow - priorForecastNetCashFlow| / |priorForecastNetCashFlow|) × 100`
   - Calculated only for Actual records with a corresponding prior forecast
   - Measures how accurate the forecast was
   - < 10% = excellent; 10-25% = good; > 25% = poor forecast quality
   - Used to adjust confidence in current forecasts

6. **peakCashRequirement** = Minimum (most negative) value in `cumulativeCashFlow` series
   - Indicates largest cash shortfall during project
   - Used for working capital planning

7. **cashFlowAtRisk** = Sum of all months where `projectedNetCashFlow < 0`
   - Indicates cumulative risk of cash deficits
   - Used to alert PM if project needs additional working capital facility

### 8.5 Buyout Calculations

1. **overUnder** = `contractAmount - originalBudget`
   - **Sign convention**: Positive = over budget (unfavorable, red); Negative = under budget (favorable, green)
   - Distinct from budget line's `projectedOverUnder` which uses opposite sign convention
   - This difference is intentional: buyout overage is bad (cost), budget under is good (savings)

2. **percentBuyoutComplete** = `(count of ContractExecuted + Complete lines) / (total lines - voidLines) × 100`
   - Progress metric for buyout phase
   - Used on canvas tile to show execution status

### 8.6 Editing and Provenance Rules

**Edit Provenance Required:**
- Every edit to a PM-editable field (`forecastToComplete` in budget lines, estimates in GC/GR, projections in cash flow) creates an audit record
- Audit record includes:
  - `lastEditedBy` (userId)
  - `lastEditedAt` (datetime, UTC)
  - `priorValue` (saved for comparison)
- PM can view edit history of any field; history is retained indefinitely

**Validation on Edit:**
- `forecastToComplete` cannot be negative
- `forecastToComplete` cannot be less than actual costs incurred (`jobToDateCosts`)
- GC/GR estimates cannot be negative
- Cash flow projections cannot be negative (by definition, no negative inflows/outflows; those are reversals)
- All currency fields rounded to 2 decimal places (cents); no sub-cent calculations

### 8.7 Staleness Detection and Locking

**Automatic Staleness:**
- If a new budget import occurs while forecast `status = Confirmed`, the forecast is immediately marked `Stale`
- If GC/GR estimates change while forecast is Confirmed, forecast is marked `Stale`
- PM is notified and must review changes before forecast can be re-confirmed

**Locking Rule:**
- Confirmed forecasts are immutable; all fields read-only
- To edit any field, PM must click "Unlock & Revise"
- This sets `status = Draft` and clears `lastConfirmedAt` and `lastConfirmedBy`
- PM must then re-confirm with updated checklist

### 8.8 A/R Aging Read-Only Rule

- A/R Aging is sourced from accounting system; Project Hub is a read-only display
- No field in A/R Aging record is PM-editable
- System syncs daily with accounting system to keep data current
- If PM notices discrepancies, they must contact accounting team to correct source system

### 8.9 Forecast Checklist Completion Rule

- Forecast cannot transition from Draft to Confirmed unless ALL required checklist items (`required = true`) have `completed = true`
- System enforces this at the UI level: "Lock & Confirm" button is disabled until all required items are checked
- Error message on attempted lock without complete checklist: "[N] required items not completed. Complete all before locking."

### 8.10 GC/GR Totals Feed to Forecast Summary

- System automatically sums all GC/GR lines (across all divisions and categories)
- Total feeds into Forecast Summary field `gcEstimateAtCompletion` (§2.5)
- Any edit to any GC/GR line immediately updates the Forecast Summary total
- If forecast is Confirmed when GC/GR changes, forecast becomes Stale

---

## 9. Required Capabilities

These capabilities **MUST** be implemented for the Financial module to be complete and ready for production use.

### 9.1 CSV Budget Import

**Capability:** Import Procore budget CSV export and populate Budget Line Item model

**Specification:**
- File upload via UI: "Upload Budget CSV"
- Parser reads Procore_Budget.csv format (21 columns, exact headers required)
- Validates each row:
  - Required fields: `budgetCode`, `budgetCodeDescription`, `costType`, `originalBudget`
  - `costCodeTier1` validated against cost-code-dictionary.csv (7,566 valid codes)
  - `originalBudget` must be positive number
  - Duplicate `budgetCode` values rejected with specific error
- Field mapping: Procore CSV column → internal camelCase field name (see §1.1 table)
- On success: all rows written atomically with same `importBatchId`
- All calculations performed immediately
- Default `forecastToComplete = revisedBudget - jobToDateCosts`
- Feedback: display summary: "[N] lines imported, [N] errors (if any)"
- If errors exist, import fails; no lines written

### 9.2 Financial Forecast Summary Editing

**Capability:** PM edits forecast summary fields (non-calculated fields only)

**Specification:**
- PM can edit: `contractType`, `projectType`, `damageClauseLDs`, `approvedDaysExtensions`, `currentContractValue`, `currentContingency`, `expectedContingencyAtCompletion`
- All other fields are read-only (locked)
- Edits require provenance: `lastEditedBy`, `lastEditedAt`, prior value saved
- Changes trigger recalculation of dependent fields: `revisedContractCompletion`, `currentProfit`, `profitMargin`
- If forecast is Confirmed, edits are blocked; PM must "Unlock & Revise" first
- Edit UI shows current value, prior value (in gray), and change indicator

### 9.3 GC/GR Working Model Editing

**Capability:** PM manages GC/GR per division with per-category estimates

**Specification:**
- Grid view: rows = divisions; columns = GC/GR categories
- PM enters: `gcEstimateAtCompletion`, `grEstimateAtCompletion`, optional `notes`
- System calculates: `gcVariance`, `grVariance`, `totalVariance`
- Edits require provenance and trigger Forecast Summary update
- Display shows original budgets (immutable reference) alongside PM forecasts
- Variance color-coded: red (over), green (under)
- Validation: estimates cannot be negative
- Summary tile at bottom: total original budget, total EAC, total variance

### 9.4 Cash Flow Model Editing

**Capability:** PM manages monthly projections for inflows and outflows

**Specification:**
- Table view: rows = months (13 actuals + 18 forecast)
- Actual months locked (read-only); forecast months editable
- Editable fields: `projectedInflows`, `projectedOutflows`, `confidenceScore`, `notes`
- System calculates: `projectedNetCashFlow`, `projectedCumulativeCashFlow`, `peakCashRequirement`, `cashFlowAtRisk`
- Graph view: X=month, Y=cumulativeCashFlow (line chart); red shading for deficit months
- Validation: inflows/outflows cannot be negative
- PM can adjust individual months or use "fill" tool to copy forward or apply inflation
- Each edit requires provenance

### 9.5 Buyout Log Management

**Capability:** PM creates, edits, and tracks buyout lines to completion

**Specification:**
- Table view: all buyout lines with columns: Division, Description, Vendor, Contract Amount, Original Budget, Over/Under, Status, Actions
- PM can:
  - Add new line: fills in division, description, vendor name, budget amount from budget line
  - Edit line: update contractAmount, status, dates (LOI, contract), notes
  - Delete line: rare, marks as `Void` (soft delete; not actually removed)
- Status workflow: NotStarted → LoiPending → LoiExecuted → ContractPending → ContractExecuted → Complete
- Validation: `contractAmount` must be >= 0; dates must be chronological (LOI sent before LOI returned, LOI returned before contract)
- Over/Under automatically calculated and color-coded
- Summary metrics at bottom: total budget, total contract, total over/under, % complete
- Bulk update: PM can update status of multiple lines at once (e.g., mark 5 lines as "LoiExecuted")

### 9.6 Forecast Checklist Completion

**Capability:** PM completes checklist items with acknowledgment; system prevents forecast lock until complete

**Specification:**
- Checklist UI: list of 18 items (see §3.1)
- Organized by group: Required Documents, Profit Forecast, Schedule, Additional
- PM checks off each item: `completed = true` + optional notes
- Item marked with: timestamp, userId, notes
- Group summaries: e.g., "6 of 6 Required Documents complete"
- "Lock & Confirm Forecast" button:
  - Enabled only when all `required = true` items are checked
  - On click, validates all conditions (§3.3) and locks forecast
  - Sets `status = Confirmed`, `lastConfirmedAt`, `lastConfirmedBy`
- If conditions not met, shows clear error: "[Issue]: [Required action]"

### 9.7 Export Capabilities

**Capability:** Export all financial data as CSV or PDF reports

**Specification:**
- Budget Line Items: export all lines as CSV (columns: budgetCode, description, originalBudget, revisedBudget, jobToDateCosts, estimatedCostAtCompletion, projectedOverUnder, forecastToComplete, notes)
- Forecast Summary: export as single-page summary PDF with key metrics, charts, and checklist status
- GC/GR: export as CSV by division/category
- Cash Flow: export monthly table (13 actuals + 18 forecast) as CSV
- Buyout Log: export as CSV with all columns and status
- PDF summary report: multi-page PDF with cover page (project name, PM, date), financial summary section, cash flow chart, key metrics, and checklist attestation

### 9.8 Staleness Detection and UI

**Capability:** System detects when source data changes after confirmation and prevents stale forecasts from being used for reporting

**Specification:**
- When budget import occurs after Confirmed forecast: system marks forecast `Stale` immediately
- When GC/GR estimates change after Confirmed forecast: system marks forecast `Stale` immediately
- Dashboard shows:
  - Confirmed forecasts: green checkmark, "Confirmed on [date]"
  - Stale forecasts: red warning icon, "Stale — Data changed on [date]. Review and re-confirm."
  - Draft forecasts: blue icon, "Working draft — Not yet confirmed"
- UI prevents use of Stale forecast for reporting; forces PM to review and re-confirm
- Archive of all historical forecasts retained (not deleted) for audit trail

### 9.9 Spine Publication

**Capability:** All financial changes trigger spine events per P3-A3

**Specification:**
- Activity spine: log events for budget import, forecast confirmation, GC/GR update, buyout line status change, cash flow projection update
- Health spine: publish current `projectedOverUnder` (cost dimension), `profitMargin`, `percentBuyoutComplete`, `peakCashRequirement`, `cashFlowAtRisk`
- Work Queue: flag incomplete forecast checklists, buyout lines overbudget, negative profit forecasts, cash flow risks
- Related Items: create relationships from budget lines to their corresponding buyout lines and change orders

---

## 10. Spine Publication Events

The Financial module publishes structured events to the project's spines per P3-A3.

### 10.1 Activity Spine Events

| Event | Trigger | Payload | Purpose |
|-------|---------|---------|---------|
| `BudgetImported` | CSV import succeeds | `{ importBatchId, lineCount, projectId, importedAt }` | Log and audit all budget changes |
| `ForecastConfirmed` | PM locks forecast | `{ forecastId, projectId, confirmedAt, confirmedBy, status }` | Mark snapshot used for reporting |
| `ForecastUnlocked` | PM unlocks Confirmed forecast | `{ forecastId, projectId, unlockedAt, unlockedBy }` | Track revisions to locked forecast |
| `GCGRUpdated` | PM edits GC/GR estimate | `{ projectId, divisionCode, categoryCode, priorValue, newValue, editedBy, editedAt }` | Audit GC/GR changes |
| `BuyoutLineExecuted` | Buyout line status → ContractExecuted | `{ buyoutLineId, projectId, vendorName, contractAmount, executedAt }` | Alert team subcontract finalized |
| `CashFlowProjectionUpdated` | PM edits cash flow month | `{ projectId, month, inflows, outflows, netFlow, updatedAt }` | Track projection updates |

### 10.2 Health Spine Metrics

| Metric | Type | Updated | Purpose |
|--------|------|---------|---------|
| `projectedOverUnder` | number (USD) | On any budget edit | Primary cost health indicator; sign convention: positive = favorable (under) |
| `profitMargin` | percentage | On forecast confirmation | Trend indicator; alert if < 5% |
| `estimatedCostAtCompletion` | number (USD) | On budget or forecast change | Total project cost forecast |
| `percentBuyoutComplete` | percentage | On buyout line status change | Execution progress |
| `peakCashRequirement` | number (USD) | On cash flow projection change | Working capital need |
| `cashFlowAtRisk` | number (USD) | On cash flow projection change | Cumulative deficit risk |
| `buyoutToCommittedCostsReconciliation` | variance % | On buyout execution or budget import | Health metric: acceptable if < 5% variance |

### 10.3 Work Queue Items

| Item Type | Condition | Actionable |
|-----------|-----------|-----------|
| `ForecastChecklistIncomplete` | Forecast in Draft; checklist < 100% complete | PM completes and confirms |
| `BudgetLineOverbudget` | `projectedOverUnder` < -10% of `revisedBudget` | PM raises forecast or change order |
| `NegativeProfitForecast` | `currentProfit` < 0 | PE review and mitigation plan |
| `CashFlowDeficit` | Any month with `projectedNetCashFlow < 0` | PM secures working capital or adjusts schedule |
| `BuyoutOverbudget` | Buyout line `overUnder` > 0 | PM negotiates or raises change order |
| `ForecastStale` | Forecast status = Stale | PM reviews changes and re-confirms |

---

## 11. Executive Review Annotation Scope

Per P3-E1 §9 and P3-E2 §3.4, the Financial module is review-capable. Executive stakeholders (PE, CFO, Project Owner) can annotate key fields with concerns, questions, or approvals. Annotations are governed and read-only; they never trigger writes to the Financial module records themselves.

### 11.1 Annotation Targets

PER (Project Executive Review) annotations may be placed on:
- Budget line item `forecastToComplete` values (individual line estimates)
- Forecast Summary `currentContractValue`, `currentProfit`, `profitMargin` fields
- GC/GR `gcEstimateAtCompletion`, `grEstimateAtCompletion` values
- Cash flow projection `projectedInflows`, `projectedOutflows`, `projectedNetCashFlow` values
- Buyout line `contractAmount`, `status` fields
- Overall forecast status and confirmation attestation

### 11.2 Annotation Restrictions

**From P3-E2 §11.2:**
- All annotations stored exclusively in `@hbc/field-annotations` layer; no annotation data is written to Financial module records
- No annotation may trigger a write, edit, or validation override of any Financial module record
- PM draft state and unsaved edits are NEVER visible to PER
- PER reviews only confirmed and published snapshots (after `status = Confirmed`)
- Annotation display: non-intrusive, sidebar or tooltip; does not obscure underlying data
- PER may flag concerns but has no approve/reject authority; PM owns all financial edits and confirmations

### 11.3 Annotation Workflow

1. PE/CFO/Owner views Confirmed forecast snapshot
2. PER opens annotation panel and selects a field to annotate
3. PER types comment (e.g., "Query: How confident is the $250K labor estimate for Foundation?")
4. Annotation saved to `@hbc/field-annotations` with `annotatedBy`, `annotatedAt`, `targetField`, `comment`
5. PM notified of new annotation (via Work Queue or notification)
6. PM responds (if desired) via annotation reply interface
7. Annotations are persisted and visible only to authorized stakeholders; not printed on reports used outside PM team

---

## 12. Acceptance Gate Reference

The Financial Module delivery is subject to Acceptance Gate §18.5 "Financial Items" from P3-H1 (Acceptance Gates and Delivery Criteria).

**Gate §18.5 Financial Module Criteria:**
- [ ] All 21 budget line fields (§1.1) fully implemented and tested
- [ ] Budget CSV import (§9.1) parses Procore format with validation
- [ ] Forecast Summary (§2) editable with calculated fields correct
- [ ] GC/GR model (§4) fully editable and aggregated to Forecast Summary
- [ ] Cash Flow model (§5) with 13 months actuals + 18 months forecast
- [ ] Buyout log (§6) tracking subcontract status and overages
- [ ] Forecast checklist (§3) enforces completion before lock
- [ ] Export (§9.7) works for CSV and PDF
- [ ] Staleness detection (§9.8) implemented and tested
- [ ] Spine events (§10) published correctly
- [ ] A/R Aging (§5.4) read-only display integrated
- [ ] All business rules (§8) enforced in code
- [ ] User acceptance testing passed with 2+ sample projects
- [ ] Performance: budget import < 10 seconds for 500 lines; UI response < 500ms for forecast edits
- [ ] Integration with Schedule module (milestones) verified
- [ ] Integration with Health spine (metrics publication) verified

**Delivery checklist:**
- [ ] Code complete and committed to main branch
- [ ] Unit tests: > 85% code coverage on calculation logic
- [ ] Integration tests: import, edit, export workflows functional
- [ ] User documentation in package `README.md`
- [ ] API documentation complete (if applicable)
- [ ] Spine event contracts verified against P3-A3 spec

---

## 13. Field Summary Index

**Quick reference: alphabetical list of all fields defined in this specification.**

| Field Name | Section | Type | Editable |
|------------|---------|------|----------|
| approvedCOs | 1.1 | number | No |
| approvedDaysExtensions | 2.2 | integer | Yes |
| ar-aging records | 5.4 | record[] | No (read-only) |
| baselineFinishDate | 1.1 | date | No |
| baselineStartDate | 1.1 | date | No |
| budgetCode | 1.1 | string | No |
| budgetCodeDescription | 1.1 | string | No |
| budgetLineId | 1.1 | string | No |
| budgetModifications | 1.1 | number | No |
| buyoutLineId | 6.1 | string | No |
| cumulativeCashFlow | 5.1 | number | No |
| currentContractValue | 2.3 | number | Yes |
| currentContingency | 2.4 | number | Yes |
| currentProfit | 2.3 | number | No (calculated) |
| currentGCBudget | 4.1 | number | No |
| damageClauseLDs | 2.1 | string | Yes |
| directCosts | 1.1 | number | No |
| divisionDescription | 4.1 | string | No |
| divisionNumber | 4.1 | string | No |
| estimatedCostAtCompletion (budget line) | 1.1 | number | No (calculated) |
| estimatedCostAtCompletion (forecast) | 2.3 | number | No (calculated) |
| expectedContingencyAtCompletion | 2.4 | number | Yes |
| expectedContingencyUse | 2.4 | number | No (calculated) |
| forecastToComplete | 1.1 | number | **Yes** |
| forecastAccuracy | 5.1 | number | No (calculated) |
| forecastId | 2.1 | string | No |
| gcEstimateAtCompletion | 4.1 | number | **Yes** |
| gcGrId | 4.1 | string | No |
| gcVariance | 4.1 | number | No (calculated) |
| grEstimateAtCompletion | 4.1 | number | **Yes** |
| grVariance | 4.1 | number | No (calculated) |
| inflowOtherInflows | 5.1 | number | No |
| inflowOwnerPayments | 5.1 | number | No |
| jobToDateCosts | 1.1 | number | No |
| lastConfirmedAt | 2.6 | datetime | No |
| lastConfirmedBy | 2.6 | string | No |
| lastEditedAt | 1.1 | datetime | No |
| lastEditedBy | 1.1 | string | No |
| monthlyRecordId | 5.1 | string | No |
| netCashFlow | 5.1 | number | No (calculated) |
| notes (buyout) | 6.1 | string | Yes |
| notes (GC/GR) | 4.1 | string | Yes |
| notes (cash flow) | 5.1 | string | Yes |
| originalBudget (buyout) | 6.1 | number | No |
| originalBudget (budget line) | 1.1 | number | No |
| originalContingency | 2.4 | number | No |
| originalContractCompletion | 2.2 | date | No |
| originalContractValue | 2.3 | number | No |
| originalEstimatedCost | 2.3 | number | No |
| originalGCBudget | 4.1 | number | No |
| originalGCEstimate | 2.5 | number | No |
| originalGRBudget | 4.1 | number | No |
| originalProfit | 2.3 | number | No |
| originalBuyoutSavings | 2.3 | number | No |
| outflowEquipment | 5.1 | number | No |
| outflowLaborCosts | 5.1 | number | No |
| outflowMaterialCosts | 5.1 | number | No |
| outflowOverhead | 5.1 | number | No |
| outflowSubcontractorPayments | 5.1 | number | No |
| overUnder (buyout) | 6.1 | number | No (calculated) |
| percentBuyoutComplete | 6.3 | number | No (calculated) |
| percentComplete | 5.4 | number | No (read-only) |
| pendingBudgetChanges | 1.1 | number | No |
| pendingCostChanges | 1.1 | number | No |
| priorForecastToComplete | 1.1 | number | No |
| profitMargin | 2.3 | number | No (calculated) |
| projectId | 1.1 | string | No |
| projectName | 2.1 | string | No |
| projectNumber | 2.1 | string | No |
| projectedBudget | 1.1 | number | No (calculated) |
| projectedCosts | 1.1 | number | No (calculated) |
| projectedInflows | 5.2 | number | **Yes** |
| projectedNetCashFlow | 5.2 | number | No (calculated) |
| projectedOutflows | 5.2 | number | **Yes** |
| projectedOverUnder | 1.1 | number | No (calculated) |
| retainage | 5.4 | number | No (read-only) |
| retentionHeld | 5.1 | number | No |
| revisedBudget | 1.1 | number | No (calculated) |
| revisedContractCompletion | 2.2 | date | No (calculated) |
| status (buyout) | 6.1 | enum | Yes |
| status (forecast) | 2.6 | enum | No |
| subJob | 1.1 | string | No |
| subcontractorVendorName | 6.1 | string | Yes |
| totalBudget (buyout summary) | 6.3 | number | No (calculated) |
| totalContractAmount | 6.3 | number | No (calculated) |
| totalInflows | 5.1 | number | No (calculated) |
| totalOutflows | 5.1 | number | No (calculated) |
| totalVariance (GC/GR) | 4.1 | number | No (calculated) |

---

## 14. Data Import and Migration Strategy

For initial project setup and historical data backfill, the Financial module will support:

1. **Procore CSV bulk import** (§9.1): One-time or recurring import of Procore budget export
2. **Forecast Summary manual entry**: PM enters all Forecast Summary fields via UI (no bulk import for this)
3. **GC/GR manual entry**: PM enters GC/GR lines via UI (optional spreadsheet upload if needed later)
4. **Cash flow manual entry or import**: PM may enter 18-month forecast manually or via spreadsheet upload
5. **Buyout log manual entry**: PM populates buyout log incrementally as subcontracts are solicited
6. **A/R Aging sync**: Automated daily sync from accounting system (no manual entry)

No single bulk import of the entire Financial model; data is populated progressively as project runs.

---

**Document Version:** 1.0
**Last Updated:** 2026-03-22
**Next Review:** Upon module implementation start
**Authority:** Project Hub Leadership, Finance Workstream (P3-E), P3-H1 Acceptance Gates
