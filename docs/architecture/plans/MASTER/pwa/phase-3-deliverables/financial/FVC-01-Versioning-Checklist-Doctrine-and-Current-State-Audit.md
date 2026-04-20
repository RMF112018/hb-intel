# FVC-01 — Forecast Versioning + Checklist Doctrine and Current-State Audit

| Property | Value |
|----------|-------|
| **Doc ID** | FVC-01 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Doctrine and Current-State Audit |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the governing doctrine for Forecast Versioning + Checklist and reconciles that doctrine against present repo truth, the governing Financial plan family, and the current implementation state.*

---

## 1. Purpose

The Forecast Versioning + Checklist model exists to replace an informal, spreadsheet-centered, honor-system monthly forecast process with a governed forecast ledger that supports:

- working draft development
- immutable confirmation checkpoints
- official monthly publication
- clear PM / PER / Leadership access boundaries
- enforced pre-confirmation checklist discipline
- full historical continuity without unlock-in-place editing

---

## 2. Governing Doctrine

### 2.1 Non-negotiable design rules

| Rule | Meaning |
|------|---------|
| **Versioned ledger** | Forecast versions are never deleted and remain historically queryable |
| **One Working version at a time** | The project may have only one active Working draft at any given time |
| **No unlock in place** | Confirmed versions are never edited directly; PM must derive a new Working version |
| **Derived Working version model** | New work starts from an inherited prior state, not a blank rebuild |
| **Checklist is version-scoped** | Every new Working version starts with a fresh checklist instance |
| **Confirmation gate is enforced** | Required checklist items and staleness rules block confirmation |
| **Report-candidate designation is explicit** | At most one ConfirmedInternal version is the report candidate at a time |
| **PublishedMonthly is downstream-driven** | Final promotion is tied to report publication, not just PM intent |
| **PER never sees Working** | Working drafts are hidden from PER; PER annotates confirmed and published versions only |

### 2.2 Why this matters architecturally

Forecast Versioning + Checklist is not just a status tag on a row. It is the control system for:

- forecast immutability
- PM accountability
- review readiness
- annotation continuity
- publication lineage
- month-over-month auditability

If this model is weak, the Financial module becomes an editable spreadsheet clone rather than a governed operating surface.

---

## 3. Governing Repo Documents

### 3.1 Primary governing files

| File | Role |
|------|------|
| `P3-E4-T03-Forecast-Versioning-and-Checklist.md` | Primary contract for version states, derivation rules, confirmation lifecycle, report-candidate designation, checklist structure, and confirmation gate |
| `P3-E4-T09-Implementation-and-Acceptance.md` | Defines staged implementation, blockers, and acceptance criteria for versioning/checklist behavior |
| `FRC-02-Detailed-Crosswalk.md` | Maps the current forecast-summary/checklist process to the future runtime surfaces |
| `FRC-05-Field-Level-Mapping.md` | Deepens field and workflow mapping for checklist and lifecycle behavior |

### 3.2 What repo truth already locks

The current repo truth effectively locks the following:

- version states are `Working`, `ConfirmedInternal`, `PublishedMonthly`, `Superseded`
- only one Working version exists at a time
- confirmed versions are immutable
- a new Working version is created by derivation, not unlock
- checklist instances are regenerated for each new Working version
- report-candidate designation is explicit and singular
- final monthly publication is event-driven
- PER cannot see Working drafts

---

## 4. Live Repo-Truth Audit

### 4.1 What is already implemented in code

The repo already contains live source code for:

- `createInitialVersion()`
- `deriveWorkingVersion()`
- `transitionToSuperseded()`
- `confirmVersion()`
- `designateReportCandidate()`
- `promoteToPublished()`
- `resolveFinancialVersionAccess()`
- `validateConfirmationGate()`
- `generateChecklistForVersion()`

The repo also contains the canonical constants for:

