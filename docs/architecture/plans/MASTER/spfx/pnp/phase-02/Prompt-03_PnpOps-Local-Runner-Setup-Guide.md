# Prompt-03 Local Runner Setup Guide

## Purpose
Run PnP Ops live extraction from a local HTTPS runner (`@hbc/pnp-runner-local`) without Azure backend dependency.

## Prerequisites
- Node.js (repo baseline)
- PowerShell (`pwsh` preferred; `powershell` fallback)
- PnP.PowerShell module:
  - `Install-Module PnP.PowerShell -Scope CurrentUser`
- Local HTTPS certificate/key files (PEM)

## HTTPS certificate notes
- The runner requires:
  - `PNP_RUNNER_CERT_PATH`
  - `PNP_RUNNER_KEY_PATH`
- Use a locally trusted certificate for `127.0.0.1` / `localhost`.
- If browser calls fail with TLS/certificate errors, trust the certificate in your OS/browser trust store.

## Start commands
From repo root:

```bash
pnpm --filter @hbc/pnp-runner-local start
```

Example environment:

```bash
export PNP_RUNNER_HOST=127.0.0.1
export PNP_RUNNER_PORT=5010
export PNP_RUNNER_CERT_PATH=/absolute/path/localhost-cert.pem
export PNP_RUNNER_KEY_PATH=/absolute/path/localhost-key.pem
export PNP_RUNNER_ALLOWED_ORIGINS=https://hedrickbrotherscom.sharepoint.com
export PNP_RUNNER_STORAGE_DIR=/tmp/hb-intel-pnp-runner
export PNP_RUNNER_AUTH_MODE=DeviceLogin
export PNP_RUNNER_CLIENT_ID=9bc3ab49-b65d-410a-85ad-de819febfddc
export PNP_RUNNER_TENANT=hedrickbrothers.com
```

## SPFx webpart properties (local-runner)
- `executionMode`: `local-runner`
- `runnerBaseUrl`: `https://127.0.0.1:5010`
- `defaultTargetSiteUrl`: your SharePoint site

Legacy compatibility properties (`backendUrl`, `backendAudience`) are not required for local-runner mode.

## Supported endpoints
- `GET /actions`
- `POST /preflight`
- `POST /runs`
- `GET /runs/{id}`
- `GET /runs/{id}/evidence`
- `GET /runs/{id}/artifacts/{artifactId}/download`
- Optional:
  - `GET /health`
  - `GET /capabilities`

## Troubleshooting
- `Origin not allowed`: add SharePoint origin to `PNP_RUNNER_ALLOWED_ORIGINS`.
- TLS/certificate failure: trust local cert and verify `runnerBaseUrl` uses matching host.
- `PowerShell was not found`: install `pwsh` or Windows PowerShell.
- `PnP.PowerShell module was not found`: install module in current user scope.
- Auth prompt loop/failure: verify tenant/client ID and retry using `PNP_RUNNER_AUTH_MODE=Interactive`.
