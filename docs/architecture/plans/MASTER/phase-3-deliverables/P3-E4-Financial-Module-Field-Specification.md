# P3-E4: Financial Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |
| **Related Contracts** | P3-E1 §3.1, §9.1; P3-E2 §3; P3-F1; P3-H1 §18.5 |
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

## 1. Financial Module Product Shape and Doctrine

### 1.1 What this module is

The Financial module is a **governed project-financial operating surface**. It is not an ERP mirror and not a spreadsheet clone. It supports:

- **Working forecast development** — PM maintains a live working version of the forecast throughout the month, editing line-level estimates and GC/GR projections against budget and actuals.
- **Internal confirmation checkpoints** — PM can confirm an internal version at any point; this creates an immutable confirmed snapshot for review and reference without triggering official publication.
- **Monthly published reporting versions** — One confirmed version per reporting month is selected as the report candidate. Official report publication finalizes that candidate as the published version for the month.
- **Field-level executive review** — Portfolio Executive Reviewers may annotate confirmed versions. Annotations are review-layer only and never mutate source-of-truth records.
- **Buyout control** — Subcontract and vendor commitments are tracked as procurement/commitment-control state, not as work-complete / invoiced-complete state.
- **Variance and history continuity** — Budget line identity is stable across imports and versions. Month-over-month comparison and annotation continuity are explicit design requirements.

### 1.2 What this module is not

- Not the accounting system of record. Budget baseline originates in Procore; actual cost data comes from Procore/ERP. Project Hub owns the normalized operational state built from those inputs (P3-E2 §3.3).
- Not a general-purpose ERP or job-cost ledger.
- Not a reporting artifact factory. The Reports module (P3-F1) owns report drafts, generation, and release. Financial supplies confirmed snapshots; Reports assembles and publishes.
- Not an approval system for report release. Report approval and release authority is governed by P3-F1 and the central project-governance policy record.

### 1.3 Authority model terminology

This specification uses the locked Phase 3 authority model terms:

| Term | Meaning |
|------|---------|
| **Leadership** | Department-scoped authority over all projects in a department |
| **Portfolio Executive Reviewer (PER)** | Department-scoped, non-membership review-layer access; may annotate confirmed Financial versions and generate reviewer-generated report runs |
| **Project Executive (PE)** | Project-scoped full operational authority; approves reports, manages project settings |
| **PM / Project Team** | Operational authority over Financial working state; owns all forecast edits and confirmations |

---

## 2. Budget Line Identity Model

### 2.1 Identity design goals

Budget line identity must be **stable across imports and forecast versions** so that:
- Annotation continuity is preserved when a new import creates a new working version
- Month-over-month comparison works at the line level
- A line's edit and confirmation history is traceable regardless of how many times the budget has been re-imported

### 2.2 Identity layer definitions

A budget line carries multiple identity-related fields operating at distinct layers:

| Identity Field | Layer | Description |
|----------------|-------|-------------|
| `canonicalBudgetLineId` | **Canonical** | Project Hub's stable identifier for this budget line concept within this project. Assigned at first recognition (either from a stable external ID or after composite match resolution). Immutable once assigned. Survives re-imports as long as matching succeeds. |
| `externalSourceSystem` | **Source** | The upstream system that originated this line. Values: `'procore'` \| `'manual'`. Future: `'procore-api'` when direct API integration replaces CSV import. |
| `externalSourceLineId` | **Source** | The native line-item identifier from the upstream system. For future Procore API integration, this is the Procore budget line item `id` field. For current CSV imports, this is `null` (Procore CSV export does not include stable internal IDs). |
| `fallbackCompositeMatchKey` | **Fallback** | A deterministic composite string derived from `(costCodeTier1 + '|' + costType + '|' + budgetCode)` and normalized (trimmed, lowercased). Used for matching when `externalSourceLineId` is unavailable. Must be computed consistently on every import. |
| `budgetImportRowId` | **Import** | UUID generated per import row. Identifies this line as it arrived in a specific import batch. New ID on each import. Used for import audit trail and rollback, not for cross-import identity. |

### 2.3 Identity resolution on import

When a new budget import arrives:

1. **If `externalSourceLineId` is present** (future Procore API path): match on `(externalSourceSystem, externalSourceLineId)`. If matched, reuse the existing `canonicalBudgetLineId`. If no match, assign a new `canonicalBudgetLineId`.

2. **If `externalSourceLineId` is absent** (current CSV path): compute `fallbackCompositeMatchKey` for the incoming row. Attempt to match against existing lines for this project.
   - **Unique match**: reuse the existing `canonicalBudgetLineId`.
   - **No match**: assign a new `canonicalBudgetLineId`.
   - **Ambiguous match** (multiple existing lines share the same composite key): **do not silently inherit**. Create a `BudgetLineReconciliationCondition` record (§2.5). The line is held in a `ReconciliationRequired` state until PM resolves. Annotations and history from ambiguous-match lines are not inherited until resolution.

### 2.4 Annotation and history continuity

When a new confirmed version is derived from an existing confirmed version:

- All annotation anchor references pointing to a `(forecastVersionId, canonicalBudgetLineId, fieldKey)` triple are checked against the new version's line roster.
- Anchors that resolve cleanly carry forward as inherited annotations per §15.4.
- Anchors that cannot resolve (line removed or key changed) are flagged as `AnchorUnresolvable` in the annotation carry-forward record.

### 2.5 Reconciliation condition record

```typescript
interface IBudgetLineReconciliationCondition {
  conditionId: string;                         // UUID
  projectId: string;
  importBatchId: string;
  importRowFallbackKey: string;               // The ambiguous composite key
  candidateCanonicalLineIds: string[];         // Existing lines that matched
  status: 'Pending' | 'Resolved' | 'Dismissed';
  resolvedBy?: string;                         // userId of PM who resolved
  resolvedAt?: string;                         // ISO 8601 timestamp
  resolution?: 'MergedInto' | 'CreatedNew';
  resolvedCanonicalLineId?: string;           // The canonical ID assigned after resolution
  createdAt: string;
}
```

**PM behavior:** Until all `ReconciliationRequired` lines are resolved, the affected import batch is flagged with a `ReconciliationPending` warning. PM may not confirm a new forecast version while any line in the batch is in `ReconciliationRequired` state.

---

## 3. Budget Line Item Working Model

The budget line item is the fundamental unit of financial tracking. It is imported from Procore CSV export and represents a single budget code assignment within the project.

### 3.1 Complete Field Table

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source Column (Procore) | Business Rule / Formula |
|------------------------|-----------------|----------|------------|-------------------------|------------------------|
| canonicalBudgetLineId | `string` | Yes | See §2.3 | — | Stable project-level identifier per §2.2; persists across imports and versions |
| externalSourceSystem | `'procore' \| 'manual'` | Yes | No | — | Source system identifier; `'procore'` for CSV/API imports; `'manual'` for PM-entered lines |
| externalSourceLineId | `string \| null` | No | No | — | Procore native line item `id`; null for current CSV imports; populated when direct API integration is available |
| fallbackCompositeMatchKey | `string` | Yes | Yes | — | Deterministic composite: `lowercase(costCodeTier1 + '|' + costType + '|' + budgetCode)`; computed on import; used for cross-import identity matching when `externalSourceLineId` is absent |
| budgetImportRowId | `string` | Yes | Yes | — | UUID generated per import row; stable only within a single import batch; not a cross-import identity |
| projectId | `string` | Yes | No | — | FK to project record |
| subJob | `string` | No | No | Sub Job | Cost center or phase code (e.g., "Phase 1A", "Building A") |
| costCodeTier1 | `string` | Yes | No | Cost Code Tier 1 | First-level CSI category; validated against cost-code-dictionary.csv |
| costCodeTier2 | `string` | No | No | Cost Code Tier 2 | Second-level detail; optional |
| costCodeTier3 | `string` | No | No | Cost Code Tier 3 | Third-level detail; optional |
| costType | `CostType` | Yes | No | Cost Type | Enum: see §3.3 |
| budgetCode | `string` | Yes | No | Budget Code | Procore budget code; unique within project |
| budgetCodeDescription | `string` | Yes | No | Budget Code Description | Human-readable description (e.g., "Foundation Concrete Work") |
| originalBudget | `number` | Yes | No | Original Budget | Planned budget in USD; decimal to 2 places; must be > 0 |
| budgetModifications | `number` | Yes | No | Budget Modifications | Net budget add/remove in USD (can be positive or negative); cumulative |
| approvedCOs | `number` | Yes | No | Approved COs | Net approved change order adjustments; cumulative; can be negative (credit) |
| revisedBudget | `number` | Yes | Yes | — | **Calculated**: `originalBudget + budgetModifications + approvedCOs` |
| pendingBudgetChanges | `number` | Yes | No | Pending Budget Changes | Submitted but not yet approved change orders; can be positive or negative |
| projectedBudget | `number` | Yes | Yes | — | **Calculated**: `revisedBudget + pendingBudgetChanges` |
| jobToDateActualCost | `number` | Yes | No | Direct Costs / Actual | **Actual incurred cost** — invoiced and paid costs recognized to date; does NOT include committed-but-not-yet-invoiced; USD |
| committedCosts | `number` | Yes | No | Committed Costs | **Committed but not yet incurred** — executed subcontracts and purchase orders not yet invoiced; USD |
| costExposureToDate | `number` | Yes | Yes | — | **Calculated**: `jobToDateActualCost + committedCosts` — total financial exposure (actuals + obligations); USD |
| pendingCostChanges | `number` | Yes | No | Pending Cost Changes | Costs submitted for approval/allocation but not finalized; USD |
| projectedCosts | `number` | Yes | Yes | — | **Calculated**: `costExposureToDate + pendingCostChanges` |
| forecastToComplete | `number` | Yes | No | Forecast To Complete | **PM-EDITABLE IN WORKING VERSION ONLY** — PM's best estimate of total remaining cost to complete this line from today forward; USD; default = `max(0, revisedBudget - costExposureToDate)` |
| estimatedCostAtCompletion | `number` | Yes | Yes | — | **Calculated**: `costExposureToDate + forecastToComplete` |
| projectedOverUnder | `number` | Yes | Yes | Projected Over/Under | **Calculated**: `revisedBudget - estimatedCostAtCompletion`. Sign convention per §10: **positive = under budget (favorable); negative = over budget (unfavorable)** |
| importedAt | `string` | Yes | Yes | — | ISO 8601 timestamp of CSV import; immutable |
| importBatchId | `string` | Yes | Yes | — | UUID of import transaction; groups all lines from single upload |
| lastEditedBy | `string \| null` | No | No | — | userId of PM who last edited `forecastToComplete` in this version; null if not yet edited |
| lastEditedAt | `string \| null` | No | No | — | ISO 8601 timestamp of last `forecastToComplete` edit; null if not yet edited |
| priorForecastToComplete | `number \| null` | No | No | — | Previous value of `forecastToComplete` before current edit; enables audit trail; null on first edit |
| notes | `string \| null` | No | No | — | Optional PM notes about forecast rationale or issues |

