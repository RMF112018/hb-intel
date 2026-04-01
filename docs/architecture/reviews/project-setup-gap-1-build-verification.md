# Gap 1 Build and Package Propagation Verification — SPFx Permission Declaration

> **Created:** 2026-04-01 (P9-G1-03)
> **Status:** Verified

## Objective

Verify that the `webApiPermissionRequests` declaration added to `apps/estimating/config/package-solution.json` (P9-G1-02) survives the full SPFx packaging path into the deployable `.sppkg` artifact.

---

## 1. Build Command and Result

**Command:** `npx tsx tools/build-spfx-package.ts --domain estimating`

**Result:** Build succeeded. All orchestrator stages completed without error.

| Stage | Status |
|-------|--------|
| Vite IIFE bundle | Passed — `estimating-app.js` verified |
| Content hash | Applied — `estimating-app-f72eb6c7.js` |
| Runtime smoke test | Passed — `__hbIntel_projectSetup.mount()` and `.unmount()` present |
| gulp bundle --ship | Passed — shell webpart compiled |
| gulp package-solution --ship | Passed — `.sppkg` produced |
| Orchestrator .sppkg structure verification | Passed |
| Final artifact | `hb-intel-project-setup.sppkg` (336.0 KB) |

---

## 2. Declaration Propagation Evidence

### 2.1 Source config (authoritative)

**File:** `apps/estimating/config/package-solution.json`

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-staging",
    "scope": "access_as_user"
  }
]
```

**Version:** `001.000.001`

### 2.2 Shell-side copied config

**File:** `tools/spfx-shell/config/package-solution.json`

The build orchestrator (`tools/build-spfx-package.ts`, lines 506–515) copies the domain config via shallow spread. The shell-side file contains the identical `webApiPermissionRequests` declaration with `resource: "hb-intel-api-staging"` and `scope: "access_as_user"`. Version `001.000.001` also propagated.

**Verdict:** Declaration survived source → shell copy without mutation.

### 2.3 Packaged artifact (.sppkg)

**File:** `tools/spfx-shell/sharepoint/solution/hb-intel-project-setup.sppkg`

The `.sppkg` is a ZIP archive containing `AppManifest.xml`. Extracted content:

```xml
<WebApiPermissionRequests>
  <WebApiPermissionRequest ResourceId="hb-intel-api-staging" Scope="access_as_user">
  </WebApiPermissionRequest>
</WebApiPermissionRequests>
```

The SPFx packaging pipeline correctly translated the JSON `webApiPermissionRequests` array into the XML `<WebApiPermissionRequests>` element in `AppManifest.xml`, mapping:
- `resource` → `ResourceId` attribute
- `scope` → `Scope` attribute

**Verdict:** Declaration survived shell config → .sppkg packaging without stripping or mutation.

### 2.4 AppManifest.xml version

The `AppManifest.xml` `Version` attribute is `001.000.001`, matching the source config.

---

## 3. Regression Check

| Check | Result |
|-------|--------|
| Build success | Yes — no errors |
| Shell asset reference | Correct — references `estimating-app-f72eb6c7.js` and `__hbIntel_projectSetup` |
| Vite assets in artifact | Present — `ClientSideAssets/estimating-app-f72eb6c7.js` and `ClientSideAssets/shell-web-part_3e52e53464eba915dc7b.js` |
| Feature XML | Generated correctly — feature ID `cb3b1520-1665-4412-83ab-344c2182a2fd` |
| Manifest linkage | WebPart manifest `3c4dbd5c-5bec-4014-8b77-737ac725a5cc` found and linked |
| No new warnings | BACKEND_MODE info message only (expected when env var not set locally) |

No regressions observed. The `webApiPermissionRequests` addition did not affect any other aspect of the packaging pipeline.

---

## 4. Summary

The `webApiPermissionRequests` declaration propagates faithfully through the entire packaging path:

1. **Source** (`apps/estimating/config/package-solution.json`) → JSON declaration present
2. **Shell copy** (`tools/spfx-shell/config/package-solution.json`) → JSON declaration identical
3. **Packaged artifact** (`hb-intel-project-setup.sppkg` → `AppManifest.xml`) → XML `<WebApiPermissionRequests>` element with correct `ResourceId` and `Scope` attributes

No stripping, mutation, or regression occurred. The `.sppkg` is ready for deployment to a SharePoint app catalog, where it will surface a pending API permission request for admin approval.

---

## 5. Parameterized Build Verification (P10-04)

> **Date:** 2026-04-01
> **Context:** P10-03 added `SPFX_API_RESOURCE` env var support to the build orchestrator. This section verifies parameterized builds across all three environments.

### 5.1 Build commands and environment inputs

| Environment | Command | `SPFX_API_RESOURCE` |
|-------------|---------|-------------------|
| Staging (default) | `npx tsx tools/build-spfx-package.ts --domain estimating` | Not set — source default used |
| Production | `SPFX_API_RESOURCE=hb-intel-api-production npx tsx tools/build-spfx-package.ts --domain estimating` | `hb-intel-api-production` |
| Development | `SPFX_API_RESOURCE=hb-intel-api-dev npx tsx tools/build-spfx-package.ts --domain estimating` | `hb-intel-api-dev` |

All three builds succeeded without error.

### 5.2 Propagation evidence by environment

| Environment | Source config `resource` | Shell config `resource` | `.sppkg` `AppManifest.xml` `ResourceId` | `Scope` |
|-------------|------------------------|------------------------|----------------------------------------|---------|
| Staging | `hb-intel-api-staging` | `hb-intel-api-staging` | `hb-intel-api-staging` | `access_as_user` |
| Production | `hb-intel-api-staging` (source unchanged) | `hb-intel-api-production` (overridden) | `hb-intel-api-production` | `access_as_user` |
| Development | `hb-intel-api-staging` (source unchanged) | `hb-intel-api-dev` (overridden) | `hb-intel-api-dev` | `access_as_user` |

Key observations:
- The authoritative source file (`apps/estimating/config/package-solution.json`) is never modified by the build — the override is applied to the shell copy only.
- The `scope` (`access_as_user`) is constant and correct across all environments.
- The orchestrator logs `✓ webApiPermissionRequests resource overridden: {value}` when the env var is set.
- When unset, no override message is logged and the source default propagates as-is.

### 5.3 Regression check

| Check | Staging | Production | Dev |
|-------|---------|------------|-----|
| Build success | Yes | Yes | Yes |
| Vite IIFE bundle | Verified | Verified | Verified |
| Content hash | `f72eb6c7` | `f72eb6c7` | `f72eb6c7` |
| Runtime smoke test | Passed | Passed | Passed |
| Shell asset linkage | Correct | Correct | Correct |
| .sppkg structure | Verified | Verified | Verified |
| Artifact size | 336.0 KB | 336.0 KB | 336.0 KB |

No regressions observed across any environment build. The parameterization affects only the `ResourceId` attribute in `AppManifest.xml` — all other artifact contents are identical.

### 5.4 Verdict

**All three environments verified.** The `SPFX_API_RESOURCE` build-time parameterization correctly produces environment-specific `webApiPermissionRequests` resource values in the `.sppkg` without modifying the source config, without stripping or mutation, and without regression.
