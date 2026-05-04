# Wave 14 SPFX UX and Wireframes

## UX Contract Scope

This document defines architecture UX contracts only for Phase 14 approvals/checkpoints.

- No runtime UI implementation.
- No SPFx source code changes.
- No backend command execution changes.

## Read-Model-First UX Posture

SPFx consumes read models for all queue/detail/registry/history surfaces. Decision affordances are command-model-gated and only represent intent capture until separate command-route authorization is approved.

## Required Screen Set

1. Approvals Home
2. My Approvals
3. Approval Detail
4. Checkpoint Registry
5. Decision History
6. Escalation Queue
7. Admin Verification Queue
8. Module Integration Panels

## Screen Contracts

### Approvals Home

- KPI summary row and queue-state summaries.
- Queue tabs for needs-my-decision, waiting-on-others, escalated, returned, recently decided.
- Filter rail with source module, state, due window, escalation, checkpoint family.
- Sort controls and visible disabled action reasons.

### My Approvals

- Default assignment filtering to current user/current role.
- Saved views with persistable filter/sort state.
- Quick due-date slices (today, this week, overdue).
- No bulk high-risk terminal decision actions.

### Approval Detail

- Header: title, state, source module, priority, due date, current action owner.
- Route progress and step context.
- Source references + evidence panel.
- Decision panel with actor-valid actions only.
- Disabled actions must show reason text.
- HBI summary panel with no-authority warning.

### Checkpoint Registry

- Definition/policy/route template visibility.
- Reason-code and evidence-rule visibility.
- Configuration is read-only in MVP posture.

### Decision History

- Chronological event/decision timeline.
- Actor/role/reason/evidence visibility where authorized.
- Redaction-aware rendering.

### Escalation Queue

- High-risk/high-aging/high-blocking queue slice.
- Grouping by escalation owner role and module.
- Only authority-valid actions visible.

### Admin Verification Queue

- Technical/security/governance verification backlog.
- Site Health execution-pending and mapping-correction reviews.
- Explicit no automated execution posture.

### Module Integration Panels

- Source module checkpoint summaries.
- Current state, current action owner, due posture, last decision.
- Link-out to Approval Detail and source-context visibility.

## Queue Behavior Contract

### Filters

Minimum filters:

- source module;
- checkpoint family;
- state;
- priority;
- due bucket;
- escalation state;
- assignment scope;
- archive visibility.

### Sorting

Default queue sort precedence:

1. assigned to current user,
2. escalated,
3. overdue,
4. blocks downstream workflow,
5. priority,
6. due date,
7. last updated.

### Pagination

- Server-side paging required.
- No fetch-all queue behavior.
- Page controls must preserve filter/sort state.

### Saved Views

- Saved view definitions must retain selected filters + sort + visible columns.
- Saved view execution remains read-model query behavior only.

### Disabled Action Reasons

When an action is unavailable, UI must surface explicit reason text (state mismatch, policy mismatch, stale source, missing evidence, missing authority, superseded route).

## Accessibility and Keyboard Contract

- Full keyboard traversal of queue rows, filters, tabs, sort headers, and action controls.
- Sort headers expose `aria-sort`.
- Filter chips removable via keyboard.
- Dialog/drawer focus trap and focus return.
- Disabled control reason text must be screen-reader discoverable.
- Status and priority indicators not color-only.
- Loading states use `aria-busy`; error states use appropriate alert semantics.

## Wireframe Mapping

Wireframe authority references:

- `docs/wireframes/01_Approvals_Home.md`
- `docs/wireframes/02_My_Approvals.md`
- `docs/wireframes/03_Approval_Detail.md`
- `docs/wireframes/04_Checkpoint_Registry.md`
- `docs/wireframes/05_Decision_History.md`
- `docs/wireframes/06_Escalation_Queue.md`
- `docs/wireframes/07_Admin_Verification_Queue.md`
- `docs/wireframes/08_Module_Integration_Panels.md`

These are contract references only and do not authorize runtime UI implementation.