### 3.2 Cost Model Explanation

The three cost fields represent distinct financial concepts that must never be blended:

| Field | What it means | Source |
|-------|---------------|--------|
| `jobToDateActualCost` | Money actually spent and recognized — invoiced, processed, and charged to this cost code | Procore / ERP via CSV or API |
| `committedCosts` | Money legally obligated but not yet invoiced — executed subcontracts and POs in flight | Procore / ERP via CSV or API |
| `costExposureToDate` | Total known financial obligation: `actualCost + committed` | Calculated |
| `forecastToComplete` | PM's estimate of all remaining cost from this point forward to project completion | PM-entered |
| `estimatedCostAtCompletion` | Total projected final cost: `exposure + remaining` | Calculated |

**Why the separation matters:** Treating committed costs as already-incurred costs produces a false picture of both current exposure and the remaining work estimate. FTC must represent actual future spend, not a residual after all commitments are subtracted.

### 3.3 Cost Type Enumeration

| Enum Value | Description |
|------------|-------------|
| `Labor` | Direct labor (wages, burden, payroll taxes) |
| `Material` | Materials, supplies, and consumables |
| `Equipment` | Equipment rental, purchase, or lease |
| `Subcontract` | Subcontractor and vendor invoices |
| `Other` | Miscellaneous or unclassified costs |

### 3.4 PM Editing Rules and Provenance

**Editability is version-scoped:**
- `forecastToComplete` is PM-editable only in a working version.
- In a confirmed version, all fields are immutable.
- To edit after confirmation, PM must derive a new working version from the confirmed version (§4.4) — there is no "unlock in place" operation.

**Edit provenance (per edit):**
- `lastEditedBy = userId`
- `lastEditedAt = now (UTC)`
- `priorForecastToComplete = prior value` (for audit)

**Validation on `forecastToComplete` edit:**
- Must be `>= 0`; system enforces. Negative remaining cost is not valid.
- No lower bound tied to past spend. The PM may forecast a remaining cost lower than the uncommitted budget if they believe work can be completed under budget. The system computes EAC and projectedOverUnder from the PM's input; it warns if EAC significantly exceeds `revisedBudget` but does not block the edit.
- System displays derived metrics (`estimatedCostAtCompletion`, `projectedOverUnder`) immediately on edit to give PM visual feedback.

### 3.5 Budget Line Import Workflow

**CSV Import Process:**
1. PM uploads Procore_Budget.csv file via the Financial module UI.
2. System validates all rows:
   - Required: `budgetCode`, `budgetCodeDescription`, `costType`, `originalBudget`
   - `costCodeTier1` validated against `cost-code-dictionary.csv` (7,566 records); import fails with specific line error if not found
   - `originalBudget` must be a positive decimal
   - Duplicate `budgetCode` within same import rejected
3. All rows from single import receive same `importBatchId`
4. Identity resolution runs for each row per §2.3; reconciliation conditions created for any ambiguous matches
5. System calculates all derived fields immediately
6. `forecastToComplete` defaults to `max(0, revisedBudget - costExposureToDate)` per line
7. Import creates a new **derived working version** per §4.4 — prior working, confirmed, and published versions remain intact in the ledger
8. Feedback: "Import created a new working version. [N] lines matched to existing canonical lines; [N] new lines created; [N] reconciliation conditions require PM review."
9. Atomic: on validation failure, no lines are written and no new version is created.

**Cost-Code Dictionary Reference:**
- File: `cost-code-dictionary.csv`
- Structure: `stage | csi_code (XX-XX-XXX format) | csi_code_description`
- 7,566 valid cost codes; loaded into reference table at system startup
- Both `XX-XX-XXX` and `XX XX XX` (space-separated) formats accepted

---

## 4. Forecast Ledger Versioning Model

### 4.1 Design intent

The Financial module maintains a **versioned forecast ledger** — an ordered set of forecast versions for the project's lifetime. Versions are never deleted. The ledger supports working development, internal confirmation checkpoints, monthly publication, and full history.

### 4.2 Version types

| Version Type | Description | Editability |
|--------------|-------------|-------------|
| `Working` | The current draft. Only one working version at a time. PM edits all forecast fields freely. | Fully editable by PM |
| `ConfirmedInternal` | An immutable snapshot created when PM confirms. Multiple may exist in a month. | Immutable; PER-annotatable |
| `PublishedMonthly` | The official monthly version. Exactly one per reporting month. Finalized by report publication. | Immutable; PER-annotatable |
| `Superseded` | Any earlier version replaced by a later confirmed or published version; retained for audit. | Immutable; read-only |

### 4.3 Forecast version record

```typescript
interface IForecastVersion {
  forecastVersionId: string;           // UUID; stable identifier for this version
  projectId: string;
  versionType: ForecastVersionType;    // 'Working' | 'ConfirmedInternal' | 'PublishedMonthly' | 'Superseded'
  versionNumber: number;               // Monotonically increasing per project; assigned at creation
  reportingMonth: string | null;       // ISO 8601 year-month (e.g., '2026-03') for PublishedMonthly; null for Working and ConfirmedInternal
  derivedFromVersionId: string | null; // FK to the version this one was derived from; null for the initial version
  derivationReason: ForecastDerivationReason | null; // Why this version was created
  isReportCandidate: boolean;          // True if PM has designated this as the report-candidate for the current reporting cycle; only one ConfirmedInternal per project may have this = true at a time
  createdAt: string;                   // ISO 8601 timestamp
  createdBy: string;                   // userId of PM who created or triggered derivation
  confirmedAt: string | null;          // When PM confirmed (for ConfirmedInternal and PublishedMonthly)
  confirmedBy: string | null;          // userId of confirming PM
  publishedAt: string | null;          // When report publication finalized this as PublishedMonthly
  publishedByRunId: string | null;     // FK to the P3-F1 run-ledger entry that triggered publication
  staleBudgetLineCount: number;        // Count of budget lines with unresolved reconciliation conditions; confirmation blocked if > 0
  checklistCompletedAt: string | null; // When forecast checklist was completed for this version
  notes: string | null;               // Optional PM notes on this version
}

type ForecastVersionType = 'Working' | 'ConfirmedInternal' | 'PublishedMonthly' | 'Superseded';

type ForecastDerivationReason =
  | 'InitialSetup'          // First version created for the project
  | 'BudgetImport'          // New budget import triggered derivation
  | 'PostConfirmationEdit'  // PM derived working version from a confirmed version to make edits
  | 'ScheduleRefresh'       // Downstream source refresh triggered derivation
  | 'ManualDerivation';     // PM explicitly created a new working version
```

### 4.4 Derivation rules

**A new derived working version is automatically created when:**
1. A new budget import succeeds (reason: `BudgetImport`); the prior working version (if one exists) is transitioned to `Superseded`.
2. PM explicitly initiates a new working version derived from a confirmed version (reason: `PostConfirmationEdit`).

**A PM may not edit the fields of a confirmed version in place.** The "unlock and revise" model is removed. Instead:
- PM derives a new working version from the confirmed version.
- The confirmed version is preserved with `versionType = ConfirmedInternal`.
- The new working version inherits the data state of the confirmed version as its starting point.
- PM edits the new working version freely.

**A new working version may be manually created at any time** (reason: `ManualDerivation`) to start fresh from the current confirmed state.

### 4.5 Confirmation lifecycle

```
Working → [PM confirms, checklist complete] → ConfirmedInternal
ConfirmedInternal → [PM designates as report candidate] → isReportCandidate = true
ConfirmedInternal (with isReportCandidate = true) → [Report published by P3-F1] → PublishedMonthly
ConfirmedInternal / Working → [superseded by newer version] → Superseded
```

**PM may create multiple ConfirmedInternal versions in a month.** Only the most recently designated report-candidate is submitted to report publication.

**Confirmation requirements:**
1. All forecast checklist required items completed (§6.3)
2. All financial fields in forecast summary populated and valid
3. No unresolved budget line reconciliation conditions (`staleBudgetLineCount = 0`)
4. No budget lines with EAC exceeding projectedBudget by more than 200% without PM notes

### 4.6 Report-candidate designation

PM designates one `ConfirmedInternal` version as the report candidate by setting `isReportCandidate = true`. At most one version may hold `isReportCandidate = true` at any time; setting it on a new version clears it on the prior holder.

The `ConfirmedInternal` version designated as report candidate is the version that:
- The Reports module (P3-F1) includes in the PX Review and Owner Report module snapshot pull
- Becomes the `PublishedMonthly` version when report publication finalizes

The Financial module surfaces the report-candidate designation clearly in the UI so PER can identify which confirmed version is the designated reporting version.

### 4.7 Version-specific staleness

Staleness in the versioning model is **version-specific**, not a whole-module flag:

| Staleness event | Effect |
|-----------------|--------|
| New budget import arrives | The current working version (if one exists) is superseded; a new working version is derived. Prior confirmed versions are unaffected. |
| GC/GR estimate changes | The change is recorded in the current working version. Prior confirmed versions are unaffected and remain valid. |
| Confirmed version used as report candidate becomes stale | The PM should derive a new working version, apply the changes, re-confirm, and re-designate the report candidate. The original confirmed version remains in the ledger. |

