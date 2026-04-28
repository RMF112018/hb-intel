# Project Spotlight Visual Layout Options

## Objective

Define viable Project Spotlight layout strategies and recommend one implementation path for the current repo architecture.

## Constraints

- Do not generate AI images.
- Do not fabricate production media, captions, or metadata.
- Preserve the full-window viewer launch model.
- Preserve Foleon iframe origin policy and accepted-origin governance.
- Do not reintroduce inline iframe rendering.
- Do not touch Company Pulse or Leadership Message except shared type/test updates if unavoidable.
- Do not rely on global `overflow-x: hidden`.
- Preserve edge-bleed readiness.

## Option 1 — Cinematic Feature Banner

### Concept

A large visual/video-first hero dominates the lane. Text is overlaid or docked as a concise editorial treatment.

```text
Large image/video hero
Overlay: Project Spotlight / project name / short teaser
CTA: View project spotlight
Minimal bottom strip: Featured month + region + sector
```

### Desktop paired layout

- Major slot: full-bleed hero panel with 16:9 or 21:9 media crop.
- Text overlay anchored bottom-left with gradient scrim.
- Supporting metadata is limited to 2–3 chips.
- CTA is visible and keyboard reachable.

### Desktop stacked/full-width layout

- Increase hero height.
- Let gradient bleed to shell edge where shell policy allows.
- Text remains within safe-area padding.

### Tablet behavior

- Preserve visual dominance.
- Text block may move below hero if overlay contrast becomes unstable.

### Mobile behavior

- Hero converts to 16:9.
- Text and CTA stack below or overlay with larger scrim.
- No metadata grid.

### Preview behavior

- Use branded CSS preview art or a blurred/abstract placeholder panel.
- Label `Preview`.
- CTA disabled as `Coming soon`.

### Ready behavior

- Use `record.heroImageUrl ?? record.thumbnailUrl`.
- Fall back to preview-style visual if no media is configured.
- Use `record.summary` as one-sentence teaser.

### Pros

- Strongest "premium showcase" impression.
- Simple to implement using existing single-image schema.
- Aligned with SharePoint Hero/News visual patterns.

### Cons

- Less rich than a true storyboard.
- Requires good hero image curation.
- Video not available until schema enhancement.

### Implementation complexity

Medium.

### Schema/content requirements

- Immediate: `heroImageUrl` or `thumbnailUrl`.
- Future: focal point, alt text, video URL.

## Option 2 — Visual Storyboard

### Concept

A primary hero image is paired with two or three supporting visual tiles that imply a richer Foleon story.

```text
Primary image
Supporting image/video tiles
Short headline
One-sentence teaser
View project spotlight CTA
```

### Desktop paired layout

- 60–70% primary image area.
- 30–40% storyboard rail with 2–3 tiles.
- Text can sit in an editorial overlay or side panel.
- Works especially well in the major-left homepage position.

### Desktop stacked/full-width layout

- Primary image spans top.
- Supporting tiles become a horizontal filmstrip.
- CTA stays near title.

### Tablet behavior

- Two-tile grid under hero.
- Hide third tile if space is constrained.

### Mobile behavior

- Single hero image.
- Optional horizontal filmstrip with scroll snap, no visible scrollbar.
- CTA under teaser.

### Preview behavior

- Use CSS-generated abstract project-photo placeholders.
- Label each preview visual with employee-facing labels:
  - `Site progress`
  - `Craft detail`
  - `Team moment`
- Do not imply actual project photos are live.

### Ready behavior

- Current schema can only populate one or two distinct URLs:
  - `heroImageUrl`
  - `thumbnailUrl`
- Supporting tiles must be hidden unless unique URLs exist or schema is extended.
- If only one media URL exists, render a cinematic banner variant.

### Pros

- Best match for the user's intent: image/video-forward monthly project showcase.
- Communicates "open this to see more" better than a text panel.
- Can degrade to a single-image cinematic banner.

### Cons

- Full storyboard requires future schema/content fields.
- Careful fallback rules are needed to avoid fake production tiles.

### Implementation complexity

Medium-high.

### Schema/content requirements

- Immediate: use `heroImageUrl` and `thumbnailUrl`.
- Future: `ProjectSpotlightMediaItem[]` with image/video/caption/alt/focal-point fields.

## Option 3 — Magazine Cover

### Concept

A polished editorial cover-style surface with large project title, cover image, issue marker, and one cover line.

