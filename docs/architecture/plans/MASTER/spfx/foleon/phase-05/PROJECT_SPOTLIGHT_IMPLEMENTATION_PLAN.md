# Project Spotlight Implementation Plan

## Objective

Implement a bounded Project Spotlight lane rescue that converts the current metadata-heavy Foleon reader preview into an employee-facing visual monthly project showcase while preserving full-window viewer behavior, preview honesty, data honesty, shell edge contracts, and Foleon iframe governance.

## Key Assumptions

- `main` remains the source of truth.
- The current Project Spotlight lane already uses the full-window viewer and must not render an inline iframe.
- `FoleonContentRecord.heroImageUrl` and `thumbnailUrl` are available but not currently surfaced by the Project Spotlight layout.
- The current schema does not support gallery/video/captions/alt text; those belong in a future follow-up unless repo truth shows an existing hidden field.
- Company Pulse and Leadership Message must remain out of scope.

## Recommended Implementation Sequence

1. PS-01 — Repo-truth visual audit and data mapping.
2. PS-02 — Visual-first Project Spotlight layout implementation.
3. PS-03 — Future media schema/content-model follow-up.
4. PS-04 — Validation, package proof, and hosted proof.

## Component Changes

### `ProjectSpotlightReaderLayout.tsx`

Replace the current metadata-panel structure with a visual-first showcase:

- Add a media hero block that uses `viewModel.projectSpotlightMedia.hero`.
- Add an optional storyboard rail:
  - preview: render clearly labeled preview visual zones;
  - ready: render only when unique record-backed media exists.
- Replace `mediaBanner` text-heavy gradient block with `spotlightShowcase` / `spotlightMediaStage` / `spotlightCopyPanel`.
- Remove primary rendering of:
  - `Audience`
  - `Archive group`
  - `Cadence`
  - `Monthly status`
  - `Team: Not listed`
  - `Sample client/location/market/team/milestone`
- Keep one card-launch button, but make CTA visible:
  - the button may wrap the title and use the pseudo-element pattern, or a single visible CTA button may be the actual launch button;
  - do not create nested interactive controls.
- Preserve disabled-state behavior:
  - `aria-disabled`
  - visible reason
  - `aria-describedby`
  - `data-foleon-article-last-refusal`
- Preserve the full-window viewer call:
  - `viewer.openViewer(target, event.currentTarget)`

### `FoleonReaderViewModel.ts`

Add Project Spotlight-specific optional view-model fields:

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
  readonly disabledCtaLabel?: string;
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

Mapping rules:

#### Preview

- title: `Monthly project spotlight`
- teaser: `A preview of the monthly project feature. Photos, video, and the full Foleon story will appear here when published.`
- CTA: `Coming soon`
- meta chips: `Monthly feature`, `Preview`
- media: placeholder hero + 3 preview storyboard placeholders

#### Ready

- title: `Inside ${record.title}` or `${record.title}`.
- teaser: `record.summary` if present; otherwise `Explore this month’s featured project and the visual story behind the work.`
- CTA: `View project spotlight`
- meta chips:
  - `Featured ${Month Year}` if `issueDate` or `publishedOn`
  - `record.region`
  - `record.sector`
- media hero:
  - `record.heroImageUrl ?? record.thumbnailUrl`
  - if absent, placeholder hero marked `isPlaceholder: true`
- supporting items:
  - only unique real media URLs;
  - no fabricated gallery in ready state.

### `FoleonViewerTypes.ts`

No functional change required unless the code agent chooses to add `ariaLabel` to `FoleonArticleCardViewModel` or `FoleonViewerTarget`.

Possible safe addition:

```ts
readonly launchLabel?: string;
```

This should be introduced only if needed to provide `View project spotlight: {title}` without overloading visible text.

### `FoleonReaderLayouts.module.css`

Add visual-first classes:

