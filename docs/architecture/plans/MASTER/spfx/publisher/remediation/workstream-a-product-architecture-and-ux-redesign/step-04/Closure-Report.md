# Workstream A — Step 04 Closure Report

**Prompt:** Phase-08 / Phase-1 / Prompt-04 — Replace the current tab-first admin IA with editorial IA
**Status:** Closed. Inner workflow components editorialised; Publisher no longer reads as a CRUD admin console.
**Date:** 2026-04-14
**Manifest:** `hb-webparts` → 1.0.0.268

---

## 1. Summary of what was changed

Step-03 delivered the editorial three-column shell. Step-04 replaces the still-admin-shaped inner workflow components so authors stop seeing raw data-model controls and start composing an article.

Key changes:

- **New shared primitive: `ChooserGroup`** — a labeled radio-style chip-group over any string enum. Renders author-friendly labels while the underlying enum values flow unchanged into the adapter. Replaces the raw `<select>` controls that leaked `ArticleContentType`, `HeroThemeVariant`, `SpotlightType`, `ProjectStage`, `ArticleSubject`, `MediaRole`, `TeamViewerMode`, `TeamViewerGroupingMode`, `TeamViewerSortMode` values to authors. Backed by label maps (`CONTENT_TYPE_LABELS`, `MEDIA_ROLE_LABELS`, `DESTINATION_LABELS`) plus a `friendlyEnumLabel` camelCase-to-title-case fallback.
- **`MetadataPanel` (Identity section)** — rewritten:
  - Removed author-facing `Slug`, `Resolved template key`, `Destination` `<select>`, and the "Template is system-managed…" admin notice. `Slug` and `TemplateKey` remain system-managed; `TargetSiteUrl` remains derived at publish.
  - `Title` → "Headline" with placeholder copy; `SummaryExcerpt` gets editorial placeholder; `Destination` surfaces as a read-only editorial chip ("Project Spotlight").
  - `ArticleContentType`, `SpotlightType`, `ProjectStage`, `ArticleSubject` each rendered through `ChooserGroup` with author-facing labels (e.g., "Monthly Spotlight", "News Update").
  - `ProjectPicker` retained unchanged.
  - Admin `promotionLockStatusText` no longer rendered here; promotion summary is now composed in the workspace's Promotion section (see below).
- **`HeroPanel` (Hero section)** — rewritten:
  - `HeroThemeVariant` raw select → `ChooserGroup` with "Default" clear option.
  - Labels relaxed to author language: "Hero image URL", "Alt text (for screen readers)", "Hero headline (optional override)", "Eyebrow", "Category label". Placeholder copy added where helpful.
  - `Show hero metadata` presented as a labeled toggle row, not a bare checkbox field.
- **`ContentPanel` split** — the monolithic ContentPanel which combined body fields, secondary image, and team-viewer presentation is retired and replaced by three focused, editorial panels:
  - **`StoryPanel`** — Subhead, Article body (`BodyRichText`, retained `textareaLg`), Intro, Closing, Callout, Pull quote. Rendered in the **Story** canvas section.
  - **`SecondaryImagePanel`** — `ShowSecondaryImage` toggle + URL, alt text, caption. Rendered as a **Secondary hero image** subsection of the **Media** canvas section. The retired admin notice ("persisted on HB Articles; page composition support is deferred…") is gone.
  - **`TeamPresentationPanel`** — Team heading, intro, layout mode, grouping, sort order, initial-visible count, expand toggle. Rendered as a **How the team section is presented** subsection of the **Team** canvas section, above the member list. `TeamViewerMode` / `TeamViewerGroupingMode` / `TeamViewerSortMode` all use `ChooserGroup`.
- **`TeamPanel` (Team section, member rows)** — cards get an editorial header (member index + Featured badge), friendlier field labels ("Display name", "Role title", "Email" rather than "Email / principal", "Role detail", "Group" rather than "Group key", "Reports to (member)", "Bio"), placeholders, a labeled toggle for featuring, and explicit **Move up / Move down / Remove** buttons replacing the `↑` / `↓` / `Remove` chrome. Destructive action uses the new `dangerBtn` class. `applyTeamMemberPrincipalChange` call path is unchanged.
- **`GalleryPanel` (Media section)** — cards get an editorial header; fields relabelled ("Image title", "Image URL", "Alt text", "Caption", "Group"); `MediaRole` moved from raw `<select>` into a dedicated `ChooserGroup` ("Hero (primary)", "Secondary", "Gallery", "Supporting"). Featured toggle is a labeled row; Move up / Move down / Remove are labeled buttons with `aria-label`s.
- **`StatusPanel` → `DestinationBindingPanel`** — admin `<dl>` / `<h3 sectionHeading>` dumps of `TemplateKey`, `PublishStatus`, `SyncStatus`, `PageTemplateKey`, `RenderVersion`, etc. are replaced with two editorial sentences:
  - Template: `"This article will publish with the <TemplateName> template (version …)."`
  - Destination page: `"The destination page <PageName> is bound to this article and was last published …"` with an inline link to the page URL when present and a compact last-sync-message detail. Authors no longer see raw `PublishStatus`, `SyncStatus`, `PageShellVersion`, or `BindingId` tokens.
