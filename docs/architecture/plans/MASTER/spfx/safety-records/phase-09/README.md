# HB Intel Safety Runtime Binding Remediation Package v2

## Objective

Resolve the hosted SharePoint Safety runtime blocker:

> Safety configuration is incomplete.  
> SharePoint host mode is active, but required backend binding is missing or invalid.

This package updates the prior remediation prompt package with the specific runtime binding values recovered from:

1. The Entra application manifest exported in Microsoft Graph format.
2. The Azure Function App publish settings file.

The publish settings file itself must be treated as secret material. Do not commit it, paste it into code-agent prompts, or store it in the repository. Only the non-secret backend URL/origin values extracted from it are included here.

## Confirmed Runtime Values to Carry Forward

```text
functionAppUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
acceptedBackendOrigin = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
apiAudience = api://08c399eb-a394-4087-b859-659d493f8dc7
expectedManifestId = ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e
expectedPackageVersion = 1.2.36.0
expectedHostedGuidOverlayFingerprint = fnv1a32:36b2f764
delegatedScope = access_as_user
Safety role claims = HBIntelSafetyOperator, HBIntelSafetySubmitter, HBIntelSafetyReviewer
```

## Confirmed Current Gaps

- The hosted SharePoint page is still consistent with an incomplete Safety runtime contract.
- The Safety page appears to be executing through the generic shell-hosted mount path or an equivalent incomplete host path.
- The shell-hosted path injects `webPartId`, which the Safety mount classifies as `shell-webpart`.
- The Safety runtime gate intentionally blocks `shell-webpart` in SharePoint mode unless equivalent backend binding and approval guarantees are supplied.
- The currently known runtime binding values must be injected deterministically; manual, undocumented property-pane entry is not durable enough for production closure.
- There is a package-version authority mismatch to reconcile:
  - `apps/safety/config/package-solution.json` and `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json` indicate `1.2.36.0`.
  - Safety runtime constants previously observed in `apps/safety/src/mount.tsx`, `apps/safety/src/runtime/safetyRuntimeContract.ts`, and `apps/safety/src/webparts/safety/SafetyWebPart.tsx` still referenced `1.2.35.0`.

## Package Contents

- `Plan-Summary.md`
- `Known-Runtime-Binding-Values.md`
- `Prompt-01-Reconcile-Safety-Runtime-Authority.md`
- `Prompt-02-Implement-Governed-Runtime-Binding-Resolver.md`
- `Prompt-03-Correct-Hosted-Path-And-Shell-Equivalence.md`
- `Prompt-04-Package-And-Deployment-Verification.md`
- `Prompt-05-Hosted-SharePoint-Closure-Proof.md`
- `Prompt-06-Secret-Hygiene-And-Consent-Proof.md`
- `Closure-Proof-Checklist.md`

## Execution Rule

Run the prompts in order. Do not start with hosted-page testing until the source authority, runtime binding, package artifact, and deployment path have been reconciled.
