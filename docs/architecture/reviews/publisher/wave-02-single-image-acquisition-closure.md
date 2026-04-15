# Publisher Wave-02 — Single-image acquisition closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-15/Prompt-01-Rebuild-single-image-acquisition-surfaces.md`
**Scope:** Hero + secondary image acquisition, `ImageAssetField` primitive, new governed library browser seam.
**Manifest:** hb-publisher Feature 1.0.0.36.

## Before / after interaction summary

**Before (Wave-01):** The hero and secondary image fields led with a large dashed plate whose primary affordance was a single `https://` URL input. Alt text was a peer field below. The empty-state helper copy ("Paste an https:// URL from the tenant image library or an approved CDN. A tenant-safe file picker will land here in a later wave.") explicitly narrated the URL-first posture as provisional. Structurally this was still raw-transport-string entry dressed in an editorial frame.

**After (Wave-02):** The front-door interaction is a governed **Browse library** button that opens a new `AssetLibraryBrowser` modal with a search-first thumbnail grid backed by a tenant-safe `AssetLibrarySearchFn`. Selecting a tile immediately hydrates the preview-first populated asset card, seeds alt text from any curated `suggestedAltText` on the library entry, and persists the same `imageUrl` / `altText` strings the article row already writes. Raw URL editing remains available in two explicitly non-primary places: a new **"Advanced: paste a custom URL"** disclosure in the empty state (accent-rail tile, closed by default), and the existing collapsed **"Asset URL"** footer on the populated state. Replace flow now re-opens the library browser when a search function is wired, so the typical "swap one crop for another" action stays governed. The "future picker" narration has been removed.

When `searchAssets` is **not** wired by the SPFx mount boundary (test harnesses, storybook, legacy hosts), the field falls back to the Wave-01 URL-first acquisition affordance with neutralized framing. The saved contract is identical in either mode.

## Touched files

- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/assetLibrarySource.ts` *(new)* — defines `AssetLookupEntry` + `AssetLibrarySearchFn` contract.
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/AssetLibraryBrowser.tsx` *(new)* — modal asset browser. `role="dialog"` + `aria-modal`, escape-to-close, backdrop click-to-close, debounced remote search with `AbortController` cancellation, `role="listbox"` result grid with `role="option"` buttons, full Arrow/Home/End keyboard navigation, `aria-live` status + result-count announcer, lazy-loaded thumbnails.
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/assetLibraryBrowser.module.css` (+ `.d.ts`) *(new)* — backdrop, dialog, search, status, grid, tile styles. Tokenised via existing publisher token seam.
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/ImageAssetField.tsx` — adds `searchAssets?` prop; rebuilds empty state to lead with **Browse library** when wired; adds "Advanced: paste a custom URL" disclosure; rewires Replace to re-open the browser when governance is available; seeds alt text from library entries' suggestions.
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/imageAssetField.module.css` (+ `.d.ts`) — styles for the Advanced-URL disclosure (accent-rail tile matching the Phase-14 Prompt-07 disclosure family).
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/index.ts` — exports `AssetLibraryBrowser`, `AssetLibrarySearchFn`, `AssetLookupEntry`.
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx` — threads `searchAssets?` onto `HeroPanelProps` and hands it to `ImageAssetField`; helper copy is governed/library-aware when wired.
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/SecondaryImagePanel.tsx` — same thread as Hero; gated under the existing "Show a secondary image" toggle.
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx` — accepts `searchAssets?` as a component-level prop (supplied by the SPFx mount boundary, same pattern as `getGraphToken` and `siteUrl`) and threads it to both hero and secondary panels.

## Validation states exercised

- **Empty (governed)** — Browse library button leads; Advanced-URL disclosure closed.
- **Empty (fallback)** — URL input appears when no `searchAssets` is wired (preserves test + storybook paths and legacy hosts).
- **Selected** — Library commit hydrates the populated asset card with preview + alt/caption/URL-disclosure inline; alt-text seeded from suggested when present.
- **Replaced** — Replace button re-opens the library when wired; keeps alt + caption across swaps.
- **Removed** — Remove clears imageUrl + altText + caption back to the empty state.
- **Invalid URL (advanced edit)** — Same `/^https:\/\/\S+/i` check flips the populated card into the "not an https URL" alert. Unchanged behaviour.
- **Broken preview** — `onError` on the preview image still fires the same danger-tone reassurance alert. Unchanged behaviour.
- **Browser: loading / no-results / error** — Live-region status + `role="alert"` error banner inside the dialog.
- **Browser: keyboard** — Search input focused on open; Arrow keys + Home/End move tile focus; Enter commits; Escape closes; backdrop mouse-down outside the dialog closes.

## Intentionally preserved fallback behaviour

- The URL-first empty-state path still runs when no `searchAssets` function is provided. This is an explicit, bounded concession to the reality that (a) production tenant-library wiring lives at the SPFx mount boundary and is out of scope here, and (b) the HeroPanel / metadataPanel test suites and any storybook consumers do not yet plumb a mock library. The fallback is framing-only — it preserves the Wave-01 preview-first populated state and all existing validation — and is the single reason the `getByLabelText(/Hero image source URL/i)` assertion in `heroPanel.test.tsx` keeps working.
- The collapsed "Asset URL" footer on the populated card is retained so authors can hand-edit a URL on an already-chosen asset without reopening the library. This is clearly a subordinate surface (uppercase, tertiary colour, mono input, closed by default).

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing (heroPanel, metadataPanel, teamPresentationPanel, sectionFocus, media invariants, gallery — all green); 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated to this change.
- Manifest bumped: `config/package-solution.json` 1.0.0.35 → 1.0.0.36.
