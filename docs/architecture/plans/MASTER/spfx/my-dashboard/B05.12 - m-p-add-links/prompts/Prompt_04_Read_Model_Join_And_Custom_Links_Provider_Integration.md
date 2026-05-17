# Prompt 04 — Read-Model Join and Custom Links Provider Integration

## Objective
Integrate custom links into the existing My Projects read model after assigned-project reconciliation.

## Required implementation
- Load active visible custom links for the actor:
  - project-visible active links,
  - private active links created by the actor.
- Join links to items by:
  - `projectsListItemId`,
  - `legacyRegistryItemId`.
- Add sorted `customLinks` arrays to every `MyProjectLinkItem`.
- Preserve base project items if custom-link source fails.
- Add partial/unavailable enrichment warning posture if appropriate to current diagnostics design.
- Add provider tests.

## Mandatory rules
1. Do not change existing project assignment matching logic.
2. Do not filter out base projects because custom-link reads fail.
3. No project-number-only primary join.
4. No raw creator identity in read model.

## Output format
Return:

# Prompt 04 Closeout — Read-Model Join and Provider Integration
## 1. Executive Verdict
## 2. Join Logic Implemented
## 3. Failure Posture
## 4. Files Changed
## 5. Test Results
## 6. Remaining Work for Prompt 05
