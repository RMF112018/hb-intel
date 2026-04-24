# Prompt 04 — SharePoint List Schema and Index Proof

## Objective

Define and prove the SharePoint list contracts required by the Foleon app before any production rollout.

## Governing Authorities

- Microsoft SharePoint list threshold/index guidance
- HB Intel SharePoint schema conventions under `docs/reference/sharepoint/list-schemas/**`
- Existing repo provisioning patterns

## Files / Seams to Inspect

- `docs/reference/sharepoint/list-schemas/**`
- Foleon list schema/provisioning docs/scripts to be added
- `FoleonContentService`
- `FoleonPlacementService`
- SharePoint query adapter code
- tests for list queries

## Current Gap

`HB_FoleonContentRegistry` and `HB_FoleonHomepagePlacements` are not proven on `main`; no internal names, field types, indexes, GUID binding, or threshold-safe query proof were found.

## Required Implementation Outcome

- Add schema definitions for `HB_FoleonContentRegistry` and `HB_FoleonHomepagePlacements`.
- Include internal names, field types, required flags, indexes, and lookup relationships.
- Add provisioning/dry-run proof path.
- Query by GUID, not title.
- Ensure homepage, Reader, and Content Hub queries use indexed filters and bounded results.
- Add tests for missing columns, missing indexes, and bad GUID config.

## Proof of Closure

- Schema files committed.
- Provisioning dry-run output.
- Query tests showing indexed filters and `$top` / `$select` discipline.
- README/runbook documenting list creation and index requirements.

## Non-Negotiable Instructions for the Local Code Agent

- Use the live repo's `main` branch as the source of truth unless the prompt explicitly tells you to investigate an unmerged branch/commit.
- Do not protect weak patterns because the UI renders, the package builds, or prior summaries said the MVP landed.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes outside the stated Foleon scope.
- Provide proof of closure with exact commands, files changed, and artifacts generated.
- If repo truth contradicts this prompt, stop and report the contradiction clearly before changing code.
