# 07 — Audit History

## Purpose
Audit table and detail drawer with event type, actor, setting, redacted snapshots, correlation ID, approval ID.

## Wireframe

```text
┌────────────────────────────────────────────────────────────┐
│ Control Center Settings                                    │
│ Audit table and detail drawer with event type, actor, sett... │
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
