# 00 — Root Cause Summary

## Executive finding

The hosted SharePoint Safety page is loading the Safety application through the **generic SPFx shell loader path**, not through the complete dedicated Safety runtime binding path. The shell path injects a `webPartId` into the mount config; `apps/safety/src/mount.tsx` treats that shape as `hostSource: 'shell-webpart'`; `apps/safety/src/runtime/safetyRuntimeContract.ts` intentionally blocks shell-hosted Safety at runtime.

The same shell path also fails to provide the complete Safety runtime contract:

- no `functionAppUrl`
- no `apiAudience`
- no `acceptedBackendOrigin`
- no `expectedManifestId`
- no `expectedPackageVersion`
- no `expectedHostedGuidOverlayFingerprint`

The screenshot is therefore not evidence that the backend is broken. It is evidence that the hosted SPFx runtime binding is incomplete and being classified as shell-hosted.

## Confirmed package/source names

- Source package: `@hbc/spfx-safety`
- Solution package: `hb-intel-safety`
- Webpart manifest ID: `ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e`
- Current manifest/package version: `1.2.36.0`
- Stale runtime authority constant still present: `1.2.35.0`

## Root cause classification

Primary classifications:

- shell-hosted loader path issue
- missing runtime config injection
- brittle production binding design
- package/runtime authority mismatch

Possible adjacent condition requiring tenant proof:

- page instance may contain the shell-packaged Safety webpart instance rather than a dedicated Safety webpart class; based on the current packaging architecture, that is likely by design, not merely editor error.

## Confidence

Confidence: **90%**.

Confidence would reach 100% after extracting the hosted page webpart instance and browser proof object showing:

```js
window.__hbIntel_safetyRuntimeBindingProof.hostSource === 'shell-webpart'
window.__hbIntel_safetyRuntimeBindingProof.configured.functionAppUrl === null
window.__hbIntel_safetyRuntimeBindingProof.configured.apiAudience === null
```

## Immediate corrective direction

Do not disable the fail-closed runtime gate. Fix the host binding.

The immediate remediation is either:

1. package and use a true dedicated `SafetyWebPart` entrypoint that passes the full governed runtime contract; or
2. upgrade the shell Safety path so it passes an equivalent governed runtime contract and is no longer classified/blocked as unsafe shell-hosted runtime.

The durable production fix should move backend and authority values out of manual property pane entry and into a deterministic tenant/package runtime binding resolver with deployment-time proof.


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

