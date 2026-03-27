# FRM-04 — Financial Repository and Provider Seam Model

| Property | Value |
|----------|-------|
| **Doc ID** | FRM-04 |
| **Parent** | [FRM-00 Financial Runtime Entity Model](FRM-00-Financial-Runtime-Entity-Model.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Repository and Provider Seam Model |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the recommended repository and provider seam model for the Financial runtime system. It keeps the current `IFinancialRepository` façade concept, but decomposes the runtime behind it into sub-domain seams that better match the actual operating process and aggregate family.*

---

## 1. Present-State Seam Reality

### 1.1 What currently exists conceptually

The current Financial implementation direction already assumes a single module façade:

- `IFinancialRepository`
- `MockFinancialRepository`
- package-level domain logic in `@hbc/features-project-hub/financial`

This is a good top-level UI consumption model.

### 1.2 Present-state seam gap

What is still missing is the standard runtime wiring:

- no Financial export in the data-access port barrel
- no Financial creator in the data-access factory
- no real PWA Financial pages consuming the repository
- incomplete T04 source contracts for the full forecast-summary / GCGR working model

### 1.3 Design implication

The correct path is **not** to abandon the façade. The correct path is:

- keep `IFinancialRepository` as the UI-facing façade
- decompose the implementation behind it into aggregate-aware repositories/services

---

## 2. Recommended Seam Layers

### 2.1 UI façade layer

#### FinancialModuleFacade / IFinancialRepository

This remains the primary consumption seam for PWA/SPFx pages and hooks.

**Responsibilities**

- load project-scoped Financial working data
- issue common mutations used by Financial surfaces
- return coherent cache-replacement payloads for UI refresh
- shield UI from underlying sub-repository fragmentation

**Recommended rule**

UI layers should consume the façade unless they are building a deeply internal operational tool or background workflow.

---

### 2.2 Sub-domain repository layer

These repositories should exist behind the façade.

#### A. FinancialPeriodRepository

**Owns**

- `FinancialReportingPeriod`
- period close/reopen
- current open period lookup
- one-candidate / one-published enforcement at period level

**Why**

Today, the period concept is embedded too lightly inside version metadata.

---

#### B. BudgetImportRepository / BudgetImportService

**Owns**

- `BudgetImportBatch`
- `BudgetImportRow`
- `BudgetLineReconciliation`
- import validation
- identity resolution
- stale-line generation

**Why**

Budget import is externally authoritative and should remain separate from PM working edits.

---

#### C. ForecastVersionRepository

**Owns**

- `ForecastVersion`
- derive / confirm / candidate / supersede / publish transitions
- version history queries
- current working version selection
- latest confirmed / latest published resolution

**Why**

Version lifecycle is the central operating backbone of the Financial module.

---

#### D. BudgetLineRepository

**Owns**

- version-scoped `BudgetLine`
- FTC edits
- line-level note/provenance updates
- stale resolution actions
- line-level audit retrieval

**Why**

Budget-line editing and budget import are related but should not share the same mutation seam.

---

#### E. ForecastSummaryRepository

**Owns**

- `ForecastSummarySnapshot`
- editable summary fields
- summary recomputation
- linkage to summary-derived alerts

**Why**

The forecast summary is a persisted review/publication artifact, not just a transient calculation result.

---

#### F. GCGRRepository

**Owns**

- `GCGRLine`
- line editing
- variance recomputation
- summary rollup contribution

**Why**

GC/GR is currently the main T04 contract gap and deserves an explicit seam.

---

#### G. CashFlowRepository

**Owns**

- `CashFlowActualMonth`
- `CashFlowForecastMonth`
- `CashFlowSummary`
- `RetentionConfig`
- `ARAgingRecord`
- `PayAppActualMonthReference`

**Why**

Actuals/reference truth and PM-authored future cash flow live in the same operational surface but should remain clearly separated by record ownership.

---

#### H. BuyoutRepository

**Owns**

- `BuyoutLine`
- `BuyoutSavingsDisposition`
- `BuyoutSavingsDispositionItem`
- buyout lifecycle transitions
- completion weighting
- compliance gate checks
- reconciliation against commitment references

**Why**

Buyout is a project-scoped sub-domain and should not be treated as just another child table on the version record.

---

#### I. CommitmentReferenceRepository

**Owns**

- `CommitmentReference`
- external commitment mirrors
- reconciliation support for buyout and cost exposure

**Why**

The current operating commitment data is rich enough to justify a first-class reference seam.

---

#### J. FinancialReviewRepository

**Owns**

- `FinancialReviewCustodyRecord`
- `FinancialAnnotationAnchor`
- `CarriedForwardAnnotation`
- return-for-revision and reopen review actions
- reviewer assignment / closure flows

**Why**

Review custody and annotation storage should remain isolated from PM working records.

---

#### K. FinancialPublicationRepository

**Owns**

- `PublicationRecord`
- publication candidate enforcement
- P3-F1 handoff reception
- `FinancialExportRun`
- published-version outcome history

**Why**

Publication is a first-class governed outcome and should be modeled as such.

---

#### L. FinancialAuditRepository

**Owns**

- `FinancialAuditEvent`
- immutable operational event history

**Why**

Cutover, compliance, and reviewability all improve if Financial has one auditable event seam.

---

## 3. Provider Boundary Model

### 3.1 External providers

| Provider | Role in Runtime |
|---------|-----------------|
| Procore connector / CSV interim path | Budget baseline import |
| Sage Intacct / ERP | A/R aging, actual financial references, possibly pay-app/receivables truth |
| P3-F1 Reports | Publication handoff and release coupling |
| Subcontract Execution Readiness | ContractExecuted readiness/compliance gate input |
| Schedule module | Milestone / percent-complete context and eventual forecast alignment |

### 3.2 Internal shared packages

| Shared Package / Surface | Role |
|--------------------------|------|
| `@hbc/field-annotations` | Financial review annotations |
| `@hbc/my-work-feed` | Financial work-queue publication and push-to-team loops |
| `@hbc/related-items` | Cross-module relationship presentation |
| `@hbc/session-state` | Draft recovery for PWA-depth workflows |
| `@hbc/versioned-record` or equivalent version abstractions | Shared version/publication conventions where appropriate |

### 3.3 Provider boundary rule

Provider boundaries should remain narrow:

- external providers publish imported/reference truth
- Financial owns native working state
- Reports owns report generation and release surfaces
- Financial owns its own runtime projections and governance records
- review/publication handoff crosses a seam rather than being embedded directly in PM data

---

## 4. Recommended Façade Contract Shape

### 4.1 Keep the UI façade small and coherent

The façade should support these categories of operations:

| Category | Example Operations |
|---------|--------------------|
| Load | get current working data, version history, published summary |
| Budget | import batch, resolve reconciliation, update FTC |
| Forecast | update summary, toggle checklist, confirm, derive, designate candidate |
| GC/GR | update line, load category summaries |
| Cash flow | update forecast month, refresh actual/reference data |
| Buyout | create/update line, advance status, create disposition item |
| Review | load annotation context, submit/reopen/review custody actions |
| Publication | handoff receive, mark published, export snapshot |

### 4.2 Recommended façade behavior

For UI simplicity, most mutations should return either:

- a full Financial working-state snapshot for cache replacement, or
- a targeted response plus an invalidation token that causes a coherent refetch

### 4.3 Recommended query shape

At minimum, the façade should be able to return:

- current Working version data
- latest ConfirmedInternal version
- latest PublishedMonthly version
- period status
- buyout summary state
- cash-flow reference state
- work queue and health posture summary

---

## 5. Persistence Implications

### 5.1 Transitional persistence vs final runtime persistence

The current financial SharePoint list family is useful as a transitional provisioning-era artifact, but it is not sufficient as the final runtime schema.

It is too shallow and too workbook-shaped.

### 5.2 Final persistence needs

A real runtime implementation needs persistence families for at least:

- reporting periods
- versions
- version-scoped budget lines
- version-scoped summary snapshot
- version-scoped GC/GR lines
- version-scoped checklist items
- version-scoped forecast cash-flow months
- imported actual cash-flow references
- A/R aging references
- commitment references
- buyout lines
- disposition items
- review custody
- publication records
- export runs
- audit events

### 5.3 What not to do

Do not try to force all of this into:

- one generic Financial list
- only the current provisioning-era list family
- a single record with JSON blobs for all children
- a model where publication/review history exists only as columns on the forecast version

---

## 6. Recommended Runtime Query Composition

### 6.1 Working Financial workspace query

The Financial workspace should typically hydrate from multiple sub-seams and then compose into one view model:

```text
FinancialPeriodRepository
  + ForecastVersionRepository
  + BudgetLineRepository
  + ForecastSummaryRepository
  + GCGRRepository
  + CashFlowRepository
  + BuyoutRepository
  + CommitmentReferenceRepository
  = Financial workspace view model
```

### 6.2 Published/reporting query

Published/reporting queries should emphasize frozen/governed records:

```text
FinancialPeriodRepository
  + ForecastVersionRepository (PublishedMonthly)
  + ForecastSummaryRepository
  + BudgetLineRepository (published snapshot)
  + GCGRRepository (published snapshot)
  + CashFlowRepository (published snapshot/reference)
  + PublicationRepository
  = report/published view model
```

### 6.3 Review query

Review queries should compose governed data plus review artifacts:

```text
ForecastVersionRepository (ConfirmedInternal / PublishedMonthly)
  + ForecastSummaryRepository
  + BudgetLineRepository
  + FinancialReviewRepository
  = review surface model
```

---

## 7. Recommended Implementation Order for the Seam Model

| Priority | Step | Why |
|---------|------|-----|
| 1 | Complete T04 source contracts | Unblocks the missing runtime types |
| 2 | Register Financial in data-access factory/barrels | Makes the façade real in app code |
| 3 | Implement aggregate-aware repository internals | Prevents UI from baking in bad boundaries |
| 4 | Build PWA budget / forecast / GCGR / cash-flow / buyout surfaces | Turns contracts into real runtime usage |
| 5 | Add review custody + publication records | Closes the operational loop |
| 6 | Add export auditability and cutover reporting | Supports workbook retirement and acceptance evidence |

---

## 8. Bottom Line

The right Financial implementation is **façade-first for UI consumption, aggregate-aware underneath**.

That gives you:

- a sane UI contract
- strong imported/native/governed separation
- clean lifecycle boundaries
- better future connector readiness
- less risk of implementing the Financial module as a glorified spreadsheet viewer

---

*Navigation: [← FRM-03 State, Mutability, and Lifecycle](FRM-03-State-Mutability-and-Lifecycle.md) | [FRM-05 Repo-Truth Gaps and Implementation Readiness →](FRM-05-Repo-Truth-Gaps-and-Implementation-Readiness.md)*
