# Project Sites Repository Adapter and Field-Contract Closure

## Objective

Close Prompt-02 by replacing transitional full-row list reads with a canonical typed repository adapter that is explicit about selected fields, bounded all-projects behavior, and malformed launch-critical data classification.

## New Adapter Boundary

A dedicated repository seam now owns list query logic:

- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`

This boundary centralizes:

- SharePoint list reads for available years and project rows
- explicit `$select` field contract (`PROJECT_SITES_SELECT_FIELDS`)
- bounded all-projects read strategy (`PROJECT_SITES_ALL_SCOPE_LIMIT`)
- scope-aware fetch behavior (`year` filter vs bounded `all` scope)

Hooks now consume this adapter instead of constructing ad-hoc PnP query logic:

- `useAvailableYears.ts`
- `useProjectSites.ts`

## Explicit Field Contract

The selected-field contract is now first-class in `types.ts`:

- `PROJECT_SITES_SELECT_FIELDS`
- `PROJECT_SITES_ALL_SCOPE_LIMIT`

The contract includes canonical internal names and the minimal fallback display-name fields still needed for real schema drift compatibility.

## Malformed / Partial Data Classification

Normalization now classifies launch-critical data quality instead of silently coercing everything:

- `missing-project-name`
- `missing-project-number`
- `invalid-year`
- `missing-site-url`
- `malformed-site-url`

Each normalized entry now carries:

- `dataQuality.classification` (`complete`, `partial`, `malformed`)
- `dataQuality.issues`
- `dataQuality.hasAnyIssue`
- `dataQuality.hasLaunchCriticalIssue`

This keeps current UI pipeline behavior intact while making data trust explicit and testable.

## Why This Is Safer Than Transitional No-`$select`

- Reduces implicit schema risk by making the read contract explicit.
- Makes all-project reads bounded and deliberate rather than vague full-row fetches.
- Separates query responsibility from hooks/components via one repository seam.
- Exposes malformed/partial launch data for truthful downstream handling instead of silent coercion.

## Verification Focus

Coverage now includes:

- explicit field-contract and bounded-read tests in `types.test.ts`
- malformed/partial normalization cases in `normalizeProjectSiteEntry.test.ts`
- existing hooks and UI pipeline tests preserved
