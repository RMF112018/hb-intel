# Project Spotlight Visual Audit

## Objective

Audit the current Project Spotlight Foleon reader lane and define what must change to move it from a developer-visible Foleon reader preview into an employee-facing, media-forward monthly project showcase.

The recommended direction is a **Visual Storyboard / Cinematic Hybrid**: a dominant hero image or video-style panel, two to three supporting visual moments when available, one concise headline/teaser, and a clear `View project spotlight` launch action into the governed full-window Foleon viewer.

## Executive Finding

The current implementation is structurally stronger than the original shared-cookie-cutter reader, but it still over-indexes on system metadata, preview disclaimers, and record-governance labels. It underuses the media fields already present in `FoleonContentRecord` and does not yet have a production-ready content model for galleries, videos, captions, or alt text.

Immediate UI improvements are possible without schema changes:

- Use `heroImageUrl` and `thumbnailUrl` as the primary media source when available.
- Replace the large gradient-only banner with a media-first hero surface.
- Replace metadata ribbon labels (`Monthly status`, `Audience`, `Archive group`, `Cadence`) with one or two employee-facing chips.
- Convert the callout into a short editorial teaser.
- Hide governance/admin fields from the primary UI while preserving data attributes and tests.
- Keep preview honest, but make it look like the intended employee experience.

A fully media-rich production experience requires a follow-up content model/schema enhancement for multiple gallery images, video URLs, captions, alt text, focal points, and media type.

## Current Composition

### 1. Rendering component

`ProjectSpotlightReaderLayout.tsx` renders the lane. It is registered through `FOLEON_READER_LAYOUTS.projectSpotlight` in `FoleonReaderLayoutRegistry.tsx`.

Current DOM markers:

```tsx
data-foleon-reader-layout="project-spotlight"
data-foleon-reader-lane="projectSpotlight"
data-foleon-reader-state={viewModel.state}
data-foleon-layout="project-spotlight-feature"
```

The implementation already has a lane-owned layout and no longer delegates to the old compatibility shell. The problem is not routing. The problem is composition, copy, and media strategy.

### 2. Current layout blocks

Current order:

1. `featureSurface`
2. `articleCard`
3. `mediaBanner` gradient hero
4. eyebrow row: `Project Spotlight Reader`, `Monthly`, `Preview layout`
5. title from `card.title`
6. summary from `viewModel.summary`
7. metadata ribbon: freshness, audience, archive group, cadence
8. feature callout: `Why this project matters`
9. project facts grid: client, location, market, team, milestone
10. disabled reason when target cannot open
11. archive footer
12. warnings

### 3. Launch behavior

The layout uses a single `CardLaunchButton` around the title. The button calls:

```ts
viewer.openViewer(target, event.currentTarget)
```

That is the right launch model. The plan should preserve this pattern and continue to use `FoleonFullWindowViewerProvider` and `FoleonIframeHost`, not a raw iframe.

### 4. Inline iframe posture

The current Project Spotlight lane intentionally ignores `iframeSurface` and uses the full-window viewer only. The test suite explicitly asserts that Project Spotlight never renders an inline iframe even when `iframeSurface` is provided.

This should remain unchanged.

## View Model Audit

### Preview-state fields feeding current UI

