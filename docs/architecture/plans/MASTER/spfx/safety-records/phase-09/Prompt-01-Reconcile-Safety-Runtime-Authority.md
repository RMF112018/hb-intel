# Prompt 01 — Reconcile Safety Runtime Authority

You are working in the live `hb-intel` repository on `main`.

## Objective

Reconcile Safety runtime authority so manifest ID, package version, backend binding expectations, and hosted GUID overlay expectations are sourced consistently and cannot drift across the Safety webpart, mount entry, runtime contract, manifest, package-solution config, tests, and packaging verification.

## Governing Files / Seams

Inspect and update only as required:

- `apps/safety/config/package-solution.json`
- `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/mount.tsx`
- `apps/safety/src/runtime/safetyRuntimeContract.ts`
- `apps/safety/src/runtime/hostedSafetyGuidBinding.ts`
- `apps/safety/src/test/productionRuntimeContractSource.test.ts`
- `tools/build-spfx-package.ts`
- any Safety-specific runtime authority test files

Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current Gap

Known current package truth:

```text
expectedManifestId = ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e
expectedPackageVersion = 1.2.36.0
expectedHostedGuidOverlayFingerprint = fnv1a32:36b2f764
```

Prior audit found package/manifest truth at `1.2.36.0` while Safety runtime constants still referenced `1.2.35.0`. That mismatch must be eliminated before hosted closure.

## Required Implementation Outcome

- Establish one canonical Safety runtime authority seam for:
  - Safety webpart manifest ID.
  - Safety package version.
  - Hosted GUID overlay fingerprint.
- Ensure all runtime contract checks, runtime proof publication, webpart config injection, and package verification use the same values.
- Update stale `1.2.35.0` references to current package truth `1.2.36.0`, unless repo truth has legitimately advanced beyond `1.2.36.0`; if it has advanced, use the newer repo-truth value consistently.
- Ensure `expectedPackageVersion` runtime comparison aligns with the actual package-solution and webpart manifest version.

## Required Proof of Closure

Provide all of the following:

```bash
git grep -n "1.2.35.0" apps/safety tools/build-spfx-package.ts
git grep -n "1.2.36.0" apps/safety tools/build-spfx-package.ts
git grep -n "ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e" apps/safety tools/build-spfx-package.ts
pnpm --filter @hbc/spfx-safety test
pnpm --filter @hbc/spfx-safety build
```

Also provide a short explanation proving:

- The package version source is singular or intentionally mirrored with tests.
- The manifest ID source is singular or intentionally mirrored with tests.
- The overlay fingerprint source is generated from `hostedSafetyGuidBinding.ts`, not manually guessed.

## Constraints

- Do not change backend code.
- Do not relax the fail-closed runtime gate.
- Do not introduce unrelated UI changes.
- Do not commit generated publish settings, credentials, or local files.
