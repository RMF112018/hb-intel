# BIP-05 — Budget Import Pipeline Gaps, Risks, and Implementation Readiness

| Property | Value |
|----------|-------|
| **Doc ID** | BIP-05 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Gaps, Risks, and Implementation Readiness |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file reconciles the proposed Budget Import Pipeline model against current repo truth and identifies what still must be completed before the budget import capability can operate as a true replacement for the current manual Procore budget workflow.*

---

## 1. Readiness Summary

### 1.1 What is already strong

| Area | Status |
|------|--------|
| Governing import contract | Strong |
| Identity model | Strong |
| Validation rules | Strong |
| Deterministic matching logic | Strong |
| Reconciliation-condition creation | Strong |
| Derived-field transformation | Strong |
| Atomic batch-execution logic | Strong |
| Acceptance criteria definition | Strong |

### 1.2 What is still blocking full runtime completion

| Area | Status |
|------|--------|
| PWA budget-import surface | Blocking |
| PM reconciliation UI | Blocking |
| Registered repository/runtime seam | Blocking |
| Persisted session/history model | High |
| Version-derivation artifact visibility | High |
| Replay/rollback governance | Medium |
| Cutover proof against live workflow | Medium |

---

## 2. Locked Decisions Supported by Repo Truth

These should be treated as effectively locked unless intentionally reopened.

### 2.1 CSV remains acceptable in Phase 3

The CSV seam is transitional, but valid for Phase 3. Direct Procore API identity is a future enhancement, not a current blocker.

### 2.2 Composite fallback identity is required now

Because CSV often lacks a stable external line ID, the fallback composite key is a required current-state mechanism.

### 2.3 Ambiguous identity requires explicit reconciliation

Silent merging is prohibited.

### 2.4 Successful import derives a new Working version

Import does not overwrite a governed version in place.

### 2.5 Validation failure is atomic

No partial writes and no partial version creation.

---

## 3. High-Impact Gaps

### 3.1 No real budget-import page yet

The repo logic exists, but there is still no actual Financial budget-import page in the PWA.

**Impact**

- PM cannot run the pipeline operationally
- reconciliation logic cannot be exercised in real workflow
- the import remains code-complete but surface-incomplete

### 3.2 No visible reconciliation workflow yet

The ambiguity model exists, but PM still lacks the surfaced workflow to resolve it.

**Impact**

- ambiguous rows remain theoretical more than operational
- confirmation-gating implications cannot be demonstrated cleanly

### 3.3 No clearly registered runtime seam

The utilities are implemented, but the full Financial repository/runtime exposure is not yet proven through the standard app access pattern.

**Impact**

- UI work risks bypassing intended architecture
- import logic risks being consumed ad hoc rather than through governed seams

### 3.4 No persisted session/history artifact family yet

The utilities return results but do not yet imply a durable runtime session ledger.

**Impact**

- weak auditability
- no replay/rollback governance
- weak cutover evidence

### 3.5 No cutover/parallel-run evidence yet

The pipeline is not yet proven against the real monthly PM process.

**Impact**

- workbook retirement remains premature
- confidence in the pipeline remains mostly design-level

---

## 4. Operational Risks

### 4.1 Identity drift risk

If normalization or composite-key construction changes later, canonical line continuity may break.

**Mitigation**

- lock the composite-key algorithm
- version the parser/normalizer
- store normalized-row and resolution artifacts

### 4.2 Hidden merge risk

If ambiguity handling is bypassed in UI or service code, incorrect canonical identity inheritance could corrupt line history.

**Mitigation**

- treat ambiguous outcomes as hard reconciliation requirements
- block execution or confirmation readiness where required
- audit every reconciliation decision

### 4.3 Utility-only implementation risk

If the pipeline remains only a utility layer, it will appear “done” in code but fail to replace the real PM operating behavior.

**Mitigation**

- build the runtime shell: page, status, reconciliation, history, execution evidence

### 4.4 Cutover trust risk

PMs may not trust the pipeline unless they can see:

- validation detail
- matched vs. new vs. ambiguous outcomes
- exact effects on the new Working version

**Mitigation**

- expose these outcomes clearly in the runtime surface
- preserve import-session history
- run parallel cycles before workbook retirement

### 4.5 Connector migration risk

When the future Procore API path arrives, the switch from composite-only to external-ID-first matching could change behavior unexpectedly.

**Mitigation**

- keep the identity-order contract explicit
- audit outcome differences during connector migration
- preserve compatibility for prior imported lines

---

## 5. Recommended Missing Runtime Artifacts

These are the most important operational additions beyond current repo truth:

| Artifact | Why it matters |
|---------|----------------|
| `BudgetImportSession` | Gives the pipeline a real runtime envelope |
| `BudgetImportFileArtifact` | Preserves source-file lineage |
| `NormalizedBudgetImportRow` | Makes normalization auditable and stable |
| `BudgetImportValidationReport` | Makes validation visible and reviewable |
| `BudgetIdentityResolutionRecord` | Makes row-level identity outcomes inspectable |
| `BudgetImportExecutionRecord` | Makes execution and derived-version results durable |
| `BudgetImportVersionDerivationRecord` | Ties the import directly to Financial versioning |
| `BudgetImportAuditEvent` | Creates a clean governance trail |

---

## 6. Recommended Sequencing

### 6.1 Minimum path to runtime readiness

| Step | Work Item |
|------|-----------|
| 1 | Formalize the session and artifact family |
| 2 | Register Financial import repository/runtime seams |
| 3 | Build PWA intake, validation preview, and reconciliation UI |
| 4 | Wire execution to Working-version derivation with visible outcomes |
| 5 | Add history, audit, replay, and rollback evidence |
| 6 | Run parallel monthly cycles against the current PM process |

### 6.2 Minimum path to workbook-retirement readiness

Workbook retirement should occur only after:

- multiple monthly imports succeed on live-like data
- identity and reconciliation outcomes are trusted by PMs
- import-created Working versions behave correctly in forecast workflow
- validation and reconciliation evidence is queryable afterward
- cutover procedures are documented and rehearsed

---

## 7. Overall Readiness Call

### 7.1 Ready now

The repo is ready now for:

- formalizing the Budget Import Pipeline package
- wiring repository/runtime seams
- building the runtime intake/reconciliation experience
- proving execution against live-like PM workflows

### 7.2 Not ready yet

The repo is not yet ready for:

- retiring the manual Procore budget workflow
- claiming end-to-end runtime replacement
- relying on the pipeline without a surfaced PM review and reconciliation loop

### 7.3 Overall assessment

**Assessment: strong deterministic core, incomplete operational shell**

That is a constructive and actionable position.

---

## 8. Final Recommendation

Treat the Budget Import Pipeline as one of the highest-leverage Financial implementation items.

Do not continue treating it as:

- only a background utility
- only a unit-tested import helper
- only a data-prep step behind the scenes

It is a first-class operating workflow and should be implemented that way.

---

*End of package*
