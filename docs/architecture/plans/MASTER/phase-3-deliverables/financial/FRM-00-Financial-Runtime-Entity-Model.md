# FRM-00 — Financial Runtime Entity Model

| Property | Value |
|----------|-------|
| **Doc ID** | FRM-00 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Runtime Entity Model (master index) |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This package defines the proposed runtime entity model for the Financial module, grounded in current repo truth, the current workbook-driven operating process, and the governing Financial contract family. It is structured using the same general document pattern as the attached `FRC-05` guide file.*

---

## 1. Purpose

This package translates the Financial module from a workbook-replacement concept into a formal runtime record model that can be implemented, persisted, versioned, governed, and validated.

The model is intended to answer five questions clearly:

1. **What records must exist at runtime**
2. **Which records are imported vs. native vs. derived**
3. **Which records belong to the same aggregate boundary**
4. **How lifecycle, mutability, and review/publication states work**
5. **What repository/provider seams are required to make the module operational**

---

## 2. Scope Boundary

### This package governs

- The proposed runtime record family for the Financial module
- Aggregate boundaries and record ownership
- Lifecycle, mutability, and review/publication state behavior
- Provider and repository seam design
- Repo-truth reconciliation between current implementation and target runtime needs
- Implementation-readiness implications for turning the Financial module into a real operating surface

### This package does NOT govern

- Detailed field-by-field Financial module specification already governed by `P3-E4`
- Detailed workbook crosswalk already governed by `FRC-00` through `FRC-05`
- Final route/page implementation details for the PWA or SPFx lanes
- Final persistence technology decisions beyond the required seam boundaries
- Final P3-F1 reporting handoff contract details

---

## 3. Current-State Reconciliation

### 3.1 What is already true in repo/runtime doctrine

| Area | Current Truth |
|------|---------------|
| Financial doctrine | Financial is a governed project-financial operating surface, not an ERP mirror and not a spreadsheet clone |
| Workbook baseline | The operating files in `docs/reference/example/financial/` are the real current-state process baseline |
| Runtime model direction | The Financial crosswalk package already defines a 34-record runtime family and imported/native/derived boundaries |
| Source package coverage | Financial source types exist for budget/import, forecast versions/checklist, cash flow, buyout, business rules, spines, and annotations |
| Lane doctrine | PWA is full-depth; SPFx is broad, with Launch-to-PWA for deeper workflows |

### 3.2 What is still missing from the live operational surface

| Area | Current Gap |
|------|-------------|
| PWA Financial pages | No real Financial module pages exist yet; `AccountingPage.tsx` is still a placeholder |
| Route surfacing | No dedicated Financial route family with `budget`, `forecast`, `gcgr`, `cash-flow`, and `buyout` working surfaces |
| Data-access registration | `IFinancialRepository` and its mock implementation are not yet wired into the standard factory/export pattern |
| T04 source contracts | `IFinancialForecastSummary`, `IGCGRLine`, and their related enums remain the main contract-level source gap |
| Publication handoff | PublishedMonthly promotion remains partially wired pending the P3-F1 handoff contract |

### 3.3 Key modeling implication

The current repo already contains most of the **domain contract**, but not the full **operational runtime surface**. The correct runtime model therefore must be:

- **project-scoped**
- **reporting-period anchored**
- **versioned for forecast work**
- **project-scoped but non-versioned for buyout control**
- **import-aware for budget, commitments, A/R, and actual cash flow**
- **separate in review/publication custody from PM-owned working records**
- **immutability-driven after confirmation and publication**

---

## 4. Core Modeling Principles

### 4.1 Period-anchor principle

Every Financial operating cycle should be tied to a formal reporting period record rather than relying only on a `reportingMonth` field on a version.

### 4.2 Derivation-not-unlock principle

Once a version is confirmed, changes occur through derivation into a new Working version rather than by reopening and editing the confirmed record in place.

### 4.3 Separation-of-truth principle

The model must preserve strict boundaries between:

- imported external truth
- native PM-authored working state
- governed frozen state
- system-derived projections and publications

### 4.4 Aggregate-first principle

The runtime model should not be treated as a loose collection of tables. It must be implemented as a small number of intentional aggregate families with clear mutation boundaries.

### 4.5 Audit-first principle

