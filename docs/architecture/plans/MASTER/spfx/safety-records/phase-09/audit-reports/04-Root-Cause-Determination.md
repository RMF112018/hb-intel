# 04 — Root Cause Determination

## Root cause statement

The hosted SharePoint Safety page is rendering the blocking state because the Safety app is being mounted through a generic SPFx shell runtime contract that the Safety runtime explicitly treats as unsafe and incomplete.

The shell-hosted path passes a `webPartId`, causing Safety to classify the host source as `shell-webpart`. The runtime contract then blocks shell-hosted Safety by design. In the same call, the shell omits every Safety-specific governance binding that would be required to initialize safely: backend base URL, API audience, accepted backend origin, expected manifest ID, expected package version, and hosted GUID overlay fingerprint.

## Why this is not primarily a backend problem

The bundle loads and executes. The app emits its own runtime-binding blocked telemetry. The Safety page does not reach backend command initialization because `canInitializeCommands` is false before repository creation.

## Why this is not merely a SharePoint editor issue

A page editor could set property-pane values only if the active class exposes and consumes the dedicated Safety property pane. The shell path exposes generic shell properties for specific webpart IDs and injects env-driven constants, not the dedicated Safety webpart's `functionAppUrl` / `apiAudience` property-pane logic. Therefore page-instance configuration alone may not be able to fix the hosted shell package.

## Confirmed causes

1. **Host source classification**: `mount.tsx` classifies configs with `webPartId` as shell-hosted.
2. **Intentional shell block**: `safetyRuntimeContract.ts` blocks `hostSource === 'shell-webpart'` in SharePoint mode.
3. **Missing backend binding**: shell does not inject `functionAppUrl` / `apiAudience` unless build env constants exist; console proves they were missing.
4. **Missing governance binding**: shell does not inject accepted origin, expected manifest ID, expected package version, or expected GUID fingerprint.
5. **Version drift**: package/manifest are `1.2.36.0`; runtime authority constants are still `1.2.35.0`.
6. **Artifact drift suspicion**: hosted bundle reports `Expected API audience is missing`, a string not found in fetched current `main` runtime contract.

## Minimal fix

Fastest safe path:

1. Reconcile Safety version authority to `1.2.36.0` from a single source.
2. Decide whether Safety is allowed to run through shell.
3. If yes, update `ShellWebPart`/packaging for the Safety domain to pass the full governed Safety runtime config and update Safety's host-source logic so this specific governed shell binding is accepted.
4. If no, package a true dedicated Safety SPFx entrypoint and ensure the hosted page uses it.
5. Redeploy, republish, and verify `window.__hbIntel_safetyRuntimeBindingProof` shows no blocking reasons.

## Durable fix

Implement a tenant/package-backed runtime binding resolver for Safety. The resolver should deterministically supply backend URL, API audience, accepted backend origin, manifest ID, package version, hosted overlay fingerprint, and approval state. It should be validated by packaging, deployment, page provisioning, and hosted Playwright/browser proof.

## What would raise confidence to 100%

- Extract SharePoint page canvas JSON for the Safety page and confirm the component ID and serialized webpart properties.
- Inspect the deployed `.sppkg` from app catalog and confirm which compiled JS module is bound to `ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e`.
- In browser console, capture `window.__hbIntel_safetyRuntimeBindingProof` from the hosted page.
- Confirm the hosted bundle hash/string set matches the rebuilt package from current `main`.


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

