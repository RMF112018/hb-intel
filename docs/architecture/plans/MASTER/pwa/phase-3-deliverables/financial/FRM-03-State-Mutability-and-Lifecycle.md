# FRM-03 — Financial State, Mutability, and Lifecycle Model

| Property | Value |
|----------|-------|
| **Doc ID** | FRM-03 |
| **Parent** | [FRM-00 Financial Runtime Entity Model](FRM-00-Financial-Runtime-Entity-Model.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | State, Mutability, and Lifecycle |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the recommended lifecycle and mutability behavior for the Financial runtime model, including version lifecycle, period close/reopen, return-for-revision handling, buyout lifecycle, and ownership-tier mutation rules.*

---

## 1. Lifecycle Principles

### 1.1 Derivation-first lifecycle

Confirmed and published financial versions should remain immutable. All further PM work should occur through derivation to a new Working version.

### 1.2 Separate version state from custody state

Version state and review/publication custody should not be collapsed into one enum. A version can be `ConfirmedInternal`, while its review/publication custody can be:

- submitted for review
- under review
- returned for revision
- designated as report candidate
- handed off for publication
- published successfully

### 1.3 Separate period-close from version-close

Reporting-period governance should have its own lifecycle rather than relying only on version states.

---

## 2. Forecast Version Lifecycle

### 2.1 Recommended version states

| State | Meaning | Mutability |
|------|---------|-----------|
| `Working` | PM-owned active editing state | PM-editable |
| `ConfirmedInternal` | Immutable internal confirmation snapshot | Frozen |
| `PublishedMonthly` | Official published version for the reporting period | Frozen |
| `Superseded` | Historical version replaced by later version activity | Frozen |

### 2.2 States intentionally not recommended as version enums

| Candidate State | Recommendation | Why |
|----------------|---------------|-----|
| `ReadyForReview` | Do not persist as a version enum | Represent through gate result and custody state |
| `InReview` | Do not persist as a version enum | Represent through `FinancialReviewCustodyRecord` |
| `ReturnedForRevision` | Do not persist as a version enum | Represent through return custody plus derivation to new Working version |
| `Reopened` | Do not persist as a version enum | Reopen should create/authorize a new Working version, not mutate old governed version |
| `Archived` | Do not persist as a version enum | Superseded / Published already cover retained historical state |

### 2.3 Version lifecycle flow

```text
Initial setup
   ↓
Working
   ↓ confirm gate passes
ConfirmedInternal
   ↓ designate candidate
ConfirmedInternal (candidate = true)
   ↓ publication handoff succeeds
PublishedMonthly
```

New edit cycle:

```text
ConfirmedInternal or PublishedMonthly
   ↓ derive new version
Working
```

Historical retention:

```text
Prior Working / prior Confirmed versions
   ↓ superseded by later cycle
Superseded
```

---

## 3. Confirmation and Review Gate Behavior

### 3.1 Confirmation gate

The confirmation gate should validate at least:

- required checklist completion
- stale budget line count = 0
- required summary fields valid
- GC/GR posture computable
- no unresolved required reconciliation blockers

### 3.2 Ready-for-review posture

A version is effectively “ready for review” when:

- it is still `Working`
- `IConfirmationGateResult.canConfirm = true`

That is enough. A separate persisted state is not required.

### 3.3 Review custody

Once a version is confirmed, review/publication custody should move through a separate record such as `FinancialReviewCustodyRecord`.

Recommended custody states:

| Custody State | Meaning |
|--------------|---------|
| `NotSubmitted` | Confirmed version exists but has not been submitted into review flow |
| `SubmittedForReview` | Version assigned into review flow |
| `InReview` | Reviewer actively reviewing |
| `ReturnedForRevision` | Reviewer has returned the version with reasons |
| `ClosedReview` | Review complete without publication |
| `CandidateSelected` | One confirmed version selected as the period candidate |
| `PublicationPending` | Handed to P3-F1 / release flow |
| `Published` | Publication succeeded |

---

## 4. Return-for-Revision and Reopen Model

### 4.1 Recommended handling

When a confirmed version is returned, do **not** unlock it.

Instead:

1. preserve the confirmed version as immutable
2. record a `ReturnedForRevision` custody event with reason
3. derive a new `Working` version from that governed source
4. carry forward annotations with disposition tracking
5. continue editing in the new Working version

### 4.2 Why this matters

This keeps:

- review evidence intact
- published or confirmed history reliable
- derivation lineage auditable
- PM edits safely separated from review records

### 4.3 Reopen model

A “reopen” should mean one of two things:

| Reopen Type | Recommended Behavior |
|------------|----------------------|
| Period reopen | Reopen the reporting period record and allow a new candidate/published path |
| Review reopen | Reopen the review custody flow for a governed version or its successor |
| Version reopen | Avoid direct unlock; use derivation to new Working version |

---

## 5. Reporting Period Lifecycle

### 5.1 Recommended period states

| State | Meaning |
|------|---------|
| `Open` | Current period accepts Working versions and candidate selection |
| `UnderReview` | Review/publication cycle actively in progress |
| `Closed` | Period closed with a final published outcome |
| `Reopened` | Formerly closed period reopened by governance action |

### 5.2 Why a period record is important

A first-class period record simplifies:

- one-candidate-per-period enforcement
- one-published-version-per-period enforcement
- period close and reopen
- cross-version reporting-cycle auditability
- month-level release governance

### 5.3 Period close rules

A period should close only when:

- exactly one published or final-governed outcome is recognized
- all publication handoff requirements are complete
- review/publication custody is closed
- no unresolved required release blockers remain

---

## 6. Buyout Lifecycle

### 6.1 Recommended buyout states

| State | Meaning | Mutability |
|------|---------|-----------|
| `NotStarted` | Scope identified, no procurement action yet | Editable |
| `LoiPending` | LOI expected or pending | Editable |
| `LoiExecuted` | LOI returned or executed | Editable |
| `ContractPending` | Contract negotiation/finalization underway | Editable |
| `ContractExecuted` | Contract fully executed and compliance gate passed | Editable with controlled actions |
| `Complete` | Procurement record fully complete | Limited |
| `Void` | Line canceled or abandoned | Frozen except note/audit additions |

### 6.2 Buyout gate rule

`ContractExecuted` should remain blocked until the required readiness/compliance gate passes.

### 6.3 Savings lifecycle

| Condition | Behavior |
|----------|----------|
| No savings | No disposition record required |
| Savings recognized | Create `BuyoutSavingsDisposition` |
| Partial treatment | Status becomes `PartiallyDispositioned` |
| Full treatment | Status becomes `FullyDispositioned` |

---

## 7. Mutability Matrix

### 7.1 Record-level mutability

| Record | Open / Working | Confirmed | Published | Superseded |
|-------|-----------------|----------|-----------|-----------|
| `ForecastVersion` metadata | Mutable | Limited | Frozen | Frozen |
| `BudgetLine.forecastToComplete` | Mutable | Frozen | Frozen | Frozen |
| Imported budget fields | Frozen | Frozen | Frozen | Frozen |
| `ForecastChecklistItem` | Mutable | Frozen | Frozen | Frozen |
| `ForecastSummarySnapshot` editable fields | Mutable | Frozen | Frozen | Frozen |
| `GCGRLine` editable fields | Mutable | Frozen | Frozen | Frozen |
| `CashFlowForecastMonth` | Mutable | Frozen | Frozen | Frozen |
| `CashFlowActualMonth` | Frozen | Frozen | Frozen | Frozen |
| `ARAgingRecord` | Frozen | Frozen | Frozen | Frozen |
| `BuyoutLine` | Mutable | N/A | N/A | N/A |
| `BuyoutSavingsDispositionItem` | Mutable until complete | N/A | N/A | N/A |
| `FinancialAnnotationAnchor` | Governed by review posture | Mutable within review rules | Frozen/retained | Frozen/retained |
| `PublicationRecord` | Not applicable | Created during publication | Frozen | Frozen |
| `FinancialExportRun` | Created on export only | Frozen | Frozen | Frozen |
| `FinancialAuditEvent` | Immutable on creation | Immutable | Immutable | Immutable |

### 7.2 Role-based mutability

| Role | Working | Confirmed | Published |
|------|---------|----------|-----------|
| PM | Edit allowed on W-tier fields | Read only | Read only |
| PER | Hidden from Working for review-owned surfaces | Annotate where permitted | Annotate where permitted |
| Leadership | Read only | Read only | Read only |
| System / connectors | Import/update imported references | Lifecycle transitions only | Publication / close bookkeeping only |

---

## 8. Derived-State Behavior

### 8.1 Derived values should never be hand-edited

The following remain computed only:

- estimated cost at completion
- projected over/under
- profit and margin
- revised contract completion
- GC/GR variances
- buyout summary metrics
- cash-flow summary and peak cash requirement
- health metrics
- work queue items
- activity events

### 8.2 Recompute triggers

| Trigger | Recompute Impact |
|--------|------------------|
| FTC edit | Budget-line EAC, over/under, summary EAC, profit, margin |
| GC/GR edit | GC/GR variances, summary GC estimate, summary EAC, profit, margin |
| Checklist toggle | Confirmation gate |
| Budget import | Stale count, reconciliation conditions, budget-line refreshed values |
| Cash-flow forecast edit | Monthly projections, cumulative cash flow, peak cash requirement, cash-flow summary |
| Buyout status / contract amount change | Savings, completion weighting, summary metrics, work queue |
| Disposition action | Undispositioned balance, contingency treatment, work queue, audit trail |

---

## 9. Recommended Governance Additions

The current model would benefit from these additional governance records:

| Record | Purpose |
|------|---------|
| `FinancialReviewCustodyRecord` | Keeps review/post-confirmation lifecycle out of the version enum |
| `FinancialPeriodCloseRecord` | Makes close/reopen actions explicit and auditable |
| `ContingencyTreatmentEntry` | Preserves period-based treatment of savings/contingency decisions |
| `FinancialAuditEvent` | Creates one consistent event history ledger across imports, edits, and releases |

---

## 10. Recommendation

Keep the version lifecycle intentionally small and disciplined.

Use:

- `ForecastVersion` for PM working vs. frozen version truth
- `FinancialReviewCustodyRecord` for review/post-confirmation custody
- `FinancialReportingPeriod` for close/reopen governance
- immutable audit and publication records for traceability

That produces a cleaner operational system than continuing to push all lifecycle meaning into one version enum.

---

*Navigation: [← FRM-02 Aggregate and Relationship Model](FRM-02-Aggregate-and-Relationship-Model.md) | [FRM-04 Repository and Provider Seam Model →](FRM-04-Repository-and-Provider-Seam-Model.md)*
