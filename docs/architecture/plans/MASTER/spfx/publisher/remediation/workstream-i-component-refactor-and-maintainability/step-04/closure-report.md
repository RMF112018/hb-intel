# Step 04 Closure Report — Extract controller hooks and state management by concern

Date: 2026-04-14
Prompt: `phase-08/phase-9/Prompt-04-Extract-controller-hooks-and-state-management-by-concern.md`
Manifest: `hb-webparts` 1.0.0.302

## Summary
Split the remaining stateful concerns out of `ArticlePublisher.tsx` into four controller hooks, keeping the shell a thin composition root. No workflow / adapter / publish-lifecycle semantics changed.

### New controller modules (all under `articlePublisher/controllers/`)
- **`useStatusChannel`** — owns `status`, `statusTone`, and the tone-aware `setStatus` helper.
- **`usePreviewController`** — owns `preview`, `previewLoading`, `loadPreview`, and the selection-change preview-recompose effect. Reports errors through `setStatus`.
- **`useDraftLifecycle`** — owns draft state (`articleDraft`, `teamDraft`, `mediaDraft`, `binding`, `resolutionContext`, `promotionPolicy`), `busy`, `applyPromotionPolicy`, `reloadSelected`, the promotion context-key effect, and the lifecycle handlers: `handleCreateNew`, `handleSave`, `handleTransition`, `handlePublishAction`. Exports a `PublishOrchestrator` type alias (`ReturnType<typeof createDefaultPublishOrchestrator>`).
- **`useReadinessController`** — pure derivations from draft/binding/preview/promotion policy/busy. Produces `readinessSummary`, `bindingSignal`, `promotionSummary`, `latestValidation`, `publishBlockedByValidation`, `workflowOutcomeChipLabel`, `publishEnabled`, `republishEnabled`, `saveEnabled`, and the unsupported-destination signals.
- **`draftPolicyHelpers`** — co-locates the shared pure helpers (`emptyArticle`, `nowIso`, `applyPromotionPolicyToDraft`, `unsupportedDestinationNotice`) to avoid a shell↔controller circular dependency.
- **`controllers/index.ts`** — barrel for all of the above.

### Shell updates (`ArticlePublisher.tsx`)
- Rewritten as a thin composition root: imports + props + pure public helpers + `WORKSPACE_SECTIONS` + render.
- All local `React.useState` calls for draft lifecycle / preview / status / busy removed.
- `reloadSelected`, `handleCreateNew`, `handleSave`, `handleTransition`, `handlePublishAction`, `loadPreview`, `applyPromotionPolicy`, and the two promotion/preview `useEffect` hooks removed from the shell.
- `composeReadinessSummary`, `composePromotionSummary`, `composeBindingSignal`, `emptyArticle`, `nowIso`, `applyPromotionPolicyToDraft`, `unsupportedDestinationNotice` removed.
- Re-exports `applyPromotionPolicyToDraft`, `unsupportedDestinationNotice`, and `PromotionPolicyApplyResult` from `./controllers` so existing test-surface imports from `./ArticlePublisher` keep compiling.
- Shell reduced from **1134 → 567 LOC** (−567). Total Workstream I drop: **1972 → 567** (−1405).

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (full rewrite as a thin composition root)
- `apps/hb-webparts/src/webparts/articlePublisher/controllers/useStatusChannel.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/controllers/usePreviewController.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/controllers/useReadinessController.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/controllers/draftPolicyHelpers.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/controllers/index.ts` (new)
- `apps/hb-webparts/config/package-solution.json` (1.0.0.301 → 1.0.0.302)

## Validation performed
- `tsc --noEmit` clean on `@hbc/spfx-hb-webparts`.
- `vitest run src/webparts/articlePublisher` — **253/253** tests pass across 23 files. Tests import `applyPromotionPolicyToDraft`, `unsupportedDestinationNotice`, `promotionLockStatusText`, `workflowFilterOptions`, `scheduledLegacyStateNotice`, `contentTypeOptionsForDraft`, `milestoneLegacyNotice`, `resolveTemplateKeySystemManaged`, `update` from `./ArticlePublisher`; all still resolve via re-exports.
- Behavior parity: every controller preserves its prior callback body, dependency array shape (now including `setStatus` where needed), and side-effect ordering (`reloadGroups` then `reloadSelected` after save / transition; preview recompose tied to selection change; promotion context-key effect unchanged).

## Doctrine alignment
- Non-overlap invariants from the step-01 ownership map are now enforced structurally:
  - Only workspace + controllers import from `publisherAdapter`.
  - Panels continue to be presentational (no controller imports, no adapter imports).
  - Shell composes controllers and surfaces only.
- SPFx / host safety preserved — no new SharePoint API calls, no new mount-time effects beyond those already present.
- Keyboard/a11y behavior unchanged (readiness rail, status banner, section anchors, queue rail).

## Known follow-ups (out of scope)
- `useReadinessController` could move its sentence composers to a co-located `readinessCopy.ts` file if further simplification is desired.
- `Field`/`ChooserGroup` still reference classes in `article-publisher.module.css`; tokenizing their styles is a separate visual-doctrine task, tracked from step-03.

## Blockers
None. Prompt 05 (structural + regression validation, workstream closure) is ready to run.
