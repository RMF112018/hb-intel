# Prompt 01 — Reconcile Repo Truth and Build State

## Objective

Before implementation, establish one authoritative repo/build/deploy truth for the Safety app.

The audit found a serious conflict: public raw `main` shows an older direct-submit Safety frontend, while other repo access paths surfaced later-phase candidate code. You must resolve this before writing code.

## Governing authorities

- `apps/safety/`
- `packages/features/safety/`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- SPFx package/build pipeline
- current `main` branch checkout

## Files / seams to inspect

- `apps/safety/src/App.tsx`
- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/router/routes.ts`
- `packages/features/safety/src/index.ts`
- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/adapters/sharepoint/*`
- package/build output paths for Safety/SPFx

## Current gap

There is no trustworthy evidence that the advanced preview/command frontend is actually present in the deployable source on `main`. Implementing against stale or phantom files risks producing another closure report that does not affect the live package.

## Required implementation outcome

Produce a repo-truth report before changes:
- exact branch and commit SHA;
- whether `UploadPage.tsx` is direct-submit or preview-first;
- whether `useSafetyIngestionPreview` exists and is exported;
- whether a typed backend command client exists;
- whether `SafetyWebPart` has `functionAppUrl` and `apiAudience`;
- whether the built package includes the expected source;
- whether deployed artifact packaging can be traced to the same commit.

If drift exists, fix the source-of-truth issue first or clearly quarantine stale/generated artifacts.

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
