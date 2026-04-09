# People & Culture Split Initiation — Packaging Pipeline Proof

**Phase**: Phase-14 Prompt-02 — Packaging Pipeline Validation and
Stale-Artifact Prevention
**Date**: 2026-04-09
**Preceding notes**:
- `docs/architecture/reviews/people-culture-split-initiation-repo-truth.md` (Prompt-00)
- `docs/architecture/reviews/people-culture-split-initiation-structure.md` (Prompt-01)

**Intent**: Prove that the three-webpart structural split landed in
Prompt-01 (`85f559d6`) is wired cleanly through the `hb-webparts`
packaging pipeline, that the rebuilt `hb-webparts.sppkg` contains
exactly the expected 13 webpart registrations, and that no stale or
orphan artifacts leak into the packaged output.

---

## 1. Build command and output

**Drift heal (pre-build)**:
```
git restore tools/spfx-shell/release
```
This restored the committed Prompt-01 release artifacts that had been
transiently deleted during the initial Prompt-02 approach, so the
orchestrator ran against a normal committed state.

**Authoritative build command**:
```
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

**Run time**: 2026-04-09 15:30:57 (local)
**Result**: `✅ All 1 domain(s) packaged successfully`

**Package outputs**:

| Path | Size | SHA-256 |
| ---- | ---- | ------- |
| `tools/spfx-shell/sharepoint/solution/hb-webparts.sppkg` | 3,075,957 bytes (~3003.9 KB) | `d970736849c6710cec2ac89cd1c39884afd3fd64dacb818497d3ec8e2d147a0f` |
| `dist/sppkg/hb-webparts.sppkg` | 3,075,957 bytes | `d970736849c6710cec2ac89cd1c39884afd3fd64dacb818497d3ec8e2d147a0f` |

Both files are byte-identical (same SHA-256) because `build-spfx-package.ts`
copies the gulp output to `dist/sppkg/` verbatim after verification.

**Supporting proof artifact**:
`dist/sppkg/hb-webparts-shim-proof.json` (regenerated in this run;
referenced below).

## 2. Expected GUID set (13 webparts)

The 13 eligible webpart manifests currently registered in
`apps/hb-webparts/src/webparts/**/*.manifest.json`:

| # | GUID | Alias | Title | Role |
| --- | ---- | ----- | ----- | ---- |
| 1 | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | CompanyPulseWebPart | Company Pulse | existing |
| 2 | `11d72b36-a92f-4e2d-9918-75df2cb0d11e` | SmartSearchWayfindingWebPart | Smart Search Wayfinding | existing |
| 3 | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` | PeopleCultureWebPart | People and Culture | **legacy compat (Prompt-01)** |
| 4 | `28acd6a7-2582-4d8a-86d4-b52bfbeb375c` | HbSignatureHeroWebPart | HB Signature Hero | existing |
| 5 | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | HbHeroBannerWebPart | HB Hero Banner | existing |
| 6 | `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f` | PersonalizedWelcomeHeaderWebPart | Personalized Welcome Header | existing |
| 7 | `8370ab0c-b6df-4db0-82f1-24b54750f508` | ProjectPortfolioSpotlightWebPart | Project Portfolio Spotlight | existing |
| 8 | `89ca5ff3-21f4-4b23-a953-4b7306ea1029` | SafetyFieldExcellenceWebPart | Safety & Field Excellence | existing |
| 9 | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | PriorityActionsRailWebPart | Priority Actions Rail | existing |
| 10 | `cb7060f5-b852-4600-b912-a5f6f7221ce2` | ToolLauncherWorkHubWebPart | Tool Launcher Work Hub | existing |
| 11 | `e39d9662-34c4-43e6-9425-5770f62da626` | PeopleCulturePublicWebPart | People and Culture | **new public (Prompt-01)** |
| 12 | `e8fa8a84-a48a-41d2-85a6-b7c7df70aeca` | LeadershipMessageWebPart | Leadership Message | existing |
| 13 | `f14e59a3-4d6b-43b2-952e-ba02dea11dad` | HbKudosWebPart | HB Kudos | **new HB Kudos (Prompt-01)** |

Plus one **deliberately excluded** legacy source manifest that is NOT
packaged:

| GUID | Reason |
| ---- | ------ |
| `535f5a17-fc49-40ea-ac16-5d68895884f7` | `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS` in `tools/build-spfx-package.ts:72-74` (legacy `HbWebpartsWebPart`). Source manifest exists at `apps/hb-webparts/src/webparts/hbWebparts/HbWebpartsWebPart.manifest.json` but the walker filters it. |

## 3. Five-point alignment check

Cross-referenced the expected GUID set across five authoritative
sources. All five sets are **identical** (13 GUIDs each) after the
build.

