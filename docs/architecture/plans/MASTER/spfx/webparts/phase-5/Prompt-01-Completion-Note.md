# Prompt-01 Completion Note — Implement Cumulative All-Webparts Architecture

## Status

Complete. Cumulative all-webparts packaging is confirmed active and verified.

## 1. Files changed

| File | Change |
|------|--------|
| `apps/hb-webparts/config/package-solution.json` | Version bump `1.0.0.23` → `1.0.0.24` |

No code changes were needed — the cumulative architecture was already implemented in Phase 4 (P4-02) by clearing `HB_WEBPARTS_PROOF_CASE_IDS`. This prompt confirms and re-verifies that implementation.

## 2. Architecture selected

**Neutral shell manifest + AMD shims with full mount.tsx dispatcher.**

The build orchestrator (`tools/build-spfx-package.ts`) operates as follows for `hb-webparts`:

1. `HB_WEBPARTS_PROOF_CASE_IDS` is empty → the proof-case manifest filter is skipped → all 10 source manifests pass through
2. `isProofCase` is false → proof-case entry routing is skipped → Vite builds from the default `src/mount.tsx` (all 10 components)
3. `useNeutralShellManifestId` is true (because `targetManifests.length > 1`) → the neutral shell manifest ID (`9a2f7f61-...`) is compiled as the base entry module
4. For each of the 10 webparts, an AMD shim file is generated: `define("{webpartId}_1.0.0", ["9a2f7f61-..._1.0.0"], function(b){return b})`
5. The compiled base manifest is cloned per webpart with the correct ID, alias, preconfiguredEntries, and scriptResources
6. The neutral manifest is deleted from the release directory

## 3. How cumulative retention now works

- **No filtering**: `HB_WEBPARTS_PROOF_CASE_IDS` is empty, so the filter at line 548 (`HB_WEBPARTS_PROOF_CASE_IDS.size > 0`) evaluates to false and is skipped entirely. All source manifests discovered under `apps/hb-webparts/src/webparts/*/manifest.json` are included.
- **No replacement**: The single-target proof-case logic (`isProofCase`) is dormant. There is no mechanism that removes one webpart when another is added.
- **Legacy exclusion preserved**: `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS` still excludes the legacy `HbWebpartsWebPart` (`535f5a17-...`) — this is correct and intentional.

## 4. Version bump

- **Before:** `1.0.0.23`
- **After:** `1.0.0.24`

## 5. Remaining known risks

| Risk | Notes |
|------|-------|
| Tenant service-worker cache | Content-hashed bundle name mitigates. Unregister `spserviceworker.js` if stale. |
| AMD shim resolution in tenant (8 newly restored webparts) | HbHeroBanner and PriorityActionsRail validated the shell + bundle + mount chain. The 8 newly restored webparts use identical shim + dispatcher logic. Tenant validation (Prompt-03) will confirm. |
| Dormant proof-case infrastructure | `HB_WEBPARTS_PROOF_CASE_ENTRY_MAP` and individual proof-case entries remain in source but are never reached. Safe to clean up in a future phase. |

## Verification results

| Check | Result |
|-------|--------|
| check-types | pass |
| lint | pass |
| build (Vite, full mount.tsx) | pass — 262.49 kB |
| SPFx package build | pass — 10 manifests, 10 shims, 100.5 KB .sppkg |
| AppManifest.xml Version | `1.0.0.23` (valid 4-part) |
| Shim proof | 10 mappings, base `9a2f7f61-..._1.0.0` |
