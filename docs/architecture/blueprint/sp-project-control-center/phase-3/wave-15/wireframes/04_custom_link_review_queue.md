# Wireframe 04 — Custom Link Review Queue

## Purpose

Specify the queue screen where reviewable custom links are triaged, inspected, and dispositioned in UX terms for future command workflows.

## Personas

- Reviewer: primary actor for review triage and disposition intent.
- Operator: monitors submission status and reviewer feedback.
- Admin: audits queue SLA and policy consistency.
- Viewer: read-only visibility of non-sensitive queue counts/status.

## Layout Zones

- Queue header zone: pending counts, SLA indicators, filters.
- Queue list zone: submitted items table/cards.
- Detail split zone: selected request payload and rationale.
- Disposition panel zone: approve/reject/archive intent controls.
- State zone: loading/empty/stale/blocked/unauthorized/degraded.

## Component Anatomy

- Filter bar: project, system type, submitter, age, status.
- Queue rows/cards with badges for risk/policy warnings.
- Detail pane with before/after field comparison.
- Reviewer notes timeline (read-only history view).
- Disposition action bar with confirmation microcopy placeholders.

## Actions

- Filter queue.
- Select request for detail review.
- Open linked project context.
- Trigger approve intent.
- Trigger reject intent.
- Trigger archive intent.

## States

- Loading: queue placeholders and disabled disposition bar.
- Empty: no pending review items.
- Submitted: active queue state.
- Stale: request aged beyond SLA.
- Blocked: missing required evidence or policy conflict.
- Unauthorized: no review permissions.
- Degraded: dependent source unavailable; queue read-only fallback.

## Role/Action Visibility

| Role     | Visible actions                                               | Hidden/disabled actions                   |
| -------- | ------------------------------------------------------------- | ----------------------------------------- |
| Viewer   | queue count summary and read-only item details (if permitted) | all disposition actions hidden            |
| Operator | view own submissions and comments                             | approve/reject/archive controls hidden    |
| Reviewer | full queue triage and disposition intent controls             | registry admin controls hidden            |
| Admin    | reviewer controls plus archive governance visibility          | runtime execution controls not authorized |

## Responsive Behavior

- Desktop: split-pane queue + detail + disposition panel.
- Tablet: queue list on top, detail panel below with sticky actions.
- Mobile: stacked cards with drill-in detail view and sticky footer actions.
- SLA and severity chips remain visible in condensed form.

## Accessibility

- Queue rows support keyboard row navigation and explicit selection state.
- Split-pane detail updates announced when selection changes.
- Disposition action confirmations are screen-reader accessible.
- Status badges include textual meaning beyond color.
- Focus order preserves triage flow: filters -> list -> detail -> actions.

## Read-Model Inputs

- Custom review item list projection.
- Request payload snapshots and rationale.
- Policy evaluation flags and freshness markers.
- Role permissions projection.
- Degraded-state tags for dependent systems.

## Workflow Transitions

- Custom Review Queue -> Mapping Review Detail for correction-specific records.
- Custom Review Queue -> Project Launch Links for context validation.
- Custom Review Queue -> Audit History for prior decisions.
- Disposition transitions are UX/future-command intent only.

## Acceptance Criteria

- Queue UX covers submitted/stale/blocked/degraded behaviors.
- Disposition controls are scoped as future-command intent only.
- Role matrix restricts disposition controls to reviewer/admin personas.
- Accessibility defines keyboard triage and assistive announcements.
- Required section completeness is satisfied.
