# Financial Lifecycle and Mutation Governance

| Field | Value |
|---|---|
| **Doc ID** | Financial-LMG |
| **Document Type** | Lifecycle and Mutation Governance |
| **Owner** | Architecture lead |
| **Created** | 2026-03-28 |
| **Status** | Active — governs lifecycle transitions, mutation guards, staleness, and service enforcement |
| **References** | [Financial-RGC](Financial-Runtime-Governance-Control.md); [Financial-SOTEC](Financial-Source-of-Truth-and-Entity-Control.md); [Financial-ABMC](Financial-Action-Boundary-and-Mutation-Control.md); [FRM-03](FRM-03-State-Mutability-and-Lifecycle.md); [FVC-03](FVC-03-Checklist-Confirmation-Gate-and-Access-Model.md); [PH3-FIN-SOTL](PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md); [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md); [Control Index](Financial-Doctrine-Control-Index.md) |

---

## 1. Purpose

This document locks the authoritative lifecycle states, transition rules, mutation guards, staleness/invalidation behavior, and service-level enforcement posture for the Financial module. It synthesizes the code-implemented state machines with doctrine requirements to produce implementation-governing rules.

**Enforcement principle:** Rules in this document must be enforced in repository/domain service layers, not trusted to UI-only behavior. UI may present warnings, but the domain layer must prevent invalid transitions.

---

## 2. Forecast Version Lifecycle

### 2.1 States

| State | Mutability | Description |
|-------|-----------|-------------|
| **Working** | Mutable | PM-editable active draft; FTC edits, checklist, GC/GR, cash flow forecast |
| **ConfirmedInternal** | **Immutable** | Frozen internal snapshot; PER can annotate; PM can read and derive |
| **PublishedMonthly** | **Immutable** | Official release version; PER can annotate; read-only for all others |
| **Superseded** | **Immutable** | Historical record; read-only for all roles |

### 2.2 Transitions

| # | Transition | From | To | Who | Preconditions | Side Effects |
|---|-----------|------|-----|-----|---------------|-------------|
| T1 | `createInitialVersion` | None | Working | System | No existing versions for project | Creates version with `isCurrentWorking: true` |
| T2 | `deriveWorkingVersion` | ConfirmedInternal or PublishedMonthly | Working | PM | Source version exists and is immutable | Copies budget lines, GC/GR, checklist, cash flow to new Working; carries forward annotations (§6); marks prior Working as Superseded if exists |
| T3 | `confirmVersion` | Working | ConfirmedInternal | PM | **Confirmation gate must pass** (§3) | Sets `confirmedAt`, `confirmedBy`; snapshot becomes immutable; triggers Activity Spine `ForecastVersionConfirmed` event; publishes Health Pulse metric snapshot (per Financial-SSIC §7.1/§7.2) |
| T4 | `designateReportCandidate` | ConfirmedInternal | ConfirmedInternal | PM | Version is ConfirmedInternal | Sets `isReportCandidate: true`; clears flag on any other version in same project |
| T5 | `promoteToPublished` | ConfirmedInternal | PublishedMonthly | System (P3-F1) | Version is `isReportCandidate` and ConfirmedInternal | Sets `publishedAt`; immutable; triggers publication handoff; triggers Activity Spine `ForecastVersionPublished` event; publishes Health Pulse metric snapshot (per Financial-SSIC §7.1/§7.2) |
| T6 | `transitionToSuperseded` | Any | Superseded | System | New version derived or period closed | Sets `supersededAt`; historical retention |

### 2.3 Derivation Reasons

When deriving a new Working version (T2), the reason must be one of:

| Reason | Trigger |
|--------|---------|
| `NewPeriod` | Monthly reporting cycle |
| `BudgetReImport` | New CSV import changes budget baseline |
| `CorrectionRequired` | Error found in confirmed version |
| `ReturnedForRevision` | Review returns version to PM |
| `ScheduleUpdateReflection` | External schedule change affects forecast |

### 2.4 Prohibited Transitions

- **No unlock-in-place** — a ConfirmedInternal or PublishedMonthly version cannot revert to Working; derive a new version instead
- **No direct Working → PublishedMonthly** — must pass through ConfirmedInternal
- **No Superseded → any active state** — historical records are permanent

---

## 3. Confirmation Gate

The confirmation gate is the **mandatory precondition** for transition T3 (Working → ConfirmedInternal). It must be enforced in the domain service layer, not UI-only.

### 3.1 Gate Validators

