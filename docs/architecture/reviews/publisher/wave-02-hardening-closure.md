# Publisher Wave-02 — Accessibility, host-fit & hardening closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-15/Prompt-07-Close-accessibility-host-fit-and-hardening-gaps.md`
**Scope:** `ProjectPicker`, `MediaComposer`, `mount.tsx` unknown-webpart fallback, supporting CSS.
**Manifest:** hb-publisher Feature 1.0.0.42.

## What hardened

### 1. Instance-safe DOM IDs across the touched Wave-02 controls

Two seams held constant DOM IDs that would collide if a second instance of the same control mounted in the same page (storybook, dev preview, multi-webpart host rendering, future plumbing):

- `ProjectPicker.tsx` — the listbox id was a module constant `'project-picker-listbox'` consumed by both `<div id=…>` on the listbox and `aria-controls=…` on the combobox input. Now built from `React.useId()` (`project-picker-listbox-${useId()}`) so every instance gets a stable, collision-free id that survives re-renders and server/client hydration.
- `MediaComposer.tsx` — the alt-text and caption guidance-describedby ids (`media-composer-alt-guidance`, `media-composer-caption-guidance`) were also module constants. Both are now `useId()`-backed (`altGuidanceId`, `captionGuidanceId`) and threaded through the corresponding `<span id={…}>` / `aria-describedby={…}` pairs. The flyout is typically one-at-a-time but the defensive fix removes a risk class rather than a known bug.

Other touched Wave-02 surfaces already use `useId()` (`ExceptionalNotice` details summary, `ImageAssetField`, `AssetLibraryBrowser`, `EditorialSpine`, `EditorToolbar`) or static ids that are genuinely singleton-scoped (`save-readiness-block` — only rendered once in the rail tree). No further constant-id offenders remained in scope.

### 2. Token-disciplined mount fallback

`mount.tsx` rendered the "unknown webPartId" alert with raw hex (`#d13438`, `#fdf3f4`, `#242424`), raw pixel values, and inline-style attribute plumbing, bypassing every downstream token and CSS-module contract.

Replaced with a new `mount.module.css` + `.d.ts` pair exposing three token-driven classes (`.unknownWebpartFallback`, `.unknownWebpartHeadline`, `.unknownWebpartDetail`) that consume `--hb-status-danger-*`, `--hb-space-md`, `--hb-radius-lg`, and `--hb-font-mono` with safe var() fallbacks for hosts that have not yet injected the token seam. `mount.tsx` now renders a two-paragraph `<section role="alert" aria-live="assertive">` with a strong headline and a mono-typed `webPartId` detail line. The detail paragraph uses `word-break: break-word` so an unusually long webPartId does not overflow the host container. A side-effect import of `sharedChrome/tokens.module.css` was added at the top of `mount.tsx` so the `:root` token seam is guaranteed to be injected before the fallback renders — matching the same pattern `PublisherButton.tsx` already uses to bootstrap the token surface.

### 3. Final aria / keyboard / focus sweep

Walked every Wave-02 touched surface and confirmed the following already-landed hardening survived:

- `AssetLibraryBrowser` — `role="dialog"` + `aria-modal="true"` + `onKeyDown` Escape close + backdrop click close + role="listbox" grid + role="option" tiles with explicit `aria-selected` + Arrow/Home/End + auto-focus on search input on open.
- `ProjectPicker` — WAI editable-combobox: `role="combobox"`, `aria-autocomplete="list"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (now instance-safe), `aria-activedescendant` + Arrow/Home/End/Enter/Escape + `scrollIntoView` of the active option (JSDOM-safe-guarded) + `role="alert"` error branch + `aria-live="polite"` result-count announcer.
- `ImageAssetField` — every interactive control is a real `<button>` / `<input>` / `<textarea>` / `<summary>` with tokenised focus rings; accent-rail disclosures for the Advanced URL + the populated-state Asset URL footer use the Phase-14 Prompt-07 tile family.
- `MediaComposer` — `aria-live="polite"` alt-text guidance, `aria-invalid` on blocking alt, `role="radiogroup"` for the role chooser, `role="alert"` on the URL scheme error and the broken-preview notice.
- `EditorialSpine` + `editorToolbar` — Arrow/Home/End keyboard navigation, `aria-current="location"`, roving-tabindex on the toolbar, composed `aria-label`s that pair control label with keyboard hint or status.
- `SaveStateChip` — `role="status"` + `aria-live="polite"` + `data-phase` for automated testing.
- `TrustBridge` — `role="status"` + `aria-live="polite"` + `aria-label="Preview blocking issues"` / `"Preview warnings"` branching.

## Preserved invariants

- No behavioural change to the touched controls beyond id plumbing and the mount fallback surface. All 614 tests continue to pass; the 6 pre-existing `publisherEndToEnd.test.ts` adapter failures are unrelated.
- No lifecycle, validation, persistence, or orchestration code was touched.
- No new dependency introduced.
- Test fixtures for `ProjectPicker` / `MetadataPanel` / `HeroPanel` / `MediaComposer` continue to pass — the tests match on role + label, not on literal DOM ids.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing, 6 pre-existing adapter failures unrelated.
- Manifest bumped: `config/package-solution.json` 1.0.0.41 → 1.0.0.42.
