# BIP-01 — Budget Import Pipeline Doctrine and Current-State Audit

| Property | Value |
|----------|-------|
| **Doc ID** | BIP-01 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Doctrine and Current-State Audit |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the governing doctrine for the Budget Import Pipeline and reconciles that doctrine against present repo truth, the governing Financial plan family, and the current workbook-driven operating process.*

---

## 1. Purpose

The Budget Import Pipeline exists to replace the current PM workflow of:

1. exporting `Procore_Budget.csv`
2. manually checking the file for completeness and obvious errors
3. comparing the CSV against the forecast workbook
4. manually deciding whether lines are the “same line” as prior periods
5. manually carrying budget and cost changes into the current monthly forecast process

The future pipeline must preserve the useful discipline in that workflow while removing manual reconciliation risk, inconsistent identity matching, hidden spreadsheet drift, and weak auditability.

---

## 2. Governing Doctrine

### 2.1 Non-negotiable design rules

| Rule | Meaning |
|------|---------|
| **Atomic import** | Validation failure causes zero writes and no new Working version |
| **Stable canonical identity** | `canonicalBudgetLineId` survives across imports and forecast versions |
| **External-ID-first matching** | `externalSourceLineId` outranks fallback composite matching whenever available |
| **Deterministic fallback matching** | The same normalized `(costCodeTier1 | costType | budgetCode)` input must always produce the same fallback identity behavior |
| **No silent ambiguous inheritance** | Ambiguous matches create explicit reconciliation conditions; they are never silently merged |
| **Derived Working version creation** | Successful import produces a new Working version instead of mutating a governed version in place |
| **Source lineage preservation** | Import batch and row lineage must remain visible after the import is complete |
| **Confirmation gating** | Unresolved stale/reconciliation conditions must block confirmation readiness |

### 2.2 Why the pipeline matters architecturally

The budget import is not just a file-upload utility. It is the primary bridge between:

- external budget and cost truth
- monthly forecast versioning
- budget-line identity continuity
- line-level annotations
- downstream summary, GC/GR, and cash-flow modeling

If this pipeline is weak, the rest of the Financial module becomes unreliable.

---

## Budget Import Operating Posture

Budget Import is a governed operational workflow, not a generic upload utility. The working surface must make clear who owns the import session, what can be corrected in-surface, what is authoritative from the source import, and what requires escalation or deeper reconciliation.

### Action Posture
**Primary actor**
- Project financial owner / designated project operations role

**Actionable here**
- initiate import
- review parsed source contents
- inspect mapping and normalization results
- review reconciliation status
- accept or reject import outcomes where permitted
- advance to deeper reconciliation workflow where required

**Escalate / deeper workflow**
- complex mismatch resolution
- authority conflicts
- cross-period correction
- source-system inconsistency resolution
- final approval where internal governance requires elevated custody

**View-only state**
- historical imports
- published or locked import snapshots
- imports under review by another actor where local mutation is not permitted

**Blocked / waiting conditions**
- unresolved source conflicts
- missing required mappings
- invalid project context
- stale reference data
- pending internal review or confirmation

### Lane and Route Rule
Budget import may be entered from both lanes where appropriate, but multi-step reconciliation, recovery, and conflict resolution are governed as PWA-rich workflow behavior. Canonical project-scoped routes and recovery semantics are controlled by `FIN-03` and `FIN-04`.

### Governing Reference
- `FIN-02_Action-Posture-and-User-Owned-Work-Matrix.md`
- `FIN-03_Lane-Ownership-Matrix.md`
- `FIN-04_Route-and-Context-Contract.md`

---

## 3. Governing Repo Documents

### 3.1 Primary governing files

| File | Role |
|------|------|
| `P3-E4-T02-Budget-Line-Identity-and-Import.md` | Primary contract for budget line identity, reconciliation, field table, and CSV workflow |
| `P3-E4-T09-Implementation-and-Acceptance.md` | Defines staged implementation, blockers, acceptance criteria, and current contract/runtime status |
| `FRC-02-Detailed-Crosswalk.md` | Maps `Procore_Budget.csv` to the future `/financial/budget` surface and runtime seams |
| `FRC-05-Field-Level-Mapping.md` | Deepens the mapping with exact field/workflow alignment and gap inventory |

### 3.2 What those governing files already lock

The current repo truth already locks the following decisions:

- CSV is acceptable in Phase 3 as a transitional seam
- `externalSourceLineId` is the future-preferred path but is not required now
- fallback composite matching is required in the current CSV path
- ambiguous matches require a reconciliation condition
- successful import creates a new derived Working version
- validation failure must remain atomic

