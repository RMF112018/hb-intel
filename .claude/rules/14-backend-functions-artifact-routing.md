# 14 — Backend Functions Artifact Routing

## Primary Rule

Backend Functions work may require route, host, health, readiness, artifact-shape, and runtime-identity validation beyond normal TypeScript checks.

## Required Sources

Use as applicable:

- `backend/functions/package.json`
- `scripts/package-functions-artifact.ts`
- `docs/reference/developer/verification-commands.md`
- relevant route/service/host files
- relevant tests under `backend/functions/src`

## Routing

Use backend artifact routing when touching:

- route registration;
- admin control plane;
- health or readiness endpoints;
- Safety ingestion routes;
- Graph/PnP data-plane seams;
- deployment artifact packaging;
- runtime identity stamp;
- CI deploy packaging.

## Validation

Prefer local deterministic checks first. Hosted proof requires explicit authorization and redaction review.

Do not run Azure, live endpoint, app settings, or token-dependent commands without `hb-sensitive-operation-gate`.
