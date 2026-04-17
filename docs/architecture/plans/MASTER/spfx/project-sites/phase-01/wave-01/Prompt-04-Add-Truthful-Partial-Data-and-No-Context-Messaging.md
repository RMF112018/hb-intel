# Prompt-04-Add-Truthful-Partial-Data-and-No-Context-Messaging.md

## Objective
Make Project Sites honest about why projects appear, do not appear, or cannot be launched, especially when the current scope or underlying list data is incomplete.

## Governing authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- current Project Sites source under `packages/spfx/src/webparts/projectSites/`

## Inspect these exact repo seams
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- relevant tests

## Current future-state gap to close
The current surface distinguishes loading, empty, error, and filtered-zero states, but it still does not tell users enough about:
- host/context resolution
- malformed or missing year data
- non-launchable records caused by incomplete site data
- why “provisioning” vs “data issue” vs “not in scope” should be understood differently

## Required implementation outcome
Add truthful product messaging and state handling. At minimum:

1. Expose the resolved scope source to the user in a concise, trustworthy way.
2. Introduce partial-data handling for compromised records.
3. Add clear copy for records that exist but are not yet launchable.
4. Ensure empty states explain absence correctly without overclaiming.
5. Preserve concise operational tone; do not turn the surface into a diagnostic dashboard.

## Closure proof required
- show the final empty / partial / no-context states
- show the copy used and why it is truthful
- add or update tests for the new states
- update any supporting docs that describe the surface’s trust model

## Guardrails
- do not hide problems behind optimistic language
- do not flood the UI with admin-only diagnostics
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
