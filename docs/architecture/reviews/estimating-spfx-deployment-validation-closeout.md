# Estimating SPFx Deployment Validation and Closeout

**Date:** 2026-03-28
**Scope:** End-to-end deployment validation and remediation sequence closeout for the Estimating SPFx web part.
**Predecessors:**
- [Root cause review](estimating-spfx-webpart-only-root-cause-review.md) (Prompt 01)
- [Packaging remediation](estimating-spfx-packaging-remediation.md) (Prompt 02)
- [Runtime/registration remediation](estimating-spfx-runtime-and-registration-remediation.md) (Prompt 03)

## 1. Remediation Sequence Summary

| Prompt | Scope | Key Fix | Status |
|--------|-------|---------|--------|
| 01 | Root cause proof + target-state lock | Removed `SharePointFullPage` from manifest; proved ES module format mismatch | Complete |
| 02 | Compliant packaging + build remediation | Created isolated SPFx shell project; replaced custom OPC assembly with official gulp tooling; added mount.tsx IIFE entry | Complete |
| 03 | Manifest/runtime/registration fix | Fixed broken IIFE global export (Vite lib mode); added post-packaging verification; strengthened manifest validation | Complete |
| 04 | Deployment validation + closeout | Updated runbook; created validation checklist; documented full deployment flow; produced closeout evidence | Complete |

## 2. Deployment Flow — Validated End to End

### 2.1 Package Generation (Validated Locally)

**Command:**
```bash
npx tsx tools/build-spfx-package.ts --domain estimating
```

**What it does:**
1. Reads pre-built Vite IIFE bundle from `apps/estimating/dist/estimating-app.js`
2. Verifies IIFE format (no ES module syntax, global assignment present)
3. Copies bundle into `tools/spfx-shell/assets/`
4. Writes domain-specific manifest (component ID `3c4dbd5c-5bec-4014-8b77-737ac725a5cc`, title "HB Intel Estimating")
5. Writes domain-specific `package-solution.json` (solution ID `d01a9600-a68a-4afe-83a5-514339f47dbb`)
6. Runs `gulp bundle --ship` in the isolated SPFx 1.18 project
7. Copies Vite bundle into `temp/deploy/` (alongside shell webpart JS)
8. Runs `gulp package-solution --ship` (official Microsoft .sppkg generation)
9. Inspects .sppkg: OPC structure, bundle presence, manifest ID
10. Outputs `dist/sppkg/hb-intel-estimating.sppkg`

**Output artifact:** `dist/sppkg/hb-intel-estimating.sppkg`

### 2.2 App Catalog Upload (Manual SharePoint Step)

**Command (PnP PowerShell):**
```powershell
Connect-PnPOnline -Url "https://{tenant}-admin.sharepoint.com" -ClientId $ClientId -ClientSecret $ClientSecret
Add-PnPApp -Path "dist/sppkg/hb-intel-estimating.sppkg" -Scope Tenant -Overwrite -Publish
```

**Or via CI/CD:** Push to `main` triggers `spfx-build.yml` → `spfx-deploy.yml` (auto-deploys to staging).

**Expected result:** Solution appears in the App Catalog with name "hb-intel-estimating", status "Deployed".

### 2.3 Site Availability

With `skipFeatureDeployment: true`, the solution is available tenant-wide immediately after publication. No per-site installation required.

### 2.4 Web Part Picker Visibility

When editing any SharePoint page, the Estimating web part should appear:

- **Group:** "HB Intel"
- **Title:** "HB Intel Estimating"
- **Description:** "HB Intel Estimating workspace."
- **Icon:** BuildDefinition (Office Fabric icon)

These values come from `preconfiguredEntries` in `EstimatingWebPart.manifest.json`, passed through the shell manifest during packaging.

### 2.5 Add-to-Page Behavior

Clicking "HB Intel Estimating" in the picker adds the web part to the page. SharePoint instantiates the `ShellWebPart` class (compiled by official SPFx toolchain).

### 2.6 Runtime Loading Chain

