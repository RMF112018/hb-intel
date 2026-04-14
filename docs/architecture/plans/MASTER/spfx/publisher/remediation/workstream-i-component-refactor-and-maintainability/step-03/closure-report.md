# Step 03 Closure Report — Extract authoring panels and shared publisher primitives

Date: 2026-04-14
Prompt: `phase-08/phase-9/Prompt-03-Extract-authoring-panels-and-shared-publisher-primitives.md`
Manifest: `hb-webparts` 1.0.0.301

## Summary
Extracted all six inline authoring panels and the two cross-panel primitives out of the Publisher shell into dedicated modules. Shell size continued to shrink from **1858 → 1134 LOC** (−724). No user-visible behavior changed; tests and typecheck are clean on the touched scope.

### New modules
- `authoringPanels/MetadataPanel.tsx` — project binding, headline/summary, article type/stage/subject choosers, legacy milestone notice.
- `authoringPanels/HeroPanel.tsx` — hero image, alt text, theme, metadata toggle.
- `authoringPanels/StoryPanel.tsx` — subhead, body editor, intro/closing/callout/pull quote with counters.
- `authoringPanels/SecondaryImagePanel.tsx` — toggle + url/alt/caption.
- `authoringPanels/TeamPresentationPanel.tsx` — team viewer toggle, heading, intro, layout/grouping/sort choosers, max-visible input.
- `authoringPanels/DestinationBindingPanel.tsx` — read-only template + page binding readout.
- `authoringPanels/draftHelpers.ts` — `PanelProps`, `update`, `resolveTemplateKeySystemManaged`, `contentTypeOptionsForDraft`, `milestoneLegacyNotice`.
- `authoringPanels/index.ts` — barrel.
- `sharedChrome/Field.tsx` — `Field`, `FieldCounter`, `resolveCounterState`.
- `sharedChrome/ChooserGroup.tsx` — governed enum chooser primitive.

### Shell updates (`ArticlePublisher.tsx`)
- Removed inline `MetadataPanel`, `HeroPanel`, `StoryPanel`, `SecondaryImagePanel`, `TeamPresentationPanel`, `DestinationBindingPanel`, `ChooserGroup`, `Field`, `FieldCounter`, `resolveCounterState`, `PanelProps`, and the `update` / `resolveTemplateKeySystemManaged` / `contentTypeOptionsForDraft` / `milestoneLegacyNotice` helpers.
- Re-exports `contentTypeOptionsForDraft`, `milestoneLegacyNotice`, `resolveTemplateKeySystemManaged`, and `update` from `./authoringPanels` so the existing test surface (`ArticlePublisher.test.tsx`) compiles unchanged.
- Dropped now-unused adapter enum / label imports (ARTICLE_SUBJECT_VALUES, HERO_THEME_VARIANT_VALUES, TEAM_VIEWER_* enums, individual label fns, StoryBodyEditor, defaultTeamHeading, ProjectPicker, etc.).

### sharedChrome barrel
Added `Field`, `ChooserGroup`, and their types to `sharedChrome/index.ts`.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (trimmed, imports panels and primitives)
- `apps/hb-webparts/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/authoringPanels/SecondaryImagePanel.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/authoringPanels/TeamPresentationPanel.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/authoringPanels/DestinationBindingPanel.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/authoringPanels/draftHelpers.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/authoringPanels/index.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/Field.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/ChooserGroup.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/index.ts` (re-exports added)
- `apps/hb-webparts/config/package-solution.json` (version bump 1.0.0.300 → 1.0.0.301)

## Validation performed
- `tsc --noEmit` clean on `@hbc/spfx-hb-webparts`.
- `vitest run src/webparts/articlePublisher` — **253/253** tests pass (23 files).
- Full-suite failures observed elsewhere (`homepage/__tests__/*`, `publisherAdapter/__tests__/publisherEndToEnd.test.ts`) were confirmed **pre-existing** by running the same tests against `git stash`’d HEAD — they are not introduced by this extraction.
- Eslint: the two remaining warnings on `ArticlePublisher.tsx` (`firstBlockingError`, `hasDrift`) pre-existed this step and are out of scope for Prompt 03 (lifecycle/preview controllers move in Prompt 04).
- Behavior parity: every panel's JSX and handlers are moved verbatim. Counter states, toggle bindings, keyboard-accessible chooser `role="radiogroup"`/`aria-checked`, and `aria-live` counter announcements are preserved.

## Doctrine alignment
- `Field` and `ChooserGroup` now live in the governed `sharedChrome/` barrel alongside `PublisherButton`, `StatusBanner`, and `EditorialChip`, making them available as the canonical Publisher form primitives.
- Panels are presentational — they consume only `sharedChrome/` primitives, `authorLabels`, `metadataDefaults`, `storyBodyEditor`, and typed enum values. None imports the adapter or any service seam directly.
- Shell → panels ownership boundary now matches the step-01 ownership map.

## Known follow-ups (out of scope for Prompt 03)
- `Field` and `ChooserGroup` still reference classes in `article-publisher.module.css`. Tokenizing these into per-primitive CSS modules aligned with the existing `publisherButton.module.css` / `statusBanner.module.css` pattern is a separate visual-doctrine task.
- Workspace canvas composition (the `<section>` blocks around the panels) remains in the shell; Prompt 04 controllers will make that composition thinner.

## Blockers
None.
