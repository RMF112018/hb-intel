# Wireframe — Approvals Home

## Objective

Provide the user with a command-center view of all approval/checkpoint work across the project.

## Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ PCC Shell Header / Project Context                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Approvals / Checkpoints                                                      │
│ Review, decide, acknowledge, escalate, and track checkpoint authority.        │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ [KPI] Mine   │ [KPI] Overdue│ [KPI] Escal. │ [KPI] Blocks │ [KPI] Exec Pend│
├──────────────────────────────────────────────────────────────────────────────┤
│ [Filter] Assigned: Me/Role/All  [Filter] State  [Filter] Source Module       │
│ [Filter] Priority  [Filter] Due  [Filter] Checkpoint Family  [Search]        │
├──────────────────────────────────────────────────────────────────────────────┤
│ Tabs: Needs My Decision | Waiting on Others | Escalated | Returned | Recent  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Queue                                                                      │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ [Row] Estimate Baseline Freeze                                           │ │
│ │ Source: Estimating Workbench / Wave 13G | State: pending-review          │ │
│ │ Owner: Chief Estimator | Due: Today | Blocks: Buyout Seed                │ │
│ │ [Action] Review  [Disabled: Override requires Executive Oversight]       │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ [Row] External User Access Request                                       │ │
│ │ Source: Team & Access | State: admin-verification | Owner: IT Admin      │ │
│ │ [Action] Open  [Badge] Security-sensitive                               │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Required Data

- queue summary counts;
- user assignment counts;
- overdue and escalated counts;
- blocked downstream count;
- execution-pending count;
- active filters;
- paged queue rows.

## Interaction Rules

- Default view is persona-specific.
- Queue row click opens Approval Detail.
- Filters show applied chips.
- Disabled actions must show reasons.
- Search filters title, source module, source record ID, and checkpoint family.
- No bulk approve except acknowledgement-only where policy allows.

## Acceptance Criteria

- User can determine their next action in under one scan.
- Overdue/escalated/blocking items are visually and semantically prioritized.
- Keyboard user can tab through filters and queue rows.
- Screen-reader user receives state, due date, priority, and disabled action reason.
