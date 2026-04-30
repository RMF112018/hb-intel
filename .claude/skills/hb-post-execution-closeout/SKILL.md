---
name: hb-post-execution-closeout
description: Review post-execution reports, landed commits, and closure summaries for changed-file truth, validation accuracy, and residual risk.
when_to_use: Use when the user reports a commit landed, pastes an execution summary, or asks whether execution matched the plan.
argument-hint: "[commit/report/context]"
agent: hb-commit-diff-auditor
---

# HB Post-Execution Closeout

Review:

```text
$ARGUMENTS
```

## Required Checks

- Actual changed files.
- Claimed files changed.
- Validation commands and results.
- Package/manifest/lockfile drift.
- Sensitive-operation boundaries.
- Docs/source-of-truth updates.
- Residual risks.

## Output

- Matched / Partially matched / Did not match
- Evidence
- Validation status
- Guardrails preserved
- Follow-up action
