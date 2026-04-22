# Current Launcher Implementation Map

## 1. Render authority

### Entry-stack authority
The homepage entry stack renders the launcher region through:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
  - wrapper-owned `priority-actions` region
  - explicit `data-hb-homepage-entry-stack-rail-surface="homepage-launcher"`
  - launcher band placed in the pre-shell entry stack

### Cutover seam
The homepage-specific launcher seam is:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`

This file now:
- measures host/container width
- resolves device class from shared shell-entry truth
- preserves existing data pipeline seams
- partitions items into primary and overflow tiles
- renders the dedicated launcher package surface

## 2. Dedicated launcher package

### Dedicated package
- `packages/homepage-launcher/package.json`
- `packages/homepage-launcher/src/index.ts`
- `packages/homepage-launcher/src/constants.ts`
- `packages/homepage-launcher/src/HomepageLauncherSurface.tsx`
- `packages/homepage-launcher/src/homepage-launcher-surface.module.css`

This package owns:
- row tile rendering
- `More Tools` trigger
- handheld trigger posture
- drawer shell
- drawer rail behavior
- runtime markers

## 3. Preserved upstream seams

### Data seam
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.js`

### Filtering / normalization seam
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`

### Adapter seam
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`

The adapter is a strength. It keeps the launcher band thin and moves mapping logic out of render.

### Icon-governance seam
- `apps/hb-webparts/src/webparts/hbHomepage/launcherIconRegistry.ts`

## 4. Host-fit and shell-state seams

### Shared shell state
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.js`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.js`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.js`

The launcher inherits device / breakpoint / short-height truth from shared entry-state authority rather than improvising its own viewport model.

## 5. Wrapper styling seam
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.module.css`

This wrapper is intentionally neutral. It no longer adds extra plate styling, which is the correct direction.

## 6. Runtime-truth seams

### Dedicated-package runtime constants
- `packages/homepage-launcher/src/constants.ts`
  - `HOMEPAGE_LAUNCHER_SURFACE_ID = "homepage-launcher"`
  - `HOMEPAGE_LAUNCHER_VERSION = "1.1.72.0"`

### Homepage packaging / manifest seams
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`

## 7. Test / proof seams

### Local or harness-hosted proof
- `e2e/webparts/hb-homepage-host-fit.spec.ts`
- `e2e/webparts/hb-homepage-handheld-closure-proof.spec.ts`
- `e2e/webparts/hb-homepage-launcher-productization-capture.spec.ts`

### Live SharePoint proof
- `e2e/live-sharepoint/homepage.launcher.handheld.live.spec.ts`

These are meaningful closure assets. They are a real strength.

## 8. Remaining legacy seams

### Legacy launcher family still present
- `packages/ui-kit/src/HbcHomepageLauncher/*`
- `packages/ui-kit/src/homepage.ts` still exports the legacy launcher family
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts` still reports `1.1.70.0`

### Interpretation
This legacy family does not appear to remain on the flagship homepage render path, but it is not cleanly retired. That creates ambiguity and weakens runtime-truth cleanliness.
