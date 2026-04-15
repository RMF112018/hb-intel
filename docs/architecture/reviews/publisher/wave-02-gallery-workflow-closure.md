# Publisher Wave-02 — Gallery workflow closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-15/Prompt-02-Rebuild-gallery-and-supporting-media-workflow.md`
**Scope:** `MediaComposer` flyout, `GalleryPanel`, thread-through from `ArticlePublisher`, reuse of the Wave-02 Prompt-01 asset-library seam.
**Manifest:** hb-publisher Feature 1.0.0.37.

## Before / after interaction summary

**Before:** The gallery composer flyout opened with a raw `https://` URL input as the first field inside the body. The preview plate sat underneath the URL entry. Alt-text assessment, caption guidance, role chooser, feature toggle, and ordering were all well-designed, but the acquisition seam itself was still infrastructural — an author added a gallery or supporting image by typing a transport string.

**After:** When the host wires a governed `AssetLibrarySearchFn`, the composer's **Source** block is rebuilt around a primary **"Browse library"** action (or **"Replace from library"** when editing an existing row) that opens the shared `AssetLibraryBrowser` modal introduced in Prompt-01. Picking an asset hydrates `imageUrl`, seeds `altText` when the library entry carries a `suggestedAltText`, and flips the composer's preview into its loading → ready state. Raw URL editing is demoted into a new **"Advanced: paste a custom URL"** accent-rail disclosure inside the Source block — the URL field is no longer the front-door interaction. When no `searchAssets` is wired (tests, storybook, unplumbed hosts), the composer falls back to the prior URL-first Source field with the "future picker" narration removed.

The "Browse library" / "Replace from library" action also appears whenever the composer is editing an existing row, so the typical "swap this gallery tile for a better crop" flow stays governed.

## Preserved invariants

- **Featured invariant** — `applyFeaturedGalleryInvariant` continues to enforce single-featured semantics across save / unfeature / remove. No change to `mediaInvariants.ts`.
- **Ordering truth** — `restampMediaSortOrder` runs on every save and every removal; `moveMediaRow` still powers the tile-level reorder affordances and `Alt+ArrowLeft` / `Alt+ArrowRight` keyboard reorder.
- **Persistence shape** — `createMediaRowFromDraft` and `mergeMediaRowWithDraft` continue to shape every persisted `PublisherMediaRow` identically. No schema change.
- **Alt-text assessment** — `assessAltText` + `aria-invalid` on the alt textarea, with `altBlocking` continuing to gate save.
- **Caption guidance** — `assessCaption` unchanged.
- **Role chooser** — `gallery` vs `supporting` radio group unchanged; `roleGuidance` copy unchanged.
- **https-only validation** — `isAllowedImageUrl` still fires when a URL is pasted through the Advanced disclosure; the in-body `fieldError` alert unchanged.
- **Preview semantics** — the `.preview` plate retains its Wave-01 dashed-to-solid framing; `onLoad` → ready, `onError` → error alert. The composer `canSave` gate still requires `thumbState !== 'error'`.

## Cross-flow behaviour

- **Cancel mid-composer** — `HbcKudosComposerFlyout` secondary action and its own escape-to-close wiring continue to call `onRequestClose`. The local library browser is dismounted when the composer closes because its `open` state lives inside the composer's lifecycle.
- **Acquisition failure** — the shared `AssetLibraryBrowser` surfaces a `role="alert"` error banner on search failure and keeps the composer open; the author can fall back to the Advanced URL path without losing any alt/caption/role work already drafted.
- **Broken preview** — `thumbState === 'error'` still renders the existing reassurance alert inside the composer and blocks save.

## Touched files

- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx` — accepts `searchAssets?`, conditionally renders governed Source block (Browse/Replace button + Advanced URL disclosure) or legacy URL field, opens `AssetLibraryBrowser`, seeds alt on library select.
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/mediaComposer.module.css` (+ `.d.ts`) — adds `.advancedSource` / `.advancedSourceSummary` for the accent-rail disclosure matching the Phase-14 Prompt-07 family.
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx` — grows a `searchAssets?` prop on `GalleryPanelProps` and threads it straight to `MediaComposer`.
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx` — hands the same `searchAssets` it already threads to Hero / Secondary panels to `GalleryPanel`.

No change to `buildMediaRow.ts`, `mediaInvariants.ts`, `altTextGuidance.ts`, or any test.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing (mediaInvariants, mediaPersistence, buildMediaRow, altTextGuidance, gallery readiness, and every other media-adjacent test suite continues to pass); 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated to this change.
- Manifest bumped: `config/package-solution.json` 1.0.0.36 → 1.0.0.37.
