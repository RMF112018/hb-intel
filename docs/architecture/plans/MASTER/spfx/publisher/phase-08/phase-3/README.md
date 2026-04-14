# README — Workstream C: Rich Content Authoring

## Purpose

This prompt package is intended for a local code agent working directly in the live HB Intel repository.
Its purpose is to fully implement and close **Workstream C — Rich Content Authoring**.

## Working rules

- Execute the prompts in order unless a step proves to be already closed in repo truth.
- Each prompt is expected to end with real code changes or a repo-truth proof that the requested condition is already satisfied.
- Do not skip final validation and closure reporting.
- Do not preserve weak existing UX simply because it already exists.
- Do not broaden scope into unrelated workstreams unless needed to close an explicit dependency.

## Prompt files in this package

- `Prompt-01-Select-and-govern-the-rich-text-editor-architecture.md`
- `Prompt-02-Replace-the-body-textarea-with-a-full-editorial-authoring-surface.md`
- `Prompt-03-Improve-subhead-summary-and-content-guidance-experience.md`
- `Prompt-04-Validate-preview-and-publish-compatibility-for-rich-content-output.md`
- `Prompt-05-Close-workstream-C-with-hosted-and-accessibility-vetting.md`

## Recommended operating pattern

1. Run one prompt at a time.
2. Review the resulting code diff and closure report.
3. Confirm the step is actually closed in repo truth.
4. Move to the next prompt only after the prior step is clean.

## Workstream objective

Turn the body and story-authoring flow into a true editorial experience suitable for high-confidence SharePoint publishing.
