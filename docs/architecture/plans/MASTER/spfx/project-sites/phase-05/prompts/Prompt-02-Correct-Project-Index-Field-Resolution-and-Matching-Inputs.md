# Prompt 02 — Correct Project Index Field Resolution and Matching Inputs

## Objective

Make the project-index loading seam obey the repo’s canonical SharePoint field-resolution contract instead of mixing dynamic field selection with hard-coded field reads.

## Current defect

`LegacyFallbackProjectIndexProvider` resolves the SharePoint field names for `projectNumber` and `projectName`, but then maps the returned rows using hard-coded `field_2` and `field_3`. That breaks the abstraction defined by `projects-list-mapper.ts` and creates a schema-drift risk in a seam that directly feeds the matching engine.

## Why it matters

The legacy fallback lane can appear to run successfully while still producing degraded or wrong match decisions if the project index is not read through the real field contract. This is a correctness defect, not a stylistic preference.

## Repo seams in scope

- `backend/functions/src/services/legacy-fallback/project-index-provider.ts`
- `backend/functions/src/services/projects-list-mapper.ts`
- `backend/functions/src/services/projects-list-contract.ts`
- any tests that cover project index loading or matching input preparation
- `backend/functions/src/services/legacy-fallback/matching-engine.ts` if a small adaptation is required for the corrected input shape

## Required future state

The project-index provider selects and reads the same resolved field names consistently. The code no longer relies on raw `field_N` assumptions where the mapper contract already exists to prevent exactly that kind of drift.

## Required changes

1. Refactor the provider so the resolved SharePoint field names are actually used when reading row values.
2. Preserve the provider’s current external contract unless a contract change is truly necessary.
3. Add or update tests/diagnostics so a future refactor cannot silently reintroduce hard-coded field reads in this seam.
4. If the current project-name fallback behavior is intentional, preserve it; just make it operate through the correct field-resolution path.
5. Clean up any comments or assumptions that now misdescribe the seam.

## Must not change

Do not turn this into a repo-wide field-mapping refactor. Keep the work bounded to the project-index and matching-input seam used by legacy fallback.

## Closure proof required

Return:
- the exact defect you found in the provider,
- files changed,
- the final field-resolution/read pattern,
- tests or diagnostics demonstrating the corrected behavior,
- and a short statement explaining why the old logic was unsafe.

## Required deliverables

- corrected provider logic
- tests or structured diagnostics
- any minimal supporting changes needed in adjacent matching code
- a closure note confirming the seam now honors the mapper contract

## Local operating instruction

Do **not** re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, uncertainty, or post-change impact.
