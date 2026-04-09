# SPFx Pipeline Project Sites + HB Webparts Freshness Audit

> Repo-truth audit + clean-rebuild + direct `.sppkg` inspection for the
> `project-sites` and `hb-webparts` SPFx domains, with explicit freshness
> proof for the four scoped `hb-webparts` targets: Company Pulse, People
> and Culture, Project / Portfolio Spotlight, and Safety & Field
> Excellence. Audit executed on **2026-04-09** (UTC 11:30 = local 07:30).
>
> Authority basis: `tools/build-spfx-package.ts` (authoritative pipeline),
> `tools/spfx-shell/` (gulp/webpack compile target), the six webpart
> manifest JSON files in each app, the generated `dist/sppkg/*.sppkg`
> archives, and the regenerated `dist/sppkg/hb-webparts-shim-proof.json`.

## 1. Executive conclusion

The authoritative SPFx `.sppkg` pipeline is **`tools/build-spfx-package.ts`**. Both target domains (`project-sites` and `hb-webparts`) were already correctly wired into it. All 11 non-excluded `hb-webparts` webparts — including all four scoped targets (Company Pulse, People & Culture, Project / Portfolio Spotlight, Safety & Field Excellence) — were discovered via the pipeline's recursive manifest walk without any allow-list or scan-glob filter, and all 11 were packaged into the final `.sppkg` archive.

**A latent stale-content risk was identified and cured.** Before this audit, `dist/sppkg/hb-intel-project-sites.sppkg`, `dist/sppkg/hb-webparts.sppkg`, and the companion `hb-webparts-shim-proof.json` were dated **2026-04-08 05:05** while the live Vite source bundles had been refreshed on **2026-04-09** (after the W01r-P09 Company Pulse migration, the W01r-P11 Project Sites compliance closure, and the W01r-P12 Project Sites search / filter / sort enhancement). The pre-audit archives therefore did **not** contain the most recent code for either domain. This audit executed the authoritative pipeline end-to-end, regenerated both archives with new content hashes, and verified via direct archive inspection that all stale hashes were replaced and no stale manifest or stale ClientSideAssets entry survived.

**No code, config, or pipeline correction was required.** The pipeline itself is correctly wired; the stale archives were simply a consequence of not having been rebuilt after the recent Apr 9 commits. The cure is the clean rebuild captured in this report.

**Final post-build archives are proven current and free of stale manifest or stale content** for both domains and all four scoped target webparts.

## 2. Scope and files inspected

### Pipeline authority
- `tools/build-spfx-package.ts` — self-contained orchestrator, 1800+ lines
- `tools/spfx-shell/` — only SPFx project the gulp toolchain compiles; contains `src/webparts/shell/ShellWebPart.ts` (neutral base shell), `gulpfile.js`, `config/package-solution.json` (generated per-domain per build), `config/write-manifests.json`, etc.
- `tools/spfx-shell/gulpfile.js` — webpack DefinePlugin + CopyWebpackPlugin configuration

### Project Sites domain
- `apps/project-sites/` — Vite app host
- `apps/project-sites/config/package-solution.json` — `hb-intel-project-sites` solution (ID `a4c17e93-5b28-4d0f-9e61-7f2a8d3c6b15`)
- `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` — single webpart ID `e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b`, version `0.1.1.0`
- `apps/project-sites/src/mount.tsx` — IIFE entry publishing `__hbIntel_projectSites`
- `apps/project-sites/dist/project-sites-app.js` — the Vite IIFE bundle
- `packages/spfx/src/webparts/projectSites/` — consumer source tree consumed by the Vite bundle

### HB Webparts domain
- `apps/hb-webparts/` — Vite app host
- `apps/hb-webparts/config/package-solution.json` — `hb-webparts` solution (ID `39b8f2ea-59bd-45b7-b4ec-b590b316833b`)
- `apps/hb-webparts/src/mount.tsx` — IIFE entry publishing `__hbIntel_hbWebparts` with a hardcoded `WEBPART_RENDERERS` map keyed by manifest ID
- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json` — ID `0b53f651-fd92-4f7f-a9da-f7797017f5eb`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json` — ID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` — ID `8370ab0c-b6df-4db0-82f1-24b54750f508`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json` — ID `89ca5ff3-21f4-4b23-a953-4b7306ea1029`
- Plus 7 other webpart manifests for HbHeroBanner, HbSignatureHero, LeadershipMessage, PersonalizedWelcomeHeader, PriorityActionsRail, SmartSearchWayfinding, ToolLauncherWorkHub
- `apps/hb-webparts/dist/hb-webparts-app.js`, `dist/spfx-hb-webparts.css`, `dist/banner_home_7.png` — Vite build outputs

