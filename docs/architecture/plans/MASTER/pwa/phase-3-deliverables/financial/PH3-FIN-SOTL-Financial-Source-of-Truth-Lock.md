# PH3-FIN-SOTL — Financial Source-of-Truth Lock

| Property | Value |
|----------|-------|
| **Doc ID** | PH3-FIN-SOTL |
| **Parent** | Financial plan family (`docs/architecture/plans/MASTER/phase-3-deliverables/financial/`) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Source-of-Truth Lock |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |
| **Status** | Locked — Active Reference |

---

*This file defines the authoritative source-of-truth model for the Project Hub Financial module. It establishes which systems, records, and workflow states are authoritative; which records are native Financial runtime state; which domains are hybrid; who holds custody during each reporting-period state; what governance model applies to overrides, thresholds, categories, and reopening; and what audit and stale-state rules must govern the replacement of the company’s current workbook-driven financial operating process.*

---

## 1. Purpose and Usage

This document is the governing authority boundary file for the Financial module. It is intended to drive:

- runtime record modeling,
- provider / repository seams,
- workflow-state and transition rules,
- mutability and approval boundaries,
- replacement crosswalk mapping,
- migration / backfill planning,
- cutover and parallel-run readiness,
- and Financial acceptance criteria.

This document should be used together with:

- the Financial Replacement Crosswalk,
- the Mutability / Ownership Matrix,
- the Runtime Record and Workflow Spec,
- and the role / permission matrix.

Where future implementation details conflict with this file, this file governs unless it is formally revised.

---

## 2. Scope

This lock applies to the Project Hub Financial module replacement of the company’s current operating workflow, including at minimum:

- budget baseline import and snapshot management,
- actual-cost usage,
- monthly financial forecast working and confirmed versions,
- Forecast Summary,
- Forecast Checklist,
- GC/GR,
- cash flow forecast,
- buyout working-state interpretation,
- receivables / collection-risk interpretation,
- contingency and buyout-savings treatment,
- reporting-period creation, custody, approval, closure, and reopen behavior,
- stale-state handling,
- exception / adjustment policy,
- and audit / override governance.

---

## 3. Governing Principles

1. **Authoritative records must remain distinguishable from interpreted records.** Imported or synced source records must not be silently overwritten by Financial working-state logic.
2. **Financial must own the forecast lifecycle.** If the module is the workbook replacement target, it must be authoritative for working, reviewed, approved, stale, superseded, and closed forecast state.
3. **Hybrid domains must preserve clean boundaries.** Where upstream systems remain authoritative, Financial may still own internal enrichment, interpretation, or forecast-period treatment.
4. **Reporting periods must be governed, not ad hoc.** Each period requires explicit policy, custody, review, approval, closure, and reopen rules.
5. **Governed actions must be auditable.** High-governance actions must leave durable evidence of actor, timing, state change, and rationale.
6. **Global policy defaults must be governable, but not rigid.** MOE-governed defaults may allow controlled project-level or business-unit-level overrides where approved.

---

## 4. Domain Authority Lock

### 4.1 Budget Baseline

| Attribute | Lock |
|---|---|
| **Authority** | Procore budget import |
| **Project Hub Role** | Stores imported copies, history, mappings, diffs, and snapshot references |
| **Not Allowed** | Direct authoring of baseline budget values inside Financial |

**Locked rule**
- Procore budget import is authoritative for the active budget baseline.
- Financial consumes budget through an identifiable import batch and locked period snapshot.
- Budget changes for Financial occur through re-import / refresh behavior, not direct baseline editing.

### 4.2 Actual Cost / Cost-to-Date

| Attribute | Lock |
|---|---|
| **Authority** | External accounting / imported cost reports |
| **Project Hub Role** | Syncs and uses actual-cost values for comparisons and rollups |
| **Not Allowed** | Direct editing of actual-cost records in Financial |

**Locked rule**
- Actual costs are authoritative outside Financial.
- Financial may interpret, compare, and flag actuals, but not replace them.

### 4.3 Monthly Financial Forecast

| Attribute | Lock |
|---|---|
| **Authority** | Project Hub Financial |
| **Project Hub Role** | Owns working versions, review state, approval state, stale-state, supersession, and archival |
| **Derived Outputs** | Exports / packets are generated from Financial-owned forecast versions |

**Locked rule**
- Financial is authoritative for forecast working state and confirmed monthly forecast versions.

### 4.4 Buyout Working State

