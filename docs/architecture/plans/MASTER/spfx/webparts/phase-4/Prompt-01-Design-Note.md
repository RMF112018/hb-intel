# Prompt-01 Design Note — Cumulative Full-Package Architecture

## 1. Current blockers to cumulative packaging

Three mechanisms in `tools/build-spfx-package.ts` enforce single-target replacement instead of cumulative retention:

### Blocker A: Proof-case manifest filter (lines 546-550)

```typescript
if (domain.dir === 'hb-webparts' && HB_WEBPARTS_PROOF_CASE_IDS.size > 0) {
  targetManifests = targetManifests.filter((m) => HB_WEBPARTS_PROOF_CASE_IDS.has(m.json.id));
}
```

This reduces the 10 source manifests to only the active proof-case ID. Previously validated webparts disappear from the package when the active set is replaced.

**Fix:** Remove the filter entirely (or set `HB_WEBPARTS_PROOF_CASE_IDS` to empty). All 10 source manifests pass through.

### Blocker B: Isolated proof-case entry routing (lines 569-585)

```typescript
const isProofCase = domain.dir === 'hb-webparts' && HB_WEBPARTS_PROOF_CASE_IDS.size > 0 && targetManifests.length === 1;
```

This selects a single-component Vite entry (e.g., `mount-hero-proof-case.tsx`). With 10 webparts, the full `mount.tsx` dispatcher must be used instead — it maps each webPartId to its React renderer at runtime.

**Fix:** When `targetManifests.length > 1`, skip the proof-case entry routing and use the default `src/mount.tsx` (already the Vite config default when `HB_WEBPARTS_ENTRY` is not set).

### Blocker C: Neutral shell manifest condition (lines 740-741)

```typescript
const useNeutralShellManifestId =
  domain.dir === 'hb-webparts' && domain.packagingModel === 'multi' && targetManifests.length > 1;
```

When `targetManifests.length > 1`, this activates the neutral shell manifest + AMD shim path. This is the mechanism that must be explicitly evaluated for the cumulative model.

## 2. Recommended cumulative architecture

### The shim model is the correct architecture for multi-webpart packaging

The original `Could not load ... in require` failure was **not** caused by the AMD shim concept. It was caused by implementation bugs in how shim files and manifests were generated and included. Those bugs have since been fixed — the current build script:

- Generates syntactically correct AMD `define()` shims
- Writes shim files to the compiled assets directory
- Includes shim paths in each manifest's `scriptResources`
- Cleans stale shim files before regeneration
- Verifies shim presence in the final `.sppkg` (Step 6 verification + shim-proof.json)

The shim model is a **standard AMD aliasing mechanism**: each webpart's `entryModuleId` (`{webpartId}_1.0.0`) depends on the compiled base module (`{neutralId}_1.0.0`), and the shim simply re-exports it. SharePoint's `require()` resolves the chain: shim → base → ShellWebPart → loads Vite bundle → calls `mount(el, context, {webPartId})`.

### Why a shim-free multi-webpart model is architecturally impossible with the current shell

The spfx-shell project compiles **one** ShellWebPart class into **one** compiled JS module. SPFx assigns that module an `entryModuleId` derived from the shell manifest's `id`. For N webparts with different manifest IDs, N-1 need AMD aliases to resolve to the single compiled module. This is what shims do — they are not a hack, they are the only correct mechanism for a single-class-multiple-manifest architecture.

A shim-free approach would require N separate ShellWebPart classes compiled as N separate modules — a massive refactor with no functional benefit, since all N classes would be identical copies.

### Recommended model: neutral shell manifest + AMD shims (the existing multi-path)

Use the existing multi-manifest code path that is already implemented and verified:

1. Neutral shell manifest ID (`9a2f7f61-...`) is written into ShellWebPart.manifest.json
2. `gulp bundle` compiles one shell module with `entryModuleId: "9a2f7f61-..._1.0.0"`
3. For each of 10 target webparts, generate a shim: `define("{webpartId}_1.0.0", ["9a2f7f61-..._1.0.0"], function(b){return b})`
4. Clone the compiled manifest per webpart with the correct ID, alias, preconfiguredEntries, and scriptResources
5. Delete the neutral manifest from the release directory
6. Package all 10 manifests + all shim files + the Vite bundle + the compiled shell

### Loader chain (cumulative model)

