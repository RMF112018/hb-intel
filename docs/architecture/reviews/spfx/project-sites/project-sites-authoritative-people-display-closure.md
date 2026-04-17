# Project Sites Authoritative People Display — Closure

## Prompt-03 outcome
Project Sites now resolves people labels through an explicit authoritative lookup seam and uses heuristic UPN humanization only as fallback.

## Resolution strategy
1. Collect unique people UPNs used by active filter facets (project manager, lead estimator, project executive).
2. Resolve display labels via SharePoint `/_api/web/siteusers/getByEmail(...)?$select=Title`.
3. Cache resolved and unresolved results to prevent uncontrolled repeated lookup churn.
4. Fall back to `humanizeUpn` only when authoritative lookup is unavailable or inapplicable.

Implementation seams:
- `projectSitesPeopleDisplay.ts` (resolver/cache/fallback strategy)
- `hooks/useProjectSitesPeopleDisplayLabels.ts` (query-backed resolution)

## Consistency guarantees
- Facet option labels use authoritative display names when available.
- Active filter chips use the same resolved labels.
- Card-level people metadata uses the same label map and fallback behavior.

## Validation evidence
- Added resolver tests for authoritative and fallback behavior.
- Added root tests for authoritative facet/chip labeling and fallback rendering.
- Added card tests for authoritative and fallback people labels in metadata.
