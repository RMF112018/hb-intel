# Prompt 04 — Package and Deployment Verification

You are working in the live `hb-intel` repository on `main`.

## Objective

Rebuild, verify, and document the Safety `.sppkg` so the deployed App Catalog artifact is provably fresh, contains the expected Safety manifest/bundle, and embeds or resolves the governed runtime binding contract.

## Governing Files / Seams

Inspect and update only as required:

- `tools/build-spfx-package.ts`
- `tools/spfx-shell/**`
- `apps/safety/config/package-solution.json`
- `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`
- `apps/safety/dist/**` after build
- `dist/sppkg/**` after package
- any generated package-truth proof files

Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Known Expected Values

```text
manifestId = ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e
packageVersion = 1.2.36.0
apiAudience = api://08c399eb-a394-4087-b859-659d493f8dc7
functionAppUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
acceptedBackendOrigin = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
hostedGuidOverlayFingerprint = fnv1a32:36b2f764
```

## Current Gap

A successful build does not prove the hosted page is running the correct artifact. The closure must prove repo truth, package truth, App Catalog truth, and page runtime truth.

## Required Implementation Outcome

- Build a fresh Safety app bundle.
- Build a fresh Safety `.sppkg`.
- Prove the `.sppkg` contains:
  - the expected Safety manifest ID
  - expected package version
  - Safety bundle
  - runtime binding proof marker `__hbIntel_safetyRuntimeBindingProof`
  - API audience wiring
  - backend URL/origin wiring or deterministic resolver wiring
  - hosted GUID overlay fingerprint expectation
- Produce a package-truth proof that compares source bundle SHA to packaged bundle SHA.
- Provide App Catalog deployment steps and expected validation fields.
- Ensure the deployed package version is not stale.

## Required Commands / Proof

Run and capture output:

```bash
pnpm --filter @hbc/spfx-safety build
npx tsx tools/build-spfx-package.ts --domain safety
ls -la dist/sppkg
unzip -l dist/sppkg/hb-intel-safety.sppkg | grep -E "safety|ClientSideAssets|manifest|xml"
unzip -p dist/sppkg/hb-intel-safety.sppkg $(unzip -Z1 dist/sppkg/hb-intel-safety.sppkg | grep -E "ClientSideAssets/.*safety.*\.js$" | head -1) | grep -E "__hbIntel_safetyRuntimeBindingProof|apiAudience|acceptedBackendOrigin|fnv1a32:36b2f764|ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e|1.2.36.0"
```

If the app bundle is minified and grep is unreliable, write a deterministic verification script that extracts packaged assets and searches byte content.

## Required Report

Create a short package verification report with:

- build command
- package command
- generated `.sppkg` path
- package file SHA-256
- Safety bundle SHA-256
- packaged manifest ID
- packaged package version
- runtime binding markers found
- whether App Catalog version matches expected package version
- whether the hosted page is still running a stale bundle after redeploy

## Constraints

- Do not upload publish settings.
- Do not rely only on SharePoint UI labels.
- Do not treat package existence as proof.
- Do not skip hosted verification.
