# Implementation Plan — Foleon Preview Fallback Full-Window Viewer

## Objective

Make preview article cards open the shared full-window reader overlay with local preview content, while preserving governed iframe behavior for ready Foleon records.

## Scope

Applies to all current lane-owned Foleon reader layouts:

- Project Spotlight
- Company Pulse
- Leadership Message

Does not include:

- SharePoint schema changes
- Foleon API changes
- origin policy changes
- live Foleon sample content
- image/video schema expansion
- Project Spotlight gallery/video PS-03 work

## Recommended implementation waves

### Wave 01 — Confirm repo truth and target contract

1. Inspect current target, provider, viewer, layouts, and tests.
2. Confirm no newer commit has already changed preview behavior.
3. Confirm all preview article cards use `createPreviewFoleonViewerTarget`.
4. Confirm exact tests currently asserting preview refusal.

Output: brief no-code audit or proceed directly to Wave 02 if repo truth matches this package.

### Wave 02 — Add preview render mode and local preview panel

Files likely to change:

```text
packages/foleon-reader/src/readers/FoleonViewerTypes.ts
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewer.module.css
packages/foleon-reader/src/components/__tests__/FoleonFullWindowViewerProvider.test.tsx
```

Implementation:

1. Add `FoleonViewerRenderMode`.
2. Add `FoleonViewerPreviewContent`.
3. Add `renderMode?: FoleonViewerRenderMode` and `preview?: FoleonViewerPreviewContent` to `FoleonViewerTarget`.
4. Update `createReadyFoleonViewerTarget` to set `renderMode: 'iframe'`.
5. Update `createPreviewFoleonViewerTarget` to set:
   - `renderMode: 'preview'`
   - `canOpen: true`
   - no `disabledReason`
   - preview content populated by lane.
6. Add a local `FoleonPreviewViewerPanel` component inside `FoleonFullWindowViewer.tsx` or as a new internal component.
7. Render preview panel before iframe fallback.
8. Ensure preview panel never mounts `FoleonIframeHost`.

### Wave 03 — Update lane card behavior and tests

Files likely to change:

```text
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
```

Implementation:

1. Let preview targets be enabled through `target.canOpen`.
2. Do not special-case preview as disabled.
3. Keep `data-foleon-article-state="preview"` for preview state.
4. Remove `aria-disabled` from preview cards once they are openable.
5. Preserve structured refusal behavior for true disabled ready records.
6. Update visible preview copy where needed:
   - `View preview`
   - `Open preview`
   - `Preview full reader`
7. Preserve single-interactive-control pattern.

### Wave 04 — Validation, package/version, hosted proof

1. Run focused tests.
2. Run package authority tests if runtime package sources changed.
3. Bump homepage package versions only if repo policy requires.
4. Produce closure report and hosted proof checklist.

## Detailed behavior requirements

### Preview card behavior

- Click opens full-window overlay.
- Keyboard activation opens full-window overlay.
- `aria-disabled` is absent.
- No `data-foleon-article-last-refusal` is written on successful preview open.
- `data-foleon-viewer-source="preview"` appears on the viewer overlay.
- No iframe is mounted.
- No iframe telemetry fires.
- Close button and Escape close viewer.
- Focus returns to the launch button.

### Ready enabled behavior

Unchanged:

- Click opens full-window viewer.
- Governed iframe loads through `FoleonIframeHost`.
- Origin policy remains enforced.
- iframe telemetry fires as before.
- Focus management preserved.

### Ready disabled behavior

Unchanged:

- Missing embed URL / embed disallowed / external-open-required remain disabled.
- `aria-disabled` remains.
- visible reason remains.
- `data-foleon-article-last-refusal` is written on click.
- viewer does not open.

## Preview panel content requirements

The preview panel should be obviously preview/local content.

Required elements:

- badge: `Preview`
- lane label:
  - Project Spotlight
  - Company Pulse
  - Leadership Message
- title
- short explanation:
  - `This is a preview of the full-window reader experience. Live Foleon content will appear here when configured.`
- at least one visual placeholder region
- optional sample sections appropriate to lane
- no external links unless they are clearly disabled or marked as unavailable
- no live Foleon iframe