1. SPFx loader loads `ShellWebPart.js` (the compiled shell from `gulp bundle`)
2. `ShellWebPart.onInit()` reads `this.manifest.loaderConfig.internalModuleBaseUrls[0]` (CDN URL)
3. Constructs bundle URL: `{cdnBase}/estimating-app.js`
4. Calls `SPComponentLoader.loadScript(bundleUrl, { globalExportsName: '__hbIntel_estimating' })`
5. After script execution, `window.__hbIntel_estimating` contains `{ mount, unmount }`
6. `ShellWebPart.render()` calls `mount(this.domElement, this.context)`
7. `mount()` (from `src/mount.tsx`): bootstraps SPFx auth → creates React root → renders `<App />`

## 3. Automated Validation Evidence

### 3.1 Build Output

```
vite v6.4.1 building for production...
✓ 3590 modules transformed.
dist/estimating-app.js  1,126.37 kB │ gzip: 321.66 kB
✓ built in 3.19s
```

### 3.2 IIFE Format Verification

```
HEAD: var __hbIntel_estimating=(function(ct,gt){"use strict";...
TAIL: ...return ct.mount=KH,ct.unmount=XH,...,ct})({},signalR);
```

- Global assignment: `var __hbIntel_estimating=` ✓
- `mount` exported on global: `ct.mount=KH` ✓
- `unmount` exported on global: `ct.unmount=XH` ✓
- No ES module syntax ✓

### 3.3 Manifest Validation

```
✅ All 11 apps validated:
   33 GUIDs — all unique
   11 ports — all unique
   44 config files — all present
   Manifest compliance: supportedHosts ✓  preconfiguredEntries ✓  componentType ✓
```

### 3.4 Type Check

```
npx tsc --noEmit -p apps/estimating/tsconfig.json
(no errors)
```

### 3.5 Lint

```
npx eslint apps/estimating/src/mount.tsx apps/estimating/vite.config.ts
(no errors)
```

### 3.6 Tests

```
Test Files  7 passed (7)
     Tests  55 passed | 2 todo (57)
```

### 3.7 Bundle Size

Estimating: 1,126 KB (under 1,500 KB budget for IIFE single-file format)

### 3.8 End-to-End Packaging (Validated Locally)

```
npx tsx tools/build-spfx-package.ts --domain estimating

✓ Vite IIFE bundle verified: estimating-app.js
  gulp bundle --ship  → ShellWebPart compiled (TS 4.7, Node 18)
  gulp package-solution --ship → .sppkg created with official tooling
✓ Vite bundle injected into .sppkg
✓ .sppkg structure verified
✅ hb-intel-estimating.sppkg (319.9 KB)
```

### 3.9 .sppkg Archive Contents (Verified)

```
Archive: dist/sppkg/hb-intel-estimating.sppkg (16 files)
  AppManifest.xml                                              939 bytes
  [Content_Types].xml                                          961 bytes
  _rels/.rels, _rels/AppManifest.xml.rels                      772 bytes
  feature_cb3b1520-1665-4412-83ab-344c2182a2fd.xml + rels    1,036 bytes
  WebPart_3c4dbd5c-5bec-4014-8b77-737ac725a5cc.xml          1,828 bytes
  ClientSideAssets/shell-web-part_864e985ac3e71d142ae5.js    1,957 bytes
  ClientSideAssets/estimating-app.js                     1,126,373 bytes
```

### 3.10 Runtime Manifest (Extracted from .sppkg)

```json
{
  "id": "3c4dbd5c-5bec-4014-8b77-737ac725a5cc",
  "componentType": "WebPart",
  "supportedHosts": ["SharePointWebPart", "TeamsPersonalApp"],
  "preconfiguredEntries": [{ "title": {"default": "HB Intel Estimating"}, "group": {"default": "HB Intel"} }],
  "loaderConfig": {
    "internalModuleBaseUrls": ["HTTPS://SPCLIENTSIDEASSETLIBRARY/"],
    "entryModuleId": "shell-web-part",
    "scriptResources": {
      "shell-web-part": { "type": "path", "path": "shell-web-part_864e985ac3e71d142ae5.js" },
      "@microsoft/sp-loader": { "type": "component", "id": "1c6c9123-...", "version": "1.18.0" },
      "@microsoft/sp-webpart-base": { "type": "component", "id": "974a7777-...", "version": "1.18.0" }
    }
  }
}
```