- `spotlightShowcase`
- `spotlightArticleCard`
- `spotlightMediaStage`
- `spotlightHero`
- `spotlightHeroImage`
- `spotlightHeroPlaceholder`
- `spotlightStoryboard`
- `spotlightStoryboardItem`
- `spotlightCopyPanel`
- `spotlightEyebrowRow`
- `spotlightEyebrow`
- `spotlightPreviewBadge`
- `spotlightTitle`
- `spotlightTeaser`
- `spotlightMetaChips`
- `spotlightChip`
- `spotlightCta`
- `spotlightDisabledReason`
- `spotlightFooter`

Retire or stop using:

- `ribbon`
- `ribbonItem`
- `ribbonLabel`
- `ribbonValue`
- `callout`
- `projectFacts` as primary UI
- `projectFactValuePlaceholder` as primary UI

Do not necessarily delete old classes if Company Pulse/Leadership or tests reference the same module. Remove only when TypeScript/CSS module declarations and tests confirm no consumer.

### `FoleonReaderLayouts.module.css.d.ts`

Update declarations for new CSS class names. Remove old declarations only if no longer referenced.

## Full-Window Viewer Integration

Preserve current integration:

- `FoleonReaderModule` wraps ready/preview layouts in `FoleonFullWindowViewerProvider`.
- Project Spotlight layout calls `useFoleonFullWindowViewer().openViewer(...)`.
- `FoleonFullWindowViewer` uses `FoleonIframeHost`.
- `FoleonIframeHost` uses the existing origin policy.
- The card remains disabled when:
  - preview only;
  - no embed URL;
  - embed not allowed;
  - external-only.

Do not:

- reintroduce inline iframe;
- use raw iframe;
- weaken accepted origins;
- open preview as if it were live content.

## Media Handling Strategy

### Immediate

- Use current schema fields:
  - `heroImageUrl`
  - `thumbnailUrl`
- Use CSS placeholders only for preview or missing media.
- Use native `<img>` only for record-backed images.
- Set `loading="lazy"` unless the hero is above-the-fold and performance proof suggests eager loading.
- Use `object-fit: cover`.
- Provide alt text for informative production images.
- Mark decorative preview flourishes as hidden from assistive technology.

### Future

Use a dedicated media model:

```ts
ProjectSpotlightMediaItem[]
```

with:

- type;
- URL;
- thumbnail;
- caption;
- alt text;
- credit;
- focal point;
- sort rank.

## Accessibility Requirements

- One interactive element inside the article card.
- CTA visible.
- Button accessible name describes destination/action.
- Disabled state remains focusable with `aria-disabled`, `aria-describedby`, visible reason.
- Focus returns to launch element on viewer close.
- Informative images have meaningful alt text.
- Decorative visuals are hidden/null.
- No hover-only affordance.
- Keyboard activation opens viewer.
- Reduced-motion safe; no autoplay video in homepage lane.

## Responsive Requirements

### Desktop paired layout

- Major slot uses a two-zone composition:
  - visual media stage;
  - editorial copy panel.
- If the slot is left-dominant, allow left edge bleed through shell contract.
- No right overflow.

### Desktop stacked/full-width

- Expand hero to wider cinematic ratio.
- Storyboard rail can become horizontal.

### Tablet

- Stack media over copy.
- Use 16:9 hero.
- Limit visual rail to two items or scroll-snap if necessary.

### Mobile

- Single-column.
- Full-width edge-ready surface.
- Hero 16:9.
- CTA immediately visible after teaser.
- Hide nonessential chips.
- No metadata grid.

## Data Honesty Rules

- Production must never fabricate:
  - team;
  - gallery images;
  - video;
  - captions;
  - milestones;
  - client.
- Preview may show sample visual zones only if clearly labeled preview.
- Missing production media should render a branded fallback, not pretend an image exists.
- Unsupported data should be omitted from primary UI, not rendered as `Not listed` unless the user/admin context requires an explicit data-quality note.

## Tests to Add/Update

### `ProjectSpotlightReaderLayout.test.tsx`

Update or add assertions:

- no primary UI text:
  - `Project Spotlight reader`
  - `Preview layout`
  - `Monthly Status`
  - `Audience`
  - `Archive Group`
  - `Cadence`
  - `Sample client`
  - `Sample team`
