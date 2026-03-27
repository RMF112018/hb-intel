# PH3-FIN-SOTL-A1 — Default Registries and Role Boundaries

| Property | Value |
|----------|-------|
| **Doc ID** | PH3-FIN-SOTL-A1 |
| **Parent** | [PH3-FIN-SOTL Financial Source-of-Truth Lock](PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Appendix — Default Registries and Role Boundaries |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |
| **Status** | Locked — Active Reference |

---

*This appendix captures the default governed registries, approval defaults, role boundaries, and override-oriented operational defaults referenced by the Financial Source-of-Truth Lock. It is intentionally split out so the parent lock remains readable while still preserving the explicit defaults needed for runtime design, permissions, and policy administration.*

---

## 1. Default Governed Adjustment Category Library

The Manager of Operational Excellence (MOE) governs the global category framework. Categories apply globally first and may then be altered project by project under governed override.

| Category | Default Purpose |
|---|---|
| Budget source correction pending upstream | Forecast treatment needed while authoritative budget correction is still pending upstream |
| Actual-cost source correction pending upstream | Forecast treatment needed while imported actual-cost issue remains unresolved upstream |
| Pending owner change impact | Likely / pending owner-side commercial impact not yet approved into baseline |
| Pending subcontractor / vendor commitment impact | Forecast treatment of likely buyout / commitment movement before formal commitment state is updated |
| Buyout scope-gap / carry-gap impact | Internal buyout gap, carry scope, or turnover issue affecting forecast |
| Procurement timing / long-lead impact | Long-lead, procurement, or sequencing issue affecting cost / risk timing |
| Schedule-delay / damages / time-extension impact | Schedule-driven commercial effect, damages risk, or extension-related forecast treatment |
| Cash-flow timing adjustment | Forecast-only shift in timing of inflows / outflows |
| Receivables / owner-payment exposure | Collection, aging, owner-payment, or cash realization risk |
| Contingency allocation / draw | Working-period contingency usage or projected contingency need |
| Buyout-savings disposition | Working-period treatment of realized or expected buyout savings |
| Forecast-only management reserve / judgment layer | Explicit management-judgment layer used in working forecast treatment |
| Other governed exception | Controlled fallback category when none of the above fits |

**Activation model**
- MOE may activate only the subset needed for a given project.
- MOE may add governed project-specific categories where justified.

---

## 2. Materiality Threshold Default Model

### 2.1 Governance
- MOE governs companywide default materiality-threshold rules.
- Thresholds may be adjusted by project, business unit, or project type where justified and approved.

### 2.2 Basis Model
Use a governed combination of:
- fixed dollar bands,
- percentage-based tests against the relevant financial base,
- and category-specific logic.

### 2.3 Threshold Use Cases
Thresholds should be capable of governing, at minimum:
- adjustment approval requirements,
- contingency decision escalation,
- buyout-savings treatment escalation,
- stale or warning visibility escalation,
- and any other approval-required financial exception.

---

## 3. Default Role Boundaries

### 3.1 PM Default Boundary

| PM May | PM May Not |
|---|---|
| Create / edit working versions | Approve / confirm forecasts |
| Create adjustments / exceptions | Reopen closed periods |
| Create GC/GR revisions | Approve governed adjustments requiring PE / higher approval |
| Create cash-flow revisions | Return an engaged review to working once reviewer custody begins |
| Force-refresh locked budget snapshots while report is in PM court |  |
| Submit for review |  |
| Pull back from review only while untouched |  |

### 3.2 PE Default Boundary

| PE May | PE May Not by Default |
|---|---|
| Review submitted forecasts | Reopen closed periods directly unless delegated |
| Move forecasts into In Review |  |
| Return forecasts for revision |  |
| Approve / confirm forecasts |  |
| Approve governed adjustments requiring PE review |  |
| Approve contingency / savings treatment when policy requires |  |
| Request reopen of closed periods |  |

**Governed flexibility**
- MOE-governed policy may grant limited additional PE operational authority where justified.

### 3.3 Accounting / Finance Default Boundary

| Accounting / Finance May | Accounting / Finance Does Not Own by Default |
|---|---|
| Validate imported actuals | PM/PE forecast preparation custody |
| Attach source-clarification notes | Final forecast approval custody |
| Flag discrepancies |  |
| Confirm receivables / billing interpretation |  |
| Participate in limited review steps |  |

### 3.4 MOE Default Boundary

| MOE Governs | MOE May Also Do in Exceptional Cases |
|---|---|
| Companywide policy defaults | Reopen approval |
| Status model and workflow defaults | Policy-exception enforcement |
| Threshold and category libraries | Audit-correction oversight |
| Override records | Delegated approval |
| Trigger registries | Recovery actions when project custody breaks down |
| Reporting cadence defaults |  |

### 3.5 Leadership / Executive (Non-Assigned) Default Boundary

| Leadership / Executive May by Default | Leadership / Executive May Not by Default |
|---|---|
| View forecasts | Directly edit working financial content |
| View in-review and confirmed packets | Approve project forecasts |
| View exposures, cash-flow position, buyout summary, and audit history | Reopen periods |
| Comment / annotate where allowed | Intervene in project custody |

**Exception model**
- Specific elevated leadership roles may be granted governed approval or intervention authority by policy, business unit, or project exception.

---

## 4. Reopen Authority Default Model

### 4.1 Closed Period Reopen
- Closed periods are immutable by default.
- Default reopen authority belongs to the **MOE** and a limited designated higher-governance set.
- A **PE** may request reopen or be granted delegated reopen authority by policy or approved exception.

### 4.2 Required Reopen Audit Payload
Every reopen action should capture at minimum:
- actor,
- timestamp,
- project,
- reporting period,
- prior closed / archived state,
- target reopened state,
- reason code,
- rationale,
- and any delegated-authority context.

---

## 5. Default Workflow Status Framework

Use the following as the default governed workflow status set:

- Working
- Ready for Review
- In Review
- Returned for Revision
- Approved / Confirmed
- Stale
- Superseded
- Closed / Archived

### 5.1 Default Transition Path

| From | To |
|---|---|
| Working | Ready for Review |
| Ready for Review | In Review |
| In Review | Returned for Revision; Approved / Confirmed |
| Returned for Revision | Working |
| Approved / Confirmed | Stale; Closed / Archived |
| Stale | Working only through explicit revision / return / reopen logic |
| Closed / Archived | Reopen only by governed elevated authority |

**Governance**
- MOE or designated elevated role governs the status framework.
- MOE-governed exceptions may allow selected alternate paths.

---

## 6. Default Stale Trigger Registry Baseline

### 6.1 Staling by Default
- budget snapshot refresh
- actual-cost refresh
- commitment commercial sync affecting forecast
- pay-app actual update affecting cash flow
- approved change-impact update
- GC/GR value change
- cash-flow value change
- approved adjustment / exception change
- contingency / savings treatment change
- key schedule fact change

### 6.2 Warning-Only by Default
- pending owner-change updates
- buyout enrichment changes
- exposure commentary changes
- receivables-risk changes

### 6.3 Non-Staling by Default
- notes
- annotations
- reviewer comments
- display / order changes
- non-financial metadata

**Governance**
- MOE maintains the field/domain trigger registry and may reclassify items by policy, project type, or approved override.

---

## 7. Project-Level Override Governance

### 7.1 Default Override Rule
- The PE / project team may request or propose project-level overrides.
- The MOE or designated elevated governance role must approve and maintain the authoritative override record.

### 7.2 Typical Override Classes
- project-specific adjustment categories,
- project-specific threshold tuning,
- permission deviations,
- workflow simplification / expansion,
- delegated reopen authority,
- project-specific stale-trigger variations.

---

## 8. Audit Payload Default Model

### 8.1 Required Core Audit Payload
Every governed action should capture:
- actor
- timestamp
- action type
- project
- reporting period
- version / forecast reference
- affected record(s)
- prior state / value summary
- new state / value summary

### 8.2 Extended Payloads Where Applicable
- reason code
- freeform rationale
- reviewer / approver context
- linked source evidence
- source snapshot reference
- upstream sync reference
- downstream-impact notice
- reopen / return-for-revision context

### 8.3 Governed Actions Requiring Audit
- force-refresh locked budget snapshot
- create / approve adjustment
- return forecast for revision
- confirm forecast
- reopen closed period
- manual pay-app correction
- override / exception approval

---

## 9. Implementation Note

This appendix exists to keep the parent source-of-truth lock readable while preserving the explicit defaults needed for:
- runtime modeling,
- policy administration,
- permission design,
- override handling,
- and acceptance review.

If a future role / permission matrix or stale-trigger registry is created, it should inherit these defaults unless explicitly superseded through governed revision.

---

*Navigation: [← PH3-FIN-SOTL Financial Source-of-Truth Lock](PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md)*
