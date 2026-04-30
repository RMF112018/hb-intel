---
name: hb-plan-gate-review
description: Review an agent or implementation plan for repo-truth alignment, overreach, missing validation, and sensitive-operation risk.
when_to_use: Use when an agent presents a plan, the user asks if a plan is acceptable, or the work is gated.
argument-hint: "[plan text or objective]"
agent: hb-implementation-plan-reviewer
---

# HB Plan Gate Review

Review the plan for:

```text
$ARGUMENTS
```

## Decide

- Is the plan aligned with repo truth?
- Did it inspect the right sources?
- Does it preserve boundaries?
- Does it overreach?
- Does it require explicit authorization?
- Is validation adequate?
- What must change before execution?

## Output

- Decision: Approve / Revise / Reject
- Required changes
- Sensitive-operation notes
- Validation notes
- Approved execution scope if applicable