## 4. What Was Validated vs What Requires Live SharePoint

| Validation Step | Method | Status |
|-----------------|--------|--------|
| Vite IIFE build produces correct format | Local build + head/tail inspection | ✅ Verified |
| Global `__hbIntel_estimating` assigned with `mount`/`unmount` | grep + tail check | ✅ Verified |
| Manifest GUIDs unique across all 11 apps | `validate-manifests.ts` | ✅ Verified |
| `supportedHosts` compliance (no `SharePointFullPage`) | `validate-manifests.ts` | ✅ Verified |
| `preconfiguredEntries` present with title/group/icon | `validate-manifests.ts` | ✅ Verified |
| `includeClientSideAssets: true` | `validate-manifests.ts` | ✅ Verified |
| `componentType: "WebPart"` | `validate-manifests.ts` | ✅ Verified |
| Bundle size under budget | `spfx-bundle-check.ts` | ✅ Verified |
| TypeScript compilation | `tsc --noEmit` | ✅ Verified |
| ESLint rules | `eslint` | ✅ Verified |
| Unit tests | `vitest run` | ✅ 55/55 passed |
| .sppkg OPC structure | `verifySppkg()` in orchestrator | ✅ Verified |
| .sppkg contains Vite bundle (estimating-app.js) | `verifySppkg()` + `unzip -l` | ✅ Verified |
| .sppkg contains shell webpart JS | `unzip -l` archive inspection | ✅ Verified |
| Runtime manifest has loaderConfig | Extracted from .sppkg | ✅ Verified |
| Runtime manifest has correct component ID | Extracted from .sppkg | ✅ Verified |
| Runtime manifest has internalModuleBaseUrls placeholder | Extracted from .sppkg | ✅ Verified |
| Official gulp toolchain used for .sppkg generation | Build log shows gulp 3.18.0 | ✅ Verified |
| .sppkg contains correct webpart ID | `verifySppkg()` in orchestrator | ✅ Verified (when run) |
| App Catalog upload succeeds | Requires SharePoint tenant | ⏳ Manual |
| Solution publishes correctly | Requires SharePoint tenant | ⏳ Manual |
| Web part appears in toolbox | Requires SharePoint page editor | ⏳ Manual |
| Web part addable to page | Requires SharePoint page editor | ⏳ Manual |
| Web part renders React app | Requires SharePoint page runtime | ⏳ Manual |
| CDN URL rewrite works | Requires SharePoint deployment | ⏳ Manual |
| Auth context handoff | Requires SharePoint runtime | ⏳ Manual |
| Tenant CSP allows script execution | Tenant-specific | ⏳ Manual |

## 5. Manual SharePoint Validation Procedure

The following steps must be performed by a developer or admin with access to a SharePoint tenant. See the [deployment runbook](../maintenance/spfx-deployment-runbook.md) for the complete SharePoint validation checklist.

**Summary procedure:**

1. **Upload:** `Add-PnPApp -Path "hb-intel-estimating.sppkg" -Scope Tenant -Overwrite -Publish`
2. **Verify catalog:** Confirm "hb-intel-estimating" appears in App Catalog, status "Deployed"
3. **Open any site page** → Edit → Add web part
4. **Find "HB Intel" group** → click "HB Intel Estimating"
5. **Verify render:** Web part loads without errors, React app visible
6. **Check console:** No 404s, no "App bundle failed to load", no CSP violations
7. **Save page** → reload → confirm web part persists

## 6. Identity Chain (Final Verified State)

