# BIP-04 — Budget Import Repository, Provider, and Persistence Seams

| Property | Value |
|----------|-------|
| **Doc ID** | BIP-04 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Repository, Provider, and Persistence Seams |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the recommended repository/provider seam model for the Budget Import Pipeline, with emphasis on keeping the current deterministic import logic intact while wrapping it in the runtime seams needed for a full operational workflow.*

---

## 1. Present-State Seam Reality

### 1.1 What exists

The repo currently has:

- import utility functions
- validation utilities
- derived-field computors
- a detailed contract for the Budget Import Pipeline

### 1.2 What does not yet appear fully operational

The repo does not yet clearly prove:

- a registered Financial import façade in the standard data-access factory
- a user-facing budget-import query/mutation hook
- a persisted import-session ledger
- a replay/rollback governance seam
- a surfaced reconciliation workflow seam

### 1.3 Design implication

The correct implementation approach is:

- keep the current import logic functions
- wrap them with explicit repository and service seams
- expose those seams to runtime pages and workflows

---

## 2. Recommended Seam Layers

### 2.1 UI-facing façade

#### Budget Import façade within Financial

The UI should consume one coherent façade for:

- starting an import session
- validating a batch
- viewing reconciliation conditions
- resolving ambiguity
- executing the import
- viewing import history

### 2.2 Intake and source seam

#### `BudgetImportIntakeService`

**Owns**

- file acceptance
- source metadata capture
- file hash/checksum
- parser selection / parser version
- creation of `BudgetImportSession` and `BudgetImportFileArtifact`

### 2.3 Parse and normalize seam

#### `BudgetImportParseService`

**Owns**

- CSV parsing
- raw-row creation
- normalized-row creation
- coercion and cleanup behavior

### 2.4 Validation seam

#### `BudgetImportValidationService`

**Owns**

- row-level validation
- batch-level validation
- duplicate detection
- dictionary validation
- validation-report generation

### 2.5 Identity-resolution seam

#### `BudgetIdentityResolutionService`

**Owns**

- external-source-ID-first matching
- composite-key fallback matching
- identity-outcome creation
- ambiguous-match detection
- generation of `BudgetLineReconciliationCondition`

### 2.6 Reconciliation seam

#### `BudgetReconciliationService`

**Owns**

- PM reconciliation actions
- `MergedInto` vs `CreatedNew` decisions
- identity outcome finalization
- audit record generation for PM decisions

### 2.7 Transformation seam

#### `BudgetLineTransformationService`

**Owns**

- conversion from normalized rows into final `BudgetLine` records
- import-time derived-field calculation
- import-time provenance population

### 2.8 Execution seam

#### `BudgetImportExecutionService`

**Owns**

- atomic write orchestration
- creation of `BudgetImportBatch`
- creation/update of transformed budget lines
- failure handling
- execution-result generation

### 2.9 Version-derivation seam

#### `BudgetImportVersionDerivationService`

**Owns**

- creation of the new Working version
- marking the prior Working version as superseded where applicable
- linking the batch to the new version
- updating stale-state counts

### 2.10 Audit seam

#### `BudgetImportAuditService`

**Owns**

- `BudgetImportAuditEvent` creation
- replay and rollback logs
- operational evidence capture

---

## 3. Recommended Runtime Operations

### 3.1 Query operations

| Operation | Purpose |
|----------|---------|
| `getBudgetImportHistory(projectId)` | Returns prior sessions and outcomes |
| `getBudgetImportSession(sessionId)` | Returns one session with file, validation, and execution details |
| `getBudgetImportReconciliationQueue(projectId)` | Returns unresolved reconciliation conditions |
| `getLatestBudgetImportOutcome(projectId)` | Quick status for the current budget surface |
| `getBudgetImportValidationReport(sessionId)` | Returns validation detail |

### 3.2 Mutation operations

| Operation | Purpose |
|----------|---------|
| `startBudgetImportSession(projectId, file)` | Creates intake/session context |
| `validateBudgetImportSession(sessionId)` | Runs parse, normalize, and validate |
| `resolveBudgetImportReconciliation(conditionId, decision)` | Applies PM resolution |
| `executeBudgetImportSession(sessionId)` | Performs transform, write, and version derivation |
| `replayBudgetImportSession(sessionId)` | Governed replay of a historical batch |
| `rollbackBudgetImportExecution(executionId)` | Governed compensation or rollback path |

