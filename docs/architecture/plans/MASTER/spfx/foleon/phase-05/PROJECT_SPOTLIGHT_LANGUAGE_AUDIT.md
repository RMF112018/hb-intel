# Project Spotlight Language Audit

## Objective

Replace developer/system/admin wording with employee-facing copy that makes Project Spotlight feel like a monthly project showcase, not a Foleon implementation preview.

## Core Language Problem

The current preview tells the user how the system is wired instead of why the monthly project is worth opening. For homepage employees, the lane should answer:

- What project is being featured?
- Why is it visually interesting?
- What will I see when I open it?
- What is new this month?
- How do I open the full spotlight?

## Current Language Findings

| Current text | Source | Issue | Recommended replacement |
|---|---|---|---|
| `Project Spotlight reader` | `LANE_PREVIEW_COPY.projectSpotlight.title` and card title | Developer/component language. | `Project Spotlight` for preview; `Inside {Project Name}` or `{Project Name}` for ready state. |
| `Project Spotlight Reader` | `LANE_LABELS.projectSpotlight.eyebrow` | Internal lane label. | `Project Spotlight` or `Featured Project`. |
| `Preview layout` | `previewLabel` | Accurate but implementation-oriented. | `Preview` or `Coming soon`. |
| `This sample structure previews...` | Preview description | Over-explains configuration and governance. | `A preview of the monthly project feature. Photos, video, and the full Foleon story will appear here when published.` |
| `Monthly status` | Freshness label | System/status wording. | `Featured this month` or `Monthly feature`. |
| `Audience` | Ribbon label | Governance/admin concept. | Remove from primary UI. If needed, show only in diagnostics. |
| `Archive group` | Ribbon label | Governance/admin concept. | Remove from primary UI. Use archive only as a secondary action outside the feature card. |
| `Cadence` | Ribbon label | Metadata concept. | Remove or convert to subtle chip: `Monthly feature`. |
| `Why this project matters` | Feature callout heading | Better than system language but still text-heavy. | `Why we’re featuring it` or remove the heading and let the teaser do the work. |
| `Sample client` | Preview fact | Placeholder language. | Remove from primary preview or use `Project team details will appear with the published feature.` in a secondary details area. |
| `Sample location` | Preview fact | Placeholder language. | Remove, or use realistic preview-neutral `Location shown when published`. |
| `Sample market` | Preview fact | Placeholder language. | Remove, or use `Market shown when published`. |
| `Sample team` | Preview fact | Placeholder language and unsupported in ready schema. | Remove from primary UI. |
| `Sample milestone` | Preview fact | Placeholder language and current ready value is date, not milestone. | Replace with `Featured month` if publication date exists. |
| `Preview only — a live Project Spotlight edition will open here when published.` | Disabled reason | Honest but technical. | `Preview shown. The full project spotlight will open here once this month’s feature is published.` |
| `This Project Spotlight record does not carry an embeddable Foleon URL yet.` | Disabled reason | Admin/data-model wording. | `This spotlight is published, but the viewer link is not ready yet.` |
| `This Project Spotlight record disallows in-line embedding by governance policy.` | Disabled reason | Admin/governance wording. | `This spotlight cannot open inside the homepage. Use the published Foleon link when available.` |
| `This Project Spotlight record must be opened in a new tab.` | Disabled reason | Acceptable but dry. | `This spotlight must open in Foleon rather than inside the homepage.` |

## Recommended Copy Deck

### Preview state

Use this when no active Project Spotlight record is available or the record path resolves to preview fallback.

```text
Eyebrow: Project Spotlight
Label: Preview
Title: Monthly project spotlight
Teaser: A preview of the monthly project feature. Photos, video, and the full Foleon story will appear here when published.
CTA: Coming soon
Disabled reason: Preview shown. The full project spotlight will open here once this month’s feature is published.
Supporting visual captions:
- Site progress
- Craft detail
- Team moment
Meta chips:
- Monthly feature
- Published by Marketing
```

Avoid:

```text
Project Spotlight reader
Preview layout
Monthly Status
Audience
Archive Group
Cadence
Sample client
Sample team
```

