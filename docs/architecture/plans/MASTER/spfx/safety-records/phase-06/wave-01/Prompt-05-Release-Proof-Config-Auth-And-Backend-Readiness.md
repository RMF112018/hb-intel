# Prompt 05 — Release Proof for Config, Auth, and Backend Readiness

## Objective

Create release-proof checks that prevent a visually rendered but backend-unwired Safety app from shipping.

## Governing authorities

- SPFx package build/deploy seams
- Azure Functions route surface
- backend `/api/health` and `/api/health/ready` semantics
- Safety runtime config contract

## Files / seams to inspect

- package/build scripts
- SPFx package-solution config
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/App.tsx`
- test/e2e harnesses
- docs under `docs/architecture/plans/MASTER/spfx/safety-records/`

## Current gap

There is no adequate proof that the hosted package contains the expected Safety source, points to the correct backend, obtains a valid delegated token, and receives classified route responses.

## Required implementation outcome

Add proof commands/docs/tests that show:
- clean build from exact commit;
- package contains expected upload/command code;
- SharePoint mode fails closed without config;
- configured SharePoint mode obtains token;
- unauthenticated preview returns 401;
- valid non-admin delegated user can call preview/ingest as permitted;
- non-admin cannot call provisioning;
- response includes `X-Request-Id`;
- CORS origin is correct for tenant.

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