| # | Source | Count | Method |
| --- | ------ | ----- | ------ |
| A | Source manifests under `apps/hb-webparts/src/webparts/**/*.manifest.json` (eligible, i.e. not in `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS`) | 13 | `grep -rh '"id"' | sort -u`, minus the 1 excluded GUID |
| B | `apps/hb-webparts/src/mount.tsx` `WEBPART_RENDERERS` keys | 13 | `grep -oE "'[0-9a-f-]{36}'"` |
| C | `tools/spfx-shell/release/manifests/*.manifest.json` filenames (orchestrator output) | 13 | `ls` + basename strip |
| D | `tools/spfx-shell/config/package-solution.json` `features[0].componentIds` (auto-populated by orchestrator at package time) | 13 | `jq '.solution.features[0].componentIds'` |
| E | `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96/WebPart_*.xml` entries inside the packaged `hb-webparts.sppkg` | 13 | `unzip -l | grep WebPart_` |

Proof of equality:

```
$ diff <(ids_from_source) <(ids_from_mount) <(ids_from_release_manifests) <(ids_from_componentIds) <(ids_from_sppkg_webparts)
# no output — all five sets are identical
```

(Command paraphrased; the raw GUID extractions are captured in §2 of
this note.)

## 4. sppkg archive inspection

Full `unzip -l` inventory of `hb-webparts.sppkg` (43 files, 3,675,956
bytes uncompressed):

**Feature + solution metadata**
- `AppManifest.xml` — `Version="1.0.0.114"`, `ProductID="39b8f2ea-59bd-45b7-b4ec-b590b316833b"`, `IsClientSideSolution="true"`
- `[Content_Types].xml`
- `_rels/AppManifest.xml.rels`
- `_rels/.rels`

**Feature definition**
- `feature_1f447e99-a2c7-43e5-83d8-d2ed78ed1a96.xml` — `Version="1.0.0.114"`
- `feature_1f447e99-a2c7-43e5-83d8-d2ed78ed1a96.xml.config.xml`
- `_rels/feature_1f447e99-a2c7-43e5-83d8-d2ed78ed1a96.xml.rels` — **14 Relationship entries**: 1 partconfiguration + 13 feature-elementmanifest rels, one per WebPart

**WebPart element manifests (13 files, all under `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96/`)**
- `WebPart_0b53f651-fd92-4f7f-a9da-f7797017f5eb.xml` (CompanyPulse)
- `WebPart_11d72b36-a92f-4e2d-9918-75df2cb0d11e.xml` (SmartSearchWayfinding)
- `WebPart_27ac10f4-4054-4dd2-bd53-3b4ef4379ab4.xml` (PeopleCulture — legacy compat)
- `WebPart_28acd6a7-2582-4d8a-86d4-b52bfbeb375c.xml` (HbSignatureHero)
- `WebPart_39762a4d-c7fd-44a6-a11e-4f8de9f5778d.xml` (HbHeroBanner)
- `WebPart_46bfde64-f0cb-4f62-9f6b-a466f8fadc1f.xml` (PersonalizedWelcomeHeader)
- `WebPart_8370ab0c-b6df-4db0-82f1-24b54750f508.xml` (ProjectPortfolioSpotlight)
- `WebPart_89ca5ff3-21f4-4b23-a953-4b7306ea1029.xml` (SafetyFieldExcellence)
- `WebPart_b3f07190-79cf-437d-a1d6-ecbf3f77e616.xml` (PriorityActionsRail)
- `WebPart_cb7060f5-b852-4600-b912-a5f6f7221ce2.xml` (ToolLauncherWorkHub)
- `WebPart_e39d9662-34c4-43e6-9425-5770f62da626.xml` (**PeopleCulturePublic — new Prompt-01**)
- `WebPart_e8fa8a84-a48a-41d2-85a6-b7c7df70aeca.xml` (LeadershipMessage)
- `WebPart_f14e59a3-4d6b-43b2-952e-ba02dea11dad.xml` (**HbKudos — new Prompt-01**)

**Client-side assets (17 files)**
- `ClientSideAssets.xml` + `.rels` + `.config.xml`
- `ClientSideAssets/banner_home_7.png` (2,862,677 bytes)
- `ClientSideAssets/hb-webparts-app-5d3282da.js` (587,702 bytes) — main vite bundle
- `ClientSideAssets/shell-web-part_236a24bb456ac72a6aea.js` — shared shell bundle
- `ClientSideAssets/shell-entry-{guid}-{hash}.js` × 13 — one per webpart GUID, each 3,902 bytes
- `ClientSideAssets/spfx-hb-webparts.css` (109,796 bytes)

**No `ClientSideInstance.xml`** — this is a webpart domain, not an
extension domain. Element manifests for extensions are correctly
absent. (`build-spfx-package.ts:929-933` only writes `ClientSideInstance.xml`
for `isExtension` domains.)

