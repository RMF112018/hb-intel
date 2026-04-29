---
name: hb-plan-gate-review
description: Review an HB Intel implementation plan before execution for scope control, repo-truth alignment, guardrail compliance, validation adequacy, and overreach.
when_to_use: Use when the user provides an agent plan, execution plan, implementation plan, prompt plan, proposed remediation plan, or asks whether a plan should proceed.
argument-hint: "[plan text or target scope]"
context: fork
agent: hb-implementation-plan-reviewer
allowed-tools: Read, Grep, Glob
---

# HB Plan Gate Review

Review the proposed plan:

```text
$ARGUMENTS
```

## Objective

Determine whether the plan should proceed as written, proceed with required edits, or be rejected before execution.

## Review Checklist

Assess:

1. **Objective Fit**
   - Does the plan directly satisfy the user’s stated objective?
   - Does it invent adjacent work?

2. **Repo-Truth Alignment**
   - Does it name the correct current files and source-of-truth chain?
   - Does it rely on stale summaries or old plans?
   - Does it require inspection before implementation?

3. **Scope Control**
   - Is authorized scope explicit?
   - Are forbidden areas explicit?
   - Does it avoid unrelated cleanup, broad formatting churn, lockfile drift, manifest/version drift, and unapproved dependency changes?

4. **Safety / Sensitive Operation Posture**
   - Does it touch tenant resources, Azure, Graph/PnP, Procore, app catalog, CI/CD, live endpoint `curl`, app settings, secrets, tokens, or deployment?
   - If yes, does it require explicit authorization and the correct gate?

5. **Implementation Quality**
   - Is the smallest correct change described?
   - Are acceptance criteria clear?
   - Does it preserve package boundaries?

6. **Validation**
   - Is the validation set credible and proportionate?
   - Are skipped checks explained?
   - Are failure classifications required?

7. **Closeout**
   - Does it require files inspected, files modified, validation results, guardrails preserved, gaps, commit summary, and commit description?

## Output Format

Return:

## Verdict

Use one:

- **Approve**
- **Approve with Required Edits**
- **Reject / Regenerate Plan**

## Required Edits

- <Only include if needed>

## Risk Exposure

- <Concrete risks>

## Validation Expectations

- <Minimum credible validation>

## Copy-Ready Plan Correction

Provide a short patch or replacement instruction if edits are required.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