There is no whole-module `Stale` status. Staleness is resolved by deriving and confirming a new version — not by mutating a confirmed version.

---

## 5. Financial Forecast Summary Model

The Financial Forecast Summary holds the high-level financial projection for the entire project. These fields live on the **working version** of the forecast and are frozen when the version is confirmed.

### 5.1 Project Metadata Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (Excel Sheet 1) | Business Rule |
|------------------------|-----------------|----------|------------|------------------------|---------------|
| forecastVersionId | `string` | Yes | Yes | — | FK to `IForecastVersion.forecastVersionId`; ties this summary to a specific version |
| projectId | `string` | Yes | No | — | FK to project |
| projectName | `string` | Yes | No | PROJECT NAME | Display name; must match project record |
| projectNumber | `string` | Yes | No | PROJECT NO. | Unique project identifier; matches project record |
| contractType | `ContractType` | Yes | No | Contract Type | Enum: `GMP` \| `LumpSum` \| `CostPlus` \| `UnitPrice` \| `TimeAndMaterials` |
| projectType | `ProjectType` | Yes | No | Project Type | Enum: `Commercial` \| `Residential` \| `Healthcare` \| `Education` \| `Industrial` \| `Infrastructure` \| `Other` |
| damageClauseLDs | `string \| null` | No | No | Damage Clause/LD's | Text description of liquidated damages clause; informational only |

### 5.2 Schedule Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| originalContractCompletion | `string` | Yes | No | Original Contract Completion | ISO 8601 date; contract baseline completion; immutable reference |
| approvedDaysExtensions | `integer` | Yes | No | Approved Days | Calendar days granted via approved change orders; >= 0 |
| revisedContractCompletion | `string` | Yes | Yes | — | **Calculated**: `originalContractCompletion + approvedDaysExtensions calendar days` |

### 5.3 Financial Summary Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| originalContractValue | `number` | Yes | No | Original Contract Value | Initial contract amount in USD; immutable reference |
| originalEstimatedCost | `number` | Yes | No | Original Cost | Original estimated total cost in USD; immutable reference |
| originalProfit | `number` | Yes | No | Original Profit | Computed at contract time: `originalContractValue - originalEstimatedCost` |
| originalBuyoutSavings | `number` | Yes | No | Original Buyout Savings | Original estimated savings from competitive buyout; USD |
| currentContractValue | `number` | Yes | No | — | **PM-EDITABLE** (working version only); current contract value after approved change orders; starts equal to `originalContractValue` |
| estimatedCostAtCompletion | `number` | Yes | Yes | — | **Calculated**: Sum of `estimatedCostAtCompletion` across all budget lines plus GC/GR totals |
| currentProfit | `number` | Yes | Yes | — | **Calculated**: `currentContractValue - estimatedCostAtCompletion` |
| profitMargin | `number` | Yes | Yes | — | **Calculated**: `(currentProfit / currentContractValue) × 100`; format as percentage to 2 decimal places; negative indicates forecasted loss |

### 5.4 Contingency Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| originalContingency | `number` | Yes | No | Original Contingency | Original contingency reserve in USD; immutable reference |
| currentContingency | `number` | Yes | No | Current Contingency | **PM-EDITABLE** (working version only); contingency remaining after allocations |
| expectedContingencyAtCompletion | `number` | Yes | No | Expected at Completion | PM forecast of contingency remaining at project end; USD |
| expectedContingencyUse | `number` | Yes | Yes | — | **Calculated**: `originalContingency - expectedContingencyAtCompletion` |

### 5.5 General Conditions Fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| originalGCEstimate | `number` | Yes | No | Original Estimate (GC) | Original General Conditions budget; USD |
| gcEstimateAtCompletion | `number` | Yes | Yes | — | **Calculated**: Sum of all `gcEstimateAtCompletion` values from GC/GR working model (§7) |

---

## 6. Forecast Checklist Model

The Forecast Checklist is completed by the PM before confirming a forecast version. A working version cannot be confirmed until all required checklist items are completed.

### 6.1 Checklist Structure

| itemId (stable) | group | label (exact from template) | required |
|-----------------|-------|----------------------------|----------|
| doc_procore_budget | RequiredDocuments | Procore Budget export attached | Yes |
| doc_forecast_summary | RequiredDocuments | Forecast Summary completed | Yes |
| doc_gc_gr_log | RequiredDocuments | GC/GR Log completed | Yes |
| doc_cash_flow | RequiredDocuments | Cash Flow projection completed | Yes |
| doc_sdi_log | RequiredDocuments | SDI Log attached | Yes |
| doc_buyout_log | RequiredDocuments | Buyout Log completed | Yes |
| profit_changes_noted | ProfitForecast | Profit changes noted in working files | Yes |
| profit_negative_flagged | ProfitForecast | Negative profit values flagged for review | Yes |
| profit_gc_savings_confirmed | ProfitForecast | GC/buyout savings confirmed | Yes |
| profit_events_documented | ProfitForecast | Projected events documented | Yes |
| schedule_status_current | Schedule | Schedule status current (within 7 days) | Yes |
| schedule_brewing_items_noted | Schedule | Brewing issues noted | Yes |
| schedule_gc_gr_confirmed | Schedule | GC/GR schedule confirmed | Yes |
| schedule_delay_notices_sent | Schedule | Delay notices sent (if applicable) | Conditional |
| reserve_contingency_confirmed | Additional | Contingency reserve confirmed | Yes |
| reserve_gc_confirmed | Additional | GC estimate at completion confirmed | Yes |
| ar_aging_reviewed | Additional | A/R aging reviewed (cash flow impact) | Yes |
| buyout_savings_dispositioned | Additional | Buyout savings dispositioned (if undispositioned savings exist) | Conditional |
| executive_approval_noted | Additional | Executive review completed (optional) | Conditional |

### 6.2 Checklist Item Record Structure

| Field Name (camelCase) | TypeScript Type | Required | Description |
|------------------------|-----------------|----------|-------------|
| checklistId | `string` | Yes | UUID; identifies this checklist instance |
| forecastVersionId | `string` | Yes | FK to `IForecastVersion`; this checklist belongs to a specific version |
| itemId | `string` | Yes | Stable item identifier from §6.1 |
| group | `ForecastChecklistGroup` | Yes | Enum: `RequiredDocuments` \| `ProfitForecast` \| `Schedule` \| `Additional` |
| label | `string` | Yes | Display text |
| completed | `boolean` | Yes | true = PM has checked off this item |
| completedBy | `string \| null` | No | userId of PM who checked item |
| completedAt | `string \| null` | No | ISO 8601 timestamp when checked |
| notes | `string \| null` | No | Optional PM notes |
| required | `boolean` | Yes | true = item must be completed to confirm; false = informational only |

### 6.3 Checklist Completion and Version Confirmation

**Confirmation gate:**
A working version may only be confirmed when:
1. All required checklist items (`required = true`) have `completed = true`
2. All financial summary fields are populated and valid
3. `staleBudgetLineCount = 0` (no unresolved reconciliation conditions)
4. No buyout line with `undispositionedBuyoutSavings > 0` if the conditional item `buyout_savings_dispositioned` is relevant (§9.6)

**Confirmation action:**
- PM clicks "Confirm Version"
- System validates all conditions; if any fail, displays clear error listing unfulfilled requirements
- On success: sets `versionType = ConfirmedInternal`, `confirmedAt = now`, `confirmedBy = userId`, `checklistCompletedAt = now`
- Version is immutable after confirmation
- If this is to be the report candidate, PM designates it via §4.6

**No "unlock in place":** To make edits after confirming, PM derives a new working version from the confirmed version (§4.4).

---

## 7. GC/GR Working Model

General Conditions (GC) and General Requirements (GR) are overhead and jobsite costs managed separately from direct construction costs.

### 7.1 GC/GR Line Record Structure

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (Excel sheet) | Business Rule |
|------------------------|-----------------|----------|------------|----------------------|---------------|
| gcGrId | `string` | Yes | Yes | — | UUID; stable identifier for this GC/GR line |
| forecastVersionId | `string` | Yes | No | — | FK to `IForecastVersion`; GC/GR lines are version-scoped |
| projectId | `string` | Yes | No | — | FK to project |
| divisionNumber | `string` | Yes | No | Division # | CSI division number; standard CSI XX format |
| divisionDescription | `string` | Yes | No | Division description | Display name (e.g., "General Requirements") |
| gcGrCategory | `GCGRCategory` | Yes | No | GC category types | Enum: see §7.2 |
| originalGCBudget | `number` | Yes | No | Original GC Budget | Original estimate; USD; immutable reference |
| gcEstimateAtCompletion | `number` | Yes | No | GC EAC | **PM-EDITABLE** (working version only); PM forecast of total GC cost for this line; USD |
| gcVariance | `number` | Yes | Yes | — | **Calculated**: `gcEstimateAtCompletion - originalGCBudget`. Positive = overrun; negative = savings |
| originalGRBudget | `number` | Yes | No | Original GR Budget | Original estimate; USD; immutable reference |
| grEstimateAtCompletion | `number` | Yes | No | GR EAC | **PM-EDITABLE** (working version only); PM forecast of total GR cost; USD |
| grVariance | `number` | Yes | Yes | — | **Calculated**: `grEstimateAtCompletion - originalGRBudget` |
| totalVariance | `number` | Yes | Yes | — | **Calculated**: `gcVariance + grVariance` |
| notes | `string \| null` | No | No | Notes | PM commentary on variance or forecasting rationale |
| lastEditedBy | `string \| null` | No | No | — | userId of PM who last edited EAC fields |
| lastEditedAt | `string \| null` | No | No | — | ISO 8601 timestamp of last edit |

### 7.2 GC/GR Category Enumeration

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

### 7.3 GC/GR Aggregation

- System sums all GC/GR `gcEstimateAtCompletion` values across all divisions and categories.
- Total feeds into Forecast Summary `gcEstimateAtCompletion` (§5.5).
- GC/GR lines are version-scoped; when a new working version is derived, GC/GR lines are copied into the new version as its starting state.
- Edits are only permitted on a working version.

