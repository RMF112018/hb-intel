# 02 — Host and Mount Path Analysis

## Dedicated Safety webpart path

`apps/safety/src/webparts/safety/SafetyWebPart.tsx` is the intended dedicated Safety bridge. Its `render()` method calls:

```ts
mount(this.domElement, this.context, {
  functionAppUrl: this.properties.functionAppUrl,
  apiAudience: this.properties.apiAudience,
  acceptedBackendOrigin,
  expectedManifestId: SafetyWebPart.SAFETY_MANIFEST_ID,
  expectedPackageVersion: SafetyWebPart.SAFETY_PACKAGE_VERSION,
  expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
})
```

That path supplies the fields the runtime gate requires. It still has a stale `SAFETY_PACKAGE_VERSION = '1.2.35.0'`, while package/manifest repo truth is `1.2.36.0`.

## Generic SPFx shell path

The active SPFx shell project is configured to compile `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`, not the dedicated `apps/safety/src/webparts/safety/SafetyWebPart.tsx` class.

The shell webpart:

1. loads the Vite IIFE bundle through `SPComponentLoader.loadScript()`;
2. resolves `window.__hbIntel_safety` / global export;
3. builds `runtimeConfig`;
4. injects `runtimeConfig.webPartId = this.manifest.id`;
5. injects `functionAppUrl` only if build-time `__FUNCTION_APP_URL__` is non-empty;
6. injects `apiAudience` only if build-time `__API_AUDIENCE__` is non-empty;
7. does not inject Safety-specific governance fields: `acceptedBackendOrigin`, `expectedManifestId`, `expectedPackageVersion`, or `expectedHostedGuidOverlayFingerprint`.

## Why Safety thinks it is shell-hosted

`apps/safety/src/mount.tsx` contains:

```ts
const hostSource =
  spfxContext && isShellHostedMountConfig(config)
    ? 'shell-webpart'
    : spfxContext
      ? 'safety-webpart'
      : 'local-dev';

function isShellHostedMountConfig(config) {
  if (!config) return false;
  return typeof config.webPartId === 'string';
}
```

Because `ShellWebPart.ts` always adds `runtimeConfig.webPartId`, Safety classifies the hosted runtime as `shell-webpart`.

## Current packaging signal

The committed `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json` uses the Safety webpart ID but alias `ShellWebPart`. The shell config points to `ShellWebPart.js`. This means the package can advertise the Safety component ID/title while executing the generic shell class.

That explains the screenshot precisely: the page can look like it contains the Safety webpart while the runtime contract is still shell-hosted.

## Hypothesis status

- Hypothesis 1 — Wrong host path: **proved for current packaging path**.
- Hypothesis 2 — Missing webpart properties: **partially applicable but not primary**; missing values exist, but not because the dedicated webpart property pane necessarily lacks values. The active shell path does not consume those Safety properties.
- Hypothesis 3 — Shell config shape collision: **proved**; presence of `webPartId` drives shell classification.
- Hypothesis 4 — Manifest/package authority mismatch: **proved as a latent defect**; `1.2.36.0` package/manifest versus `1.2.35.0` runtime constants.
- Hypothesis 5 — Safety package build artifact drift: **possible**; hosted console contains `Expected API audience is missing`, not found in fetched `main` contract source.
- Hypothesis 6 — Page contains wrong webpart: **likely but must be proven from page canvas JSON**. It may contain the Safety component ID, but the backing class is shell-packaged.
- Hypothesis 7 — Property pane cannot provide production-safe values: **proved as design weakness**; backend binding currently depends on property pane in the dedicated class or env constants in shell, neither is a deterministic governed tenant binding.


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

