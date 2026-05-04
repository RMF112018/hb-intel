# SPFx Surface and UX Accessibility Contract

## UX Thesis

Approvals / Checkpoints must be queue-first, evidence-backed, and decision-safe. The primary user question is:

> What requires my action, why, by when, and what evidence supports the decision?

## Surface Inventory

1. Approvals Home
2. My Approvals
3. Approval Detail
4. Checkpoint Registry
5. Decision History
6. Escalation Queue
7. Admin Verification Queue
8. Module Integration Panels

## Navigation Model

- PCC shell route/surface: `approvals`.
- Default landing: Approvals Home.
- Persona-specific default views:
  - Project Executive: escalated, high-risk, readiness gates, overrides.
  - Project Manager: project approvals, returned items, handoffs.
  - Estimating Coordinator: estimating freeze/handoff/mapping exceptions.
  - IT / PCC Admin: access, admin verification, site health, mapping correction.
  - Executive Oversight: high-impact escalations and overrides.
  - Viewer: read-only history with redaction.

## Approvals Home

Required regions:

- KPI summary row.
- Faceted filter rail.
- Queue tabs:
  - Needs my decision.
  - Waiting on others.
  - Escalated.
  - Returned/revision requested.
  - Recently decided.
- Priority/due/escalation indicators.
- Source module badges.
- Disabled action reasons.

Default sort:

1. Assigned to current user.
2. Escalated.
3. Overdue.
4. Blocks downstream workflow.
5. Priority.
6. Due date.
7. Last updated.

## My Approvals

Required behavior:

- default filter: assigned to current user or current user's role;
- saved view support;
- applied filter chips;
- quick filter for due today/this week/overdue;
- no bulk approve for high-risk actions;
- optional bulk acknowledge only where policy permits acknowledgement-only checkpoints.

## Approval Detail

Required regions:

- header: title, state, source module, priority, due date, current action owner;
- route progress guide;
- source summary;
- evidence panel;
- decision panel;
- comments;
- readiness/Priority Actions impact;
- decision history;
- HBI summary box with no-authority warning;
- disabled action explanations.

Decision panel must only show actions valid for the actor, state, step, and policy. Disabled actions must provide reasons.

## Checkpoint Registry

Purpose:

- module-owned checkpoint definitions;
- policy versions;
- route templates;
- evidence requirements;
- reason code catalog;
- SLA settings;
- no direct runtime policy mutation in MVP.

## Decision History

Required behavior:

- chronological event timeline;
- decisions, comments, escalations, reminders, supersessions;
- actor, role, reason, evidence;
- redaction where necessary;
- export disabled unless later authorized.

## Escalation Queue

Required behavior:

- show overdue/high-risk/high-sensitivity decisions;
- group by escalation owner role;
- expose source module and blocking impact;
- allow executive/admin review only when actor has authority.

## Admin Verification Queue

Required behavior:

- access/security checks;
- site-health repair requests;
- external-system mapping correction;
- technical/governance exceptions;
- execution-pending items;
- no automated execution.

## Module Integration Panels

Every source module panel must show:

- active checkpoints;
- current state;
- current action owner;
- next due date;
- last decision;
- blocked/unblocked posture;
- link to Approval Detail;
- local source record remains primary context.

## Decision Friction Rules

| Action | Friction | Required UX |
| --- | --- | --- |
| `acknowledge` | low | inline action with confirmation toast/state |
| `request-revision` | medium | comment required |
| `defer` | medium | reason, date, owner |
| `reject-return` | medium | reason and comment |
| `waive-with-reason` | high | modal/drawer confirmation, reason, evidence, risk acknowledgement |
| `override-with-reason` | high | elevated confirmation, reason, evidence, consequence acknowledgement |
| `escalate` | medium/high | target role, reason |
| `cancel` | high | cancellation reason and source impact notice |
| `supersede` | high | replacement source reference |
| `manual-close` | high | admin role, close reason, evidence |

## Accessibility Requirements

- Queue rows keyboard navigable.
- Sortable headers use `aria-sort`.
- Filter chips removable by keyboard.
- Drawers/dialogs trap focus and restore focus on close.
- Error summaries are programmatically associated with fields.
- Status is not color-only.
- Buttons have explicit labels.
- Disabled controls expose disabled reason text.
- Loading states use `aria-busy`.
- Error states use `role="alert"` where appropriate.
- No drag-only interaction.
- Sticky header/panel must not obscure focus.
- Decision confirmation dialogs use specific action labels, not generic "OK" or "Yes".
- Responsive layouts preserve decision context and evidence hierarchy.

## Empty / Loading / Error / Stale / Unauthorized States

Each screen must support:

- `preview`
- `empty`
- `loading`
- `error`
- `missing-config`
- `source-unavailable`
- `backend-unavailable`
- `stale`
- `unauthorized`
- `forbidden`
- `redacted`
- `not-yet-implemented-operation`

## Responsive Posture

- Desktop: table + side detail preview/drawer.
- Tablet: stacked queue/detail with persistent filters collapsed.
- Phone: card-based queue, detail full-screen route, decision panel sticky at bottom only when safe.
- Avoid horizontal scroll as primary interaction.
