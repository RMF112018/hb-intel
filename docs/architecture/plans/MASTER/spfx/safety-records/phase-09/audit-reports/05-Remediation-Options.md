# 05 — Remediation Options

## Immediate corrective action

Execute these in order:

1. **Capture hosted proof first**
   - Open the hosted Safety page.
   - Run:
     ```js
     window.__hbIntel_safetyRuntimeBindingProof
     window.__hbIntel_safetyManifestId
     window.__hbIntel_safety
     ```
   - Save the output before changing anything.

2. **Confirm page instance and package truth**
   - Extract the page canvas JSON or use PnP/Graph to read the webpart instance.
   - Confirm whether the instance uses component ID `ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e` and whether the runtime module is shell-backed.
   - Extract deployed `.sppkg` and verify the manifest entry module and packaged JS bundle.

3. **Choose the short-term host path**
   - Preferred immediate path if time matters: patch shell Safety packaging to inject full governed runtime config, because current package architecture already routes through shell.
   - Alternative: package true dedicated `SafetyWebPart` and replace the page webpart instance.

4. **Fix version authority first**
   - Update all runtime constants from `1.2.35.0` to `1.2.36.0`, or better, generate/import one canonical Safety package version value.

5. **Redeploy and republish**
   - Rebuild Safety `.sppkg` from clean repo truth.
   - Upload/replace in tenant app catalog.
   - Republish the Safety page.

## Durable production fix

Implement the following:

1. **Single Safety runtime binding authority**
   - One source of truth for package version, manifest ID, backend base URL, accepted origin, API audience, overlay fingerprint, and permission approval posture.

2. **Tenant-hosted configuration resolver**
   - Use a governed SharePoint list or backend readiness endpoint to resolve Safety environment binding.
   - Do not rely on manually typed property-pane values for production backend binding.

3. **Explicit shell compatibility contract**
   - Either prohibit shell Safety runtime permanently and ensure packaging uses dedicated webpart, or create a named shell-host acceptance path that requires all governance fields and proof before allowing initialization.

4. **Package-truth validation**
   - Verify `.sppkg` contains expected Safety manifest ID, manifest version, bundle, runtime proof markers, and no stale constants.

5. **Page provisioning script**
   - Provision or validate the Safety page webpart instance deterministically.
   - Fail if the wrong component ID, missing serialized properties, or wrong package version appears.

## Long-term hardening

- Add a browser-visible “copy runtime binding proof” diagnostic control gated for admins.
- Add Playwright hosted-page proof that asserts the app loads past the configuration panel.
- Add an app-catalog package SHA proof artifact for every Safety package release.
- Add a smoke test that verifies SPFx token acquisition to the configured API audience.
- Add a safety route proof mode for `/api/health/ready` and ingestion preview using the real hosted SPFx token path.


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

