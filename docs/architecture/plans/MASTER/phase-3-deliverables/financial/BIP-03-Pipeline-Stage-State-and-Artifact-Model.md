# BIP-03 — Budget Import Pipeline Stage, State, and Artifact Model

| Property | Value |
|----------|-------|
| **Doc ID** | BIP-03 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Stage, State, and Artifact Model |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the runtime stage model, state transitions, aggregate boundaries, and artifact family for the Budget Import Pipeline.*

---

## 1. Why a Pipeline Artifact Model Is Needed

The current repo already has import utilities, but a full runtime pipeline needs more than utility functions.

A real operational pipeline should be able to answer:

- who imported what
- when the file was uploaded
- what validation failed
- which rows matched vs. created vs. required reconciliation
- what reconciliation decisions were made
- which Working version was derived
- whether stale-state or confirmation gating changed
- whether the import was replayed, rolled back, or superseded later

---

## 2. Recommended Aggregate Family

### 2.1 BudgetImportSessionAggregate

**Root**

- `BudgetImportSession`

**Purpose**

Tracks one user-initiated import run from intake through terminal outcome.

**Child or related artifacts**

- `BudgetImportFileArtifact`
- `BudgetImportValidationReport`
- `BudgetIdentityResolutionRecord[]`
- `BudgetImportExecutionRecord`
- `BudgetImportAuditEvent[]`

### 2.2 BudgetImportBatchAggregate

**Root**

- `BudgetImportBatch`

**Purpose**

Captures one batch of imported rows and their row-level outcomes.

**Child artifacts**

- `RawBudgetImportRow[]`
- `NormalizedBudgetImportRow[]`
- `BudgetImportTransformationRecord[]`
- `BudgetLineReconciliationCondition[]`

### 2.3 BudgetIdentityResolutionAggregate

**Root**

- `BudgetIdentityResolutionRecord`

**Purpose**

Preserves per-row identity decisions and, where needed, PM reconciliation outcomes.

### 2.4 BudgetImportExecutionAggregate

**Root**

- `BudgetImportExecutionRecord`

**Purpose**

Represents the final execution result of the session:

- counts
- created and matched results
- reconciliation count
- derived Working version
- stale effects
- completion or failure posture

---

## 3. Runtime Artifact Catalog

### 3.1 `BudgetImportSession`

| Field | Purpose |
|------|---------|
| `sessionId` | Top-level session identity |
| `projectId` | Project scope |
| `initiatedBy` | User who started the import |
| `initiatedAt` | Start timestamp |
| `sourceType` | CSV, connector, replay |
| `state` | Session-level pipeline state |
| `targetWorkingVersionId` | Populated when derivation succeeds |
| `resultSummary` | Human-readable completion summary |

### 3.2 `BudgetImportFileArtifact`

| Field | Purpose |
|------|---------|
| `fileArtifactId` | Source artifact identity |
| `sessionId` | Session linkage |
| `fileName` | Uploaded/imported file name |
| `fileHash` | Deduping and replay evidence |
| `uploadedAt` | Upload timestamp |
| `parserVersion` | Parser build/version context |
| `sourceMetadata` | Connector/source context when available |

### 3.3 `RawBudgetImportRow`

| Field | Purpose |
|------|---------|
| `rawRowId` | Raw-row identity |
| `sessionId` | Session linkage |
| `rowIndex` | Original CSV row index |
| `rawPayload` | Original row data as received |
| `parsedAt` | Parse timestamp |

### 3.4 `NormalizedBudgetImportRow`

| Field | Purpose |
|------|---------|
| `normalizedRowId` | Normalized-row identity |
| `rawRowId` | Raw-row linkage |
| `normalizedCostCodeTier1` | Extracted and normalized value |
| `normalizedCostType` | Canonical enum value |
| `normalizedBudgetCode` | Cleaned code |
| `fallbackCompositeMatchKey` | Deterministic identity string |
| `numericFields` | Parsed numeric values |
| `normalizedAt` | Timestamp |

### 3.5 `BudgetImportValidationReport`

| Field | Purpose |
|------|---------|
| `validationReportId` | Validation-report identity |
| `sessionId` | Session linkage |
| `valid` | Pass/fail |
| `rowCount` | Total rows |
| `validRowCount` | Rows passing row-level validation |
| `errorCount` | Total errors |
| `errors[]` | Row-level/batch-level validation issues |
| `validatedAt` | Timestamp |

### 3.6 `BudgetIdentityResolutionRecord`

| Field | Purpose |
|------|---------|
| `resolutionRecordId` | Identity-resolution identity |
| `normalizedRowId` | Input-row linkage |
| `outcome` | matched, new, ambiguous |
| `matchedCanonicalBudgetLineId` | Reused canonical ID when matched |
| `candidateCanonicalLineIds[]` | Ambiguous candidates |
| `resolvedCanonicalLineId` | Final canonical line after decision |
| `resolutionState` | auto-resolved, pending, PM-resolved |
| `resolvedBy` | PM actor where required |
| `resolvedAt` | Timestamp |

### 3.7 `BudgetLineReconciliationCondition`

This should remain the active runtime condition record for ambiguous outcomes.

### 3.8 `BudgetImportTransformationRecord`

| Field | Purpose |
|------|---------|
| `transformationRecordId` | Transformation identity |
| `normalizedRowId` | Source linkage |
| `canonicalBudgetLineId` | Final canonical target |
| `derivedFields` | Snapshot of derived values at import time |
| `transformedAt` | Timestamp |