---

## 8. Cash Flow Working Model

The Cash Flow model projects monthly inflows and outflows for the project duration. It includes 13 months of actuals (historical) and 18 months of forward projection.

### 8.1 Monthly Actual Cash Flow Record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (cash-flow.json) | Business Rule |
|------------------------|-----------------|----------|------------|-------------------------|---------------|
| monthlyRecordId | `string` | Yes | Yes | — | UUID |
| forecastVersionId | `string` | Yes | No | — | FK to `IForecastVersion` |
| projectId | `string` | Yes | No | project_id | FK to project |
| periodMonth | `integer` | Yes | No | month | Month index: 1 = Jan, ..., 12 = Dec; 13+ for multi-year |
| calendarDate | `string` | Yes | No | — | ISO 8601 date; first day of month; drives sorting |
| recordType | `'Actual' \| 'Forecast'` | Yes | No | — | `Actual` for historical; `Forecast` for projected |
| inflowOwnerPayments | `number` | Yes | No | inflows.owner_payments | Owner progress billing received; USD |
| inflowOtherInflows | `number` | Yes | No | inflows.other_inflows | Other revenue (CO billings, retainage releases); USD |
| totalInflows | `number` | Yes | Yes | — | **Calculated**: `inflowOwnerPayments + inflowOtherInflows` |
| outflowSubcontractorPayments | `number` | Yes | No | outflows.subcontractor_payments | Subcontractor and vendor invoices paid; USD |
| outflowMaterialCosts | `number` | Yes | No | outflows.material_costs | Material costs paid; USD |
| outflowLaborCosts | `number` | Yes | No | outflows.labor_costs | Direct labor paid; USD |
| outflowOverhead | `number` | Yes | No | outflows.overhead | Office, insurance, general overhead; USD |
| outflowEquipment | `number` | Yes | No | outflows.equipment | Equipment costs; USD |
| totalOutflows | `number` | Yes | Yes | — | **Calculated**: Sum of all outflow fields |
| netCashFlow | `number` | Yes | Yes | — | **Calculated**: `totalInflows - totalOutflows`. Sign: positive = surplus, negative = deficit |
| cumulativeCashFlow | `number` | Yes | Yes | — | **Calculated**: Running sum of `netCashFlow` from project start |
| workingCapital | `number \| null` | No | No | working_capital | Current assets minus current liabilities; informational |
| retentionHeld | `number` | Yes | No | retention_held | Cumulative retainage held by owner at end of month |
| forecastAccuracy | `number \| null` | No | Yes | forecast_accuracy | For Actual records only: `(|actualNet - priorForecastNet| / |priorForecastNet|) × 100`; null if no prior forecast exists |
| recordedAt | `string` | Yes | Yes | — | ISO 8601 timestamp when actual was recorded; immutable |
| notes | `string \| null` | No | No | — | Optional PM notes |

### 8.2 Monthly Forecast Cash Flow Record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule |
|------------------------|-----------------|----------|------------|---------------|
| monthlyRecordId | `string` | Yes | Yes | UUID |
| forecastVersionId | `string` | Yes | No | FK to `IForecastVersion` |
| projectId | `string` | Yes | No | FK to project |
| periodMonth | `integer` | Yes | No | Month index; continues from actuals |
| calendarDate | `string` | Yes | No | ISO 8601 date; first day of month |
| recordType | `'Forecast'` | Yes | No | Always `Forecast` |
| projectedInflows | `number` | Yes | No | **PM-EDITABLE** (working version only); forecasted owner draws/billings; USD |
| projectedOutflows | `number` | Yes | No | **PM-EDITABLE** (working version only); forecasted sub, material, labor, overhead; USD |
| projectedNetCashFlow | `number` | Yes | Yes | **Calculated**: `projectedInflows - projectedOutflows` |
| projectedCumulativeCashFlow | `number` | Yes | Yes | **Calculated**: Cumulative sum from last actual month |
| confidenceScore | `integer` | Yes | No | PM-estimated accuracy; 0–100; 100 = high confidence |
| notes | `string \| null` | No | No | PM forecast assumptions |
| lastEditedBy | `string \| null` | No | No | userId of PM who last edited |
| lastEditedAt | `string \| null` | No | No | ISO 8601 timestamp of last edit |

### 8.3 Cash Flow Summary Aggregate

| Field Name (camelCase) | TypeScript Type | Calculated | Business Rule |
|------------------------|-----------------|-----------|---------------|
| summaryId | `string` | Yes | UUID |
| forecastVersionId | `string` | No | FK to version |
| projectId | `string` | No | FK to project |
| totalActualInflows | `number` | Yes | Sum of `totalInflows` across all actual months |
| totalActualOutflows | `number` | Yes | Sum of `totalOutflows` across all actual months |
| totalActualNetCashFlow | `number` | Yes | Sum of `netCashFlow` across all actual months |
| totalForecastedInflows | `number` | Yes | Sum of `projectedInflows` across all forecast months |
| totalForecastedOutflows | `number` | Yes | Sum of `projectedOutflows` across all forecast months |
| totalForecastedNetCashFlow | `number` | Yes | Sum of `projectedNetCashFlow` across all forecast months |
| combinedNetCashFlow | `number` | Yes | `totalActualNetCashFlow + totalForecastedNetCashFlow` |
| peakCashRequirement | `number` | Yes | Minimum (most negative) value in entire cumulative cash flow series |
| cashFlowAtRisk | `number` | Yes | Sum of all months where `projectedNetCashFlow < 0` |
| computedAt | `string` | Yes | ISO 8601 timestamp of last computation |
| lastUpdated | `string` | Yes | ISO 8601 timestamp of last data change |

### 8.4 Retention Calculation Model

**Standard Retention Model (configurable per project):**
- Retainage rate: default 10% (configurable per contract; stored in project settings)
- Calculation: `monthlyRetentionHeld = sum(invoices to date × retainageRate) - sum(retainage releases to date)`
- Contract may define custom release schedule (e.g., 50% at Substantial Completion, 50% after punch list)

### 8.5 A/R Aging Display Model (READ-ONLY)

A/R Aging data is **read-only** and sourced from the accounting/ERP system. Project Hub Financial does not create or modify A/R records.

| Field Name (camelCase) | TypeScript Type | Source | Description |
|------------------------|-----------------|--------|-------------|
| arAgeId | `string` | — | UUID; record identifier |
| projectId | `string` | — | FK to project |
| projectName | `string` | Accounting ERP | Display name |
| projectManager | `string` | Accounting ERP | PM name or ID |
| percentComplete | `number` | Schedule module | Project completion % from Schedule spine |
| balanceToFinish | `number` | Accounting ERP | Remaining work value; USD |
| retainage | `number` | Cash Flow model | Total retainage held; USD |
| totalAR | `number` | Accounting ERP | Total outstanding AR; USD |
| current0To30 | `number` | Accounting ERP | 0–30 days aging bucket; USD |
| current30To60 | `number` | Accounting ERP | 30–60 days; USD |
| current60To90 | `number` | Accounting ERP | 60–90 days; USD |
| current90Plus | `number` | Accounting ERP | >90 days (past due); USD |
| comments | `string \| null` | Accounting ERP | Collection notes |
| refreshedAt | `string` | — | ISO 8601 timestamp of last sync |

**Integration:** Daily sync job. If sync fails, dashboard shows last successful sync time and warning. No PM editing of any field.

---

## 9. Buyout Sub-Domain

Buyout is a **procurement / commitment-control surface**, not a work-complete or invoiced-complete tracker. The buyout headline metric is dollar-weighted against subcontract value, not count-based. Buyout savings are explicitly tracked and require PM disposition before they affect the project forecast.

### 9.1 Buyout Line Item Record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (Buyout Log Excel) | Business Rule |
|------------------------|-----------------|----------|------------|---------------------------|---------------|
| buyoutLineId | `string` | Yes | Yes | — | UUID; stable identifier |
| projectId | `string` | Yes | No | — | FK to project |
| divisionCode | `string` | Yes | No | DIVISION # | CSI division number; validated against cost-code-dictionary |
| divisionDescription | `string` | Yes | No | DIVISION DESCRIPTION | CSI division name |
| lineItemDescription | `string` | Yes | No | (sub-category) | Specific scope line |
| subcontractorVendorName | `string` | Yes | No | SUBCONTRACTOR / VENDOR | Name of subcontractor or vendor |
| originalBudget | `number` | Yes | No | ORIGINAL BUDGET | Budget line amount from budget model (§3); immutable reference |
| contractAmount | `number \| null` | No | No | CONTRACT AMOUNT | Executed contract or PO amount; USD; null until negotiated/executed |
| overUnder | `number \| null` | No | Yes | — | **Calculated when `contractAmount` is non-null**: `contractAmount - originalBudget`. **Sign convention per §10**: positive = over budget (unfavorable); negative = under budget (favorable / savings) |
| buyoutSavingsAmount | `number` | Yes | Yes | — | **Calculated**: `max(0, originalBudget - contractAmount)` when `contractAmount` is non-null and < `originalBudget`; 0 otherwise. Represents recognized savings from below-budget execution. |
| savingsDispositionStatus | `BuyoutSavingsDispositionStatus` | Yes | No | — | Enum: `NoSavings` \| `Undispositioned` \| `PartiallyDispositioned` \| `FullyDispositioned`; see §9.5 |
| loiDateToBeSent | `string \| null` | No | No | LOI DATE TO BE SENT | ISO 8601 date; planned LOI send date |
| loiReturnedExecuted | `string \| null` | No | No | LOI Returned Executed | ISO 8601 date; actual LOI return date |
| contractExecutedDate | `string \| null` | No | No | (tracking column) | ISO 8601 date; formal contract execution date |
| status | `BuyoutLineStatus` | Yes | No | (tracking column) | Procurement workflow status; see §9.2 |
| subcontractChecklistId | `string \| null` | No | No | — | FK to `ISubcontractChecklist.checklistId` in P3-E12; required before `ContractPending`; MUST be set and satisfied before `ContractExecuted` — see gate rule §9.3 |
| notes | `string \| null` | No | No | — | PM commentary |
| lastEditedBy | `string \| null` | No | No | — | userId of PM who last edited |
| lastEditedAt | `string \| null` | No | No | — | ISO 8601 timestamp of last edit |

