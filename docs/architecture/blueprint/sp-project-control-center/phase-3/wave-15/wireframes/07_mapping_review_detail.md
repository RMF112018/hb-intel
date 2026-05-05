# Wireframe 07 — Mapping Review Detail

## Purpose

Specify the detailed review workspace for mapping-correction items, including evidence inspection, lineage context, and disposition intent flow.

## Personas

- Reviewer: primary reviewer of mapping corrections.
- Operator: submits and tracks correction evidence.
- Admin: confirms policy and governance constraints.
- Viewer: read-only visibility when permitted.

## Layout Zones

- Header zone: review item identity, status, SLA clock.
- Evidence zone: submitted mapping details and attachments summary.
- Comparison zone: current vs proposed mapping values.
- Lineage zone: source-field provenance and policy references.
- Action zone: review disposition intent controls.
- State zone: loading/blocked/stale/degraded/unauthorized.

## Component Anatomy

- Review header with status chip and age indicator.
- Evidence cards for submitter notes and referenced objects.
- Diff table highlighting changed fields.
- Lineage panel link-out and inline provenance chips.
- Action bar for approve/reject/request-update/archive intents.

## Actions

- Inspect evidence and proposed changes.
- Open linked source lineage.
- Open related audit events.
- Trigger approve/reject/request-update/archive intent.
- Return to queue.

## States

- Loading: evidence and diff skeletons.
- Review-open: active disposition pending.
- Review-resolved: decision complete (read-only result).
- Blocked: required evidence missing.
- Stale: underlying source changed since submission.
- Degraded: supporting source currently degraded.
- Unauthorized: no review permissions.

## Role/Action Visibility

| Role     | Visible actions                                         | Hidden/disabled actions               |
| -------- | ------------------------------------------------------- | ------------------------------------- |
| Viewer   | read resolved details when permitted                    | all disposition controls hidden       |
| Operator | read submission and status, add contextual notes intent | final disposition controls hidden     |
| Reviewer | full disposition intent controls                        | admin-only governance overlays hidden |
| Admin    | reviewer controls plus governance metadata overlays     | runtime execution not authorized      |

## Responsive Behavior

- Desktop: multi-panel layout (evidence, diff, lineage).
- Tablet: stacked panels with sticky disposition bar.
- Mobile: accordion sections with persistent status header and footer actions.
- Diff table collapses to key/value pairs on mobile.

## Accessibility

- Diff changes announced with textual before/after labels.
- Status transitions surfaced through live region updates.
- Action buttons include explicit action + target labels.
- Keyboard order follows evidence -> comparison -> lineage -> actions.

## Read-Model Inputs

- Mapping review item projection.
- Current/proposed mapping values.
- Source lineage references.
- Audit event snippets.
- Role permission projection and degraded-state flags.

## Workflow Transitions

- Mapping Review Detail -> Custom Link Review Queue on back/next item.
- Mapping Review Detail -> Mapping Source Health for context.
- Mapping Review Detail -> Audit History and Lineage Panel for trace details.
- Disposition transitions are UX/future-command intent only.

## Acceptance Criteria

- Review detail includes evidence, diff, lineage, and disposition intent sections.
- Blocked/stale/degraded state behavior is explicit.
- Role visibility constrains disposition controls correctly.
- Responsive and accessibility expectations are deterministic.
- All required sections present.
