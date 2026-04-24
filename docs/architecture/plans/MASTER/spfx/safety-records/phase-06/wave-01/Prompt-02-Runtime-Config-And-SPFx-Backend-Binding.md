# Prompt 02 — Runtime Config and SPFx Backend Binding

## Objective

Add a fail-closed Safety runtime contract that injects and validates backend command configuration in SharePoint-hosted mode.

## Governing authorities

- Microsoft SPFx guidance for Entra-secured APIs and API permission approval.
- Backend routes in `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`.
- Safety frontend mount/app seams.

## Files / seams to inspect

- `apps/safety/src/App.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/mount.tsx` if present or required
- `apps/safety/src/runtime/*`
- `config/package-solution.json`
- SPFx property pane and tenant packaging config

## Current gap

Public-main Safety app can render in SharePoint without a backend base URL or API audience. That allows a visually functional but backend-unwired app to ship.

## Required implementation outcome

Implement:
- `functionAppUrl` runtime config;
- `apiAudience` runtime config;
- strict URL validation;
- strict required-config behavior in SharePoint mode;
- visible blocked state when required config is missing;
- property pane or tenant-hosted config source;
- release documentation for CORS and API permission approval.

Do not allow SharePoint-hosted command mode to silently fall back to mock mode.

## Proof required

The closure report must include:
- exact files changed;
- route/auth/contract behavior proven;
- before/after screenshots or test output where UI is changed;
- unit/integration tests added or updated;
- build/package commands run and results;
- explicit statement of any remaining risk.

## Change control

Do not make unrelated homepage, shell, publisher, Kudos, or non-Safety changes.

Do not confuse "the UI renders" with "the app is production ready."

Do not re-read files already in active context unless needed to confirm drift, changed dependencies, or uncertainty after changes.
