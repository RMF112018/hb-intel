# Financial Action Boundary and Mutation Control

| Field | Value |
|---|---|
| **Doc ID** | Financial-ABMC |
| **Document Type** | Action Boundary and Mutation Control |
| **Owner** | Architecture lead |
| **Created** | 2026-03-28 |
| **Status** | Active — governs action permissions, mutation categories, cross-tool rules, and invalidation chains |
| **References** | [Financial-SOTEC](Financial-Source-of-Truth-and-Entity-Control.md); [Financial-LMG](Financial-Lifecycle-and-Mutation-Governance.md); [Financial-RGC](Financial-Runtime-Governance-Control.md); [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md); [Control Index](Financial-Doctrine-Control-Index.md) |

---

## 1. Purpose

This document defines the explicit action permissions, mutation categories, cross-tool write/read rules, and invalidation chains for the Financial module. It answers: for each role in each state, what actions are allowed, what mutations result, what downstream effects cascade, and what audit consequences follow.

**Enforcement principle:** These rules must be enforced in domain service layers (per Financial-LMG §9), not trusted to UI behavior alone.

---

## 2. Role × State Permission Matrix

### 2.1 Forecast Version–Scoped Actions

Per Financial-LMG §4 and `resolveFinancialVersionAccess`.

**System-initiated actions** (not in the role×state matrix below): `createInitialVersion` (T1 — when no versions exist), `promoteToPublished` (T5 — P3-F1 handoff), `transitionToSuperseded` (T6 — on derive or period close). These are system operations that bypass the role check — they are triggered programmatically, not by user action.

| Action | PM + Working | PM + Confirmed | PM + Published | PM + Superseded | PER + Working | PER + Confirmed | PER + Published | PER + Superseded | Leadership (all states) |
|--------|-------------|---------------|---------------|----------------|--------------|----------------|----------------|-----------------|----------------------|
| **Read** | Yes | Yes | Yes | Yes | **Hidden** | Yes | Yes | Yes | Yes |
| **Edit fields** | Yes | No | No | No | No | No | No | No | No |
| **Edit checklist** | Yes | No | No | No | No | No | No | No | No |
| **Confirm** | Yes (if gate passes) | No | No | No | No | No | No | No | No |
| **Derive new Working** | No | Yes | Yes | No | No | No | No | No | No |
| **Designate candidate** | No | Yes | No | No | No | No | No | No | No |
| **Annotate** | No | No | No | No | No | Yes | Yes | No | No |
| **Disposition annotation** | No | Yes | Yes | No | No | No | No | No | No |

### 2.2 Buyout Actions (Project-Scoped)

| Action | PM | PER | Leadership |
|--------|-----|-----|-----------|
| **View buyout lines** | Yes | Yes | Yes |
| **Create buyout line** | Yes | No | No |
| **Edit buyout line** | Yes | No | No |
| **Advance status** | Yes (gate-checked) | No | No |
| **Create savings disposition** | Yes | No | No |
| **View disposition** | Yes | Yes | Yes |

### 2.3 Budget Import Actions (Session-Scoped)

| Action | PM | PER | Leadership |
|--------|-----|-----|-----------|
| **Upload CSV** | Yes | No | No |
| **View validation results** | Yes | No (import is PM workflow) | No |
| **Resolve reconciliation condition** | Yes | No | No |
| **View import history** | Yes | Yes | Yes |

### 2.4 Publication Actions (Project-Scoped)

| Action | PM | PER | Leadership | System |
|--------|-----|-----|-----------|--------|
| **Designate report candidate** | Yes (on ConfirmedInternal) | No | No | No |
| **Promote to Published** | No | No | No | Yes (P3-F1 handoff) |
| **View publication status** | Yes | Yes | Yes | — |
| **Create export run** | Yes | No | No | Yes |
| **Download export artifact** | Yes | Yes | Yes | — |

---

## 3. Mutation Categories

Every Financial write operation falls into exactly one of these categories. Repository implementations must classify and guard accordingly.