| Attribute | Lock |
|---|---|
| **Authority** | Hybrid |
| **Project Hub Role** | Owns the internal buyout working-state and enrichment / orchestration layer |
| **External Roles** | Procore = formal commitment record; MSP / P6 = current procurement timing logic |

**Locked rule**
- Current operating workflow basis:
  1. Placeholder commitments are created in Procore.
  2. Procurement / buyout schedule is maintained in Microsoft Project or Primavera P6.
  3. Buyout log is populated from estimating turnover information.
  4. During buyout, the project team updates the schedule, the Procore commitment, and the buyout log.
- Financial must own the internal orchestration / enrichment layer for that workflow.

### 4.5 Formal Commitment Commercial State

| Attribute | Lock |
|---|---|
| **Authority** | Hybrid |
| **External Authority** | Procore Commitments |
| **Project Hub Authority** | Internal enrichment fields tied to the same buyout / commitment line |

**Locked rule**
- Procore Commitments are authoritative for core commercial commitment fields.
- Financial / Project Hub is authoritative for internal enrichment fields tied to the same buyout / commitment line.
- Stable linkage must exist between buyout line and commitment record.

### 4.6 Procurement / Buyout Timing

| Attribute | Lock |
|---|---|
| **Current-State Authority** | MSP / P6 procurement-buyout schedule |
| **Project Hub Role** | Simplified internal timing layer for financial interpretation |
| **Future-State Note** | HB Intel may later become authoritative for the buyout schedule itself |

**Locked rule**
- Financial may maintain simplified internal timing for:
  - financial milestones,
  - long-lead watch dates,
  - readiness thresholds,
  - handoff signals,
  - and review-gate indicators.

### 4.7 Cash Flow Forecast

| Attribute | Lock |
|---|---|
| **Authority** | Project Hub Financial |
| **Current-State Evidence Source** | Uploaded completed pay-app workbook / package |
| **Future-State Sync** | Procore Invoices or Sage Intacct |

**Locked rule**
- Financial is authoritative for the cash-flow forecast working model and confirmed cash-flow versions.

### 4.8 Actual Billed / Completed Pay-App Months

| Attribute | Lock |
|---|---|
| **Authority** | Hybrid |
| **Primary Evidence Source** | Uploaded completed pay-app package |
| **Exception Path** | Authorized manual correction / completion with audit trail |

**Locked rule**
- Uploaded completed pay-app evidence is primary for this version.
- Financial records billed-month actuals from that upload.
- Controlled manual correction is allowed when the upload is missing, incomplete, or malformed.

### 4.9 Schedule Status Inside Financial

| Attribute | Lock |
|---|---|
| **Authority** | Hybrid |
| **External Authority** | Schedule domain for objective schedule facts |
| **Project Hub Role** | Financial schedule-position layer for interpretation and narrative |

**Locked rule**
- Financial may maintain a forecast-cycle-specific internal schedule-position layer for:
  - commentary,
  - assumptions,
  - commercial interpretation,
  - delay / damage framing,
  - and exposure narrative.

### 4.10 Contract Value / Approved Owner Change Effects

| Attribute | Lock |
|---|---|
| **Authority** | Derived from Procore budget data |
| **Current-State Feed** | Budget CSV import |
| **Future-State Feed** | API-fed budget data |

**Locked rule**
- Approved / executed contract-value effects used in Financial must trace back to imported Procore budget data.
- Financial may maintain a separate internal interpretation layer for forecast use, but not redefine the approved baseline.

### 4.11 Pending / Unapproved Owner Change Impacts

| Attribute | Lock |
|---|---|
| **Authority** | Project Hub Financial working-state layer |
| **Visibility Requirement** | Must remain distinct from approved contract value |
| **Approval Requirement** | Explicit categorization and control before inclusion in Ready for Review or Confirmed forecasts |

**Locked rule**
- Pending / probable owner change impacts may be included in working forecast versions only as a separately categorized layer.

### 4.12 Receivables / Owner Billing / Collection Facts

| Attribute | Lock |
|---|---|
| **Authority for Facts** | Accounting / ERP |
| **Authority for Interpretation** | Financial |
| **Interpretive Layer** | Collection-risk / payment-exposure layer |

**Locked rule**
- Accounting / ERP remains authoritative for actual billed, received, outstanding, and aging facts.
- Financial may maintain a separate internal exposure layer for forecast use, narrative, owner-behavior risk, and cash-flow interpretation.

### 4.13 Contingency Usage / Buyout-Savings Treatment