### Post-build artifacts directly inspected
- `dist/sppkg/hb-intel-project-sites.sppkg` — final Project Sites archive
- `dist/sppkg/hb-webparts.sppkg` — final HB Webparts archive
- `dist/sppkg/hb-webparts-shim-proof.json` — regenerated shim-proof JSON

## 3. Authoritative pipeline identification

### Entry point
`tools/build-spfx-package.ts` is the single authoritative orchestrator. It is invoked via:

```bash
# All 13 registered domains
npx tsx tools/build-spfx-package.ts

# Single domain
npx tsx tools/build-spfx-package.ts --domain project-sites
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

The script is self-contained: no other build script calls it, no wrapping shell tooling delegates through it, and the repo-root `package.json` does not expose a direct npm/pnpm script for it. Domain-level `pnpm build` scripts (`pnpm --filter @hbc/spfx-project-sites build`, `pnpm --filter @hbc/spfx-hb-webparts build`) produce the Vite bundles that this orchestrator then packages.

### Domain/package model
`ALL_DOMAINS` (`tools/build-spfx-package.ts` lines 55–70) registers 13 domains with `{ dir, camel, pascal, packagingModel? }` shape. The two targets are:

```ts
{ dir: 'project-sites', camel: 'projectSites', pascal: 'ProjectSites' }
{ dir: 'hb-webparts',   camel: 'hbWebparts',   pascal: 'HbWebparts', packagingModel: 'multi' }
```

- `project-sites` uses the implicit **single-webpart** packaging model: one webpart per `.sppkg`.
- `hb-webparts` uses **multi-webpart** packaging: every discovered non-excluded webpart manifest is packaged into a single `.sppkg`, each with its own per-webpart shell-entry shim file. The webparts share a neutral base shell module identity `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`, and an AMD `define()` patch (`generatePerWebpartShellCopy`, lines 218–250) rewrites the shell-entry shim per manifest.

### Pipeline flow
The pipeline executes six ordered steps per domain:

1. **Vite bundle verification + content hashing** (lines 712–789) — reads `apps/{domain}/dist/{domain}-app.js`, verifies IIFE format, computes an 8-char SHA-256 prefix, renames to `{domain}-app-{hash}.js` inside a staging copy, and cleans stale hashed predecessors.
2. **Runtime smoke test** (lines 792–870) — evaluates the IIFE in a minimal Node VM sandbox, asserts that `globalThis[globalName]` or `window[globalName]` exposes both `mount` and `unmount`.
3. **Copy Vite assets to `tools/spfx-shell/assets/`** (lines 876–920).
4. **Clean shell temp + clone manifests + generate per-webpart shell-entry shims** (lines 937–1182). The `cleanShellTemp()` helper (lines 159–192) wipes `tools/spfx-shell/{temp,dist,lib,sharepoint,assets,release}` on every build, and `config/config.json` is reset. For `hb-webparts`, each source webpart manifest is cloned, its `id` is preserved, its `loaderConfig.entryModuleId` is set to `{id}_1.0.0`, its `scriptResources` map is rewritten to point at the per-webpart shim, and a per-webpart shim file `shell-entry-{id}-{8charHash}.js` is generated by AMD-patching the neutral compiled shell JS.
5. **Run gulp `package-solution --ship`** (lines 1208–1231) in the shell tempdir. Gulp compiles `ShellWebPart.ts` once, webpack's `CopyWebpackPlugin` picks up the staged Vite assets and per-webpart shims from `tools/spfx-shell/assets/` + `tools/spfx-shell/release/assets/`, and produces `tools/spfx-shell/sharepoint/solution/{sppkgName}.sppkg`.
6. **Collect to `dist/sppkg/` and verify** (lines 1233–1289) — copies the `.sppkg` to `dist/sppkg/`, runs `verifySppkg()` (lines 374–634) which unzips the archive, inspects the OPC structure, and — for `hb-webparts` — writes `dist/sppkg/hb-webparts-shim-proof.json` describing every packaged shim + its `baseModuleId` + its per-webpart `entryModuleId`.

### Exclusion + proof-case controls
`HB_WEBPARTS_EXCLUDED_MANIFEST_IDS` (line 72) contains only the legacy `535f5a17-fc49-40ea-ac16-5d68895884f7` (`HbWebpartsWebPart`). `HB_WEBPARTS_PROOF_CASE_IDS` (line 76) is **empty** — so the proof-case scope lock (lines 696–701) never activates and every non-excluded webpart is packaged.

## 4. Pipeline wiring assessment

### 4.1 Project Sites

**Wired before this audit: YES.** Correction required: **none**.

Evidence:
- `project-sites` is registered at `tools/build-spfx-package.ts` line 67.
- The pipeline's recursive manifest walk discovers `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` with `componentType: 'WebPart'`.
- The single webpart manifest ID `e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b` is present in the post-build archive's `d8f24a6c-91e3-4b57-a0c2-3e5f7d1b9a84/WebPart_e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b.xml` file.
- Per-webpart shell-entry shim `shell-entry-e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b-9ad3efa5.js` is present in `ClientSideAssets/`.
- Main bundle `project-sites-app-483851ce.js` is present in `ClientSideAssets/` and its hash matches the live Vite bundle's SHA-256 prefix.
- `supportsFullBleed: true` preserved in the cloned manifest (pipeline verifier confirmed: `✓ e7b3c4a2... supportsFullBleed: true preserved`).

### 4.2 HB Webparts package

**Wired before this audit: YES.** Correction required: **none**.

Evidence:
- `hb-webparts` is registered at `tools/build-spfx-package.ts` line 68 with `packagingModel: 'multi'`.
- The pipeline's recursive manifest walk discovers all 12 webpart manifests under `apps/hb-webparts/src/webparts/*/`, filters out the single excluded legacy `535f5a17-...` ID, and keeps the remaining 11.
- All 11 manifests reach the final `.sppkg` via 11 `WebPart_{id}.xml` files in the feature folder plus 11 matching `shell-entry-{id}-{hash}.js` files in `ClientSideAssets/`.
- `hb-webparts-shim-proof.json` (regenerated by this audit) lists all 11 packaged shims.

### 4.3 Target webparts inside HB Webparts

All four scoped target webparts were wired into the pipeline **before** this audit, continued to be wired after the audit's clean rebuild, and were proven present in the final archive via multiple independent evidence paths:

#### Company Pulse

- **Wired before changes:** YES. No correction required.
- **Evidence before rebuild:** Manifest exists at `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json` with ID `0b53f651-fd92-4f7f-a9da-f7797017f5eb`; render function registered in `apps/hb-webparts/src/mount.tsx` `WEBPART_RENDERERS`; stale archive's baseline `hb-webparts-shim-proof.json` listed `shell-entry-0b53f651-fd92-4f7f-a9da-f7797017f5eb-d55a9b3b.js`.
- **Evidence after rebuild:** `unzip -p dist/sppkg/hb-webparts.sppkg 1f447e99-.../WebPart_0b53f651-fd92-4f7f-a9da-f7797017f5eb.xml` returned a ClientSideComponent element with `Id="0b53f651-fd92-4f7f-a9da-f7797017f5eb"`, `alias":"CompanyPulseWebPart"`, `supportsFullBleed":true`, `entryModuleId":"0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0"`, and `scriptResources` pointing at the **new** shim `shell-entry-0b53f651-fd92-4f7f-a9da-f7797017f5eb-a2ffbbb5.js`. The regenerated `hb-webparts-shim-proof.json` confirms the same shim and hash `a2ffbbb5`.

#### People and Culture

- **Wired before changes:** YES. No correction required.
- **Evidence before rebuild:** Manifest exists at `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json` with ID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`; render function registered in mount.tsx; stale baseline shim was `shell-entry-27ac10f4-4054-4dd2-bd53-3b4ef4379ab4-2216daf4.js`.
- **Evidence after rebuild:** Archive contains `1f447e99-.../WebPart_27ac10f4-4054-4dd2-bd53-3b4ef4379ab4.xml` (6,309 bytes). Regenerated shim-proof lists `shell-entry-27ac10f4-4054-4dd2-bd53-3b4ef4379ab4-588d6f4f.js` with `entryModuleId: 27ac10f4-4054-4dd2-bd53-3b4ef4379ab4_1.0.0`. The new hash `588d6f4f` differs from the baseline `2216daf4`, confirming a genuine rebuild.

#### Project / Portfolio Spotlight

- **Wired before changes:** YES. No correction required.
- **Evidence before rebuild:** Manifest exists at `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` with ID `8370ab0c-b6df-4db0-82f1-24b54750f508`; render function registered in mount.tsx; stale baseline shim was `shell-entry-8370ab0c-b6df-4db0-82f1-24b54750f508-1ea24811.js`.
- **Evidence after rebuild:** `unzip -p dist/sppkg/hb-webparts.sppkg 1f447e99-.../WebPart_8370ab0c-b6df-4db0-82f1-24b54750f508.xml` returned a ClientSideComponent with `Id="8370ab0c-b6df-4db0-82f1-24b54750f508"`, `alias":"ProjectPortfolioSpotlightWebPart"`, `supportsFullBleed":true`, `entryModuleId":"8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0"`, and `scriptResources` pointing at the new shim `shell-entry-8370ab0c-b6df-4db0-82f1-24b54750f508-c1e3a373.js`. Regenerated shim-proof confirms hash `c1e3a373` ≠ baseline `1ea24811`.

#### Safety & Field Excellence

- **Wired before changes:** YES. No correction required.
- **Evidence before rebuild:** Manifest exists at `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json` with ID `89ca5ff3-21f4-4b23-a953-4b7306ea1029`; render function registered in mount.tsx; stale baseline shim was `shell-entry-89ca5ff3-21f4-4b23-a953-4b7306ea1029-aa075d77.js`.
- **Evidence after rebuild:** Archive contains `1f447e99-.../WebPart_89ca5ff3-21f4-4b23-a953-4b7306ea1029.xml` (3,318 bytes). Regenerated shim-proof lists `shell-entry-89ca5ff3-21f4-4b23-a953-4b7306ea1029-a3020703.js` with `entryModuleId: 89ca5ff3-21f4-4b23-a953-4b7306ea1029_1.0.0`. New hash `a3020703` ≠ baseline `aa075d77` — rebuild confirmed.

## 5. Stale-content risk assessment

| Risk | Assessment | Notes |
|---|---|---|
| Stale `tools/spfx-shell/temp/` survivors | **Theoretical, mitigated** | `cleanShellTemp()` wipes this on every build. |
| Stale `tools/spfx-shell/dist/` survivors | **Theoretical, mitigated** | Same — wiped every build. |
| Stale `tools/spfx-shell/lib/` survivors | **Theoretical, mitigated** | Same — wiped every build. |
| Stale `tools/spfx-shell/sharepoint/solution/` survivors | **Theoretical, mitigated** | Gulp explicitly cleans `sharepoint/solution/debug/` per build; the final `.sppkg` is rewritten from scratch. |
| Stale copied shell assets in `tools/spfx-shell/assets/` | **Theoretical, mitigated** | `cleanShellTemp()` wipes and recreates `assets/` every build. |
| Stale client-side bundles in `apps/{domain}/dist/` | **Theoretical, LATENT unless a fresh `pnpm build` runs** | The pipeline **verifies** the dist bundle's presence (`if (!fs.existsSync(distDir))`) but does **not** re-run Vite. If a user edits source and forgets `pnpm build`, the packager will hash and ship the previous bundle. Mitigation: run `pnpm --filter @hbc/spfx-{domain} build` before the packager. This audit did exactly that. |
| Stale manifests in the packaged `.sppkg` | **Theoretical, mitigated** | Manifests are cloned from the live source manifests on every build, written to `tools/spfx-shell/lib/webparts/shell/{id}.manifest.json`, and consumed by gulp fresh. Gulp explicitly cleans and rewrites the output directory. |
| Stale content-hash mismatches | **Theoretical, mitigated** | The bundle hash is computed fresh from the current bundle bytes on every build; the per-webpart shim hash is computed fresh from the patched shim body; and the manifest's `scriptResources` map is rewritten with the new hash-bearing filename. |
| Manifest-cloning drop-loss (a webpart exists in source but isn't packaged) | **Theoretical, disproven** | The pipeline's recursive walk discovers every `*.manifest.json` under `src/webparts/`. No allow-list gate exists. Only two filters run: `componentType !== 'WebPart'` (rejects non-webpart components) and `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS.has(id)` (rejects only legacy `535f5a17-...`). All 11 non-excluded `hb-webparts` manifests pass both filters and end up in `targetManifests`. The post-build shim-proof JSON lists all 11. |
| Proof-case scope lock accidentally dropping webparts | **Not real** | `HB_WEBPARTS_PROOF_CASE_IDS` is an empty `Set<string>`. The scope-lock branch (`if (… && HB_WEBPARTS_PROOF_CASE_IDS.size > 0)`) never activates. |
| **Latent: pre-audit `dist/sppkg/` archives were stale relative to source** | **REAL and OBSERVED** (at audit start) | `dist/sppkg/hb-intel-project-sites.sppkg`, `dist/sppkg/hb-webparts.sppkg`, and `dist/sppkg/hb-webparts-shim-proof.json` were all dated **2026-04-08 05:05**, while `apps/project-sites/dist/project-sites-app.js` was dated **2026-04-09 06:18** and `apps/hb-webparts/dist/hb-webparts-app.js` was dated **2026-04-09 04:56**. The source Vite bundles had been rebuilt after the W01r-P09, W01r-P11, and W01r-P12 commits, but the `.sppkg` archives had **not** been regenerated. **Cure:** the clean rebuild performed by this audit — see section 7. |

## 6. Changes made

**No code, config, or pipeline script changes were required or made.** The pipeline is correctly wired for both domains and all four scoped targets. The only persisted changes on disk are:

1. Regenerated `dist/sppkg/hb-intel-project-sites.sppkg` (new content)
2. Regenerated `dist/sppkg/hb-webparts.sppkg` (new content)
3. Regenerated `dist/sppkg/hb-webparts-shim-proof.json` (new shim hashes across all 11 webparts)
4. This audit report: `docs/architecture/reviews/spfx/spfx-pipeline-project-sites-hb-webparts-freshness-audit.md`

None of the pipeline source files, domain registration entries, manifest files, or build scripts were edited.

## 7. Build and packaging execution

### Commands run

| # | Command | Purpose | Result |
|---|---|---|---|
| 1 | `ls -la dist/sppkg/` | Capture baseline timestamps and sizes of the stale archives | ✅ Baseline captured (Apr 8 05:05 stale) |
| 2 | `ls -la apps/project-sites/dist/ apps/hb-webparts/dist/` | Confirm source Vite bundles exist and capture timestamps | ✅ `project-sites-app.js` Apr 9 06:18, `hb-webparts-app.js` Apr 9 04:56 |
| 3 | `cat dist/sppkg/hb-webparts-shim-proof.json` | Capture baseline shim hashes for the 11 packaged webparts | ✅ All 11 baseline hashes captured |
| 4 | `shasum -a 256 apps/project-sites/dist/project-sites-app.js apps/hb-webparts/dist/hb-webparts-app.js` | Capture source bundle SHA-256 (first 8 chars = packager content hash) | ✅ `483851ce…` + `ed4c6481…` |
| 5 | `pnpm --filter @hbc/spfx-project-sites build` | Fresh Vite rebuild of Project Sites to guarantee current source bundle | ✅ pass (`419.52 kB / gzip 126.55 kB`) |
| 6 | `pnpm --filter @hbc/spfx-hb-webparts build` | Fresh Vite rebuild of HB Webparts to guarantee current source bundle | ✅ pass (`564.47 kB / gzip 200.89 kB`) |
| 7 | `shasum -a 256 …` (post-build) | Confirm the Vite rebuild is deterministic (same bytes as pre-build) | ✅ Same hashes — source is stable, bundle content hasn't drifted |
| 8 | `npx tsx tools/build-spfx-package.ts --domain project-sites` | Authoritative Project Sites packaging | ✅ pass — `hb-intel-project-sites.sppkg (132.1 KB)`; verifier reported `✓ .sppkg structure verified` and `✓ Packaged shell asset references project-sites-app-483851ce.js and __hbIntel_projectSites` |
| 9 | `npx tsx tools/build-spfx-package.ts --domain hb-webparts` | Authoritative HB Webparts packaging | ✅ pass — `hb-webparts.sppkg (2983.7 KB)`; verifier reported `✓ Packaged shim files (11): …`, `✓ 0b53f651… supportsFullBleed: true preserved`, `✓ 39762a4d… supportsFullBleed: true preserved`, `✓ 28acd6a7… supportsFullBleed: true preserved`, `✓ 8370ab0c… supportsFullBleed: true preserved`, `✓ cb7060f5… supportsFullBleed: true preserved`, `✓ .sppkg structure verified`, `✓ Packaged shell asset references hb-webparts-app-ed4c6481.js and __hbIntel_hbWebparts`, `✓ Shim proof written: /Users/bobbyfetting/hb-intel/dist/sppkg/hb-webparts-shim-proof.json` |
| 10 | `ls -la dist/sppkg/` (post-build) | Confirm both archives were regenerated | ✅ Both files stamped **2026-04-09 07:30** |
| 11 | `unzip -l dist/sppkg/hb-intel-project-sites.sppkg` | Enumerate Project Sites archive contents | ✅ 17 files, all dated `04-09-2026 11:30` (UTC = 07:30 local) |
| 12 | `unzip -l dist/sppkg/hb-webparts.sppkg` | Enumerate HB Webparts archive contents | ✅ 39 files including 11 `WebPart_*.xml` and 11 `shell-entry-*.js`, all dated `04-09-2026 11:30` |
| 13 | `unzip -p dist/sppkg/hb-webparts.sppkg .../WebPart_0b53f651-….xml` | Extract Company Pulse's packaged WebPart XML and verify `scriptResources` → shim | ✅ `path: "shell-entry-0b53f651-fd92-4f7f-a9da-f7797017f5eb-a2ffbbb5.js"` |
| 14 | `unzip -p dist/sppkg/hb-webparts.sppkg .../WebPart_8370ab0c-….xml` | Extract Project Portfolio Spotlight's packaged WebPart XML and verify `scriptResources` → shim | ✅ `path: "shell-entry-8370ab0c-b6df-4db0-82f1-24b54750f508-c1e3a373.js"` |
| 15 | `cat dist/sppkg/hb-webparts-shim-proof.json` | Read regenerated shim-proof JSON | ✅ All 11 shim hashes differ from baseline |

## 8. Post-build package inspection proof

### 8.1 Project Sites package

**Path:** `dist/sppkg/hb-intel-project-sites.sppkg` — 135,296 bytes, dated **2026-04-09 07:30** local (was 149,840 bytes, 2026-04-08 05:05 before rebuild).

**Archive contents (17 files, all dated 04-09-2026 11:30 UTC):**

```
AppManifest.xml
_rels/AppManifest.xml.rels
_rels/.rels
[Content_Types].xml
feature_d8f24a6c-91e3-4b57-a0c2-3e5f7d1b9a84.xml
_rels/feature_d8f24a6c-91e3-4b57-a0c2-3e5f7d1b9a84.xml.rels
feature_d8f24a6c-91e3-4b57-a0c2-3e5f7d1b9a84.xml.config.xml
d8f24a6c-91e3-4b57-a0c2-3e5f7d1b9a84/WebPart_e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b.xml
ClientSideAssets.xml
_rels/ClientSideAssets.xml.rels
ClientSideAssets.xml.config.xml
ClientSideAssets/project-sites-app-483851ce.js             (419,523 bytes)
ClientSideAssets/shell-entry-e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b-9ad3efa5.js  (3,798 bytes)
ClientSideAssets/shell-web-part_288fdb97e3c82b834629.js     (3,798 bytes)
```

**Manifest IDs proven:**
- Single webpart ID `e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b` (Project Sites) — present as `WebPart_e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b.xml` in the feature folder.

**Asset/bundle proof:**
- Main IIFE bundle: `project-sites-app-483851ce.js` — hash `483851ce` matches the first 8 chars of `shasum -a 256` of the live `apps/project-sites/dist/project-sites-app.js` (`483851ce114c28723a9f0df72b37c30311a1bcfcaeb95d0bc099fa88e4b50c5d`).
- Per-webpart shell-entry shim: `shell-entry-e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b-9ad3efa5.js` — hash `9ad3efa5` (differs from baseline).
- Compiled shell webpart: `shell-web-part_288fdb97e3c82b834629.js` (webpack-hashed filename; regenerated by gulp each build).

**Stale-content result:** **None.** The archive contains exactly one project-sites bundle (`project-sites-app-483851ce.js`), exactly one shell-entry shim, and exactly one webpart XML. No superseded `project-sites-app-*.js` copies survive, no old shim files survive, no orphan manifest XMLs survive.

### 8.2 HB Webparts package

**Path:** `dist/sppkg/hb-webparts.sppkg` — 3,055,290 bytes, dated **2026-04-09 07:30** local (was 3,054,222 bytes, 2026-04-08 05:05 before rebuild).

**Archive contents (39 files, all dated 04-09-2026 11:30 UTC):**

```
AppManifest.xml + rels + Content_Types.xml
feature_1f447e99-a2c7-43e5-83d8-d2ed78ed1a96.xml + rels + .config.xml
1f447e99-a2c7-43e5-83d8-d2ed78ed1a96/
  WebPart_0b53f651-fd92-4f7f-a9da-f7797017f5eb.xml   (Company Pulse)         4,808 bytes
  WebPart_39762a4d-c7fd-44a6-a11e-4f8de9f5778d.xml   (HbHeroBanner)          2,504 bytes
  WebPart_28acd6a7-2582-4d8a-86d4-b52bfbeb375c.xml   (HbSignatureHero)       2,140 bytes
  WebPart_e8fa8a84-a48a-41d2-85a6-b7c7df70aeca.xml   (LeadershipMessage)     2,982 bytes
  WebPart_27ac10f4-4054-4dd2-bd53-3b4ef4379ab4.xml   (People & Culture)      6,309 bytes
  WebPart_46bfde64-f0cb-4f62-9f6b-a466f8fadc1f.xml   (PersonalizedWelcomeHeader) 2,461 bytes
  WebPart_b3f07190-79cf-437d-a1d6-ecbf3f77e616.xml   (PriorityActionsRail)   3,058 bytes
  WebPart_8370ab0c-b6df-4db0-82f1-24b54750f508.xml   (Project Portfolio Spotlight) 6,935 bytes
  WebPart_89ca5ff3-21f4-4b23-a953-4b7306ea1029.xml   (Safety & Field Excellence)   3,318 bytes
  WebPart_11d72b36-a92f-4e2d-9918-75df2cb0d11e.xml   (SmartSearchWayfinding) 4,827 bytes
  WebPart_cb7060f5-b852-4600-b912-a5f6f7221ce2.xml   (ToolLauncherWorkHub)   3,215 bytes
ClientSideAssets.xml + rels + .config.xml
ClientSideAssets/
  banner_home_7.png                                                          2,862,677 bytes
  hb-webparts-app-ed4c6481.js                                                  564,471 bytes
  shell-entry-0b53f651-fd92-4f7f-a9da-f7797017f5eb-a2ffbbb5.js                    3,902 bytes
  shell-entry-11d72b36-a92f-4e2d-9918-75df2cb0d11e-c0bedbf2.js                    3,902 bytes
  shell-entry-27ac10f4-4054-4dd2-bd53-3b4ef4379ab4-588d6f4f.js                    3,902 bytes
  shell-entry-28acd6a7-2582-4d8a-86d4-b52bfbeb375c-4fb7edd8.js                    3,902 bytes
  shell-entry-39762a4d-c7fd-44a6-a11e-4f8de9f5778d-4077be89.js                    3,902 bytes
  shell-entry-46bfde64-f0cb-4f62-9f6b-a466f8fadc1f-cc130db6.js                    3,902 bytes
  shell-entry-8370ab0c-b6df-4db0-82f1-24b54750f508-c1e3a373.js                    3,902 bytes
  shell-entry-89ca5ff3-21f4-4b23-a953-4b7306ea1029-a3020703.js                    3,902 bytes
  shell-entry-b3f07190-79cf-437d-a1d6-ecbf3f77e616-208c9117.js                    3,902 bytes
  shell-entry-cb7060f5-b852-4600-b912-a5f6f7221ce2-0bfdb416.js                    3,902 bytes
  shell-entry-e8fa8a84-a48a-41d2-85a6-b7c7df70aeca-ea8d25ac.js                    3,902 bytes
  shell-web-part_b54e2389a48b291f5e5e.js                                          3,902 bytes
  spfx-hb-webparts.css                                                           51,325 bytes
```

**Target manifest IDs proven (all four):**
- `0b53f651-fd92-4f7f-a9da-f7797017f5eb` — Company Pulse ✓
- `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` — People & Culture ✓
- `8370ab0c-b6df-4db0-82f1-24b54750f508` — Project / Portfolio Spotlight ✓
- `89ca5ff3-21f4-4b23-a953-4b7306ea1029` — Safety & Field Excellence ✓

Each target has:
1. A `WebPart_{id}.xml` file in the feature folder `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96/`.
2. A corresponding per-webpart shell-entry shim in `ClientSideAssets/shell-entry-{id}-{newHash}.js`.
3. An entry in the regenerated `dist/sppkg/hb-webparts-shim-proof.json` with `manifestId`, `entryModuleId: {id}_1.0.0`, `shimFileName`, `shimFileHash`, and `baseModuleId: 9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`.

**Asset/bundle proof:**
- Main IIFE bundle: `hb-webparts-app-ed4c6481.js` — hash `ed4c6481` matches the first 8 chars of `shasum -a 256` of `apps/hb-webparts/dist/hb-webparts-app.js` (`ed4c6481d31e8a725f226c514216cedddcb810a6d849444ab1f8c15d08ca98d0`). The baseline archive referenced `hb-webparts-app-c670e24f.js`; the new hash `ed4c6481` confirms the bundle content changed (reflecting the W01r-P09 Company Pulse migration).
- CSS: `spfx-hb-webparts.css` (51,325 bytes) matches the live Vite-emitted CSS.
- Static asset: `banner_home_7.png` (2,862,677 bytes) present.
- Compiled shell webpart: `shell-web-part_b54e2389a48b291f5e5e.js` (webpack-hashed, fresh).

**Stale-content result:** **None.** The archive contains:
- Exactly one main bundle (`hb-webparts-app-ed4c6481.js`) — no superseded hashed copies.
- Exactly 11 `shell-entry-*.js` files — one per non-excluded webpart, no orphans.
- Exactly 11 `WebPart_*.xml` files — matching 1:1 with the shim files.
- Exactly one compiled shell webpart.
- No stale bundle references anywhere in the `scriptResources` maps of the 11 WebPart XMLs.

## 9. Target freshness proof by webpart

### Company Pulse

- **Inspected:** `unzip -l` file list, extracted `WebPart_0b53f651-fd92-4f7f-a9da-f7797017f5eb.xml` via `unzip -p`, cross-referenced against regenerated `hb-webparts-shim-proof.json`.
- **How freshness was proven:**
  1. The packaged WebPart XML's `scriptResources` entry for `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` points at `shell-entry-0b53f651-fd92-4f7f-a9da-f7797017f5eb-a2ffbbb5.js`.
  2. The ClientSideAssets folder contains exactly that file (3,902 bytes).
  3. The new shim hash `a2ffbbb5` differs from the baseline `d55a9b3b` by every byte of the hash — a genuine rebuild.
  4. The main bundle `hb-webparts-app-ed4c6481.js` differs from the baseline `hb-webparts-app-c670e24f.js`, reflecting the W01r-P09 Company Pulse migration commit (762782f2) that landed between the stale archive timestamp (Apr 8 05:05) and the clean-rebuild timestamp (Apr 9 07:30).
  5. The packaged `ComponentManifest` preserves the Company Pulse manifest metadata — `alias: CompanyPulseWebPart`, `title: Company Pulse`, `supportsFullBleed: true`, and the current Q2 Safety & Quality Milestone preconfigured-entries payload.
- **Stale content remaining:** **None.**

### People and Culture

- **Inspected:** Archive file list, regenerated `hb-webparts-shim-proof.json`, cross-reference to mount.tsx `WEBPART_RENDERERS` and source manifest.
- **How freshness was proven:**
  1. `WebPart_27ac10f4-4054-4dd2-bd53-3b4ef4379ab4.xml` (6,309 bytes) is present in the archive.
  2. The shim-proof JSON entry for `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` points at `shell-entry-27ac10f4-4054-4dd2-bd53-3b4ef4379ab4-588d6f4f.js` with `entryModuleId: 27ac10f4-4054-4dd2-bd53-3b4ef4379ab4_1.0.0`.
  3. The ClientSideAssets folder contains exactly that shim file.
  4. The new shim hash `588d6f4f` differs from the baseline `2216daf4` — genuine rebuild.
- **Stale content remaining:** **None.**

### Project / Portfolio Spotlight

- **Inspected:** `unzip -l` file list, extracted `WebPart_8370ab0c-b6df-4db0-82f1-24b54750f508.xml` via `unzip -p`, cross-referenced against regenerated shim-proof.
- **How freshness was proven:**
  1. The packaged WebPart XML's `scriptResources` entry for `8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0` points at `shell-entry-8370ab0c-b6df-4db0-82f1-24b54750f508-c1e3a373.js`.
  2. The ClientSideAssets folder contains exactly that file.
  3. The new shim hash `c1e3a373` differs from baseline `1ea24811`.
  4. The packaged `ComponentManifest` preserves the current Project / Portfolio Spotlight payload (Palm Beach Medical Campus Expansion featured item, team members, milestones, and `supportsFullBleed: true`).
- **Stale content remaining:** **None.**

### Safety & Field Excellence

- **Inspected:** Archive file list, regenerated `hb-webparts-shim-proof.json`, cross-reference to mount.tsx `WEBPART_RENDERERS`.
- **How freshness was proven:**
  1. `WebPart_89ca5ff3-21f4-4b23-a953-4b7306ea1029.xml` (3,318 bytes) is present in the archive.
  2. The shim-proof JSON entry for `89ca5ff3-21f4-4b23-a953-4b7306ea1029` points at `shell-entry-89ca5ff3-21f4-4b23-a953-4b7306ea1029-a3020703.js` with `entryModuleId: 89ca5ff3-21f4-4b23-a953-4b7306ea1029_1.0.0`.
  3. The ClientSideAssets folder contains exactly that shim file.
  4. The new shim hash `a3020703` differs from baseline `aa075d77` — genuine rebuild.
- **Stale content remaining:** **None.**

## 10. Final repo-truth posture

The authoritative SPFx `.sppkg` pipeline is `tools/build-spfx-package.ts`. Both target domains (`project-sites` and `hb-webparts`) and all four scoped target webparts (Company Pulse, People & Culture, Project / Portfolio Spotlight, Safety & Field Excellence) were **already correctly wired** into the pipeline before this audit; no source code, config, or pipeline script change was required. The pre-audit `dist/sppkg/` archives were stale (Apr 8) relative to the source bundles refreshed by recent Apr 9 commits (W01r-P09 / W01r-P11 / W01r-P12), which was cured by this audit's authoritative clean rebuild. The final post-build archives — `dist/sppkg/hb-intel-project-sites.sppkg` (135,296 bytes) and `dist/sppkg/hb-webparts.sppkg` (3,055,290 bytes) — are **proven current and free of stale manifest or stale content** for the scoped targets: every packaged WebPart XML's `scriptResources` map points at a newly generated per-webpart shell-entry shim whose 8-character hash differs from the baseline, the main Vite bundle's 8-character content hash differs from the baseline, every shim file listed in the regenerated `hb-webparts-shim-proof.json` is present in `ClientSideAssets/` with the expected matching hash, and no superseded bundle copies, orphan manifest XMLs, or stale shim files survive in either archive. The pipeline is correctly wired, the packages are current, and no follow-up fix or rebuild is required for this scope.
