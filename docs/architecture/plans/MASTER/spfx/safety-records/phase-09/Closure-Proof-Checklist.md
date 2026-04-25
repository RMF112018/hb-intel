# Closure Proof Checklist — Safety Runtime Binding

## Source Authority

- [ ] `expectedManifestId` is reconciled to `ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e`.
- [ ] `expectedPackageVersion` is reconciled to `1.2.36.0` unless repo truth has advanced consistently.
- [ ] No stale `1.2.35.0` Safety runtime constants remain unless intentionally documented and tested.
- [ ] Hosted GUID overlay fingerprint resolves to `fnv1a32:36b2f764`.
- [ ] Runtime contract tests cover the valid hosted SharePoint binding path.
- [ ] Runtime contract tests cover invalid/missing binding failure paths.

## Runtime Binding

- [ ] `functionAppUrl` resolves to `https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net`.
- [ ] `acceptedBackendOrigin` resolves to `https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net`.
- [ ] `apiAudience` resolves to `api://08c399eb-a394-4087-b859-659d493f8dc7`.
- [ ] Runtime proof publishes `window.__hbIntel_safetyRuntimeBindingProof`.
- [ ] `runtimeContract.canInitializeCommands === true`.
- [ ] `runtimeContract.blockingReasons.length === 0`.

## Host Path

- [ ] Hosted page uses the dedicated Safety webpart or an explicitly governed shell-compatible Safety host.
- [ ] Shell-hosted Safety cannot initialize unless it supplies equivalent Safety binding and governance proof.
- [ ] The page is not using a stale webpart instance.
- [ ] The page canvas/webpart identity is captured.

## Package Truth

- [ ] `pnpm --filter @hbc/spfx-safety build` passes.
- [ ] `npx tsx tools/build-spfx-package.ts --domain safety` passes.
- [ ] `.sppkg` SHA-256 captured.
- [ ] Packaged Safety bundle SHA-256 captured.
- [ ] Packaged manifest contains `ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e`.
- [ ] Packaged version is `1.2.36.0`.
- [ ] Packaged bundle contains runtime binding proof marker.

## Tenant / App Catalog

- [ ] App Catalog shows the expected Safety package version.
- [ ] SharePoint page was republished after package update or page instance change.
- [ ] Browser cache/stale CDN concerns were ruled out by bundle URL/version evidence.

## Entra / API Consent

- [ ] `apiAudience` is `api://08c399eb-a394-4087-b859-659d493f8dc7`.
- [ ] `access_as_user` scope exists and is enabled.
- [ ] API access/admin consent is approved.
- [ ] Test user has required Safety role claim(s).
- [ ] No token values are stored in report artifacts.

## Hosted Page Proof

- [ ] Screenshot shows Safety app loaded past the yellow blocker.
- [ ] Browser proof object shows no blocking reasons.
- [ ] Backend smoke test is non-destructive and successful.
- [ ] Any remaining console errors are classified and unrelated to Safety runtime binding.
