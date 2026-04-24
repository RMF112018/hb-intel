# Prompt 02 — Runtime Config and Deploy Governance

## Objective

Make hosted Safety runtime binding fail-closed against an independently governed backend origin, API audience, manifest version, package version, and hosted GUID overlay.

## Governing authorities

- `apps/safety/src/runtime/safetyRuntimeContract.ts`
- `apps/safety/src/mount.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`
- `apps/safety/vite.config.ts`
- SPFx package/build tooling used for Safety app packaging
- Azure Function CORS/auth configuration runbooks where present

## Current gap

`functionAppUrl` and `apiAudience` are free-text property-pane values. `acceptedBackendOrigin` is derived from `functionAppUrl`, so it is not an independent allowlist. The manifest does not include required backend/audience defaults.

## Required implementation outcome

- Replace or supplement property-pane-only binding with a governed runtime binding source.
- Make `acceptedBackendOrigin` independent of the configured `functionAppUrl`.
- Preserve fail-closed blocking behavior when backend binding is missing, invalid, or mismatched.
- Add release verification that proves manifest ID/version, package version, intended backend origin, API audience, and hosted GUID overlay fingerprint.
- Add tests for bad/missing/mismatched binding cases.

## Proof of closure

- Runtime contract tests for all blocking paths.
- Packaging/release proof command or documented script output.
- Updated docs/runbook for setting and verifying Safety runtime binding.
- No unrelated platform rewrites.

## Additional instruction

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
