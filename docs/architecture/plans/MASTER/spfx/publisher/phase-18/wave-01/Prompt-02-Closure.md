# Phase 18 Wave 01 — Prompt 02 Closure

**Status:** Closed
**Closure date:** 2026-04-16
**Manifest bump:** `hb-publisher` `1.0.0.61` → `1.0.0.62`
**Scope:** Generalize the repo's strongest package-truth verification logic so
`hb-publisher` gets semantic proof, not just structural archive checks.

## What changed

Previously `buildHbPackageTruthProof` and its supporting machinery were
hardcoded to `hb-webparts` (PnP webpart ID marker, webparts-only source
fingerprint paths, `domain: 'hb-webparts'` literal, and the entire truth-proof
path gated on `domain.dir === 'hb-webparts'`). Publisher therefore only got
shallow freshness evidence (Prompt 01). This prompt generalizes the proof
path so both domains go through the same four-check verifier:

1. `structuralValidity` — required package structures + assets present.
2. `freshness` — source and packaged bundle SHAs match; shim hashes match.
3. `sourcePackageSemanticAlignment` — every required manifest field (`id`,
   `alias`, `componentType`, `supportedHosts`, `preconfiguredEntries`,
   `requiresCustomScript`, `supportsThemeVariants`, `supportsFullBleed`) and
   the `scriptResourcePath` agree between the source manifest and the
   packaged `ComponentManifest` in the `.sppkg`, and the `entryModuleId`
   matches.
4. `liveRuntimeProof` — the packaged bundle contains the domain's runtime
   marker ID (Publisher's `ARTICLE_PUBLISHER_WEBPART_ID`, webparts'
   `HB_PNP_OPS_WEBPART_ID`) and the marker's manifest XML is wired through
   the per-webpart shell-entry shim.

### Code changes (`tools/build-spfx-package.ts`)

1. `HbPackageTruthProof.pnpOpsWebpartId` → `runtimeMarkerId` (domain-neutral
   field name).
2. Introduced `PackageRuntimeMarker { id, label }` plus two top-level
   registries keyed by domain:
   - `RUNTIME_MARKERS_BY_DOMAIN` (PnP Ops webpart for hb-webparts; Article
     Publisher webpart for hb-publisher).
   - `CRITICAL_RUNTIME_PATHS_BY_DOMAIN` (`HB_WEBPARTS_CRITICAL_RUNTIME_PATHS`
     and `HB_PUBLISHER_CRITICAL_RUNTIME_PATHS`).
3. `collectRuntimeSourceFingerprints` now takes a `criticalPaths` list
   parameter — no more hardcoded webparts-only source set.
4. `buildHbPackageTruthProof` now takes `domain`, `runtimeMarker`,
   `criticalRuntimePaths`, and `baseBundleName` parameters. Hardcoded
   `'hb-webparts'` and `HB_PNP_OPS_WEBPART_ID` references replaced with
   domain-aware equivalents. The log strings and proof details use
   `runtimeMarker.label` (e.g., "Article Publisher webpart") so webparts'
   proof text remains accurate.
5. Un-gated `hbExpectations` in the orchestrator from
   `domain.dir === 'hb-webparts'` to `generatedShimExpectations.length > 0`.
   Publisher already emits a per-webpart shell-entry shim, so it now flows
   through the full verification + proof path.
6. Fixed a latent webparts-only assumption in `verifySppkg`'s shim check:
   when `baseModuleId === entryModuleId` (single-manifest identity case —
   Publisher compiles the shell directly against its one webpart's manifest,
   so no define() patching is needed), skip the "neutral define must not be
   present" guard. The check otherwise fires spuriously for any
   single-manifest domain. Webparts' check (where base and entry IDs
   differ by design) is unaffected.
7. Removed the Prompt-01 Publisher-only `writeFreshnessProof` helper and
   the standalone `hb-publisher-freshness-proof.json` artifact (superseded
   by the richer `hb-publisher-package-truth-proof.json`). Reverted
   `verifyPackagedBundleFreshness` to its original `boolean` return shape.

### Output artifacts

New (per-run, in `dist/sppkg/`):
- `hb-publisher-shim-proof.json` — shim mappings + freshness provenance.
- `hb-publisher-package-truth-proof.json` — full four-check proof.