| Category | What Changes | Who Can Trigger | Guard Level |
|----------|-------------|-----------------|------------|
| **Authoritative source mutation** | Imported external data (budget CSV, actuals, A/R, commitments) | System (import pipeline) | Import-only; no user-initiated writes to source fields |
| **Working-state mutation** | PM-editable fields on Working version (FTC, checklist, GC/GR lines, cash flow forecast months) | PM only | Version must be Working; per Financial-LMG §4 access matrix |
| **Enrichment mutation** | Internal annotation fields on external records (commitment enrichment) | PM only | Core external fields remain read-only |
| **Lifecycle transition** | Version state change (confirm, derive, designate, promote, supersede) | PM or System (per transition) | Per Financial-LMG §2.2 transition rules |
| **Confirmation gate evaluation** | Gate pass/fail determination | System (on PM confirm attempt) | G1–G4 validators per Financial-LMG §3 |
| **Review-state transition** | Custody state change (submit, accept, return, approve) | PM or PER (per custody state) | Per Financial-LMG §10 (not yet implemented) |
| **Annotation mutation** | PER annotation on confirmed/published versions; PM disposition of carried-forward annotations | PER (annotate) or PM (disposition) | Version must be Confirmed or Published; PER hidden from Working |
| **Publication action** | Report-candidate designation, P3-F1 promotion, export run | PM (designate) or System (promote/export) | One candidate per project; immutable after publication |
| **Derived recomputation** | Forecast summary, GC/GR variance, cash flow cumulative, buyout metrics | System (automatic on read after upstream mutation) | No direct writes to derived fields |
| **Audit append** | FinancialAuditEvent, import audit events, custody records | System (automatic on significant actions) | Append-only; never edited or deleted |

---

## 4. Cross-Tool Action Rules

Actions in one Financial tool can affect the state, readiness, or validity of another. These cross-tool dependencies must be enforced, not merely displayed.

### 4.1 Budget Import → Forecast Readiness

| Import Event | Effect on Forecast | Enforcement |
|-------------|-------------------|-------------|
| New import creates ambiguous matches | `staleBudgetLineCount` increments on Working version | **Blocks confirmation gate** (G3) until PM resolves all conditions |
| Import changes budget baseline values | Derived forecast summary fields become stale | Auto-recompute on next read |
| Import batch completes successfully | **Spine publication required:** Activity Spine `BudgetImported` event (mandatory per Financial-SSIC §7.1) | Adapter must publish after batch execution |
| Import on confirmed version | Forces derivation of new Working version (reason: `BudgetReImport`) | Cannot import directly into Confirmed/Published |

### 4.2 Forecast Changes → Cash Flow / Publication

| Forecast Event | Effect | Enforcement |
|---------------|--------|-------------|
| FTC edit on budget line | Forecast summary `estimatedCostAtCompletion`, `currentProfit`, `profitMargin` stale | `IForecastSummaryRepository` recomputes on read |
| Checklist item unchecked | Confirmation gate G2 fails | Blocks `confirmVersion()` |
| Version confirmed | Cash flow projections may reference confirmed data; **spine publication required:** Activity Spine `ForecastVersionConfirmed` + Health Pulse metric snapshot (mandatory per Financial-SSIC §7.1/§7.2) | Publication eligibility evaluates confirmed version |
| Version designated as candidate | Prior candidate loses flag | One-candidate-per-project rule enforced by `designateReportCandidate()` |

### 4.3 GC/GR → Forecast Summary

| GC/GR Event | Effect | Enforcement |
|------------|--------|-------------|
| GC/GR line edit | GC/GR variance recalculates; forecast summary GC/GR subtotal stale | `IGCGRRepository` recomputes variance; `IForecastSummaryRepository` recomputes rollup |
| GC/GR posture invalid | Confirmation gate G4 may fail (when implemented) | Blocks confirmation if GC/GR posture is not computable |

### 4.4 Buyout → Forecast / Cash Flow

| Buyout Event | Effect | Enforcement |
|-------------|--------|-------------|
| Buyout status advance | Dollar-weighted completion metric changes; **spine publication required on ContractExecuted:** Activity Spine `BuyoutLineExecuted` + Health Pulse buyout metrics (mandatory per Financial-SSIC §7.1/§7.2) | `IBuyoutRepository` recomputes; may affect forecast exposure assessment |
| Savings disposition created | Affects contingency / forecast treatment | Three-destination allocation per Financial-LMG §5.3 |
| ContractExecuted gate failure | Buyout cannot advance | P3-E13 compliance blocks status transition |

### 4.5 Review → Version / Publication

| Review Event | Effect | Enforcement |
|-------------|--------|-------------|
| PER returns version for revision | Creates derivation reason `ReturnedForRevision`; PM must derive new Working | Prior Confirmed version remains immutable |
| PER approves | Unlocks report-candidate designation (when review custody implemented) | Approval is prerequisite for publication eligibility |
| Annotation carry-forward on derivation | Inherited annotations require PM disposition | PM sees `pmDispositionStatus: 'Pending'` on carried annotations |