### Spot check: new webparts carry the expected manifest payload

`WebPart_f14e59a3-4d6b-43b2-952e-ba02dea11dad.xml` (HB Kudos) contains
`ClientSideComponent Name="HB Kudos" Id="f14e59a3-…"` with an embedded
`ComponentManifest` JSON declaring:
- `alias: "HbKudosWebPart"`
- `componentType: "WebPart"`
- `version: "1.0.0"` (normalized by SPFx packaging; source manifest is
  `"0.0.1.0"`, which is the expected SPFx gulp behavior — solution version
  `1.0.0.114` is the user-facing tenant-app-catalog version)
- `manifestVersion: 2`
- `supportedHosts: ["SharePointWebPart"]`
- `supportsThemeVariants: false`
- `supportsFullBleed: true` (inherited from base bundle defaults)
- preconfiguredEntries with title "HB Kudos", description from the
  source manifest verbatim, `hiddenFromToolbox: true`
- loaderConfig referencing
  `shell-entry-f14e59a3-4d6b-43b2-952e-ba02dea11dad-16bd308c.js` as the
  entry module and base modules `sp-loader 1.18.0`,
  `sp-webpart-base 1.18.0`, `sp-property-pane 1.18.0`.

`WebPart_e39d9662-34c4-43e6-9425-5770f62da626.xml` (People and Culture
Public) contains `ClientSideComponent Name="People and Culture"
Id="e39d9662-…"` with the same shape — alias
`PeopleCulturePublicWebPart`, description from source manifest verbatim
(including the mention of the legacy compatibility GUID),
entry `shell-entry-e39d9662-34c4-43e6-9425-5770f62da626-0571b5c0.js`.

## 5. Shim proof (`hb-webparts-shim-proof.json`)

`dist/sppkg/hb-webparts-shim-proof.json` was regenerated by this build
and enumerates:

- `baseModuleId: "9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"` (neutral
  shared shell module identity, per
  `HB_WEBPARTS_NEUTRAL_SHELL_MANIFEST_ID`)
- `emittedLocalShimFiles` — 13 entries, one `shell-entry-{guid}-{hash}.js`
  per webpart GUID, matching the packaged ClientSideAssets list exactly
- `packagedShimMappings` — 13 entries, each mapping a `manifestId` to
  its `entryModuleId`, `shimFileName`, `shimFileHash`, and
  `baseModuleId`. Entries for both new GUIDs are present:
  ```
  { "manifestId": "e39d9662-34c4-43e6-9425-5770f62da626",
    "entryModuleId": "e39d9662-34c4-43e6-9425-5770f62da626_1.0.0",
    "shimFileName": "shell-entry-e39d9662-34c4-43e6-9425-5770f62da626-0571b5c0.js",
    "shimFileHash": "0571b5c0",
    "baseModuleId": "9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0" }
  { "manifestId": "f14e59a3-4d6b-43b2-952e-ba02dea11dad",
    "entryModuleId": "f14e59a3-4d6b-43b2-952e-ba02dea11dad_1.0.0",
    "shimFileName": "shell-entry-f14e59a3-4d6b-43b2-952e-ba02dea11dad-16bd308c.js",
    "shimFileHash": "16bd308c",
    "baseModuleId": "9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0" }
  ```

The orchestrator log line
`✓ Packaged shim files (13): shell-entry-0b53f651-…, …, shell-entry-f14e59a3-4d6b-43b2-952e-ba02dea11dad-16bd308c.js`
enumerates the same 13 shim files in a single line.

## 6. Stale / orphan registration checks

All four stale-artifact checks required by Prompt-02 §6 pass:

| # | Check | Result |
| --- | ---- | ------ |
| 1 | No `WebPart_{guid}.xml` in the sppkg for a GUID that is NOT in the eligible source-manifest set | PASS (13 in, 13 out) |
| 2 | No `shell-entry-{guid}-*.js` shim in `ClientSideAssets/` for a GUID not in the eligible source-manifest set | PASS (13 shims, all match expected GUIDs) |
| 3 | The excluded legacy GUID `535f5a17-fc49-40ea-ac16-5d68895884f7` does NOT appear anywhere in `hb-webparts.sppkg`, `tools/spfx-shell/release/manifests/`, or `tools/spfx-shell/release/assets/` | PASS (0 matches in all three) |
| 4 | The `componentIds` list in the packaged feature is identical to the source-manifest-walker output (no manual drift, no orphan GUID) | PASS (13 = 13) |

Additional stale-prevention confidence from the orchestrator's own
built-in guard: `tools/build-spfx-package.ts:1105-1109` scans
`tools/spfx-shell/release/assets/` and removes any stale
`shell-entry-{guid}(?:-{hash})?.js` file before rewriting the fresh
per-webpart shim files. This was executed during this run with no stale
deletions reported (the post-Prompt-01 committed state already matches
the current rebuild inputs).

