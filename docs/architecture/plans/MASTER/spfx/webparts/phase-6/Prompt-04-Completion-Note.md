# Prompt-04 Completion Note — Audit, Defect Resolution, and Package Rebuild

## Status

**Root cause identified and fixed.** Per-webpart shell entry modules now carry correct AMD `define()` names.
**Package truth: confirmed.** Rebuilt cumulative package passes all automated inspection checks.
**Tenant validation: requires manual operator action.**

---

## Root cause

### Primary defect: AMD `define()` module registration name mismatch

The compiled `shell-web-part_33c64341ed81ee506c2a.js` registers its AMD module as:

```
define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)
```

This is the **neutral shell manifest ID**, not any real webpart ID.

Each webpart's packaged manifest sets a different `entryModuleId` (e.g., `39762a4d-..._1.0.0` for HbHeroBanner) and maps it in `scriptResources` to the same shared shell JS file. SPFx's AMD loader fetches the file, evaluates it, and looks for a module registered under the expected `entryModuleId`. The file registers under the neutral ID instead — module not found — runtime crash.

### Why proof cases worked

Single-target proof-case builds set `useNeutralShellManifestId = false`, compiling the shell with the **real webpart ID**. The internal `define()` name matched the manifest's `entryModuleId`. No mismatch.

### Why P6-02's "shim-free direct-map" fix did not resolve the problem

The P6-02 comment claimed: *"SPFx resolves scriptResources by key, not by the file's internal define() name."* This was inferred from the proof-case results but never independently validated. The proof cases compiled with matching IDs, so they only proved the direct-map approach works **when the IDs match**. The cumulative build uses a neutral ID, creating a mismatch that P6-02 did not address.

### Error classification

| Category | Examples | Causal? |
|----------|----------|---------|
| AMD module resolution failure | `Could not load {id}_1.0.0 in require` | **Primary** |
| SharePoint render shell crash | `Something went wrong` / `ERROR: [object Object]` | Consequence |
| OneCollector telemetry blocked | `ERR_BLOCKED_BY_CLIENT` | No — ad-blocker noise |
| Fluent Card warnings | Console warnings | No — cosmetic |

---

## Resolution

### Approach: per-webpart shell copies with patched `define()` name

After `gulp bundle --ship` produces the single `shell-web-part_<hash>.js` with the neutral ID, the build now creates 10 copies — one per webpart — each with the `define("9a2f7f61-..._1.0.0"` string-replaced to `define("{webpartId}_1.0.0"`. Each manifest points to its own dedicated copy.

### Files changed

| File | Change |
|------|--------|
| `tools/build-spfx-package.ts` | Added `generatePerWebpartShellCopy` helper; replaced manifest cloning loop; added deploy copy step; updated verification to validate define() name correctness |
| `apps/hb-webparts/config/package-solution.json` | Version `1.0.0.29` → `1.0.0.30` |

### What was not changed

- `ShellWebPart.ts` — shell code is correct
- `gulpfile.js` — webpack config unchanged
- Source webpart manifests — IDs and metadata correct
- Vite config / `mount.tsx` — application code unaffected

---

## Build result

| Step | Result |
|------|--------|
| Vite build (full `mount.tsx`) | pass — 262.49 kB |
| Content hash | `ab43ba83` |
| Runtime smoke test | pass |
| gulp bundle --ship | pass — 10 manifests compiled |
| Per-webpart shell copy generation | pass — 10 copies with patched define() names |
| gulp package-solution --ship | pass — 10 manifests, 10 shell entries, 12 client assets |
| Package size | 112.2 KB |
| AppManifest Version | `1.0.0.30` (valid 4-part) |

## Packaged webpart matrix (all 10 — programmatically verified)

