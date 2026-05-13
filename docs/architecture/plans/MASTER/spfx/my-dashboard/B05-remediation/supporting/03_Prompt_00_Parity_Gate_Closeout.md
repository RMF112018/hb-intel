# Prompt 00 Closeout — My Dashboard Repo Truth & SPPKG Parity Gate

**Audit date:** 2026-05-13
**Operator:** RMF (`bfetting@outlook.com`)
**Scope:** Read-only parity audit. No code, manifest, or build edits performed.

---

## 1. Parity Verdict

**PASS — source and package posture reconciled.**

The local `.sppkg` artifacts present in the working tree are rebuilt copies that match current repo source at the working-tree state (`solution.version`, feature `version`, and webpart manifest `version` all at `1.0.0.005`). The bundled My Dashboard JS contains the Adobe OAuth start seam, all three protected `my-work/me/...` routes, and the runtime config field names — proving the bundle was built from source **at or after HEAD `400bc1f0d`** (which landed the read-model client OAuth start method).

The previously observed runtime-injection gap (shell asset lacks usable `functionAppUrl` / `apiAudience` values) **reproduces in the current local artifact**, but this is a **build-input gap**, not a source-vs-package drift. It is the explicit target of **Prompt 01** (`Harden_My_Dashboard_Production_Runtime_Config_And_SPPKG_Packaging`) and does NOT block proceeding.

**Decision:** Prompts 01–06 may proceed with **current `main` source (HEAD `400bc1f0d`) plus the uncommitted working-tree version bumps to `1.0.0.005`** as the authoritative remediation basis.

---

## 2. Branch / HEAD / Working Tree

| Field          | Value                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Branch         | `main`                                                                                          |
| HEAD           | `400bc1f0d1a52d270ce2dad37879ea6bf1d5b297`                                                      |
| HEAD subject   | `feat(my-dashboard): add Connect Adobe Sign CTA + read-model client OAuth start method`         |
| Modified files | 3 (all manifest/solution version bumps `1.0.0.003 → 1.0.0.005`)                                 |
| Untracked      | `docs/architecture/plans/MASTER/spfx/my-dashboard/B05-remediation/` (the prompt package itself) |

### Modified Files (working-tree diff vs HEAD)

| File                                                                          | Change                                                                                                     |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `apps/my-dashboard/config/package-solution.json`                              | `solution.version` and `features[0].version`: `1.0.0.003` → `1.0.0.005`                                    |
| `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json` | `version`: `1.0.0.003` → `1.0.0.005`                                                                       |
| `tools/spfx-shell/config/package-solution.json`                               | `solution.version` and `features[0].version`: `1.0.0.003` → `1.0.0.005` (mirrors `apps/` package-solution) |

### Recent Commits (oldest → newest, last 10)

```
b6d377e1a fix(my-projects): persist truthful legacy fallback match states
04cc9ee22 feat(my-projects): add project-links read-model contracts and fixtures
f9cda594e feat(my-projects): implement project-links backend provider and reconciliation engine
7085bd6f3 feat(my-dashboard): wire Adobe OAuth code exchange and grant callback persistence
2ab3dbbe4 feat(my-projects): register protected project-links read-model route
67bd713e5 feat(my-projects): connect frontend read-model clients to project-links route
8e56cfd64 test(my-work): add live refresh client coverage
ab6b50872 style(my-work): prettier-format Adobe live refresh client test
b2e5dce08 feat(my-dashboard): wire live Adobe Sign search provider into My Work routes
400bc1f0d feat(my-dashboard): add Connect Adobe Sign CTA + read-model client OAuth start method  ← HEAD
```

---

## 3. Source My Dashboard Version Truth

| Layer                                                                                   | At HEAD     | In working tree | Rationale                                                                            |
| --------------------------------------------------------------------------------------- | ----------- | --------------- | ------------------------------------------------------------------------------------ |
| `apps/my-dashboard/config/package-solution.json` `solution.version`                     | `1.0.0.003` | `1.0.0.005`     | Working-tree bump (uncommitted), already baked into local `.sppkg`                   |
| `apps/my-dashboard/config/package-solution.json` `features[0].version`                  | `1.0.0.003` | `1.0.0.005`     | Same                                                                                 |
| `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json` `version` | `1.0.0.003` | `1.0.0.005`     | Same                                                                                 |
| `tools/spfx-shell/config/package-solution.json` (both versions)                         | `1.0.0.003` | `1.0.0.005`     | Mirrors `apps/my-dashboard/config/package-solution.json`; shell build uses this copy |

**IDs (stable across both source and package, all artifacts):**

