# Wave 9 — Clean Build + Fresh .sppkg Proof

**Built:** 2026-04-13T19:10 local
**Manifest:** hb-webparts Feature `1.0.0.219` / solution `1.0.0.208`
**Orchestrator:** `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

---

## Objective

Produce a full clean build of the Project Spotlight publisher app and a fresh `hb-webparts.sppkg` that contains the current publisher source — closing the Wave 9 packaging gate left open when Prompt-09 was first committed (`ef0bfd46`).

## Build ownership

| Concern | Owning location |
|---------|-----------------|
| Publisher app source | `apps/hb-webparts/src/webparts/projectSpotlightPublisher/` + `apps/hb-webparts/src/homepage/data/publisherAdapter/` |
| Vite app bundle | `apps/hb-webparts/dist/hb-webparts-app.js` |
| SPFx shell project | `tools/spfx-shell/` |
| Per-webpart manifest + shim sources | `tools/spfx-shell/release/manifests/` + `tools/spfx-shell/release/assets/` |
| Solution metadata | `tools/spfx-shell/config/package-solution.json` (Feature `1f447e99-…`, solution `39b8f2ea-…`) |
| Final `.sppkg` | `dist/sppkg/hb-webparts.sppkg` (also copied to `tools/spfx-shell/sharepoint/solution/hb-webparts.sppkg`) |
| Build orchestrator | `tools/build-spfx-package.ts` — wraps Vite + gulp bundle + gulp package-solution and writes the truth-proof JSONs |

## Commands executed

```
# Phase 2 — clean
rm -rf apps/hb-webparts/dist \
       tools/spfx-shell/{lib,temp,dist,release} \
       tools/spfx-shell/sharepoint/solution/hb-webparts.sppkg \
       dist/sppkg/hb-webparts.sppkg \
       dist/sppkg/hb-webparts-{package-truth,shim}-proof.json

# Phase 4+5 — build + package
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

No other commands were run that altered build inputs. Only the build orchestrator wrote to `tools/spfx-shell/**` and `dist/sppkg/**`.

## Issues encountered

- `tools/spfx-shell/config/package-solution.json` `componentIds` array ordering did not match the orchestrator's canonical order (the Wave 9 in-session commit appended the publisher id to the end). The orchestrator **re-normalized** the order on its own during the package-solution step; no manual fix was required.
- No compile blockers. No runtime warnings beyond the standard SPFx build output.
- The package-solution.json edit noted mid-run was the orchestrator's own normalization and is committed with the build artifacts.

## Fixes applied

None beyond the orchestrator's automatic `componentIds` reorder (it sorts into its canonical layout and re-emits the file). The file's post-build content keeps the publisher id at the canonical inserted position.

## Package output

| Fact | Value |
|------|-------|
| Final sppkg | `/Users/bobbyfetting/hb-intel/dist/sppkg/hb-webparts.sppkg` |
| Size | 3,282,297 bytes (≈3,205.4 KB) |
| Mtime | 2026-04-13 19:10 local |
| SHA-256 | `5e4523b2419f2239dbd0055634c8d8581846a6a66a80d6ab82ab19a9085ffc71` |
| Shell-staged copy | `/Users/bobbyfetting/hb-intel/tools/spfx-shell/sharepoint/solution/hb-webparts.sppkg` (same bytes) |
| Package-truth proof | `dist/sppkg/hb-webparts-package-truth-proof.json` |
| Shim proof | `dist/sppkg/hb-webparts-shim-proof.json` |
| App bundle sha-prefix | `hb-webparts-app-7657b695.js` (sha-256 prefix `7657b695…`) — old bundle `hb-webparts-app-73ee2a53.js` replaced |
| Shell-entry shims included | 18 (one per included webpart), incl. `shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-d1911a26.js` for Project Spotlight Publisher |
| Package feature | `1.0.0.219` |
| Package solution | `1.0.0.208` |

Orchestrator post-build assertions (from the stdout tail):

```
✓ Packaged shim files (18): … shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-d1911a26.js …
✓ 1a6f8b2c... supportsFullBleed: true preserved
✓ .sppkg structure verified
✓ Packaged bundle freshness verified (hb-webparts-app-7657b695.js, sha256:7657b695b7a0...)
✓ Packaged shell asset references hb-webparts-app-7657b695.js and __hbIntel_hbWebparts
✓ Shim proof written
✓ Package-truth proof written
✅ hb-webparts.sppkg (3205.4 KB)
```

## Proof of freshness