## Lane-specific preview content

### Project Spotlight

Tone: visual project feature.

Suggested content:

- `Project Spotlight`
- `Preview`
- `A visual project feature will appear here once this month's Foleon spotlight is published.`
- placeholder sections:
  - Project photography
  - Video moments
  - Project story
  - Team/context

### Company Pulse

Tone: newsroom digest.

Suggested content:

- `Company Pulse`
- `Preview`
- `A full-window Company Pulse edition preview will appear here while live news content is being configured.`
- placeholder sections:
  - Company news
  - Events
  - Recognition
  - Operations

### Leadership Message

Tone: executive note.

Suggested content:

- `Leadership Message`
- `Preview`
- `A full-window preview of the leadership message reader will appear here until the live edition is published.`
- placeholder sections:
  - Message opening
  - Key priorities
  - Closing note

## CSS requirements

Add scoped viewer CSS only.

Do not introduce:

```css
html, body { overflow-x: hidden; }
```

Suggested classes:

- `.previewPanel`
- `.previewBadge`
- `.previewHero`
- `.previewGrid`
- `.previewCard`
- `.previewNotice`
- `.previewMeta`
- `.previewSkeleton`

The preview panel should fit within the existing viewer body and not break focus trap behavior.

## Accessibility requirements

- Dialog keeps `role="dialog"` and `aria-modal="true"`.
- Dialog heading remains connected via `aria-labelledby`.
- Preview panel content is readable by screen readers.
- Decorative preview visuals use `aria-hidden="true"`.
- Preview card button accessible name describes the preview action.
- Focus close/restore behavior unchanged.
- Escape close unchanged.
- No disabled ARIA on openable preview controls.

## Tests to update/add

### `FoleonViewerTypes` / target tests

- Preview target has `renderMode: 'preview'`.
- Preview target has `canOpen: true`.
- Preview target has no `disabledReason`.
- Ready target has `renderMode: 'iframe'`.
- Ready disabled reasons unchanged.

### Provider tests

Update current preview refusal test:

Old expectation:

```ts
openViewer(previewTarget) => { opened: false, reason: 'preview-only' }
dialog not rendered
```

New expectation:

```ts
openViewer(previewTarget) => { opened: true, target }
dialog rendered
data-foleon-viewer-source="preview"
no iframe rendered
preview panel visible
onViewerOpen called
onViewerIframeLoaded not called
```

Keep disabled ready-target refusal tests unchanged.

### Layout tests

For each lane:

- preview card is not `aria-disabled`;
- preview card opens viewer;
- preview card keeps `data-foleon-article-state="preview"`;
- no last-refusal marker is written on successful preview open;
- ready disabled cards still write last-refusal marker.

### Module integration tests

- Preview fallback opens full-window preview panel through `FoleonReaderModule`.
- Viewer close restores focus.
- Escape closes.
- Sibling lanes remain isolated.

## Validation commands

Run:

```bash
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

If homepage package files or version authority changes:

```bash
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
pnpm --filter @hbc/homepage-launcher check-types
```

If package build is required, use the repo’s SPFx-supported Node version and package authority workflow.

## Versioning guidance

This is runtime-visible behavior in the embedded homepage Foleon reader package. The agent must inspect package authority tests before bumping versions.

Likely affected version files if policy requires homepage bump:

```text
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
```

Do not bump `HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION` unless repo truth proves it pins the changed package being shipped.

## Rollback plan

1. Revert target model changes.
2. Revert preview target `canOpen: true`.
3. Revert preview panel component/CSS.
4. Revert lane/test updates.
5. Restore preview refusal tests.
6. Revert version/package changes.
7. Confirm ready-state iframe viewer still opens.
8. Confirm preview cards return to blocked preview-only behavior.

## Acceptance criteria

The implementation passes when:

- preview cards open the full-window viewer shell;
- preview panel is local React content, not iframe;
- preview is clearly labeled;
- no live Foleon governance is weakened;
- ready Foleon iframe behavior is unchanged;
- true disabled ready states remain blocked with structured refusal;
- tests prove preview open behavior and disabled refusal behavior separately;
- no global overflow suppression is introduced;
- package/version authority is clean.