- Solution ID: `2f47bece-2668-4a02-a2ac-4e86eb3970a2`
- Feature ID: `7a8b5491-bd3b-4fdd-8acd-81008bb4a64a`
- WebPart component ID: `412eb9fd-2eb2-4f7d-a4f1-7865e339a369`

---

## 4. Artifact Version Truth

### Artifacts Discovered

| Path                                                               | SHA-256                                                            | Notes                                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `dist/sppkg/hb-intel-my-dashboard.sppkg`                           | `ae4acbd27d47edf16fdb65d82b2271af7bf0994ba68675f5521f4abe420a8411` | Primary build output                                                                            |
| `tools/spfx-shell/sharepoint/solution/hb-intel-my-dashboard.sppkg` | `ae4acbd27d47edf16fdb65d82b2271af7bf0994ba68675f5521f4abe420a8411` | **Byte-identical copy** of the dist artifact (same hash) — one logical artifact under two paths |

Both files report internal entry timestamps of `05-13-2026 17:42` (today, prior to this audit).

### Embedded Version Markers (identical in both artifacts)

| Manifest entry                                       | Value                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| `AppManifest.xml` `App[@Version]`                    | `1.0.0.005`                                                                    |
| `AppManifest.xml` `App[@ProductID]`                  | `2f47bece-2668-4a02-a2ac-4e86eb3970a2` (matches solution ID)                   |
| `feature_7a8b5491-...xml` `Feature[@Version]`        | `1.0.0.005`                                                                    |
| `feature_7a8b5491-...xml` `Feature[@Id]`             | `7a8b5491-bd3b-4fdd-8acd-81008bb4a64a` (matches feature ID)                    |
| `WebPart_412eb9fd-...xml` `ClientSideComponent[@Id]` | `412eb9fd-2eb2-4f7d-a4f1-7865e339a369` (matches webpart ID)                    |
| `WebPart_...xml` ComponentManifest `version`         | `1.0.0` (SPFx component-loader semver — distinct from package version, normal) |
| `WebPart_...xml` `entryModuleId`                     | `412eb9fd-2eb2-4f7d-a4f1-7865e339a369_1.0.0`                                   |
| `WebPart_...xml` entry script path                   | `shell-entry-412eb9fd-2eb2-4f7d-a4f1-7865e339a369-0a289c25.js`                 |

### Artifact ↔ Source Version Conclusion

- Artifact carries `1.0.0.005` in `AppManifest.xml` and feature XML.
- Source at HEAD carries `1.0.0.003`.
- Source in working tree carries `1.0.0.005`.
- **Artifact matches working-tree source, not HEAD.** It was built locally after applying the version bump.

### Bundled Asset Inventory (identical in both artifacts)

| File                                                      | Size (bytes) | Role                                                   |
| --------------------------------------------------------- | ------------ | ------------------------------------------------------ |
| `ClientSideAssets/my-dashboard-app-52fdbef7.js`           | 231,442      | My Dashboard React/app bundle (Vite-built app payload) |
| `ClientSideAssets/shell-entry-412eb9fd-...-0a289c25.js`   | 24,602       | SPFx shell webpart entry (gulp-built)                  |
| `ClientSideAssets/shell-web-part_0170e843abda0f02814d.js` | 24,602       | Duplicate of shell-entry under loader-friendly name    |
| `ClientSideAssets/spfx-my-dashboard-5c4aae11.css`         | 11,242       | App CSS                                                |

> **Finding:** `shell-entry-...-0a289c25.js` and `shell-web-part_0170e843...js` have **identical SHA-256** (`0a289c2582375fcf74001d8bd9d57124844900df8c8eaf8c35740b206a711a4e`). The shell webpart bundle is mirrored under two filenames in the same package — this is expected SPFx loader plumbing.

---

## 5. Runtime-Marker Truth

### My Dashboard App Bundle (`my-dashboard-app-52fdbef7.js`)

| Marker                                                                  | Occurrences      | Posture                                                               |
| ----------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| `functionAppUrl` (config field name)                                    | 5                | ✓ present                                                             |
| `apiAudience` (config field name)                                       | 4                | ✓ present                                                             |
| `backendMode` (config field name)                                       | 4                | ✓ present                                                             |
| `oauth/start`                                                           | 1                | ✓ present (route path literal)                                        |
| `authorizationUrl`                                                      | 4                | ✓ present                                                             |
| `my-work/me/home`                                                       | (via broad grep) | ✓ present                                                             |
| `my-work/me/adobe-sign`                                                 | (via broad grep) | ✓ present                                                             |
| `my-work/me/project-links`                                              | (via broad grep) | ✓ present                                                             |
| `FUNCTION_APP_URL` / `API_AUDIENCE` / `BACKEND_MODE` (uppercase tokens) | present          | Likely env-name string literals in code (not unreplaced placeholders) |

