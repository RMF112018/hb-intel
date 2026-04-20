# P3-E4 — Financial Module: Cash Flow Working Model

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4-T05 |
| **Parent** | [P3-E4 Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T05: Cash Flow Working Model |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: monthly actual cash flow record, forecast cash flow record, cash flow summary aggregate, retention calculation model, and the A/R aging display model. See [T03](P3-E4-T03-Forecast-Versioning-and-Checklist.md) for version-scoping rules and [T07](P3-E4-T07-Business-Rules-and-Calculations.md) for all calculated field formulas.*

---

## 7. Cash Flow Working Model

The Cash Flow model projects monthly inflows and outflows for the project duration. It includes 13 months of actuals (historical) and 18 months of forward projection.

### 7.1 Monthly actual cash flow record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (cash-flow.json) | Business Rule |
|------------------------|-----------------|----------|------------|-------------------------|---------------|
| `monthlyRecordId` | `string` | Yes | Yes | — | UUID |
| `forecastVersionId` | `string` | Yes | No | — | FK to `IForecastVersion` |
| `projectId` | `string` | Yes | No | project_id | FK to project |
| `periodMonth` | `integer` | Yes | No | month | Month index: 1 = Jan, ..., 12 = Dec; 13+ for multi-year |
| `calendarDate` | `string` | Yes | No | — | ISO 8601 date; first day of month; drives sorting |
| `recordType` | `'Actual' \| 'Forecast'` | Yes | No | — | `Actual` for historical; `Forecast` for projected |
| `inflowOwnerPayments` | `number` | Yes | No | inflows.owner_payments | Owner progress billing received; USD |
| `inflowOtherInflows` | `number` | Yes | No | inflows.other_inflows | Other revenue (CO billings, retainage releases); USD |
| `totalInflows` | `number` | Yes | Yes | — | **Calculated**: `inflowOwnerPayments + inflowOtherInflows` |
| `outflowSubcontractorPayments` | `number` | Yes | No | outflows.subcontractor_payments | Subcontractor and vendor invoices paid; USD |
| `outflowMaterialCosts` | `number` | Yes | No | outflows.material_costs | Material costs paid; USD |
| `outflowLaborCosts` | `number` | Yes | No | outflows.labor_costs | Direct labor paid; USD |
| `outflowOverhead` | `number` | Yes | No | outflows.overhead | Office, insurance, general overhead; USD |
| `outflowEquipment` | `number` | Yes | No | outflows.equipment | Equipment costs; USD |
| `totalOutflows` | `number` | Yes | Yes | — | **Calculated**: Sum of all outflow fields |
| `netCashFlow` | `number` | Yes | Yes | — | **Calculated**: `totalInflows - totalOutflows`. Positive = surplus; negative = deficit — see T07 §7.5 |
| `cumulativeCashFlow` | `number` | Yes | Yes | — | **Calculated**: Running sum of `netCashFlow` from project start |
| `workingCapital` | `number \| null` | No | No | working_capital | Current assets minus current liabilities; informational |
| `retentionHeld` | `number` | Yes | No | retention_held | Cumulative retainage held by owner at end of month |
| `forecastAccuracy` | `number \| null` | No | Yes | forecast_accuracy | For Actual records only: `(|actualNet - priorForecastNet| / |priorForecastNet|) × 100`; null if no prior forecast exists |
| `recordedAt` | `string` | Yes | Yes | — | ISO 8601 timestamp when actual was recorded; immutable |
| `notes` | `string \| null` | No | No | — | Optional PM notes |

### 7.2 Monthly forecast cash flow record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule |
|------------------------|-----------------|----------|------------|---------------|
| `monthlyRecordId` | `string` | Yes | Yes | UUID |
| `forecastVersionId` | `string` | Yes | No | FK to `IForecastVersion` |
| `projectId` | `string` | Yes | No | FK to project |
| `periodMonth` | `integer` | Yes | No | Month index; continues from actuals |
| `calendarDate` | `string` | Yes | No | ISO 8601 date; first day of month |
| `recordType` | `'Forecast'` | Yes | No | Always `Forecast` |
| `projectedInflows` | `number` | Yes | No | **PM-EDITABLE** (working version only); forecasted owner draws/billings; USD |
| `projectedOutflows` | `number` | Yes | No | **PM-EDITABLE** (working version only); forecasted sub, material, labor, overhead; USD |
| `projectedNetCashFlow` | `number` | Yes | Yes | **Calculated**: `projectedInflows - projectedOutflows` |
| `projectedCumulativeCashFlow` | `number` | Yes | Yes | **Calculated**: Cumulative sum from last actual month |
| `confidenceScore` | `integer` | Yes | No | PM-estimated accuracy; 0–100; 100 = high confidence |
| `notes` | `string \| null` | No | No | PM forecast assumptions |
| `lastEditedBy` | `string \| null` | No | No | userId of PM who last edited |
| `lastEditedAt` | `string \| null` | No | No | ISO 8601 timestamp of last edit |

### 7.3 Cash flow summary aggregate

| Field Name (camelCase) | TypeScript Type | Calculated | Business Rule |
|------------------------|-----------------|-----------|---------------|
| `summaryId` | `string` | Yes | UUID |
| `forecastVersionId` | `string` | No | FK to version |
| `projectId` | `string` | No | FK to project |
| `totalActualInflows` | `number` | Yes | Sum of `totalInflows` across all actual months |
| `totalActualOutflows` | `number` | Yes | Sum of `totalOutflows` across all actual months |
| `totalActualNetCashFlow` | `number` | Yes | Sum of `netCashFlow` across all actual months |
| `totalForecastedInflows` | `number` | Yes | Sum of `projectedInflows` across all forecast months |
| `totalForecastedOutflows` | `number` | Yes | Sum of `projectedOutflows` across all forecast months |
| `totalForecastedNetCashFlow` | `number` | Yes | Sum of `projectedNetCashFlow` across all forecast months |
| `combinedNetCashFlow` | `number` | Yes | `totalActualNetCashFlow + totalForecastedNetCashFlow` |
| `peakCashRequirement` | `number` | Yes | Minimum (most negative) value in entire cumulative cash flow series |
| `cashFlowAtRisk` | `number` | Yes | Sum of all months where `projectedNetCashFlow < 0` |
| `computedAt` | `string` | Yes | ISO 8601 timestamp of last computation |
| `lastUpdated` | `string` | Yes | ISO 8601 timestamp of last data change |

### 7.4 Retention calculation model

**Standard retention model (configurable per project):**
- Retainage rate: default 10% (configurable per contract; stored in project settings)
- Calculation: `monthlyRetentionHeld = sum(invoices to date × retainageRate) - sum(retainage releases to date)`
- Contract may define custom release schedule (e.g., 50% at Substantial Completion, 50% after punch list)

### 7.5 A/R aging display model (read-only)

A/R Aging data is **read-only** and sourced from the accounting/ERP system. Project Hub Financial does not create or modify A/R records.

| Field Name (camelCase) | TypeScript Type | Source | Description |
|------------------------|-----------------|--------|-------------|
| `arAgeId` | `string` | — | UUID; record identifier |
| `projectId` | `string` | — | FK to project |
| `projectName` | `string` | Accounting ERP | Display name |
| `projectManager` | `string` | Accounting ERP | PM name or ID |
| `percentComplete` | `number` | Schedule module | Project completion % from Schedule spine |
| `balanceToFinish` | `number` | Accounting ERP | Remaining work value; USD |
| `retainage` | `number` | Cash Flow model | Total retainage held; USD |
| `totalAR` | `number` | Accounting ERP | Total outstanding AR; USD |
| `current0To30` | `number` | Accounting ERP | 0–30 days aging bucket; USD |
| `current30To60` | `number` | Accounting ERP | 30–60 days; USD |
| `current60To90` | `number` | Accounting ERP | 60–90 days; USD |
| `current90Plus` | `number` | Accounting ERP | >90 days (past due); USD |
| `comments` | `string \| null` | Accounting ERP | Collection notes |
| `refreshedAt` | `string` | — | ISO 8601 timestamp of last sync |

**Integration:** Daily sync job. If sync fails, dashboard shows last successful sync time and warning. No PM editing of any field.

### 7.6 Version behavior for cash flow records

- Cash flow records are version-scoped by `forecastVersionId`.
- When a new working version is derived, all cash flow records (actuals and forecast) are copied into the new version as the starting state.
- Actual records remain read-only on all versions; they reflect sourced accounting data.
- Forecast records are editable only on the current working version.

---

*Navigation: [← T04 Forecast Summary and GC/GR](P3-E4-T04-Forecast-Summary-and-GC-GR.md) | [Master Index](P3-E4-Financial-Module-Field-Specification.md) | [T06 Buyout Sub-Domain →](P3-E4-T06-Buyout-Sub-Domain.md)*
