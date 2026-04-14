# Workstream B — Step 01 Closure Report

**Prompt:** Phase-08 / Phase-2 / Prompt-01 — Implement author-facing label governance for all selectors and statuses
**Status:** Closed.
**Date:** 2026-04-14
**Manifest:** `hb-webparts` → 1.0.0.270

---

## 1. Summary of what was changed

Built a single governed label module (`authorLabels.ts`) that owns every author-facing rendering of every Publisher enum. Workstream A introduced ad-hoc label maps inline in `ArticlePublisher.tsx` (`CONTENT_TYPE_LABELS`, `MEDIA_ROLE_LABELS`, `DESTINATION_LABELS`, `WORKFLOW_OUTCOME_LABELS`, `DRAFT_GROUP_LABELS`, `DRAFT_GROUP_EMPTY_COPY`, plus the `friendlyEnumLabel` fallback and `transitionActionLabel`). Step-01 of Workstream B centralises them with compile-time exhaustiveness guarantees and adds tests that prove every enum value carries a non-raw, non-empty governed label.

Highlights:

- **New module:** `apps/hb-webparts/src/webparts/articlePublisher/authorLabels.ts`. Exports per-enum label functions (`articleContentTypeLabel`, `articleSubjectLabel`, `destinationLabel`, `heroThemeVariantLabel`, `mediaRoleLabel`, `projectStageLabel`, `spotlightTypeLabel`, `teamViewerModeLabel`, `teamViewerGroupingModeLabel`, `teamViewerSortModeLabel`, `workflowOutcomeLabel`), workflow-state-keyed UI copy (`draftGroupLabel`, `draftGroupEmptyCopy`), the workflow-transition action label (`transitionActionLabel`), and the diagnostic `friendlyEnumLabel` fallback. Each enum-keyed map is typed `Record<EnumType, string>` so TypeScript fails the build if any enum value lacks a governed label.
- **`ChooserGroup` is now governance-required.** Its `getLabel` prop is no longer optional; every `ChooserGroup` consumer must pass a governed label function. Removes the silent-fallback pathway that could regress a future enum back to raw camelCase emission.
- **`ArticlePublisher.tsx` rewired:** every chooser group now passes a governed label function from `authorLabels.ts` (`articleContentTypeLabel`, `spotlightTypeLabel`, `projectStageLabel`, `articleSubjectLabel`, `heroThemeVariantLabel`, `mediaRoleLabel`, `teamViewerModeLabel`, `teamViewerGroupingModeLabel`, `teamViewerSortModeLabel`). The Identity destination readout now uses `destinationLabel(...)`. The workflow outcome chip and the readiness summary use `workflowOutcomeLabel(...)`. The draft rail uses `draftGroupLabel(...)` and `draftGroupEmptyCopy(...)`. Workflow transition buttons use `transitionActionLabel(...)`.
- **Author-facing improvements while centralising:**
  - `ProjectStage` is now spelled out for authors (`precon` → "Pre-construction", `active` → "Under construction") instead of the prior camelCase fallback.
  - `TeamViewerGroupingMode` reads as "By discipline / By company / By hierarchy / No grouping" instead of raw `discipline / company / hierarchy / none`.
  - `TeamViewerSortMode` reads as "Manual order / By role / By hierarchy".
  - `TeamViewerMode` `summaryExpand` reads as "Summary with expand" instead of camelCase.
  - `ArticleContentType` covers the full schema (`projectUpdate` and `announcement` were not previously labelled because the inline map was a `Partial<Record>`).