```text
Project Spotlight
{Project Name}
Large cover image
Featured {Month Year}
Cover line
View project spotlight CTA
```

### Desktop paired layout

- Cover image and type lockup dominate.
- Visual treatment resembles a digital magazine cover.
- Works well when there is one strong hero image.

### Desktop stacked/full-width layout

- Cover expands to wide hero.
- Title can become very large.

### Tablet behavior

- Maintain cover ratio.
- Reduce headline size.

### Mobile behavior

- Cover card converts to portrait-ish panel.
- CTA below cover line.

### Preview behavior

- CSS-generated cover with `Preview`.
- Use neutral placeholder labels, not sample facts.

### Ready behavior

- `record.title`, `record.summary`, `heroImageUrl`.
- No gallery dependency.

### Pros

- Premium/editorial feel.
- Works with current schema.
- Less complex than storyboard.

### Cons

- Less explicit about photos/videos.
- Can become too static if every month looks identical.
- Does not show multiple visual moments.

### Implementation complexity

Medium-low.

### Schema/content requirements

- Immediate: `heroImageUrl`/`thumbnailUrl`.
- Future: focal point and art direction fields.

## Recommended Option — Visual Storyboard / Cinematic Hybrid

### Recommendation

Implement a hybrid layout:

```text
Left/top:
  Dominant media panel using heroImageUrl or thumbnailUrl.
  Preview uses branded visual placeholder, not fake photos.

Right/bottom:
  Project Spotlight eyebrow
  Project title
  One-sentence teaser
  CTA: View project spotlight
  Minimal chips: Featured month / region / sector

Supporting visual row:
  If unique supporting media exists: render up to 3 tiles.
  If not: in ready state, do not fabricate tiles.
  In preview state, render clearly labeled sample visual zones.
```

### Why this is the best fit

- It aligns with the purpose of the monthly Project Spotlight: the Foleon document holds the deeper narrative while the homepage lane acts as a visual teaser.
- It uses the media fields that already exist.
- It can be implemented now without a list schema migration.
- It creates a clear path to a future media schema without reworking the component again.
- It preserves full-window viewer behavior and iframe governance.
- It fixes the current employee-language problem.
- It maintains honest preview fallback.

## Proposed DOM Structure

```tsx
<article className={styles.spotlightShowcase} aria-labelledby={viewModel.titleElementId}>
  <div className={styles.spotlightMediaStage}>
    <MediaHero media={viewModel.projectSpotlightMedia.hero} />
    <StoryboardRail items={viewModel.projectSpotlightMedia.storyItems} preview={isPreview} />
  </div>

  <div className={styles.spotlightCopyPanel}>
    <p className={styles.spotlightEyebrow}>Project Spotlight</p>
    {isPreview ? <span className={styles.previewBadge}>Preview</span> : null}
    <h2 id={viewModel.titleElementId}>
      <CardLaunchButton ...>{viewModel.projectSpotlightEditorial.title}</CardLaunchButton>
    </h2>
    <p>{viewModel.projectSpotlightEditorial.teaser}</p>
    <div className={styles.spotlightMetaChips}>...</div>
    <span className={styles.spotlightCta}>View project spotlight</span>
    {disabledReason ? <p id={reasonId}>...</p> : null}
  </div>
</article>
```

## Proposed View Model Additions

```ts
export interface FoleonReaderProjectSpotlightMediaItem {
  readonly id: string;
  readonly type: 'image' | 'video' | 'placeholder';
  readonly url?: string;
  readonly thumbnailUrl?: string;
  readonly altText?: string;
  readonly caption?: string;
  readonly isPlaceholder: boolean;
}

export interface FoleonReaderProjectSpotlightEditorial {
  readonly eyebrow: string;
  readonly title: string;
  readonly teaser: string;
  readonly ctaLabel: string;
  readonly disabledReasonText?: string;
  readonly metaChips: readonly FoleonReaderChip[];
}

export interface FoleonReaderViewModel {
  readonly projectSpotlightMedia?: {
    readonly hero: FoleonReaderProjectSpotlightMediaItem;
    readonly storyItems: readonly FoleonReaderProjectSpotlightMediaItem[];
  };
  readonly projectSpotlightEditorial?: FoleonReaderProjectSpotlightEditorial;
}
```

## Immediate Data Mapping

### Preview

