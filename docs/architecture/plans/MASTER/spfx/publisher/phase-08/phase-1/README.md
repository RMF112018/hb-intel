# README — Workstream A: Product Architecture and UX Redesign

## Purpose

This prompt package is intended for a local code agent working directly in the live HB Intel repository.
Its purpose is to fully implement and close **Workstream A — Product Architecture and UX Redesign**.

## Working rules

- Execute the prompts in order unless a step proves to be already closed in repo truth.
- Each prompt is expected to end with real code changes or a repo-truth proof that the requested condition is already satisfied.
- Do not skip final validation and closure reporting.
- Do not preserve weak existing UX simply because it already exists.
- Do not broaden scope into unrelated workstreams unless needed to close an explicit dependency.

## Prompt files in this package

- `Prompt-01-Audit-and-lock-the-future-state-product-architecture.md`
- `Prompt-02-Define-the-future-state-author-journey-and-workspace-layout.md`
- `Prompt-03-Implement-the-new-workspace-shell-and-navigation-model.md`
- `Prompt-04-Replace-the-current-tab-first-admin-IA-with-editorial-IA.md`
- `Prompt-05-Run-hosted-doctrine-validation-and-close-workstream-A.md`

## Recommended operating pattern

1. Run one prompt at a time.
2. Review the resulting code diff and closure report.
3. Confirm the step is actually closed in repo truth.
4. Move to the next prompt only after the prior step is clean.

## Workstream objective

Define and implement the future-state editorial workspace so the Publisher stops behaving like an admin form and starts behaving like a premium SharePoint publishing product.
