# README — Workstream G: Queue and Draft-Management Improvements

## Purpose

This prompt package is intended for a local code agent working directly in the live HB Intel repository.
Its purpose is to fully implement and close **Workstream G — Queue and Draft-Management Improvements**.

## Working rules

- Execute the prompts in order unless a step proves to be already closed in repo truth.
- Each prompt is expected to end with real code changes or a repo-truth proof that the requested condition is already satisfied.
- Do not skip final validation and closure reporting.
- Do not preserve weak existing UX simply because it already exists.
- Do not broaden scope into unrelated workstreams unless needed to close an explicit dependency.

## Prompt files in this package

- `Prompt-01-Redesign-the-drafts-queue-information-model-and-row-content.md`
- `Prompt-02-Implement-search-filter-and-friendly-row-metadata.md`
- `Prompt-03-Add-draft-completeness-and-needs-attention-signaling.md`
- `Prompt-04-Improve-selection-behavior-and-queue-to-editor-handoff.md`
- `Prompt-05-Close-workstream-G-with-zoom-and-hosted-viewport-vetting.md`

## Recommended operating pattern

1. Run one prompt at a time.
2. Review the resulting code diff and closure report.
3. Confirm the step is actually closed in repo truth.
4. Move to the next prompt only after the prior step is clean.

## Workstream objective

Turn the left rail into a useful editorial queue that helps authors find, understand, and resume work quickly.