### 9.2 Buyout Status Enumeration

| Enum Value | Description | Procurement interpretation |
|------------|-------------|---------------------------|
| `NotStarted` | Scope identified; solicitation not yet issued | Pre-procurement |
| `LoiPending` | LOI issued; awaiting subcontractor execution | Active procurement |
| `LoiExecuted` | LOI signed by both parties | Commitment intent established |
| `ContractPending` | Formal contract in drafting/review | Final commitment in progress |
| `ContractExecuted` | Formal subcontract signed; commitment finalized | Commitment locked |
| `Complete` | Subcontract work finished; final invoice reconciled | Scope closed |
| `Void` | Cancelled or scope eliminated | No commitment |

### 9.3 ContractExecuted Gate Rule

Transition to `ContractExecuted` is subject to the Subcontract Compliance gate (P3-E12):

```typescript
// IBuyoutLineItem.status MUST NOT transition to 'ContractExecuted' UNLESS:
//   1. subcontractChecklistId is non-null
//   2. ISubcontractChecklist.status === 'Complete'
//   3. ISubcontractChecklist.complianceWaiver === null
//      OR ISubcontractChecklist.complianceWaiver.status === 'Approved'
```

This gate is enforced in the Financial module's Buyout status update API. If the gate is not satisfied, the API MUST reject the status transition with a specific error identifying which condition is unmet. UI behavior: when a PM attempts to advance to `ContractExecuted` and the gate is not satisfied, a clear error must display with a direct link to the Subcontract Compliance record.

### 9.4 Buyout Completion Metric (Dollar-Weighted)

The buyout completion headline is **dollar-weighted**, not count-based. Dollar weighting is required because a $5M subcontract executing has materially different significance than a $50K PO.

```typescript
interface IBuyoutSummaryMetrics {
  totalBudget: number;             // Sum of originalBudget across all non-Void lines
  totalContractAmount: number;     // Sum of contractAmount across all ContractExecuted + Complete lines
  totalOverUnder: number;          // Sum of overUnder across executed lines; sign per §10
  totalRealizedBuyoutSavings: number; // Sum of buyoutSavingsAmount across all executed lines
  totalUndispositionedSavings: number; // Sum of undispositioned savings awaiting PM action

  // Dollar-weighted completion metric
  percentBuyoutCompleteDollarWeighted: number;
  // = totalContractAmount / totalBudget × 100
  // Reflects actual commitment value secured vs. total budgeted subcontract value

  // Count metrics (secondary)
  linesNotStarted: number;
  linesInProgress: number;      // status in [LoiPending, LoiExecuted, ContractPending, ContractExecuted]
  linesComplete: number;
  linesVoid: number;
  totalLinesActive: number;     // total lines minus Void
}
```

### 9.5 Buyout Savings Tracking and Disposition

When a subcontract is executed below its original budget amount, the savings are **recognized immediately** and **reported immediately**, but are **not silently absorbed into the live forecast**. They remain in a tracked savings bucket until PM/PX explicitly dispositions them.

**Savings are recognized** when `status` transitions to `ContractExecuted` (or is already `ContractExecuted` or `Complete`) and `contractAmount < originalBudget`.

**Disposition destinations:**

| Disposition | Meaning |
|-------------|---------|
| `AppliedToForecast` | Savings reduce the project's estimated cost at completion; PM updates relevant forecast line(s) |
| `HeldInContingency` | Savings transferred to project contingency / reserve; `currentContingency` in §5.4 increases accordingly |
| `ReleasedToGoverned` | Savings released to a governed margin / release bucket managed by PE/Leadership; Financial records the release event |

**Buyout savings record:**

```typescript
interface IBuyoutSavingsDisposition {
  dispositionId: string;                          // UUID
  buyoutLineId: string;
  projectId: string;
  totalSavingsAmount: number;                     // Total savings from this line
  dispositionedAmount: number;                    // Amount dispositioned so far
  undispositionedAmount: number;                  // totalSavingsAmount - dispositionedAmount
  dispositionItems: IBuyoutSavingsDispositionItem[];
  createdAt: string;
  lastUpdatedAt: string;
}

interface IBuyoutSavingsDispositionItem {
  itemId: string;
  destination: BuyoutSavingsDestination;          // 'AppliedToForecast' | 'HeldInContingency' | 'ReleasedToGoverned'
  amount: number;
  dispositionedBy: string;                        // userId
  dispositionedAt: string;                        // ISO 8601 timestamp
  notes: string | null;
  linkedForecastVersionId: string | null;         // If AppliedToForecast, the version receiving the savings
}

type BuyoutSavingsDestination = 'AppliedToForecast' | 'HeldInContingency' | 'ReleasedToGoverned';
type BuyoutSavingsDispositionStatus = 'NoSavings' | 'Undispositioned' | 'PartiallyDispositioned' | 'FullyDispositioned';
```

### 9.6 Savings Disposition Workflow

1. When `contractAmount < originalBudget` and `status` transitions to `ContractExecuted`, the system creates an `IBuyoutSavingsDisposition` record with `undispositionedAmount = totalSavingsAmount`.
2. A Work Queue item "Undispositioned buyout savings require action" is created and assigned to the PM.
3. PM selects a disposition for all or part of the savings (one or more destinations may be used).
4. Until all savings are dispositioned, the forecast checklist conditional item `buyout_savings_dispositioned` must be marked complete (PM attestation) before version confirmation.
5. If PM selects `AppliedToForecast`, the relevant budget line `forecastToComplete` values in the current working version are updated accordingly (PM action; system does not auto-apply).
6. If PM selects `HeldInContingency`, `currentContingency` in the forecast summary is increased by the dispositioned amount (system applies when PM confirms the disposition).
7. If PM selects `ReleasedToGoverned`, a `BuyoutSavingsReleased` activity event is published with PE notified.

### 9.7 Buyout Reconciliation to Budget

The Financial module publishes a buyout reconciliation metric to the Health spine:
- `buyoutToCommittedCostsReconciliation`: Compares total `contractAmount` from executed lines against `committedCosts` total from budget line model.
- Acceptable tolerance: within 5%.
- If variance exceeds tolerance: Health spine flags "Buyout discrepancy — contract amounts do not reconcile to budget. Review and investigate."

---

## 10. Sign Convention and Financial Display Rules

Consistent sign convention prevents misreading of favorable/unfavorable financial signals. This section is the single source of truth for sign and display convention across the Financial module.

### 10.1 Budget line projectedOverUnder

`projectedOverUnder = revisedBudget - estimatedCostAtCompletion`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Under budget (favorable) | Green |
| Zero | Exactly on budget | Neutral |
| Negative | Over budget (unfavorable) | Red |

### 10.2 GC/GR variances

`gcVariance = gcEstimateAtCompletion - originalGCBudget`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Cost overrun (unfavorable) | Red |
| Negative | Cost savings (favorable) | Green |

Note: GC/GR and buyout use cost-minus-budget direction; forecast summary uses budget-minus-cost direction. This is intentional and matches the underlying financial logic.

### 10.3 Buyout overUnder

`overUnder = contractAmount - originalBudget`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Over budget (unfavorable) | Red |
| Negative | Under budget (favorable = potential savings) | Green |

### 10.4 Profit and margin

`currentProfit = currentContractValue - estimatedCostAtCompletion`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Forecasting a profit | Green |
| Negative | Forecasting a loss | Red; explicit alert |

Profit margin < 5%: warning alert. Profit margin < 0%: critical alert requiring PE visibility.

### 10.5 Cash flow

`netCashFlow = totalInflows - totalOutflows`

| Value | Interpretation | Display |
|-------|---------------|---------|
| Positive | Cash surplus for month | Green |
| Negative | Cash deficit for month | Red |

### 10.6 Display precision

All currency fields: two decimal places (cents). Percentages: two decimal places. Dates: display in project locale; store as ISO 8601.

---

## 11. Status and Lifecycle Enumerations

### 11.1 Forecast Version Type

See §4.2.

### 11.2 Forecast Version Derivation Reason

See §4.3.

### 11.3 Forecast Checklist Group

| Enum Value | Description |
|------------|-------------|
| `RequiredDocuments` | Documents and attachments required before confirmation |
| `ProfitForecast` | Profit and cost forecast review items |
| `Schedule` | Schedule-related confirmation items |
| `Additional` | Contingency, GC, A/R, and savings disposition items |

### 11.4 Buyout Line Status

See §9.2.

### 11.5 Buyout Savings Disposition Status

| Enum Value | Description |
|------------|-------------|
| `NoSavings` | No savings exist on this line (`contractAmount >= originalBudget` or contract not yet executed) |
| `Undispositioned` | Savings recognized; no disposition action taken yet |
| `PartiallyDispositioned` | Some savings dispositioned; remainder pending |
| `FullyDispositioned` | All savings dispositioned |

---

## 12. Business Rules and Calculations

### 12.1 Budget Line Item Calculations

1. **revisedBudget** = `originalBudget + budgetModifications + approvedCOs`
2. **projectedBudget** = `revisedBudget + pendingBudgetChanges`
3. **costExposureToDate** = `jobToDateActualCost + committedCosts`
4. **projectedCosts** = `costExposureToDate + pendingCostChanges`
5. **estimatedCostAtCompletion** = `costExposureToDate + forecastToComplete`
6. **projectedOverUnder** = `revisedBudget - estimatedCostAtCompletion` (positive = favorable)

### 12.2 ForecastToComplete Validation

`forecastToComplete` is a **PM estimate of future cost** — it is distinct from past spend. The following rules apply:

- Must be `>= 0` (no negative remaining work).
- Has **no lower bound tied to historical cost**. FTC can be lower than `revisedBudget - costExposureToDate` (PM may believe work can be completed under remaining budget). FTC can also be higher (PM forecasts an overrun). The system derives EAC and projectedOverUnder and presents them; it does not block valid estimates.
- System warns if `estimatedCostAtCompletion > revisedBudget × 1.10` (10% over-budget threshold) to prompt PM to add a note, but does not block.
- Default on import: `max(0, revisedBudget - costExposureToDate)` — the remaining budget after accounting for known exposure.