### 3.9 `BudgetImportExecutionRecord`

| Field | Purpose |
|------|---------|
| `executionRecordId` | Final execution identity |
| `sessionId` | Session linkage |
| `importBatchId` | Batch linkage |
| `linesMatched` | Count |
| `linesCreated` | Count |
| `reconciliationConditionsCreated` | Count |
| `targetWorkingVersionId` | Derived Working version |
| `priorWorkingVersionId` | Prior version superseded if applicable |
| `executedAt` | Timestamp |
| `executionOutcome` | success, validation-failed, reconciliation-pending, execution-failed |

### 3.10 `BudgetImportAuditEvent`

| Field | Purpose |
|------|---------|
| `auditEventId` | Event identity |
| `sessionId` | Session linkage |
| `eventType` | file-uploaded, batch-validated, identity-resolved, reconciliation-resolved, execution-completed, execution-failed, replayed, rolled-back |
| `actor` | User/system actor |
| `occurredAt` | Timestamp |
| `details` | Structured context |

### 3.11 `BudgetImportVersionDerivationRecord`

| Field | Purpose |
|------|---------|
| `derivationRecordId` | Identity |
| `sessionId` | Import linkage |
| `sourceVersionId` | Prior version |
| `targetVersionId` | New Working version |
| `derivationReason` | `BudgetImport` |
| `supersededVersionId` | Prior Working version if superseded |
| `derivedAt` | Timestamp |

---

## 4. Pipeline Stage Model

### 4.1 Recommended stages

| Stage | Description |
|------|-------------|
| `DraftIntake` | Session created, file not yet accepted |
| `FileAccepted` | Source file accepted and artifact created |
| `Parsed` | Raw rows parsed from source |
| `Normalized` | Cleaned and typed normalized rows created |
| `Validated` | Validation report created successfully |
| `ValidationFailed` | Validation failed; terminal without write |
| `IdentityResolved` | All rows have identity outcomes |
| `ReconciliationPending` | One or more ambiguous rows require PM decision |
| `ReadyToExecute` | Validation passed and all reconciliation resolved |
| `Executing` | Transform, write, and version-derive underway |
| `Executed` | Budget lines written and import result completed |
| `VersionDerived` | New Working version established |
| `Completed` | Full pipeline terminal success |
| `ExecutionFailed` | Runtime failure after validation |
| `RolledBack` | Execution reversed or compensated |
| `Replayed` | Historical batch replayed under governed conditions |

### 4.2 Why this is broader than the current code

The current utilities are effectively synchronous:

- validate
- process
- return result

That is sufficient for code-level correctness, but a real runtime pipeline benefits from user-visible states and auditable transitions.

---

## 5. Pipeline Flow

### 5.1 High-level flow

```text
User starts import
  ↓
FileAccepted
  ↓
Parsed
  ↓
Normalized
  ↓
Validated
  ├─ invalid → ValidationFailed
  └─ valid
       ↓
IdentityResolved
  ├─ ambiguous rows exist → ReconciliationPending
  └─ no ambiguity
       ↓
ReadyToExecute
  ↓
Executing
  ↓
Executed
  ↓
VersionDerived
  ↓
Completed
```

### 5.2 Reconciliation branch

```text
IdentityResolved
  ↓
ReconciliationPending
  ↓ PM resolves all pending rows
ReadyToExecute
  ↓
Executing
```

### 5.3 Failure branch

```text
Executing
  ↓ runtime write/derivation failure
ExecutionFailed
  ↓ if compensation succeeds
RolledBack
```

---

## 6. Version-Derivation Relationship

### 6.1 Import does not stand alone

A successful Budget import is not complete until it produces a new Working forecast version.

### 6.2 Why derivation needs its own artifact

A first-class derivation record makes it possible to see:

- which prior version the import acted upon
- which new version resulted
- whether the prior Working version was superseded
- exactly when the version boundary changed

---

## 7. Runtime Gating Rules

### 7.1 Validation gate

No write or version derivation before a valid batch.

### 7.2 Reconciliation gate

No execution while unresolved ambiguous rows exist.

### 7.3 Confirmation-readiness gate

Even after execution, unresolved stale or reconciliation-derived conditions should block confirmation.

### 7.4 Governance gate for replay and rollback

Replay and rollback should be explicitly governed and logged, never silently performed.

---

## 8. Recommended User-Facing Status View

A real pipeline surface should show:

| Element | Why |
|--------|-----|
| import session history | Users need to see prior runs |
| validation failures by row | Needed for correction and retry |
| reconciliation queue | Needed for ambiguous outcomes |
| matched / created / ambiguous counts | Needed for confidence in the run |
| target Working version created | Needed for continuity |
| stale-state and confirmation impact | Needed to understand downstream effects |
| audit trail | Needed for governance and troubleshooting |

---

## 9. Bottom-Line Recommendation

Formalize the Budget Import Pipeline as a real runtime artifact family, not just a function call that returns `IBudgetImportResult`.

That will allow the app to:

- surface progress and failures
- preserve evidence
- support PM reconciliation properly
- connect import activity to version history
- and retire the manual budget-reconciliation workflow safely

---

*Navigation: [BIP-04 Repository, Provider, and Persistence Seams →](BIP-04-Repository-Provider-and-Persistence-Seams.md)*
