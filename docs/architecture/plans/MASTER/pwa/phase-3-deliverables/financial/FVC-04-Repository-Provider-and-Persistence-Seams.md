# FVC-04 — Forecast Versioning + Checklist Repository, Provider, and Persistence Seams

| Property | Value |
|----------|-------|
| **Doc ID** | FVC-04 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Repository, Provider, and Persistence Seams |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the recommended repository/provider seam model for Forecast Versioning + Checklist, with emphasis on preserving the current deterministic source logic while wrapping it in the runtime seams needed for a full operational workflow.*

---

## 1. Present-State Seam Reality

### 1.1 What exists

The repo currently has:

- version-lifecycle utility functions
- access-control logic
- confirmation-gate logic
- checklist-instance generation
- canonical constants for states, derivation reasons, and checklist template

### 1.2 What does not yet appear fully operational

The repo does not yet clearly prove:

- a surfaced Financial version-history façade
- a complete checklist working surface
- a visible candidate and publication history model
- a persisted lifecycle-event ledger
- a complete downstream publication handoff chain

### 1.3 Design implication

The correct implementation approach is:

- keep the current versioning and governance logic
- wrap it in explicit repository and runtime seams
- expose those seams to Financial pages and reporting flows

---

## 2. Recommended Seam Layers

### 2.1 UI-facing façade

#### Forecast Versioning façade within Financial

The UI should consume one coherent façade for:

- loading version history
- loading the current Working version
- deriving a new Working version
- toggling checklist items
- validating readiness
- confirming a version
- designating a report candidate
- viewing publication status

### 2.2 Version ledger seam

#### `ForecastVersionLedgerService`

**Owns**

- initial version creation
- version-history retrieval
- Working-version uniqueness
- supersession transitions
- derivation lineage queries

### 2.3 Checklist seam

#### `ForecastChecklistService`

**Owns**

- checklist instance generation
- checklist item toggling
- checklist note updates
- readiness projections
- version-scoped checklist retrieval

### 2.4 Confirmation seam

#### `ForecastConfirmationService`

**Owns**

- confirmation-attempt validation
- blocker list generation
- immutable transition to `ConfirmedInternal`
- confirmation audit records

### 2.5 Access-control seam

#### `ForecastVersionAccessService`

**Owns**

- PM, PER, Leadership state-based access resolution
- hidden-state handling for PER
- action-level allow/deny checks

### 2.6 Candidate designation seam

#### `ReportCandidateDesignationService`

**Owns**

- candidate designation
- clearing prior candidate
- candidate history
- candidate visibility projections

### 2.7 Publication seam

#### `ForecastPublicationHandoffService`

**Owns**

- waiting-for-publication posture
- published promotion handling
- report run linkage
- handoff success/failure records

### 2.8 Audit seam

#### `ForecastLifecycleAuditService`

**Owns**

- lifecycle event creation
- checklist event history
- confirmation-attempt history
- designation history
- publication history

---

## 3. Recommended Runtime Operations

### 3.1 Query operations

| Operation | Purpose |
|----------|---------|
| `getForecastVersionLedger(projectId)` | Returns version history |
| `getCurrentWorkingVersion(projectId)` | Returns current Working version and checklist |
| `getForecastChecklist(versionId)` | Returns checklist instance for a version |
| `getForecastReadiness(versionId)` | Returns blocker and readiness projection |
| `getCurrentReportCandidate(projectId)` | Returns current designated candidate |
| `getPublishedMonthlyVersions(projectId)` | Returns published history |

### 3.2 Mutation operations

| Operation | Purpose |
|----------|---------|
| `createInitialForecastVersion(projectId)` | Creates initial Working version |
| `deriveForecastWorkingVersion(sourceVersionId, reason)` | Creates new Working version from source |
| `toggleForecastChecklistItem(checklistId, completed)` | Updates checklist completion |
| `confirmForecastVersion(versionId)` | Attempts and, if valid, performs confirmation |
| `designateForecastReportCandidate(versionId)` | Sets candidate and clears prior holder |
| `promoteForecastToPublished(versionId, reportingMonth, runId)` | Finalizes publication outcome |

