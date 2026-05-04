# Wireframe — Escalation Queue

## Objective

Give executives/admins a focused view of overdue, high-risk, high-cost, or authority-conflicted approvals.

## Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Escalation Queue                                                             │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ [KPI] Overdue│ [KPI] High $ │ [KPI] Gates  │ [KPI] Waivers│ [KPI] Overrides│
├──────────────────────────────────────────────────────────────────────────────┤
│ Filters: [Escalation Owner] [Risk] [Source Module] [Aging] [Blocks Workflow] │
├──────────────────────────────────────────────────────────────────────────────┤
│ Escalated Items                                                              │
│ ! Executive Override Needed | Readiness Gate | Blocks startup | [Review]     │
│ ! Cost-Code Mapping Exception | Wave 13G | Blocks budget seed | [Review]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Required Data

- escalation reason;
- escalated from/to;
- source module;
- risk/exposure summary;
- due/escalation age;
- blocking impact;
- valid executive/admin actions.

## Interaction Rules

- Escalation does not erase original route.
- Escalation queue is visibility-filtered.
- High-risk override requires explicit consequence acknowledgement.

## Acceptance Criteria

- Executive user can distinguish action-required items from watch-only items.
- All escalation decisions are auditable.
