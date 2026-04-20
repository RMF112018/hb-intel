# P3-E13-T05 — Workflow, SLA, Escalation, Publication, and Shared Package Use

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E13-T05 |
| **Parent** | [P3-E13 Subcontract Execution Readiness Module](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T05 of 8 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Workflow Stages

The minimum workflow stages are:

1. Case assembled
2. Case submitted for specialist review
3. Specialist evaluation in progress
4. Deficiency response or renewal response pending where applicable
5. Exception handling in progress where required
6. Readiness decision eligible for issuance
7. Readiness decision issued
8. Renewal / re-review in-case where identity is unchanged
9. Supersede / void and successor creation where identity changes materially

The workflow must support normal in-case resubmissions and renewals without creating a new parent case unless T02 identity rules require it.

---

## 2. Typed Timers

The module must support typed timer policies for at least:

- missing package items,
- pending evaluator review,
- pending exception approvals,
- upcoming expiration / renewal,
- stale readiness decision versus planned execution date where applicable.

### 2.1 Timer table

| Timer type | Anchor | Primary output |
|---|---|---|
| `MISSING_PACKAGE_ITEM` | case submitted or deficiency issued | routed reminder to PM / APM / PA |
| `PENDING_EVALUATOR_REVIEW` | submission timestamp | evaluator review work item and escalation |
| `PENDING_EXCEPTION_APPROVAL` | iteration submission timestamp | slot-owner work item and escalation |
| `UPCOMING_EXPIRATION_OR_RENEWAL` | item expiration date | renewal work item and notification |
| `STALE_DECISION_NEAR_EXECUTION` | planned execution date | risk / PM escalation where decision is not ready or not current |

Timer policy is governed configuration, not UI-local behavior.

---

## 3. Routed Outputs

### 3.1 Work items

Workflow states must generate routed work through shared work-intelligence surfaces for at least:

- package assembly missing items,
- evaluator review due,
- evaluator review overdue,
- exception approval pending,
- exception approval overdue,
- renewal due,
- blocked execution.

### 3.2 Notifications

Notifications must be generated for:

- approaching timer thresholds,
- overdue specialist review,
- overdue required approvals,
- upcoming renewals or expirations,
- issued blocked decisions,
- issued ready decisions where downstream teams need to act.

### 3.3 Escalations

Escalations must be typed and policy-driven. At minimum:

- overdue evaluator review escalates to the specialist owner / lead,
- overdue required approval escalates to the preserved slot owner and policy-defined oversight role,
- stale readiness near planned execution escalates to PM / APM / PA and risk / compliance owners.

---

## 4. Publication Outputs

### 4.1 Activity

Required activity events include:

- case created,
- case submitted,
- deficiency issued,
- deficiency resolved,
- exception iteration submitted,
- exception action taken,
- readiness decision issued,
- readiness case renewed,
- readiness case superseded,
- readiness case voided.

### 4.2 Work Queue

Required work-queue projections include:

- package assembly action,
- evaluator review action,
- exception approval action,
- renewal action,
- blocked execution action.

### 4.3 Health

Required health publications include:

- blocked readiness count,
- overdue review count,
- overdue approval count,
- renewal-due count,
- ready-for-execution count.

### 4.4 Related Items

Required related-item projections include:

- linkage to the governing buyout line,
- linkage to the active readiness decision,
- linkage to approved exception precedent where published.

All publications above are downstream outputs. None replace the primary ledgers.

---

## 5. Shared Package Use

The module must use shared packages concretely as follows:

| Package / contract | Required use |
|---|---|
| `@hbc/workflow-handoff` | Approval routing, reassignment workflow, and resolution callbacks for exception iterations |
| `@hbc/field-annotations` | Review-only annotations on supported surfaces |
| `@hbc/related-items` | Financial linkage and downstream related-item publication |
| `@hbc/acknowledgment` | Explicit acknowledgment only where policy requires acknowledgment distinct from approval |
| `@hbc/my-work-feed` | Routed operational actions and escalations |
| `@hbc/notification-intelligence` | Timer-driven reminder, overdue-review, overdue-approval, renewal, and escalation notifications |
| `@hbc/bic-next-move` | Blocked-execution and overdue-action prompts tied to the active case and routed work |
| `@hbc/publish-workflow` | Governed `GlobalPrecedentReference` publication flow where publication is enabled |
| `@hbc/versioned-record` | Immutable history for case, item, decision, iteration, slot, and delegation changes |
| `@hbc/session-state` | Draft and offline-safe authoring where allowed; never authoritative for approval actions or issued decisions |

### 5.1 No local substitutes

Implementation must not build:

- local reminder tables instead of routed work,
- local notification or reminder systems outside shared notification primitives,
- local next-move prompt systems outside `@hbc/bic-next-move`,
- bespoke approval-routing state outside `@hbc/workflow-handoff`,
- local annotation stores,
- local history systems that bypass `@hbc/versioned-record`.

The package is required to align with shared-platform primitives.
