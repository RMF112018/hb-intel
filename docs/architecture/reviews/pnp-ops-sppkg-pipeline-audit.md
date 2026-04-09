# PnpOps sppkg Pipeline Audit

**Date:** 2026-04-09
**Auditor:** Claude (automated pipeline audit, Prompt-05 of phase-01 PnP plan)
**Solution version audited:** 1.0.0.121

---

## Executive Summary

PnpOps (component ID `9e2dd84a-a121-4fb3-a964-f43a94abf9fd`) is fully wired into the `hb-webparts` SPFx packaging pipeline and is confirmed present in the freshly generated `hb-webparts.sppkg`. No pipeline gap was found at any layer. This audit ran a clean Vite build from scratch, executed the full packaging orchestration, and directly inspected the resulting `.sppkg` artifact.

---

## Repo-Truth Findings

| Area | Finding |
|------|---------|
| Source directory | `apps/hb-webparts/src/webparts/pnp/` — 9 files: `PnpOps.tsx`, `PnpOpsWebPart.manifest.json`, `index.ts`, `pnpOpsClient.ts`, `pnpOpsActionCatalog.ts`, `pnpOpsValidation.ts`, 3 test files |
| `mount.tsx` import | Line 21: `import { PnpOps } from './webparts/pnp/PnpOps.js'` |
| `mount.tsx` registration | Lines 83–84: `'9e2dd84a-a121-4fb3-a964-f43a94abf9fd'` → `createElement(PnpOps, { config, identity, getApiToken })` |
| Manifest discovery | `build-spfx-package.ts` walks `apps/hb-webparts/src/**/*.manifest.json` — PnpOps manifest is discovered by this walk |
| Exclusion list | `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS` does **not** include the PnpOps component ID |
| Proof-case filter | `HB_WEBPARTS_PROOF_CASE_IDS` is an empty `Set` — no filter applied, all webparts included |
| Release manifest | `tools/spfx-shell/release/manifests/9e2dd84a-a121-4fb3-a964-f43a94abf9fd.manifest.json` present and correctly structured |
| shim-proof.json (pre-build) | `manifestId: "9e2dd84a-a121-4fb3-a964-f43a94abf9fd"` was already present from prior build at 19:13 |

### Version note

The source manifest (`PnpOpsWebPart.manifest.json`) carries `version: "0.0.3.0"` — the HB Intel semantic tracking version. The build pipeline generates release manifests with `version: "1.0.0"` (consistent with every other hb-webparts webpart). The functional fields — component ID, `loaderConfig`, `entryModuleId` — are correct and unaffected by this difference.

### TypeScript state note

Running `tsc --noEmit` against `apps/hb-webparts` fails with 9 type errors in Kudos-related files (`peopleCultureSubmissionSource.ts`, `useKudosComposer.ts`) introduced by the Phase-14 Kudos data model landing at commit `2e82595c`. These errors are unrelated to PnpOps. Vite's build (which uses esbuild for transpilation) completes successfully and produces a valid bundle. The TypeScript errors must be resolved separately as part of the Kudos Phase-14 work.

---

## Pipeline Gap Found

**None.** PnpOps was fully wired at all pipeline stages prior to this audit:

- Source files present in the correct path ✓
- Manifest discoverable by the filesystem walk ✓
- Component registered in `mount.tsx` ✓
- Not excluded by any exclusion list or scope filter ✓
- Release manifest present in `tools/spfx-shell/release/manifests/` ✓

---

## Files Changed

No wiring changes were required. This audit produced only:

- A freshly generated `dist/sppkg/hb-webparts.sppkg` (new bundle hash `a31364b9`, new PnpOps shim hash `985ceb9f`)
- This documentation file

---

## Build / Package Commands Run

