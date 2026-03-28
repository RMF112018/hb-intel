# Financial Source-of-Truth and Entity Control

| Field | Value |
|---|---|
| **Doc ID** | Financial-SOTEC |
| **Document Type** | Source-of-Truth and Entity Control |
| **Owner** | Architecture lead |
| **Created** | 2026-03-28 |
| **Status** | Active — governs entity ownership, write boundaries, and action-boundary enforcement |
| **Governing Authority** | [PH3-FIN-SOTL](PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md) (locked source-of-truth) |
| **References** | [Financial-RGC](Financial-Runtime-Governance-Control.md); [Financial-LMG](Financial-Lifecycle-and-Mutation-Governance.md); [Financial-ABMC](Financial-Action-Boundary-and-Mutation-Control.md); [FRM-01](FRM-01-Entity-Catalog.md); [FRM-03](FRM-03-State-Mutability-and-Lifecycle.md); [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md); [Control Index](Financial-Doctrine-Control-Index.md) |

---

## 1. Purpose

This document consolidates the Financial module's source-of-truth rules, entity ownership model, and action boundaries into one implementation-control surface. It answers: for every Financial data domain, what is the authoritative source, who can write, who can read, what entities exist, and what transitions create invalidation.

**Use this document** when implementing Financial data access, mutation logic, or enforcement guards. It tells you what you can touch and what you cannot.

---

## 2. Source-of-Truth Ownership Matrix

Per PH3-FIN-SOTL §4 and Financial-RGC §4.1:

| Data Domain | Authoritative Source | Financial Module Role | Write Authority | Action Boundary |
|-------------|---------------------|----------------------|----------------|-----------------|
| **Budget baseline** | Procore (imported via CSV) | Store copies, history, identity mappings | **Import-only** — no direct authoring of baseline values | Financial imports and reconciles; cannot originate budget data |
| **Actual cost** | ERP / external system (Sage Intacct target) | Sync and use for comparisons, variance | **Read-only** — no Financial writes | Consumed through governed downstream sync |
| **Monthly forecast** | **Financial module** (native) | Owns working versions, review, approval, archival | **PM-only write** on Working state (per LMG §4) | Full lifecycle: Working → Confirmed → Published → Superseded |
| **GC/GR projections** | **Financial module** (native, version-scoped) | Owns working and confirmed projections | **PM-only write** on Working version | Version-scoped; immutable after confirmation |
| **Cash flow forecast** | **Financial module** (native) | Owns working and confirmed versions | **PM-only write** on Working version | Actuals are read-only (imported); forecast months are PM-editable |
| **Cash flow actuals** | ERP / external system | Read-only sync into Financial | **Import-only** — no Financial writes | Closed months are immutable |
| **A/R aging** | ERP (Sage Intacct target) | Display for exposure assessment | **Read-only** — no Financial writes | ERP facts; Financial adds interpretation layer |
| **Commitments** | Procore (primary) + Financial enrichment | Core fields from Procore; enrichment fields internal | **Enrichment writes only** — core Procore fields read-only | Stable linkage required; Financial cannot alter Procore-owned fields |
| **Buyout working state** | **Hybrid** (Financial + Procore) | Owns internal orchestration/enrichment layer | **Full write** on internal buyout lifecycle | Financial owns status progression; Procore owns formal contract data |
| **Contingency / savings** | **Hybrid** (Financial with governance gates) | Authoritative for working-period treatment | **PE approval required** for material contingency decisions | Three-destination savings disposition per LMG §5.3 |
| **Receivables** | Hybrid (ERP facts + Financial interpretation) | Facts from ERP; own interpretation/collection-risk | **Interpretation writes only** — fact fields read-only | ERP = facts; Financial = exposure narrative |
| **Forecast checklist** | **Financial module** (native) | Owns checklist items per version | **PM-only write** | 19-item template; confirmation gate enforced per LMG §3 |
| **Review / annotation** | **Financial module** (native) | Owns custody, annotations, carry-forward | **PER annotate** on Confirmed/Published; **PM disposition** | Append-only custody records; version-aware anchors |
| **Publication** | **Financial module** (native) | Owns report-candidate designation and handoff | **System** promotes via P3-F1 | One candidate per project; immutable after publication |
| **Audit / history** | **Financial module** (native) | Owns immutable event history | **System append-only** — never edited or deleted | FinancialAuditEvent is permanent record |

