# Wireframe — Project Readiness Detail Section

## Selected module mode

Example: selected module = Permit & Inspection.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Project readiness                                                           │
│ Compact context: selected detail = Permit & Inspection                       │
│ Read-only / source-confidence / no-execution copy                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Readiness module drill-down                                                │
│ [Command Overview] [Lifecycle] [Permits selected] [Responsibility] ...       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Permit and inspection — command surface                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Permits blocking work        │ │ Inspections ready            │
└─────────────────────────────┘ └─────────────────────────────┘

...selected Permit/Inspection detail cards only...
```

## Detail-section rules

- Hero/context and module index remain visible.
- Selected detail cards are direct `PccDashboardCard` children.
- Non-selected detail groups are absent.
- Selection controls are local-only.
- No workflow execution, writeback, upload, sync, approval, or external launch is introduced.