```ts
projectSpotlightMedia.hero = {
  id: 'project-spotlight-preview-hero',
  type: 'placeholder',
  isPlaceholder: true,
  caption: 'Monthly project feature'
}

storyItems = [
  { id: 'preview-progress', type: 'placeholder', caption: 'Site progress', isPlaceholder: true },
  { id: 'preview-craft', type: 'placeholder', caption: 'Craft detail', isPlaceholder: true },
  { id: 'preview-team', type: 'placeholder', caption: 'Team moment', isPlaceholder: true }
]
```

### Ready

```ts
const heroUrl = record.heroImageUrl ?? record.thumbnailUrl;

projectSpotlightMedia.hero = {
  id: `${record.id}-hero`,
  type: 'image',
  url: heroUrl,
  isPlaceholder: !heroUrl,
  altText: heroUrl ? `${record.title} project spotlight feature image` : undefined
}

storyItems = uniqueDefined([
  record.thumbnailUrl !== heroUrl ? record.thumbnailUrl : undefined
]).map(...)
```

If no supporting unique media exists, do not render a production storyboard rail. The CSS can leave the area for the copy panel or expand the hero.

## Edge-Bleed Behavior

The module should remain edge-bleed-ready:

- outer surface: `margin-inline: 0; padding-inline: 0;`
- internal safe area on child blocks only;
- no global overflow suppression;
- no dependency on DOM order for left/right edge ownership;
- use shell slot/occupant attributes or future edge policy when activated.

## Accessibility Behavior

- Preserve one interactive launch control.
- Maintain keyboard activation and focus restoration.
- CTA text must be visible, not only implied by card click.
- The launch button accessible name should include the project title:
  - `View project spotlight: {record.title}`
- Informative images require alt text.
- Decorative preview art should be CSS background or `aria-hidden`.
- Disabled cards must keep `aria-disabled`, visible disabled reason, and `aria-describedby`.

## Final Recommendation

Proceed with **Option 2: Visual Storyboard / Cinematic Hybrid**, implemented in two tiers:

1. **Tier 1: Immediate layout rescue**
   - media-first hero
   - employee-facing copy
   - minimal meta chips
   - visible CTA
   - preview storyboard placeholders
   - no schema migration

2. **Tier 2: Content model expansion**
   - gallery/video fields
   - captions
   - alt text
   - focal points
   - Manager UI fields
   - SharePoint schema/provisioning updates


## Source References Reviewed

### Repo truth — current `main`
- `packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx`
- `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css`
- `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts`
- `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts`
- `packages/foleon-reader/src/readers/FoleonReaderModule.tsx`
- `packages/foleon-reader/src/readers/FoleonReaderLayoutRegistry.tsx`
- `packages/foleon-reader/src/readers/readerConfigs.ts`
- `packages/foleon-reader/src/readers/FoleonViewerTypes.ts`
- `packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx`
- `packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx`
- `packages/foleon-reader/src/types/foleon-content.types.ts`
- `packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md`
- `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md`

### External research references
- Microsoft Support — SharePoint News web part layouts and image-heavy news patterns: https://support.microsoft.com/en-us/office/use-the-news-web-part-on-a-sharepoint-page-c2dcee50-f5d7-434b-8cb9-a7feefd9f165
- Microsoft Support — SharePoint modern page image sizing, responsive scaling, image aspect ratios: https://support.microsoft.com/en-us/office/image-sizing-and-scaling-in-sharepoint-modern-pages-dc510065-b5a5-4654-bc94-e3ecbbb57d8d
- Microsoft Learn — Viva Connections card design principles: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/viva/design/designing-card
- Microsoft Learn — Viva Connections design guidance: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/viva/design/design-intro
- Fluent 2 — React Card usage and card anatomy: https://fluent2.microsoft.design/components/web/react/core/card/usage
- Fluent 2 — Accessibility, hierarchy, and navigation guidance: https://fluent2.microsoft.design/accessibility
- Foleon — Embed your Foleon Doc on a website: https://www.foleon.com/knowledge/embed-your-foleon-doc-on-a-website
- Foleon — Embed element behavior and iframe constraints: https://www.foleon.com/migration/knowledge/all-about-the-embed-element
- W3C/WAI — WCAG non-text content: https://w3c.github.io/wcag/understanding/non-text-content.html
- W3C/WAI — Decorative images tutorial: https://www.w3.org/WAI/tutorials/images/decorative/
- W3C/WAI — Link purpose in context: https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context
- Inclusive Components — Cards and pseudo-content clickable-card pattern: https://inclusive-components.design/cards/