---

## 3. Entity Classification Matrix

Per FRM-01 ownership tiers and Financial-RGC §2:

### 3.1 Ownership Tier Definitions

| Tier | Code | Meaning | Write Behavior |
|------|------|---------|---------------|
| Externally Authoritative | **E** | Source truth exists outside Financial module | Import-only; no Financial origination |
| Imported / Reference | **I** | Ingested into Financial, not authored by users | Stored on import; not user-editable |
| Native Working State | **W** | Created/edited by Financial users in mutable workflows | PM-editable on Working version only |
| Governed / Frozen | **G** | Immutable after confirmation, close, or publication | No writes after state transition |
| Derived / Projection | **D** | Computed from other records; never edited directly | Recomputed on read; no direct writes |
| Audit / Event History | **A** | Immutable operational event/custody history | Append-only; never edited or deleted |

### 3.2 Per-Entity Classification

| # | Entity | Tier | Scope | Write Owner | Persistence Family (RGC §2) |
|---|--------|------|-------|------------|---------------------------|
| 1 | `FinancialReportingPeriod` | G | Project | `IFinancialPeriodRepository` | #1 |
| 2 | `ForecastVersion` | W→G | Project | `IForecastVersionRepository` | #2 |
| 3 | `BudgetLine` | W | Version-scoped | `IBudgetLineRepository` | #3 |
| 4 | `ForecastSummarySnapshot` | D | Version-scoped | `IForecastSummaryRepository` | #4 |
| 5 | `GCGRLine` | W | Version-scoped | `IGCGRRepository` | #5 |
| 6 | `ForecastChecklistItem` | W | Version-scoped | `IForecastVersionRepository` | #6 |
| 7 | `CashFlowForecastMonth` | W | Version-scoped | `ICashFlowRepository` | #7 |
| 8 | `CashFlowActualMonth` | I | Project | Import-only | #8 |
| 9 | `ARAgingRecord` | E | Project | Import-only | #9 |
| 10 | `CommitmentReference` | E | Project | Import-only (enrichment fields writable) | #10 |
| 11 | `BuyoutLineItem` | W | Project | `IBuyoutRepository` | #11 |
| 12 | `BuyoutSavingsDispositionItem` | W | Project | `IBuyoutRepository` | #12 |
| 13 | `FinancialReviewCustodyRecord` | A | Version-scoped | `IFinancialReviewRepository` | #13 |
| 14 | `PublicationRecord` | G | Project | `IFinancialPublicationRepository` | #14 |
| 15 | `FinancialExportRun` | A | Project | `IFinancialPublicationRepository` | #15 |
| 16 | `FinancialAuditEvent` | A | Project | `IFinancialAuditRepository` | #16 |
| 17 | `BudgetImportSession` | A | Project | `IBudgetImportRepository` | #17 |
| 18 | `RawBudgetImportRow` / `NormalizedBudgetImportRow` | I | Session-scoped | `IBudgetImportRepository` | #18 |
| 19 | `BudgetImportValidationReport` | A | Session-scoped | `IBudgetImportRepository` | #19 |
| 20 | `BudgetIdentityResolutionRecord` / `BudgetLineReconciliationCondition` | W | Session-scoped | `IBudgetImportRepository` | #20 |
| 21 | `BudgetImportExecutionRecord` / `VersionDerivationRecord` | A | Session-scoped | `IBudgetImportRepository` | #21 |
| 22 | `BudgetImportAuditEvent` | A | Session-scoped | `IBudgetImportRepository` | #22 |