- renders employee-facing preview:
  - `Project Spotlight`
  - `Monthly project spotlight`
  - `Preview`
  - `Coming soon`
- ready state uses `record.heroImageUrl` as an `<img src>`.
- ready state falls back to `thumbnailUrl` if hero absent.
- ready state renders no production storyboard tiles unless unique URLs exist.
- preview renders storyboard placeholders with `aria-hidden` or accessible labels as appropriate.
- single interactive control remains inside card.
- enabled card opens full-window viewer under provider.
- disabled preview remains `aria-disabled` and sets refusal marker.
- no inline iframe rendered.
- CTA accessible name includes project title.

### `FoleonReaderViewModel.test.ts`

Add assertions:

- preview media and editorial fields populated only for Project Spotlight.
- ready media maps `heroImageUrl` and `thumbnailUrl`.
- missing hero uses thumbnail.
- missing both uses placeholder media.
- `Team` is not exposed as a primary project fact.
- Pulse and Leadership leave new Project Spotlight-specific fields undefined.

### `FoleonReaderModule.test.tsx`

Update tests only if text/markers change. Keep tests focused on state machine and provider wrapping.

### Homepage tests

If current hbHomepage tests assert old text, update them to employee-facing copy.

## Validation Commands

Use the repo’s actual package scripts. Expected command set:

```bash
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
```

If SPFx package version is changed:

```bash
pnpm --filter @hbc/spfx-hb-webparts test -- --run hbHomepagePackageAuthority
```

If local Node version blocks SPFx build/package, document the blocker and run direct TypeScript/Vitest proofs as applicable. Do not claim package proof if it was not executed.

## Versioning / Packaging Impact

If the implementation changes shipped SPFx-visible source:

- bump homepage solution version in the relevant `package-solution.json`;
- bump `HbHomepageWebPart.manifest.json` versions in both authority/runtime copies if repo policy requires lockstep;
- update `HOMEPAGE_LAUNCHER_VERSION` if existing package authority tests require it;
- update package-proof docs;
- produce `.sppkg` only if the environment supports the required Node/SPFx versions.

The code-agent must inspect current package authority files before changing versions.

## Hosted Proof Checklist

After deployment, verify in hosted SharePoint:

- Project Spotlight no longer displays `Project Spotlight reader`.
- Primary surface is media-forward.
- No primary metadata ribbon.
- Preview state is clearly labeled but employee-facing.
- Ready state uses real `heroImageUrl`/`thumbnailUrl` when configured.
- No right-edge overflow.
- Paired row layout retains HB Kudos width and Project Spotlight width.
- Mobile stacks cleanly with no horizontal scrolling.
- Clicking/keyboard activating the card opens full-window viewer only when enabled.
- Preview click does not open fake viewer.
- Viewer close restores focus.
- Accepted-origin governance still blocks disallowed URLs.

## Rollback Plan

1. Revert Project Spotlight layout changes.
2. Revert view-model Project Spotlight media/editorial additions.
3. Revert CSS module and `.d.ts`.
4. Revert related tests.
5. Revert version/package changes.
6. Redeploy previous known-good SPPKG.
7. Confirm hosted page returns to prior state without breaking Company Pulse, Leadership Message, HB Kudos, or Safety.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Current schema supports only one or two media URLs, limiting storyboard. | Implement hybrid that degrades to cinematic hero in ready state; use storyboard only for preview or future schema. |
| Removing metadata may reduce admin observability. | Preserve data attributes/tests and expose governance in Manager/Admin, not employee homepage UI. |
| Hero images may have poor focal points. | Use `object-fit: cover`; future schema adds focal-point fields. |
| Alt text may be weak if schema lacks explicit field. | Generate conservative alt from existing title; add explicit alt text in future schema. |
| CTA plus full-card click may create multiple interactive controls. | Keep one actual launch button and style CTA as part of same button/card. |
| Package version drift. | Require package authority tests and manifest/version lockstep proof. |


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
