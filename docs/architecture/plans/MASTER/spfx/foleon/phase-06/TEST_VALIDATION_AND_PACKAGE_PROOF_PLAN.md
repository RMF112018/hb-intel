# Test, Validation, Package Proof, and Hosted Proof Plan

## Objective

Define the proof required before considering the Foleon preview full-window viewer implementation complete.

## Source validation checklist

Confirm in source:

- `createPreviewFoleonViewerTarget` returns `canOpen: true`.
- Preview targets carry `renderMode: 'preview'`.
- Ready targets carry `renderMode: 'iframe'` or default to iframe.
- `FoleonFullWindowViewer` renders preview content without `FoleonIframeHost`.
- `FoleonFullWindowViewer` still renders `FoleonIframeHost` for ready iframe targets.
- Provider refusal behavior remains for `canOpen: false`.
- Layouts use `target.canOpen` rather than hard-blocking `viewModel.state === 'preview'`.
- Preview cards no longer have `aria-disabled`.
- Disabled ready-state cards still have `aria-disabled` and refusal markers.

## Unit / integration test checklist

### Provider

- `openViewer(previewTarget)` opens dialog.
- Preview dialog contains `data-foleon-viewer-source="preview"`.
- Preview dialog contains preview badge.
- Preview dialog contains no iframe.
- `onViewerOpen` fires.
- `onViewerIframeLoaded` and `onViewerIframeError` do not fire.
- Close restores focus.
- Escape closes.

### Ready iframe

- Ready enabled target opens iframe as before.
- FoleonIframeHost still receives `target.viewerUrl`.
- iframe title remains descriptive.
- origin policy tests unchanged.

### Disabled ready-state

- Missing embed URL refuses.
- Embed disallowed refuses.
- External-open-required refuses.
- Dialog does not open.
- refusal marker is observable.

### Lane layouts

- Project Spotlight preview opens preview panel.
- Company Pulse preview opens preview panel.
- Leadership Message preview opens preview panel.
- Each lane still preserves a single interactive control inside the article card.
- `data-foleon-article-state="preview"` remains for preview state.
- Sibling lane markers remain isolated.

## Static CSS proof

- `FoleonFullWindowViewer.module.css` does not introduce global `overflow-x: hidden`.
- `FoleonReaderLayouts.module.css` does not introduce global `overflow-x: hidden`.
- Preview panel CSS is scoped to viewer module.

## Commands

```bash
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

Conditional homepage/package validation:

```bash
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
pnpm --filter @hbc/homepage-launcher check-types
```

## Hosted proof checklist

After deployment:

1. Open hosted SharePoint homepage.
2. Force/observe preview state for Project Spotlight.
3. Click Project Spotlight preview card.
4. Confirm full-window overlay opens.
5. Confirm overlay is clearly labeled Preview.
6. Confirm no iframe is rendered for preview.
7. Confirm Close button works.
8. Confirm Escape closes.
9. Confirm focus returns to card.
10. Repeat for Company Pulse preview.
11. Repeat for Leadership Message preview.
12. Configure/observe ready record.
13. Confirm ready record opens governed Foleon iframe.
14. Confirm true disabled ready record remains blocked with visible reason.
15. Confirm no horizontal overflow at desktop/tablet/mobile.

## Closure report required fields

```text
Summary:
Files changed:
Target contract changes:
Preview behavior:
Ready iframe behavior:
Disabled/refusal behavior:
Accessibility proof:
Validation:
Version/package proof:
Hosted proof status:
Risks:
Commit:
```