### 3.3 Existing source functions that should be wrapped, not replaced

| Existing Function | Recommended Host Seam |
|------------------|-----------------------|
| `createInitialVersion()` | `ForecastVersionLedgerService` |
| `deriveWorkingVersion()` | `ForecastVersionLedgerService` |
| `transitionToSuperseded()` | `ForecastVersionLedgerService` |
| `confirmVersion()` | `ForecastConfirmationService` |
| `designateReportCandidate()` | `ReportCandidateDesignationService` |
| `promoteToPublished()` | `ForecastPublicationHandoffService` |
| `resolveFinancialVersionAccess()` | `ForecastVersionAccessService` |
| `validateConfirmationGate()` | `ForecastConfirmationService` |
| `generateChecklistForVersion()` | `ForecastChecklistService` |

---

## 4. Persistence Model Implications

### 4.1 Why persistence matters here

Without explicit persistence and projections for versioning/checklist behavior, users lose:

- version history clarity
- derivation lineage visibility
- candidate designation history
- publication linkage
- confirmation attempt evidence
- checklist completion traceability

### 4.2 Recommended persistence families

| Family | Examples |
|-------|----------|
| Version ledger | `ForecastVersion` |
| Checklist instances | `ForecastChecklistItem`, checklist projections |
| Lifecycle event ledger | `ForecastVersionLifecycleEvent` |
| Confirmation ledger | `ConfirmationAttemptRecord` |
| Candidate history | `ReportCandidateAuditRecord` |
| Publication handoff | `VersionPublicationHandoffRecord` |
| Checklist activity ledger | `ChecklistCompletionLedger` |

### 4.3 What not to do

Avoid these shortcuts:

- treating version state as just a dropdown/status field
- storing only the current Working version
- hiding candidate history
- making publication outcome discoverable only through Reports
- regenerating checklist state without preserving how users got there

---

## 5. Provider Boundaries

### 5.1 Internal dependencies

| Dependency | Role |
|-----------|------|
| Budget import | Derives new Working versions |
| Forecast summary / GCGR / cash flow / buyout surfaces | Populate the Working version content being confirmed |
| Review annotations | Attach to confirmed and published versions |
| Reports module | Final publication trigger and run linkage |

### 5.2 Boundary rule

Versioning + Checklist owns:

- lifecycle control
- confirmation gating
- candidate designation
- version-level access posture

It does **not** own:

- all downstream review workflow details
- all report generation logic
- detailed per-surface edit logic for budget/summary/GCGR/cash flow/buyout

---

## 6. Recommended Implementation Order

| Priority | Step | Why |
|---------|------|-----|
| 1 | Formalize runtime façade around existing source logic | Makes the model consumable by the app |
| 2 | Build version-history and current-Working surfaces | Gives users a real runtime shell |
| 3 | Build checklist interaction and readiness UX | Makes confirmation operational |
| 4 | Add candidate/publication visibility | Makes the ledger meaningful across the monthly cycle |
| 5 | Add lifecycle and checklist audit history | Strengthens governance and troubleshooting |
| 6 | Close publication handoff integration | Completes the loop to PublishedMonthly |

---

## 7. Bottom Line

The correct seam strategy is:

- **preserve the current deterministic lifecycle and checklist functions**
- **wrap them in explicit runtime services and persisted projections**
- **surface them through a Financial versioning façade**
- **connect them to budget import, review annotations, and reports publication**

That will let Forecast Versioning + Checklist become a real operating subsystem instead of staying a package-level ruleset.

---

*Navigation: [FVC-05 Gaps, Risks, and Implementation Readiness →](FVC-05-Gaps-Risks-and-Implementation-Readiness.md)*
