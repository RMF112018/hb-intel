# Prompt-08-Refresh-Breakpoint-Evidence-Tests-and-Validation-Matrix

## Objective

Refresh the existing responsive closure docs, strengthen tests, and add a stable validation matrix so the redesigned Project Sites surface is auditable and harder to regress.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- refreshed Project Sites breakpoint contract from Prompt 01
- current Project Sites closure docs and tests

## Exact repo files / seams / symbols to inspect

- `docs/architecture/reviews/spfx/project-sites/project-sites-breakpoint-contract-compact-mode-closure.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-end-state-validation-evidence.md`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx`
- any new visual-regression or hosted-validation seam adopted for this work

## Current gap to close

The repo already has a breakpoint-contract closure doc and end-state evidence, but both are still tied to the earlier three-mode closure. The redesigned state now needs refreshed documentation, stronger tests, and a more explicit hosted validation matrix.

## Required implementation outcome

Refresh or intentionally supersede the existing responsive closure docs so repo truth clearly reflects the new end state. Strengthen tests around the redesigned mode responsibilities, control-band composition, card density, and sparse-state behavior.

If the repo does not already have a screenshot-capable path and one is practical, add a clear visual-regression recommendation or implementation seam. If screenshot tooling is not added now, at minimum provide a named hosted screenshot checklist for repeated verification.

## Proof of closure required

- existing docs are refreshed or superseded intentionally rather than left stale
- tests cover the most important redesigned responsive behaviors
- a named display-class validation matrix exists for hosted SharePoint verification
- a future reviewer can understand the final responsive system without reverse-engineering it from code

## Constraints

- do not write a vague prose memo in place of a real closure artifact
- do not leave old responsive closure docs misleading after the redesign
- do not claim hosted closure without explicit validation steps

## Context retention directive

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Local code agent prompt

```text
Objective:
Refresh the existing responsive closure docs, strengthen tests, and add a stable validation matrix so the redesigned Project Sites surface is auditable and harder to regress.

Governing Authorities:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- refreshed Project Sites breakpoint contract from Prompt 01
- current Project Sites closure docs and tests

Exact Repo Files / Seams / Symbols to Inspect:
- `docs/architecture/reviews/spfx/project-sites/project-sites-breakpoint-contract-compact-mode-closure.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-end-state-validation-evidence.md`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx`
- any new visual-regression or hosted-validation seam adopted for this work

Current Gap:
The repo already has a breakpoint-contract closure doc and end-state evidence, but both are still tied to the earlier three-mode closure. The redesigned state now needs refreshed documentation, stronger tests, and a more explicit hosted validation matrix.

Required Outcome:
Refresh or intentionally supersede the existing responsive closure docs so repo truth clearly reflects the new end state. Strengthen tests around the redesigned mode responsibilities, control-band composition, card density, and sparse-state behavior.

If the repo does not already have a screenshot-capable path and one is practical, add a clear visual-regression recommendation or implementation seam. If screenshot tooling is not added now, at minimum provide a named hosted screenshot checklist for repeated verification.

Proof of Closure:
- existing docs are refreshed or superseded intentionally rather than left stale
- tests cover the most important redesigned responsive behaviors
- a named display-class validation matrix exists for hosted SharePoint verification
- a future reviewer can understand the final responsive system without reverse-engineering it from code

Constraints:
- do not write a vague prose memo in place of a real closure artifact
- do not leave old responsive closure docs misleading after the redesign
- do not claim hosted closure without explicit validation steps

Special Instruction:
Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Execution Notes:
- Prefer updating the existing closure docs unless a clearly named successor doc is the cleaner outcome.
- If you adopt visual-regression tooling, keep it tightly scoped and explain exactly how it should be run.
```
