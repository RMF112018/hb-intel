# README — Workstream H: Visual System and Doctrine Conformance

## Purpose

This prompt package is intended for a local code agent working directly in the live HB Intel repository.
Its purpose is to fully implement and close **Workstream H — Visual System and Doctrine Conformance**.

## Working rules

- Execute the prompts in order unless a step proves to be already closed in repo truth.
- Each prompt is expected to end with real code changes or a repo-truth proof that the requested condition is already satisfied.
- Do not skip final validation and closure reporting.
- Do not preserve weak existing UX simply because it already exists.
- Do not broaden scope into unrelated workstreams unless needed to close an explicit dependency.

## Prompt files in this package

- `Prompt-01-Audit-and-replace-the-current-admin-chrome-visual-language.md`
- `Prompt-02-Migrate-the-publisher-surface-to-token-led-styling-and-governed-primitives.md`
- `Prompt-03-Upgrade-iconography-actions-hierarchy-and-motion.md`
- `Prompt-04-Harden-focus-empty-loading-error-and-author-safety-states.md`
- `Prompt-05-Close-workstream-H-with-doctrine-conformance-proof.md`

## Recommended operating pattern

1. Run one prompt at a time.
2. Review the resulting code diff and closure report.
3. Confirm the step is actually closed in repo truth.
4. Move to the next prompt only after the prior step is clean.

## Workstream objective

Bring the Publisher into full visual alignment with the SPFx doctrine and make it feel premium rather than like neutral admin chrome.