| Current UI element | Source | Current issue |
|---|---|---|
| `Project Spotlight reader` title | `LANE_PREVIEW_COPY.projectSpotlight.title` | Developer/system wording; should become employee-facing. |
| Summary paragraph | `LANE_PREVIEW_COPY.projectSpotlight.description` | Over-explains implementation state. |
| `Project Spotlight Reader` eyebrow | `LANE_LABELS.projectSpotlight.eyebrow` | Uses internal lane noun. |
| `Preview layout` | `previewLabel` hardcoded in preview adapter | Honest, but too implementation-oriented. |
| `Monthly status` | `LANE_LABELS.projectSpotlight.freshnessLabel` | Metadata/admin wording. |
| `Monthly edition` | `LANE_LABELS.projectSpotlight.freshnessFallback` | Acceptable only as secondary chip, not primary content. |
| `Audience` | Preview adapter hardcoded `Companywide` | Governance field, not primary employee-facing UI. |
| `Archive group` | Preview adapter hardcoded `Archive coming soon` | Governance/admin field. |
| `Cadence` | Static `Monthly` in layout | Redundant once the lane is clearly monthly. |
| `Why this project matters` | `featureCallout.heading` | Better than developer language, but still too text-section oriented for visual showcase. |
| `Sample client/location/market/team/milestone` | `projectFacts` preview placeholders | Too placeholder-like and too metadata-heavy. |

### Ready-state fields feeding current UI

| UI element | Source | Status |
|---|---|---|
| Title | `record.title` | Supported. Use as project name/headline. |
| Summary | `record.summary` | Supported. Use as one-sentence teaser. |
| Freshness | `record.issueDate ?? record.publishedOn` | Supported. Convert to `Featured this month`/`April spotlight`. |
| Audience | `record.primaryAudience ?? Companywide` | Supported but not primary UI. |
| Archive group | `record.archiveGroup ?? Archive coming soon` | Supported but governance/admin UI. |
| Client | `record.relatedProjectName ?? record.relatedProjectNumber` | Supported indirectly, but naming is not client-specific. Label should not say `Client` unless the field truly represents client. |
| Location | `record.region` | Supported. |
| Market | `record.sector` | Supported. |
| Team | no schema field | Not supported; do not show `Not listed` in primary UI. |
| Milestone | formatted `issueDate ?? publishedOn` | Supported only as date. Better label: `Featured`. |
| Hero/thumbnail media | `record.heroImageUrl`, `record.thumbnailUrl` | Supported by schema but not surfaced in Project Spotlight view model/layout today. |
| Embed viewer URL | `resolution.embedUrl` / `record.embedUrl` | Supported; preserve existing viewer path. |
| Published URL | `record.publishedUrl` | Supported; may be used by viewer/external fallback, not as primary card CTA unless governance allows. |

## Current Media Support

### Already supported in `FoleonContentRecord`

- `thumbnailUrl`
- `heroImageUrl`
- `publishedUrl`
- `previewUrl`
- `embedUrl`
- `title`
- `summary`
- `issueDate`
- `publishedOn`
- `relatedProjectNumber`
- `relatedProjectName`
- `region`
- `sector`
- `allowEmbed`
- `requiresExternalOpen`
- `openMode`

### Available indirectly / can be mapped

- Project display name: `record.title` or `record.relatedProjectName`
- Featured month: `record.issueDate ?? record.publishedOn`
- Location/region: `record.region`
- Project type/sector: `record.sector`
- Primary media: `record.heroImageUrl ?? record.thumbnailUrl`
- Foleon reader launch: `record.embedUrl` through current viewer target

### Not supported today, recommended future schema/config work

- Multiple image gallery items
- Video URL
- Video thumbnail
- Media type per visual item
- Caption per media item
- Alt text per media item
- Focal point / crop hints
- Photographer/credit/byline
- Project team
- Actual client if different from `relatedProjectName`
- Construction phase/milestone as a field separate from publication date
- CTA override text
- Featured media ordering

### Should not be invented in ready state

- Project team
- Client name if `relatedProjectName` is really project name
- Gallery images
- Video URL
- Captions
- Milestones not present in record
- Employee quotes
- Photo credits

## Gap Analysis

### Current strength

- Lane-owned layout exists.
- Full-window viewer contract exists.
- Single interactive control pattern exists.
- Preview/ready state model exists.
- Data honesty principle is already expressed in source comments and tests.
- Existing schema has at least one hero/thumbnail media field.

### Current weakness

