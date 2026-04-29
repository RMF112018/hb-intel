---
name: hb-prompt-package-builder
description: Build HB Intel prompt packages and fresh-session prompts with repo-truth requirements, non-deferable scope, validation gates, file targets, guardrails, and copy-ready markdown structure.
when_to_use: Use when the user asks to generate a prompt package, fresh ChatGPT session prompt, agent prompt, Cursor prompt, Claude Code prompt, remediation package, downloadable markdown prompt files, or phase/wave prompt package.
argument-hint: "[objective or package name]"
---

# HB Prompt Package Builder

Build a prompt package for:

```text
$ARGUMENTS
```

## Objective

Generate copy-ready prompt files that force the next agent or fresh session to complete a clearly bounded objective using current repo truth, explicit file targets, safety guardrails, validation expectations, and closure reporting.

## Required Inputs to Infer or State

If not provided by the user, make the best reasonable assumption and state it:

- target repo: `RMF112018/hb-intel`;
- branch: `main`, unless the user states otherwise;
- target phase/wave/package/app;
- whether the work is docs-only, code, UI/SPFx, backend, provisioning, deployment, or mixed;
- whether execution is authorized or the prompt is audit/planning only;
- validation level expected;
- sensitive-operation boundary.

## Package Output Structure

Use this default structure unless the user specifies otherwise:

```text
<package-name>/
  README.md
  Plan-Summary.md
  Prompt-01-<slug>.md
  Prompt-02-<slug>.md
  Prompt-03-<slug>.md
  Closeout-Requirements.md
```

For a single-prompt package, use:

```text
<package-name>/
  README.md
  Prompt-01-<slug>.md
```

## Prompt Requirements

Each prompt must include:

1. **Objective**
   - One clear outcome.
   - No vague “continue improving” language.

2. **Repo-Truth Requirement**
   - Require inspection of current files.
   - Forbid reliance on prior summaries when files are available.
   - Tell the agent not to re-read files still in its current context unless they changed, final proof needs line-level validation, or scope expanded.

3. **Required Files / Starting Sources**
   - List concrete paths whenever possible.
   - If exact paths are unknown, provide discovery instructions using `Glob`, `Grep`, and package manifests.

4. **Allowed Scope**
   - Files and workstreams the prompt authorizes.

5. **Forbidden Scope**
   - Explicit non-goals.
   - For sensitive work, state no tenant mutation, no live Graph/PnP, no Procore, no app catalog deployment, no CI/CD mutation, no package/manifest version bump, no dependency install unless explicitly authorized.

6. **Implementation Instructions**
   - Smallest correct change.
   - No adjacent cleanup.
   - No unrelated formatting churn.
   - No staging unrelated files.
   - No push unless explicitly authorized.

7. **Validation Requirements**
   - Narrowest credible checks.
   - Require explanation of skipped checks.
   - Require classification of failures as new, pre-existing, environmental, flaky, or ambiguous.

8. **Closeout Requirements**
   - files inspected;
   - files changed;
   - validation commands and results;
   - guardrails preserved;
   - known gaps;
   - commit summary;
   - commit description.

## Supporting Templates

Use these templates when helpful:

- `templates/prompt-package-template.md`
- `templates/fresh-session-prompt-template.md`
- `templates/agent-execution-prompt-template.md`
- `templates/closeout-requirements-template.md`

## Tone

Use Bobby’s preferred style for agent prompts:

- direct;
- forceful but not theatrical;
- non-deferable;
- repo-truth first;
- explicit about scope boundaries;
- clear about validation and closeout.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

