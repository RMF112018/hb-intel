# Latest Repo Audit — Foleon Preview Fallback Full-Window Viewer

## Objective

Audit the latest Foleon reader changes and determine the safest implementation path for making preview article cards open the full-window reader experience.

## Current conclusion

The requested behavior is feasible, but it should be implemented as an **explicit local preview viewer mode**, not by treating preview content as a live Foleon iframe and not by weakening the existing disabled/refusal model for real embed failures.

## Current repo state

# Repo Truth Reviewed

Repository: `RMF112018/hb-intel`  
Branch/ref reviewed: `main` plus commit `1d8c6436a32d0cd948822c1bbaab1307806128f8`

## Source files / commit inspected

- `packages/foleon-reader/src/readers/FoleonViewerTypes.ts`
- `packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx`
- `packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx`
- `packages/foleon-reader/src/components/__tests__/FoleonFullWindowViewerProvider.test.tsx`
- `packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx`
- `packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx`
- `packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx`
- Recent commit `1d8c6436a32d0cd948822c1bbaab1307806128f8`, which landed HB Homepage `1.1.88.0` Project Spotlight visual-first showcase layout.

## Important current-state observations

- Preview targets are currently created by `createPreviewFoleonViewerTarget(config)` with:
  - `source: 'preview'`
  - `viewerUrl: undefined`
  - `canOpen: false`
  - `disabledReason: 'preview-only'`
- `FoleonFullWindowViewerProvider.openViewer(target)` currently refuses every `target.canOpen === false` target and does **not** render the dialog.
- `FoleonFullWindowViewer` already contains a non-iframe state panel path when `showIframe` is false, but that path is unreachable for preview targets because the provider refuses them before setting `currentTarget`.
- Project Spotlight, Company Pulse, and Leadership Message layouts all calculate `isDisabled = !target.canOpen` and block activation in their local `CardLaunchButton` components before calling `viewer.openViewer`.
- All three lane layouts currently preserve the single-button card-launch pattern and structured `data-foleon-article-last-refusal` behavior for disabled targets.
- The latest Project Spotlight visual-first implementation preserved the legacy hosted-proof marker `data-foleon-layout="project-spotlight-feature"` while changing copy/layout/media behavior.


## Commit `1d8c6436a` audit

The latest Project Spotlight commit landed HB Homepage `1.1.88.0` and refactored Project Spotlight into a visual-first showcase. The commit message reports:

- Project Spotlight now consumes `heroImageUrl`, `thumbnailUrl`, `region`, `sector`, `relatedProjectName`, and `cadence`.
- Developer/system language was replaced with employee-facing copy.
- Location and Market chips render independently.
- Single-button card launch, full-window viewer routing, no inline iframe, structured refusal markers, and edge-bleed contract were preserved.
- Version lockstep was applied to the homepage package/manifests while `HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION` remained unchanged because it pins the standalone Foleon package.

## Viewer target audit

`FoleonViewerTypes.ts` currently defines:

```ts
export type FoleonViewerSource = 'active-record' | 'archive' | 'preview' | 'manual';
```

Preview targets are currently still blocked:

```ts
createPreviewFoleonViewerTarget(config) => {
  source: 'preview',
  viewerUrl: undefined,
  canOpen: false,
  disabledReason: 'preview-only'
}
```

This is the root cause of the blocked preview behavior.

## Provider audit

`FoleonFullWindowViewerProvider.openViewer` currently contains the critical refusal gate:

```ts
if (!target.canOpen) {
  return { opened: false, reason: target.disabledReason ?? 'unknown' };
}
setCurrentTarget(target);
```

This is correct for real disabled targets, but it means preview can never render inside the full-window overlay as long as preview targets remain `canOpen: false`.

## Viewer overlay audit

`FoleonFullWindowViewer.tsx` already has a non-iframe fallback path:

```ts
const showIframe = target.canOpen && target.viewerUrl !== undefined && target.viewerUrl.length > 0;
```

When `showIframe` is false, the component renders a state panel. However, preview targets never reach this component today because the provider blocks them first.

This creates a clean seam for implementation:

- let preview targets open the viewer;
- distinguish preview render mode from iframe render mode;
- render a richer local preview panel inside the overlay.

## Lane layout audit

All three lane layouts share the same pattern:

```ts
const isDisabled = !target.canOpen;
...
if (isDisabled) {
  set data-foleon-article-last-refusal;
  return;
}
viewer.openViewer(target, launchButton);
```

Affected files:

- `ProjectSpotlightReaderLayout.tsx`
- `CompanyPulseReaderLayout.tsx`
- `LeadershipMessageReaderLayout.tsx`

This means the implementation must update the target model first. Once preview targets are `canOpen: true`, the existing card-launch code will naturally call `openViewer`.

## Feasibility finding

Feasible with a bounded additive change:

1. Add explicit viewer render mode / preview capability to `FoleonViewerTarget`.
2. Change `createPreviewFoleonViewerTarget` so preview targets are openable.
3. Update `FoleonFullWindowViewer` to render local preview content for preview targets.
4. Update tests that currently expect preview refusal.
5. Preserve existing refusal behavior for ready targets with missing embed URL / embed disallowed / external-only.

## Recommended model

```ts
export type FoleonViewerRenderMode = 'iframe' | 'preview';

export interface FoleonViewerTarget {
  readonly renderMode?: FoleonViewerRenderMode;
  readonly preview?: FoleonViewerPreviewContent;
}
```

Preview target:

```ts
{
  source: 'preview',
  renderMode: 'preview',
  canOpen: true,
  viewerUrl: undefined,
  disabledReason: undefined,
  preview: {
    title,
    summary,
    lane,
    badge: 'Preview',
    notice: 'This is a preview of the full-window reader experience. Live Foleon content will appear here when configured.'
  }
}
```

Ready target:

```ts
{
  source: 'active-record',
  renderMode: 'iframe',
  canOpen: embedUrl && allowEmbed && !requiresExternalOpen,
  viewerUrl: embedUrl,
  disabledReason: ...
}
```

## Key risks

| Risk | Mitigation |
|---|---|
| Preview is mistaken for live Foleon content. | Add prominent Preview badge, local preview copy, and no iframe. |
| Tests relying on `preview-only` refusal fail. | Update tests to assert preview opens local viewer; preserve refusal tests for true disabled ready targets. |
| `onViewerIframeLoaded` fires for preview. | Ensure preview renderer does not mount `FoleonIframeHost`; iframe telemetry must not fire. |
| Accessibility regression if preview cards remain disabled. | Once preview opens, remove `aria-disabled` from preview cards and use descriptive button text/aria labels. |
| Shared layout drift across lanes. | Use the common target/provider/viewer contract so Project Spotlight, Pulse, and Leadership all get preview opening consistently. |
| Version/package drift. | Bump homepage package/manifests only if repo version authority requires it for runtime-visible source changes. |

## Audit recommendation

Proceed with a focused implementation package named:

```text
Foleon Preview Fallback Full-Window Viewer
```

This should be separate from Project Spotlight PS-03 schema work. It is a shared viewer/preview behavior change across all lane-owned Foleon readers.
