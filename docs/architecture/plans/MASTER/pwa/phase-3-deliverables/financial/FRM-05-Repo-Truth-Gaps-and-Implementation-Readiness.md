# FRM-05 — Financial Repo-Truth Gaps and Implementation Readiness

| Property | Value |
|----------|-------|
| **Doc ID** | FRM-05 |
| **Parent** | [FRM-00 Financial Runtime Entity Model](FRM-00-Financial-Runtime-Entity-Model.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Repo-Truth Gaps and Implementation Readiness |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-28 |
| **Maturity Model** | [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md) — canonical stage classifications for all Financial tools and dimensions |
| **Runtime Governance** | [Financial-RGC](Financial-Runtime-Governance-Control.md) — locked persistence families, repository seams, and domain ownership |

---

*This file reconciles the proposed Financial runtime entity model against current repo truth and identifies what still must be completed before the Financial module can operate as a true workbook replacement rather than a domain-contract package plus placeholder UI.*

---

## 1. Readiness Summary

### 1.1 What is already strong

| Area | Status |
|------|--------|
| Financial doctrine | Strong |
| Workbook replacement framing | Strong |
| Budget/import model | Strong |
| Version/checklist model | Strong |
| Cash-flow model | Strong |
| Buyout model | Strong |
| Activity/health/work-queue publication model | Strong |
| Annotation / carry-forward design | Strong |

### 1.2 What is still blocking runtime completion

| Area | Status |
|------|--------|
| T04 source contracts | Blocking |
| Repository factory registration | Blocking |
| PWA Financial route/page family | **Partially resolved** — route registered, `FinancialControlCenter` renders with 5 sub-surfaces via state-based navigation, but all data is mock; sub-tool navigation is not URL-routed; deep links to sub-tools do not work |
| P3-F1 publication handoff | Partial |
| Runtime review/publication custody records | Missing as first-class runtime records |
| Full reference model for commitments / pay-app actuals | Incomplete |

---

## 2. Present Truth vs Target Runtime

### 2.1 Present truth

The current repo is strongest in **contract-level domain modeling**.

It already knows, at the design level, that Financial requires:

- budget import and identity resolution
- versioned forecast lifecycle
- checklist-gated confirmation
- GC/GR working model
- cash-flow actuals and forecasts
- buyout control and savings treatment
- review annotation isolation
- health/activity/work-queue publication

### 2.2 Target runtime

The target runtime is stronger in **operational closure**.

It requires:

- first-class reporting periods
- complete source contracts for T04
- real Financial surfaces in PWA
- registered and consumable repository seams
- first-class custody/publication/export audit records
- parallel-run/cutover evidence against the real workbook process

---

## 3. High-Impact Repo Gaps

### 3.1 T04 source completion

**Gap**

`IFinancialForecastSummary`, `IGCGRLine`, and their supporting enums remain the main contract-level source gap.

**Why it matters**

Without these, the Forecast Summary and GC/GR working model cannot become first-class operational runtime records.

**Impact**

- blocks complete forecast working surface
- blocks summary snapshot persistence
- blocks GC/GR runtime model closure
- blocks part of the acceptance gate

**Priority**

Critical

---

### 3.2 Financial repository registration

**Gap**

The Financial repository façade direction exists, but it is not wired into the standard data-access export/factory pattern.

**Why it matters**

Without registration, no standard PWA hooks/pages can consume Financial like the other module families.

**Impact**

- no real module consumption path
- UI work risks bypassing the intended repository pattern
- mock/runtime integration remains fragmented

**Priority**

Critical

---

### 3.3 PWA Financial route and page family

**Gap (revised 2026-03-28)**

Financial sub-surfaces for Budget, Forecast Summary, Cash Flow, and Buyout exist as UI components rendered within `FinancialControlCenter` via state-based `surfaceMode` navigation. GC/GR is not yet surfaced as a distinct UI component. However:

- All surfaces consume hardcoded mock data from hooks, not real repository data
- Sub-tool navigation is `useState`-based, not URL-routed — browser refresh loses position
- No deep-link routes to `/financial/budget`, `/financial/forecast-summary`, etc. exist
- The surfaces are not yet operational working tools — no data persistence, no multi-user state

**Why it matters**

The Financial module UI scaffold exists but cannot support real operating workflows until data access is wired and sub-tool navigation is URL-routed.

**Revised impact**

- workbook replacement cannot start until data access is wired and URL-routed sub-tools exist
- no runtime proof of budget/forecast workflows (mock data only)
- no cross-lane operational validation (SPFx lane is infrastructure stubs)

**Priority**

Critical

---

### 3.4 Publication handoff closure

**Gap**

PublishedMonthly promotion is still partially dependent on the unresolved P3-F1 handoff wiring.

**Why it matters**

Without this, the reporting-period lifecycle cannot close cleanly.

**Impact**

- no true published monthly outcome
- incomplete reporting-cycle governance
- workbook retirement remains risky

**Priority**

High

---

### 3.5 Simplified SharePoint financial lists vs final runtime model

**Gap**

The current provisioning-era Financial lists are much simpler than the target runtime.

**Why it matters**

They are suitable as transitional scaffolding, but not as the final runtime persistence design.

**Impact**

- risk of under-modeling period/version/review/publication data
- risk of collapsing imported/native/governed boundaries
- risk of implementing workbook-shaped persistence instead of runtime-shaped persistence

**Priority**

High

---

## 4. Gaps Introduced by the Proposed Runtime Model

These are not defects in the proposal. They are additions the proposal makes explicit.

### 4.1 FinancialReportingPeriod

**Status**

Not yet modeled as a first-class runtime record.

**Why it should be added**

A period record simplifies candidate uniqueness, close/reopen, and final publication governance.

### 4.2 CommitmentReference

**Status**

Not yet modeled as a first-class Financial runtime mirror/reference family.

**Why it should be added**

Current operating commitment data is materially richer than a simple buyout note or attachment.

### 4.3 FinancialReviewCustodyRecord

**Status**

Not yet a first-class runtime record.

**Why it should be added**

Review assignment, return-for-revision, reopen reason, and custody timestamps should not live only as implied side effects.

### 4.4 PublicationRecord

**Status**

Exists conceptually, but should become persisted runtime truth.

**Why it should be added**

Publication is a governed business outcome and should be queryable/auditable without reconstructing everything from external run state.

### 4.5 FinancialExportRun

**Status**

Not yet defined as a real record.

**Why it should be added**

Workbook replacement and release-readiness will eventually require extract-lineage and export auditability.

### 4.6 PayAppActualMonthReference

**Status**

Not yet explicit in the runtime record family.

**Why it should be added**

The cash-flow / draw-schedule process implies monthly owner-billing reality that is useful as a distinct reference layer.

---

## 5. Open Implementation Implications

### 5.1 Period modeling decision

**Recommendation**

Add `FinancialReportingPeriod` as a formal root record rather than keeping the period concept implicit on the version only.

### 5.2 Review custody decision

**Recommendation**

Do not expand the version enum to hold every review state. Use a separate `FinancialReviewCustodyRecord`.

### 5.3 Buyout-to-forecast relationship decision

**Recommendation**

Keep Buyout project-scoped and non-versioned. Let it influence the monthly forecast through references and derived metrics rather than copying buyout lines into each version.

### 5.4 Commitment handling decision

**Recommendation**

Mirror commitments into a read-only `CommitmentReference` family rather than forcing commitment state into the buyout schema.

### 5.5 Draw schedule handling decision

**Recommendation**

Treat draw schedule timing as part of the cash-flow / pay-app reference model rather than creating a standalone draw-schedule aggregate in Phase 3.

---

## 6. Recommended Sequencing

### 6.1 Sequence A — minimum path to operational runtime

| Step | Work Item |
|------|-----------|
| 1 | Finish T04 source contracts |
| 2 | Register Financial in the data-access port/factory pattern |
| 3 | Add `FinancialReportingPeriod` and finalize aggregate-aware repository seams |
| 4 | Build PWA Financial surfaces for budget, forecast, GCGR, cash flow, and buyout |
| 5 | Add review/publication custody and publication persistence |
| 6 | Add export auditability |
| 7 | Run parallel-cycle validation against live workbook process |

### 6.2 Sequence B — workbook retirement readiness

Workbook retirement should occur only after:

- two consecutive monthly forecast cycles run successfully through the runtime
- budget imports reconcile reliably
- GC/GR outputs match expected workbook outcomes
- cash-flow projections and actuals are trusted
- buyout savings disposition is operational
- publication handoff is closed
- export and review evidence is queryable

---

## 7. Readiness Call

### 7.1 Ready now

The repo is ready now for:

- finishing the runtime model docs
- finishing T04 source contract work
- wiring the data-access façade
- building real Financial surfaces against the established domain logic

### 7.2 Not ready yet

The repo is not yet ready for:

- workbook retirement
- final release-readiness signoff for Financial
- complete reporting-cycle closure
- full end-to-end monthly publication replacement

### 7.3 Overall assessment

**Assessment: strong contract foundation, incomplete operational closure**

That is a good place to be. The foundation is real. The remaining work is now mostly about:

- surfacing
- seam completion
- custody/publication closure
- cutover proof

---

## 8. Final Recommendation

Use this runtime model as the target architecture for Financial implementation from this point forward.

Do not continue designing Financial as:

- a placeholder accounting page
- a generalized log viewer
- a loose collection of mock domain types
- a thin wrapper around existing spreadsheets

The repo is far enough along that the correct next move is to complete the runtime seams and then build the actual operating surfaces around them.

---

*Navigation: [← FRM-04 Repository and Provider Seam Model](FRM-04-Repository-and-Provider-Seam-Model.md) | [FRM-00 Master Index](FRM-00-Financial-Runtime-Entity-Model.md)*
