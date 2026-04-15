# Wave 02 — Author-facing label governance closure

Scope: Phase 13 Prompt 01. Verify that every author-facing enum/token/storage-backed display in the Article Publisher routes through the governed helpers in `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`.

## Audit method

Grepped author-facing JSX in the Article Publisher web part for raw enum string values across the enum families governed by `authorLabels.ts` (`ArticleContentType`, `Destination`, `SpotlightType`, `ProjectStage`, `ArticleSubject`, `HeroThemeVariant`, `MediaRole`, `TeamViewerMode`, `TeamViewerGroupingMode`, `TeamViewerSortMode`, `WorkflowState`). Inspected chips, badges, choosers, readouts, notices, empty states, and transition-action labels across the panels, draft queue, preview surface, readiness surface, media composer, team composer, shared chrome, and story body editor.

## Seams already governed (preserved)

- `authoringPanels/MetadataPanel.tsx`: content-type chooser uses `articleContentTypeLabel` via `ChooserGroup`.
- `authoringPanels/HeroPanel.tsx`: hero-theme chooser uses `heroThemeVariantLabel`.
- `authoringPanels/TeamPresentationPanel.tsx`: mode / grouping / sort choosers use `teamViewerModeLabel`, `teamViewerGroupingModeLabel`, `teamViewerSortModeLabel`.
- `draftQueue/DraftQueue.tsx`: rail uses `draftGroupLabel`, `draftGroupEmptyCopy`, `transitionActionLabel`, `workflowOutcomeLabel`.
- `mediaComposer/GalleryPanel.tsx`: per-row role chips use `mediaRoleLabel`.
- `previewSurface/ArticlePreview.tsx`: enum references are used for filtering/selection only, not rendered to authors.

## Leak found and closed

- `mediaComposer/MediaComposer.tsx:192` — the image-role radio group rendered raw literals `'Gallery image'` / `'Supporting image'` via an inline ternary on the enum value. Now routed through `mediaRoleLabel(role)` with the `" image"` suffix preserved, since the prompt explicitly forbids collapsing distinct product phrases into a single helper output. Author-visible text is unchanged; the adapter and persistence contract are untouched.

## Helpers added

None. Existing coverage in `authorLabels.ts` was sufficient for every leak surfaced by the audit.

## Tests

- `authorLabels.test.ts` unchanged and still passes; no new helper surface requires additional coverage.
- No new tests added because the only change is a call-site substitution that preserves rendered output.

## Result

Wave 02 author-facing label governance is closed for the audited seams. No raw enum, token, or storage-oriented language remains in Publisher author surfaces covered by this prompt.