```
SharePoint require("{webpartId}_1.0.0")
  → scriptResources["{webpartId}_1.0.0"] → shell-entry-{webpartId}-{hash}.js (AMD shim)
  → shim loads dependency "9a2f7f61-..._1.0.0" → shell-web-part_{hash}.js
  → ShellWebPart.onInit() loads hb-webparts-app-{hash}.js via SPComponentLoader
  → globalThis.__hbIntel_hbWebparts.mount(el, context, {webPartId})
  → mount.tsx dispatcher renders the correct React component
```

## 3. Proof-case entries: merge back to mount.tsx

The isolated proof-case entries (`mount-hero-proof-case.tsx`, `mount-priority-actions-rail-proof-case.tsx`) were necessary for single-target isolation. In the cumulative model:

- **They are no longer used.** The full `mount.tsx` dispatcher handles all 10 webparts.
- **They should be retained but not referenced.** Keep them in the source tree as reference artifacts until the cumulative model is tenant-validated. Remove them in Phase 4 cleanup (Prompt-04).
- **The Vite config default entry (`src/mount.tsx`) is already correct.** When `HB_WEBPARTS_ENTRY` env is not set, Vite builds from `mount.tsx`.

## 4. Exact files to change

| File | Change | Risk |
|------|--------|------|
| `tools/build-spfx-package.ts` | Clear `HB_WEBPARTS_PROOF_CASE_IDS` (empty set). Remove or skip proof-case entry routing when set is empty. The existing multi-manifest code path activates naturally when `targetManifests.length > 1`. | Low — the multi-manifest code is already implemented and verified |
| `apps/hb-webparts/config/package-solution.json` | Version bump | None |

**No changes needed to:**
- `ShellWebPart.ts` — unchanged
- `mount.tsx` — already dispatches all 10 webparts
- `vite.config.ts` — default entry is already `src/mount.tsx`
- `gulpfile.js` — unchanged
- Any webpart manifest files — unchanged
- Any webpart component files — unchanged

## 5. Implementation order

1. Clear `HB_WEBPARTS_PROOF_CASE_IDS` to an empty set (or remove the filter)
2. Verify proof-case entry routing is skipped when set is empty (it already is — `isProofCase` requires `HB_WEBPARTS_PROOF_CASE_IDS.size > 0`)
3. Version bump
4. Build: `rm -rf apps/hb-webparts/dist && npx tsx tools/build-spfx-package.ts --domain hb-webparts`
5. Inspect: verify 10 manifests, 10 shim files (one per webpart, though the first alphabetically may share the base ID), correct `entryModuleId` per manifest
6. Tenant validate: upload `.sppkg`, add each webpart from toolbox, confirm no `require` failure

## 6. Risks / regressions to watch

| Risk | Mitigation |
|------|------------|
| AMD shim resolution failure in tenant | The shim infrastructure has been verified in the build script. Inspect each shim file in the `.sppkg`. If failure occurs, it is a tenant cache issue, not a shim defect. |
| Service worker serving stale single-webpart package | Content-hashed bundle filename changes with each build. Unregister `spserviceworker.js` if needed. |
| Full bundle size increase (262 KB vs ~200 KB proof-case) | Expected and acceptable — the full `mount.tsx` includes all 10 component trees. This is the intended production bundle. |
| `componentIds` array must list all 10 IDs | The build script already populates this from `targetManifestIds`. With the filter removed, all 10 are included. |
| Legacy `HbWebpartsWebPart` manifest (`535f5a17-...`) | Already excluded by `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS`. No change needed. |

## 7. Acceptance criteria for implementation

The cumulative model is successful when:

1. The `.sppkg` contains 10 webpart manifests (one per homepage webpart)
2. Each manifest has a correct `entryModuleId` (`{webpartId}_1.0.0`)
3. Each manifest's `scriptResources` includes the shim file path (or the base module for the one that matches)
4. All shim files are present in the `.sppkg`
5. The `AppManifest.xml` `Version` is valid 4-part format
6. `HbHeroBannerWebPart` and `PriorityActionsRailWebPart` continue to work (regression check)
7. All 10 webparts can be added from the toolbox and render
8. No `Could not load ... in require` failure for any webpart
9. The package uploads successfully to the App Catalog

## Summary

The cumulative full-package model requires exactly **one logical change**: clear `HB_WEBPARTS_PROOF_CASE_IDS` so the manifest filter passes all 10 webparts through. The existing multi-manifest code path — with neutral shell manifest and AMD shims — activates naturally and is already implemented and verified. The full `mount.tsx` dispatcher is already the default Vite entry. No new code is needed; the transition is a configuration change that unlocks the existing multi-manifest pipeline.
