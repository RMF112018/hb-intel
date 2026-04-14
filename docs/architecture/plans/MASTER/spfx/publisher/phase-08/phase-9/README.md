# README — Workstream I: Component Refactor and Maintainability

## Purpose

This prompt package is intended for a local code agent working directly in the live HB Intel repository.
Its purpose is to fully implement and close **Workstream I — Component Refactor and Maintainability**.

## Working rules

- Execute the prompts in order unless a step proves to be already closed in repo truth.
- Each prompt is expected to end with real code changes or a repo-truth proof that the requested condition is already satisfied.
- Do not skip final validation and closure reporting.
- Do not preserve weak existing UX simply because it already exists.
- Do not broaden scope into unrelated workstreams unless needed to close an explicit dependency.

## Prompt files in this package

- `Prompt-01-Produce-the-final-component-boundary-and-ownership-map.md`
- `Prompt-02-Extract-shell-queue-and-workspace-orchestration-modules.md`
- `Prompt-03-Extract-authoring-panels-and-shared-publisher-primitives.md`
- `Prompt-04-Extract-controller-hooks-and-state-management-by-concern.md`
- `Prompt-05-Close-workstream-I-with-structural-and-regression-validation.md`

## Recommended operating pattern

1. Run one prompt at a time.
2. Review the resulting code diff and closure report.
3. Confirm the step is actually closed in repo truth.
4. Move to the next prompt only after the prior step is clean.

## Workstream objective

Reduce complexity and improve maintainability by splitting the monolithic Publisher surface into stable workflow-focused modules.
