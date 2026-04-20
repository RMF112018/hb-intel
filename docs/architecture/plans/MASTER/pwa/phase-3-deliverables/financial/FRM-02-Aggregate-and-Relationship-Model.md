# FRM-02 — Financial Aggregate and Relationship Model

| Property | Value |
|----------|-------|
| **Doc ID** | FRM-02 |
| **Parent** | [FRM-00 Financial Runtime Entity Model](FRM-00-Financial-Runtime-Entity-Model.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Aggregate and Relationship Model |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the aggregate boundaries, parent-child structures, identity layers, and cross-aggregate relationships for the Financial runtime model. It is intended to prevent the module from being implemented as a loose collection of records without intentional mutation boundaries.*

---

## 1. Aggregate Design Principles

### 1.1 Why aggregate boundaries matter here

The current Financial operating process combines imported truth, PM-authored working state, review evidence, and publication artifacts. If those records are implemented without clear boundaries, the result will be:

- accidental mutation of confirmed/published state
- weak import lineage
- unclear ownership between buyout and forecast
- loss of review/publication custody
- difficult cutover from workbook workflows

### 1.2 Aggregate rules

Each aggregate in the Financial module should obey these rules:

1. One clear aggregate root
2. Child records mutate only through the root
3. Cross-aggregate references use IDs, not embedded ownership
4. Imported and native working records do not share the same mutation path
5. Review/publication evidence never mutates PM-owned working records directly

---

## 2. Primary Aggregate Family

### 2.1 ForecastVersionAggregate

This is the main monthly operating aggregate.

#### Root

- `ForecastVersion`

#### Child records

- `BudgetLine`
- `ForecastChecklistItem`
- `ForecastSummarySnapshot`
- `GCGRLine`
- `CashFlowForecastMonth`
- `FinancialAnnotationAnchor`
- `CarriedForwardAnnotation`

#### Inbound references

- `FinancialReportingPeriod`
- `BudgetImportBatch`
- `FinancialReviewCustodyRecord`
- `PublicationRecord`
- `FinancialExportRun`

#### Why this aggregate exists

The monthly forecast process must be editable, confirmable, reviewable, and publishable as one coherent unit. All version-scoped PM working records belong together under a single root.

#### Key rule

A confirmed or published version is never reopened for in-place edit. Any further work happens through a new Working version derived from the prior governed version.

---

### 2.2 BudgetImportAggregate

This aggregate protects imported budget lineage.

#### Root

- `BudgetImportBatch`

#### Child records

- `BudgetImportRow`
- `BudgetLineReconciliation`

#### Outbound effects

- creates or refreshes `BudgetLine` children under the active Working `ForecastVersion`
- may increment or resolve `staleBudgetLineCount`
- may create reconciliation conditions that block confirmation

#### Why this aggregate exists

Budget import is externally authoritative. It should not be implemented as a generic edit on working budget lines.

#### Key rule

Imported lineage remains immutable after the batch is created. PM resolution can act on reconciliation conditions, but cannot rewrite the raw imported source history.

---

### 2.3 BuyoutAggregate

This aggregate protects project-scoped procurement control.

#### Root

- `BuyoutLine`

#### Child records

- `BuyoutSavingsDisposition`
- `BuyoutSavingsDispositionItem`

#### Inbound references

- `CommitmentReference`
- `BuyoutComplianceGateResult`
- `ContingencyTreatmentEntry`

#### Why this aggregate exists

Buyout is project-scoped procurement control, not a monthly forecast child table. It must continue across months and should not be copied or version-derived each reporting cycle.

#### Key rule

Buyout lines are live project records. They influence monthly financial posture, but do not belong to the monthly versioning aggregate.

---

### 2.4 CashFlowReferenceAggregate

This aggregate protects imported actuals and receivables reference truth.

#### Root options

This can be modeled either as a formal root record or as a project-period keyed family. The recommended practical root is:

- `FinancialReportingPeriod`

#### Child / related records

- `CashFlowActualMonth`
- `PayAppActualMonthReference`
- `ARAgingRecord`
- `RetentionConfig`

#### Outbound references

- `CashFlowForecastMonth` records on `ForecastVersionAggregate`
- `CashFlowSummary`

#### Why this aggregate exists

Actuals and receivables are read-only imported/reference truth and should not share the same ownership or mutation rules as PM-authored forecast months.

#### Key rule

Actuals remain read-only; forecast months remain version-owned working state.

---

### 2.5 ReviewPublicationAggregate

This aggregate protects review and release custody.

#### Root

Choose one of these as root based on workflow shape:

- `FinancialReviewCustodyRecord` for review-oriented actions
- `PublicationRecord` for final release/published actions

#### Child / related records

- reviewer assignment metadata
- return/revision events
- publication handoff result metadata
- export runs
- review closure evidence

#### Why this aggregate exists

Review/publication evidence must remain separate from PM-owned financial source-of-truth records.

#### Key rule

Review artifacts can reference financial records and version states, but cannot directly mutate them except through governed lifecycle transitions.

---

## 3. Identity Model

### 3.1 Identity layers

| Layer | Identity |
|------|----------|
| Project | `projectId` |
| Reporting cycle | `periodKey` or `projectId + reportingMonth` |
| Version | `forecastVersionId` |
| Budget line | `canonicalBudgetLineId` |
| Buyout line | `buyoutLineId` |
| Commitment mirror | `commitmentReferenceId` |
| Annotation | `annotationId` or source/target annotation IDs |
| Publication | `publicationRecordId` |

### 3.2 Identity rules

| Rule | Requirement |
|------|-------------|
| Budget identity | `canonicalBudgetLineId` must survive import cycles and remain stable across version derivation |
| Version identity | Every Working, Confirmed, Published, and Superseded version gets its own identity |
| Buyout identity | Buyout line identity is stable across months; buyout is not copied into versions |
| Review identity | Annotation/review/publication records have their own IDs and never rely only on embedded version metadata |
| Imported references | Commitment, A/R, and pay-app mirrors require external-source identity plus local reference identity |

---

## 4. Relationship Model

### 4.1 Primary relationships

| Parent | Relationship | Child / Reference | Notes |
|-------|--------------|------------------|------|
| `Project` | 1:n | `FinancialReportingPeriod` | One project has many reporting periods |
| `FinancialReportingPeriod` | 1:n | `ForecastVersion` | One period can contain multiple versions |
| `ForecastVersion` | 1:n | `BudgetLine` | Version-scoped line working state |
| `ForecastVersion` | 1:1 | `ForecastSummarySnapshot` | One governing summary per version |
| `ForecastVersion` | 1:n | `GCGRLine` | Version-scoped GC/GR working lines |
| `ForecastVersion` | 1:n | `ForecastChecklistItem` | Version-scoped checklist items |
| `ForecastVersion` | 1:n | `CashFlowForecastMonth` | Version-scoped forecast months |
| `Project + Period` | 1:n | `CashFlowActualMonth` | Actual history for the period context |
| `Project + Period` | 1:n | `ARAgingRecord` | Imported A/R snapshots |
| `Project` | 1:n | `BuyoutLine` | Project-scoped buyout control |
| `BuyoutLine` | 0:1 | `BuyoutSavingsDisposition` | Only when savings exist |
| `BuyoutSavingsDisposition` | 1:n | `BuyoutSavingsDispositionItem` | One disposition can have many actions |
| `ForecastVersion` | 0:n | `FinancialAnnotationAnchor` | Reviewer anchors on governed versions |
| `FinancialAnnotationAnchor` | 0:n | `CarriedForwardAnnotation` | Carry-forward lineage |
| `ForecastVersion` | 0:1 | `PublicationRecord` | One published record per published version |
| `ForecastVersion` | 0:n | `FinancialAuditEvent` | Immutable operational history |

### 4.2 Cross-aggregate references

| From | To | Why |
|------|----|-----|
| `BuyoutLine` | `CommitmentReference` | Align procurement-control state with executed commitments |
| `BuyoutLine` | `Subcontract Execution Readiness decision/gate projection` | Block `ContractExecuted` until readiness gate passes |
| `ForecastSummarySnapshot` | `Schedule summary fields / milestones` | Pull schedule context without making Schedule an owned child |
| `BudgetLine` | `Change / pending impact references` | Preserve cost exposure linkage without collapsing Constraints into Financial |
| `PublicationRecord` | `P3-F1 report run` | Tie final publication to reports workspace output |
| `FinancialWorkQueueItem` | `ForecastVersion`, `BudgetLine`, or `BuyoutLine` | Provide actionable context without changing ownership |

---

## 5. Ownership Boundaries

### 5.1 What ForecastVersion owns

`ForecastVersion` owns all records that are specific to one mutable or governed monthly forecast state:

- checklist
- budget-line FTC posture
- summary snapshot
- GC/GR lines
- forecast cash-flow months
- review anchors on that version

### 5.2 What ForecastVersion does NOT own

`ForecastVersion` does **not** own:

- imported budget source rows
- imported A/R records
- imported actual cash-flow records
- project-level retention settings
- buyout lines
- commitment mirrors
- publication registry as a generic system-wide release log

### 5.3 What Buyout owns

`BuyoutLine` owns:

- procurement lifecycle state
- realized savings posture
- disposition workflow children

It does **not** own monthly forecasting state. It informs it.

### 5.4 What Review / Publication owns

Review/publication custody owns:

- reviewer assignment / custody
- return reason / reopen reason
- publication outcomes
- export auditability

It does **not** own PM working records and cannot rewrite them directly.

---

## 6. Recommended Persistence Shape

### 6.1 High-level persistence pattern

| Aggregate | Recommended shape |
|----------|-------------------|
| ForecastVersionAggregate | Header + child-family persistence grouped by `forecastVersionId` |
| BudgetImportAggregate | Immutable import batch + row detail + reconciliation ledger |
| BuyoutAggregate | Project-scoped line + disposition container + disposition items |
| CashFlowReferenceAggregate | Project-period keyed reference storage for actuals and receivables |
| ReviewPublicationAggregate | Governance/event ledger keyed to version and period |

### 6.2 What not to do

Avoid these implementation shortcuts:

- one generic “FinancialRecord” table with polymorphic payloads
- storing review/publication state as only extra columns on `ForecastVersion`
- making buyout a tab-only child of the forecast version
- merging imported actuals with forecast rows into one editable table
- reusing the current simplified SharePoint financial list family as the final runtime schema

---

## 7. Implementation Recommendation

Implement the aggregate boundaries first in code and repository seams, even before all UI surfaces are complete. That preserves the model’s integrity while PWA/SPFx surfaces are still being built.

The correct order is:

1. finish source contracts for T04
2. register the Financial repository façade
3. implement the aggregate-aware persistence seams
4. build PWA working surfaces against those seams
5. close review/publication custody and export history
6. retire workbook operations through parallel-run evidence

---

*Navigation: [← FRM-01 Entity Catalog](FRM-01-Entity-Catalog.md) | [FRM-03 State, Mutability, and Lifecycle →](FRM-03-State-Mutability-and-Lifecycle.md)*
