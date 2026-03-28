# Estimating SPFx Runtime and Registration Remediation Review

**Date:** 2026-03-28
**Scope:** Repair manifest/runtime continuity, toolbox visibility, and asset resolution so the Estimating webpart is discoverable and usable as a SharePoint web part.
**Predecessor:** [Packaging remediation review](estimating-spfx-packaging-remediation.md) (Prompt 02)
**Successor:** Prompt 04 — SharePoint deployment validation and closeout

## 1. What Prevented Runtime Rendering

After the Prompt 02 packaging remediation, the Estimating webpart had a compliant packaging path but the deployed webpart would not render. Investigation revealed three issues in the identity → discovery → loading → rendering chain:

### 1.1 Broken IIFE Global Export (BLOCKER)

**Root cause:** Vite 6.x ignores `rollupOptions.output.format` and `rollupOptions.output.name` when set directly — these Rollup options are not forwarded through Vite's build pipeline. The production build produced a bundle that looked like an IIFE on the surface (`})(signalR)` at the end) but never assigned exports to a global variable.

**Evidence:** `grep -c '__hbIntel_estimating' dist/estimating-app.js` returned `0`. The bundle started with raw `var` declarations instead of `var __hbIntel_estimating=(function(...)` wrapping.

**Impact:** The SPFx shell webpart's `onInit()` loaded the script via `SPComponentLoader.loadScript()` with `globalExportsName: '__hbIntel_estimating'`, but after execution, `window.__hbIntel_estimating` was `undefined`. The shell rendered "App bundle failed to load."

**Fix:** Switched from `rollupOptions.output.format`/`name` to Vite's `build.lib` mode, which is the proper mechanism for producing library-format bundles with global name assignment:

```typescript
// Before (broken):
rollupOptions: {
  output: { format: 'iife', name: '__hbIntel_estimating' }
}

// After (correct):
build: {
  lib: {
    entry: resolve(__dirname, 'src/mount.tsx'),
    name: '__hbIntel_estimating',
    formats: ['iife'],
    fileName: () => 'estimating-app.js',
  }
}
```

**Result:** Bundle now starts with `var __hbIntel_estimating=(function(ct,gt){"use strict";...` and ends with `return ct.mount=KH,ct.unmount=XH,...,ct})({},signalR);`. The `mount` and `unmount` functions are accessible via `window.__hbIntel_estimating`.

### 1.2 Missing Post-Packaging Verification

**Root cause:** The packaging orchestrator (`tools/build-spfx-package.ts`) verified the .sppkg file existed but never inspected its contents. A structurally valid .sppkg that was missing the Vite bundle or had incorrect manifests would pass undetected.

**Fix:** Added `verifySppkg()` function that extracts and inspects the .sppkg OPC archive after generation. Checks:
- OPC structure files (`[Content_Types].xml`, `_rels/.rels`, `AppManifest.xml`)
- Vite IIFE app bundle presence
- Shell webpart JS presence
- Webpart component ID in the manifest

### 1.3 Insufficient Manifest Validation

**Root cause:** `tools/validate-manifests.ts` checked only file existence, GUID uniqueness, and port uniqueness. It did not catch:
- Invalid `supportedHosts` values (the `SharePointFullPage` bug from Prompt 01 would not have been caught)
- Missing `preconfiguredEntries` (webpart invisible in toolbox)
- Missing `includeClientSideAssets` (assets not embedded in .sppkg)
- Wrong `componentType` (must be `"WebPart"`)
- Broken IIFE format (no global export verification)

**Fix:** Extended `validate-manifests.ts` with comprehensive checks:
- `supportedHosts` compliance against allowed hosts list (no `SharePointFullPage`)
- `preconfiguredEntries` presence with required fields (title, groupId, icon)
- `componentType` must be `"WebPart"`
- `includeClientSideAssets` must be `true`
- IIFE global name assignment verified at bundle head
- `mount`/`unmount` export presence verified at bundle tail

## 2. How SharePoint Now Discovers and Loads the Web Part

### Discovery (Toolbox Visibility)

1. Admin uploads `.sppkg` to App Catalog → SharePoint extracts `AppManifest.xml`
2. SharePoint reads the component manifest inside the archive
3. The manifest's `preconfiguredEntries` provide toolbox metadata:
   - **Title:** "HB Intel Estimating"
   - **Description:** "HB Intel Estimating workspace."
   - **Group:** "HB Intel" (via `groupId`)
   - **Icon:** `BuildDefinition` (Office Fabric icon)
4. `supportedHosts: ["SharePointWebPart", "TeamsPersonalApp"]` makes it available in the SharePoint page editor toolbox and Teams personal app picker
5. `skipFeatureDeployment: true` makes it available tenant-wide without per-site installation

### Loading (Runtime Resolution)

