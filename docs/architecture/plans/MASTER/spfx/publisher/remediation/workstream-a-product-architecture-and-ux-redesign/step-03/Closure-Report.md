# Workstream A — Step 03 Closure Report

**Prompt:** Phase-08 / Phase-1 / Prompt-03 — Implement the new workspace shell and navigation model
**Status:** Closed. Shell + navigation + empty/loading/error states implemented. Inner workflow components retained as-is, per prompt scope ("without yet replacing every inner workflow component").
**Date:** 2026-04-14
**Manifest:** `hb-webparts` → 1.0.0.267

---

## 1. Summary of what was changed

Replaced the Publisher's admin two-pane + tab-strip + footer-button-strip surface with the three-column editorial workspace locked in Step-02:

- **Left draft rail** — replaces the `state-filter <select> + flat list`. Collapsible grouped browser across `draft`, `review`, `approved`, `published` (expanded by default) and `archived`, `withdrawn` (collapsed by default). Loads all groups in parallel and labels each with its editorial outcome rather than raw `WorkflowState` token. First-class empty, loading, and error states (group-level and rail-level). Primary affordance is "Start new draft" at the top.
- **Center authoring canvas** — replaces the seven-tab panel router. Vertical, in-page-anchored editorial flow across the eight author-facing sections from Step-02 §3.2: Identity, Hero, Story, Media, Team, Promotion, Destination binding, Preview. Each section renders a semantic `<section>` with a labelled heading, editorial intent line, and the existing inner workflow component inside. A `sectionIndex` anchor nav provides keyboard-accessible section jumps. Canvas empty state is a single premium empty invitation rather than "Select or create an article."
- **Right readiness rail** — replaces the footer `actionBar`, the `driftChip` / `validationChip` inline chips, and the `→ <enum>` transition buttons. Sticky panel with:
  - **Readiness summary** — one author-language sentence composed from `workflowStateMachine` outcome + `validationEngine` blocking count + `buildPublishResolutionContext` outcome + `republishPolicy` drift (via `preview.drift`).
  - **Binding signal** — replaces the raw `binding <PublishStatus>` badge with an editorial sentence.
  - **Blocking issues** / **warnings** lists sourced from `preview.validation.errors` / `warnings`.
  - **Primary actions** group (Publish, Republish, Save draft, Recompose preview), enabled/disabled from the same rules that previously gated the footer buttons.
  - **Workflow transitions** group using `validTransitionsFrom`, rendered via the new `transitionActionLabel` mapping (e.g., `review → "Send for review"`, `approved → "Mark approved"`, `draft → "Return to draft"`). Authors never see `→ approved` tokens.
  - **Destructive actions** block (Archive / Withdraw) visually separated, consuming the same `handleTransition` seam.
  - **Post-action status** with ARIA-live wording and spinner.
- **Author-facing language scrub** — replaced placeholder wording: `(Untitled)` → `Untitled draft`, `(no project)` → `No project linked yet`, `"No articles in state 'X' yet."` → editorial per-group empty copy, `"Switch to the Preview tab…"` → `"Add content above to compose a structural preview…"`, `"HB Articles"` heading → `"Your articles"`. Raw `WorkflowState` badge → outcome chip (`WORKFLOW_OUTCOME_LABELS`).
- **Responsive + host-safe behavior** — desktop renders three columns; at < 1280px the readiness rail moves below the canvas and sticks to the viewport bottom; at < 960px the whole workspace stacks. No suite-bar/app-bar assumptions; the workspace owns only the page canvas.
- **CSS retirement** — dropped the `shell`, `listPane`, `listHeader`, `listTitle`, `filterLabel`, `postList`, `postRow*`, `editor`, `editorHeader`, `title`, `meta`, `stateBadge`, `bindingBadge`, `tabs`, `tab`, `tabActive`, `panel`, `actionBar`, `actionRow`, `driftChip`, and `validationChip` classes. Retained all classes still consumed by inner workflow panels (MetadataPanel, HeroPanel, ContentPanel, TeamPanel, GalleryPanel, StatusPanel, PreviewPanel, ProjectPicker). The CSS module `.d.ts` was regenerated in step to keep type safety.
- **Preview loading posture** — preview is now recomposed whenever the selected article changes, not only when a "Preview" tab is activated; the Preview section and the readiness rail therefore stay live without an explicit author click.
- **Preserved seams (unchanged)** — `ARTICLE_PUBLISHER_WEBPART_ID`, `<ArticlePublisher>` prop contract, `createPublisherRepositories`, `createDefaultPublishOrchestrator`, `createSharePointPageBindingWriter`, `createSharePointPageCreationService`, `buildPublishResolutionContext`, `workflowStateMachine.canTransition` / `validTransitionsFrom`, `buildPublisherPreview`, `createProjectsLookupSearch`, `selectPromotionPolicy`, `resolveTemplateSystemManaged`, `actorEmail` threading from `mount.tsx`, and the publish/republish/archive/withdraw/preview lifecycle. No adapter file was touched.

