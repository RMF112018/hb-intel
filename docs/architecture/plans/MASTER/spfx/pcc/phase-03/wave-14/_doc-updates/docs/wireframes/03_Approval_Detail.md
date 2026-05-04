# Wireframe — Approval Detail

## Objective

Give the decision-maker complete source, evidence, route, and consequence context before action.

## Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Approval Detail: Estimate Baseline Freeze                                    │
│ State: pending-review | Priority: High | Due: Today | Blocks: Buyout Seed    │
├───────────────────────────────┬───────────────────────────┬────────────────┤
│ Source Context                │ Route Progress            │ Decision Panel │
│ [Source] Wave 13G Workbench   │ requested ✓               │ Valid Actions  │
│ Snapshot: EST-0042 v7         │ review started ✓          │ [Approve]      │
│ Variance: +2.8%               │ current: Chief Estimator  │ [Request Rev.] │
│ Downstream: Buyout Seed       │ next: Director Precon     │ [Defer]        │
│                               │                           │ [Disabled:     │
│ [Evidence] Snapshot PDF       │ Participants              │ Override       │
│ [Evidence] Cost Code Map      │ - Lead Estimator reviewed │ requires Exec] │
│ [Evidence] Bid Level Summary  │ - Chief Estimator pending │                │
├───────────────────────────────┴───────────────────────────┴────────────────┤
│ Readiness / Priority Impact                                                 │
│ Blocks procurement handoff until freeze approval or authorized override.     │
├──────────────────────────────────────────────────────────────────────────────┤
│ [HBI] Summary with citations. Warning: HBI cannot approve or decide.         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Comments                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Decision History                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Required Data

- request header;
- source reference;
- evidence links;
- policy and route;
- participants;
- current step;
- valid/disabled actions;
- readiness impact;
- priority action links;
- audit history;
- HBI grounding records where available.

## Decision Panel Rules

- Show only actions valid in current state.
- Disable invalid actions with reason.
- Required fields are action-specific.
- High-risk actions open confirmation modal/drawer.
- The final submit label must name the action exactly.

## Acceptance Criteria

- User can identify authority, evidence, and consequence.
- HBI box cannot be mistaken for decision authority.
- High-risk actions require explicit reason/evidence/consequence acknowledgement.
