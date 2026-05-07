# Wireframe — Project Readiness Command Surface

## Default command overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Project readiness                                                           │
│ Active gate | Overall posture | Blockers | Evidence confidence              │
│ Read-only / no-execution / source confidence copy                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Blockers and exceptions                                                     │
│ Highest-risk readiness blockers and approvals-reference rows                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐
│ Project lifecycle map                │ │ Domain posture                       │
│ condensed gate posture               │ │ condensed domain health              │
└─────────────────────────────────────┘ └─────────────────────────────────────┘

┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐
│ Ownership and accountability          │ │ Evidence and source-health posture   │
│ unassigned / escalation exposure      │ │ evidence buckets / source health     │
└─────────────────────────────────────┘ └─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Eligible for Priority Actions         │
│ reference-only eligibility preview    │
└─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Readiness module drill-down                                                │
│ [Command Overview] [Lifecycle] [Permits] [Responsibility] [Constraints]     │
│ [Buyout] [Procore Source] [Unified Lifecycle]                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Mobile behavior

```text
Project readiness
Blockers
Lifecycle
Domains
Ownership
Evidence/source health
Priority Actions
Module drill-down index
```

All module index controls stack and remain at least touch-safe. Use clear copy and selected-state markers.

## Notes

- Do not render embedded detail module cards in default mode.
- Do not use hidden DOM for non-selected module sections.
- Keep active-surface marker on the hero/context card.
