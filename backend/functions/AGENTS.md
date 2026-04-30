# Backend Functions Routing — Codex

## Primary rule

Backend Functions work may require route, host, health, readiness, artifact-shape, Graph/PnP seam, and runtime-identity validation beyond normal TypeScript checks.

## Required starting sources

Use as applicable:

```text
backend/functions/package.json
scripts/package-functions-artifact.ts
docs/reference/developer/verification-commands.md
backend/functions/src/**
```

## Use backend artifact routing when touching

- route registration;
- admin control plane;
- health or readiness endpoints;
- Safety ingestion routes;
- Graph/PnP data-plane seams;
- deployment artifact packaging;
- runtime identity stamp;
- CI deploy packaging.

## Validation order

Prefer local deterministic checks first:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
```

Use artifact packaging only when artifact shape/runtime identity is in scope:

```bash
pnpm exec tsx scripts/package-functions-artifact.ts --output functions-artifact.zip --staging .tmp/functions-deploy
```

Do not run artifact packaging as routine validation for unrelated backend changes.

## Hosted proof boundary

The following require explicit user authorization and redaction review:

- Azure CLI commands;
- app settings reads/writes;
- live `/api/health` or `/api/health/ready` probes;
- token-dependent readiness proof;
- live Graph/PnP/SharePoint calls;
- CI/CD deployment or workflow dispatch.

Never preserve raw tokens, function keys, bearer strings, JWTs, app settings, or auth payloads.

## Reporting

For backend work, explicitly report:

- local validation run;
- artifact validation run or not run;
- hosted proof run or not run;
- auth/secret outputs redacted or not collected;
- residual runtime parity risk.