### 4.6 Publication → Audit / History

| Publication Event | Effect | Enforcement |
|-----------------|--------|-------------|
| Version promoted to Published | `PublicationRecord` created; prior Published for same period becomes Superseded | Immutable after promotion; triggers P3-F1 callback |
| Export run created | `FinancialExportRun` appended | Append-only evidence record |
| Any significant action | `FinancialAuditEvent` appended | System-generated; immutable |

---

## 5. State-Based Action Blocking

Actions are blocked by specific states. This table is the authoritative blocking reference.

| Blocked Action | Blocking Condition | Why |
|---------------|-------------------|-----|
| Edit any version-scoped field | Version is not Working | Derivation-first lifecycle; no unlock-in-place |
| Confirm version | Checklist incomplete (G2) — 15 of 19 required items not `completed: true` | Required items not done (4 of 19 are optional per LMG §3.2) |
| Confirm version | Stale budget lines (G3) | Unresolved reconciliation conditions |
| Confirm version | GC/GR posture invalid (G4) | Summary cannot compute (when implemented) |
| Derive from Superseded | Version is Superseded | Can only derive from Confirmed or Published |
| PER view Working version | PER role + Working state | PER hidden from draft data |
| Annotate Working version | Version is Working | Annotation requires Confirmed or Published |
| Advance buyout to ContractExecuted | Gate fails | Subcontract checklist incomplete or waiver not approved |
| Import into Confirmed/Published | Version is not Working | Import creates/modifies budget lines; requires mutable version |
| Edit closed cash flow month | Month is in closed period | Period-close immutability |
| Delete audit event | Always blocked | Audit events are permanent |
| Edit Working version after period close | Period is Closed | Period-close governance forces auto-confirm (if gate passes) or supersede (if gate fails) per LMG §11; `IFinancialPeriodRepository.closePeriod()` enforces |

---

## 6. Reopening and Rework Rules

| Scenario | Allowed? | Mechanism | Consequence |
|----------|----------|-----------|-------------|
| Reopen a Working version after edit | Yes (normal operation) | Continue editing | No lifecycle change |
| Reopen a Confirmed version for edits | **No** — derive new Working instead | `deriveWorkingVersion(source, reason)` | New Working created; source remains Confirmed |
| Reopen a Published version for edits | **No** — derive new Working instead | Same as above | New Working created; source remains Published |
| Reopen a closed period | **Governed exception** | Requires explicit authority per PH3-FIN-SOTL §13 | `IFinancialPeriodRepository` enforces reopen gate |
| Rework after PER return | PM derives new Working with reason `ReturnedForRevision` | Confirmed version stays immutable; annotations carry forward | PM must disposition inherited annotations |
| Re-import budget after confirmation | PM derives new Working with reason `BudgetReImport` | New Working has fresh import; prior Confirmed immutable | Reconciliation conditions may be regenerated |

---

## 7. Implementation Status

| Aspect | Stage | Evidence |
|--------|-------|----------|
| Role × state access matrix | Stage 3 | `resolveFinancialVersionAccess()` implements 12-cell matrix |
| Confirmation gate G1–G3 | Stage 3 | `validateConfirmationGate()` implements 3 of 4 validators |
| Confirmation gate G4 | Stage 1 | Doctrine-defined; blocked on T04 |
| ContractExecuted gate | Stage 3 | Buyout gate logic implemented and tested |
| Cross-tool invalidation | Stage 1 | Staleness detection for reconciliation conditions only; upstream cascade not wired |
| Review custody transitions | Stage 1 | Doctrine-defined in LMG §10; not yet implemented |
| Audit event generation | Stage 1 | Event type contracts defined (T08); no runtime generation |

---

## 8. Remaining Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | G4 summary validation not implemented | Confirmation can proceed with invalid GC/GR posture | Implement after T04 types complete |
| 2 | Cross-tool invalidation cascade not wired | Upstream changes don't automatically flag downstream staleness | Implement as part of repository wiring (Stage 4) |
| 3 | Review custody state machine not implemented | Review workflow is informal; no PER return or approval enforcement | Implement `FinancialReviewCustodyRecord` per LMG §10 |
| 4 | Audit event generation not implemented | Significant actions leave no permanent audit trail | Implement as system-generated side effect in repositories |
| 5 | Period-close enforcement not implemented | Cannot block edits on closed periods or enforce reopen governance | Implement `IFinancialPeriodRepository` close/reopen logic |