1. User adds webpart to a SharePoint page → SPFx loader reads the runtime manifest
2. `loaderConfig.internalModuleBaseUrls[0]` resolves to the CDN URL where assets are hosted (SharePoint rewrites the `https://spclientsideassetlibrary/` placeholder at deployment)
3. SPFx loader loads and instantiates `ShellWebPart` (the thin shell compiled by official SPFx toolchain)
4. `ShellWebPart.onInit()`:
   - Reads `this.manifest.loaderConfig.internalModuleBaseUrls[0]` for the CDN base URL
   - Calls `SPComponentLoader.loadScript(baseUrl + 'estimating-app.js', { globalExportsName: '__hbIntel_estimating' })`
   - This fetches and executes the Vite-built IIFE bundle from the CDN
   - After execution, `window.__hbIntel_estimating` contains `{ mount, unmount }`

### Rendering

5. `ShellWebPart.render()`:
   - Reads `window.__hbIntel_estimating`
   - Calls `mount(this.domElement, this.context)`
   - `mount()` (from `apps/estimating/src/mount.tsx`):
     - Calls `resolveSpfxPermissions(spfxContext)` → resolves SP group membership to permission keys
     - Calls `bootstrapSpfxAuth(spfxContext, permissionKeys)` → wires auth store
     - Creates React 18 root and renders `<App spfxContext={context} />`

6. `ShellWebPart.onDispose()`:
   - Calls `unmount()` → unmounts React tree to prevent memory leaks

## 3. Identity Chain Verification

| Identity Element | Value | Source | Verified |
|-----------------|-------|--------|----------|
| Solution ID | `d01a9600-a68a-4afe-83a5-514339f47dbb` | `apps/estimating/config/package-solution.json` | ✓ |
| Feature ID | `cb3b1520-1665-4412-83ab-344c2182a2fd` | `apps/estimating/config/package-solution.json` | ✓ |
| Webpart Component ID | `3c4dbd5c-5bec-4014-8b77-737ac725a5cc` | `EstimatingWebPart.manifest.json` | ✓ |
| Solution Name | `hb-intel-estimating` | `package-solution.json` | ✓ |
| Package Name | `hb-intel-estimating.sppkg` | `package-solution.json` → `paths.zippedPackage` | ✓ |
| Toolbox Title | "HB Intel Estimating" | `preconfiguredEntries[0].title.default` | ✓ |
| Toolbox Group | "HB Intel" | `preconfiguredEntries[0].group.default` | ✓ |
| supportedHosts | `["SharePointWebPart", "TeamsPersonalApp"]` | `manifest.json` | ✓ |
| componentType | `"WebPart"` | `manifest.json` | ✓ |
| IIFE Global | `__hbIntel_estimating` | Vite build output | ✓ |
| Bundle Filename | `estimating-app.js` | Vite `build.lib.fileName` | ✓ |
| includeClientSideAssets | `true` | `package-solution.json` | ✓ |
| skipFeatureDeployment | `true` | `package-solution.json` | ✓ |

## 4. Validation Tooling Improvements

| Check | Before (Prompt 01-02) | After (Prompt 03) |
|-------|----------------------|-------------------|
| File existence | ✓ | ✓ |
| GUID uniqueness | ✓ | ✓ |
| Port uniqueness | ✓ | ✓ |
| supportedHosts compliance | ✗ | ✓ Validates against allowed set |
| preconfiguredEntries presence | ✗ | ✓ Checks title, groupId, icon |
| componentType = WebPart | ✗ | ✓ |
| includeClientSideAssets = true | ✗ | ✓ |
| Bundle format (no ES modules) | ✓ Head check only | ✓ Head + tail check |
| IIFE global name assignment | ✗ | ✓ Verifies `var __hbIntel_{domain}=` |
| mount/unmount exports | ✗ | ✓ Verifies `.mount=` and `.unmount=` in tail |
| .sppkg OPC structure | ✗ | ✓ Post-packaging archive inspection |
| .sppkg Vite bundle presence | ✗ | ✓ Checks bundle filename in archive |
| .sppkg webpart ID presence | ✗ | ✓ Extracts manifest and checks component ID |

## 5. Residual Unknowns Requiring Live SharePoint Verification

These items cannot be verified without deploying to an actual SharePoint tenant:

1. **CDN URL rewrite:** Confirm SharePoint correctly rewrites `https://spclientsideassetlibrary/` to the actual CDN path in `loaderConfig.internalModuleBaseUrls[0]`
2. **SPComponentLoader script resolution:** Confirm the Vite IIFE bundle loads from the CDN path constructed by the shell webpart
3. **Auth context handoff:** Confirm `this.context` (passed to `mount()`) provides valid `pageContext.user.loginName`, `pageContext.web`, and SP group membership for RBAC resolution
4. **Tenant CSP:** Confirm the tenant's Content Security Policy allows script execution from the CDN origin
5. **Toolbox group rendering:** Confirm the "HB Intel" group label renders correctly in the webpart picker on the target tenant

These are Prompt 04 (deployment validation and closeout) items.
