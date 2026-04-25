# 06 — Closure Proof Checklist

## Source proof

- [ ] `apps/safety/src/runtime/safetyRuntimeContract.ts` and `apps/safety/src/mount.tsx` use the current canonical Safety package version.
- [ ] `apps/safety/src/webparts/safety/SafetyWebPart.tsx` uses the same canonical version.
- [ ] If shell-hosting remains allowed, `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` passes the full Safety runtime binding for the Safety domain.
- [ ] If shell-hosting is disallowed, Safety packaging compiles and deploys the dedicated Safety webpart class rather than the generic shell class.
- [ ] Runtime contract tests assert both blocked and allowed paths.
- [ ] Tests cover missing backend URL, missing API audience, wrong origin, wrong manifest ID, wrong version, wrong fingerprint, and approved success path.

## Package proof

- [ ] Clean build from `main` with no stale `dist`, `temp`, `lib`, or `sharepoint` output.
- [ ] Generated `.sppkg` contains component ID `ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e`.
- [ ] Generated `.sppkg` contains `safety-app` bundle and expected runtime proof markers:
  - `__hbIntel_safetyRuntimeBindingProof`
  - `acceptedBackendOrigin`
  - `expectedManifestId`
  - `expectedPackageVersion`
  - `expectedHostedGuidOverlayFingerprint`
- [ ] Packaged JS contains current package version only; no stale `1.2.35.0` remains.
- [ ] Packaged manifest and package-solution agree on version.
- [ ] Package truth proof records SHA-256 for source bundle and packaged bundle.

## Tenant / page proof

- [ ] App catalog contains the newly generated `.sppkg`.
- [ ] App catalog package version equals source/package truth.
- [ ] Required API permission for `hb-intel-api-production` / `access_as_user` is approved.
- [ ] Safety page canvas JSON contains the intended component ID and expected serialized properties or resolver binding reference.
- [ ] Page has been republished after package/page update.

## Browser proof

From the hosted SharePoint Safety page, capture:

```js
window.__hbIntel_safetyRuntimeBindingProof
```

Required values:

- [ ] `hostSource` is either `safety-webpart` or an explicitly approved governed shell source.
- [ ] `configured.functionAppUrl` is present.
- [ ] `configured.apiAudience` is present.
- [ ] `configured.acceptedBackendOrigin` is present.
- [ ] `configured.expectedManifestId === 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e'`.
- [ ] `configured.expectedPackageVersion` equals package truth.
- [ ] `configured.expectedHostedGuidOverlayFingerprint` equals governed authority fingerprint.
- [ ] `runtimeContract.backend.baseUrlPresent === true`.
- [ ] `runtimeContract.backend.apiAudiencePresent === true`.
- [ ] `runtimeContract.governed.backendOriginMatchesAccepted === true`.
- [ ] `runtimeContract.governed.manifestIdMatchesExpected === true`.
- [ ] `runtimeContract.governed.packageVersionMatchesExpected === true`.
- [ ] `runtimeContract.hostedGuidOverlay.fingerprintMatchesExpected === true`.
- [ ] `runtimeContract.canInitializeCommands === true`.
- [ ] `runtimeContract.blockingReasons.length === 0`.

## Visual proof

- [ ] Hosted page screenshot shows the Safety application loaded past the yellow configuration panel.
- [ ] No `safety.frontend.runtime-binding.blocked` telemetry appears in console.
- [ ] Optional proof mode verifies non-admin `/api/health/ready` behavior through the hosted SPFx token path.


## Source evidence inspected

Repository: `RMF112018/hb-intel`, `main` branch, reviewed through GitHub repo fetch/search and Microsoft Learn references.

High-confidence repo-truth findings:

- Safety app package name: `@hbc/spfx-safety` in `apps/safety/package.json`.
- Safety solution package name: `hb-intel-safety` in `apps/safety/config/package-solution.json`.
- Safety solution/package version in package-solution: `1.2.36.0`.
- Safety manifest version in `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`: `1.2.36.0`.
- Runtime hard-coded package authority in both `apps/safety/src/mount.tsx` and `apps/safety/src/runtime/safetyRuntimeContract.ts`: `1.2.35.0`, which is stale versus manifest/package `1.2.36.0`.
- Safety webpart manifest ID: `ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e`.
- Generic SPFx shell build entry: `tools/spfx-shell/config/config.json` points to `./lib/webparts/shell/ShellWebPart.js` and `./src/webparts/shell/ShellWebPart.manifest.json`.
- The committed shell manifest currently uses the Safety component ID but alias `ShellWebPart` and title `HB Intel Safety`.
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` loads the domain IIFE bundle, builds `runtimeConfig`, injects `webPartId`, and only forwards `functionAppUrl`/`apiAudience` when build-time constants are present.
- `apps/safety/src/mount.tsx` classifies any SPFx mount config containing string `webPartId` as `hostSource: 'shell-webpart'`.
- `apps/safety/src/runtime/safetyRuntimeContract.ts` intentionally blocks `hostSource === 'shell-webpart'` in SharePoint mode and also blocks missing backend base URL, API audience, accepted backend origin, expected manifest ID, expected package version, and expected hosted GUID overlay fingerprint.
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx` would pass `functionAppUrl`, `apiAudience`, `acceptedBackendOrigin`, `expectedManifestId`, `expectedPackageVersion`, and `expectedHostedGuidOverlayFingerprint`, but the shell packaging path does not execute that class.
- `apps/safety/src/runtime/hostedSafetyGuidBinding.ts` contains the hosted GUID overlay and fingerprint logic; therefore `Overlay known: yes` only proves the SharePoint-hosted overlay is populated, not that backend binding or package authority is valid.

Important limitation:

- I did not directly extract the live SharePoint page canvas JSON or tenant app catalog .sppkg from the tenant in this session. The root cause below is high-confidence from repo truth plus the console evidence, but 100% closure requires the hosted proof checklist in `06-Closure-Proof-Checklist.md`.

