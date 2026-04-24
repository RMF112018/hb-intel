# Prompt 01 — Harden Deployment Pipeline and Artifact Truth

## Objective

Rebuild the HB Intel Azure Functions deployment pipeline so the deployed Flex Consumption function app is provably running the intended `backend/functions` package and not an ambiguous repository-root artifact.

## Governing authorities

Use these as the governing authorities:

- current repo truth on `main`
- Azure Functions Flex Consumption deployment guidance
- Azure Functions one-deploy / package-based deployment expectations
- production need for artifact truth and post-deploy proof

## Files and seams to inspect

At minimum inspect:

- `.github/workflows/main_hb-intel-function-app.yml`
- `backend/functions/package.json`
- `backend/functions/host.json`
- any backend build or packaging helper scripts already present in the repo
- any version-marker or release-manifest seams that can be leveraged

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Current gap to close

The current workflow builds and packages too broadly from repository root for a monorepo backend deployment.

That is not acceptable as the long-term production artifact model for a Flex Consumption function app.

## Required implementation outcome

Implement a deployment path that:

1. builds the backend from the correct backend package scope
2. produces a ready-to-run backend artifact with only required runtime content
3. records a deterministic artifact manifest and checksum
4. deploys that artifact through the correct Flex-compatible path
5. supports post-deploy proof that the live host is running the intended artifact

## Proof of closure required

- workflow diff showing backend-scoped packaging
- artifact manifest example
- deterministic version/checksum stamp in deploy output or generated manifest
- exact post-deploy verification steps
- no regression in route registration
- no dependency on repository-root packaging ambiguity

