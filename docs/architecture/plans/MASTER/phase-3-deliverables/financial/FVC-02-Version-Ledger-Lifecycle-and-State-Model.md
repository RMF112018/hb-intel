# FVC-02 — Forecast Version Ledger, Lifecycle, and State Model

| Property | Value |
|----------|-------|
| **Doc ID** | FVC-02 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Version Ledger, Lifecycle, and State Model |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the Forecast Version ledger model, version states, derivation flow, lifecycle transitions, and the minimum runtime artifacts needed to make the versioning model fully operational.*

---

## 1. Why a Version Ledger Is Needed

The current financial forecasting process needs more than a “current forecast” record. A real operating model must preserve:

- the current Working draft
- prior confirmation checkpoints
- the designated report candidate
- the official published monthly version
- superseded history
- derivation lineage

Without a ledger, immutability and auditability break down.

---

## 2. Canonical Version States

### 2.1 Locked version states

| State | Meaning | Editability |
|------|---------|-------------|
| `Working` | Current PM draft | Fully PM-editable |
| `ConfirmedInternal` | Immutable PM-confirmed checkpoint | Immutable |
| `PublishedMonthly` | Official monthly published version | Immutable |
| `Superseded` | Historical version replaced by later activity | Immutable |

### Runtime Action Consequences

**Editable by**
- [Insert owning role(s) permitted to mutate records in this state]

**Read-only for**
- [Insert roles who may view but not mutate]

**Escalation required for**
- [Insert actions that require review custody, publication authority, or deeper routed workflow]

**Blocked conditions**
- [Insert the conditions under which advancement or mutation is blocked]

**Route / context requirement**
- This state must remain bound to canonical project-scoped routing and durable financial context. State changes must not break deep-linkability, version continuity, or project-safe recovery behavior.

**Surface expectation**
- The user must be able to identify from the working surface whether the version is actionable here, read-only, awaiting confirmation, awaiting publication, or superseded.

### Governing Reference
This state behavior is governed by:
- `FIN-02_Action-Posture-and-User-Owned-Work-Matrix.md`
- `FIN-04_Route-and-Context-Contract.md`

### 2.2 States that should NOT become version enums

These should remain workflow or runtime conditions, not new version types:

| Candidate | Why it should not be a version enum |
|----------|--------------------------------------|
| `ReadyForReview` | Better represented by gate success and current Working status |
| `InReview` | Better represented by review custody/annotation context |
| `ReturnedForRevision` | Better represented by deriving a new Working version |
| `Reopened` | Better represented by derivation or review-custody workflow |
| `Archived` | Superseded / published history already covers retention |

---

## 3. Forecast Version Record

### 3.1 Core record

The current source contract already supports a strong version record with:

- version identity
- project identity
- version type
- version number
- reporting month
- derivation lineage
- candidate flag
- creation, confirmation, and publication timestamps
- stale budget-line count
- checklist completion timestamp
- notes

### 3.2 Why the current record is strong

It already captures the core lifecycle dimensions needed for:

- ledger history
- derivation tracing
- confirmation timing
- publication timing
- current staleness posture
- checklist completion visibility

---

## 4. Lifecycle Flow

### 4.1 High-level lifecycle

```text
Initial setup
  ↓
Working
  ↓ [confirmation gate passes]
ConfirmedInternal
  ↓ [designated as report candidate]
ConfirmedInternal (candidate = true)
  ↓ [report publication finalizes]
PublishedMonthly
```

### 4.2 Derivation path

```text
ConfirmedInternal or PublishedMonthly
  ↓ [PM needs to revise]
derive new Working version
  ↓
Working
```

### 4.3 Historical path

```text
prior Working or prior confirmed version
  ↓ [replaced by later version activity]
Superseded
```

---

## 5. Derivation Rules

### 5.1 When a new Working version is created

A new Working version should be created when:

- a successful budget import occurs
- PM explicitly derives from a confirmed version to continue editing
- schedule refresh or another governed reason triggers derivation
- PM intentionally creates a new Working version from current confirmed state

### 5.2 What is inherited into the derived Working version

The new Working version should inherit:

- budget-line state
- GC/GR lines
- cash-flow records
- forecast summary fields
- relevant annotation carry-forward behavior

### 5.3 What is NOT inherited

The new Working version should **not** inherit a completed checklist instance.

A fresh checklist instance should be generated for every new Working version.

### 5.4 Why unlock-in-place must remain prohibited

Unlock-in-place destroys:

- the value of immutable checkpoints
- clean report-candidate history
- annotation integrity
- month-over-month auditability

---

## 6. Confirmation Model

### 6.1 Confirmation transition

Confirmation is the transition:

- `Working` → `ConfirmedInternal`

### 6.2 What confirmation should mean

Confirmation should mean:

- PM has completed required checklist items
- PM is asserting readiness for review/reporting consideration
- the snapshot is now immutable
- PER can now see and annotate it
- PM must derive a new Working version to continue editing later

### 6.3 What confirmation should not mean

Confirmation should not mean:

- final monthly publication
- automatic report-candidate status
- approval by a different role
- permission to continue editing the same record

---

## 7. Report-Candidate Model

### 7.1 Why report candidate is separate

A project may have multiple ConfirmedInternal versions in a period. Only one should be the reporting candidate.

### 7.2 Candidate rules

| Rule | Meaning |
|------|---------|
| One candidate at a time | Setting a new candidate clears the prior candidate |
| Candidate must be confirmed | Only a ConfirmedInternal version is eligible |
| Candidate is explicit | PM must deliberately designate it |
| Candidate is visible | The UI should clearly indicate the current candidate |

### 7.3 Recommended candidate artifact

A `ReportCandidateAuditRecord` would make designation history more visible and queryable.

---

## 8. Publication Model

### 8.1 Publication transition

Publication is the transition:

- `ConfirmedInternal` candidate → `PublishedMonthly`

### 8.2 Why publication is distinct from confirmation

Confirmation is PM-side governance. Publication is downstream reporting finalization.

### 8.3 Current implementation posture

The source already contains a publication-promotion function, but full downstream event wiring remains an integration item.

### 8.4 Recommended publication artifact

A `VersionPublicationHandoffRecord` should preserve:

- which version was submitted as the candidate
- which report run finalized it
- whether publication succeeded or failed
- when publication occurred

---

## 9. Recommended Runtime Artifacts

### 9.1 `ForecastVersionLedgerView`

Projection of all versions for a project with:

- version number
- type
- created/confirmed/published timestamps
- candidate flag
- source derivation
- stale count
- checklist state

### 9.2 `ForecastVersionLifecycleEvent`

Event ledger for:

- initial version created
- Working version derived
- version confirmed
- candidate designated
- version published
- version superseded

### 9.3 `ReportCandidateAuditRecord`

Captures candidate designation changes.

### 9.4 `VersionPublicationHandoffRecord`

Captures the handoff from candidate to published result.

---

## 10. Bottom-Line Recommendation

The version ledger should be treated as a first-class runtime system, not just a set of status fields.

That means the app should visibly support:

- version history
- derivation lineage
- candidate visibility
- publication lineage
- immutable checkpoint behavior

---

*Navigation: [FVC-03 Checklist, Confirmation Gate, and Access Model →](FVC-03-Checklist-Confirmation-Gate-and-Access-Model.md)*
