# Wave 02 — Naming, host-context, and rebranding drift closure

Scope: Phase 13 Prompt 07. Remove misleading current-source narrative about product identity, host context, and "sprint scaffolding" framing, while preserving runtime lineage and intentionally historical references.

## Changes to current-source narrative

| File | Change | Reason |
| --- | --- | --- |
| `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts` | Rephrased the GUID preservation note: the GUID is the stable deployment lineage of the Article Publisher on HBCentral and originated under the earlier Project Spotlight Publisher name; the product identity is the current Article Publisher. Removed the "first-sprint focus" framing. | The earlier wording made the rebrand read like an in-progress handoff; the GUID's role is simply stable lineage. |
| `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx` | Replaced the "current sprint supports / future sprints may extend" paragraph with a present-tense statement: the app supports Project Spotlight workflows, and additional destinations are not wired in the current implementation until another is explicitly added. | Removes temporal-scaffolding framing from the top of the primary source file. |
| `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json` | Preconfigured-entry description rewritten to "Authoring surface for structured article publishing on HBCentral. Supports Project Spotlight article workflows; additional destinations are not wired in the current implementation." | The description appears in SharePoint's web part toolbox; it should describe present product truth, not sprint planning language. |
| `tools/spfx-shell/release/manifests/1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10.manifest.json` | Same description text rewritten to match the source manifest. | Release manifest wording kept in sync with the authoring source manifest. |
| `apps/hb-publisher/src/data/publisherAdapter/validation/validationEngine.ts` | User-visible validation message and action hint rewritten to drop "current sprint" framing: *"Destination must be 'projectSpotlight' (found '<x>')."* / *"Project Spotlight is the only destination the Article Publisher currently implements."* | The string surfaces in authoring diagnostics; authors should see product truth, not release-planning language. |
| `apps/hb-publisher/src/data/publisherAdapter/destinationSiteUrls.ts` | Three comment blocks rephrased from "current sprint supports" / "wired in the current sprint" / "current sprint's authoring + publish pipeline" to "the current implementation supports" / "the current implementation does not wire" / "current authoring + publish pipeline". | Removes sprint scaffolding language from the authoritative destination-resolution comments. |
| `apps/hb-publisher/src/data/publisherAdapter/publisherEnums.ts` | One comment block rephrased from "wired for authoring + publish in the current sprint" to "in the current implementation". | Same framing correction on the destination enum authority. |
| `apps/hb-publisher/src/data/publisherAdapter/promotionRuleSelector.ts` | Section heading "Implemented behavior (current sprint):" rewritten to "Implemented behavior:". | Promotion-rule selector describes present behaviour, not temporal scope. |
| `apps/hb-publisher/src/data/publisherAdapter/publisherListDescriptors.ts` | Comment rephrased from "ProjectSpotlight remains the first-sprint destination for generated pages only" to "Generated pages are written to the ProjectSpotlight destination site". | List-descriptor authority should describe routing, not sprint order. |
| `apps/hb-publisher/src/data/publisherAdapter/destinationSiteUrls.test.ts` | One test title rewritten from "wired end to end in current sprint" to "wired end to end in the current implementation". | Test name is not user-visible but was actively misdescribing product state. |
| `apps/hb-publisher/src/data/publisherAdapter/terminologyBoundary.test.ts` | Header comment rewritten to describe Project Spotlight as "the only destination the current implementation wires end to end" while keeping Company Pulse as "a declared future destination, not yet implemented". | Clarifies present truth while still distinguishing historical record from current source. |

A repo-wide grep for `current sprint`, `first-sprint`, and `first sprint` inside `apps/hb-publisher/src` now returns zero hits.

## Historical references preserved intentionally

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/publisher-rebranding-report.md` — untouched. Historical record of the rebrand, not current-source narrative.
- `docs/architecture/plans/MASTER/spfx/publisher/phase-13/**` — untouched. The phase prompts and change log themselves use "current sprint" framing in a historical sense.
- `runtimeContract.ts` still references the earlier Project Spotlight Publisher name as the lineage origin of the GUID — that origin is factual and load-bearing for anyone debugging a webpart-id mismatch.
- Company Pulse is retained in `DESTINATION_VALUES` as a declared-but-unwired enum value. The rebranding report lists this as intentional so the adapter can still read legacy rows; no behavioural change.

## Stable runtime lineage confirmed unaltered

- Webpart GUID `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10` — unchanged in `runtimeContract.ts`, `ArticlePublisherWebPart.manifest.json`, and `tools/spfx-shell/release/manifests/*.manifest.json`.
- `alias: "ArticlePublisherWebPart"`, `componentType: "WebPart"`, `supportedHosts: ["SharePointWebPart"]`, `manifestVersion: 2`, `groupId`, and `officeFabricIconFontName` — all unchanged.
- Package `version: "1.0.0.27"` (bumped to `1.0.0.28` by this prompt's manifest bump). Package solution `id`, feature `id`, and feature `title` unchanged.
- `ARTICLE_PUBLISHER_WEBPART_ID` export remains the single source of truth and still equals the stable GUID.

## Build / package verification performed

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher exec vitest run` — 614 tests pass; the six unrelated `publisherEndToEnd.test.ts` failures are pre-existing and unchanged.
- No JSON schema, no JSON shape, and no exported symbol changed — pure comment / description / user-message text edits plus a one-line test-title rewrite.
- GUID/alias/version grep confirms lineage-critical identifiers are untouched.

## Summary

Current-source comments, manifest descriptions, and one user-visible validation message now describe the Article Publisher in present tense as the product that ships on HBCentral with Project Spotlight as the implemented destination. The earlier "current sprint / future sprint" scaffolding language has been removed from the source tree without touching historical records, the stable webpart GUID, or any functional behaviour.