---

## 4. Action Boundaries by Capability

For each major capability, what actions are permitted and by whom:

### 4.1 Budget Import

| Action | Who | Precondition | Boundary |
|--------|-----|-------------|----------|
| Upload CSV | PM | Project accessible | Creates import session |
| Validate batch | System | CSV parsed | Atomic — all rows validated before any lines produced |
| Resolve identity | System | Validation passed | Matched / new / ambiguous per import algorithm |
| Resolve reconciliation condition | PM | Condition is Pending | PM chooses MergedInto or CreatedNew; resolution is final |
| Execute import batch | System | All conditions resolved | Creates/updates budget lines on Working version |
| **Prohibited:** Direct authoring of budget baseline values | — | — | Budget data is import-only per PH3-FIN-SOTL §4 |

### 4.2 Forecast Summary

| Action | Who | Precondition | Boundary |
|--------|-----|-------------|----------|
| Edit PM-editable fields | PM | Version is Working | Derived fields recompute automatically |
| View confirmed/published summary | PM, PER, Leadership | Version exists | Read-only snapshot |
| **Prohibited:** Edit on Confirmed/Published/Superseded | — | — | Derivation-first; no unlock-in-place |

### 4.3 Forecast Versioning

| Action | Who | Precondition | Boundary |
|--------|-----|-------------|----------|
| Create initial version | System | No existing versions | One Working version per project |
| Derive new Working | PM | Source is Confirmed or Published | Copies data; carries forward annotations |
| Confirm version | PM | Confirmation gate passes (LMG §3) | Working → ConfirmedInternal; immutable |
| Designate report candidate | PM | Version is ConfirmedInternal | One candidate per project; clears prior |
| Promote to Published | System (P3-F1) | Is report candidate + ConfirmedInternal | ConfirmedInternal → PublishedMonthly |
| **Prohibited:** Unlock-in-place | — | — | Derive new version instead |

### 4.4 GC/GR Model

| Action | Who | Precondition | Boundary |
|--------|-----|-------------|----------|
| Edit GC/GR lines | PM | Version is Working | Version-scoped; variance recomputes |
| View confirmed/published | All roles | Version exists | Read-only |
| **Prohibited:** Edit on non-Working version | — | — | Per LMG §2 immutability rules |

### 4.5 Cash Flow

| Action | Who | Precondition | Boundary |
|--------|-----|-------------|----------|
| Edit forecast months | PM | Version is Working; month is not closed | 18-month horizon |
| View actuals | All roles | — | Read-only imported data |
| View A/R aging | All roles | — | Read-only ERP sync |
| **Prohibited:** Edit actuals or A/R | — | — | Import-only external data |
| **Prohibited:** Edit closed months | — | — | Period-close immutability |

### 4.6 Buyout

| Action | Who | Precondition | Boundary |
|--------|-----|-------------|----------|
| Create/update buyout line | PM | Project accessible | Status lifecycle: NotStarted → ... → Complete |
| Advance to ContractExecuted | PM | ContractExecuted gate passes (LMG §5.2) | P3-E13 compliance required |
| Create savings disposition | PM | contractAmount < originalBudget | Three destinations: AppliedToForecast, HeldInContingency, ReleasedToGoverned |
| **Prohibited:** Skip ContractExecuted gate | — | — | Subcontract checklist must be complete |

### 4.7 Review / PER Annotation

| Action | Who | Precondition | Boundary |
|--------|-----|-------------|----------|
| Annotate confirmed version | PER | Version is ConfirmedInternal or PublishedMonthly | Version-aware anchors (field/section/block) |
| Disposition carried-forward annotation | PM | Annotation is Inherited with Pending disposition | PM chooses Addressed / StillApplicable / NeedsReviewerAttention |
| **Prohibited:** PER view Working version | — | — | PER is hidden from Working per LMG §4 |
| **Prohibited:** Annotate Working version | — | — | Annotation requires Confirmed or Published |

