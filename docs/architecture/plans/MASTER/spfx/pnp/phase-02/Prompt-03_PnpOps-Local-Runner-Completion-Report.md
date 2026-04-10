# Prompt-03 Completion Report — Local Runner Implementation

## Summary
Implemented a local HTTPS companion runner at `tools/pnp-runner-local/` for PnP Ops live extraction, aligned to the Prompt-02 neutral contract and read-only execution posture.

## Changed files
- `tools/pnp-runner-local/package.json`
- `tools/pnp-runner-local/tsconfig.json`
- `tools/pnp-runner-local/vitest.config.ts`
- `tools/pnp-runner-local/src/*` (runner server, run service, preflight, PowerShell bridge, storage, zip, types)
- `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
- `tools/pnp-runner-local/tests/*`
- `apps/hb-webparts/src/webparts/pnp/PnpOps.tsx`
- `apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/00_README.md`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-03_PnpOps-Local-Runner-Setup-Guide.md`

## Endpoint contract implemented
- `GET /actions` -> `{ items: [...] }`
- `POST /preflight` -> `{ data: { ready, checks[] } }`
- `POST /runs` -> `{ data: { runId, status, actionKey } }`
- `GET /runs/{id}` -> `{ data: runEnvelope }`
- `GET /runs/{id}/evidence` -> `{ data: evidenceEnvelope }`
- `GET /runs/{id}/artifacts/{artifactId}/download` -> binary attachment
- Optional:
  - `GET /health`
  - `GET /capabilities`

## Execution model
- Launch creates a persisted local run workspace under runner storage.
- Steps advance asynchronously:
  1. Resolve action contract
  2. Preflight readiness
  3. Execute extraction
  4. Normalize artifacts
  5. Write artifacts
  6. Finalize run
- Terminal statuses: `Completed` or `Failed`.

## Artifact model
Per run:
- `raw.json`
- `normalized.json`
- `summary.md`
- `artifact-manifest.json`
- `artifact-bundle.zip` (preferred single download)

Evidence metadata includes file name, content type, size, bundle flags, availability, and download URL.

## Security notes
- HTTPS required at startup (cert/key mandatory).
- Default bind is loopback (`127.0.0.1`) unless explicitly overridden.
- CORS uses explicit origin allowlist only (no wildcard).
- Error messages are sanitized for common secret/token patterns.

## SPFx adjustments
- `PnpOps` now surfaces runner/certificate guidance when local/remote runner requests fail.
- Manifest bumped from `0.0.5.0` to `0.0.6.0`.

## Verification performed
- `pnpm --filter @hbc/pnp-runner-local check-types`
- `pnpm --filter @hbc/pnp-runner-local test`
- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/pnp/pnpOpsActionCatalog.test.ts src/webparts/pnp/pnpOpsValidation.test.ts src/webparts/pnp/pnpOpsClient.test.ts`

## Known limitations for Prompt-03
- Live extraction still depends on workstation auth/module state at runtime (by design).
- Remote-runner fallback is not implemented in Prompt-03 (deferred to Prompt-04).
