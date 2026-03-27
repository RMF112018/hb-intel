# FRM-01 — Financial Runtime Entity Catalog

| Property | Value |
|----------|-------|
| **Doc ID** | FRM-01 |
| **Parent** | [FRM-00 Financial Runtime Entity Model](FRM-00-Financial-Runtime-Entity-Model.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Entity Catalog |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the proposed runtime record family for the Financial module. It separates imported/reference records, native working-state records, review/publication records, and derived/audit records so that implementation can preserve source-of-truth boundaries and aggregate ownership.*

---

## 1. Entity Classification Framework

### 1.1 Ownership tiers

| Tier | Label | Meaning |
|------|-------|---------|
| **E** | Externally Authoritative | Source of truth exists outside Project Hub; Financial imports or mirrors only |
| **I** | Imported / Reference | Ingested into Project Hub and displayed, but not authored by users |
| **W** | Native Working State | Created or edited by Financial users in mutable working workflows |
| **G** | Governed / Frozen | Immutable after confirmation, close, or publication; only metadata-level governance actions remain |
| **D** | Derived / Projection | Computed from other records; never edited directly |
| **A** | Audit / Event History | Immutable event or custody history used for traceability |

### 1.2 Domain groups

| Group | Description |
|------|-------------|
| Imported / Reference | Period, imports, dictionaries, commitments, actuals, receivables, pay-app references |
| Versioned Working State | Monthly forecast versions and all working records owned by those versions |
| Buyout / Procurement Control | Project-scoped procurement lifecycle and savings treatment |
| Review / Publication / Custody | Review assignment, return/revision, publication handoff, export evidence |
| Derived / Audit / Projection | Metrics, summaries, queue items, events, audit logs |

---

## 2. Imported / Reference Entity Family

### 2.1 FinancialReportingPeriod

| Field | Value |
|------|-------|
| **Record** | `FinancialReportingPeriod` |
| **Tier** | W / G |
| **Root?** | Yes |
| **Purpose** | Defines the project-scoped reporting period used to anchor version selection, close/reopen, and one-published-version-per-month governance |
| **Repo Truth Status** | **Recommended addition** — current source uses `reportingMonth` on `IForecastVersion` but does not model the period explicitly |

**Why it is needed**

The existing version record carries `reportingMonth`, but a first-class period record is cleaner for:

- period close / reopen
- one-candidate and one-published-version rules
- release-readiness and reporting-cycle governance
- auditability independent of version history

### 2.2 BudgetImportBatch

| Field | Value |
|------|-------|
| **Record** | `BudgetImportBatch` |
| **Tier** | E / I |
| **Root?** | Yes |
| **Purpose** | Immutable batch record for a budget import operation including validation counts, matched/created counts, and lineage |
| **Repo Truth Status** | Present in the current Financial crosswalk/runtime direction |

### 2.3 BudgetImportRow

| Field | Value |
|------|-------|
| **Record** | `BudgetImportRow` |
| **Tier** | E / I |
| **Root?** | No |
| **Purpose** | Raw row-level source capture for replay, audit, and reconciliation |
| **Repo Truth Status** | Present in current source/runtime direction |

### 2.4 BudgetLineReconciliation

| Field | Value |
|------|-------|
| **Record** | `BudgetLineReconciliation` |
| **Tier** | W / A |
| **Root?** | No |
| **Purpose** | Captures ambiguous import matches that require PM resolution into an existing canonical line or a new canonical line |
| **Repo Truth Status** | Present in current source/runtime direction |

### 2.5 CommitmentReference

| Field | Value |
|------|-------|
| **Record** | `CommitmentReference` |
| **Tier** | E / I |
| **Root?** | Yes |
| **Purpose** | Read-only external reference for subcontract, PO, and commitment data used by Financial for buyout, reconciliation, exposure, and downstream reporting |
| **Repo Truth Status** | **Recommended addition** — strongly justified by the current operating commitment data, but not yet a first-class Financial runtime entity |

**Recommended role**

This record should mirror the external commitment posture without allowing direct mutation inside Financial. It is not a buyout record and should not be folded into `BuyoutLine`.

### 2.6 CostCodeReference

| Field | Value |
|------|-------|
| **Record** | `CostCodeReference` |
| **Tier** | E / I |
| **Root?** | Yes |
| **Purpose** | Dictionary/normalization source for cost-code and CSI mappings |
| **Repo Truth Status** | Present conceptually in current source-file inputs |

### 2.7 RetentionConfig

| Field | Value |
|------|-------|
| **Record** | `RetentionConfig` |
| **Tier** | W |
| **Root?** | Yes |
| **Purpose** | Project-level retainage and release assumption settings used in cash-flow and receivables interpretation |
| **Repo Truth Status** | Present in current source/runtime direction |

### 2.8 ARAgingRecord

| Field | Value |
|------|-------|
| **Record** | `ARAgingRecord` |
| **Tier** | E / I |
| **Root?** | Yes |
| **Purpose** | Read-only A/R aging snapshot for one project refresh state |
| **Repo Truth Status** | Present in current source/runtime direction |

### 2.9 CashFlowActualMonth

| Field | Value |
|------|-------|
| **Record** | `CashFlowActualMonth` |
| **Tier** | E / I |
| **Root?** | No |
| **Purpose** | Imported monthly actual cash-flow record used as read-only actual history |
| **Repo Truth Status** | Present in current source/runtime direction |

### 2.10 PayAppActualMonthReference

| Field | Value |
|------|-------|
| **Record** | `PayAppActualMonthReference` |
| **Tier** | E / I |
| **Root?** | Yes |
| **Purpose** | Read-only monthly owner-billing / draw-application actual reference with billing lineage |
| **Repo Truth Status** | **Recommended addition** — current source approximates this inside cash-flow/AR views but does not model it explicitly |

---

## 3. Versioned Working-State Entity Family

### 3.1 ForecastVersion

| Field | Value |
|------|-------|
| **Record** | `ForecastVersion` |
| **Tier** | W / G |
| **Root?** | Yes |
| **Purpose** | Aggregate root for one monthly working, confirmed, published, or superseded financial version |
| **Repo Truth Status** | Present in current source/runtime direction |

### 3.2 BudgetLine

| Field | Value |
|------|-------|
| **Record** | `BudgetLine` |
| **Tier** | Mixed: E/I for imported fields, W for FTC and notes, D for EAC and over/under |
| **Root?** | No |
| **Purpose** | Core budget/cost-control line record with canonical identity, cost separation, PM FTC, and derived cost exposure metrics |
| **Repo Truth Status** | Present in current source/runtime direction |

### 3.3 ForecastChecklistTemplate

| Field | Value |
|------|-------|
| **Record** | `ForecastChecklistTemplate` |
| **Tier** | G |
| **Root?** | Yes |
| **Purpose** | Governs the static checklist definition that is instantiated onto each version |
| **Repo Truth Status** | Present in current source/runtime direction |

### 3.4 ForecastChecklistItem

| Field | Value |
|------|-------|
| **Record** | `ForecastChecklistItem` |
| **Tier** | W / G |
| **Root?** | No |
| **Purpose** | Version-scoped checklist working record used by the confirmation gate |
| **Repo Truth Status** | Present in current source/runtime direction |

### 3.5 ForecastSummarySnapshot

| Field | Value |
|------|-------|
| **Record** | `ForecastSummarySnapshot` |
| **Tier** | W / G / D |
| **Root?** | No |
| **Purpose** | The persisted version-level summary record for contract, schedule, profit, contingency, and GC rollups |
| **Repo Truth Status** | **Required addition to source** — defined in the contract/crosswalk direction but still missing from source T04 |

### 3.6 GCGRLine

| Field | Value |
|------|-------|
| **Record** | `GCGRLine` |
| **Tier** | W / G / D |
| **Root?** | No |
| **Purpose** | Version-scoped PM working line for GC/GR category projections and variance analysis |
| **Repo Truth Status** | **Required addition to source** — defined in the contract/crosswalk direction but still missing from source T04 |

### 3.7 CashFlowForecastMonth

| Field | Value |
|------|-------|
| **Record** | `CashFlowForecastMonth` |
| **Tier** | W / G / D |
| **Root?** | No |
| **Purpose** | Version-scoped PM-authored future cash-flow month with projected inflows/outflows and confidence |
| **Repo Truth Status** | Present in current source/runtime direction |

### 3.8 PendingChangeImpactRecord

| Field | Value |
|------|-------|
| **Record** | `PendingChangeImpactRecord` |
| **Tier** | W / I |
| **Root?** | Yes |
| **Purpose** | Explicit record for pending budget/cost/change-event impacts rather than leaving all pending effect as embedded numeric fields only |
| **Repo Truth Status** | **Recommended addition** — not currently first-class in source |

---

## 4. Buyout / Procurement-Control Entity Family

### 4.1 BuyoutLine

| Field | Value |
|------|-------|
| **Record** | `BuyoutLine` |
| **Tier** | W / D |
| **Root?** | Yes |
| **Purpose** | Project-scoped procurement line with budget, contract amount, lifecycle status, savings calculation, and compliance gate linkage |
| **Repo Truth Status** | Present in current source/runtime direction |

### 4.2 BuyoutSavingsDisposition

| Field | Value |
|------|-------|
| **Record** | `BuyoutSavingsDisposition` |
| **Tier** | W / D |
| **Root?** | No |
| **Purpose** | Container record for handling realized buyout savings once a line reaches ContractExecuted |
| **Repo Truth Status** | Present in current source/runtime direction |

### 4.3 BuyoutSavingsDispositionItem

| Field | Value |
|------|-------|
| **Record** | `BuyoutSavingsDispositionItem` |
| **Tier** | W |
| **Root?** | No |
| **Purpose** | Individual savings treatment action: applied to forecast, held in contingency, or released to governed |
| **Repo Truth Status** | Present in current source/runtime direction |

### 4.4 ContingencyTreatmentEntry

| Field | Value |
|------|-------|
| **Record** | `ContingencyTreatmentEntry` |
| **Tier** | A / G |
| **Root?** | Yes |
| **Purpose** | Journal-style record that captures the accounting/forecast treatment of savings and contingency movements |
| **Repo Truth Status** | **Recommended refinement** — current disposition item model would benefit from an explicit treatment journal for period close and auditability |

### 4.5 BuyoutComplianceGateResult

| Field | Value |
|------|-------|
| **Record** | `BuyoutComplianceGateResult` |
| **Tier** | D |
| **Root?** | No |
| **Purpose** | Computed validation output used to block `ContractExecuted` when compliance conditions are incomplete |
| **Repo Truth Status** | Present in current source/runtime direction |

---

## 5. Review / Publication / Custody Entity Family

### 5.1 FinancialReviewCustodyRecord

| Field | Value |
|------|-------|
| **Record** | `FinancialReviewCustodyRecord` |
| **Tier** | A / G |
| **Root?** | Yes |
| **Purpose** | Tracks review submission, reviewer assignment, return-for-revision, reopen reason, and custody timestamps independent of PM-owned financial records |
| **Repo Truth Status** | **Recommended addition** — current repo handles annotation and confirmation but not a full custody ledger |

### 5.2 FinancialAnnotationAnchor

| Field | Value |
|------|-------|
| **Record** | `FinancialAnnotationAnchor` |
| **Tier** | W / G |
| **Root?** | No |
| **Purpose** | Version-aware anchor for reviewer annotations at field, section, or block level |
| **Repo Truth Status** | Present in current source/runtime direction |

### 5.3 CarriedForwardAnnotation

| Field | Value |
|------|-------|
| **Record** | `CarriedForwardAnnotation` |
| **Tier** | D / A |
| **Root?** | No |
| **Purpose** | Derivation-generated lineage record connecting source and target version annotations and PM disposition |
| **Repo Truth Status** | Present in current source/runtime direction |

### 5.4 PublicationRecord

| Field | Value |
|------|-------|
| **Record** | `PublicationRecord` |
| **Tier** | G / A |
| **Root?** | Yes |
| **Purpose** | Formal publication ledger entry tying a Financial version to one reporting run, one reporting period, and one publication outcome |
| **Repo Truth Status** | **Recommended persisted runtime record** — publication handoff concepts exist, but production runtime should store the publication as a first-class record |

### 5.5 PublicationCandidateDesignation

| Field | Value |
|------|-------|
| **Record** | `PublicationCandidateDesignation` |
| **Tier** | G / A |
| **Root?** | No |
| **Purpose** | Audited designation result that marks one confirmed version as the candidate for the period |
| **Repo Truth Status** | Present conceptually in current source/runtime direction |

### 5.6 FinancialExportRun

| Field | Value |
|------|-------|
| **Record** | `FinancialExportRun` |
| **Tier** | A |
| **Root?** | Yes |
| **Purpose** | Audit record for CSV/snapshot/report export operations and downstream extract history |
| **Repo Truth Status** | **Recommended addition** — currently called out as not yet defined in the runtime direction |

---

## 6. Derived / Audit / Projection Entity Family

### 6.1 FinancialAuditEvent

| Field | Value |
|------|-------|
| **Record** | `FinancialAuditEvent` |
| **Tier** | A |
| **Root?** | Yes |
| **Purpose** | Immutable event history for import, edit, confirm, derive, designate, publish, return, reopen, disposition, and export actions |
| **Repo Truth Status** | **Recommended addition** — some provenance exists today, but a unified event ledger is still advisable |

### 6.2 CashFlowSummary

| Field | Value |
|------|-------|
| **Record** | `CashFlowSummary` |
| **Tier** | D |
| **Root?** | No |
| **Purpose** | Aggregate projection summary across actual and forecast cash-flow records |
| **Repo Truth Status** | Present in current source/runtime direction |

### 6.3 BuyoutSummaryMetrics

| Field | Value |
|------|-------|
| **Record** | `BuyoutSummaryMetrics` |
| **Tier** | D |
| **Root?** | No |
| **Purpose** | Derived aggregate for budget totals, savings, completion weighting, and status counts |
| **Repo Truth Status** | Present in current source/runtime direction |

### 6.4 GCGRVarianceResult

| Field | Value |
|------|-------|
| **Record** | `GCGRVarianceResult` |
| **Tier** | D |
| **Root?** | No |
| **Purpose** | Computed rollup for GC/GR variance posture |
| **Repo Truth Status** | Present in current source/runtime direction |

### 6.5 FinancialHealthMetric

| Field | Value |
|------|-------|
| **Record** | `FinancialHealthMetric` |
| **Tier** | D |
| **Root?** | No |
| **Purpose** | Health-spine publication record for financial posture |
| **Repo Truth Status** | Present in current source/runtime direction |

### 6.6 FinancialActivityEvent

| Field | Value |
|------|-------|
| **Record** | `FinancialActivityEvent` |
| **Tier** | D / A |
| **Root?** | No |
| **Purpose** | Activity-spine publication record for visible module events |
| **Repo Truth Status** | Present in current source/runtime direction |

### 6.7 FinancialWorkQueueItem

| Field | Value |
|------|-------|
| **Record** | `FinancialWorkQueueItem` |
| **Tier** | D |
| **Root?** | No |
| **Purpose** | Work-queue publication record for unresolved operational conditions |
| **Repo Truth Status** | Present in current source/runtime direction |

---

## 7. Minimal Required Additions Beyond Current Source Truth

The following records should be treated as the minimum additions needed to turn the current contract family into a complete runtime model:

| Record | Reason |
|------|--------|
| `FinancialReportingPeriod` | Clean period close/reopen and publication governance |
| `ForecastSummarySnapshot` | Required to persist the summary as review/published evidence |
| `GCGRLine` source contract completion | Required to finish T04 and complete the forecast working model |
| `CommitmentReference` | Required to correctly represent external commitment truth without collapsing it into buyout |
| `FinancialReviewCustodyRecord` | Required for return-for-revision, reopen, and review assignment traceability |
| `PublicationRecord` | Required for real publication auditability |
| `FinancialExportRun` | Required for extract lineage and release evidence |
| `PayAppActualMonthReference` | Required if draw/pay-app lineage is to be operationally visible rather than merely implied |

---

## 8. Modeling Recommendation

Do **not** collapse this model into one “Financial Header” plus a few child tables. The module should be built as a deliberately multi-aggregate runtime system, with each family preserving its own authority boundary.

That is the only clean way to replace:

- the imported Procore budget baseline
- the PM-owned monthly forecast process
- the macro-driven GC/GR workbook
- the cash-flow / draw-schedule workbook
- the buyout workbook
- the A/R aging reference view
- the review/publication packet process

---

*Navigation: [← FRM-00 Master Index](FRM-00-Financial-Runtime-Entity-Model.md) | [FRM-02 Aggregate and Relationship Model →](FRM-02-Aggregate-and-Relationship-Model.md)*
