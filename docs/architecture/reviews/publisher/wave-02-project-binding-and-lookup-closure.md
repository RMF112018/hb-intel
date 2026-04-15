# Wave 02 — Project binding and lookup truthfulness closure

Scope: Phase 13 Prompt 03. Strengthen the project-identity flow so the picker remains authoritative, communicates identity clearly, and fails safely — without reintroducing manual identity entry.

## Project identity fields now surfaced to authors

After closure, the selected-project chip in the Metadata panel carries every identity field the lookup actually returns:

- `projectName` (primary author-readable identity).
- `projectNumber` in the `##-###-##` format (was silently dropped when re-rendering from draft; now retained in a panel-level session cache keyed by `projectId`).
- `projectId` (authoritative reference, rendered as `ID <value>`).
- `projectLocation` when present.

This closes the live gap where the metadata-panel selected value object omitted `projectNumber` even though the lookup adapter already resolved it. The read-only fallback chip (rendered when `searchProjects` is unavailable but the row already has a binding) now also shows `projectNumber` when the panel has observed it this session.

The article-row contract (`PublisherArticleRow`) was intentionally **not** extended to persist `ProjectNumber`: that would broaden the contract, writers, row mappers, and tenant schema for a field that is re-derivable from the lookup. The session cache is the smallest correct change that closes the display gap without touching persistence.

## Title-bound `Projects` list risks and how they are handled

The lookup adapter is still bound to the HBCentral `Projects` list by title because no GUID is registered for it under `@hbc/sharepoint-platform`. Residual risks:

- **Tenant rename of the list title.** Surfaces as a list-not-found read failure from `fetchListItemsJson`. The picker now shows a plain-language, trustable error — *“Project lookup is temporarily unavailable. Check your connection to HBCentral and try again.”* — with the raw error message preserved in a muted detail span for ops diagnosis, instead of surfacing the raw failure string.
- **CSV-import `field_N` drift.** The pure mapping from `field_1/2/3/4` to `ProjectId / ProjectNumber / ProjectName / ProjectLocation` is now isolated in `mapRawProjectRow`, exported and unit-tested. If tenant-side field drift ever occurs, it will manifest as empty/null rows, which the mapper defensively drops (skips rows missing either `ProjectId` or `ProjectName`).
- **OData injection via a paste.** `escapeODataString` is now exported and unit-tested: single-quote doubling and CR/LF collapsing are covered. Matches the pattern already used by `projectSpotlightListSource.ts`.

No-match copy was also sharpened — *“No projects match ‘…’. Try a project number or a partial name.”* — so authors have a concrete next action instead of a dead end.

## Authoritative model preserved

- `ProjectPicker` remains the sole entry point for project identity.
- The Metadata panel still renders no manual `ProjectId` / `ProjectName` text inputs; a regression test explicitly asserts this so the manual-entry pattern cannot silently return.
- The opportunistic team-heading default (`defaultTeamHeading(projectName)`) on first selection is preserved.

## Tests added

- `src/data/publisherAdapter/projectsLookupSource.test.ts` — 10 assertions over `mapRawProjectRow` (well-formed mapping, whitespace trimming, missing-identity drops, Title fallback, empty-location handling) and `escapeODataString` (quote doubling, CR/LF collapsing, passthrough).
- `src/webparts/articlePublisher/authoringPanels/metadataPanel.test.tsx` — five targeted behaviors: project selection surfaces project number plus every identity field in the chip; team-heading defaulting still runs on first selection; read-only fallback renders project identity and the “Lookup unavailable” hint when the picker is missing; no manual `ProjectId` / `ProjectName` inputs exist; error state shows the sharpened trust copy plus the raw detail.

All 15 new tests pass. The pre-existing six `publisherEndToEnd.test.ts` failures are unrelated to this seam.

## Deliberately preserved to avoid manual-entry ambiguity

- No manual text inputs for `ProjectId` / `ProjectName` were reintroduced anywhere in the authoring surface.
- The fallback rendered when `searchProjects` is absent is explicitly read-only with a “Lookup unavailable” hint, not a text-entry fallback.
- Persistence semantics, writer contracts, and the `Projects` list mapping comments in `projectsLookupSource.ts` and `projects-list-contract.ts` are unchanged.