### 12.3 Forecast Summary Calculations

1. **revisedContractCompletion** = `originalContractCompletion + approvedDaysExtensions` (calendar days)
2. **estimatedCostAtCompletion** = Sum of budget line `estimatedCostAtCompletion` + `gcEstimateAtCompletion`
3. **currentProfit** = `currentContractValue - estimatedCostAtCompletion`
4. **profitMargin** = `(currentProfit / currentContractValue) × 100`

### 12.4 GC/GR Calculations

1. **gcVariance** = `gcEstimateAtCompletion - originalGCBudget` (positive = overrun)
2. **grVariance** = `grEstimateAtCompletion - originalGRBudget`
3. **totalVariance** = `gcVariance + grVariance`

### 12.5 Cash Flow Calculations

1. **totalInflows** = `inflowOwnerPayments + inflowOtherInflows`
2. **totalOutflows** = Sum of all outflow fields
3. **netCashFlow** = `totalInflows - totalOutflows`
4. **cumulativeCashFlow** = Running sum of monthly `netCashFlow` from project start
5. **forecastAccuracy** = `(|actualNet - priorForecastNet| / |priorForecastNet|) × 100` (Actual records only, when prior forecast exists)
6. **peakCashRequirement** = Minimum (most negative) value in cumulative cash flow series
7. **cashFlowAtRisk** = Sum of all months where `projectedNetCashFlow < 0`

### 12.6 Buyout Calculations

1. **overUnder** = `contractAmount - originalBudget` (positive = over, unfavorable)
2. **buyoutSavingsAmount** = `max(0, originalBudget - contractAmount)` when contract is executed
3. **percentBuyoutCompleteDollarWeighted** = `sum(contractAmount for ContractExecuted + Complete) / totalBudget × 100`

### 12.7 Version Derivation Rules

When a new working version is derived:
- Budget line data is copied from the source version as the starting state.
- GC/GR lines are copied.
- Cash flow records are copied.
- Forecast summary fields are copied.
- The checklist is NOT copied; the new working version starts with an empty checklist.
- `derivedFromVersionId` and `derivationReason` are set.
- Open annotation carry-forward runs per §15.4.

### 12.8 Provenance Requirements

Every edit to a PM-editable field in a working version creates an audit record:
- `lastEditedBy` (userId)
- `lastEditedAt` (ISO 8601 UTC)
- Prior value saved for comparison

Edit history is retained indefinitely. Confirmed versions are immutable — no edit records are created on confirmed versions.

---

## 13. Required Capabilities

### 13.1 CSV Budget Import

- File upload via UI: "Upload Budget CSV"
- Parser reads Procore_Budget.csv format (21 columns)
- Validates each row; rejects import atomically on any validation failure
- Identity resolution per §2.3 with reconciliation conditions for ambiguous matches
- Creates new derived working version per §4.4; does not modify any existing version
- Feedback: version created, lines matched/new/reconciliation-pending counts

### 13.2 Financial Forecast Summary Editing

- PM-editable fields (working version only): `contractType`, `projectType`, `damageClauseLDs`, `approvedDaysExtensions`, `currentContractValue`, `currentContingency`, `expectedContingencyAtCompletion`
- All other fields are read-only
- Edits trigger recalculation of dependent fields
- Editing blocked on confirmed versions; PM must derive a new working version

### 13.3 Forecast Version Management

- Version list view: shows all versions (Working, ConfirmedInternal, PublishedMonthly, Superseded) with version number, type, confirmed/published date, report-candidate flag
- "Confirm Version" action: validates all confirmation requirements (§4.5), confirms working version to ConfirmedInternal
- "Designate Report Candidate" action: sets `isReportCandidate = true` on a ConfirmedInternal version
- "Derive New Working Version" action: PM can derive a new working version from any ConfirmedInternal version; prior working version (if any) transitions to Superseded
- No "unlock in place" action exists

### 13.4 GC/GR Working Model Editing

- Grid view: rows = divisions; columns = GC/GR categories
- Editable fields (working version only): `gcEstimateAtCompletion`, `grEstimateAtCompletion`, `notes`
- System calculates variances; changes propagate immediately to Forecast Summary

### 13.5 Cash Flow Model Editing

- Table view: 13 actuals (read-only) + 18 forecast (editable in working version only)
- Editable fields: `projectedInflows`, `projectedOutflows`, `confidenceScore`, `notes`
- Graph view: cumulative cash flow line chart with red shading for deficit months

### 13.6 Buyout Log Management

- Table view: all buyout lines with Division, Description, Vendor, Contract Amount, Original Budget, Over/Under, Savings, Disposition Status, Procurement Status
- PM actions: add, edit, advance status (subject to gate rules in §9.3)
- Savings disposition workflow per §9.6
- Dollar-weighted completion metric prominent in summary bar
- Bulk status update for multiple lines

### 13.7 Forecast Checklist Completion

- Per-version checklist; starts empty on each new working version
- PM checks items; group completion summaries displayed
- "Confirm Version" button enabled only when all required items complete

### 13.8 Export Capabilities

- Budget Line Items: CSV export (canonical id, code, description, actuals, committed, exposure, FTC, EAC, over/under, notes)
- Forecast Summary: single-page summary for inclusion in report snapshot
- GC/GR: CSV by division/category
- Cash Flow: CSV (13 actuals + 18 forecast)
- Buyout Log: CSV with all columns, savings, and disposition status
- PDF export: routed through P3-F1 generation pipeline as report snapshot; Financial does not generate standalone PDFs

### 13.9 Spine Publication

- Activity spine: log events per §14.1
- Health spine: publish metrics per §14.2
- Work Queue: flag items per §14.3
- Related Items: budget line → buyout line relationships; confirmed version → report run relationships

---

## 14. Spine Publication Events

### 14.1 Activity Spine Events

| Event | Trigger | Payload | Purpose |
|-------|---------|---------|---------|
| `BudgetImported` | CSV import succeeds | `{ importBatchId, lineCount, newVersionId, derivedFromVersionId, reconciliationConditionCount, projectId, importedAt }` | Log and audit all budget changes |
| `ForecastVersionConfirmed` | PM confirms working version | `{ forecastVersionId, versionNumber, projectId, confirmedAt, confirmedBy }` | Mark new confirmed snapshot |
| `ForecastVersionDerived` | New working version derived | `{ newVersionId, sourceVersionId, derivationReason, projectId, derivedAt }` | Track derivation lineage |
| `ReportCandidateDesignated` | PM sets report-candidate | `{ forecastVersionId, projectId, designatedAt, designatedBy }` | Identify version selected for reporting |
| `ForecastVersionPublished` | Report publication finalizes version | `{ forecastVersionId, reportingMonth, runId, projectId, publishedAt }` | Record official published version |
| `GCGRUpdated` | PM edits GC/GR estimate | `{ forecastVersionId, divisionCode, categoryCode, priorValue, newValue, editedBy, editedAt, projectId }` | Audit GC/GR changes |
| `BuyoutLineExecuted` | Buyout line status → ContractExecuted | `{ buyoutLineId, projectId, vendorName, contractAmount, savingsAmount, executedAt }` | Alert team subcontract finalized; flag savings if present |
| `BuyoutSavingsDispositioned` | PM completes savings disposition | `{ buyoutLineId, projectId, destination, amount, dispositionedBy, dispositionedAt }` | Track savings treatment |
| `CashFlowProjectionUpdated` | PM edits cash flow month | `{ forecastVersionId, projectId, month, inflows, outflows, netFlow, updatedAt }` | Track projection updates |
| `ReconciliationConditionResolved` | PM resolves ambiguous line match | `{ conditionId, projectId, resolution, resolvedCanonicalLineId, resolvedBy, resolvedAt }` | Audit identity resolution |

### 14.2 Health Spine Metrics

| Metric | Type | Updated | Purpose |
|--------|------|---------|---------|
| `projectedOverUnder` | number (USD) | On forecast confirmation | Primary cost health indicator; sign: positive = favorable |
| `profitMargin` | percentage | On forecast confirmation | Trend indicator; alert if < 5% |
| `estimatedCostAtCompletion` | number (USD) | On forecast confirmation | Total project cost forecast |
| `totalCostExposureToDate` | number (USD) | On import/confirmation | Combined actuals + commitments |
| `percentBuyoutCompleteDollarWeighted` | percentage | On buyout line execution | Dollar-weighted procurement progress |
| `totalRealizedBuyoutSavings` | number (USD) | On buyout execution | Savings recognized to date |
| `totalUndispositionedSavings` | number (USD) | On savings event | Savings awaiting PM action |
| `peakCashRequirement` | number (USD) | On cash flow confirmation | Working capital need |
| `cashFlowAtRisk` | number (USD) | On cash flow confirmation | Cumulative deficit risk |
| `buyoutToCommittedCostsReconciliation` | variance % | On buyout execution or import | Acceptable if < 5% variance |

### 14.3 Work Queue Items

| Item Type | Condition | Assigned To | Actionable |
|-----------|-----------|-------------|------------|
| `BudgetReconciliationRequired` | Any `BudgetLineReconciliationCondition` is `Pending` | PM | Resolve ambiguous line matches |
| `ForecastChecklistIncomplete` | Working version checklist < 100% required items | PM | Complete checklist and confirm |
| `BudgetLineOverbudget` | `projectedOverUnder < -(10% × revisedBudget)` | PM | Raise forecast or change order |
| `NegativeProfitForecast` | `currentProfit < 0` on confirmed version | PM + PE | Review and mitigation plan |
| `CashFlowDeficit` | Any month with `projectedNetCashFlow < 0` | PM | Secure working capital |
| `BuyoutOverbudget` | Buyout line `overUnder > 0` | PM | Negotiate or raise change order |
| `UndispositionedBuyoutSavings` | `IBuyoutSavingsDisposition.undispositionedAmount > 0` | PM | Disposition savings |
| `BuyoutComplianceGateBlocked` | Status transition to `ContractExecuted` blocked by Subcontract Compliance gate | PM | Complete subcontract compliance checklist |

