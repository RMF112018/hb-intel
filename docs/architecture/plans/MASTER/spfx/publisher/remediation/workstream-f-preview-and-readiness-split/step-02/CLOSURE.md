# Workstream F · Step 02 — Closure

## Objective
Implement a visual Article Preview surface — an editorial representation of the article the author will publish — and route the Publisher's preview slot to it.

## What changed

### New: `previewSurface/ArticlePreview.tsx`
A pure-visual preview component that reads the shared `PreviewOutcome` and renders:
- **Homepage card preview** — a dashed-separated section above the article that shows what the roll-up will look like on the homepage (thumbnail + title + summary excerpt), so the author sees both the article page and its card together.
- **Hero** — `HeroPrimaryImage` + `HeroPrimaryImageAltText` in a 16:9 frame, `HeroEyebrow`, `HeroCategoryLabel`, `HeroTitle` (falling back to `article.Title`), and `Subhead`.
- **Summary excerpt** — bordered callout styling so it reads as the lead-in.
- **Body** — `BodyIntro` as a lead paragraph; `BodyRichText` rendered via `dangerouslySetInnerHTML` (safe — the HTML is already schema-locked by TipTap + the paste sanitiser from workstream-c step-05); local typography for h2 / h3 / lists / blockquote / links matches the hosted page treatment.
- **Callout** + **pull quote** — rendered as the real ornamental treatments rather than field-name strings.
- **Body closing** — lead-out paragraph.
- **Team roster** — pulls from the resolved `teamMembers`, sorts by `SortOrder` with `DisplayName` tiebreaker (same rule as `selectVisibleTeamMembers`), promotes the featured teammate to its own chip above the list, reuses `teamMemberInitials` for the avatar so composer + preview speak one visual language.
- **Gallery grid** — pulls from `media`, filters to `MediaRole === 'gallery'`, sorts by `SortOrder` with `ImageAsset` tiebreaker (mirroring `pageCompositor.galleryImages`), renders a 4:3 thumbnail grid with the featured image highlighted.

Nothing on this surface narrates validation, drift, or publish-decision state. Empty / failure states are editorial (`"We couldn't compose a preview from the current draft. Publish Readiness has the details."`), not diagnostic.

### Styles
- `articlePreview.module.css` + `.d.ts` — a complete editorial typography pass (38 classes) with the HBC presentation tokens (primary blue, ochre accents) and hosted-page-adjacent treatments for body prose (h2/h3 sizes, list indents, blockquote, links). No shared UI-kit churn; the preview surface uses its own local composition.

### `ArticlePublisher.tsx`
- Imports `ArticlePreview` from `previewSurface/`.
- Replaces the `<PreviewPanel>` invocation with `<ArticlePreview>`. The old inline `PreviewPanel` implementation is left in place as dead code this step — it is deleted in Step 04 when the readiness surface from Step 03 takes over the diagnostic content. Keeping the dead function for one step makes the Step-02 diff reviewable in isolation.

## Doctrine alignment
- **Preview–publish parity.** The preview reads directly from the same `PreviewOutcome.resolution` that the publish orchestrator consumes — team sort order, gallery filter + sort, featured-image highlight all derived from the same source of truth.
- **Editorial, not diagnostic.** Zero validation text, zero drift banners, zero `category` / `field` / `action` trace. The surface speaks in the author's voice.
- **Host-safe.** The body HTML is schema-locked at authoring time (TipTap extensions) and sanitised on paste (workstream-c step-05), so `dangerouslySetInnerHTML` in the preview is bounded to the same allow-set. No new dependencies; the preview is local composition + local CSS.
- **Accessibility.** Every image carries `alt={row.AltText}`; headline is a real `<h1>`, section headings are `<h2>`, card preview is a `<section aria-label>`. Team list is a `<ul>`; gallery is an `<ol>` (order is editorial); callout is `<aside aria-label>`; pull quote is `<blockquote>`.

## Lifecycle safety
- `PreviewOutcome` shape unchanged.
- `previewBuilder`, `publishOrchestrator`, `validationEngine`, `composeReadinessSummary`, `pageCompositor` untouched.
- Publish / republish / archive / withdraw lifecycle unchanged.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run ArticlePublisher previewSurface` — 170/170 pass across 14 files. No new tests added this step (the component is a pure view over the shared `PreviewOutcome`; Step 04 will add integration tests proving the two surfaces partition the data correctly).

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/previewSurface/articlePreview.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/previewSurface/articlePreview.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/previewSurface/index.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-f-preview-and-readiness-split/step-02/CLOSURE.md` (this file)

## Remaining / follow-on (per Step 01 design)
- **Step 03** — Build the Publish Readiness surface (`readinessSurface/PublishReadiness.tsx`) consolidating readiness summary + blocking issues (collapsible technical detail) + plain-English decision + collapsible drift + actions + last-action banner.
- **Step 04** — Rewire consumers, delete the inline `PreviewPanel`, add integration tests proving the two surfaces read disjoint slices of `PreviewOutcome`.
- **Step 05** — Full behavioural scrub + workstream README + hosted SPFx vetting.

No blockers.
