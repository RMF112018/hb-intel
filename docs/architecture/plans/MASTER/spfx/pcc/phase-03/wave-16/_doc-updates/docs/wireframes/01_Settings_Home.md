# 01 — Settings Home

## Purpose
Overview-first settings landing page with health summary, pending requests, missing config, category cards, and recent changes.

## Wireframe

```text
┌────────────────────────────────────────────────────────────┐
│ Control Center Settings                                    │
│ Overview-first settings landing page with health summary, ... │
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
