# Plan Summary — Safety Runtime Binding Remediation

## Objective

Make the hosted SharePoint Safety page initialize the Safety app instead of rendering the fail-closed configuration panel, without weakening the runtime gate.

## Confirmed Input Values

```text
functionAppUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
acceptedBackendOrigin = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
apiAudience = api://08c399eb-a394-4087-b859-659d493f8dc7
expectedManifestId = ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e
expectedPackageVersion = 1.2.36.0
expectedHostedGuidOverlayFingerprint = fnv1a32:36b2f764
delegatedScope = access_as_user
Safety roles = HBIntelSafetyOperator, HBIntelSafetySubmitter, HBIntelSafetyReviewer
```

## Critical Path

1. Reconcile Safety runtime/package authority.
2. Implement deterministic governed runtime binding injection.
3. Correct the hosted path so the Safety app is not incorrectly classified as unsafe shell-hosted, or make the shell-hosted path pass equivalent governance guarantees.
4. Rebuild a fresh Safety `.sppkg` and prove package truth.
5. Redeploy/update the hosted SharePoint page and prove the page runtime contract.
6. Validate Entra/API consent and Safety role claim flow.
7. Capture hosted closure evidence.

## Non-Negotiables

- Do not remove or bypass the fail-closed runtime gate.
- Do not use `.scm.azurewebsites.net` as the backend API base URL.
- Do not commit publish settings, deployment credentials, generated secrets, or local auth artifacts.
- Do not treat `gulp bundle`, `vite build`, or webpart render as closure proof.
- Do not assume the backend is broken unless hosted runtime proof shows a valid frontend contract and backend calls still fail.
