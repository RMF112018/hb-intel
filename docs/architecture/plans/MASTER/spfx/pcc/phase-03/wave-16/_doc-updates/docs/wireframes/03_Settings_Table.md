# 03 — Settings Table

## Purpose
Settings table with Setting, Category, Effective Value, Source, Owner, Validation, Approval, Last Updated, Actions.

## Wireframe

```text
┌────────────────────────────────────────────────────────────┐
│ Control Center Settings                                    │
│ Settings table with Setting, Category, Effective Value, So... │
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
