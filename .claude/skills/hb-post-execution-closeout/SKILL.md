---
name: hb-post-execution-closeout
description: Audit an HB Intel post-execution report, commit summary, or closure summary against repo-truth expectations, approved scope, validation claims, and diff discipline.
when_to_use: Use when the user says following execution, all changes pushed, commit landed, closure summary, agent completed, validate the completion, or evaluate a commit report.
argument-hint: "[closure report, commit SHA, or target scope]"
context: fork
agent: hb-commit-diff-auditor
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

# HB Post-Execution Closeout Audit

Audit the completion claim:

```text
$ARGUMENTS
```

## Objective

Determine whether the executed work matches the approved scope, whether repo-truth claims are supported, and whether validation/closeout reporting is accurate.

## Required Review

1. Establish the approved scope from the user prompt, active prompt package, or execution report.
2. Inspect current git state where available:
   - `git status --short`
   - `git diff --stat`
   - `git diff -- <relevant paths>`
   - recent commit details if the user provides or implies a commit.
3. Check for:
   - unrelated file changes;
   - lockfile drift;
   - package/manifest version drift;
   - CI/CD changes;
   - tenant/deployment/provisioning changes;
   - broad formatting churn;
   - missing docs updates;
   - missing tests or insufficient validation;
   - false or unsupported closeout claims;
   - broken references introduced by the change.

## Output Format

## Verdict

Use one:

- **Accept**
- **Accept with Residual Risk**
- **Requires Follow-Up**
- **Reject / Rework Required**

## Evidence Reviewed

- <files, diffs, commands, commit data>

## Scope Compliance

- <assessment>

## Validation Assessment

- <commands claimed vs commands verified>

## Issues Found

- <issue, severity, required action>

## Corrective Prompt

If follow-up is needed, provide a copy-ready prompt.

## Commit Summary Quality

Assess whether the summary and description accurately describe the actual diff.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