**Conclusion for app bundle:** Carries the Adobe OAuth start client method, all three protected My Work routes, and the runtime-config-field surface. Matches current source.

### Shell Webpart Bundle (`shell-entry-...-0a289c25.js` / `shell-web-part_...js`)

| Marker                                                                                     | Occurrences                                                                                      | Posture                                                                |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `functionAppUrl` literal                                                                   | **0**                                                                                            | ❌ NOT injected as bundled value                                       |
| `apiAudience` literal                                                                      | **0**                                                                                            | ❌ NOT injected as bundled value                                       |
| `backendMode` token                                                                        | present                                                                                          | Token referenced (assignment target)                                   |
| `__FUNCTION_APP_URL__` / `__API_AUDIENCE__` / `__BACKEND_MODE__` (unreplaced placeholders) | **0**                                                                                            | Build-time define substitution **did run**, but with empty / no values |
| HTTPS URLs in bundle                                                                       | `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` and example/foleon placeholders only | ❌ NO function-app URL embedded                                        |

> **Reproduces prior audit Finding #5:** "uploaded `.sppkg` artifact appeared to lack usable `functionAppUrl` and `apiAudience` runtime injection, preventing SPFx API token-provider creation."
>
> Mechanism: `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` assigns `runtimeConfig.functionAppUrl = __FUNCTION_APP_URL__` etc. (lines 367, 376). At build time these globals are substituted by the gulp/Vite `define` plumbing in `tools/build-spfx-package.ts`. The build script (lines 1409–1416, 1476–1483) only **validates** the substituted values are present when the corresponding env var is supplied — when `FUNCTION_APP_URL` / `API_AUDIENCE` are empty/unset, the validation is skipped and the package is built without those values, producing the current state.
>
> **Classification:** This is a **build-input gap**, not a source/package drift. It is the explicit target of `Prompt_01_Harden_My_Dashboard_Production_Runtime_Config_And_SPPKG_Packaging.md`.

---

## 6. Drift Summary

### Source ↔ Local `.sppkg` Drift

| Concern                                                                     | Status                                                                     |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Solution / feature / webpart IDs                                            | ✓ aligned                                                                  |
| Package version (AppManifest + feature XML) vs source                       | ✓ aligned at `1.0.0.005` (matches working-tree, not HEAD)                  |
| Webpart code seams (OAuth start, 3 protected routes, runtime config fields) | ✓ present in bundle, aligned with current source                           |
| Adobe OAuth start client method (HEAD `400bc1f0d` deliverable)              | ✓ present in app bundle                                                    |
| Shell runtime-config injection (`functionAppUrl`, `apiAudience`)            | ❌ absent in shell bundle — **build-input gap, not source drift**          |
| Backend mode injection in shell bundle                                      | partial — token referenced but no quoted enum value confirmed in this scan |

### Source ↔ Tenant-Uploaded `.sppkg`

**Not verifiable in this audit.** No tenant-uploaded artifact is available locally for inspection. If the tenant-deployed package is a stale earlier build, that is an operator-side rollout reconciliation (re-upload current `dist/sppkg/hb-intel-my-dashboard.sppkg`) and not in scope for Prompts 01–06.

### Working-Tree Bump Reconciliation

The `1.0.0.003 → 1.0.0.005` version bumps are uncommitted but already baked into the local `.sppkg`. Authority decision below covers how Prompt 01 should treat them.

---

## 7. Authority Decision (governs Prompts 01–06)

The remediation authority for downstream prompts is:

> **Current `main` HEAD (`400bc1f0d`) plus the uncommitted working-tree version bumps to `1.0.0.005` (3 files listed in §2).**

Operative implications:

1. Prompt 01 should treat `1.0.0.005` as the active package version posture and decide (with operator confirmation) whether to:
   - keep `1.0.0.005` and re-bump again if Prompt 01 lands manifest-affecting changes,
   - or rebase the version bump into a single commit alongside the runtime-config hardening.
