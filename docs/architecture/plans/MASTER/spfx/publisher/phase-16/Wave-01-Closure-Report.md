# Phase 16 / Wave 01 — Closure Report

## Summary
All ten Wave 01 prompts are implemented. The changed seams build cleanly, targeted tests pass, and the major Wave 01 surfaces (project-binding truth, first-pass compose structure, preview truth, readiness next-action language, queue momentum cues, current-scope product truth) no longer contradict each other. Pre-existing `publisherEndToEnd.test.ts` failures are unrelated to Wave 01 work and untouched by this wave.

## Changed files by prompt

### Prompt 01 — Project-binding truthfulness and picker search (1.0.0.44)
- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.ts`
- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.test.ts`

### Prompt 02 — Recompose first-pass authoring path (1.0.0.45)
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css.d.ts`

### Prompt 03 — Preview source-of-truth (1.0.0.46)
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/articlePreview.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/articlePreview.module.css.d.ts`

### Prompt 04 — Readiness next-action cue (1.0.0.47)
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css.d.ts`

### Prompt 05 — Story authoring ergonomics (1.0.0.48)
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/__tests__/storyBodyEditor.test.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css.d.ts`

### Prompt 06 — Team composition refinement (1.0.0.49)
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/teamPanel.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/teamPanel.module.css.d.ts`

### Prompt 07 — Media composition refinement (1.0.0.50)
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/galleryPanel.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/galleryPanel.module.css.d.ts`

### Prompt 08 — Queue momentum tool (1.0.0.51)
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/draftCompleteness.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/draftCompleteness.test.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/DraftQueue.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/draftQueue.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/draftQueue.module.css.d.ts`

### Prompt 09 — Current-scope product and destination truth (1.0.0.52)
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`

## Validation evidence

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean (`tsc --noEmit` exit 0).
- `pnpm --filter @hbc/spfx-hb-publisher test` — 616 passed / 6 failed / 622 total, 63 / 64 files.
  - The 6 failing tests are all in `src/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts` and all concern the publish orchestrator stage name (`resolution` vs `policy`). These failures existed **before** Wave 01 began (confirmed on 1.0.0.43 baseline) and were not introduced by any Prompt 01–09 change. They are orchestrator/adapter-layer defects, outside Wave 01's adoption/trust scope.
- Targeted scoped runs (all green) during the wave:
  - `projectsLookupSource.test.ts` (12/12)
  - `ArticlePublisher.test.tsx` (11/11)
  - `storyBodyEditor` (51/51)
  - `teamComposer` (37/37)
  - `mediaComposer` (42/42)
  - `draftQueue` (33/33)

## Regression walkthrough — cross-surface seams verified

1. **Create new draft → bind to project.** Project picker promises number/name/location search; adapter filter matches `field_3`, `field_2`, `field_4` — no gap. Selection still hydrates `ProjectId`, `ProjectName`, `ProjectLocation` into the draft; team-heading default still fires; no manual-ID path was reintroduced.
2. **First-pass compose structure.** `Compose` lane (Identity / Hero / Story) renders expanded; `Editorial depth` and `Governance & preview` lanes render collapsed with each `<section id="section-X">` still mounted. Readiness-rail jump links (and the next-action cue's primary jump) expand the owning lane via the hashchange + in-page anchor listener, so validation jump-to-fix still works end to end.
3. **Preview truth.** Preview composes from the last saved draft through the shared publish/preview contract. When dirty, `PreviewStalenessBanner` narrates the source-of-truth and offers one-click "Save and refresh preview"; trust-bridge headlines and the clean-state message all say "Preview reflects the last saved draft", so preview narration, save-state language, and actual composition behavior describe the same truth.
4. **Readiness next-action clarity.** The next-action cue reads the same `isDirty`, `saveHealth`, `publishBlockedByValidation`, `latestValidation`, and `publishEnabled` signals the existing rail already derives, then coalesces them into one recommendation. When dirty, it offers the same `handleSaveAndRefreshPreview` bridge used by the preview surface — identical truth model, same action.
5. **Queue momentum cues.** `draftCompleteness` surfaces `nearlyReady` + `nextBlockerLabel` from the existing required-field scan (same set the composer, readiness, and save-health models use). Group rollups split "nearly ready" from generic TODO. No new or divergent readiness rule is introduced.
6. **Story authoring + governance.** Toolbar link workflow no longer dead-ends on empty selection (new link-text slot inserts through the same `link` mark — no schema expansion). Toolbar groups carry `role="group"` + aria-labels. Placeholder narrates the actually-supported governed schema. Paste sanitiser and schema allow-list unchanged; no textarea fallback.
7. **Team / media refinement.** Featured-state narration now calls out "replaces <current>" on both surfaces; reorder tips are visible; empty states explain gallery-vs-featured and featured-lead semantics. All invariants (`applyFeaturedInvariant`, `applyFeaturedGalleryInvariant`, `moveRow`, `restampSortOrder`, `moveMediaRow`, `restampMediaSortOrder`, `assessAltText`) unchanged.
8. **Current-scope product truth.** Manifest description, `ArticlePublisher` file header, and canvas empty state all narrate "current release scope: Project Spotlight". `ARTICLE_PUBLISHER_WEBPART_ID`, manifest id/alias, and `unsupportedDestinationNotice` messaging all preserved — author-facing copy no longer over-implies destination scope.

## Wave 01 issues proven closed

| # | Issue | Prompt | Status |
|---|-------|--------|--------|
| 1 | Project picker promised location search it did not support | 01 | Closed (adapter matches `field_4`). |
| 2 | First-pass compose path spread attention across too many sections | 02 | Closed (three-lane canvas with auto-expanding anchor jumps). |
| 3 | Preview source-of-truth ambiguity when draft is dirty | 03 | Closed (staleness banner + "Save and refresh preview" bridge). |
| 4 | Readiness rail lacked an explicit next action | 04 | Closed (`NextActionCue` coalesces save/validation/dirty/publish signals). |
| 5 | Story authoring ergonomics (link dead end, generic placeholder, opaque groups) | 05 | Closed within the governed schema. |
| 6 | Team featured-state semantics implicit; reorder hint buried | 06 | Closed. |
| 7 | Media featured-state semantics implicit; reorder hint buried | 07 | Closed. |
| 8 | Queue read like inventory, not momentum | 08 | Closed (nearly-ready chip + inline "Next: …" row blocker + rollup split). |
| 9 | Current-release scope ambiguity in product copy | 09 | Closed (manifest description + canvas empty state + file header tightened; GUID/alias preserved). |
| 10 | End-to-end proof | 10 | This report. |

## Verification-only items (already truthful before Wave 01)
- `unsupportedDestinationNotice` runtime messaging was already truthful — preserved.
- `ARTICLE_PUBLISHER_WEBPART_ID` runtime-contract narration was already precise about lineage — preserved.
- Queue search, persisted collapse state, keyboard model, and highlight behavior were already sound — all preserved unchanged.

## Known open items (explicitly out of Wave 01 scope)
- `publisherEndToEnd.test.ts` has 6 pre-existing failures concerning orchestrator stage naming (`resolution` vs `policy`). These predate Wave 01 and belong to adapter/orchestrator work, not the Wave 01 adoption/trust scope.
