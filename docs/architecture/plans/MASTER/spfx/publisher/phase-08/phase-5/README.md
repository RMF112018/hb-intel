# README — Workstream E: Media and Gallery Redesign

## Purpose

This prompt package is intended for a local code agent working directly in the live HB Intel repository.
Its purpose is to fully implement and close **Workstream E — Media and Gallery Redesign**.

## Working rules

- Execute the prompts in order unless a step proves to be already closed in repo truth.
- Each prompt is expected to end with real code changes or a repo-truth proof that the requested condition is already satisfied.
- Do not skip final validation and closure reporting.
- Do not preserve weak existing UX simply because it already exists.
- Do not broaden scope into unrelated workstreams unless needed to close an explicit dependency.

## Prompt files in this package

- `Prompt-01-Define-the-future-state-media-authoring-model.md`
- `Prompt-02-Implement-visual-media-cards-and-guided-add-media-flow.md`
- `Prompt-03-Improve-alt-text-caption-and-role-assistance.md`
- `Prompt-04-Refine-media-ordering-preview-and-gallery-readiness.md`
- `Prompt-05-Close-workstream-E-with-accessibility-and-hosted-vetting.md`

## Recommended operating pattern

1. Run one prompt at a time.
2. Review the resulting code diff and closure report.
3. Confirm the step is actually closed in repo truth.
4. Move to the next prompt only after the prior step is clean.

## Workstream objective

Replace raw media row editing with a more visual, guided media workflow that improves author confidence and accessibility.