### 4.8 Publication / Export

| Action | Who | Precondition | Boundary |
|--------|-----|-------------|----------|
| Designate report candidate | PM | Version is ConfirmedInternal | One per project |
| Promote to Published | System | P3-F1 handoff | Immutable after promotion |
| Create export run | PM/System | Published version exists | Append-only evidence record |
| **Prohibited:** Multiple report candidates | — | — | Designation clears prior |

### 4.9 History / Audit

| Action | Who | Precondition | Boundary |
|--------|-----|-------------|----------|
| View version history | All roles | — | Read-only |
| View audit events | All roles | — | Read-only |
| **Prohibited:** Edit or delete audit events | — | — | Immutable append-only ledger |

---

## 5. Stale-State and Invalidation Boundaries

When upstream data changes, downstream artifacts may become stale. Per Financial-LMG §8:

| Upstream Change | What Becomes Stale | Detection | Resolution |
|----------------|-------------------|-----------|------------|
| Budget re-import | Working version budget lines + reconciliation conditions | `staleBudgetLineCount > 0` | PM resolves all conditions |
| Budget line FTC edit | Forecast summary derived fields | Recomputation flag | Auto-recompute on read |
| GC/GR line edit | GC/GR variance + forecast summary GC/GR subtotal | Recomputation flag | Auto-recompute on read |
| Cash flow month edit | Cumulative totals, peak cash requirement | Recomputation flag | Auto-recompute on read |
| Buyout status advance | Dollar-weighted completion metric | Metric recalculation | Auto-recompute on read |
| Checklist item change | Confirmation gate eligibility | Gate re-evaluation | Re-evaluate on next confirm attempt |
| Version derivation | Prior version's "current" status | `isCurrentWorking: false` | Automatic |
| Report-candidate redesignation | Prior candidate's flag | `isReportCandidate: false` | Automatic |
| Period close | Working version editability | Period close event | Auto-confirm if gate passes; else Supersede (LMG §11) |

**Immutable records never become stale:** ConfirmedInternal, PublishedMonthly, Superseded versions; audit events; publication records; resolved reconciliation conditions.

---

## 6. Implementation Status

Per FIN-PR1 §3.2:

| Aspect | Stage | Evidence |
|--------|-------|----------|
| Entity type definitions | Stage 3 | Complete type system in `@hbc/features-project-hub/src/financial/types/` |
| Business logic (computors, validators, governance) | Stage 3 | 12+ subdomains, 1,979 test lines |
| Source-of-truth doctrine | Stage 3 | PH3-FIN-SOTL locked; Financial-RGC locks persistence families |
| `IFinancialRepository` facade | Stage 1 | Does not exist; doctrine-defined in Financial-RGC §3 |
| Write boundary enforcement | Stage 1 | Doctrine-defined in this document §4 and Financial-LMG §9; no code enforcement |
| Stale-state detection | Stage 1 | Reconciliation condition tracking implemented; upstream cascade not yet wired |

---

## 7. Remaining Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | T04 source contracts unwritten (`IFinancialForecastSummary`, `IGCGRLine`) | Forecast Summary and GC/GR entities incomplete | Author T04 before implementing repositories |
| 2 | No runtime write-boundary enforcement | Domain ownership rules exist only in doctrine | Repository implementations must validate per §4 action boundaries |
| 3 | Commitment reference linkage model not finalized | Buyout-to-Procore reconciliation may be fragile | Define stable linkage fields when Procore connector is implemented |
| 4 | Period lifecycle not implemented | Cannot enforce period-close invalidation | Implement `IFinancialPeriodRepository` per Financial-RGC §7 |
| 5 | Review custody state machine not implemented | Cannot enforce review workflow boundaries | Implement `FinancialReviewCustodyRecord` per Financial-LMG §10 |
