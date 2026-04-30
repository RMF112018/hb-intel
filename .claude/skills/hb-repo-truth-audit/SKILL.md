---
name: hb-repo-truth-audit
description: Conduct an HB Intel repo-truth audit grounded in current files, manifests, exports, tests, docs, and validation evidence.
when_to_use: Use for live repo audits, exhaustive audits, repo-truth reviews, current-state comparisons, or plan-to-repo alignment.
argument-hint: "[audit objective or target area]"
context: fork
agent: hb-repo-researcher
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

# HB Repo Truth Audit

Audit the live repo for:

```text
$ARGUMENTS
```

## Required Procedure

1. Use `hb-workspace-surface-router`.
2. Read current files directly.
3. Prefer nearest authority over broad repo search.
4. Use `docs/README.md` and `current-state-map.md` for docs/architecture questions.
5. Identify:
   - source-of-truth chain;
   - stale or contradictory guidance;
   - missing files or broken references;
   - implementation/documentation drift;
   - validation gaps;
   - safety or deployment risk;
   - recommended changes.

## Output

- Objective
- Files / Sources Inspected
- Repo-Truth Findings
- Risks / Gaps
- Recommended Changes
- Suggested Next Prompt or Patch Scope
- Uncertainty / Not Inspected
