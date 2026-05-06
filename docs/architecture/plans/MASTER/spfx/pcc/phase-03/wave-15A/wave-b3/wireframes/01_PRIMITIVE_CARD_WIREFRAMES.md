# Wireframes — Primitive Card Patterns

## Tier 1 Command Card

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ EYEBROW / SURFACE                                                          │
│ H2 Surface Command Title                                      [Status Pill] │
│ Purpose statement / what matters now                                        │
│                                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│ │ Primary KPI  │ │ Risk/Posture │ │ Due/Queue    │ │ Source/Updated       │ │
│ │ value        │ │ status       │ │ signal       │ │ compact metadata     │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
data-pcc-card-tier="tier1"
data-pcc-card-region="command"
headingLevel={2}
```

## Tier 2 Operational Card

```text
┌──────────────────────────────────────────────┐
│ EYEBROW                                      │
│ H3 Operational Queue / Workbench             │
│ ──────────────────────────────────────────── │
│ Row / item / blocker                         │
│ Row / item / blocker                         │
│ Row / item / blocker                         │
│                                               │
│ [Disabled/action affordance with reason]      │
└──────────────────────────────────────────────┘
data-pcc-card-tier="tier2"
data-pcc-card-region="operational"
headingLevel={3}
```

## Tier 3 Reference Card

```text
┌────────────────────────────────────┐
│ EYEBROW                            │
│ H3 Reference / Registry / Source   │
│ ────────────────────────────────── │
│ Metadata, lineage, policy, audit   │
│ Supporting context                 │
└────────────────────────────────────┘
data-pcc-card-tier="tier3"
data-pcc-card-region="reference"
headingLevel={3}
```

## Detail Card

```text
┌──────────────────────────────────────────────────────────────┐
│ EYEBROW                                                      │
│ H3 Detail / Registry / Review Workbench                      │
│ ──────────────────────────────────────────────────────────── │
│ Section H4                                                   │
│   Dense rows / matrix / traceability                         │
│ Section H4                                                   │
│   Detail rows / state legend / audit                         │
└──────────────────────────────────────────────────────────────┘
data-pcc-card-tier="tier2" or "tier3"
data-pcc-card-region="detail"
footprint="detail"
```

## Rail Card

```text
┌───────────────────────┐
│ EYEBROW               │
│ H3 Context Rail       │
│ ───────────────────── │
│ Lens / People / Filter│
│ Compact reference     │
│ Status chip           │
└───────────────────────┘
data-pcc-card-tier="tier3"
data-pcc-card-region="rail"
footprint="rail"
```

## State Card

```text
┌──────────────────────────────────────────────┐
│ STATE BADGE                                  │
│ H3 Missing configuration / unavailable state │
│ Reason                                       │
│ Next step                                    │
└──────────────────────────────────────────────┘
data-pcc-card-tier="state"
data-pcc-card-region="state"
```

## Deferred Seam Card

```text
┌──────────────────────────────────────────────┐
│ DEFERRED / HBI / SOURCE                      │
│ H3 Future seam / no-authority boundary       │
│ What is visible now                          │
│ Why execution is unavailable                 │
└──────────────────────────────────────────────┘
data-pcc-card-tier="tier3"
data-pcc-card-region="deferred"
```
