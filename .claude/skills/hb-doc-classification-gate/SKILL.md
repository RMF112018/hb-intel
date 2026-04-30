---
name: hb-doc-classification-gate
description: Classify HB Intel docs before editing so current-state, normative, historical, deferred, superseded, ADR, and Diataxis docs are handled correctly.
when_to_use: Use before documentation edits, docs audits, source-of-truth cleanup, or architecture plan changes.
argument-hint: "[doc path or docs objective]"
agent: hb-docs-curator
---

# HB Documentation Classification Gate

Classify:

```text
$ARGUMENTS
```

## Required Sources

```text
docs/README.md
docs/architecture/blueprint/current-state-map.md
docs/reference/developer/documentation-authoring-standard.md
```

## Output

- Document classification.
- Whether editing is appropriate.
- Canonical source to update.
- Related docs that should link instead of duplicate.
- Risk of stale/historical/deferred confusion.
