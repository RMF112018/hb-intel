# 09 — Role Visibility Matrix

## Purpose
Role/action matrix for PM, PX, IT Admin, PCC Admin, Executive, Accountant, Viewer.

## Wireframe

```text
┌────────────────────────────────────────────────────────────┐
│ Control Center Settings                                    │
│ Role/action matrix for PM, PX, IT Admin, PCC Admin, Execut... │
├────────────────────────────────────────────────────────────┤
│ Header / summary / status region                           │
├────────────────────────────────────────────────────────────┤
│ Primary content region                                     │
│ - cards, table rows, filters, or drawer fields as relevant │
│ - status badges and disabled reason text                   │
│ - HBI explanation/refusal surface where relevant           │
├────────────────────────────────────────────────────────────┤
│ Footer actions: View / Request / Recheck / Close           │
└────────────────────────────────────────────────────────────┘
```

## Required behavior
- Use explicit labels and status text.
- Provide disabled reason copy for unavailable actions.
- Preserve redaction rules.
- Maintain keyboard focus and responsive behavior.
- Include test hooks using `data-pcc-settings-*`.
