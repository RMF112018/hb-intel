# Prompt 05 — Hosted SharePoint Closure Proof

You are working against the hosted SharePoint Safety page after source/package remediation has been applied.

## Objective

Prove that the hosted HB Central Safety page loads the Safety app past the fail-closed configuration panel with the expected runtime binding contract.

## Expected Runtime Values

```text
functionAppUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
acceptedBackendOrigin = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
apiAudience = api://08c399eb-a394-4087-b859-659d493f8dc7
expectedManifestId = ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e
expectedPackageVersion = 1.2.36.0
expectedHostedGuidOverlayFingerprint = fnv1a32:36b2f764
```

## Hosted Browser Console Proof

In the hosted SharePoint page browser console, capture:

```javascript
window.__hbIntel_safetyRuntimeBindingProof
```

Required pass conditions:

```text
hostSource is safety-webpart OR governed shell-compatible Safety host
configured.functionAppUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
configured.apiAudience = api://08c399eb-a394-4087-b859-659d493f8dc7
configured.acceptedBackendOrigin = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
configured.expectedManifestId = ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e
configured.expectedPackageVersion = 1.2.36.0
configured.expectedHostedGuidOverlayFingerprint = fnv1a32:36b2f764
runtimeContract.canInitializeCommands = true
runtimeContract.blockingReasons = []
runtimeContract.backend.baseUrlPresent = true
runtimeContract.backend.baseUrlValid = true
runtimeContract.backend.apiAudiencePresent = true
runtimeContract.governed.backendOriginMatchesAccepted = true
runtimeContract.governed.manifestIdMatchesExpected = true
runtimeContract.governed.packageVersionMatchesExpected = true
runtimeContract.hostedGuidOverlay.fingerprintMatchesExpected = true
```

## Page Instance Proof

Prove which webpart instance is on the page using one of:

- SharePoint page edit mode screenshots showing webpart identity and property pane.
- PnP extraction of page canvas JSON.
- Microsoft Graph page/webpart inspection if available.
- Browser runtime proof that includes manifest ID, host source, package version, and app bundle URL.

## Functional Smoke Proof

After the page loads past the blocking panel:

1. Verify the Safety app shell renders.
2. Verify the Upload page or main route initializes.
3. Trigger a non-destructive backend readiness/token smoke test if the app supports proof mode.
4. Confirm no runtime binding blocker event is logged.
5. Capture screenshot showing the Safety app loaded.

## Closure Report Required

Include:

- hosted page URL
- package version deployed
- app catalog package timestamp/version
- browser proof JSON copy
- screenshot path/name
- page webpart identity proof
- result of backend token/readiness smoke test
- any residual warnings that are unrelated to Safety runtime binding

## Constraints

- Do not accept “page renders a webpart frame” as proof.
- Do not accept Microsoft telemetry/ad-blocker errors as Safety failures.
- Do not mutate production Safety records during smoke testing.
- Do not expose deployment secrets in screenshots or logs.