| # | Validator | Check | Enforcement Level |
|---|----------|-------|-------------------|
| G1 | Version state | Must be `Working` | **Domain** — implemented in `validateConfirmationGate()` |
| G2 | Required checklist | All 15 required items (of 19 total) must be `completed: true` | **Domain** — implemented |
| G3 | Reconciliation clear | `staleBudgetLineCount === 0` — no unresolved import conditions | **Domain** — implemented |
| G4 | Summary validation | GC/GR posture computable; required summary fields valid | **Domain** — doctrine-defined, not yet implemented |

### 3.2 Checklist Template

19 items across 4 groups:

| Group | Items | Required |
|-------|-------|----------|
| RequiredDocuments | 6 items (Procore budget, forecast summary, GC/GR log, cash flow, SDI log, buyout log) | 6 of 6 |
| ProfitForecast | 4 items (changes noted, negative flagged, GC savings confirmed, events documented) | 4 of 4 |
| Schedule | 3 items (status current, brewing items, GC/GR confirmed) | 2 of 3 |
| Additional | 6 items (contingency, GC estimate, A/R aging, savings, execution, approval) | 3 of 6 |

Each checklist item has: `id`, `label`, `group`, `required`, `completed`, `completedBy`, `completedAt`, `notes`.

---

## 4. Access Control Matrix

### 4.1 Role-State Access Rules

Enforced in `resolveFinancialVersionAccess(role, versionState)`:

| | Working | ConfirmedInternal | PublishedMonthly | Superseded |
|---|---------|------------------|-----------------|------------|
| **PM** | read, write, derive | read, derive, designate-report-candidate | read, derive | read |
| **PER** | **hidden** | read, annotate | read, annotate | read |
| **Leadership** | read | read | read | read |

### 4.2 Enforcement Rules

- **PER hidden from Working** — PER must not see Working version data; the repository must filter it, not just the UI
- **Write requires Working** — any mutation to version-scoped records (budget lines, GC/GR, checklist, cash flow forecast) must verify the owning version is in Working state
- **Annotate requires ConfirmedInternal or PublishedMonthly** — annotation writes must verify the version state

---

## 5. Buyout Status Lifecycle

### 5.1 States

| State | Description |
|-------|-------------|
| `NotStarted` | Scope package identified, no procurement action |
| `LoiPending` | Letter of intent in process |
| `LoiExecuted` | LOI signed |
| `ContractPending` | Contract in negotiation |
| `ContractExecuted` | Contract signed — requires gate passage (§5.2) |
| `Complete` | Fully closed |
| `Void` | Cancelled — can transition from any state |

### 5.2 ContractExecuted Gate

The transition to `ContractExecuted` requires:

| Check | Requirement |
|-------|------------|
| Subcontract checklist linked | `subcontractChecklistId !== null` |
| Checklist complete | linked checklist `status === 'Complete'` |
| Waiver (if applicable) | `waiverStatus === 'Approved'` or no waiver required |

This gate enforces P3-E13 (Subcontract Execution Readiness).

### 5.3 Savings Disposition

When `contractAmount < originalBudget`, a savings disposition is created:

| State | Meaning |
|-------|---------|
| `Undispositioned` | Savings exist but PM has not allocated them |
| `PartiallyDispositioned` | Some savings allocated, remainder pending |
| `FullyDispositioned` | All savings allocated to destinations |

Destinations: `AppliedToForecast`, `HeldInContingency`, `ReleasedToGoverned`.

---

## 6. Annotation Carry-Forward on Derivation

When a new Working version is derived from a ConfirmedInternal or PublishedMonthly source:

### 6.1 Resolution by Anchor Type

| Anchor Type | Resolution Rule |
|-------------|----------------|
| **Field** (line-specific) | Resolve only if `canonicalBudgetLineId` exists in new version's roster; unresolvable anchors archived |
| **Section** (cost-summary) | Always resolve — structural, not line-dependent |
| **Block** (buyout-section) | Always resolve — structural, not line-dependent |

### 6.2 Carried-Forward State

Each carried annotation receives:
- `inheritanceStatus: 'Inherited'`
- `pmDispositionStatus: 'Pending'` — PM must review and disposition
- `valueChangedFlag: boolean` — indicates if the field value changed between source and target versions

### 6.3 PM Disposition Options

`Pending` → `Addressed` | `StillApplicable` | `NeedsReviewerAttention`

---

## 7. Budget Import Lifecycle

### 7.1 Identity Resolution Outcomes

| Outcome | Condition | Action |
|---------|-----------|--------|
| `matched` | Existing line found by external ID or unique fallback key | Reuse `canonicalBudgetLineId`; add to output |
| `new` | No existing line found | Generate new UUID as `canonicalBudgetLineId` |
| `ambiguous` | Multiple existing lines share fallback key | Create `ReconciliationCondition`; do NOT output line |

