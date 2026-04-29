# <Package Name>

## README.md

# <Package Name>

## Purpose

<Define why this package exists and what it will accomplish.>

## Scope

### Authorized

- <Authorized scope item>

### Forbidden

- <Forbidden scope item>

## Prompt Sequence

| Prompt | Purpose | Output |
| --- | --- | --- |
| Prompt 01 | <Purpose> | <Expected result> |
| Prompt 02 | <Purpose> | <Expected result> |

## Required Closeout

Each prompt execution must report:

- files inspected;
- files modified;
- validation commands run;
- validation results;
- guardrails preserved;
- known gaps or uncertainty;
- commit summary;
- commit description.

---

# Prompt 01 — <Title>

## Objective

<One concrete objective.>

## Repo-Truth Requirement

Before changing files, inspect the current repo state relevant to this objective. Do not rely on historical summaries or prior chat content when current files are available. Do not re-read files that are still in current context unless they changed, line-level proof is needed, final validation requires proof, or scope expanded.

## Required Starting Sources

- `<path>`
- `<path>`

## Authorized Scope

- `<path or workstream>`

## Forbidden Scope

- Do not broaden into adjacent cleanup.
- Do not stage unrelated files.
- Do not push unless explicitly instructed.
- Do not run tenant, deployment, app catalog, Graph/PnP, Procore, CI/CD mutation, package/manifest version changes, or dependency installation commands unless explicitly authorized.

## Implementation Requirements

<Concrete implementation requirements.>

## Validation Requirements

Run the smallest credible validation set. If any expected validation is skipped, explain why.

## Closeout Requirements

Report:

- files inspected;
- files modified;
- validation commands run;
- validation results;
- guardrails preserved;
- known gaps or uncertainty;
- commit summary;
- commit description.