Workbook replacement is not complete until import lineage, edit provenance, review custody, publication history, and cutover evidence can all be reconstructed from runtime records.

---

## 5. File Index

| File | Part | Contents |
|------|------|----------|
| **[FRM-01-Entity-Catalog.md](FRM-01-Entity-Catalog.md)** | Entity Catalog | Full runtime record family grouped by imported/reference, working/versioned, buyout, review/publication, and derived/audit records |
| **[FRM-02-Aggregate-and-Relationship-Model.md](FRM-02-Aggregate-and-Relationship-Model.md)** | Aggregate / Relationship Model | Aggregate roots, child records, cross-aggregate references, identity layers, and ownership boundaries |
| **[FRM-03-State-Mutability-and-Lifecycle.md](FRM-03-State-Mutability-and-Lifecycle.md)** | State / Mutability / Lifecycle | Version lifecycle, reporting-period lifecycle, review custody, return-for-revision handling, period close/reopen, and mutability rules |
| **[FRM-04-Repository-and-Provider-Seam-Model.md](FRM-04-Repository-and-Provider-Seam-Model.md)** | Repository / Provider Seams | UI façade, sub-domain repositories, provider boundaries, persistence implications, and recommended seam decomposition |
| **[FRM-05-Repo-Truth-Gaps-and-Implementation-Readiness.md](FRM-05-Repo-Truth-Gaps-and-Implementation-Readiness.md)** | Repo Gaps / Readiness | Present truth vs. target runtime, unresolved gaps, open implementation implications, and recommended sequencing |

---

## 6. Runtime Model Summary

The runtime model is organized into five primary record families:

| Family | Purpose |
|--------|---------|
| **Imported / Reference** | Budget imports, actuals, A/R aging, commitments, dictionaries, period anchors, and other externally authoritative records |
| **Versioned Working State** | Forecast version ledger, budget line working state, forecast summary, checklist, GC/GR, and forecast cash flow |
| **Buyout / Procurement Control** | Project-scoped buyout lifecycle, savings recognition, compliance gate interaction, and disposition workflow |
| **Review / Publication / Custody** | Review assignment/custody, annotations, returned-for-revision lineage, publication handoff, and export auditability |
| **Derived / Audit / Projection** | Health metrics, work queue items, activity events, summary metrics, and immutable event history |

---

## 7. Recommended Primary Aggregates

| Aggregate | Why it exists |
|----------|----------------|
| **ForecastVersionAggregate** | The main monthly financial working/review/published operating boundary |
| **BudgetImportAggregate** | Protects imported budget lineage and reconciliation conditions from being collapsed into working edits |
| **BuyoutAggregate** | Keeps project-wide procurement control separate from monthly forecast-version editing |
| **CashFlowReferenceAggregate** | Separates imported actuals/receivables from PM-authored future cash projections |
| **ReviewPublicationAggregate** | Preserves clean separation between PM-owned operating truth and reviewer/publication evidence |

---

## 8. Bottom-Line Recommendation

The Financial module should be implemented as a **period-anchored, derivation-based, multi-aggregate runtime system** rather than a single “financial table” or a direct spreadsheet facsimile.

The most important additions beyond current source truth are:

- `FinancialReportingPeriod`
- `ForecastSummarySnapshot`
- `GCGRLine` source contracts
- `CommitmentReference`
- `FinancialReviewCustodyRecord`
- `PublicationRecord`
- `FinancialExportRun`
- `PayAppActualMonthReference`

These records are what turn the current design from a strong domain plan into a complete operational runtime model.

---

## 9. Reading Guide

- **Start with** [FRM-01](FRM-01-Entity-Catalog.md) for the complete runtime record family
- **Then read** [FRM-02](FRM-02-Aggregate-and-Relationship-Model.md) for boundaries and ownership
- **Then read** [FRM-03](FRM-03-State-Mutability-and-Lifecycle.md) for lifecycle and governance behavior
- **Then read** [FRM-04](FRM-04-Repository-and-Provider-Seam-Model.md) for implementation seams
- **Finally read** [FRM-05](FRM-05-Repo-Truth-Gaps-and-Implementation-Readiness.md) for what is still missing and what should be built next

---

*Navigation: [FRM-01 Entity Catalog →](FRM-01-Entity-Catalog.md)*
