# HB Intel Safety Hosted Runtime Binding Audit Package

## Objective

This package documents a targeted forensic audit of the hosted SharePoint Safety page blocking state:

> Safety configuration is incomplete. SharePoint host mode is active, but required backend binding is missing or invalid.

The audit determines why the hosted page receives an incomplete or shell-hosted Safety runtime contract instead of a complete Safety webpart runtime binding.

## Contents

1. `00-Root-Cause-Summary.md`
2. `01-Screenshot-Failure-Trace.md`
3. `02-Host-And-Mount-Path-Analysis.md`
4. `03-Runtime-Config-And-Package-Analysis.md`
5. `04-Root-Cause-Determination.md`
6. `05-Remediation-Options.md`
7. `06-Closure-Proof-Checklist.md`


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

