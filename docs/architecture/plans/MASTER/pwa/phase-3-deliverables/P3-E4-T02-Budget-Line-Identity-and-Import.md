# P3-E4 — Financial Module: Budget Line Identity and Import

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4-T02 |
| **Parent** | [P3-E4 Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T02: Budget Line Identity and Import |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: budget line identity layers, identity resolution on import, reconciliation conditions, the complete budget line field table, the cost model, cost type enumeration, PM editing rules and provenance, and the CSV import workflow. See [T03](P3-E4-T03-Forecast-Versioning-and-Checklist.md) for forecast versioning and [T07](P3-E4-T07-Business-Rules-and-Calculations.md) for all calculated field formulas.*

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
| `externalSourceSystem` | **Source** | The governed upstream source that originated this line. Values: `'procore'` \| `'sage-intacct'` \| `'manual'`. Project Hub consumes these sources through published read models or governed repositories defined by `P1-F5` and `P1-F6`, even while current implementation reality still uses transitional CSV/import seams. |
| `externalSourceLineId` | **Source** | The native line-item identifier from the upstream source when available through the published read-model path. For current CSV imports, this is often `null` because the transitional export does not include a stable external ID. |
| `fallbackCompositeMatchKey` | **Fallback** | A deterministic composite string derived from `(costCodeTier1 + '|' + costType + '|' + budgetCode)` and normalized (trimmed, lowercased). Used for matching when `externalSourceLineId` is unavailable. Must be computed consistently on every import. |
| `budgetImportRowId` | **Import** | UUID generated per import row. Identifies this line as it arrived in a specific import batch. New ID on each import. Used for import audit trail and rollback, not for cross-import identity. |

### 2.3 Identity resolution on import

When a new budget import arrives:

1. **If `externalSourceLineId` is present** (connector-backed published read-model path): match on `(externalSourceSystem, externalSourceLineId)`. If matched, reuse the existing `canonicalBudgetLineId`. If no match, assign a new `canonicalBudgetLineId`.

2. **If `externalSourceLineId` is absent** (current CSV path): compute `fallbackCompositeMatchKey` for the incoming row. Attempt to match against existing lines for this project.
   - **Unique match**: reuse the existing `canonicalBudgetLineId`.
   - **No match**: assign a new `canonicalBudgetLineId`.
   - **Ambiguous match** (multiple existing lines share the same composite key): **do not silently inherit**. Create a `BudgetLineReconciliationCondition` record (§2.5). The line is held in a `ReconciliationRequired` state until PM resolves. Annotations and history from ambiguous-match lines are not inherited until resolution.

### 2.4 Annotation and history continuity

When a new confirmed version is derived from an existing confirmed version:
- All annotation anchor references pointing to a `(forecastVersionId, canonicalBudgetLineId, fieldKey)` triple are checked against the new version's line roster.
- Anchors that resolve cleanly carry forward as inherited annotations per T08 §8.5.
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

### 3.1 Complete field table

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source Column (Procore) | Business Rule / Formula |
|------------------------|-----------------|----------|------------|-------------------------|------------------------|
| `canonicalBudgetLineId` | `string` | Yes | See §2.3 | — | Stable project-level identifier per §2.2; persists across imports and versions |
| `externalSourceSystem` | `'procore' \| 'sage-intacct' \| 'manual'` | Yes | No | — | Source system identifier; `P1-F5` Procore and `P1-F6` Sage Intacct remain upstream authorities, though current implementation still includes transitional CSV/import seams |
| `externalSourceLineId` | `string \| null` | No | No | — | Native upstream line identifier when available through governed published read-model paths; may remain null for transitional CSV imports |
| `fallbackCompositeMatchKey` | `string` | Yes | Yes | — | Deterministic composite: `lowercase(costCodeTier1 + '|' + costType + '|' + budgetCode)`; computed on import |
| `budgetImportRowId` | `string` | Yes | Yes | — | UUID generated per import row; stable only within a single import batch |
| `projectId` | `string` | Yes | No | — | FK to project record |
| `subJob` | `string` | No | No | Sub Job | Cost center or phase code (e.g., "Phase 1A", "Building A") |
| `costCodeTier1` | `string` | Yes | No | Cost Code Tier 1 | First-level CSI category; validated against cost-code-dictionary.csv |
| `costCodeTier2` | `string` | No | No | Cost Code Tier 2 | Second-level detail; optional |
| `costCodeTier3` | `string` | No | No | Cost Code Tier 3 | Third-level detail; optional |
| `costType` | `CostType` | Yes | No | Cost Type | Enum: see §3.3 |
| `budgetCode` | `string` | Yes | No | Budget Code | Procore budget code; unique within project |
| `budgetCodeDescription` | `string` | Yes | No | Budget Code Description | Human-readable description (e.g., "Foundation Concrete Work") |
| `originalBudget` | `number` | Yes | No | Original Budget | Planned budget in USD; decimal to 2 places; must be > 0 |
| `budgetModifications` | `number` | Yes | No | Budget Modifications | Net budget add/remove in USD (can be positive or negative); cumulative |
| `approvedCOs` | `number` | Yes | No | Approved COs | Net approved change order adjustments; cumulative; can be negative (credit) |
| `revisedBudget` | `number` | Yes | Yes | — | **Calculated**: `originalBudget + budgetModifications + approvedCOs` |
| `pendingBudgetChanges` | `number` | Yes | No | Pending Budget Changes | Submitted but not yet approved change orders; can be positive or negative |
| `projectedBudget` | `number` | Yes | Yes | — | **Calculated**: `revisedBudget + pendingBudgetChanges` |
| `jobToDateActualCost` | `number` | Yes | No | Direct Costs / Actual | **Actual incurred cost** — invoiced and paid costs recognized to date; does NOT include committed-but-not-yet-invoiced; USD |
| `committedCosts` | `number` | Yes | No | Committed Costs | **Committed but not yet incurred** — executed subcontracts and purchase orders not yet invoiced; USD |
| `costExposureToDate` | `number` | Yes | Yes | — | **Calculated**: `jobToDateActualCost + committedCosts` — total financial exposure (actuals + obligations); USD |
| `pendingCostChanges` | `number` | Yes | No | Pending Cost Changes | Costs submitted for approval/allocation but not finalized; USD |
| `projectedCosts` | `number` | Yes | Yes | — | **Calculated**: `costExposureToDate + pendingCostChanges` |
| `forecastToComplete` | `number` | Yes | No | Forecast To Complete | **PM-EDITABLE IN WORKING VERSION ONLY** — PM's best estimate of total remaining cost to complete this line from today forward; USD; default = `max(0, revisedBudget - costExposureToDate)` |
| `estimatedCostAtCompletion` | `number` | Yes | Yes | — | **Calculated**: `costExposureToDate + forecastToComplete` |
| `projectedOverUnder` | `number` | Yes | Yes | Projected Over/Under | **Calculated**: `revisedBudget - estimatedCostAtCompletion`. **Positive = under budget (favorable); negative = over budget (unfavorable)** — see T07 §7.1 |
| `importedAt` | `string` | Yes | Yes | — | ISO 8601 timestamp of CSV import; immutable |
| `importBatchId` | `string` | Yes | Yes | — | UUID of import transaction; groups all lines from single upload |
| `lastEditedBy` | `string \| null` | No | No | — | userId of PM who last edited `forecastToComplete` in this version; null if not yet edited |
| `lastEditedAt` | `string \| null` | No | No | — | ISO 8601 timestamp of last `forecastToComplete` edit; null if not yet edited |
| `priorForecastToComplete` | `number \| null` | No | No | — | Previous value of `forecastToComplete` before current edit; enables audit trail; null on first edit |
| `notes` | `string \| null` | No | No | — | Optional PM notes about forecast rationale or issues |

### 3.2 Cost model explanation

The three cost fields represent distinct financial concepts that must never be blended:

| Field | What it means | Source |
|-------|---------------|--------|
| `jobToDateActualCost` | Money actually spent and recognized — invoiced, processed, and charged to this cost code | Procore / ERP via CSV or API |
| `committedCosts` | Money legally obligated but not yet invoiced — executed subcontracts and POs in flight | Procore / ERP via CSV or API |
| `costExposureToDate` | Total known financial obligation: `actualCost + committed` | Calculated |
| `forecastToComplete` | PM's estimate of all remaining cost from this point forward to project completion | PM-entered |
| `estimatedCostAtCompletion` | Total projected final cost: `exposure + remaining` | Calculated |

**Why the separation matters:** Treating committed costs as already-incurred costs produces a false picture of both current exposure and the remaining work estimate. FTC must represent actual future spend, not a residual after all commitments are subtracted.

### 3.3 Cost type enumeration

| Enum Value | Description |
|------------|-------------|
| `Labor` | Direct labor (wages, burden, payroll taxes) |
| `Material` | Materials, supplies, and consumables |
| `Equipment` | Equipment rental, purchase, or lease |
| `Subcontract` | Subcontractor and vendor invoices |
| `Other` | Miscellaneous or unclassified costs |

### 3.4 PM editing rules and provenance

**Editability is version-scoped:**
- `forecastToComplete` is PM-editable only in a working version.
- In a confirmed version, all fields are immutable.
- To edit after confirmation, PM must derive a new working version from the confirmed version (T03 §3.4) — there is no "unlock in place" operation.

**Edit provenance (per edit):**
- `lastEditedBy = userId`
- `lastEditedAt = now (UTC)`
- `priorForecastToComplete = prior value` (for audit)

**Validation on `forecastToComplete` edit:**
- Must be `>= 0`; system enforces. Negative remaining cost is not valid.
- No lower bound tied to past spend. The PM may forecast a remaining cost lower than the uncommitted budget if they believe work can be completed under budget. The system computes EAC and `projectedOverUnder` from the PM's input; it warns if EAC significantly exceeds `revisedBudget` but does not block the edit.
- System displays derived metrics (`estimatedCostAtCompletion`, `projectedOverUnder`) immediately on edit to give PM visual feedback.

### 3.5 Budget line import workflow

**CSV import process:**
1. PM uploads the current transitional budget import file via the Financial module UI until `P1-F5` / `P1-F6` published read-model providers replace this seam.
2. System validates all rows:
   - Required: `budgetCode`, `budgetCodeDescription`, `costType`, `originalBudget`
   - `costCodeTier1` validated against `cost-code-dictionary.csv` (7,566 records); import fails with specific line error if not found
   - `originalBudget` must be a positive decimal
   - Duplicate `budgetCode` within same import rejected
3. All rows from single import receive same `importBatchId`.
4. Identity resolution runs for each row per §2.3; reconciliation conditions created for any ambiguous matches.
5. System calculates all derived fields immediately.
6. `forecastToComplete` defaults to `max(0, revisedBudget - costExposureToDate)` per line.
7. Import creates a new **derived working version** per T03 §3.4 — prior working, confirmed, and published versions remain intact in the ledger.
8. Feedback: "Import created a new working version. [N] lines matched to existing canonical lines; [N] new lines created; [N] reconciliation conditions require PM review."
9. Atomic: on validation failure, no lines are written and no new version is created.

**Cost-code dictionary reference:**
- File: `cost-code-dictionary.csv`
- Structure: `stage | csi_code (XX-XX-XXX format) | csi_code_description`
- 7,566 valid cost codes; loaded into reference table at system startup
- Both `XX-XX-XXX` and `XX XX XX` (space-separated) formats accepted

---

*Navigation: [← T01 Module Doctrine](P3-E4-T01-Module-Doctrine-and-Authority.md) | [Master Index](P3-E4-Financial-Module-Field-Specification.md) | [T03 Forecast Versioning →](P3-E4-T03-Forecast-Versioning-and-Checklist.md)*
