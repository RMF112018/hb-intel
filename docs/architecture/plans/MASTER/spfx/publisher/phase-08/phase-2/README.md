# README — Workstream B: Metadata Simplification and Automation

## Purpose

This prompt package is intended for a local code agent working directly in the live HB Intel repository.
Its purpose is to fully implement and close **Workstream B — Metadata Simplification and Automation**.

## Working rules

- Execute the prompts in order unless a step proves to be already closed in repo truth.
- Each prompt is expected to end with real code changes or a repo-truth proof that the requested condition is already satisfied.
- Do not skip final validation and closure reporting.
- Do not preserve weak existing UX simply because it already exists.
- Do not broaden scope into unrelated workstreams unless needed to close an explicit dependency.

## Prompt files in this package

- `Prompt-01-Implement-author-facing-label-governance-for-all-selectors-and-statuses.md`
- `Prompt-02-Replace-manual-project-id-and-name-with-authoritative-project-picker.md`
- `Prompt-03-Remove-author-facing-slug-management-and-implement-governed-slug-generation.md`
- `Prompt-04-Implement-intelligent-defaults-for-team-heading-and-related-metadata.md`
- `Prompt-05-Validate-metadata-simplification-end-to-end-and-close-workstream-B.md`

## Recommended operating pattern

1. Run one prompt at a time.
2. Review the resulting code diff and closure report.
3. Confirm the step is actually closed in repo truth.
4. Move to the next prompt only after the prior step is clean.

## Workstream objective

Remove avoidable author burden in setup and metadata handling by replacing manual identity work with governed automation and friendly author-facing language.
