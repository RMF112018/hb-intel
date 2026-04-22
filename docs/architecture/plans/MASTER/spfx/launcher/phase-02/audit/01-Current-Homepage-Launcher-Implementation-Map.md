# 01 — Current Homepage Launcher Implementation Map

## Authoritative runtime path

### Wrapper / homepage integration
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.module.css`

### Shell-fit / breakpoint authority
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`

### Data seams
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`

### Ui-kit launcher seams
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherTile.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`

### Supporting seams
- `apps/hb-webparts/src/webparts/hbHomepage/launcherIconRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`

### Test / proof seams
- `e2e/webparts/hb-homepage-host-fit.spec.ts`
- `docs/reference/spfx-surfaces/homepage-hosted-breakpoint-evidence.md`

## Seam ownership map

### 1. Entry-stack composition seam
`HbHomepageEntryStack` owns the flagship page order:
1. hero
2. launcher/actions region
3. shell

This is the real homepage integration seam. The launcher is not an isolated webpart here.

### 2. Measurement seam
`useShellContainer` computes authoritative width from the entry-stack outer envelope minus shell inline insets. `HbHomepageLauncherBand` then adds a second host-width measurement via `ResizeObserver` so the launcher can react to its actual rendered width.

### 3. Device / state seam
`resolveEntryStateWithReason` chooses entry state from practical width + height. The launcher inherits handheld mode and overflow posture from that shared authority instead of owning a separate breakpoint system.

### 4. Data seam
`usePriorityActionsData` resolves config + items from SharePoint lists and applies fallback data outside hosted SharePoint contexts. It remains thin and testable.

### 5. Normalization seam
`priorityActionsNormalization.ts` handles audience, schedule, and device visibility. `priorityActionsLauncherAdapter.ts` then imposes launcher-specific ordering, icon mapping, partitioning, and overflow section grouping.

### 6. Row render seam
`HbcHomepageLauncher.tsx` renders:
- primary tiles
- overflow trigger tile
- handheld single-entry trigger mode
- surface markers

The row does not presently render a headline block itself; its visible row identity is entirely tile-driven.

### 7. Tile grammar seam
`HbcHomepageLauncherTile.tsx` owns icon/title tile anatomy. It is a good thin primitive.

### 8. Overflow / drawer seam
`HbcHomepageLauncherOverflow.tsx` owns:
- trigger label strategy
- trigger count badge
- bottom-sheet open/close behavior
- `Company Tools` drawer header
- grouped section rendering
- drawer tile repetition

This is the most problematic seam in the current runtime.

### 9. Styling seam
The majority of launcher visual behavior is concentrated in `homepage-launcher.module.css`. That file currently mixes:
- healthy tokenized surface logic
- hardcoded gradient/material choices
- row width math
- tile size ramps
- drawer shell rules
- dormant horizontal-scroll classes not wired into the active JSX

### 10. Runtime proof seam
Playwright host-fit coverage exists, but the written hosted evidence appendix is stale and no longer aligned with current launcher version markers. The proof apparatus exists, but closure discipline has drifted.

## Architectural judgment

The architecture is not the main failure. The render and layout choices inside the ui-kit launcher surface are.

That means the best path is **selective structural redesign within the current seam map**, not another top-level composition rewrite.
