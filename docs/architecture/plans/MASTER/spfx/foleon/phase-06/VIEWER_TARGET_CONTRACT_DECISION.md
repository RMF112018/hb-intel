# Viewer Target Contract Decision

## Decision

Use an explicit viewer render mode.

```ts
export type FoleonViewerRenderMode = 'iframe' | 'preview';
```

Do not infer preview behavior only from `source === 'preview'`, because `source` describes the origin of the target while `renderMode` describes how the full-window viewer should render it.

## Why this decision

The current target contract has these concepts:

- `source`: active-record, archive, preview, manual
- `canOpen`: whether the provider may open a dialog
- `viewerUrl`: URL used by `FoleonIframeHost`
- `disabledReason`: reason for structured refusal

That model works for live Foleon content but does not distinguish:

```text
cannot open because it is invalid
```

from:

```text
can open but should render local preview content
```

The render-mode model creates that separation.

## Proposed type additions

```ts
export type FoleonViewerRenderMode = 'iframe' | 'preview';

export interface FoleonViewerPreviewContent {
  readonly badge: string;
  readonly title: string;
  readonly summary?: string;
  readonly lane: FoleonReaderLayoutKey;
  readonly primaryLabel?: string;
  readonly secondaryLabel?: string;
  readonly notice: string;
  readonly bullets?: readonly string[];
}

export interface FoleonViewerTarget {
  ...
  readonly renderMode?: FoleonViewerRenderMode;
  readonly preview?: FoleonViewerPreviewContent;
}
```

## Target creation rules

### Ready active-record target

```ts
renderMode: 'iframe'
canOpen: disabledReason === undefined
viewerUrl: embedUrl
disabledReason: computed from no-embed-url / embed-not-allowed / requires-external-open
preview: undefined
```

### Preview target

```ts
renderMode: 'preview'
canOpen: true
viewerUrl: undefined
disabledReason: undefined
preview: lane-specific content
```

### Archive target

Leave unchanged unless repo truth shows archive cards use the same viewer contract. If archive can open the full viewer, it should remain `renderMode: 'iframe'` and preserve existing gating.

### Manual target

Default to `renderMode: 'iframe'` unless explicitly created as preview.

## Provider rules

`FoleonFullWindowViewerProvider.openViewer` should remain simple:

```ts
if (!target.canOpen) return refusal;
setCurrentTarget(target);
```

The provider should not know iframe vs preview rendering details.

## Viewer rules

`FoleonFullWindowViewer` decides body rendering:

```ts
if (target.renderMode === 'preview') {
  return <FoleonPreviewViewerPanel target={target} />;
}

if (target.canOpen && target.viewerUrl) {
  return <FoleonIframeHost ... />;
}

return <UnavailableStatePanel ... />;
```

## Why not set `canOpen: true` only?

Setting preview `canOpen: true` without a render mode would open the viewer, but it would reuse the current unavailable state panel. That would technically satisfy “open full window” but would feel like an error dialog rather than a preview reader experience.

## Why not keep `canOpen: false` and force provider to open preview anyway?

That would make `canOpen` unreliable and confuse ready-state disabled behavior. The better contract is:

```text
canOpen means "viewer overlay may open"
renderMode means "viewer overlay renders iframe or local preview"
```

## Why not load a sample Foleon iframe?

Do not do this. It would create false confidence, add origin/config risk, and weaken the distinction between preview and live content.
