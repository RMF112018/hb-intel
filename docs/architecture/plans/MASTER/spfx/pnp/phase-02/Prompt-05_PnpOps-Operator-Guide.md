# Prompt-05 PnP Ops Operator Guide

## Purpose

Operate PnP Ops with non-Azure execution modes and understand what each mode expects.

## Mode selection

- `local-runner` (preferred live path)
  - Use when runner is installed on operator workstation.
  - Requires local HTTPS runner endpoint and trusted certificate.
- `remote-runner` (fallback live path)
  - Use when workstation install is not available.
  - Requires trusted remote HTTPS endpoint and `runnerApiKey`.
- `mock`
  - Use for UI and workflow validation without live extraction.
- `legacy-admin-api` (deprecated compatibility)
  - Temporary path only; requires legacy API endpoint + token audience.

## Required webpart properties

Common:
- `executionMode`
- `defaultTargetSiteUrl`

Runner modes (`local-runner` and `remote-runner`):
- `runnerBaseUrl`

Remote only:
- `runnerApiKey` (must match remote host `PNP_RUNNER_API_KEY`)

Legacy only:
- `legacyAdminApiBaseUrl` (or compatible `backendUrl`)
- `backendAudience` (for token acquisition)

## Operator flow

1. Select action in catalog.
2. Enter target site URL and any required list/page filters.
3. Run preflight and resolve blocking checks.
4. Launch extraction run.
5. Refresh until terminal status.
6. Open evidence panel and download bundle or per-file artifacts.

## Failure interpretation

- Local runner certificate/network errors:
  - check local HTTPS trust and local endpoint reachability.
- Remote runner auth errors:
  - verify `runnerApiKey` / `X-Pnp-Runner-Key`.
- Remote runner reachability errors:
  - verify host routing, TLS cert validity, and `PNP_RUNNER_ALLOWED_ORIGINS`.
- Preflight PowerShell/PnP failures:
  - install `pwsh` and `PnP.PowerShell`, then retry.
- Target validation failures:
  - correct SharePoint site URL and required action filters.

## Evidence and downloads

Expected run outputs:
- `raw.json`
- `normalized.json`
- `summary.md`
- `artifact-manifest.json`
- `artifact-bundle.zip` (preferred single download)

If evidence is missing for a terminal run, re-open run status/evidence and validate runner logs for extraction failure details.