- version states
- derivation reasons
- checklist groups
- the 19-item checklist template

### 4.2 What that means

The versioning/checklist core is already implemented beyond plan level. The remaining gap is not “what are the rules?” The remaining gap is the full runtime shell around those rules:

- surfaced version-history UX
- checklist interaction UX
- report-candidate and publication visibility
- runtime persistence and façade exposure
- integration with Financial pages and reports flow

---

## 5. Present-State vs Target-State

### 5.1 Present-state strengths

| Area | Current Strength |
|------|------------------|
| Version-state model | Strong |
| Derivation model | Strong |
| Confirmation transition logic | Strong |
| Access-control logic | Strong |
| Checklist template definition | Strong |
| Confirmation-gate core evaluation | Strong |

### 5.2 Present-state gaps

| Area | Current Gap |
|------|-------------|
| PWA version-history surface | Not yet proven as real runtime UX |
| Checklist working surface | Not yet proven as real PM workflow |
| Repository/runtime façade exposure | Not yet clearly operational end-to-end |
| Publication handoff completion | Stub exists, but full downstream integration remains pending |
| Full review/publication custody visibility | Still more implicit than surfaced |
| Cutover proof | No demonstrated replacement of the current monthly review process yet |

### 5.3 Key conclusion

The correct reading of repo truth is:

- **the core versioning and checklist engine is real**
- **the full runtime operational shell is still incomplete**

---

## 6. Operational Doctrine for the Version Ledger

### 6.1 Versioning is not just status labeling

The version ledger should distinguish:

- Working draft
- immutable internal checkpoint
- designated reporting candidate
- official published monthly version
- historical superseded versions

### 6.2 Derivation is not duplication for convenience

Derivation is the operating mechanism that protects immutability while allowing ongoing PM work.

### 6.3 Confirmation is not just a button click

Confirmation is a governed transition that depends on checklist completion and version readiness.

### 6.4 Checklist is not advisory

Required checklist items are not informational reminders. They are gate controls.

### 6.5 Publication is not the same as confirmation

ConfirmedInternal and PublishedMonthly are distinct. Confirmation is PM-side governance. Publication is downstream reporting finalization.

---

## 7. Recommended Doctrine Additions

These additions do not contradict repo truth. They formalize what is still operationally implicit.

### 7.1 `ForecastVersionLedgerView`

A runtime projection of the version history with candidate and publication context.

### 7.2 `ForecastVersionLifecycleEvent`

A first-class audit/event artifact for create, derive, confirm, designate, publish, and supersede actions.

### 7.3 `ChecklistCompletionLedger`

A durable per-version event/history record for checklist completion activity.

### 7.4 `ReportCandidateAuditRecord`

A dedicated record of when candidate designation changed and which version lost or gained candidate status.

### 7.5 `VersionPublicationHandoffRecord`

A first-class runtime record connecting the designated version to final publication outcome.

---

## 8. Audit Call

### 8.1 Repo truth is strong on the core engine

The state transitions, access rules, template generation, and confirmation gating are all already implemented in source.

### 8.2 Repo truth is moderate on operational seams

The package-level behavior is real, but the runtime façade and surfaced UX remain incomplete.

### 8.3 Repo truth is weak on full end-user operational proof

There is still no proven end-to-end runtime replacement for the current monthly PM and review workflow.

### 8.4 Overall assessment

**Assessment: strong versioning/checklist core, incomplete runtime operating shell**

That is the right basis for the next implementation step.

---

## 9. Recommended Next Move

The correct next move is not reopening the state model.

The correct next move is to build the runtime shell around the existing logic:

1. version-history surface
2. checklist working surface
3. candidate/publication visibility
4. façade/runtime exposure
5. lifecycle and audit visibility

---

*Navigation: [FVC-02 Version Ledger, Lifecycle, and State Model →](FVC-02-Version-Ledger-Lifecycle-and-State-Model.md)*