---

## 15. Executive Review Annotation Scope

Per P3-E1 §9.1 and P3-E2 §3.4, the Financial module is a review-capable surface. Portfolio Executive Reviewers may place annotations on **any confirmed Financial version** within their governed scope. Annotations are review-layer only and never become a mutation path for Financial source-of-truth records.

### 15.1 Reviewable versions

PER may annotate any `ConfirmedInternal` or `PublishedMonthly` version. PER does **not** have access to `Working` versions — the PM's working draft state is never visible to PER.

### 15.2 Annotation targets

PER annotations may be placed on the following anchor types (requires `@hbc/field-annotations` section/block anchor support — see §18 Blocker B1):

- Budget line item field-level anchors: `forecastToComplete`, `estimatedCostAtCompletion`, `projectedOverUnder`, `notes`
- Forecast Summary section-level anchors: cost summary, contingency summary, profit summary
- GC/GR section-level and line-level anchors
- Cash flow block-level anchors (by month range or aggregate)
- Buyout section-level and line-level anchors

### 15.3 Annotation isolation (from P3-E2 §3.4)

| Rule | Description |
|------|-------------|
| **Isolation** | Annotations are stored exclusively in `@hbc/field-annotations`; no annotation data is written to any Financial source-of-truth record |
| **No mutation** | No annotation may trigger a write, edit, or validation override of any Financial record |
| **Visibility** | Restricted to the review circle before PER explicitly pushes to the project team per P3-D3 |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13 |

### 15.4 Version-aware annotation anchors

Annotation anchors must include the forecast version to ensure stability across the version ledger:

```typescript
interface IFinancialAnnotationAnchor {
  forecastVersionId: string;       // Which confirmed version this annotation targets
  anchorType: 'field' | 'section' | 'block';
  canonicalBudgetLineId?: string;  // For line-level anchors; uses canonical (stable) ID
  fieldKey?: string;               // For field-level anchors (e.g., 'forecastToComplete')
  sectionKey?: string;             // For section-level anchors (e.g., 'contingency-summary')
  blockKey?: string;               // For block-level anchors (e.g., 'cash-flow-q2-2026')
}
```

Using `canonicalBudgetLineId` (not `budgetImportRowId`) ensures annotations survive re-imports and remain valid across version derivations.

### 15.5 Annotation carry-forward on version derivation

When a new working version is derived from a confirmed version that has open PER annotations:

1. For each open annotation on the source confirmed version, the system checks whether the anchor resolves on the new version:
   - `(forecastVersionId=new, canonicalBudgetLineId=same, fieldKey=same)` — if the canonical line and field still exist in the new version, the anchor resolves.
   - If the anchor does not resolve (line removed, key no longer exists), a `AnchorUnresolvable` carry-forward record is created.

2. For resolved anchors, a **carried-forward annotation** is created on the new version:
   ```typescript
   interface ICarriedForwardAnnotation {
     newAnnotationId: string;         // New UUID on the derived version
     sourceAnnotationId: string;      // Original annotation ID on source version
     sourceForecastVersionId: string;
     targetForecastVersionId: string;
     inheritanceStatus: 'Inherited';  // Starting state
     pmDispositionStatus: 'Pending';  // PM must disposition
     valueChangedFlag: boolean;       // True if the annotated value changed materially between versions
   }
   ```

3. **The original annotation remains on the original confirmed version.** It is not moved. The original version's annotation record is preserved for audit.

4. **PM disposition requirement:** For each `Inherited` carried-forward annotation, PM must disposition it before or at version confirmation:

   | PM Disposition | Meaning |
   |----------------|---------|
   | `Addressed` | PM has acted on the annotation concern in this new version |
   | `StillApplicable` | The concern still applies; PM has not yet addressed it |
   | `NeedsReviewerAttention` | PM wants to escalate back to PER for review |

5. **Value-change flag:** If the annotated field value changed materially between the source version and the new version, the system sets `valueChangedFlag = true` on the carry-forward record and suggests `Addressed` as the disposition — but does not auto-resolve. PM confirms the disposition explicitly.

6. **Unresolvable anchors:** For `AnchorUnresolvable` carry-forwards (line was removed), PM is notified but no disposition is required — the annotation is archived as unresolvable against the new version.

### 15.6 PER permissions on Financial

Aligned with P3-A2 and P3-F1 §8.5:

| Action | Permitted | Rules |
|--------|-----------|-------|
| View any confirmed Financial version | **Yes** | Within department scope; working version not visible |
| Annotate confirmed Financial versions | **Yes** | Via `@hbc/field-annotations` review layer; no mutation of Financial records |
| Push annotation to project team | **Yes** | Via P3-D3 §13 Push-to-Project-Team; creates work queue item |
| Generate reviewer-generated report run | **Yes** | Against the latest confirmed PM-owned snapshot per P3-F1 §8.6 |
| View report-candidate designation | **Yes** | Read-only |
| Edit Financial working state | **No** | PER has no access to working versions |
| Confirm a Financial version | **No** | Confirmation is PM/PE-owned exclusively |
| Approve or release a report | **Project-policy governed** | Per-family authority governed by central project-governance policy record per P3-F1 §14 |

### 15.7 Annotation workflow

1. PER views a `ConfirmedInternal` or `PublishedMonthly` version.
2. PER opens annotation panel; selects field, section, or block anchor.
3. PER types annotation; saved to `@hbc/field-annotations` with anchor metadata per §15.4.
4. PM receives Work Queue item: "New annotation on Financial version [N] by [PER name]."
5. PM views annotation in context; responds via annotation reply interface.
6. If PM derives a new working version, open annotations carry forward per §15.5.
7. PM dispositions carried-forward annotations before confirming the new version.

---

## 16. Acceptance Gate Reference

The Financial Module delivery is subject to Acceptance Gate §18.5 "Financial Items" from P3-H1.

**Gate §18.5 Updated Financial Module Criteria:**

- [ ] Budget line identity model (§2) implemented: `canonicalBudgetLineId`, `fallbackCompositeMatchKey`, `budgetImportRowId`, identity resolution on import
- [ ] Budget line reconciliation conditions (§2.5) created for ambiguous matches; PM workflow to resolve
- [ ] Separated cost model (§3.1): `jobToDateActualCost`, `committedCosts`, `costExposureToDate` distinct and correctly sourced
- [ ] FTC validation corrected (§3.4, §12.2): `>= 0` enforced; no invalid lower bound tied to past spend
- [ ] Forecast ledger versioning (§4): Working / ConfirmedInternal / PublishedMonthly / Superseded lifecycle implemented
- [ ] No "unlock in place" behavior: confirmed versions are immutable; edit requires derivation of new working version
- [ ] Budget import creates new derived working version (§4.4); prior versions intact
- [ ] Report-candidate designation (§4.6) implemented; designation visible to PER
- [ ] Checklist is version-scoped (§6.2); each new working version starts with empty checklist
- [ ] GC/GR model (§7) version-scoped; editable on working versions only
- [ ] Cash Flow model (§8) version-scoped; editable on working versions only
- [ ] Buyout model (§9) procurement-centered; dollar-weighted completion metric
- [ ] Buyout savings tracking (§9.5): savings recognized on `ContractExecuted` when below budget
- [ ] Buyout savings disposition workflow (§9.6): three destinations; Work Queue item for undispositioned savings
- [ ] Subcontract Compliance gate (§9.3) enforced; P3-E12 integration verified
- [ ] Sign convention (§10) consistent throughout; positive = favorable for projectedOverUnder
- [ ] Version-aware annotation anchors (§15.4) implemented with `canonicalBudgetLineId` + field/section/block key
- [ ] Annotation carry-forward (§15.5) on version derivation; PM disposition workflow implemented
- [ ] PER can annotate any confirmed version (not just published); working version not visible to PER
- [ ] Spine events (§14.1) published correctly; version-scoped events include `forecastVersionId`
- [ ] Health spine metrics (§14.2) updated; separated cost model metrics present
- [ ] Work Queue items (§14.3) implemented; including `BudgetReconciliationRequired` and `UndispositionedBuyoutSavings`
- [ ] A/R Aging (§8.5) read-only display integrated
- [ ] Budget CSV import < 10 seconds for 500 lines; UI response < 500ms for forecast edits
- [ ] Integration with Schedule module (milestones) verified
- [ ] Integration with Health spine (metrics) verified
- [ ] Integration with P3-F1 (report candidate → published version flow) verified
- [ ] User acceptance testing passed with 2+ sample projects
- [ ] Unit tests: > 85% code coverage on calculation and identity resolution logic
- [ ] Integration tests: import, identity resolution, versioning, savings disposition workflows

---

## 17. Field Summary Index

**Quick reference — alphabetical.**

