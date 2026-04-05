# Phase 07 Runtime Integrity Guide

What must be true after deployment for valid homepage and shell-extension runtime behavior.

## Lane A runtime integrity conditions

### Mount/dispatch contract

- `globalThis.__hbIntel_hbWebparts` must exist after IIFE bundle loads
- `mount(el, spfxContext, config)` must accept the SPFx loader contract
- `unmount()` must clean up the React root
- `WEBPART_RENDERERS` must map all 10 production manifest IDs to React components
- Unrecognized `webPartId` must fall back to `ReferenceHomepageComposition` (dev preview only — not expected in production)

### Asset integrity

- `hb-webparts-app-{hash}.js` — content-hashed IIFE bundle containing all 10 webparts
- `spfx-hb-webparts.css` — CSS module styles for interactive states
- 10 `shell-entry-{uuid}-{hash}.js` files — each with `define("{webpartId}_1.0.0", ...)` matching its manifest's `entryModuleId`
- 1 `shell-web-part_{hash}.js` — compiled SPFx shell (shared base, not directly referenced by manifests)

### Per-webpart runtime expectations

- Each webpart renders independently inside its own `HbcCard` wrapper
- Each webpart handles `isLoading`, empty/noData, empty/invalid states gracefully
- Operational webparts (Project Spotlight, Safety Excellence) handle stale data with visual indicators
- Smart Search handles `noResults` state
- Welcome Header always renders (greeting is system-generated)
- Import discipline: only `@hbc/ui-kit/homepage`, `/theme`, `/icons` used at runtime

### What must NOT happen

- No `@hbc/ui-kit` root module loaded (would bloat bundle with unused components)
- No `@hbc/ui-kit/app-shell` module loaded (wrong entry point for homepage)
- No shell-adjacent behavior (nav bars, sidebars, footers) rendered by Lane A
- No `document.getElementById` or `querySelector` DOM manipulation outside React rendering

---

## Lane B runtime integrity conditions

### Mount/unmount contract

- `globalThis.__hbIntel_hbShellExtension` must exist after IIFE bundle loads
- `mountTop(el)` renders top placeholder content; `mountTop(null)` is a safe no-op
- `mountBottom(el)` renders bottom placeholder content; `mountBottom(null)` is a safe no-op
- `unmountTop()` and `unmountBottom()` clean up their respective React roots

### Asset integrity

- `hb-shell-extension-app-{hash}.js` — content-hashed IIFE bundle
- `spfx-hb-shell-extension.css` — CSS module styles for ribbon, alerts, footer

### Placeholder behavior

- Top placeholder: renders ribbon nav + alert band when configured; empty container when unconfigured
- Bottom placeholder: renders footer nav + support band when configured; empty container when unconfigured
- Top and bottom are independent — one can render while the other is unavailable
- Dismissible alerts maintain session-local dismiss state
- All interactive elements have hover, focus-visible, and reduced-motion behavior

### What must NOT happen

- No `@hbc/ui-kit` root module loaded
- No `@hbc/ui-kit/homepage` module loaded (wrong entry point for shell-extension)
- No page-canvas content rendered by Lane B
- No suite-bar, app-bar, or nav DOM manipulation
- No crash or error when a placeholder is unavailable

---

## Failure signatures and triage

### Missing global mount API

**Symptom:** `[HB-Intel ShellWebPart] Module resolution failed` in console, `ERROR: [object Object]` on page.
**Cause:** IIFE bundle did not execute or `globalThis.__hbIntel_*` was not published.
**Triage:** Check network tab for 200 OK on the bundle URL. Check for JS errors before the mount call. Verify `SPComponentLoader.loadScript` completed.

### AMD define() name mismatch

**Symptom:** `Could not load {uuid}_1.0.0 in require` in console.
**Cause:** Per-webpart shell entry file's internal `define()` name doesn't match the manifest's `entryModuleId`.
**Triage:** Inspect the `.sppkg` — extract the shell entry file and verify it starts with `define("{webpartId}_1.0.0"`. Check `hb-webparts-shim-proof.json` for the expected mapping. Rebuild with `--domain hb-webparts`.

### Broad import regression

**Symptom:** JS bundle size suddenly jumps >50 KB. ECharts, TanStack Table, or other heavy dependencies appear in the bundle.
**Cause:** A source file imported from `@hbc/ui-kit` root instead of `@hbc/ui-kit/homepage`.
**Triage:** Run `pnpm run lint` — the `no-restricted-imports` rule should catch it. Run `importDiscipline.test.ts`. Search source for `from '@hbc/ui-kit'` (without subpath).

### CSS omission or duplication

**Symptom:** Interactive states (hover, focus) don't work on deployed page. Or styles appear doubled.
**Cause:** CSS module file not included in `.sppkg`, or loaded twice from different paths.
**Triage:** Check the `.sppkg` for the CSS file. Verify the Vite build emits it to `dist/`. Check the `tools/build-spfx-package.ts` asset copy step.

### Placeholder availability mismatch

**Symptom:** Top or bottom placeholder content doesn't appear on a page where it's expected.
**Cause:** SharePoint page type doesn't support the placeholder region, or the Application Customizer isn't activated.
**Triage:** Verify the extension is deployed via App Catalog. Check `this.context.placeholderProvider.tryCreateContent()` returns a valid DOM element. Check console for `[HB-Intel ShellExtension] ... placeholder not available — skipping.`

### Proof-case entry confusion

**Symptom:** Only one webpart renders in the cumulative package; others show "Something went wrong."
**Cause:** The build was accidentally run in proof-case mode (single-webpart entry) instead of cumulative mode.
**Triage:** Check `HB_WEBPARTS_PROOF_CASE_IDS` in `tools/build-spfx-package.ts` — it should be empty for cumulative builds. Verify the Vite `HB_WEBPARTS_ENTRY` env var was not set.