| # | Webpart | Manifest ID | entryModuleId | Entry file | define() name matches? |
|---|---------|-------------|---------------|------------|----------------------|
| 1 | CompanyPulse | `0b53f651-...` | `0b53f651-..._1.0.0` | `shell-entry-0b53f651-...-8ec8f26b.js` | YES |
| 2 | SmartSearchWayfinding | `11d72b36-...` | `11d72b36-..._1.0.0` | `shell-entry-11d72b36-...-6381f9c1.js` | YES |
| 3 | PeopleCulture | `27ac10f4-...` | `27ac10f4-..._1.0.0` | `shell-entry-27ac10f4-...-2061f177.js` | YES |
| 4 | **HbHeroBanner** | `39762a4d-...` | `39762a4d-..._1.0.0` | `shell-entry-39762a4d-...-b6ec98cd.js` | YES |
| 5 | PersonalizedWelcomeHeader | `46bfde64-...` | `46bfde64-..._1.0.0` | `shell-entry-46bfde64-...-ac33d91b.js` | YES |
| 6 | ProjectPortfolioSpotlight | `8370ab0c-...` | `8370ab0c-..._1.0.0` | `shell-entry-8370ab0c-...-531d7722.js` | YES |
| 7 | SafetyFieldExcellence | `89ca5ff3-...` | `89ca5ff3-..._1.0.0` | `shell-entry-89ca5ff3-...-80b782ab.js` | YES |
| 8 | **PriorityActionsRail** | `b3f07190-...` | `b3f07190-..._1.0.0` | `shell-entry-b3f07190-...-b8bb69a5.js` | YES |
| 9 | ToolLauncherWorkHub | `cb7060f5-...` | `cb7060f5-..._1.0.0` | `shell-entry-cb7060f5-...-0098c89b.js` | YES |
| 10 | LeadershipMessage | `e8fa8a84-...` | `e8fa8a84-..._1.0.0` | `shell-entry-e8fa8a84-...-f1aecf87.js` | YES |

10/10 webparts confirmed. Each manifest's `entryModuleId` now points to a per-webpart shell entry file whose internal `define()` name matches exactly.

## Asset list

| Asset | Size | Count |
|-------|------|-------|
| `hb-webparts-app-ab43ba83.js` (Vite bundle, all 10 components) | 262,488 bytes | 1 |
| `shell-web-part_33c64341ed81ee506c2a.js` (compiled shell, neutral — not directly referenced) | 3,128 bytes | 1 |
| `shell-entry-{uuid}-{hash8}.js` (per-webpart shell copies) | ~3,128 bytes each | 10 |
| WebPart XML definitions | — | 10 |
| **Total client-side assets** | | **12** |
| **Total package files** | | **35** |

## Loader chain (corrected)

```
SharePoint loads manifest for webpart {id}
  → entryModuleId = "{id}_1.0.0"
  → scriptResources["{id}_1.0.0"] → shell-entry-{id}-{hash}.js
  → file evaluates: define("{id}_1.0.0", [...], fn) — NAME MATCHES
  → ShellWebPart.onInit() resolves CDN base URL
  → SPComponentLoader.loadScript("hb-webparts-app-ab43ba83.js")
  → globalThis.__hbIntel_hbWebparts.mount(el, context, { webPartId: id })
  → mount.tsx dispatcher renders correct React component
```

## Verification improvements

The `verifySppkg` function now validates:
- Each per-webpart shell entry file contains `define("{targetEntryModuleId}"`
- No per-webpart shell entry file still contains `define("{neutralId}"` (patching failure detection)
- `hb-webparts-shim-proof.json` populated with 10 entries (was previously always empty)

---

## Tenant validation protocol

### Regression checks (first priority)

1. HbHeroBanner (`39762a4d-...`) — must render
2. PriorityActionsRail (`b3f07190-...`) — must render

### Cumulative validation (second)

3. CompanyPulse (`0b53f651-...`)
4. LeadershipMessage (`e8fa8a84-...`)
5. PeopleCulture (`27ac10f4-...`)
6. ToolLauncherWorkHub (`cb7060f5-...`)
7. ProjectPortfolioSpotlight (`8370ab0c-...`)
8. PersonalizedWelcomeHeader (`46bfde64-...`)
9. SafetyFieldExcellence (`89ca5ff3-...`)
10. SmartSearchWayfinding (`11d72b36-...`)

### Network checks

- 10 `shell-entry-*.js` requests — expect 200 OK
- `hb-webparts-app-ab43ba83.js` — expect 200 OK
- No `shell-web-part_*.js` direct requests (only loaded indirectly via per-webpart copies)

### Console checks

- No `Could not load ... in require` errors
- `[HB-Intel ShellWebPart] Module resolved` appears for each webpart
- `[HB-Intel ShellWebPart] bundleUrl:` shows correct CDN path