| Field Name | Section | Type | Editable |
|------------|---------|------|----------|
| approvedCOs | 3.1 | number | No |
| approvedDaysExtensions | 5.2 | integer | Yes (working) |
| arAgeId | 8.5 | string | No (read-only) |
| budgetCode | 3.1 | string | No |
| budgetCodeDescription | 3.1 | string | No |
| budgetImportRowId | 3.1 | string | No |
| budgetModifications | 3.1 | number | No |
| buyoutLineId | 9.1 | string | No |
| buyoutSavingsAmount | 9.1 | number | No (calculated) |
| canonicalBudgetLineId | 3.1 | string | No |
| cashFlowAtRisk | 8.3 | number | No (calculated) |
| committedCosts | 3.1 | number | No |
| contractAmount | 9.1 | number | Yes |
| costExposureToDate | 3.1 | number | No (calculated) |
| costType | 3.1 | CostType | No |
| cumulativeCashFlow | 8.1 | number | No (calculated) |
| currentContingency | 5.4 | number | Yes (working) |
| currentContractValue | 5.3 | number | Yes (working) |
| currentProfit | 5.3 | number | No (calculated) |
| damageClauseLDs | 5.1 | string | Yes (working) |
| derivedFromVersionId | 4.3 | string | No |
| derivationReason | 4.3 | ForecastDerivationReason | No |
| divisionCode | 9.1 | string | No |
| estimatedCostAtCompletion (line) | 3.1 | number | No (calculated) |
| estimatedCostAtCompletion (summary) | 5.3 | number | No (calculated) |
| expectedContingencyAtCompletion | 5.4 | number | Yes (working) |
| expectedContingencyUse | 5.4 | number | No (calculated) |
| externalSourceLineId | 3.1 | string \| null | No |
| externalSourceSystem | 3.1 | string | No |
| fallbackCompositeMatchKey | 3.1 | string | No |
| forecastAccuracy | 8.1 | number \| null | No (calculated) |
| forecastToComplete | 3.1 | number | **Yes (working only)** |
| forecastVersionId | 4.3 | string | No |
| gcEstimateAtCompletion (GC/GR line) | 7.1 | number | **Yes (working)** |
| gcEstimateAtCompletion (summary) | 5.5 | number | No (calculated) |
| gcGrId | 7.1 | string | No |
| gcVariance | 7.1 | number | No (calculated) |
| grEstimateAtCompletion | 7.1 | number | **Yes (working)** |
| grVariance | 7.1 | number | No (calculated) |
| importBatchId | 3.1 | string | No |
| importedAt | 3.1 | string | No |
| isReportCandidate | 4.3 | boolean | Yes (PM designation) |
| jobToDateActualCost | 3.1 | number | No |
| loiDateToBeSent | 9.1 | string \| null | Yes |
| loiReturnedExecuted | 9.1 | string \| null | Yes |
| netCashFlow | 8.1 | number | No (calculated) |
| notes (buyout) | 9.1 | string \| null | Yes |
| notes (GC/GR) | 7.1 | string \| null | Yes |
| notes (cash flow) | 8.1 | string \| null | Yes |
| notes (line) | 3.1 | string \| null | Yes (working) |
| originalBudget (budget line) | 3.1 | number | No |
| originalBudget (buyout) | 9.1 | number | No |
| originalContingency | 5.4 | number | No |
| originalContractCompletion | 5.2 | string | No |
| originalContractValue | 5.3 | number | No |
| originalEstimatedCost | 5.3 | number | No |
| originalGCEstimate | 5.5 | number | No |
| originalProfit | 5.3 | number | No |
| originalBuyoutSavings | 5.3 | number | No |
| overUnder (buyout) | 9.1 | number \| null | No (calculated) |
| peakCashRequirement | 8.3 | number | No (calculated) |
| pendingBudgetChanges | 3.1 | number | No |
| pendingCostChanges | 3.1 | number | No |
| percentBuyoutCompleteDollarWeighted | 9.4 | number | No (calculated) |
| priorForecastToComplete | 3.1 | number \| null | No |
| profitMargin | 5.3 | number | No (calculated) |
| projectId | 3.1 | string | No |
| projectedBudget | 3.1 | number | No (calculated) |
| projectedCosts | 3.1 | number | No (calculated) |
| projectedNetCashFlow | 8.2 | number | No (calculated) |
| projectedOverUnder | 3.1 | number | No (calculated) |
| publishedAt | 4.3 | string \| null | No |
| reportingMonth | 4.3 | string \| null | No |
| retainage | 8.5 | number | No (read-only) |
| retentionHeld | 8.1 | number | No |
| revisedBudget | 3.1 | number | No (calculated) |
| revisedContractCompletion | 5.2 | string | No (calculated) |
| savingsDispositionStatus | 9.1 | BuyoutSavingsDispositionStatus | No |
| staleBudgetLineCount | 4.3 | number | No (calculated) |
| status (buyout) | 9.1 | BuyoutLineStatus | Yes |
| subcontractChecklistId | 9.1 | string \| null | Yes |
| subcontractorVendorName | 9.1 | string | Yes |
| totalBudget (buyout) | 9.4 | number | No (calculated) |
| totalContractAmount | 9.4 | number | No (calculated) |
| totalInflows | 8.1 | number | No (calculated) |
| totalOutflows | 8.1 | number | No (calculated) |
| totalVariance (GC/GR) | 7.1 | number | No (calculated) |
| versionNumber | 4.3 | number | No |
| versionType | 4.3 | ForecastVersionType | No |

---

## 18. Shared Package Dependencies and Blockers

This section records explicit dependencies on shared packages and flags blockers that must be resolved before specific Financial module capabilities can be fully delivered.

### B1 — `@hbc/field-annotations` section/block anchor support

**Capability required:** Financial annotation anchors must target section-level and block-level elements (forecast summary sections, GC/GR divisions, cash flow blocks, buyout sections) in addition to classic form-field anchors. Per the Implementation Guide Stage 0.1 assessment (README.md §Stage 0.1), this gap was confirmed and remediation was delivered in `@hbc/field-annotations` v0.2.0 via `AnchorType` discriminator (`'field' | 'section' | 'block'`) and `HbcAnnotationAnchor` wrapper component.

**Status:** Resolved. Section/block anchor support is available. Financial module implementation may proceed with full annotation targeting.

### B2 — `@hbc/my-work-feed` provenance fields for Push-to-Project-Team

**Capability required:** When PER pushes a Financial annotation to the project team, the work queue item must carry full provenance: `originRole: 'portfolio-executive-reviewer'`, `originAnnotationId`, `originReviewRunId`, `pushTimestamp`. Per Stage 0.3 assessment, this gap was confirmed and remediation was delivered in `@hbc/my-work-feed` v0.0.37.

**Status:** Resolved. Provenance-carrying work items are supported. Financial PER push workflow may proceed.

### B3 — Procore API direct integration for `externalSourceLineId`

**Capability required:** For stable external line identity without CSV, the preferred identity path uses the Procore budget line item native `id` field. This requires a direct Procore API integration that does not currently exist.

**Status:** Not yet available. Current CSV import path uses `fallbackCompositeMatchKey` for cross-import identity. The identity model (§2) is designed to be forward-compatible: when Procore API integration becomes available, `externalSourceLineId` is populated and takes precedence over composite fallback matching. No current blocker to Financial module delivery; composite fallback covers the CSV path fully.

### B4 — P3-F1 report candidate → `PublishedMonthly` version handoff

**Capability required:** When a report run is finalized (P3-F1 `ReportRunStatus: released`), the Financial module must receive an event or callback to transition the `isReportCandidate = true` confirmed version to `PublishedMonthly` and set `publishedAt` + `publishedByRunId`. This is a cross-module integration point between the Financial module and the Reports module.

**Status:** Integration contract not yet defined in P3-F1. **This requires a cross-file follow-up in P3-F1 to specify the module snapshot publication handoff event.** See §19.1 below.

---

## 19. Cross-File Follow-Up Notes

The following gaps in sibling documents were identified during this specification pass. They are recorded here for the responsible parties to address; they do not block Financial module specification but affect cross-module integration correctness.

### 19.1 P3-F1 — Module snapshot publication handoff event

P3-F1 defines report generation and publication (§6, §7, §8) but does not specify how report publication notifies source modules to finalize their report-candidate version as `PublishedMonthly`. Financial requires this handoff to close the version lifecycle (§4.5). P3-F1 should define a `ReportPublishedEvent` or equivalent callback with `{ runId, reportingMonth, confirmedSnapshotId }` that modules consuming it can use to promote the relevant confirmed version to `PublishedMonthly`.

### 19.2 P3-F1 — PER review of confirmed internal versions vs. published-only

P3-F1 §8.5 defines PER report permissions primarily in terms of viewing runs in the run-ledger. It does not explicitly address whether PER may annotate a `ConfirmedInternal` version that is not yet the `PublishedMonthly` version. P3-E4 §15.1 resolves this for the Financial module (PER may annotate any confirmed version). P3-F1 should align its PER permissions language to match this broader definition.

### 19.3 P3-D2 / P3-D3 — Separated cost model metrics and buyout savings

The Health spine (P3-D2) and Work Queue (P3-D3) contracts were authored before the separated cost model and buyout savings tracking were defined. The new metrics in §14.2 (`totalCostExposureToDate`, `totalRealizedBuyoutSavings`, `totalUndispositionedSavings`) and the new Work Queue items in §14.3 (`BudgetReconciliationRequired`, `UndispositionedBuyoutSavings`) should be added to the relevant sections of P3-D2 and P3-D3 as Financial module contributions.

### 19.4 P3-G1 — Dollar-weighted buyout metric and savings disposition in lane capability matrix

P3-G1 §4.1 lists the Financial module's SPFx and PWA capabilities. The buyout savings disposition workflow (§9.6) involves modal approval steps that are PWA-native. SPFx should escalate to PWA for savings disposition. This escalation path should be added to P3-G1 §4.1 as a "Launch-to-PWA" capability for buyout savings disposition.

### 19.5 P3-H1 — Acceptance gate §18.5 update

P3-H1 §18.5 "Financial Items" acceptance gate criteria reflect the prior simpler model. The gate criteria in §16 above are the updated version. P3-H1 §18.5 should be updated to replace the prior checklist with the one defined in §16 of this specification.

---

## 20. Data Import and Migration Strategy

For initial project setup and historical data backfill:

1. **Procore CSV bulk import** (§3.5, §13.1): One-time or recurring import; creates new derived working version each time
2. **Forecast Summary manual entry**: PM enters forecast summary fields on the initial working version
3. **GC/GR manual entry**: PM enters GC/GR lines via UI
4. **Cash flow manual entry or import**: PM enters 18-month forecast manually or via spreadsheet upload
5. **Buyout log manual entry**: PM populates buyout log incrementally as subcontracts are solicited
6. **A/R Aging sync**: Automated daily sync from accounting system; no manual entry

No single bulk import of the entire Financial model; data is populated progressively as the project runs. The version ledger begins with the initial working version (`derivationReason: 'InitialSetup'`) and builds from there.

---

**Document Version:** 2.0
**Last Updated:** 2026-03-23
**Authority:** Project Hub Leadership, Finance Workstream (P3-E), P3-H1 Acceptance Gates
