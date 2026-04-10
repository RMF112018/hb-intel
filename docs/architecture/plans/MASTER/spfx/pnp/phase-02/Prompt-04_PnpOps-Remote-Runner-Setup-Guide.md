# Prompt-04 Remote Runner Setup Guide

## Purpose
Run PnP Ops against a self-hosted non-Azure remote runner using the same contract as local runner mode.

## Host assumptions
- Internal trusted host (VM, jump box, or on-prem service host).
- HTTPS endpoint reachable from SharePoint page context.
- Node.js, PowerShell (`pwsh` preferred), and `PnP.PowerShell` installed on the host.
- Operator-managed API key shared with the SPFx webpart configuration.

## Required runner environment
```bash
export PNP_RUNNER_HOST=0.0.0.0
export PNP_RUNNER_PORT=5010
export PNP_RUNNER_ALLOW_NON_LOOPBACK=true
export PNP_RUNNER_API_KEY=<strong-shared-secret>
export PNP_RUNNER_CERT_PATH=/absolute/path/remote-cert.pem
export PNP_RUNNER_KEY_PATH=/absolute/path/remote-key.pem
export PNP_RUNNER_ALLOWED_ORIGINS=https://hedrickbrotherscom.sharepoint.com
export PNP_RUNNER_STORAGE_DIR=/var/lib/hb-intel/pnp-runner
export PNP_RUNNER_AUTH_MODE=DeviceLogin
export PNP_RUNNER_CLIENT_ID=9bc3ab49-b65d-410a-85ad-de819febfddc
export PNP_RUNNER_TENANT=hedrickbrothers.com
```

Start command:
```bash
pnpm --filter @hbc/pnp-runner-local start
```

## Auth and TLS posture
- Non-loopback mode requires `PNP_RUNNER_API_KEY`.
- Protected routes require request header `X-Pnp-Runner-Key`.
- `/health` remains unauthenticated for liveness checks.
- TLS certificate must be valid/trusted for the configured host.
- CORS allowlist must include exact SharePoint origins; wildcard is rejected.

## SPFx webpart configuration (remote-runner)
- `executionMode`: `remote-runner`
- `runnerBaseUrl`: `https://<trusted-host>:5010`
- `runnerApiKey`: same value as `PNP_RUNNER_API_KEY`
- `defaultTargetSiteUrl`: target SharePoint site URL

Legacy properties (`backendUrl`, `backendAudience`) are not required for remote-runner mode.

## Troubleshooting
- `401 Runner API key is missing or invalid`: verify `runnerApiKey` in webpart config and `PNP_RUNNER_API_KEY` on host.
- `Origin not allowed`: add exact SharePoint origin to `PNP_RUNNER_ALLOWED_ORIGINS`.
- TLS/certificate failure: use a certificate trusted by operator browser and matching host.
- `PowerShell was not found`: install `pwsh` or Windows PowerShell on remote host.
- `PnP.PowerShell module was not found`: install module on host (`Install-Module PnP.PowerShell -Scope CurrentUser`).
