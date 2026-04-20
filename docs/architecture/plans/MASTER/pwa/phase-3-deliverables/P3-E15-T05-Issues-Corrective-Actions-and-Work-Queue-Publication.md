# P3-E15-T05 — Issues, Corrective Actions, and Work Queue Publication

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T05 |
| **Parent** | [P3-E15 Project Hub QC Module](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T05 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Operating Principle

QC is the authoritative source of truth for quality issues and corrective actions. My Work / Project Work Queue receives **normalized obligation publications**, not source-of-truth issue ownership. Detailed status reasoning, root cause, evidence sufficiency, approval history, and closure authority remain inside QC.

`QcIssue` captures the quality obligation. `CorrectiveAction` captures one or more actions required to resolve that obligation. Work Queue receives the next move; QC retains the canonical record.

---

## 2. Issue Origination Modes

QC supports exactly three issue-origination modes in Phase 3.

| Origination mode | Trigger | Required lineage |
|---|---|---|
| `finding-origin` | Spawned from `ReviewFinding` | review package id, finding id, affected requirement refs |
| `gate-origin` | Spawned from failed control gate, mockup, test, hold point, or witness point event | originating plan id, gate id/type, failed prerequisite or acceptance criterion |
| `ad-hoc-origin` | Authorized internal HB user observes and logs a quality issue directly | project/user provenance, work-package context, observation rationale |

**Rule:** there is no fourth “silent conversion” path. Every issue must declare one of these origination modes.

---

## 3. `QcIssue` Record Model

### 3.1 Core Object Model

`QcIssue` is the authoritative QC obligation ledger record.

| Field group | Required content |
|---|---|
| Identity | `qcIssueId`, `projectId`, `issueKey`, created/updated provenance |
| Origin | issue origination mode, origin refs, work-package ref, linked plan/review/gate refs |
| Accountability | `ResponsiblePartyAssignment` with mandatory organization, optional individual, designated reviewer/verifier |
| Priority and aging | severity, SLA class, due date, aging band, escalation status |
| Readiness effect | readiness impact, gate impact, handoff impact, blocked/conditional flags |
| Action linkage | zero or more `CorrectiveAction` ids, ready-for-review posture, verification-needed flag |
| Analysis | root-cause required/not-required flag, linked `RootCauseAndRecurrenceRecord` if applicable |
| Publication | work-queue publication state, health contribution flags, scorecard rollup refs |

### 3.2 `QcIssue` Lifecycle

| State | Meaning |
|---|---|
| `intake-open` | Issue has been created and awaits assignment validation |
| `assigned` | Responsible organization / optional individual is set and obligation is active |
| `in-progress` | Work is underway |
| `ready-for-review` | Responsible party asserts issue resolution is complete and requests reviewer/verifier check |
| `verified-closed` | Authorized reviewer/verifier confirms issue resolution |
| `reopened` | Previously verified issue has been reopened due to recurrence or failed verification |
| `voided` | Issue no longer applies |
| `escalated` | Issue exceeds governance threshold or SLA and requires higher attention |

### 3.3 Authoritative Closure Rule

An issue cannot move to `verified-closed` based on responsible-party completion alone. The responsible party may move the issue to `ready-for-review`. Only an authorized reviewer/verifier can confirm `verified-closed`.

---

## 4. `CorrectiveAction` Record Model

`CorrectiveAction` is a child obligation or work item under a `QcIssue`. One issue may have multiple actions.

| Field group | Required content |
|---|---|
| Identity | `correctiveActionId`, `projectId`, `actionKey`, parent `qcIssueId` |
| Accountability | `ResponsiblePartyAssignment`, reviewer/verifier designation |
| Execution | action statement, target completion date, status, escalation flags |
| Evidence | required evidence refs, submitted evidence refs, verification evidence refs |
| Verification | ready-for-review date, reviewed-by, verification result |
| Rollups | contribution to issue closure, health metrics, organization-performance metrics |

### 4.1 `CorrectiveAction` Lifecycle

| State | Meaning |
|---|---|
| `open` | Action created but not yet started |
| `assigned` | Accountability accepted and active |
| `in-progress` | Work underway |
| `ready-for-review` | Responsible party requests verification |
| `verified-closed` | Reviewer/verifier confirms completion |
| `reopened` | Closed action reopened after failed verification or recurrence |
| `voided` | Action no longer needed |
| `overdue` | Due date passed without sufficient progress |
| `escalated` | Aging or risk threshold exceeded |

### 4.2 Issue / Action Relationship Rules

- A `QcIssue` may close only when all required `CorrectiveAction` records are `verified-closed`, or when the issue is resolved without child actions and a verifier closes it directly.
- A child action may not remain `open`, `in-progress`, `ready-for-review`, `overdue`, or `escalated` once the parent issue is `verified-closed`.
- Reopening a child action reopens the parent issue automatically.

---

## 5. Assignment and Accountability

### 5.1 `ResponsiblePartyAssignment` Rules

Both `QcIssue` and `CorrectiveAction` must carry:

- mandatory responsible organization,
- optional named individual,
- assignment effective timestamp,
- assignment rationale,
- designated reviewer/verifier ref,
- escalation fallback.

### 5.2 Accountability Split

| Concern | Responsible party | Reviewer/verifier |
|---|---|---|
| Completes work | Yes | No |
| Moves item to `ready-for-review` | Yes | No |
| Determines final verified closure | No | Yes |
| Reopens due to failed verification or recurrence | No | Yes |

---

## 6. SLA, Aging, and Escalation

### 6.1 SLA Model

QC uses the governed SLA / aging matrix referenced in T02. At minimum, every issue and action must carry:

- SLA class,
- due date,
- aging band,
- escalation threshold,
- current escalation state.

### 6.2 Aging States

| Aging band | Meaning |
|---|---|
| `on-track` | Inside due window |
| `at-risk` | Nearing due threshold |
| `overdue` | Past due threshold |
| `critical-aging` | Materially past due or escalated by risk |

### 6.3 Escalation Triggers

Escalation must occur when any of the following is true:

- issue or action enters `overdue` for a governed escalation class,
- readiness impact becomes material,
- repeated reopen or recurrence pattern appears,
- verifier is not designated in time,
- external approval dependency or evidence gap blocks closure beyond tolerance.

Escalation publishes outward through Work Queue / notifications but remains authoritative only in QC.

---

## 7. Root Cause and Recurrence Hooks

### 7.1 Qualification Rule

Not every issue requires a full root-cause analysis. T05 locks a governed qualification hook:

| Qualification outcome | Requirement |
|---|---|
| `required` | Issue cannot reach final `verified-closed` without linked `RootCauseAndRecurrenceRecord` |
| `not-required` | Issue may close if a governed “not required” classification is recorded with rationale |

### 7.2 Trigger Conditions

Root-cause / recurrence analysis should be required when:

- severity exceeds governed threshold,
- issue reopens,
- recurrence pattern is detected,
- issue affects multiple work packages or responsible organizations,
- or issue materially affects readiness, turnover-quality posture, or management scorecards.

---

## 8. Work Queue Publication Contract

QC publishes obligations into My Work / Project Work Queue, but publishes only the normalized fields required for routing and visibility.

### 8.1 What Publishes Outward

Each outward publication must include:

- normalized work item id,
- source type (`qc-issue` or `qc-corrective-action`),
- project id,
- work-package ref,
- title / short description,
- due date,
- priority / SLA band,
- readiness impact summary,
- current owner,
- reviewer-needed flag,
- deep-link reference back to the QC record,
- publication timestamp,
- publication state.

### 8.2 What Stays Authoritative Only in QC

The following must **not** be treated as Work Queue authority:

- full root-cause reasoning,
- internal deliberation or review narrative,
- detailed evidence sufficiency analysis,
- approval history,
- deviation rationale,
- full recurrence analysis,
- detailed gate logic or package-review logic.

These stay inside QC and are only surfaced through drillback.

### 8.3 Publication Rules

| QC event | Work Queue effect |
|---|---|
| Issue created and assigned | Create work item for responsible organization / individual |
| Corrective action assigned | Create or refresh work item |
| Item moved to `ready-for-review` | Reassign or add reviewer-needed work item |
| Item verified closed | Clear or resolve outward work item |
| Item escalated | Raise priority and escalation visibility |
| Item reopened | Recreate or reactivate outward work item |

---

## 9. Drillback and Drilldown Expectations

Reports and scorecards may consume derived QC metrics, but the QC module remains the only place where issue and action detail is authoritative.

### 9.1 Derived Metrics Allowed

- open count,
- overdue count,
- escalated count,
- verified-closed count,
- reopen count,
- recurrence count,
- by-work-package trends,
- by-responsible-organization trends,
- readiness-impact counts.

### 9.2 Drillback Rule

Every scorecard or report view consuming issue/action metrics must drill back to:

- the originating `QcIssue`,
- its parent `ReviewFinding` or gate origin when present,
- related `CorrectiveAction` records,
- linked `RootCauseAndRecurrenceRecord`,
- linked `EvidenceReference`,
- and any blocking `DeviationOrWaiverRecord` or `ExternalApprovalDependency`.

No separate reporting-only record may become the operational source of truth for quality obligations.

---

## 10. Governing Summary

T05 makes the QC issue/corrective-action ledger operationally complete:

- issues originate only from findings, failed controls, or ad hoc internal observations,
- actions are child obligations under issues,
- closure always requires reviewer/verifier confirmation,
- Work Queue receives normalized routing data only,
- and root-cause / recurrence analysis is required for qualifying cases before final closure.

This preserves QC authority while still feeding the broader Project Hub operating model.

---

*[← T04](P3-E15-T04-Quality-Plans-Reviews-and-Control-Gates.md) | [T06 →](P3-E15-T06-Deviations-Evidence-and-External-Approval-Dependencies.md)*
