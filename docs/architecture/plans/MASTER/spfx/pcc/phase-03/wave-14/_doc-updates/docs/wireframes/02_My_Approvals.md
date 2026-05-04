# Wireframe — My Approvals

## Objective

Show only approvals/checkpoints assigned to the current user or their active role.

## Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ My Approvals                                                                 │
│ Assigned directly to me or to one of my active PCC roles.                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Saved Views: [My Due Today] [Overdue] [Readiness Gates] [Estimating]         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Applied Filters: [Assigned to me x] [State: pending-review x]                │
├──────────────────────────────────────────────────────────────────────────────┤
│ Columns: Priority | Due | Source | Checkpoint | Current Step | Action        │
├──────────────────────────────────────────────────────────────────────────────┤
│ ! High  Today  Wave 13G    Estimate Freeze       Chief Estimator  [Review]   │
│   Med   Fri    Buyout Log  Buyout Handoff        Project Exec     [Review]   │
│   Low   Next   Readiness   Acknowledge Handoff   PM               [Ack]      │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Required Data

- user principal key;
- active PCC roles;
- direct assignments;
- role assignments;
- step state;
- valid actions.

## Interaction Rules

- User can switch between direct assignments and role assignments.
- Role assignments show if another user has already started review.
- Parallel-any items show "first authorized response resolves this step."
- Parallel-all items show remaining required approvers.
- Acknowledgement-only items may use low-friction inline action.

## Acceptance Criteria

- No item appears if user lacks visibility.
- No action appears enabled if user lacks authority.
- Due/overdue state is announced accessibly.