### 7.2 Reconciliation Condition Lifecycle

| State | Meaning | Impact |
|-------|---------|--------|
| `Pending` | PM must resolve | Increments `staleBudgetLineCount`; blocks confirmation gate |
| `Resolved` | PM chose `MergedInto` or `CreatedNew` | Decrements `staleBudgetLineCount` |
| `Dismissed` | PM abandoned without resolution | Decrements count but line is not imported |

### 7.3 Import-Triggered Staleness

A budget re-import creates staleness by:
1. Generating new reconciliation conditions (ambiguous matches)
2. Updating `staleBudgetLineCount` on the current Working version
3. Blocking confirmation gate (G3) until all conditions are resolved
4. Triggering derivation reason `BudgetReImport` if the import occurs against a confirmed version

---

## 8. Staleness and Invalidation Rules

### 8.1 What Becomes Stale

| Trigger | What Becomes Stale | Detection | Resolution |
|---------|-------------------|-----------|------------|
| Budget re-import | Working version's budget lines + reconciliation conditions | `staleBudgetLineCount > 0` on version | PM resolves all reconciliation conditions |
| GC/GR line change | Forecast summary derived fields | Derived field recomputation flags | Recompute on next summary read |
| Cash flow forecast edit | Cumulative cash flow projections | Derived projection delta | Recompute cumulative series |
| Checklist item unchecked | Confirmation readiness | Gate check re-evaluation | PM re-completes item |
| Version derivation | Prior version's "current" status | `isCurrentWorking: false` on prior | Automatic on derive |
| Report-candidate redesignation | Prior candidate's flag | `isReportCandidate: false` on prior | Automatic on designate |
| Period close | Working version editability | Period close event | Derive new version for new period |

### 8.2 What Remains Historically Preserved

| Record | Preservation Rule |
|--------|------------------|
| ConfirmedInternal versions | **Never modified** — point-in-time snapshot |
| PublishedMonthly versions | **Never modified** — official release record |
| Superseded versions | **Never modified** — historical retention |
| Audit events | **Never modified** — append-only ledger |
| Publication records | **Never modified** — outcome history |
| Resolved reconciliation conditions | **Never re-opened** — resolution is final |

### 8.3 Cascading Invalidation

| Upstream Change | Downstream Invalidation | Service Responsibility |
|----------------|------------------------|----------------------|
| Budget line FTC edit | Forecast summary: `estimatedCostAtCompletion`, `currentProfit`, `profitMargin` | `IForecastSummaryRepository` — recompute on read |
| GC/GR line edit | GC/GR variance, forecast summary GC/GR subtotal | `IGCGRRepository` — recompute variance; `IForecastSummaryRepository` — recompute rollup |
| Cash flow month edit | Cumulative totals, `peakCashRequirement`, `cashFlowAtRisk` | `ICashFlowRepository` — recompute cumulative series |
| Buyout status advance | Dollar-weighted completion metric | `IBuyoutRepository` — recompute metric |
| Checklist change | Confirmation gate eligibility | `IForecastVersionRepository` — re-evaluate gate on next confirm attempt |

---

## 9. Service-Level Enforcement Boundaries

### 9.1 What Must Be Enforced in Domain Services (Not UI)

| Rule | Enforcement Point | Why Not UI-Only |
|------|-------------------|-----------------|
| Version state check before mutation | Repository write methods | UI bypass would allow edits to immutable versions |
| Confirmation gate passage | `IForecastVersionRepository.confirmVersion()` | UI bypass would allow confirmation without checklist |
| PER hidden from Working | `IFinancialRepository` facade query filter | UI bypass would leak draft data to reviewers |
| ContractExecuted gate | `IBuyoutRepository.advanceStatus()` | UI bypass would skip compliance verification |
| One report-candidate per project | `IForecastVersionRepository.designateReportCandidate()` | UI bypass would create multiple candidates |
| Reconciliation condition blocks confirmation | Confirmation gate G3 | UI bypass would confirm with unresolved imports |
| Import-only for external records | `IBudgetImportRepository`, `ICashFlowRepository` (actuals), `ICommitmentReferenceRepository` | UI bypass would allow direct authoring of imported data |
| Annotation state-gate | `IFinancialReviewRepository` | UI bypass would allow annotations on Working versions |
| Derivation-first (no unlock) | All version-scoped repositories | UI bypass would allow mutations to frozen versions |
| Period close triggers T6 for Working versions | `IFinancialPeriodRepository.closePeriod()` | System must supersede or force-confirm Working versions when a period closes; UI cannot be trusted to initiate this |

### 9.2 What May Be Evaluated in UI (Informational)