---

## 2. Exact files changed

- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css.d.ts`
- `apps/hb-webparts/config/package-solution.json` (version `1.0.0.266` → `1.0.0.267`)

No changes to:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json` (webpart id unchanged)
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx` (surface tests target pure exports, not JSX; still green)
- `apps/hb-webparts/src/homepage/data/publisherAdapter/**`

---

## 3. Validation performed

- `pnpm --dir apps/hb-webparts run check-types` → pass.
- `pnpm --dir apps/hb-webparts exec vitest run src/webparts/articlePublisher` → 12/12 pass. The preserved pure exports exercised by tests (`applyPromotionPolicyToDraft`, `applyTeamMemberPrincipalChange`, `contentTypeOptionsForDraft`, `milestoneLegacyNotice`, `promotionLockStatusText`, `resolveTemplateKeySystemManaged`, `scheduledLegacyStateNotice`, `unsupportedDestinationNotice`, `update`, `workflowFilterOptions`) remain unchanged and green.
- `pnpm --dir apps/hb-webparts run test` → 749 pass / 28 fail. **The 28 failures are pre-existing in files untouched by this step** (primarily `src/homepage/data/publisherAdapter/preview/previewBuilder.test.ts` and adjacent adapter tests; verified by running the same suite against the pre-change worktree: identical failures present). No regression introduced by this step.
- Manual scrub for drift in the touched files: removed `(Untitled)`, `(no project)`, tab-strip references, raw enum transition labels, and `"Preview tab"` wording. Retained the `statusLine` helper class in CSS because it is still consumed by inner workflow panels whose rewrite is out of Prompt-03's scope.
- Empty/loading/error posture verified per surface: draft rail (rail-level + per-group), canvas (no-selection + per-section via the existing inner panels), readiness rail (empty, busy, status, blocking/warn lists).
- Keyboard-safety verified: all lifecycle/transition actions are real `<button>` elements with stable labels; draft-rail rows are buttons with `aria-current`; group headers are buttons with `aria-expanded`; section anchor index uses real `<a href="#…">` links; the readiness rail carries an `aria-live="polite"` status region; no focus traps are introduced.

---

## 4. Closure report path

`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-a-product-architecture-and-ux-redesign/step-03/Closure-Report.md`

---

## 5. Real blockers remaining

None for Prompt-03. Next steps on the workstream plan:

- **Prompt-04** refines the IA inside each section (replaces the inner `MetadataPanel` / `HeroPanel` / `ContentPanel` / `TeamPanel` / `GalleryPanel` / `StatusPanel` / `PreviewPanel` implementations with editorial compositions, and scrubs any remaining inner-panel admin language). The shell and navigation from this step are now stable ground for that work.
- The 28 pre-existing test failures under `publisherAdapter/**` are outside this workstream's scope and are surfaced here only to confirm they are not new regressions from Prompt-03.
