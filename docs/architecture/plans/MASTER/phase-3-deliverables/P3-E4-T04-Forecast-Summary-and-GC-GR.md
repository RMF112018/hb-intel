# P3-E4 — Financial Module: Forecast Summary and GC/GR Working Model

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4-T04 |
| **Parent** | [P3-E4 Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T04: Forecast Summary and GC/GR Working Model |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: financial forecast summary fields (project metadata, schedule fields, financial summary, contingency, and GC fields) and the GC/GR working model line record and category enumeration. See [T03](P3-E4-T03-Forecast-Versioning-and-Checklist.md) for versioning rules and [T07](P3-E4-T07-Business-Rules-and-Calculations.md) for all calculated field formulas.*

---

## 5. Financial Forecast Summary Model

The Financial Forecast Summary holds the high-level financial projection for the entire project. These fields live on the **working version** of the forecast and are frozen when the version is confirmed.

### 5.1 Project metadata fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (Excel Sheet 1) | Business Rule |
|------------------------|-----------------|----------|------------|------------------------|---------------|
| `forecastVersionId` | `string` | Yes | Yes | — | FK to `IForecastVersion.forecastVersionId`; ties this summary to a specific version |
| `projectId` | `string` | Yes | No | — | FK to project |
| `projectName` | `string` | Yes | No | PROJECT NAME | Display name; must match project record |
| `projectNumber` | `string` | Yes | No | PROJECT NO. | Unique project identifier; matches project record |
| `contractType` | `ContractType` | Yes | No | Contract Type | Enum: `GMP` \| `LumpSum` \| `CostPlus` \| `UnitPrice` \| `TimeAndMaterials` |
| `projectType` | `ProjectType` | Yes | No | Project Type | Enum: `Commercial` \| `Residential` \| `Healthcare` \| `Education` \| `Industrial` \| `Infrastructure` \| `Other` |
| `damageClauseLDs` | `string \| null` | No | No | Damage Clause/LD's | Text description of liquidated damages clause; informational only; **PM-EDITABLE** on working version |

### 5.2 Schedule fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| `originalContractCompletion` | `string` | Yes | No | Original Contract Completion | ISO 8601 date; contract baseline completion; immutable reference |
| `approvedDaysExtensions` | `integer` | Yes | No | Approved Days | Calendar days granted via approved change orders; >= 0; **PM-EDITABLE** on working version |
| `revisedContractCompletion` | `string` | Yes | Yes | — | **Calculated**: `originalContractCompletion + approvedDaysExtensions calendar days` |

### 5.3 Financial summary fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| `originalContractValue` | `number` | Yes | No | Original Contract Value | Initial contract amount in USD; immutable reference |
| `originalEstimatedCost` | `number` | Yes | No | Original Cost | Original estimated total cost in USD; immutable reference |
| `originalProfit` | `number` | Yes | No | Original Profit | Computed at contract time: `originalContractValue - originalEstimatedCost` |
| `originalBuyoutSavings` | `number` | Yes | No | Original Buyout Savings | Original estimated savings from competitive buyout; USD |
| `currentContractValue` | `number` | Yes | No | — | **PM-EDITABLE** (working version only); current contract value after approved change orders; starts equal to `originalContractValue` |
| `estimatedCostAtCompletion` | `number` | Yes | Yes | — | **Calculated**: Sum of `estimatedCostAtCompletion` across all budget lines plus `gcEstimateAtCompletion` total |
| `currentProfit` | `number` | Yes | Yes | — | **Calculated**: `currentContractValue - estimatedCostAtCompletion` |
| `profitMargin` | `number` | Yes | Yes | — | **Calculated**: `(currentProfit / currentContractValue) × 100`; format as percentage to 2 decimal places; negative indicates forecasted loss |

### 5.4 Contingency fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| `originalContingency` | `number` | Yes | No | Original Contingency | Original contingency reserve in USD; immutable reference |
| `currentContingency` | `number` | Yes | No | Current Contingency | **PM-EDITABLE** (working version only); contingency remaining after allocations |
| `expectedContingencyAtCompletion` | `number` | Yes | No | Expected at Completion | PM forecast of contingency remaining at project end; USD; **PM-EDITABLE** on working version |
| `expectedContingencyUse` | `number` | Yes | Yes | — | **Calculated**: `originalContingency - expectedContingencyAtCompletion` |

### 5.5 General conditions field

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| `originalGCEstimate` | `number` | Yes | No | Original Estimate (GC) | Original General Conditions budget; USD |
| `gcEstimateAtCompletion` | `number` | Yes | Yes | — | **Calculated**: Sum of all `gcEstimateAtCompletion` values from GC/GR working model (§6.1) |

### 5.6 PM-editable fields on working version (summary)

The following forecast summary fields are editable only in a working version. All other summary fields are either immutable references, system-set, or calculated:
- `damageClauseLDs`
- `approvedDaysExtensions`
- `currentContractValue`
- `currentContingency`
- `expectedContingencyAtCompletion`
- `contractType` (may be corrected)
- `projectType` (may be corrected)

---

## 6. GC/GR Working Model

General Conditions (GC) and General Requirements (GR) are overhead and jobsite costs managed separately from direct construction costs.

### 6.1 GC/GR line record structure

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (Excel sheet) | Business Rule |
|------------------------|-----------------|----------|------------|----------------------|---------------|
| `gcGrId` | `string` | Yes | Yes | — | UUID; stable identifier for this GC/GR line |
| `forecastVersionId` | `string` | Yes | No | — | FK to `IForecastVersion`; GC/GR lines are version-scoped |
| `projectId` | `string` | Yes | No | — | FK to project |
| `divisionNumber` | `string` | Yes | No | Division # | CSI division number; standard CSI XX format |
| `divisionDescription` | `string` | Yes | No | Division description | Display name (e.g., "General Requirements") |
| `gcGrCategory` | `GCGRCategory` | Yes | No | GC category types | Enum: see §6.2 |
| `originalGCBudget` | `number` | Yes | No | Original GC Budget | Original estimate; USD; immutable reference |
| `gcEstimateAtCompletion` | `number` | Yes | No | GC EAC | **PM-EDITABLE** (working version only); PM forecast of total GC cost for this line; USD |
| `gcVariance` | `number` | Yes | Yes | — | **Calculated**: `gcEstimateAtCompletion - originalGCBudget`. Positive = overrun; negative = savings — see T07 §7.2 |
| `originalGRBudget` | `number` | Yes | No | Original GR Budget | Original estimate; USD; immutable reference |
| `grEstimateAtCompletion` | `number` | Yes | No | GR EAC | **PM-EDITABLE** (working version only); PM forecast of total GR cost; USD |
| `grVariance` | `number` | Yes | Yes | — | **Calculated**: `grEstimateAtCompletion - originalGRBudget` |
| `totalVariance` | `number` | Yes | Yes | — | **Calculated**: `gcVariance + grVariance` |
| `notes` | `string \| null` | No | No | Notes | PM commentary on variance or forecasting rationale |
| `lastEditedBy` | `string \| null` | No | No | — | userId of PM who last edited EAC fields |
| `lastEditedAt` | `string \| null` | No | No | — | ISO 8601 timestamp of last edit |

### 6.2 GC/GR category enumeration

| Enum Value | Description |
|------------|-------------|
| `Labor` | Site supervision, project management, administrative staff |
| `Material` | Consumables used for general site operations |
| `Equipment` | Equipment rental for site operations |
| `Subcontract` | GC subcontracts (safety consultant, temporary facility) |
| `Supervision` | Dedicated supervisory and QC staff |
| `Insurance` | Builders Risk, GL insurance premiums |
| `BondsInsurance` | Performance and payment bonds |
| `TaxPermit` | Permits, licenses, tax allocations |
| `FieldOffice` | Temporary field office and storage facilities |
| `Miscellaneous` | Small tools, minor consumables, cleanup |
| `Other` | Unclassified GC/GR expense |

### 6.3 GC/GR aggregation and version behavior

- System sums all GC/GR `gcEstimateAtCompletion` values across all divisions and categories.
- Total feeds into Forecast Summary `gcEstimateAtCompletion` (§5.5).
- GC/GR lines are version-scoped; when a new working version is derived, GC/GR lines are copied into the new version as its starting state (per T03 §3.4 derivation rules).
- Edits are only permitted on a working version.

---

*Navigation: [← T03 Forecast Versioning and Checklist](P3-E4-T03-Forecast-Versioning-and-Checklist.md) | [Master Index](P3-E4-Financial-Module-Field-Specification.md) | [T05 Cash Flow Working Model →](P3-E4-T05-Cash-Flow-Working-Model.md)*