---

## 4. Live Repo-Truth Audit

### 4.1 What is already implemented in code

The repo already contains live source code for the import engine core:

- deterministic line-identity resolution
- reconciliation-condition creation
- row transformation into budget lines
- atomic import execution
- cost-code normalization and dictionary validation
- duplicate detection
- cost-type parsing
- pure derived-field computors for budget and cost posture

### 4.2 What that means

The Budget Import Pipeline is stronger in repo truth than the current Financial UI surface.

The import core is already beyond “plan only” status. It exists as code. The real remaining work is to wrap that code in a complete operational runtime shell.

---

## 5. Present-State vs Target-State

### 5.1 Present-state strengths

| Area | Current Strength |
|------|------------------|
| Identity model | Strong |
| Validation rules | Strong |
| Deterministic matching logic | Strong |
| Derived-field logic | Strong |
| Acceptance criteria | Strong |
| Crosswalk to workbook process | Strong |

### 5.2 Present-state gaps

| Area | Current Gap |
|------|-------------|
| Runtime surface | No real PWA budget-import experience |
| Reconciliation workflow | No surfaced PM resolution experience yet |
| Repository exposure | Full runtime façade not yet clearly wired end-to-end |
| Session/history model | No formal persisted import session ledger proven |
| Replay and rollback governance | Not yet formalized as runtime behavior |
| Cutover proof | No demonstrated replacement of the live monthly PM workflow yet |

### 5.3 Key conclusion

The correct reading of repo truth is:

- **the import engine is real**
- **the runtime pipeline envelope is still incomplete**

That is a good place to be. The remaining work is operationalization, not reinvention.

---

## 6. Operational Doctrine for the Pipeline

### 6.1 Intake is not execution

The system should distinguish:

- file accepted
- batch parsed
- batch validated
- identity resolved
- reconciliation pending
- batch executed
- version derived
- completed

### 6.2 Validation is not identity resolution

A row may be structurally valid and still require reconciliation before it can safely inherit canonical history.

### 6.3 Identity resolution is not version derivation

Matching or creating canonical budget lines is a prerequisite. It is not itself the creation of the new Working version.

### 6.4 Reconciliation is not optional cleanup

Any ambiguous match is a first-class operating condition. It is not a nice-to-have afterthought.

### 6.5 Execution is a governed runtime action

Successful import should create durable evidence of:

- what file was imported
- what rows were accepted
- what identities were reused or created
- what reconciliation decisions were made
- what Working version resulted
- what confirmation-readiness impacts were produced

---

## 7. Recommended Doctrine Additions

These additions do not contradict repo truth. They formalize what is still operationally implicit.

### 7.1 `BudgetImportSession`

Top-level record for one user-initiated import run.

### 7.2 `BudgetImportFileArtifact`

File-level lineage record for file name, checksum/hash, parser version, and actor context.

### 7.3 `NormalizedBudgetImportRow`

Runtime artifact for cleaned, typed, normalized row state before final transformation.

### 7.4 `BudgetImportValidationReport`

First-class record for row-level and batch-level validation outcomes.

### 7.5 `BudgetIdentityResolutionRecord`

Per-row identity-outcome record: matched, new, or ambiguous.

### 7.6 `BudgetImportExecutionRecord`

Execution record for counts, timestamps, result posture, and target Working version.

### 7.7 `BudgetImportAuditEvent`

Unified event ledger for file acceptance, validation, reconciliation, execution, replay, rollback, and failure.

---

## 8. Audit Call

### 8.1 Repo truth is strong on the engine

The import logic is already implemented and deterministic.

### 8.2 Repo truth is moderate on runtime seams

The surrounding repository/runtime model is still not fully proven through the app.

### 8.3 Repo truth is weak on user-facing surfacing

There is still no complete runtime workflow for PMs to drive and trust the pipeline operationally.

### 8.4 Overall assessment

**Assessment: strong import-core implementation, incomplete runtime pipeline envelope**

That should drive the next phase of work.

---

## 9. Recommended Next Move

The correct next move is not more design-only work on matching rules.

The correct next move is to build the runtime shell around the existing logic:

1. session and file artifact model
2. validation preview
3. reconciliation queue
4. execution and derivation visibility
5. history and audit surface

---

*Navigation: [BIP-02 Input, Normalization, Validation, and Identity Resolution →](BIP-02-Input-Normalization-Validation-and-Identity-Resolution.md)*