```bash
# Step 1: Remove stale Vite output
rm -rf apps/hb-webparts/dist

# Step 2: Fresh Vite build (esbuild transpilation; tsc skipped due to pre-existing Kudos TS errors)
cd apps/hb-webparts && npx vite build

# Step 3: Full SPFx packaging orchestration (hb-webparts domain only)
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

Build output summary:
- 15 manifests discovered (including `9e2dd84a-a121-4fb3-a964-f43a94abf9fd`)
- Vite bundle: `hb-webparts-app-a31364b9.js` (738 KB)
- PnpOps shim: `shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-985ceb9f.js`
- Final package: `dist/sppkg/hb-webparts.sppkg` (3047.9 KB)

---

## Proof: PnpOps in the Final .sppkg

### Artifact freshness

```
stat dist/sppkg/hb-webparts.sppkg
→ "Apr  9 19:25:22 2026"  (modification time of this build run)
```

Previous build at 19:13 had bundle hash `32e23d9e` / shim hash `29b56915`.
This build has bundle hash `a31364b9` / shim hash `985ceb9f`. Artifact is provably fresh.

### PnpOps entries in .sppkg (grep proof)

```
unzip -l dist/sppkg/hb-webparts.sppkg | grep 9e2dd84a
     2310  04-09-2026 23:25   1f447e99-a2c7-43e5-83d8-d2ed78ed1a96/WebPart_9e2dd84a-a121-4fb3-a964-f43a94abf9fd.xml
     3902  04-09-2026 23:25   ClientSideAssets/shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-985ceb9f.js
```

Both entries dated `04-09-2026 23:25` — matching this build run.

### WebPart XML (extracted from .sppkg)

```
Id="9e2dd84a-a121-4fb3-a964-f43a94abf9fd"          ✓
Name="PnP Operations"                                ✓
alias: "PnpOpsWebPart"                               ✓
entryModuleId: "9e2dd84a-a121-4fb3-a964-f43a94abf9fd_1.0.0"  ✓
hiddenFromToolbox: true                              ✓
path: "shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-985ceb9f.js"  ✓
```

### AppManifest.xml version

```
Version="1.0.0.121"
```

Matches `apps/hb-webparts/config/package-solution.json`. Package is not stale.

### shim-proof.json (post-build)

```json
{
  "manifestId": "9e2dd84a-a121-4fb3-a964-f43a94abf9fd",
  "entryModuleId": "9e2dd84a-a121-4fb3-a964-f43a94abf9fd_1.0.0",
  "shimFileName": "shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-985ceb9f.js",
  "shimFileHash": "985ceb9f",
  "baseModuleId": "9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"
}
```

---

## Remaining Risks / Follow-up Actions

1. **SharePoint tenant upload and smoke check is recommended.** The `.sppkg` has been verified at the artifact level. A tenant admin should upload and deploy the package to a test or staging site collection, confirm the `hb-webparts` solution deploys cleanly, and verify the PnP Operations webpart appears in the webpart gallery (note: `hiddenFromToolbox: true` — it will not show in the default toolbox but is discoverable via the full gallery).

2. **Backend configuration required at runtime.** PnpOps requires the `backendUrl` and `backendAudience` webpart properties to be set via the webpart property pane before any live PnP extraction actions will succeed. Mock mode (`mockMode: true`) is available for UI-only testing without a live backend.

3. **TypeScript errors in Kudos area must be resolved.** The full `npm run build` (`tsc --noEmit && vite build`) currently fails with 9 type errors in `peopleCultureSubmissionSource.ts` and `useKudosComposer.ts`. These are unrelated to PnpOps but block a clean `npm run build` run. The Vite bundle itself builds cleanly. Resolution should be tracked under the Phase-14 Kudos work.

4. **Source manifest version (0.0.3.0) vs release manifest version (1.0.0).** The `version` field discrepancy is expected pipeline behavior. All 15 hb-webparts manifests follow the same pattern. No action required unless the release manifest version needs to align with the HB Intel semantic tracking version for external tooling.