| Rule | UI Role | Domain Confirms |
|------|---------|----------------|
| Checklist completion progress | Display progress bar, highlight incomplete | Gate G2 validates atomically |
| Stale budget line warning | Display warning banner | Gate G3 blocks confirmation |
| Draft safety / unsaved state | Warn on navigation | Domain does not persist drafts automatically |
| Readiness posture | Display tool-level readiness | No aggregated readiness record yet (doctrine gap) |

### 9.3 Concurrency and Idempotency

| Concern | Rule |
|---------|------|
| Concurrent FTC edits | **Last-write-wins** with version-scoped optimistic locking (version `updatedAt` check) |
| Concurrent confirmation | **First-writer-wins** — second attempt fails because version is no longer Working |
| Concurrent report-candidate designation | **Idempotent** — only one candidate per project at any time; operation clears prior |
| Import during editing | **Import does not auto-save PM edits** — import creates new reconciliation conditions; PM edits remain in Working |

---

## 10. Review and Publication Lifecycle

### 10.1 Review Custody States (Doctrine-Defined, Not Yet Implemented)

Per FRM-03 §3.2–§3.3, the following custody states are required but do not yet exist in code:

| State | Meaning | Transition |
|-------|---------|------------|
| `PmCourt` | PM owns; preparing or revising | Initial state; or after return |
| `SubmittedForReview` | PM submitted; awaiting PER action | PM → PER handoff |
| `InReview` | PER actively reviewing/annotating | PER accepted submission |
| `ReturnedForRevision` | PER returned with comments | Creates derivation reason `ReturnedForRevision` |
| `Approved` | PER approved; eligible for publication | Unlocks report-candidate designation |

**Implementation note:** These states require `FinancialReviewCustodyRecord` (persistence family #13 in Financial-RGC §2.1). The record, state machine, and transitions must be implemented to operationalize review governance.

### 10.2 Publication Eligibility

A version is eligible for publication when:
1. Version state is `ConfirmedInternal`
2. `isReportCandidate: true`
3. Review custody is `Approved` (when review custody records are implemented)
4. Period is not closed

### 10.3 Post-Publication Rules

- Published version becomes `PublishedMonthly` — immutable
- At most one `PublishedMonthly` per project per reporting period
- Prior published version for the same period becomes `Superseded`
- Publication triggers P3-F1 `ReportPublishedEvent` callback

---

## 11. Period Lifecycle (Doctrine-Defined, Not Yet Implemented)

Per FRM-03 §5.2, the following period states are required:

| State | Meaning |
|-------|---------|
| `Open` | Active reporting period; Working version editable |
| `Closed` | Period finalized; `IFinancialPeriodRepository.closePeriod()` evaluates the current Working version: if confirmation gate passes, auto-confirm to ConfirmedInternal (T3); if gate fails, transition to Superseded (T6) with `derivationReason: 'PeriodClosedUnconfirmed'` |
| `Reopened` | Governed exception; requires explicit authority |

**Reopen governance:** Per PH3-FIN-SOTL §13, period reopen is a governed action requiring explicit authority. The `IFinancialPeriodRepository` must enforce close/reopen transitions.

---

## 12. Unresolved Lifecycle Governance Risks

| # | Risk | Impact | Required Action |
|---|------|--------|----------------|
| 1 | Review custody runtime not implemented | Contracts defined (Wave 1C: `IFinancialReviewCustodyRecord`, `ReviewCustodyStatus`, 5-transition table, transition results); runtime state machine and `IFinancialReviewRepository` needed | Implement in Wave 2 |
| 2 | Period lifecycle runtime not implemented | Contracts defined (Wave 1C: `IFinancialReportingPeriod`, `IPeriodCloseResult`, `IPeriodReopenResult`); runtime `IFinancialPeriodRepository` needed | Implement in Wave 2 |
| 3 | G4 summary validation runtime not implemented | Contracts defined (Wave 1C: `IG4SummaryValidationResult`, 5 error codes); T04 source contracts now complete; runtime validator in domain service needed | Implement in Wave 2 |
| 4 | Cross-tool readiness aggregation undefined | No module-level readiness flag combining checklist + reconciliation + review + publication | Define aggregation service after per-tool readiness is implemented |
| 5 | Contingency hold/release model not defined | Savings disposed to `HeldInContingency` but no release workflow exists | Define contingency lifecycle when buyout implementation advances |
| 6 | Audit event envelope defined, runtime not implemented | Contracts defined (Wave 1C: `IFinancialAuditEvent`, 19 event types, 8 categories); runtime `IFinancialAuditRepository` needed | Implement in Wave 2 |
