# Prompt 02 — Implement Governed Safety Runtime Binding Resolver

You are working in the live `hb-intel` repository on `main`.

## Objective

Implement a deterministic Safety runtime binding resolver so the hosted SharePoint page receives the full governed backend binding contract without relying on fragile manual page edits or incomplete shell env injection.

## Known Binding Values

Use these as the current tenant/runtime values, but still verify repo truth and avoid committing secrets:

```text
functionAppUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
acceptedBackendOrigin = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
apiAudience = api://08c399eb-a394-4087-b859-659d493f8dc7
expectedManifestId = ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e
expectedPackageVersion = 1.2.36.0
expectedHostedGuidOverlayFingerprint = fnv1a32:36b2f764
```

## Governing Files / Seams

Inspect and update only as required:

- `apps/safety/src/runtime/safetyRuntimeContract.ts`
- `apps/safety/src/runtime/hostedSafetyGuidBinding.ts`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/gulpfile.js`
- `tools/build-spfx-package.ts`
- Safety tests under `apps/safety/src/test/**`

Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current Gap

The hosted page is missing one or more required runtime binding values:

- backend base URL
- API audience
- accepted backend origin
- expected manifest ID
- expected package version
- expected hosted GUID overlay fingerprint

The generic shell currently passes only partial runtime config and does not supply the full governed Safety contract. The dedicated Safety webpart can pass governance fields, but still relies on page properties for `functionAppUrl` and `apiAudience`.

## Required Implementation Outcome

Create a deterministic Safety runtime binding resolver that:

1. Supplies `functionAppUrl`.
2. Supplies `apiAudience`.
3. Derives or supplies `acceptedBackendOrigin`.
4. Supplies `expectedManifestId`.
5. Supplies `expectedPackageVersion`.
6. Supplies `expectedHostedGuidOverlayFingerprint`.
7. Fails closed with operator-friendly diagnostics if the binding is absent, malformed, stale, or sourced from an unapproved path.
8. Does not require deployment credentials or publish settings to exist in the repo.

Acceptable implementation patterns include one of the following:

- Build-time injection from CI/CD environment variables with strict validation and package proof.
- Tenant-hosted governed config list read before mount, with cached/fail-closed behavior.
- A Safety-specific config module containing non-secret tenant constants, paired with deployment runbook controls.
- A hybrid: non-secret constants in source, secrets excluded, backend URL/API audience overridable by deployment pipeline only when validated.

Do not use the publish profile directly. Do not store publish settings or deployment credentials.

## Required Proof of Closure

Provide source and runtime proof:

```bash
git grep -n "functionAppUrl" apps/safety tools/spfx-shell tools/build-spfx-package.ts
git grep -n "apiAudience" apps/safety tools/spfx-shell tools/build-spfx-package.ts
git grep -n "acceptedBackendOrigin" apps/safety tools/spfx-shell tools/build-spfx-package.ts
git grep -n "expectedHostedGuidOverlayFingerprint" apps/safety tools/spfx-shell tools/build-spfx-package.ts
pnpm --filter @hbc/spfx-safety test
pnpm --filter @hbc/spfx-safety build
```

Add/update tests proving that a SharePoint-hosted Safety binding with these values produces:

```text
canInitializeCommands = true
blockingReasons = []
backend.baseUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
backend.apiAudience = api://08c399eb-a394-4087-b859-659d493f8dc7
governed.acceptedBackendOrigin = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
governed.expectedManifestId = ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e
governed.expectedPackageVersion = 1.2.36.0
hostedGuidOverlay.expectedFingerprint = fnv1a32:36b2f764
```

## Constraints

- Do not bypass the runtime gate.
- Do not set backend mode to mock or ui-review to mask production gaps.
- Do not introduce secrets into committed code.
- Do not make broad unrelated Safety UI changes.
