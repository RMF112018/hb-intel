# SPPKG Rebuild and Package-Truth Verification — Output

**Phase:** P08-04 — Package-truth verification for Phase 04 (Narrow Image Remediation Package)
**Date:** 2026-04-06
**Status:** Complete — corrected resolver confirmed in rebuilt `.sppkg`

---

## Build Path Used

```
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

Full orchestration pipeline:
1. **Vite build** (`pnpm --filter @hbc/spfx-hb-webparts build`) — 4352 modules → `dist/hb-webparts-app.js` (475.46 kB)
2. **Asset copy** — Vite IIFE bundle + CSS + static assets → `tools/spfx-shell/release/assets/`
3. **Manifest generation** — 11 per-webpart manifests written to `tools/spfx-shell/release/manifests/`
4. **Shell shim generation** — 11 per-webpart shell entry files with patched AMD `define()` names
5. **`gulp bundle --ship`** (Node 18.20.8) — SPFx shell compilation + webpack asset injection
6. **`gulp package-solution --ship`** (Node 18.20.8) — final `.sppkg` archive

Node versions: orchestrator runs on Node 22.14.0; gulp steps executed via Node 18.20.8 (SPFx 1.18 requirement, resolved automatically by the build script).

---

## Artifacts Generated

| Artifact | Path | Size |
|----------|------|------|
| `.sppkg` | `dist/sppkg/hb-webparts.sppkg` | 2954.9 KB |
| Vite IIFE bundle | `apps/hb-webparts/dist/hb-webparts-app.js` | 475.46 KB |
| CSS | `tools/spfx-shell/release/assets/spfx-hb-webparts.css` | 22.50 KB |
| Shell shim entries | 11 files in `tools/spfx-shell/release/assets/` | Per-webpart AMD shims |
| Webpart manifests | 11 files in `tools/spfx-shell/release/manifests/` | Per-webpart JSON manifests |
| Shim proof | `dist/sppkg/hb-webparts-shim-proof.json` | Build integrity metadata |

---

## How Package Truth Was Verified

### 1. Source truth — build verification suite

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | Pass — no type errors |
| `pnpm --filter @hbc/spfx-hb-webparts lint` | Pass — no errors or warnings |
| `pnpm --filter @hbc/spfx-hb-webparts build` | Pass — 4352 modules, 475.46 KB |

### 2. Bundle truth — Vite output inspection

Searched the Vite output (`dist/hb-webparts-app.js`) for `serverRelativeUrl`:
- Found the minified `extractImageSrc()` function (minified as `BP`)
- JSON.parse path confirmed: `JSON.parse(e)` → `serverRelativeUrl` extraction → URL combination
- Both string and object input branches present

### 3. Package truth — `.sppkg` interior inspection

Extracted the Vite bundle from inside the `.sppkg` and confirmed:
- `ClientSideAssets/hb-webparts-app-dd07d833.js` present (475,461 bytes)
- `serverRelativeUrl` string found in the extracted JS — the corrected resolver logic survived packaging
- JSON.parse path intact in the packaged bundle — identical to the Vite output

### 4. Spotlight webpart presence confirmed

| Artifact in `.sppkg` | Present |
|-----------------------|---------|
| `WebPart_8370ab0c-b6df-4db0-82f1-24b54750f508.xml` | Yes |
| `shell-entry-8370ab0c-...-7f56af1f.js` | Yes |

### 5. Manifest seed data intact

The packaged Spotlight manifest contains 4 seed items, all with `image: true`:
- `project-featured` (Palm Beach Medical Campus Expansion)
- `project-secondary-1` (Fort Lauderdale Waterfront Residence)
- `project-secondary-2` (Boca Raton Corporate Campus)
- `project-secondary-3` (Jupiter Inlet Marina Renovation)

Manifest-seeded fallback behavior is preserved for local/demo use.

### 6. No stale artifacts

The orchestrator script performs a clean regeneration of all release assets, manifests, and shell shims before running `gulp bundle --ship`. The previous stale assets (visible as deleted files in git status) were replaced by freshly generated versions with new content hashes.

Build script confirmations:
- `✓ Packaged shim files (11)` — all 11 shell entries regenerated
- `✓ .sppkg structure verified` — archive integrity confirmed
- `✓ Packaged shell asset references hb-webparts-app-dd07d833.js and __hbIntel_hbWebparts` — correct global name

---

## Evidence the Corrected Resolver Survived Bundling

The corrected `extractImageSrc()` logic was found at three levels:

| Level | Evidence |
|-------|----------|
| **Source** | `projectSpotlightListSource.ts:181–208` — JSON.parse → `serverRelativeUrl` extraction |
| **Vite bundle** | `dist/hb-webparts-app.js` — minified `BP` function with `JSON.parse(e)` and `serverRelativeUrl` check |
| **`.sppkg` interior** | `ClientSideAssets/hb-webparts-app-dd07d833.js` — identical minified resolver extracted from archive |

The resolver logic is **identical** at all three levels. No dead code elimination, tree-shaking, or bundler transformation removed or altered the correction.

---

## Anything Still Requiring Tenant Validation

| Item | Why tenant validation is needed |
|------|-------------------------------|
| **SharePoint-hosted image rendering** | Code inspection and bundle verification confirm the resolver is correct, but only tenant runtime can prove that the actual SharePoint list row `PrimaryImage` payload resolves into a visible browser image |
| **CDN asset delivery** | The `.sppkg` includes assets via `includeClientSideAssets: true`, but actual CDN upload and delivery behavior requires tenant deployment |
| **Cross-webpart isolation** | All 11 webpart shims reference the same Vite bundle; tenant runtime confirms no namespace collision in the SPFx workbench |

These items are the subject of Phase 04 Prompt 05 (SharePoint Runtime Proof and Closeout).