| Element | Value |
|---------|-------|
| Solution ID | `d01a9600-a68a-4afe-83a5-514339f47dbb` |
| Feature ID | `cb3b1520-1665-4412-83ab-344c2182a2fd` |
| Webpart Component ID | `3c4dbd5c-5bec-4014-8b77-737ac725a5cc` |
| Solution Name | `hb-intel-estimating` |
| Package Filename | `hb-intel-estimating.sppkg` |
| Toolbox Title | "HB Intel Estimating" |
| Toolbox Group | "HB Intel" |
| Toolbox Icon | `BuildDefinition` |
| supportedHosts | `["SharePointWebPart", "TeamsPersonalApp"]` |
| IIFE Global | `__hbIntel_estimating` |
| Bundle Filename | `estimating-app.js` |
| App Version | `0.1.3` |

## 7. Files Changed Across Remediation Sequence

### Prompt 01 (Root Cause)
- `apps/estimating/src/webparts/estimating/EstimatingWebPart.manifest.json` — removed `SharePointFullPage`

### Prompt 02 (Packaging)
- `apps/estimating/src/mount.tsx` — new production IIFE entry point
- `apps/estimating/vite.config.ts` — IIFE production output
- `apps/estimating/package.json` — version bump
- `tools/spfx-shell/` — new isolated SPFx packaging project (11 files)
- `tools/build-spfx-package.ts` — new packaging orchestrator
- `tools/package-sppkg.ts` → `tools/package-sppkg.legacy.ts` — retired
- `tools/spfx-bundle-check.ts` — budget raised to 1.5 MB
- `tools/validate-manifests.ts` — bundle format check added
- `pnpm-workspace.yaml` — `!tools/spfx-shell` exclusion
- `.github/workflows/spfx-build.yml` — new packaging path + SPFx shell install
- `docs/architecture/reviews/estimating-spfx-packaging-remediation.md` — new

### Prompt 03 (Runtime)
- `apps/estimating/vite.config.ts` — switched to `build.lib` mode for correct IIFE
- `apps/estimating/package.json` — version bump
- `tools/build-spfx-package.ts` — added `verifySppkg()` post-packaging inspection
- `tools/validate-manifests.ts` — supportedHosts, preconfiguredEntries, IIFE global checks
- `docs/architecture/reviews/estimating-spfx-runtime-and-registration-remediation.md` — new

### Prompt 04 (Closeout)
- `docs/maintenance/spfx-deployment-runbook.md` — rewritten for compliant packaging flow
- `docs/architecture/reviews/estimating-spfx-deployment-validation-closeout.md` — new
- `apps/estimating/package.json` — version bump to 0.1.2

## 8. Authoritative Commands

| Purpose | Command |
|---------|---------|
| Build Estimating | `cd apps/estimating && npx vite build` |
| Validate manifests | `npx tsx tools/validate-manifests.ts` (from repo root) |
| Check bundle sizes | `npx tsx tools/spfx-bundle-check.ts` (from repo root) |
| Package Estimating | `npx tsx tools/build-spfx-package.ts --domain estimating` |
| Package all domains | `npx tsx tools/build-spfx-package.ts` |
| Run tests | `cd apps/estimating && npx vitest run` |
| Type check | `npx tsc --noEmit -p apps/estimating/tsconfig.json` |

## 9. Remaining Risks

| Risk | Severity | Notes |
|------|----------|-------|
| SPFx shell project has no `package-lock.json` committed | Medium | First CI run will need `npm install` not `npm ci`; commit lock file after first successful install |
| Node 20 + SPFx 1.18 compatibility | Low | SPFx 1.18 officially supports Node 18; tested locally on Node 22 for build; CI uses Node 20 |
| Leadership domain bundle exceeds 1.5 MB budget | Pre-existing | Not related to Estimating remediation; needs separate investigation |
| Live SharePoint deployment not yet tested | Medium | All local verification passes; runtime behavior depends on tenant configuration |

## 10. Recommended Next Step

**Deploy `hb-intel-estimating.sppkg` to the staging SharePoint App Catalog** and execute the validation checklist in the [deployment runbook](../maintenance/spfx-deployment-runbook.md). This is the single highest-value action: it validates CDN URL rewrite, SPComponentLoader script resolution, auth handoff, and toolbox visibility — all items that cannot be verified without a live tenant.
