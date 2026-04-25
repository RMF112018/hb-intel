# 01 — Screenshot Failure Trace

## Observed runtime symptom

The hosted page shows:

- `Safety configuration is incomplete.`
- `SharePoint host mode is active, but required backend binding is missing or invalid.`
- `Detail: Host mode: sharepoint. Overlay known: yes.`

The console log confirms the bundle emitted a `safety.frontend.runtime-binding.blocked` event with `hostMode: 'sharepoint'`, `hostedGuidOverlayKnown: true`, and the same blocking reasons.

## Source trace for each blocking reason

| Screenshot / console reason | Source responsible | Trigger condition | Interpretation |
| --- | --- | --- | --- |
| Shell-hosted Safety runtime is disabled until equivalent backend binding and approval guarantees are established. | `apps/safety/src/runtime/safetyRuntimeContract.ts`, `resolveSafetyRuntimeContract()` | `hostMode === 'sharepoint'` and `hostSource === 'shell-webpart'` | Expected fail-closed behavior. It is not a random UI failure. |
| Backend base URL is missing. | `apps/safety/src/runtime/safetyRuntimeContract.ts` | `normalizeFunctionAppUrl(config?.functionAppUrl)` resolves null | Host config did not provide `functionAppUrl`. |
| API audience is missing. | `apps/safety/src/runtime/safetyRuntimeContract.ts` | `normalizeText(config?.apiAudience)` resolves null | Host config did not provide `apiAudience`. |
| Accepted backend origin is missing. | `apps/safety/src/runtime/safetyRuntimeContract.ts` | `normalizeOrigin(config?.acceptedBackendOrigin)` resolves null | Shell path does not provide accepted origin; dedicated Safety webpart derives this from `functionAppUrl`. |
| Expected manifest ID is missing. | `apps/safety/src/runtime/safetyRuntimeContract.ts` | `config?.expectedManifestId` missing | Shell path does not provide governed Safety manifest authority. |
| Expected package version is missing. | `apps/safety/src/runtime/safetyRuntimeContract.ts` | `config?.expectedPackageVersion` missing | Shell path does not provide governed package version. |
| Expected hosted GUID overlay fingerprint is missing. | `apps/safety/src/runtime/safetyRuntimeContract.ts` | `config?.expectedHostedGuidOverlayFingerprint` missing | Shell path does not provide fingerprint proof. |
| Expected API audience is missing. | Hosted bundle / deployed artifact evidence | This exact text was present in the hosted console but was not found in the fetched current `main` source contract. | Treat as likely artifact drift or a deployed bundle built from a different revision. Closure proof must compare repo-truth source, packaged bundle strings, and hosted bundle. |

## Why the panel renders

`apps/safety/src/App.tsx` receives a `runtimeContract`. In SharePoint mode, if `!runtimeContract.canInitializeCommands`, it renders `SafetyStatusPanel` with the exact title, description, detail, and blocking-reason list seen in the screenshot.

The blocking state is therefore produced by the Safety app itself after runtime contract validation. The SharePoint host did not merely fail to load the bundle; the bundle loaded and intentionally refused to initialize commands.

## What “Overlay known: yes” proves

`Overlay known: yes` means the hosted SharePoint GUID overlay was bound and had no missing required list/library keys. It does **not** prove any of the following:

- backend URL is present
- API audience is present
- SPFx web API permission is approved
- package version is current
- page contains the correct webpart class
- shell and Safety runtime contracts are equivalent


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

