# README — Workstream F: Preview and Publish-Readiness Split

## Purpose

This prompt package is intended for a local code agent working directly in the live HB Intel repository.
Its purpose is to fully implement and close **Workstream F — Preview and Publish-Readiness Split**.

## Working rules

- Execute the prompts in order unless a step proves to be already closed in repo truth.
- Each prompt is expected to end with real code changes or a repo-truth proof that the requested condition is already satisfied.
- Do not skip final validation and closure reporting.
- Do not preserve weak existing UX simply because it already exists.
- Do not broaden scope into unrelated workstreams unless needed to close an explicit dependency.

## Prompt files in this package

- `Prompt-01-Redesign-preview-and-readiness-information-architecture.md`
- `Prompt-02-Implement-a-visual-article-preview-surface.md`
- `Prompt-03-Implement-a-dedicated-publish-readiness-panel.md`
- `Prompt-04-Rewrite-publish-republish-archive-withdraw-messaging-for-author-confidence.md`
- `Prompt-05-Close-workstream-F-with-end-to-end-readiness-validation.md`

## Recommended operating pattern

1. Run one prompt at a time.
2. Review the resulting code diff and closure report.
3. Confirm the step is actually closed in repo truth.
4. Move to the next prompt only after the prior step is clean.

## Workstream objective

Separate technical readiness from visual preview so authors gain both product confidence and operational clarity.