| Attribute | Lock |
|---|---|
| **Authority** | Hybrid |
| **Financial Role** | Authoritative for working-period forecast treatment |
| **Governance Trigger** | Certain material decisions require PE approval and/or policy-based governance |

**Locked rule**
- Financial is authoritative for working-period treatment of contingency usage, buyout-savings treatment, and related profit positioning.

---

## 5. Reporting Period, Snapshot, and Custody Lock

### 5.1 Reporting Period Authority

| Attribute | Lock |
|---|---|
| **Company Policy Authority** | Manager of Operational Excellence (MOE) |
| **Project-Level Operational Authority** | Project Hub Financial |

**Locked rule**
- Company policy defines reporting cadence and default period structure.
- MOE governs those defaults.
- Financial is authoritative for the project-level operational period instance, including:
  - period creation from policy,
  - project-specific data date,
  - court / custody state,
  - review status,
  - approval status,
  - and closure behavior.

### 5.2 Budget Snapshot Locking by Period

**Locked rule**
- Financial must allow teams to lock all budget data as of a specific date/time for the reporting period.
- Once locked for that period:
  - no further syncing of that budget data occurs,
  - GC/GR, Cash Flow, and Summary continue to work from that locked snapshot,
  - and the team is protected from cascading mid-period live-budget changes.
- The next normal budget refresh occurs in the next reporting period unless an explicit forced refresh is used sooner.

### 5.3 Mid-Period Forced Refresh Authority

| Attribute | Lock |
|---|---|
| **Authority** | PM while the report is in the PM’s court |
| **Requirements** | Explicit action, confirmation, full audit trail, downstream impact notice |

**Locked rule**
- The PM has full control of budget freshness while the report is in their court.
- The PM may explicitly force-refresh the locked budget snapshot mid-period.

### 5.4 PM Court / Custody

**Locked rule**
- During PM custody, the PM has working-state control of freshness and preparation.
- The PM may:
  - create working revisions,
  - create adjustments,
  - revise GC/GR and cash flow,
  - and force-refresh locked budget snapshots while the report remains in PM court.

### 5.5 Review Custody

**Locked rule**
- Once submitted as Ready for Review, the PM may pull the forecast back only while it is still unviewed / untouched in review.
- Once the PE or designated reviewer has engaged the review, only that reviewer / approver may return it to the PM for revision.

### 5.6 Forecast Confirmation Authority

**Locked rule**
- The PM prepares and submits the forecast as Ready for Review.
- The PE or designated approver confirms the official monthly forecast.
- Approval path may be role-configurable by policy or business unit where governed.

### 5.7 Reopening Approved / Closed Periods

| Attribute | Lock |
|---|---|
| **Default Behavior** | Closed periods are immutable |
| **Exception Behavior** | Controlled reopen action for exceptional cases |
| **Authority** | Designated higher-governance roles only |

**Locked rule**
- Reopen requires:
  - explicit reopen action,
  - full audit trail,
  - and reason capture.

---

## 6. Workflow Status and Transition Lock

### 6.1 Default Workflow Status Set

Use the following explicit custody / review status model as the default workflow set:

- Working
- Ready for Review
- In Review
- Returned for Revision
- Approved / Confirmed
- Stale
- Superseded
- Closed / Archived

**Governance**
- This status framework is fully governed by the MOE or designated elevated role.
- Governed simplification or variation may be allowed where approved by policy.

### 6.2 Default Workflow Transition Guards

Use the strict linear transition model as the governed default.

| From | Allowed Default Transition(s) |
|---|---|
| Working | Ready for Review |
| Ready for Review | In Review |
| In Review | Returned for Revision; Approved / Confirmed |
| Returned for Revision | Working |
| Approved / Confirmed | Stale; Closed / Archived |
| Stale | Working only through explicit revision / return / reopen logic |
| Closed / Archived | Reopen only by governed elevated authority |

**Exception model**
- MOE-governed exceptions may allow selected alternate transition paths for defined roles, policies, or approved project/business-unit variations.

---

## 7. Adjustment / Exception Lock

### 7.1 Manual Override / Exception Model

**Locked rule**
- Authoritative imported values remain intact.
- Authorized users may create a separate **financial adjustment / exception layer** for forecasting and review.
- That layer must include:
  - reason code,
  - audit trail,
  - actor / timestamp,
  - visibility to reviewers / approvers,
  - and clear separation from the underlying authoritative source value.

### 7.2 Adjustment Category Governance

