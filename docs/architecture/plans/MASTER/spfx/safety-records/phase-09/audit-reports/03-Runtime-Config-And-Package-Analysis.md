# 03 — Runtime Config and Package Analysis

## Value sourcing analysis

| Value | Dedicated `SafetyWebPart` source | Shell source | Current hosted result | Durability finding |
| --- | --- | --- | --- | --- |
| `functionAppUrl` | `this.properties.functionAppUrl` from property pane | build-time `__FUNCTION_APP_URL__`, from `FUNCTION_APP_URL` env | Missing | Property-pane/manual or build-env-only binding is not durable enough. |
| `apiAudience` | `this.properties.apiAudience` from property pane | build-time `__API_AUDIENCE__`, from `API_AUDIENCE` env | Missing | Same issue; also must align with Entra app audience. |
| `acceptedBackendOrigin` | derived from `functionAppUrl` in `SafetyWebPart.tryResolveOrigin()` | not provided | Missing | Shell lacks equivalent governance injection. |
| `expectedManifestId` | hard-coded `SafetyWebPart.SAFETY_MANIFEST_ID` | not provided | Missing | Shell must pass same authority value or be disallowed. |
| `expectedPackageVersion` | hard-coded `SafetyWebPart.SAFETY_PACKAGE_VERSION` | not provided | Missing | Stale constant must be reconciled with package truth. |
| `expectedHostedGuidOverlayFingerprint` | `hostedSafetyGuidOverlayFingerprint()` | not provided | Missing | Shell must pass fingerprint proof if it remains an allowed host. |
| hosted GUID overlay | `mount()` calls `bindHostedSafetyGuidOverlay()` when SPFx context exists | same because shell passes SPFx context | Known | Overlay is working; backend binding is not. |

## Package/version drift

Repo truth is internally inconsistent:

- `apps/safety/config/package-solution.json`: `1.2.36.0`
- `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`: `1.2.36.0`
- `apps/safety/src/mount.tsx`: `1.2.35.0`
- `apps/safety/src/runtime/safetyRuntimeContract.ts`: `1.2.35.0`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`: `1.2.35.0`

This did not cause the specific screenshot reason `Expected package version is missing`; that reason occurs before comparison because shell passed no expected version. But it will become the next failure if the shell or page starts passing `1.2.36.0` while the runtime still expects `1.2.35.0`.

## SPFx / Microsoft guidance relevance

Microsoft's SPFx property pane model allows webparts to expose configurable properties and access them via `this.properties.<propertyName>`. That supports why the dedicated Safety webpart can technically read `functionAppUrl` and `apiAudience`, but it also shows these values are page-instance configuration, not package-level tenant governance.

Microsoft's SPFx enterprise API guidance requires `webApiPermissionRequests` in `package-solution.json` and tenant/admin approval for an Azure AD-secured API. The Safety package contains a permission request for `hb-intel-api-production` / `access_as_user`; runtime still needs a correct audience token target and backend base URL at execution.

Microsoft's tenant-scoped deployment guidance explains `skipFeatureDeployment: true` makes components available tenant-wide from the tenant app catalog. That aligns with the Safety package posture, but it does not populate runtime page properties or custom host config by itself.

## Structural design issue

The current repo contains two competing runtime-binding concepts:

1. **Dedicated Safety webpart** — correct config shape, property pane fields, but apparently not the active packaged class in the shell packaging architecture.
2. **Generic shell webpart** — active packaged class, correct app-bundle loader pattern, but lacks complete Safety governance config and is intentionally blocked by Safety runtime.

The durable fix is not merely “enter the missing values in the page.” The system must choose and enforce one production host contract.


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

