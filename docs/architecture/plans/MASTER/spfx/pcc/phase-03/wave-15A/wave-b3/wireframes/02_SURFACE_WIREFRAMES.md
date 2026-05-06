# Wireframes — Surface Layouts

## Project Home — Standard Laptop

```text
┌─────────────────────────────────────────────────────────────┬──────────────────────────┐
│ Tier 1 Command: Project Intelligence                        │ Tier 2: Priority Actions │
│ hero / command                                               │ wide / operational       │
├──────────────────────────┬──────────────────────────┬───────┴────────────────────────┤
│ State: Missing Config     │ Tier 2: Site Health      │ Tier 2: Approvals              │
├──────────────────────────┼──────────────────────────┼────────────────────────────────┤
│ Tier 2: Documents         │ Tier 2: Readiness        │ Tier 3 Rail: Team Snapshot     │
├──────────────────────────┴──────────────────────────┴────────────────────────────────┤
│ Tier 3 Reference: Recent Activity / External / Procore / HBI / Lifecycle References   │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## Documents — Standard Laptop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Tier 1 Command: Document Control Center                                     │
├───────────────────────────────┬──────────────────────────┬──────────────────┤
│ Tier 2: Project Record        │ Tier 2: Reviews          │ Tier 2: MPF       │
├───────────────────────────────┴──────────────────────────┬──────────────────┤
│ Tier 3 Detail: Permissions & Guardrails                   │ Tier 3 Deferred  │
│                                                           │ External Systems │
└───────────────────────────────────────────────────────────┴──────────────────┘
```

## Approvals — Standard Laptop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Tier 1 Command: Approvals Home                                              │
├───────────────────────────────┬───────────────────────────────┬─────────────┤
│ Tier 2: Approval Queue        │ Tier 2: My Approvals          │ Tier 2: Esc. │
├───────────────────────────────┼───────────────────────────────┼─────────────┤
│ Tier 2: Admin Verification    │ Tier 3 Detail: Registry       │ Tier 3 Ref.  │
├───────────────────────────────┴───────────────────────────────┴─────────────┤
│ Tier 3 Deferred: Decision History / Lineage      Tier 3 Reference: HBI      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## External Systems — Standard Laptop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Tier 1 Command: External Systems Launch Pad                                 │
├───────────────────────────────┬───────────────────────────────┬─────────────┤
│ Tier 2: Summary               │ Tier 2 Detail: Project Links  │ Tier 2 Detail│
│                               │                               │ Review Queue │
├───────────────────────────────┼───────────────────────────────┼─────────────┤
│ Tier 2: Mapping Status        │ Tier 3: Registry              │ Tier 3: Src  │
├───────────────────────────────┴───────────────────────────────┴─────────────┤
│ Tier 3 Reference/Deferred: Audit / HBI / Procore Config                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Site Health — Standard Laptop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Tier 1 Command: Site Health                                                 │
├──────────────────────────────────────────────┬──────────────────────────────┤
│ Tier 2: Site Health Checks                   │ Tier 2: Drift                │
├──────────────────────────────────────────────┼──────────────────────────────┤
│ Tier 3 Deferred: Repair Requests             │ Tier 3 Deferred: Procore     │
└──────────────────────────────────────────────┴──────────────────────────────┘
```

## Mobile Stacking Rule

All routes stack in this order:

```text
[ Tier 1 Command ]
[ Tier 2 Operational Card 1 ]
[ Tier 2 Operational Card 2 ]
[ Remaining Tier 2 Operational Cards ]
[ State Cards ]
[ Tier 3 Reference / Deferred / Rail / Detail Cards ]
```

Reference/deferred cards do not appear above operational cards on mobile unless the route is unavailable.