**Locked rule**
- The MOE has full control over the adjustment / exception category framework.
- Categories are governed globally first as the companywide default set.
- The framework must support project-by-project alteration where needed, with governance and audit.

### 7.3 Materiality Threshold Governance

**Locked rule**
- The MOE governs companywide default materiality-threshold rules.
- Thresholds may be adjusted by project, business unit, or project type where justified and approved.

### 7.4 Threshold Basis Model

**Locked rule**
- Default threshold logic must use a governed combination of:
  - fixed dollar bands,
  - percentage-based tests against the relevant financial base,
  - and category-specific logic.

### 7.5 Adjustment Approval

**Locked rule**
- The PM may create adjustments / exceptions and use them in working versions.
- Certain adjustment types or materiality levels require PE approval before inclusion in a forecast submitted as Ready for Review.

---

## 8. Stale-State Lock

### 8.1 Stale-State Rule

**Locked rule**
- A confirmed forecast becomes **stale** when:
  - a material authoritative upstream input changes, **or**
  - a governed internal financial model changes in a way that affects confirmed outputs.
- Budget-specific stale-state behavior must honor the locked budget snapshot model. Mid-period live sync does not occur unless the PM explicitly forces refresh.

### 8.2 Stale Trigger Policy Structure

**Locked rule**
- Use a governed domain-based default rule plus an explicit field-level trigger registry.
- The registry must classify items as:
  - **staling fields**,
  - **warning-only fields**,
  - **non-staling fields**,
  - plus allowed policy / project overrides where governed.

### 8.3 Default Stale Trigger Classification

| Classification | Default Items |
|---|---|
| **Staling** | budget snapshot refresh; actual-cost refresh; commitment commercial sync affecting forecast; pay-app actual update affecting cash flow; approved change-impact update; GC/GR value change; cash-flow value change; approved adjustment / exception change; contingency / savings treatment change; key schedule fact change |
| **Warning-only** | pending owner-change updates; buyout enrichment changes; exposure commentary changes; receivables-risk changes |
| **Non-staling** | notes; annotations; reviewer comments; display/order changes; non-financial metadata |

**Governance**
- The MOE maintains the field/domain trigger registry and may reclassify items by policy, project type, or approved override.

---

## 9. Role Authority Lock

### 9.1 Default Role-Permission Model

**Locked rule**
- Use a strict default role model.
- Allow governed project-level or business-unit-level permission overrides for approved exceptions.

### 9.2 Project Manager (PM)

**Default PM authority**
- create / edit working versions,
- create adjustments,
- create GC/GR and cash-flow revisions,
- force-refresh locked budget snapshots while the report is in PM court,
- submit for review,
- pull back from review only while untouched.

**Default PM restrictions**
- may not approve / confirm,
- may not reopen closed periods,
- may not approve governed adjustments requiring PE / higher approval,
- may not return an engaged review to working once reviewer custody begins.

### 9.3 Project Executive (PE)

**Default PE authority**
- review submitted forecasts,
- move a forecast into In Review,
- return it for revision,
- approve / confirm the forecast,
- approve governed adjustments / exceptions that require PE review,
- approve contingency / savings treatment when policy requires,
- request reopen of closed periods, but not reopen directly unless delegated.

**Governed flexibility**
- MOE-governed project/business-unit rules may grant limited additional operational authority where justified.

### 9.4 Accounting / Finance

**Default Accounting / Finance authority**
- validate imported actuals,
- attach source-clarification notes,
- flag discrepancies,
- confirm receivables / billing interpretation,
- participate in limited review steps.

**Default restrictions**
- does not own PM/PE forecast preparation custody,
- does not own final forecast approval custody by default.

### 9.5 Manager of Operational Excellence (MOE)

**Default MOE authority**
- governs companywide policy defaults,
- governs status models,
- governs threshold and category libraries,
- governs workflow defaults,
- governs override records,
- governs trigger registries,
- governs reporting cadence defaults,
- approves policy exceptions.

**Controlled elevated operational authority for exceptional cases**
- reopen approval,
- policy-exception enforcement,
- audit-correction oversight,
- delegated approval,
- recovery actions when normal project custody breaks down.

### 9.6 Leadership / Executive (Non-Assigned)

**Default authority**
- read / review only.

**May by default**
- view forecasts,
- view in-review and confirmed packets,
- view exposures, cash-flow position, buyout summary, and audit history,
- comment / annotate where allowed.

**May not by default**
- directly edit working financial content,
- approve project forecasts,
- reopen periods,
- intervene in project custody.

