---
name: hb-platform-primitive-adoption-gate
description: Enforce HB Tier-1 platform primitive adoption before feature work reimplements document lifecycle, ownership/BIC, or UI complexity concerns.
when_to_use: Use for new feature work or modifications involving documents, ownership, next-move/BIC, urgency, handoffs, UI density, coaching, or complexity.
argument-hint: "[feature scope]"
agent: hb-boundary-auditor
---

# HB Platform Primitive Adoption Gate

Assess:

```text
$ARGUMENTS
```

## Required Source

```text
docs/reference/platform-primitives.md
```

## Checks

| Concern | Required Primitive |
| --- | --- |
| Document lifecycle | `@hbc/sharepoint-docs` |
| Ownership / BIC / next move | `@hbc/bic-next-move` |
| UI density / complexity / coaching | `@hbc/complexity` |

## Output

- Primitive assessment table.
- Adoption required / N/A / ADR exception required.
- Required imports/contracts.
- Forbidden local duplication.
- Validation impact.