### Ready state with complete data

```text
Eyebrow: Project Spotlight
Title: Inside {record.title}
Teaser: {record.summary}
CTA: View project spotlight
Meta chips:
- Featured {Month Year}
- {record.region}
- {record.sector}
Optional footer action: View past spotlights
Alt text: {record.title} project spotlight feature image
```

### Ready state with missing optional data

```text
Eyebrow: Project Spotlight
Title: Inside {record.title}
Teaser: Explore this month’s featured project and the visual story behind the work.
CTA: View project spotlight
Meta chips:
- Monthly feature
- Featured {Month Year} // if date exists
```

Rules:

- Do not show `Not listed` for unsupported facts in the primary feature.
- Do not show empty labels.
- Do not substitute fake project team, fake client, fake gallery, or fake video.

### Disabled/no-embed ready state

#### No embed URL

```text
CTA: Spotlight link pending
Reason: This spotlight is published, but the viewer link is not ready yet.
```

#### Embed not allowed

```text
CTA: Open in Foleon when available
Reason: This spotlight cannot open inside the homepage.
```

#### Requires external open

```text
CTA: Open in Foleon
Reason: This spotlight must open in Foleon rather than inside the homepage.
```

The code-agent should preserve structured disabled reasons for diagnostics while changing visible employee copy.

### Archive CTA

```text
View past spotlights
```

Do not use:

```text
Open full archive
Lane archive filtering comes in a later workflow.
Archive coming soon
```

If the archive route is not functional, hide the archive CTA in primary UI or render:

```text
Past spotlights coming soon
```

### Viewer CTA

```text
View project spotlight
```

Alternative for small screens:

```text
Open spotlight
```

Accessible label:

```text
View project spotlight: {record.title}
```

### Media labels and captions

Preview captions:

```text
Site progress
Craft detail
Team moment
```

Ready captions with current schema:

- Use captions only if schema supports them.
- Without captions, use no visible caption or a generic visual label derived from existing data only:
  - `{record.title}`
  - `{record.region}` if present
  - `{record.sector}` if present

Alt text:

- If hero image is meaningful and tied to the featured project:
  - `{record.title} project spotlight feature image`
- If visual panel is decorative CSS only:
  - no image node, or `aria-hidden="true"` if decorative markup is used.
- If an image repeats the adjacent title without adding meaning:
  - use empty alt only if the title/teaser already supplies the equivalent purpose.

## Copy Rules for the Code Agent

1. Never use the word `reader` in the employee-facing Project Spotlight lane.
2. Never use `layout`, `route`, `record`, `configuration`, `archive group`, or `cadence` as primary UI labels.
3. Keep `Preview` visible, but do not make the preview label dominate the hierarchy.
4. Use `Project Spotlight` as the stable product/lane label.
5. Use `Inside {Project Name}` only when it improves editorial tone.
6. Use one sentence of teaser copy.
7. Use one clear CTA.
8. Move governance/status copy out of the primary UI.
9. Preserve data honesty; do not invent production facts.
10. Make disabled states understandable to employees while preserving structured diagnostic markers.

## Recommended Final Language Hierarchy

### Preview

```text
Project Spotlight
[Preview]

Monthly project spotlight

A preview of the monthly project feature. Photos, video, and the full Foleon story will appear here when published.

Coming soon
```

### Ready

```text
Project Spotlight
Featured {Month Year}

Inside {Project Name}

{One sentence summary from record.summary}

View project spotlight
```

### Compact/mobile

```text
Project Spotlight
{Project Name}
View spotlight
```

## Language Acceptance Criteria

The final UI passes this audit when:

- no primary UI label says `reader`;
- no primary UI label says `Preview layout`;
- the metadata ribbon is gone or visually demoted;
- users see a visual feature, not a system status panel;
- the CTA clearly opens the Foleon story;
- preview content is labeled without sounding like a debug state;
- missing data does not produce visible `Sample` or `Not listed` rows in the primary showcase;
- governance metadata remains available only where it is useful to admins or tests.


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
