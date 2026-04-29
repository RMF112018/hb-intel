---
name: hb-repo-truth-audit
description: Conduct an HB Intel repo-truth audit. Use when the user asks for a live repo audit, exhaustive audit, repo-truth review, source-of-truth comparison, or plan-to-repo alignment.
when_to_use: Trigger phrases include audit the live repo, exhaustive audit, repo-truth, current repo truth, compare against the repo, evaluate against the live source, or generate findings from current files.
argument-hint: "[audit objective or target area]"
context: fork
agent: hb-repo-researcher
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

# HB Repo Truth Audit

Audit the live `hb-intel` repo for:

```text
$ARGUMENTS
```

## Objective

Produce a repo-truth-based assessment that is grounded in current files, manifests, exports, tests, docs, and validation evidence. Do not rely on historical summaries when current files are available.

## Required Procedure

1. Identify the active scope:
   - package or app;
   - phase, wave, or prompt package;
   - docs-only area;
   - UI/SPFx surface;
   - backend/provisioning/deployment area;
   - project-specific area such as PCC.

2. Read the smallest authoritative source set first:
   - root `CLAUDE.md`;
   - `.claude/rules.md`;
   - relevant `.claude/rules/**`;
   - package/app-local `package.json`, README, exports, tests, and configs;
   - active prompt package README, validation matrix, decision register, scope lock, and closeout docs when applicable;
   - governing architecture docs named by the active scope.

3. Inspect current repo files directly.
   - Prefer `Glob` and `Grep` for scope discovery.
   - Use `Read` for governing and touched files.
   - Use only read-only `git` commands unless the user explicitly authorizes mutation.

4. Identify:
   - current source-of-truth chain;
   - stale or contradictory guidance;
   - missing files or broken references;
   - implementation/documentation drift;
   - over-broad or under-specified rules;
   - validation gaps;
   - safety or deployment risk;
   - recommended changes.

5. Report findings in this structure:
   - **Objective**
   - **Files / Sources Inspected**
   - **Repo-Truth Findings**
   - **Risks / Gaps**
   - **Recommended Changes**
   - **Suggested Next Prompt or Patch Scope**
   - **Uncertainty / Not Inspected**

## Evidence Standard

- Cite file paths and specific sections/line ranges when possible.
- Do not state that a file exists, is current, or has been validated unless you inspected it.
- If a path in a rule file is broken, call it out directly and suggest the exact correction.
- If a command is not run, say so.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