1. **Timestamp parity.** The Vite app bundle (`apps/hb-webparts/dist/hb-webparts-app.js`) mtime is `2026-04-13 19:10`; the emitted `hb-webparts.sppkg` mtime is the same minute. Both were produced in this session after the `rm -rf` clean. No pre-existing artifact could survive that delete.
2. **Hash parity.** The Vite bundle sha-256 `7657b695…` matches the copy packaged inside the sppkg (`ClientSideAssets/hb-webparts-app-7657b695.js` — the filename hash IS the sha-256 prefix). The previous sppkg referenced `hb-webparts-app-73ee2a53.js`; that filename no longer exists anywhere.
3. **Publisher webpart inclusion.** `unzip -l dist/sppkg/hb-webparts.sppkg` shows:
   - `1f447e99-…/WebPart_1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10.xml`
   - `ClientSideAssets/shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-d1911a26.js`
4. **Truth-proof expected=actual for the publisher manifest.** Excerpt:
   ```
   "manifestId": "1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10"
   "expected": "ProjectSpotlightPublisherWebPart", "actual": "ProjectSpotlightPublisherWebPart"
   "expected": "shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-d1911a26.js",
   "actual":   "shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-d1911a26.js"
   ```
5. **No stale hb-webparts.sppkg survived the clean.** Pre-build `ls` showed the file; post-`rm` `ls` confirmed deletion; post-build `ls` shows a file with a 2026-04-13 19:10 mtime. That mtime sequence cannot be faked by a cached artifact.

## Residual risks

| # | Risk | Status / mitigation |
|---|------|---------------------|
| 1 | SharePoint Pages REST write path (`pageCreationService`) is code-compiled but untested on a live tenant. | Hosted verification runbook at `evidence/hosted-verification-runbook.md` must execute on the ProjectSpotlight tenant. |
| 2 | TeamViewer webpart still reads legacy `HB Article Team Members` list; publisher writes `Project Spotlight Post Team Members`. A published page will render TeamViewer with no members until the migration prompt lands. | Tracked since Wave 2; disclosed in `wave-08-teamviewer-closure.md §7` and `wave-09-testing-hosted-vetting-build-proof.md §8`. |
| 3 | Publisher lists must be provisioned on HBCentral before the publisher webpart can read/write. | Run `packages/sharepoint-docs/infrastructure/provision-project-spotlight-publisher-lists.ps1` before hosted run. |
| 4 | Wave 1 blocking unknowns #3 (photo hydration timing), #4 (publish principal), #6 (scheduled publishing), #7 (gallery layout variant) remain open. | Phase-01 v1 does not require them; flagged in `implementation-tracker.md` for future waves. |
| 5 | Wider app vitest suite has 17 pre-existing failures unrelated to publisher work. | Stash/reset baseline confirms pre-existence. Out of scope for Phase-01. |
| 6 | Architecture docs `00-10` and related shell files are modified in working tree since session start. None are touched by this commit. | Noted; owned by the architecture author and left to their workflow. |

## Recommended next step

Deploy `dist/sppkg/hb-webparts.sppkg` to the HBCentral App Catalog, run `provision-project-spotlight-publisher-lists.ps1` on HBCentral, then execute the runbook at `evidence/hosted-verification-runbook.md` against `/sites/ProjectSpotlight`. When the five-fact closure gate from `definition-of-done-adoption.md §3` is satisfied, commit the captured evidence bundle as `evidence/wave-09-hosted-verification-results/` and flip the tracker's Wave 9 row to ✅.

---

## Build ownership — one-screen summary

```
apps/hb-webparts/src/webparts/projectSpotlightPublisher/
  ProjectSpotlightPublisher.tsx
  ProjectSpotlightPublisherWebPart.manifest.json   ← source manifest
  runtimeContract.ts                               ← webpart id literal

tools/spfx-shell/
  config/package-solution.json                     ← solution/feature versions + componentIds
  release/manifests/1a6f8b2c-…manifest.json        ← release-staged manifest
  release/assets/shell-entry-1a6f8b2c-…js          ← per-webpart shim (fresh this build)
  release/assets/hb-webparts-app-7657b695.js       ← Vite app bundle (fresh this build)
  sharepoint/solution/hb-webparts.sppkg            ← gulp package-solution output

dist/sppkg/
  hb-webparts.sppkg                                ← final deployable artifact
  hb-webparts-package-truth-proof.json             ← expected==actual manifest checks
  hb-webparts-shim-proof.json                      ← shim-file fingerprints
```