Webparts artifacts unchanged in shape except the field rename
`pnpOpsWebpartId` → `runtimeMarkerId` in the package-truth proof.

## Verification performed

All commands from repo root with `apps/hb-publisher/dist/` pre-stale.

1. **Publisher end-to-end**: `npx tsx tools/build-spfx-package.ts --domain hb-publisher`
   - ✓ Freshness gate: removed stale dist directory
   - ✓ Building app with Vite (fresh build enforced)
   - ✓ Freshness evidence captured
   - ✓ Packaged shim files (1): `shell-entry-1a6f8b2c-…-3fd81f9c.js`
   - ✓ Neutral shared shell module identity: `1a6f8b2c-…_1.0.0`
   - ✓ .sppkg structure verified
   - ✓ Packaged bundle freshness verified
   - ✓ Packaged shell asset references `hb-publisher-app-…js` and `__hbIntel_hbPublisher`
   - ✓ Shim proof written
   - ✓ Package-truth proof written

2. **Publisher proof content** (`dist/sppkg/hb-publisher-package-truth-proof.json`):
   - `domain`: `hb-publisher`
   - `runtimeMarkerId`: `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10`
   - `sourceFingerprints.criticalRuntimeFiles`: 7 files (mount, runtime
     contract, ArticlePublisher component, webpart manifest, publisher
     adapter index + orchestrator + repositories)
   - All four `checks.*.pass` → `true`.

3. **Webparts regression check**: `npx tsx tools/build-spfx-package.ts --domain hb-webparts`
   - All four `checks.*.pass` → `true` in `hb-webparts-package-truth-proof.json`.
   - Stable GUID `9e2dd84a-a121-4fb3-a964-f43a94abf9fd` preserved as
     `runtimeMarkerId` (renamed from `pnpOpsWebpartId`).

4. **Standalone TypeScript check**:
   `tsc --noEmit --skipLibCheck --lib es2021,dom tools/build-spfx-package.ts` — clean.

5. **Fail-injection demonstration** (one-off, not committed):

   Extracted the packaged `ComponentManifest` from the current
   `dist/sppkg/hb-publisher.sppkg` and compared it against the live source
   manifest at
   `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`.

   ```
   PASS scenario (current clean state):
     source.alias = ArticlePublisherWebPart
     packaged.alias = ArticlePublisherWebPart
     → fields.alias.matches = true
     → allMatched = true
     → sourcePackageSemanticAlignment.pass = true

   FAIL scenario (in-memory source.alias → "ArticlePublisherWebPart_TAMPERED"):
     source.alias = ArticlePublisherWebPart_TAMPERED
     packaged.alias = ArticlePublisherWebPart
     → fields.alias.matches = false
     → allMatched = false
     → sourcePackageSemanticAlignment.pass = false
   ```

   This exercises the same comparison the proof runs
   (`normalizeSourceManifestField` vs `normalizePackagedManifestField` for
   each required field, then `stableJson()` equality). Drift in any of
   `{id, alias, componentType, supportedHosts, preconfiguredEntries,
   requiresCustomScript, supportsThemeVariants, supportsFullBleed,
   scriptResourcePath}` or in the `entryModuleId` would trip
   `sourcePackageSemanticAlignment.pass = false`.

6. **Stable GUID / alias preservation** (Publisher, from proof):
   - `manifestLinkage[0].fields.id.expected/actual` → both
     `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10`.
   - `manifestLinkage[0].fields.alias.expected/actual` → both
     `ArticlePublisherWebPart`.
   - `manifestLinkage[0].fields.supportedHosts.expected/actual` → both
     `["SharePointWebPart"]`.
   - `manifestLinkage[0].fields.supportsFullBleed.expected/actual` → both
     `true`.
   - `manifestLinkage[0].entryModuleId.expected/actual` → both
     `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10_1.0.0`.
   - `manifestLinkage[0].fields.scriptResourcePath.expected/actual` → both
     `shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-3fd81f9c.js`.

## Out of scope (handled by later prompts in this wave)

- Simplification of the single-manifest shell-entry generation path for
  Publisher (neutral-shell / identity-shim redundancy) — Prompt 03.
- Hosted instantiation / live load proof in SharePoint — Prompt 04.
