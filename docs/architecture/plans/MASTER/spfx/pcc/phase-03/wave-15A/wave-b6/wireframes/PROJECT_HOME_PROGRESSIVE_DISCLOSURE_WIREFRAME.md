# Wireframe — Project Home Progressive Disclosure

## Default collapsed view

```text
Today's Operating Priorities
  Top 5 visible
  + 9 additional reference items
  [Show additional reference items]  ← local-only, preview-safe
```

## Expanded view

```text
Today's Operating Priorities
  Top 5 critical/near-term
  Additional reference items
    grouped by:
      Approvals
      Readiness
      Document Control
      Site Health
      External / Source
  [Show fewer]
```

## Rules

- Expanded state is local-only.
- Expanded state must not write, persist, or call a mutation endpoint.
- Expansion must not be labeled as workflow execution.
- The control must be keyboard accessible and touch-safe.
- The label must clearly indicate display-only behavior.
- Tests must prove no anchors/hrefs/workflow buttons are introduced.
