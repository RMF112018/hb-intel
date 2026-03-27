# BIP-02 — Budget Import Input, Normalization, Validation, and Identity Resolution

| Property | Value |
|----------|-------|
| **Doc ID** | BIP-02 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Input, Normalization, Validation, and Identity Resolution |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the front half of the Budget Import Pipeline: input contract, raw and normalized row handling, validation behavior, identity-resolution order, composite-key rules, and reconciliation doctrine.*

---

## 1. Input Contract

### 1.1 Current source seam

The current source seam is the transitional Procore budget export:

- `Procore_Budget.csv`

This remains valid until the future connector-backed read-model path replaces it.

### 1.2 Current row shape

The raw input contract is effectively `IBudgetImportRow`:

- string-based raw values
- CSV parser output, not yet trusted
- no direct assumption that numeric, enum, or tier fields are already valid

### 1.3 Required fields

At minimum, the current pipeline requires:

- `budgetCode`
- `budgetCodeDescription`
- `costType`
- `costCodeTier1`
- `originalBudget`

### 1.4 Important optional fields

| Field | Why it matters |
|------|----------------|
| `subJob` | Project phase or sub-job grouping |
| `costCodeTier2` | Detail hierarchy |
| `costCodeTier3` | Detail hierarchy |
| `budgetModifications` | Revised-budget calculation |
| `approvedCOs` | Revised-budget calculation |
| `pendingBudgetChanges` | Projected-budget calculation |
| `jobToDateActualCost` | Cost exposure calculation |
| `committedCosts` | Cost exposure calculation |
| `pendingCostChanges` | Projected-cost calculation |
| `forecastToComplete` | Optional imported FTC starting value |

---

## 2. Input Artifact Family

### 2.1 Recommended runtime artifacts

| Artifact | Purpose |
|---------|---------|
| `BudgetImportSession` | One user-initiated pipeline run |
| `BudgetImportFileArtifact` | Source-file identity, upload lineage, hash/checksum |
| `RawBudgetImportRow` | Immutable parsed row before normalization |
| `NormalizedBudgetImportRow` | Cleaned and typed row used by validation and matching |
| `BudgetImportValidationError` | Row-level or batch-level issue |
| `BudgetImportValidationReport` | Aggregate validation outcome for the session |

### 2.2 Why normalized rows should exist

A normalized row should exist as a first-class runtime artifact because it separates:

- raw CSV parsing
- cost-code cleanup
- tier extraction
- cost-type mapping
- numeric coercion
- composite-key generation

from final budget-line transformation.

---

## 3. Normalization Rules

### 3.1 Cost-code normalization

The current logic already normalizes cost codes by:

- trimming whitespace
- converting space-separated formats to hyphenated format
- extracting the code portion from tier values such as `03 - ESTIMATING`

### 3.2 Cost-type normalization

The current logic already supports:

- direct canonical value match
- prefix extraction before ` - `
- mapping through the Procore cost-type map to canonical `CostType`

### 3.3 Composite-key normalization

The fallback composite match key must remain:

```text
lowercase(trim(costCodeTier1) + '|' + trim(costType) + '|' + trim(budgetCode))
```

This algorithm should be treated as locked unless there is an intentional migration plan.

### 3.4 Numeric normalization

Current implementation behavior is effectively:

- empty numeric string → `0`
- invalid parse → `0` at transform helper level

That is acceptable for transformation, but the pipeline should preserve raw values in audit artifacts so import behavior remains explainable.

### 3.5 Recommended normalized-row fields

A normalized row should carry:

- normalized tier 1 / 2 / 3 codes
- canonical cost type
- trimmed budget code
- trimmed description
- parsed numeric fields
- fallback composite key
- source row linkage
- parse and normalize timestamps/version context

---

## 4. Validation Model

### 4.1 Validation goals

The validation layer exists to ensure:

- the batch is structurally sound
- required identifiers are present
- cost-code mapping is valid
- numeric fields are parseable enough for import
- duplicate budget codes are surfaced before execution

### 4.2 Current validation rules already implemented

Current source logic already validates:

- required budget code
- required budget-code description
- parseable valid cost type
- required cost-code tier 1
- tier-1 code existence against the cost-code dictionary
- `originalBudget` numeric validity
- `originalBudget` non-negative
- duplicate `budgetCode` within the batch

### 4.3 Recommended validation categories

| Category | Examples |
|---------|----------|
| Structural | unreadable file, missing expected headers, malformed rows |
| Required-field | missing code, description, cost type, tier 1 |
| Dictionary/lookup | invalid tier-1 code |
| Numeric coercion | invalid numeric format |
| Batch integrity | duplicate budget code |
| Governance | wrong project context, unsupported source metadata |
| Future connector path | source-ID inconsistencies once direct connector mode is active |

### 4.4 Validation report structure

A full runtime validation report should capture:

- session ID
- file artifact ID
- total row count
- valid row count
- invalid row count
- error count
- error list
- validator version
- validated timestamp
- overall valid/invalid flag

### 4.5 Atomicity rule

If validation fails:

- no budget lines are written
- no new Working version is created
- no prior Working version is superseded
- the session ends in a validation-failed terminal state

---

## 5. Identity Resolution Model

### 5.1 Identity-layer fields

| Field | Role |
|------|------|
| `canonicalBudgetLineId` | Stable Project Hub line identity |
| `externalSourceSystem` | Source authority label |
| `externalSourceLineId` | Preferred native-source line identity when available |
| `fallbackCompositeMatchKey` | Deterministic fallback identity |
| `budgetImportRowId` | Per-import-row lineage ID |

### 5.2 Resolution order

Identity resolution must remain:

1. **External source ID path**
   - If `externalSourceLineId` exists, match on `(externalSourceSystem, externalSourceLineId)`

2. **Fallback composite path**
   - If source line ID is absent, match on `fallbackCompositeMatchKey`

3. **Outcome**
   - unique match → reuse canonical line
   - no match → create new canonical line
   - multiple matches → create reconciliation condition

### 5.3 Why this order is correct

The external ID is more authoritative than a composite key. The composite key is required only because the current CSV seam often lacks the stable native line ID.

---

## 6. Reconciliation Doctrine

### 6.1 When reconciliation is required

Reconciliation is required whenever the incoming row matches multiple existing lines on the fallback composite key.

### 6.2 Why silent merge is prohibited

Silent merge risks incorrect inheritance of:

- prior FTC edit history
- line-level annotation anchors
- month-over-month continuity
- stale-state posture
- reviewer context

### 6.3 Recommended reconciliation artifacts

| Artifact | Purpose |
|---------|---------|
| `BudgetLineReconciliationCondition` | Existing ambiguous-match condition record |
| `BudgetIdentityResolutionRecord` | Per-row identity outcome ledger |
| `BudgetReconciliationDecision` | PM decision audit for `MergedInto` vs `CreatedNew` |

### 6.4 PM decision paths

PM should be able to choose:

- `MergedInto` — explicitly connect the row to an existing canonical line
- `CreatedNew` — explicitly create a new canonical line instead of inheriting history

### 6.5 Gating rule

A batch with unresolved reconciliation conditions must not be treated as confirmation-ready.

---

## 7. Recommended Identity and Transformation Artifacts

### 7.1 `BudgetIdentityResolutionRecord`

Recommended fields:

- session ID
- import batch ID
- row linkage
- outcome
- matched canonical line ID
- candidate canonical line IDs
- resolved canonical line ID
- resolution state
- resolved by
- resolved at

### 7.2 `BudgetImportTransformationRecord`

Recommended purpose:

- record how a normalized row became a final `BudgetLine`
- preserve import-time derived values
- preserve the exact canonical target used at execution time

---

## 8. CSV-to-Runtime Mapping Summary

### 8.1 Identity and hierarchy fields

| Source | Runtime Target |
|-------|----------------|
| Sub Job | `BudgetLine.subJob` |
| Cost Code Tier 1 | `BudgetLine.costCodeTier1` |
| Cost Code Tier 2 | `BudgetLine.costCodeTier2` |
| Cost Code Tier 3 | `BudgetLine.costCodeTier3` |
| Cost Type | `BudgetLine.costType` |
| Budget Code | `BudgetLine.budgetCode` |
| Budget Code Description | `BudgetLine.budgetCodeDescription` |

### 8.2 Budget and cost posture fields

| Source | Runtime Target |
|-------|----------------|
| Original Budget | `BudgetLine.originalBudget` |
| Budget Modifications | `BudgetLine.budgetModifications` |
| Approved COs | `BudgetLine.approvedCOs` |
| Pending Budget Changes | `BudgetLine.pendingBudgetChanges` |
| JTD Actual Cost | `BudgetLine.jobToDateActualCost` |
| Committed Costs | `BudgetLine.committedCosts` |
| Pending Cost Changes | `BudgetLine.pendingCostChanges` |
| Forecast To Complete | `BudgetLine.forecastToComplete` |

### 8.3 Derived fields at transformation time

| Derived Field | Formula |
|--------------|---------|
| `revisedBudget` | `originalBudget + budgetModifications + approvedCOs` |
| `projectedBudget` | `revisedBudget + pendingBudgetChanges` |
| `costExposureToDate` | `jobToDateActualCost + committedCosts` |
| `projectedCosts` | `costExposureToDate + pendingCostChanges` |
| `estimatedCostAtCompletion` | `costExposureToDate + forecastToComplete` |
| `projectedOverUnder` | `revisedBudget - estimatedCostAtCompletion` |
| default `forecastToComplete` | `max(0, revisedBudget - costExposureToDate)` |

---

## 9. Bottom-Line Recommendation

Treat the front half of the pipeline as a formal sequence of artifacts:

1. raw file intake
2. raw row parsing
3. normalized row creation
4. validation report
5. identity resolution record
6. reconciliation decision if needed
7. transformed budget-line output

That is a cleaner operational model than treating budget import as a single opaque utility call.

---

*Navigation: [BIP-03 Pipeline Stage, State, and Artifact Model →](BIP-03-Pipeline-Stage-State-and-Artifact-Model.md)*
