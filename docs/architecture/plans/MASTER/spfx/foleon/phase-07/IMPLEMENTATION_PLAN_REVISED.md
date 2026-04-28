# Revised Implementation Plan

## Objective

Refactor Company Pulse from a static digest/card grid into a Project-Spotlight-aligned Foleon access point.

The lane should be a polished edition launcher for content authored and managed entirely in Foleon.

## Files likely to change

Primary:
- `packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx`
- `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css`
- `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts`
- `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts`
- `packages/foleon-reader/src/readers/FoleonViewerTypes.ts`
- `packages/foleon-reader/src/readers/__tests__/CompanyPulseReaderLayout.test.tsx`
- `packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts`
- `packages/foleon-reader/src/components/__tests__/FoleonFullWindowViewerProvider.test.tsx`

Do not modify unless repo truth proves necessity:
- `packages/foleon-reader/src/components/FoleonIframeHost.tsx`
- `packages/foleon-reader/src/services/FoleonOriginPolicy.ts`
- `packages/foleon-reader/src/services/FoleonReaderContentService.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`

## Phase 1 — No schema change

### Component changes

Replace the current digest/briefing composition with an access-point layout:

- `CompanyPulseEditionLauncher`
- `CompanyPulseMediaStage`
- `CompanyPulseLaunchButton`
- `CompanyPulseCoverageStrip`
- `CompanyPulseArchiveFooter`

### View-model changes

Keep `briefingLead`, but treat it as the edition lead, not an article lead.

Consider adding non-breaking optional fields:
- `pulseMedia`
- `editionLabel`
- `coverageLabels`
- `ctaLabel`

Do not require schema changes.

### CSS changes

Create dedicated classes:
- `.pulseEditionSurface`
- `.pulseEditionCard`
- `.pulseMediaStage`
- `.pulseEditionOverlay`
- `.pulseEditionTitle`
- `.pulseEditionTeaser`
- `.pulseCoverageStrip`
- `.pulseCoverageLabel`
- `.pulseEditionFooter`

Avoid:
- white cards inside colored cards;
- dense card grids;
- multiple equal-priority boxes;
- global overflow suppression.

### Interaction

Use the same accessible single-card launch model as Project Spotlight:
- one button;
- transparent overlay;
- visible full-card focus ring;
- `aria-disabled` with visible reason for disabled ready records;
- preview targets open local preview;
- ready targets open iframe inside full-window viewer.

## Phase 2 — Manager metadata only

Manager should manage placement and edition-level metadata only:
- active Foleon URL;
- published/embed URL;
- thumbnail/hero image URL;
- title/summary sync;
- status/readiness;
- display window;
- archive grouping.

Manager should not author stories.

## Phase 3 — Future only if business changes

Only build a real article feed if HB explicitly decides that Company Pulse article-level data is managed outside Foleon.

That is not the current design direction.

## Tests

Required:
- preview state renders access-point layout, not digest board;
- ready state renders active edition only;
- no fabricated secondary stories;
- coverage labels are non-interactive in Phase 1;
- preview card opens local preview viewer;
- ready valid card opens full-window iframe viewer;
- disabled ready card refuses with structured reason;
- no inline iframe in lane;
- one interactive control in the edition card;
- Project Spotlight regression tests still pass;
- Leadership Message regression tests still pass.

## Package/version

If runtime behavior changes in the homepage package, inspect and bump the HB Homepage lockstep set:
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `packages/homepage-launcher/src/constants.ts`

Then rebuild using the repo-authoritative packaging command and prove artifact SHA/strings.
