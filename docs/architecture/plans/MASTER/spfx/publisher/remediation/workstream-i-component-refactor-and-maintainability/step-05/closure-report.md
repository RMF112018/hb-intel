# Step 05 Closure Report — Structural and regression validation, Workstream I close

Date: 2026-04-14
Prompt: `phase-08/phase-9/Prompt-05-Close-workstream-I-with-structural-and-regression-validation.md`
Manifest at close: `hb-webparts` 1.0.0.302 (no bump — validation-only pass, no runtime change)

## Outcome
Workstream I is closed. The Publisher surface has been refactored from a 1972-line monolith into a thin shell plus purpose-scoped modules, without regressing publish / republish / archive / withdraw / preview behavior.

## Final structure (repo-truth at close)

Module (file)                                                        | LOC
---                                                                   | ---
`ArticlePublisher.tsx` (shell / composition root)                     | 567
`workspace/useDraftWorkspace.ts`                                      | 155
`workspace/QueueRail.tsx`                                             | 76
`authoringPanels/MetadataPanel.tsx`                                   | ~180
`authoringPanels/HeroPanel.tsx`                                       | ~80
`authoringPanels/StoryPanel.tsx`                                      | ~90
`authoringPanels/SecondaryImagePanel.tsx`                             | ~50
`authoringPanels/TeamPresentationPanel.tsx`                           | ~115
`authoringPanels/DestinationBindingPanel.tsx`                         | ~75
`authoringPanels/draftHelpers.ts`                                     | ~70
`sharedChrome/Field.tsx`                                              | 60
`sharedChrome/ChooserGroup.tsx`                                       | 76
`controllers/useStatusChannel.ts`                                     | 28
`controllers/usePreviewController.ts`                                 | 63
`controllers/useDraftLifecycle.ts`                                    | 426
`controllers/useReadinessController.ts`                               | 165
`controllers/draftPolicyHelpers.ts`                                   | 91

Shell is now 71% smaller than at workstream start (1972 → 567). No single module exceeds the ~430-line lifecycle controller, which is bounded by the inherent save/transition/publish orchestration and is test-covered.

## Non-overlap invariants (step-01 map → verified)
1. **Adapter access restricted to workspace + controllers.** Grep confirms: adapter imports appear only in `workspace/useDraftWorkspace.ts`, `controllers/{useDraftLifecycle, usePreviewController, useReadinessController, draftPolicyHelpers}.ts`, and the shell itself. Panels import the adapter only for enum / type values (e.g. `HERO_THEME_VARIANT_VALUES`, `ProjectLookupSearchFn`, `PublisherPageBindingRow`) — they never call factories, repositories, or orchestrators.
2. **Panels are presentational.** Each authoring panel receives `draft` + `onChange` (+ narrow injections) via props. No `useState` for business data, no adapter calls, no controller imports.
3. **`sharedChrome` owns cross-panel primitives.** `PublisherButton`, `StatusBanner`, `EditorialChip`, `Field`, `ChooserGroup` are the only cross-panel primitives; all re-export through `sharedChrome/index.ts`.
4. **Shell composes; it does not orchestrate.** The shell holds no `useState` for draft/status/busy/preview; those live in their controllers.
5. **Already-extracted surfaces preserved.** `draftQueue/`, `mediaComposer/`, `teamComposer/`, `previewSurface/`, `readinessSurface/`, `storyBodyEditor/` remain untouched and are consumed by the shell / `QueueRail`.

## Regression proof
- `tsc --noEmit`: **clean** on `@hbc/spfx-hb-webparts`.
- `vitest run src/webparts/articlePublisher`: **253/253 tests pass** across 23 files.
- Test surface preserved via re-exports from `ArticlePublisher.tsx`:
  - `applyPromotionPolicyToDraft`, `unsupportedDestinationNotice`, `PromotionPolicyApplyResult` → `./controllers/index.js`
  - `contentTypeOptionsForDraft`, `milestoneLegacyNotice`, `resolveTemplateKeySystemManaged`, `update` → `./authoringPanels/index.js`
  - `promotionLockStatusText`, `workflowFilterOptions`, `scheduledLegacyStateNotice` retained inline as shell-owned public helpers.
- Publish / republish / archive / withdraw / transition / preview lifecycle bodies moved verbatim into `useDraftLifecycle`; dependency arrays updated to include `setStatus` where needed. No semantic changes to orchestrator calls, workflow machine gating, or promotion policy application.
- Host-safety preserved: `storeSiteUrl` effect, `createPublisherRepositories`, `createDefaultPublishOrchestrator`, `createSharePointPageBindingWriter`, `createSharePointPageCreationService`, and `fetchRequestDigest` wiring remain in the shell.

## Pre-existing issues (explicitly not in scope)
- `apps/hb-webparts/src/homepage/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts` reports 6 failures. Confirmed pre-existing in step-03 by running the same tests against stashed HEAD. Unrelated to Workstream I.
- Other `src/homepage/__tests__/*` failures (bundle budget, compositionPreview, discoveryWebpart, etc.) are outside the publisher scope and pre-date this workstream.
- `src/webparts/articlePublisher/teamComposer/teamPersistence.test.ts` has a `no-restricted-imports` lint error using `@hbc/ui-kit` instead of `@hbc/ui-kit/homepage`. Pre-existing, outside Workstream I.

## Deliverables across Workstream I
- **step-01**: component / controller / service ownership map (`component-ownership-map.md`, `closure-report.md`)
- **step-02**: `workspace/useDraftWorkspace`, `workspace/QueueRail` — manifest 1.0.0.300
- **step-03**: six `authoringPanels/*`, `sharedChrome/Field`, `sharedChrome/ChooserGroup`, `authoringPanels/draftHelpers` — manifest 1.0.0.301
- **step-04**: `controllers/useDraftLifecycle`, `usePreviewController`, `useReadinessController`, `useStatusChannel`, `draftPolicyHelpers` — manifest 1.0.0.302
- **step-05**: this closure report (no code changes, no manifest bump)

## Known follow-ups (handed off, not blocking)
1. Tokenize `Field` / `ChooserGroup` to per-primitive CSS modules to match `publisherButton.module.css` / `statusBanner.module.css` pattern. Currently they reference classes in `article-publisher.module.css`.
2. Resolve pre-existing `publisherEndToEnd.test.ts` failures — unrelated but should be tracked in the adapter workstream.
3. Lint cleanup for `teamComposer/teamPersistence.test.ts` `no-restricted-imports` violation.
4. Consider extracting the save-time slug/template resolution block from `useDraftLifecycle.handleSave` into a `saveDraftPipeline.ts` if that handler needs to grow. Not justified by current scope.

## Blockers
None. Workstream I is closed in repo truth.
