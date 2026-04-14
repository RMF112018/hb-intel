# README — Workstream D: Team Authoring Redesign

## Purpose

This prompt package is intended for a local code agent working directly in the live HB Intel repository.
Its purpose is to fully implement and close **Workstream D — Team Authoring Redesign**.

## Working rules

- Execute the prompts in order unless a step proves to be already closed in repo truth.
- Each prompt is expected to end with real code changes or a repo-truth proof that the requested condition is already satisfied.
- Do not skip final validation and closure reporting.
- Do not preserve weak existing UX simply because it already exists.
- Do not broaden scope into unrelated workstreams unless needed to close an explicit dependency.

## Prompt files in this package

- `Prompt-01-Design-the-team-authoring-flow-using-kudos-composer-patterns.md`
- `Prompt-02-Implement-team-member-flyout-with-hbcPeoplePicker-and-hydration.md`
- `Prompt-03-Refactor-the-inline-team-panel-into-a-visual-team-management-surface.md`
- `Prompt-04-Harden-team-persistence-preview-and-viewer-contracts.md`
- `Prompt-05-Close-workstream-D-with-full-behavioral-scrub.md`

## Recommended operating pattern

1. Run one prompt at a time.
2. Review the resulting code diff and closure report.
3. Confirm the step is actually closed in repo truth.
4. Move to the next prompt only after the prior step is clean.

## Workstream objective

Replace the manual team-member row editor with a low-friction, guided team-composition experience that feels polished and trustworthy.