## 7. mount.tsx ↔ runtime alignment

Every `WEBPART_RENDERERS` key in `apps/hb-webparts/src/mount.tsx` maps
to a real imported React component and a corresponding source manifest.
After Prompt-01:

| GUID | mount.tsx line | Imported component | Source manifest |
| ---- | -------------- | ------------------ | --------------- |
| `46bfde64-…` | 30 | `PersonalizedWelcomeHeader` | `personalizedWelcomeHeader/...manifest.json` |
| `39762a4d-…` | 31 | `HbHeroBanner` | `hbHeroBanner/...manifest.json` |
| `b3f07190-…` | 32 | `PriorityActionsRail` | `priorityActionsRail/...manifest.json` |
| `cb7060f5-…` | 33 | `ToolLauncherWorkHub` | `toolLauncherWorkHub/...manifest.json` |
| `0b53f651-…` | 34 | `CompanyPulse` | `companyPulse/...manifest.json` |
| `e8fa8a84-…` | 35 | `LeadershipMessage` | `leadershipMessage/...manifest.json` |
| `27ac10f4-…` | 36 (legacy compat) | `PeopleCultureMerged` | `peopleCulture/...manifest.json` |
| `e39d9662-…` | 38 (new public) | `PeopleCulturePublic` | `peopleCulturePublic/...manifest.json` |
| `f14e59a3-…` | 40 (new HB Kudos) | `HbKudos` | `hbKudos/...manifest.json` |
| `8370ab0c-…` | 41 | `ProjectPortfolioSpotlight` | `projectPortfolioSpotlight/...manifest.json` |
| `89ca5ff3-…` | 42 | `SafetyFieldExcellence` | `safetyFieldExcellence/...manifest.json` |
| `11d72b36-…` | 43 | `SmartSearchWayfinding` | `smartSearchWayfinding/...manifest.json` |
| `28acd6a7-…` | 44 | `HbSignatureHero` | `hbSignatureHero/...manifest.json` |

Every packaged `WebPart_*.xml` has a corresponding `mount.tsx` entry.
Every `mount.tsx` entry has a corresponding packaged `WebPart_*.xml`.
No orphans in either direction.

## 8. Mismatches found

**None.** Every check in §3, §4, §5, §6, §7 passes. No fix was required
before claiming completion.

## 9. Version state

- `apps/hb-webparts/config/package-solution.json` — `1.0.0.114`
  (unchanged from Prompt-01; no version bump in Prompt-02 because no
  runtime code changed).
- `tools/spfx-shell/config/package-solution.json` — regenerated by the
  orchestrator at `1.0.0.114`, featuring all 13 `componentIds`.
- Individual webpart manifest versions (source) — unchanged; the
  packaged `ComponentManifest.version` is SPFx-normalized to `1.0.0`
  as expected.
- Solution `AppManifest.xml Version="1.0.0.114"` ✓

## 10. Files touched in Prompt-02 (drift-free)

Expected diff after `git restore` + rebuild + this note:

- **Modified**: `tools/spfx-shell/config/package-solution.json` — only
  if the orchestrator reordered the `componentIds` list. In this run
  it remained stable, so the file may show as unchanged.
- **Modified**: `tools/spfx-shell/release/manifests/*.manifest.json` —
  only if per-webpart manifest shim content changed. In this run it
  remained stable.
- **Modified**: `tools/spfx-shell/release/assets/*.js` and
  `shell-entry-*.js` — only if underlying bundle content changed. In
  this run it remained stable.
- **New**: `docs/architecture/reviews/people-culture-split-initiation-packaging-proof.md`
  (this file).
- **Not committed**: `dist/sppkg/*` — gitignored.
- **Not committed**: `tools/spfx-shell/sharepoint/solution/hb-webparts.sppkg`
  — inspection artifact, gitignored via `tools/spfx-shell/.gitignore`
  (`sharepoint/`).

## 11. Completion statement

The structural split from Prompt-01 is fully wired into the
`hb-webparts` packaging pipeline. The produced `hb-webparts.sppkg`
contains exactly 13 webpart registrations matching the source manifest
inventory, the mount runtime registration, the orchestrator-written
shell manifests, and the orchestrator-written componentIds list —
with both the new `PeopleCulturePublic` (`e39d9662-…`) and `HbKudos`
(`f14e59a3-…`) seams packaged and the legacy `PeopleCultureMerged`
compatibility seam (`27ac10f4-…`) preserved intact.

No stale artifacts were introduced. No orphan registrations exist.
The excluded legacy `HbWebpartsWebPart`
(`535f5a17-fc49-40ea-ac16-5d68895884f7`) is correctly filtered out of
the packaged output in every location.

Prompt-02 is complete.
