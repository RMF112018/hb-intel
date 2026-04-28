# PROMPT PFV-02 — Implement Preview Viewer Target and Local Preview Renderer

You are working in the `RMF112018/hb-intel` repository.

## Objective

Make Foleon preview targets openable in the full-window viewer by adding an explicit preview render mode and local preview renderer.

The target behavior:

```text
Preview article card click -> full-window viewer opens -> local preview panel renders -> no iframe.
```

## Critical instruction

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependency behavior, or drift after changes.

## Files likely to change

```text
packages/foleon-reader/src/readers/FoleonViewerTypes.ts
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewer.module.css
packages/foleon-reader/src/components/__tests__/FoleonFullWindowViewerProvider.test.tsx
```

## Implementation requirements

### 1. Add render mode

In `FoleonViewerTypes.ts`, add:

```ts
export type FoleonViewerRenderMode = 'iframe' | 'preview';
```

Add preview content type:

```ts
export interface FoleonViewerPreviewContent {
  readonly badge: string;
  readonly title: string;
  readonly summary?: string;
  readonly lane: FoleonReaderLayoutKey;
  readonly notice: string;
  readonly primaryLabel?: string;
  readonly secondaryLabel?: string;
  readonly bullets?: readonly string[];
}
```

Add to `FoleonViewerTarget`:

```ts
readonly renderMode?: FoleonViewerRenderMode;
readonly preview?: FoleonViewerPreviewContent;
```

### 2. Update ready target

Set ready targets to iframe mode:

```ts
renderMode: 'iframe'
```

Preserve current gating:

```ts
canOpen: disabledReason === undefined
disabledReason: computeReadyDisabledReason(...)
```

### 3. Update preview target

Change `createPreviewFoleonViewerTarget(config)` to return:

```ts
source: 'preview'
renderMode: 'preview'
canOpen: true
disabledReason: undefined
viewerUrl: undefined
preview: <lane-specific preview content>
```

Do not remove `preview-only` from the disabled reason union yet, because historical disabled markers/tests/docs may still reference it and rollback compatibility is useful.

### 4. Render preview in full-window viewer

In `FoleonFullWindowViewer.tsx`:

```tsx
if (target.renderMode === 'preview') {
  return <FoleonPreviewViewerPanel target={target} />;
}
```

Place this before the iframe branch.

Preview renderer requirements:

- no `FoleonIframeHost`;
- no iframe;
- clear `Preview` badge;
- lane-specific title and summary;
- local visual placeholder/preview sections;
- clear notice that live Foleon content will appear when configured;
- accessible markup;
- decorative visuals marked `aria-hidden`.

### 5. Preserve provider behavior

Do not special-case preview in the provider.

The provider should continue:

```ts
if (!target.canOpen) return refusal;
setCurrentTarget(target);
```

Preview opens because target.canOpen is now true.

## CSS requirements

Add scoped classes to `FoleonFullWindowViewer.module.css`.

Do not introduce global overflow suppression.

Suggested classes:

```text
previewPanel
previewBadge
previewHero
previewContent
previewGrid
previewCard
previewNotice
previewSkeleton
```

## Test updates

In `FoleonFullWindowViewerProvider.test.tsx`:

Replace old preview-refusal test with:

- preview target opens;
- dialog renders;
- `data-foleon-viewer-source="preview"` exists;
- preview badge/content visible;
- no iframe rendered;
- `onViewerOpen` fires;
- iframe telemetry callbacks do not fire.

Keep disabled ready target refusal tests unchanged.

## Validation

Run:

```bash
pnpm --filter @hbc/foleon-reader test -- FoleonFullWindowViewerProvider
pnpm --filter @hbc/foleon-reader check-types
```

If exact filtering syntax differs, use repo-valid equivalent and report command used.

## Do not

- Do not modify lane layouts in this prompt unless required to make tests compile.
- Do not change origin policy.
- Do not change FoleonIframeHost.
- Do not change backend or schemas.
- Do not bump package versions in this prompt unless repo policy demands it immediately.