2. Prompt 01 must close the build-input gap: ensure `FUNCTION_APP_URL`, `API_AUDIENCE`, and `BACKEND_MODE=production` are supplied at build time so the shell bundle carries usable runtime config injection. The existing build-script assertions at `tools/build-spfx-package.ts:1409–1416` and `:1476–1483` should be tightened to **require** these values when targeting production packaging (currently they short-circuit when env vars are empty).
3. Prompt 01 should not re-litigate solution / feature / webpart IDs — they are stable and confirmed in both source and artifact.
4. Prompts 02–06 may consume the live OAuth start client (`POST /api/my-work/me/adobe-sign/oauth/start`) as authoritative — it is present in source (`myWorkBackendReadModelClient.ts:42`, `myWorkReadModelClient.ts:42-57`) and bundled into the artifact.
5. The duplicate `tools/spfx-shell/sharepoint/solution/hb-intel-my-dashboard.sppkg` is a byte-identical copy of `dist/sppkg/hb-intel-my-dashboard.sppkg`. Operators should standardize on the `dist/sppkg/` location as the canonical build output; the shell copy is a working artifact and may be regenerated freely.

---

## 8. Residual Risk & Recommended Next Prompt

### Residual Risk

- **Tenant-uploaded artifact unverified.** This audit only confirms parity between source and the _local_ `.sppkg`. If the tenant has a stale earlier version deployed, a fresh upload (using a Prompt-01-rebuilt artifact with full runtime-config injection) is required. Flag as operator-side cutover, not in-scope for source remediation.
- **Working-tree version bumps are uncommitted.** If Prompt 01 lands additional changes, the version bump may need to roll forward (`1.0.0.006`) or be folded into a single closeout commit. Recommend operator confirms the bump strategy before Prompt 01 begins.
- **Build-input gap silently passes.** Current `tools/build-spfx-package.ts` validation skips when env vars are empty — packages can ship without runtime config and the validator says nothing. Prompt 01 should make these checks fail-loud for production targets.

### Recommended Next Prompt

**Proceed to `Prompt_01_Harden_My_Dashboard_Production_Runtime_Config_And_SPPKG_Packaging.md`.**

Prompt 01 should be scoped to:

1. Tighten `tools/build-spfx-package.ts` to require non-empty `FUNCTION_APP_URL` / `API_AUDIENCE` / `BACKEND_MODE` for production targets and to assert the resulting shell bundle contains the literal values.
2. Document the canonical packaging command line (with required env vars) in a packaging README or `tools/build-spfx-package.ts` header.
3. Decide and apply the version-bump roll-forward strategy (operator-confirmed).
4. Rebuild `.sppkg` with full runtime-config injection and re-verify shell bundle marker presence.

No changes to backend OAuth code, frontend surface routing, or readiness wiring should occur in Prompt 01 — those are reserved for Prompts 02–06.

---

## Appendix A — Evidence Commands Used

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git log --oneline -10
git diff apps/my-dashboard/config/package-solution.json apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json tools/spfx-shell/config/package-solution.json

find /Users/bobbyfetting/hb-intel -name "*.sppkg" -not -path "*/node_modules/*"
shasum -a 256 <both sppkg paths>

# Per-artifact (extracted to /tmp/sppkg-parity/{dist,shell}/):
unzip -l <sppkg>
unzip -o -q <sppkg> -d <tmpdir>
cat <tmpdir>/AppManifest.xml
cat <tmpdir>/feature_7a8b5491-...xml
cat <tmpdir>/7a8b5491-.../WebPart_412eb9fd-...xml
shasum -a 256 <tmpdir>/ClientSideAssets/shell-entry-...js <tmpdir>/ClientSideAssets/shell-web-part_...js

# Bundle marker counts (per token):
grep -oc "<token>" <bundle.js>

# Targeted source seam grep:
rg -n "oauth/start|authorizationUrl|adobeSignAuthorization|functionAppUrl|apiAudience|backendMode" \
  apps/my-dashboard/src tools/build-spfx-package.ts tools/spfx-shell/src
```

## Appendix B — Source Seam Locations Confirmed

| Seam                                                                   | Location                                                                                                                                                 |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adobe OAuth start client method                                        | `apps/my-dashboard/src/api/myWorkReadModelClient.ts:42-57`, `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts:42, 214-220`                      |
| Adobe Sign Connect CTA (navigates to `authorizationUrl`)               | `apps/my-dashboard/src/shell/MyWorkShell.tsx:91`                                                                                                         |
| Runtime config schema (`functionAppUrl`, `apiAudience`, `backendMode`) | `apps/my-dashboard/src/config/runtimeConfig.ts:10-198`, `apps/my-dashboard/src/mount.tsx:24-82`                                                          |
| Shell webpart runtime-config injection assignments                     | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts:367-376`                                                                                            |
| Build-time runtime-marker validation                                   | `tools/build-spfx-package.ts:1391-1483`                                                                                                                  |
| Read-model client factory backend-mode branching                       | `apps/my-dashboard/src/api/myWorkReadModelClientFactory.test.ts:93-94` (test confirms `backendMode=production` + `functionAppUrl` activates live client) |