- **Inline map cleanup in `ArticlePublisher.tsx`:** removed `WORKFLOW_OUTCOME_LABELS`, `DRAFT_GROUP_LABELS`, `DRAFT_GROUP_EMPTY_COPY`, `CONTENT_TYPE_LABELS`, `MEDIA_ROLE_LABELS`, `DESTINATION_LABELS`, the local `friendlyEnumLabel` helper, and the local `transitionActionLabel` definition. Renamed the local render-scope `workflowOutcomeLabel` constant to `workflowOutcomeChipLabel` to avoid shadowing the imported governance function.
- **New tests:** `apps/hb-webparts/src/webparts/articlePublisher/authorLabels.test.ts`. Iterates every enum value in `publisherEnums.ts` (`ARTICLE_CONTENT_TYPE_VALUES`, `ARTICLE_SUBJECT_VALUES`, `DESTINATION_VALUES`, `HERO_THEME_VARIANT_VALUES`, `MEDIA_ROLE_VALUES`, `PROJECT_STAGE_VALUES`, `SPOTLIGHT_TYPE_VALUES`, `TEAM_VIEWER_GROUPING_MODE_VALUES`, `TEAM_VIEWER_MODE_VALUES`, `TEAM_VIEWER_SORT_MODE_VALUES`, `WORKFLOW_STATE_VALUES`) through every relevant label function and asserts: (a) the label is non-empty, (b) the label is not identical to the raw enum token, and (c) there are no `→ <enum>` regressions. Adds specific-case checks for the editorially loaded labels ("Project Spotlight", "Awaiting review", "Send for review", "Org chart", etc.).

Preserved seams (unchanged):
- All adapter contracts under `publisherAdapter/**` — untouched.
- All publish / republish / archive / withdraw / preview lifecycle behaviour.
- `ARTICLE_PUBLISHER_WEBPART_ID`, `<ArticlePublisher>` prop contract, `mount.tsx` wiring, `actorEmail` threading.
- All previously exported pure helpers (`applyPromotionPolicyToDraft`, `promotionLockStatusText`, `applyTeamMemberPrincipalChange`, `contentTypeOptionsForDraft`, `milestoneLegacyNotice`, `resolveTemplateKeySystemManaged`, `scheduledLegacyStateNotice`, `unsupportedDestinationNotice`, `update`, `workflowFilterOptions`).

---

## 2. Exact files changed

- `apps/hb-webparts/src/webparts/articlePublisher/authorLabels.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/authorLabels.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/config/package-solution.json` (`1.0.0.269` → `1.0.0.270`)

No changes to:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` and `.d.ts` (no styling change)
- `apps/hb-webparts/src/homepage/data/publisherAdapter/**`

---

## 3. Validation performed

- `pnpm --dir apps/hb-webparts run check-types` → pass.
- `pnpm --dir apps/hb-webparts exec vitest run src/webparts/articlePublisher` → 34/34 pass (12 pre-existing + 22 new governance tests).
- TypeScript exhaustiveness via `Record<EnumType, string>` typing on every label map — confirmed compile-time guarantee that adding a new enum value (e.g. a new `WorkflowState`) without a label fails the build.
- `ChooserGroup`'s `getLabel` is now a required prop; TypeScript fails any future ChooserGroup that forgets to pass a governed label function.
- 28 pre-existing failures in `publisherAdapter/**` test suites remain out of scope and are unchanged by this step.
- Manual scrub of `ArticlePublisher.tsx` JSX for raw-enum leaks — clean. No raw `ArticleContentType`, `HeroThemeVariant`, `MediaRole`, `Destination`, `WorkflowState`, `PublishStatus`, `SpotlightType`, `ProjectStage`, `ArticleSubject`, or `TeamViewer*` token rendered to authors.

---

## 4. Closure report path

`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-b-metadata-simplification-and-automation/step-01/Closure-Report.md`

---

## 5. Real blockers remaining

None. Workstream B can proceed:
- **Prompt-02** — replace manual project-id/name with the authoritative project picker.
- **Prompt-03** — remove author-facing slug management; implement governed slug generation.
- **Prompt-04** — implement intelligent defaults for team heading and related metadata.
- **Prompt-05** — validate metadata simplification end-to-end and close Workstream B.