- `heroImageUrl` and `thumbnailUrl` are not used by the Project Spotlight layout.
- The primary visible hierarchy is text-first: title, summary, ribbon, callout, facts.
- The "media banner" is a CSS gradient, not a media surface.
- Preview language explains the system instead of selling the monthly feature.
- Governance fields dominate the UI.
- The card-launch button is only visible on the title, even though the pseudo-element makes the full card clickable. The UI should add a visible CTA affordance.
- The ready-state `Team: Not listed` fallback should not appear in primary employee-facing UI.
- No schema support exists for true storyboard/video.

## Immediate Improvement Without Schema Changes

Implement the following in `ProjectSpotlightReaderLayout.tsx`, `FoleonReaderViewModel.ts`, and CSS:

1. Add a `projectSpotlightMedia` view-model field:
   - `heroUrl?: string`
   - `thumbnailUrl?: string`
   - `altText?: string`
   - `isPlaceholder: boolean`
   - `caption?: string`
2. Map ready media from:
   - `heroUrl = record.heroImageUrl ?? record.thumbnailUrl`
   - `thumbnailUrl = record.thumbnailUrl`
   - `altText = record.title` or a concise generated-from-existing-data string such as `{record.title} project spotlight feature image`
3. Use CSS-generated preview visual panels when no media exists.
4. Remove primary metadata ribbon from Project Spotlight.
5. Replace with a compact "featureMeta" row:
   - `Monthly feature`
   - `Featured {Month Year}` if known
   - `{region}` if present
   - `{sector}` if present
6. Replace title:
   - Preview: `Project Spotlight`
   - Ready: `Inside {record.title}` or just `{record.title}` depending final visual composition.
7. Replace CTA:
   - Ready enabled: `View project spotlight`
   - Preview disabled: `Preview — spotlight opens when published`
   - Disabled ready: explain the specific reason in one concise sentence.
8. Keep admin/governance details out of the primary UI. If necessary, expose them only through:
   - data attributes for tests,
   - diagnostics in Manager/Admin, or
   - hidden details only in non-production proof pages.

## What Requires Schema / Manager Enhancement

A true visual storyboard needs the Manager and content registry to capture media assets explicitly:

```ts
interface ProjectSpotlightMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  altText: string;
  credit?: string;
  sortRank: number;
  focalPointX?: number;
  focalPointY?: number;
}
```

Add this later, not in the immediate layout rescue, unless the local agent confirms schema files already include hidden media JSON fields not discovered in this audit.

## External Research Applied

- SharePoint News supports visually oriented layouts such as Top story, Carousel, Tiles, and hub news, and Microsoft emphasizes graphics/rich formatting for announcements and stories.
- SharePoint modern pages scale/crop images responsively and recommend landscape/16:9 or wider images for page title and thumbnails.
- Viva Connections card guidance emphasizes cards that surface information, link resources, and avoid unnecessary jumps; this supports a compact teaser into the full Foleon viewer rather than reproducing the whole story in the lane.
- Fluent 2 Card guidance treats a card as one concept/object with preview/header/footer hierarchy; Project Spotlight should therefore behave as one featured project object, not a general metadata panel.
- Foleon embed guidance requires correct published Doc URL/origin and recognizes iframe/security constraints; do not weaken origin policy or embed governance.
- W3C/WAI image guidance requires meaningful alt text for informative images and null/hidden treatment for decorative visuals.
- Inclusive Components card guidance supports the pseudo-element full-card clickable pattern already used in source, provided focus and accessible names remain clear.

## Audit Conclusion

The Project Spotlight lane should not be treated as a "reader" in the primary UI. It should be a **monthly visual project feature**. The current architecture is ready for this because:

- the lane is independently registered,
- the viewer target model is already in place,
- preview and ready view-model adapters can be changed without touching the homepage shell,
- existing `heroImageUrl` / `thumbnailUrl` can unlock a strong first pass,
- and deeper media can be deferred to a clean schema follow-up.

The recommended implementation is a bounded visual rewrite of the Project Spotlight lane only.


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