### 3.3 Existing utility functions that should be wrapped, not replaced

| Existing Function | Recommended Host Seam |
|------------------|-----------------------|
| `validateBudgetImportBatch()` | `BudgetImportValidationService` |
| `resolveLineIdentity()` | `BudgetIdentityResolutionService` |
| `createReconciliationCondition()` | `BudgetIdentityResolutionService` |
| `transformCsvRowToBudgetLine()` | `BudgetLineTransformationService` |
| `executeBudgetImport()` | `BudgetImportExecutionService` |

---

## 4. Provider Boundaries

### 4.1 Source providers

| Provider | Role |
|---------|------|
| Transitional Procore CSV export | Current input source |
| Future Procore connector / published read model | Future preferred source with `externalSourceLineId` |
| Cost-code dictionary reference | Validation dependency |

### 4.2 Internal module boundaries

| Internal Consumer / Dependency | Role |
|-------------------------------|------|
| Forecast versioning | Derive new Working version on import success |
| Financial budget surface | User-facing intake, error review, reconciliation, and results |
| Work queue / health / activity | Publish import and reconciliation outcomes where appropriate |
| Review and annotation model | Preserve canonical identity continuity for line-level anchors |

### 4.3 Provider rule

The import pipeline should treat upstream source files/connectors as externally authoritative for imported budget fields, but not authoritative for PM-owned working-state fields already captured inside the current Financial version.

---

## 5. Persistence Model Implications

### 5.1 Why persistence matters here

Without explicit persistence for pipeline artifacts, users lose:

- import history
- validation evidence
- reconciliation decisions
- replay/rollback traceability
- confidence in derived version lineage

### 5.2 Recommended persistence families

| Family | Examples |
|-------|----------|
| Session ledger | `BudgetImportSession`, `BudgetImportFileArtifact` |
| Row lineage | `RawBudgetImportRow`, `NormalizedBudgetImportRow` |
| Validation ledger | `BudgetImportValidationReport`, `BudgetImportValidationError` |
| Identity/reconciliation ledger | `BudgetIdentityResolutionRecord`, `BudgetLineReconciliationCondition`, `BudgetReconciliationDecision` |
| Execution ledger | `BudgetImportExecutionRecord`, `BudgetImportVersionDerivationRecord` |
| Audit/event ledger | `BudgetImportAuditEvent` |

### 5.3 What not to do

Avoid these shortcuts:

- treating file upload as the only audit record
- storing only the final `IBudgetImportResult`
- folding reconciliation decisions into notes fields
- relying only on the new Working version as proof that an import happened
- making import history unrecoverable after the next import

---

## 6. Runtime Composition Pattern

### 6.1 Validation-preview flow

```text
IntakeService
  + ParseService
  + ValidationService
  + IdentityResolutionService
  = preview state shown to PM before execution
```

### 6.2 Reconciliation flow

```text
IdentityResolutionService
  + ReconciliationService
  = resolution queue and PM decisions
```

### 6.3 Execution flow

```text
TransformationService
  + ExecutionService
  + VersionDerivationService
  + AuditService
  = committed import outcome
```

---

## 7. Recommended Implementation Order

| Priority | Step | Why |
|---------|------|-----|
| 1 | Formalize session and artifact model | Gives the utility code a runtime shell |
| 2 | Register repository/runtime seams | Makes the pipeline consumable by UI |
| 3 | Build validation preview and reconciliation experience | Needed before PMs can trust results |
| 4 | Wire execution to version derivation | Makes import a real Financial workflow |
| 5 | Add history, replay, and rollback evidence | Needed for governance and cutover confidence |
| 6 | Replace CSV seam with connector-backed source when ready | Future enhancement, not a Phase 3 prerequisite |

---

## 8. Bottom Line

The correct seam strategy is:

- **preserve the current deterministic import functions**
- **surround them with explicit runtime services and persisted artifacts**
- **surface them through a Financial import façade**
- **connect them to version derivation and audit history**

That will let the Budget Import Pipeline become a real operating subsystem instead of remaining an internal utility bundle.

---

*Navigation: [BIP-05 Gaps, Risks, and Implementation Readiness →](BIP-05-Gaps-Risks-and-Implementation-Readiness.md)*