**Exception model**
- Specific elevated leadership roles may be granted governed approval or intervention authority by policy, business unit, or project exception.

---

## 10. Buyout and GC/GR Specific Locks

### 10.1 Buyout Enrichment Ownership Boundary

**Locked rule**
- A shared buyout / procurement sub-domain should own the master internal enrichment record.
- Financial owns the forecast-period interpretation of that record for:
  - monthly reporting,
  - exposure treatment,
  - packet narrative,
  - and approval-cycle use.

### 10.2 GC/GR Version / Confirmation Boundary

**Locked rule**
- The PM may create as many GC/GR revisions / working versions as needed prior to approval.
- For official monthly reporting, GC/GR is only treated as confirmed when it is included in the forecast version approved by the PE.
- Once the forecast for that period is approved:
  - no new version for that period may be created by the PM,
  - unless the PE explicitly returns the forecast to the PM’s court for revision.

---

## 11. Audit Lock

### 11.1 Required Audit Model

Use a required core audit payload for all governed actions, with action-specific extended payloads where needed.

#### Required Core Audit Payload
- actor
- timestamp
- action type
- project
- reporting period
- version / forecast reference
- affected record(s)
- prior state / value summary
- new state / value summary

#### Extended Payloads Where Applicable
- reason code
- freeform rationale
- reviewer / approver context
- linked source evidence
- source snapshot reference
- upstream sync reference
- downstream-impact notice
- reopen / return-for-revision context

#### Governed actions include at minimum
- force-refresh locked budget snapshot
- create / approve adjustment
- return forecast for revision
- confirm forecast
- reopen closed period
- manual pay-app correction
- override / exception approval

---

## 12. Override Governance Lock

### 12.1 Project-Level Override Governance

**Locked rule**
- The PE / project team may request or propose project-level overrides.
- The MOE or designated elevated governance role must approve and maintain the authoritative override record.

**Examples of governed overrides**
- project-specific adjustment categories,
- project-specific threshold tuning,
- permission deviations,
- workflow simplification / expansion,
- delegated reopen authority,
- project-specific stale-trigger variations.

---

## 13. Mutability Summary

### 13.1 Imported / Read-Only Authoritative Layers
- budget baseline import
- actual costs
- core commitment commercial state
- objective schedule facts
- receivables / billing facts
- current-state procurement timing logic
- current-state pay-app evidence package

### 13.2 Native Financial Working-State Layers
- forecast working versions
- Forecast Summary working state
- Forecast Checklist working state
- GC/GR working model
- cash-flow working model
- adjustment / exception layer
- pending change-impact layer
- collection-risk / exposure interpretation
- forecast-period buyout interpretation
- commentary / narrative / exposure sections

### 13.3 Native Governed / Approved Layers
- confirmed forecast versions
- approved review / approval state
- confirmed checklist attestation state
- period closure / reopen records
- governed override records
- audit records

### 13.4 Derived / Published Layers
- monthly export package
- report-candidate outputs
- health / work-queue publications
- summary metrics and comparisons derived from approved or working models

---

## 14. Downstream Documents Governed by This Lock

This document must be used to drive:

1. the Mutability / Ownership Matrix,
2. the Replacement Crosswalk,
3. the Runtime Record Family,
4. the Workflow-State and Transition Spec,
5. the Role / Permission Matrix,
6. the Stale-Trigger Registry,
7. the Acceptance / Cutover Criteria,
8. the Migration / Backfill Logic,
9. and the Project Hub Financial route and surface behavior.

---

## 15. Follow-On Work (Not Unlocked SoT Items)

The source-of-truth model in this file is considered comprehensive. The following are downstream implementation-definition tasks, not unresolved authority-boundary gaps:

- define exact runtime entity names and schemas,
- define exact repository / provider seams,
- define exact materiality values and threshold tables,
- define exact field-level trigger registry,
- define exact override-record schema,
- define exact delegated-authority mechanics,
- define exact export and publication payload shapes.

---

## 16. Approval / Governance Note

This file is intended to serve as the governing Financial source-of-truth lock until superseded by a formally approved revision. Changes to authority boundaries, custody rules, reopen policy, override policy, or default workflow / state logic should be treated as governed changes and reviewed accordingly.

---

*Navigation: [→ PH3-FIN-SOTL-A1 Default Registries and Role Boundaries](PH3-FIN-SOTL-A1-Default-Registries-and-Role-Boundaries.md)*
