# Phase 18 Wave 01 — Prompt 03 Closure

**Status:** Closed
**Closure date:** 2026-04-16
**Manifest bump:** `hb-publisher` `1.0.0.62` → `1.0.0.63`
**Scope:** Eliminate redundant loader-asset duplication in the standalone
Publisher package without regressing the multi-manifest `hb-webparts`
packaging path.

## Root cause

The packager always calls `generatePerWebpartShellCopy()` per target
manifest. For multi-manifest domains (`hb-webparts`) this is essential —
the neutral shell compiles as `define("<neutral-shell-id>_1.0.0")` and
each webpart needs its own copy with the define() patched to
`define("<webpart-id>_1.0.0")`. For single-manifest domains
(`hb-publisher`) the shell is compiled directly against the single
target manifest, so the webpack output already carries
`define("<target-id>_1.0.0")` and the "patched" copy is byte-identical
to the source. Both `shell-web-part_<webpack-hash>.js` and
`shell-entry-<id>-<content-hash>.js` were entering the `.sppkg`, with
identical bytes.

## What changed

### `tools/build-spfx-package.ts`

1. `generatePerWebpartShellCopy()` now distinguishes the identity case
   (`neutralModuleId === targetModuleId`) and **renames** the webpack
   output into the versioned `shell-entry-<id>-<hash>.js` slot rather
   than writing a byte-identical copy alongside it. The multi-manifest
   path is unchanged: `define()` is still patched per target, and each
   target still gets a distinct per-webpart copy.
2. `verifySppkg`'s "compiled shell JS" regex gained a
   `shell-entry-<id>-<hash>.js` branch so the single-manifest identity
   inventory still satisfies the "some compiled shell JS is present"
   invariant.
3. `inspectPackagedShellAsset`'s archive scan gained the same
   `shell-entry-<id>-<hash>.js` branch so the packaged shell asset
   inspection (bundle name, global name, backend mode) runs against the
   renamed asset.

### Assets kept intact for webparts

- Per-webpart `shell-entry-<webpart-id>-<hash>.js` generation (one per
  target manifest).
- `shell-web-part_<webpack-hash>.js` still enters the webparts `.sppkg`
  because gulp's package-solution step scans `release/assets/` and that
  file carries the neutral define that is architecturally distinct from
  the per-webpart shims. Prompt 03's scope calls it out as *multi-
  manifest behavior to preserve*; scope did not ask for removal here.

## Before/after asset inventory — `dist/sppkg/hb-publisher.sppkg`

### Before (1.0.0.62)
```
 1,093,899  ClientSideAssets/hb-publisher-app-8e540b4e.js
    11,750  ClientSideAssets/shell-entry-1a6f8b2c-…-3fd81f9c.js
    11,750  ClientSideAssets/shell-web-part_cdf0f287…ea9c6d0.js   ← duplicate
    87,237  ClientSideAssets/spfx-hb-publisher-d3f31daa.css
```
`shell-entry-<id>-<hash>.js` and `shell-web-part_<webpack-hash>.js`
byte-identical (SHA-256: `3fd81f9c5b0bd7734dcf958f23b2bc7508f5998b66f94db0bb86999ca4473dd9`).

### After (1.0.0.63)
```
 1,093,899  ClientSideAssets/hb-publisher-app-8e540b4e.js
    11,750  ClientSideAssets/shell-entry-1a6f8b2c-…-3fd81f9c.js   ← was shell-web-part; now lives here
    87,237  ClientSideAssets/spfx-hb-publisher-d3f31daa.css
```
Single loader asset. `.sppkg` total dropped from 359.4 KB → 355.1 KB.

## Webparts inventory comparison (regression gate)

Before and after: identical counts, identical bytes — `hb-webparts.sppkg`
= 3180.3 KB both runs, with 17 per-webpart `shell-entry-<id>-<hash>.js`
files (each with patched per-webpart define) plus the untouched
`shell-web-part_<webpack-hash>.js`.

## Validation performed

1. **Publisher packaging** — `npx tsx tools/build-spfx-package.ts --domain hb-publisher`
   - ✓ Freshness gate: removed stale dist
   - ✓ Fresh Vite build
   - ✓ Freshness evidence captured (sha256 `8e540b4ee18e…`)
   - ✓ .sppkg structure verified
   - ✓ Packaged bundle freshness verified (source SHA matches packaged SHA)
   - ✓ Packaged shell asset references `hb-publisher-app-8e540b4e.js` and `__hbIntel_hbPublisher`
   - ✓ Shim proof + package-truth proof written
2. **Publisher package-truth proof** — all four checks pass:
   - `structuralValidity`: true (bundle + shim asset present)
   - `freshness`: true (bundle SHA + shim hash prefix match)
   - `sourcePackageSemanticAlignment`: true (manifest semantic alignment,
     `entryModuleId` = `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10_1.0.0`,
     `scriptResourcePath` = `shell-entry-1a6f8b2c-…-3fd81f9c.js`)
   - `liveRuntimeProof`: true (packaged bundle contains the Article
     Publisher webpart ID marker, manifest linkage verified)
3. **Webparts regression gate** — `npx tsx tools/build-spfx-package.ts --domain hb-webparts`
   - `hb-webparts.sppkg` = 3180.3 KB (unchanged)
   - All four package-truth checks pass; 17 per-webpart shell-entry files
     present in the archive as before; `runtimeMarkerId` =
     `9e2dd84a-…f43a94abf9fd` (PnP Ops).
4. **Loader wiring**: the packaged ComponentManifest's
   `loaderConfig.scriptResources["1a6f8b2c-…_1.0.0"].path` =
   `shell-entry-1a6f8b2c-…-3fd81f9c.js`, which is now the renamed
   webpack output that contains `define("1a6f8b2c-…_1.0.0")` —
   end-to-end the manifest, filename, AMD define name, and the packaged
   bytes all agree. SPFx's AMD loader will resolve the entry module to
   the correct asset exactly as before (same file content, different
   filename).

## Out of scope (handled by later prompts in this wave)

- Hosted instantiation / live load proof in SharePoint — Prompt 04.
