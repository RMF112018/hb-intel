# Wireframe — Checkpoint Registry

## Objective

Expose checkpoint definitions, policies, evidence requirements, and route templates without enabling unsafe runtime policy edits in MVP.

## Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Checkpoint Registry                                                          │
│ Module-owned checkpoint definitions and Phase 14 policy templates.           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Filters: [Source Module] [Family] [Policy Version] [Active/Archived]         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Definition List                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Estimate Baseline Freeze | Wave 13G | Handoff / Freeze | Policy v1       │ │
│ │ Mode: sequential | Evidence: snapshot, cost map, variance summary        │ │
│ │ [View Policy] [View Route] [View Evidence Rules]                         │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ External User Access | Team & Access | Access / Security | Policy v1      │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Required Data

- checkpoint definitions;
- active policies;
- policy versions;
- route templates;
- evidence requirements;
- SLA definitions;
- reason code mappings.

## Interaction Rules

- MVP registry is read-only unless future prompt authorizes admin policy mutation.
- Registry records link to source module documentation.
- Policy versions are immutable once used by active requests.

## Acceptance Criteria

- Developer can trace every queue item back to a policy/definition.
- Admin users can inspect policy without mutating it.
