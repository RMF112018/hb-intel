# 12 — Security Secret References

## Purpose
Security/secret reference screen showing redacted references, status, last validation, request verification.

## Wireframe

```text
┌────────────────────────────────────────────────────────────┐
│ Control Center Settings                                    │
│ Security/secret reference screen showing redacted referenc... │
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
