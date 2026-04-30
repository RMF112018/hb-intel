---
name: hb-doc-authority-cleanup
description: Clean up documentation authority, stale docs, source-of-truth drift, placement, and duplicated guidance.
when_to_use: Use for stale docs, source-of-truth cleanup, documentation placement, or doc authority contradictions.
argument-hint: "[docs objective]"
agent: hb-docs-curator
---

# HB Documentation Authority Cleanup

Clean up:

```text
$ARGUMENTS
```

## Required Procedure

1. Use `hb-doc-classification-gate`.
2. Identify canonical source.
3. Avoid cloning large blocks.
4. Update nearby links or short summaries only when useful.
5. Preserve historical docs unless explicitly authorized.

## Output

- Authority decision
- Files to update
- Files not to update
- Drift removed
- Residual risk