- **Promotion canvas section** — now rendered from a new `composePromotionSummary(policy)` helper returning author-language sentences ("This article will be featured and will be pinned to the top of listings.", "Promotion is locked by the current policy and applies automatically on save."). Admin-worded `promotionLockStatusText` remains exported for operational traces and is still exercised by existing tests.
- **CSS additions** — `editorialForm`, `editorialNotice`, `editorialReadout`, `editorialReadoutLabel`, `editorialReadoutValue`, `toggleRow`, `chooser`, `chooserLabel`, `chooserGroup`, `chooserChip`, `chooserChipActive`, `chooserHelp`, `sectionSubheading`, `rowCardHeader`, `rowCardIndex`, `rowCardBadge`, `bindingPanel`, `bindingBlock`, `bindingHeading`, `bindingSentence`, `bindingDetail`, `bindingLink`. CSS module `.d.ts` regenerated in step.

Preserved seams (unchanged):
- Adapter surface under `publisherAdapter/**` — untouched.
- Lifecycle: publish / republish / archive / withdraw / preview unchanged.
- `ARTICLE_PUBLISHER_WEBPART_ID`, the `<ArticlePublisher>` prop contract, and `mount.tsx` wiring — unchanged.
- All existing pure exports (`applyPromotionPolicyToDraft`, `promotionLockStatusText`, `applyTeamMemberPrincipalChange`, `contentTypeOptionsForDraft`, `milestoneLegacyNotice`, `resolveTemplateKeySystemManaged`, `scheduledLegacyStateNotice`, `unsupportedDestinationNotice`, `update`, `workflowFilterOptions`, `transitionActionLabel`) preserved. Test suite is unchanged and green.
- `ProjectPicker`, `PreviewPanel` — unchanged.

---

## 2. Exact files changed

- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css.d.ts`
- `apps/hb-webparts/config/package-solution.json` (version `1.0.0.267` → `1.0.0.268`)

No changes to:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx` (still exercises preserved pure exports)
- `apps/hb-webparts/src/homepage/data/publisherAdapter/**`

---

## 3. Validation performed

- `pnpm --dir apps/hb-webparts run check-types` → pass.
- `pnpm --dir apps/hb-webparts exec vitest run src/webparts/articlePublisher` → 12/12 pass.
- Manual scrub of each rewritten panel for admin language, raw enum tokens, and placeholder chrome:
  - No `ArticleContentType` / `HeroThemeVariant` / `MediaRole` / `TeamViewer*` / `Destination` raw enum strings surfaced to authors.
  - No `"Resolved template key"`, `"Slug"`, `"Email / principal"`, `"Group key"`, `"Parent member id"`, `"Gallery group"` admin labels.
  - No `"binding PublishStatus"`, `"Sync status"`, `"Page shell version"`, `"(none)"`, `"(not yet set)"`, or `"PageTemplateKey @ RenderVersion"` style admin dumps.
  - No `"persisted on HB Articles; page composition support is deferred"` admin notice.
  - Placeholder wording (`(Untitled)`, `(no project)`, raw `→ enum` transitions, "Switch to the Preview tab") — already retired in Step-03, confirmed still retired here.
- Keyboard safety: `ChooserGroup` renders each option as a `<button type="button" role="radio" aria-checked>` inside a `role="radiogroup"`; toggles are `<input type="checkbox">` inside `<label>` (`toggleRow`); row-card action buttons carry unique `aria-label`s referencing the row index. Focus order walks top-to-bottom through the canvas.
- Empty/loading/error posture: empty-state wording reworked (`"No team members yet"` + invitational description, `"No supporting media yet"` + invitational description, `"No destination page is bound yet. Publishing this article will create the Project Spotlight page."`). Loading and error states in the draft rail and readiness rail (owned by the shell) are unchanged.
- 28 pre-existing failures in `publisherAdapter/**` remain out of scope (unchanged by this step, confirmed in Step-03).

---

## 4. Closure report path

`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-a-product-architecture-and-ux-redesign/step-04/Closure-Report.md`

---

## 5. Real blockers remaining

None. Workstream A's remaining work is **Prompt-05** — hosted doctrine validation and workstream closure. The Publisher now reads as an editorial product end-to-end: the shell is editorial (Step-03) and the inner sections are editorial (this step), backed by the unchanged adapter seams locked in Step-01.
