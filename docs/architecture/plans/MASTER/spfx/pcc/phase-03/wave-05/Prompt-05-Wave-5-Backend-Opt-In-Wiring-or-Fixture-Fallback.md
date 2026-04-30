# Prompt 05 — Wave 5 Backend Opt-In Wiring or Fixture Fallback

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not reread files that are still available in your current context or memory. Do not implement Prompt 06 or 07 early. Use repo truth only. If repo truth conflicts with the Wave 5 scope lock, closed decision register, or Prompts 02–04 output, stop and report the conflict.

## Objective

Wire the existing standalone `priority-actions` read-model route into Project Home **only under the existing explicit backend opt-in seam**, after the local rail adapter/UI/integration path is stable.

If repo truth shows the route/client/guard posture has drifted, do not force the wiring. Instead, document explicit deferral and preserve fixture fallback behavior.

## Repo-Truth Basis

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Closed_Decisions.md
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClientFactory.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
```

## Allowed Files

Modify only if wiring proceeds:

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.test.ts
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.ts
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.test.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/README.md
```

If the controlled-consumption guard must be updated in the same prompt to reflect the new expected `priority-actions` GET call count, modify only the specific assertions needed in:

```text
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
```

If wiring is deferred, create only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Backend_Priority_Actions_Deferral.md
```

## Forbidden Files / Forbidden Scope

Do not modify:

```text
packages/**
backend/**
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClientFactory.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/mount.tsx
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
pnpm-lock.yaml
package.json
.github/**
*.json manifests
```

Do not create new transport/client files. Do not add a new `fetch(` callsite. Do not add auth headers or token acquisition.

## Implementation Requirements if Wiring Proceeds

Update the narrow Project Home consumer interface so Project Home can call `getPriorityActions` without exposing transport details to card/UI components.

Expected shape:

```ts
getPriorityActions(projectId, viewerPersona?): Promise<PccReadModelEnvelope<PccPriorityActionsReadModel>>
```

Update `useProjectHomeReadModel` so explicit read-model-client mode fetches:

- `getProjectHome(projectId)`;
- `getPriorityActions(projectId)`;
- `getDocumentControl(projectId)`.

Use `Promise.all` and preserve cancellation behavior.

Update `projectHomeAdapter` so:

- `priorityActions` slot uses the standalone `priority-actions` envelope when provided;
- Project Home can still use fixture/default actions before the opt-in hook resolves;
- backend-unavailable priority-actions envelope maps only the Priority Actions card/rail into the proper fallback/error state;
- other Project Home slots still derive from their current envelopes.

Update `PccProjectHomeReadModelContent` so:

- `PccPriorityActionsCard` continues to receive `state` and `actions` from the Project Home view-model slot;
- the initial loading microtask still falls back to fixture visual baseline.

Update tests to prove:

- default `<PccApp />` performs no fetch;
- explicit fixture mode performs no fetch or behaves consistently with existing fixture-client expectations;
- explicit backend mode now issues exactly three Project Home GETs: `/home`, `/priority-actions`, `/document-control`;
- no other surfaces receive `readModelClient`;
- backend-unavailable/fallback envelope produces safe UI state;
- no new `fetch(` callsite exists beyond the existing backend client and test.

Update README to correct prior Wave 4 language from “Project Home consumes only two routes” to the Wave 5 truth after wiring.

## Implementation Requirements if Wiring Is Deferred

If route/client/guard posture has drifted or wiring cannot be done safely, create `Wave_5_Backend_Priority_Actions_Deferral.md` documenting:

- what was inspected;
- why wiring was deferred;
- what remains fixture-driven;
- what must be true before a future prompt wires the route;
- confirmation that default fixture behavior is unchanged.

Do not partially wire backend consumption.

## Guardrails to Preserve

- Fixture remains default.
- Backend read-model mode remains explicit opt-in only.
- No backend default.
- No new `fetch(` callsites.
- No new backend route.
- No backend write route.
- No package/lockfile/manifest/workflow/deployment changes.
- No Graph/PnP/SharePoint REST runtime.
- No Procore/Document Crunch/Adobe Sign runtime.
- No auth token wiring.
- No action execution.
- Project Home remains the only read-model consumer.
- `PccSurfaceRouter` must still thread `readModelClient` to exactly one surface.

## Tests / Validation Commands

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- useProjectHomeReadModel
pnpm --filter @hbc/spfx-project-control-center test -- projectHomeAdapter
pnpm --filter @hbc/spfx-project-control-center test -- PccApp.optIn
pnpm --filter @hbc/spfx-project-control-center test -- pcc-api-dormancy
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
git status --short
git diff --stat HEAD
git diff --name-only HEAD
```

If backend route truth was touched only by inspection, do not modify or run backend build unless a test failure requires confirming existing route posture. Do not run deployment, tenant, app-catalog, or hosted validation commands.

## Stop Conditions

Stop without wiring if:

- Prompts 02–04 are not complete and accepted.
- The existing backend route `getPccProjectPriorityActions` is missing.
- The SPFx backend client no longer supports `getPriorityActions`.
- Wiring requires a new fetch callsite.
- Wiring requires changes to backend files, `src/api` transport files, `mount.tsx`, `PccApp.tsx`, or `PccSurfaceRouter.tsx`.
- The default path would fetch.
- Tests cannot preserve Project Home-only consumer posture.

## Required Closeout Response

End with:

- files changed;
- whether wiring proceeded or was deferred;
- route/client inspected;
- default fixture proof;
- explicit backend opt-in proof;
- GET count proof if wired;
- fallback behavior proof;
- validation results;
- lockfile md5 before/after;
- explicit confirmation of no new fetch, no backend default, no write route, no auth, no runtime/deployment changes.

## Recommended Commit Summary if Wiring Proceeds

```text
feat(spfx-pcc): wire priority actions route into backend opt-in project home
```

## Recommended Commit Description if Wiring Proceeds

```text
Wires the existing priority-actions read-model route into Project Home under the existing explicit backend opt-in seam for Wave 5.

Extends the narrow Project Home read-model consumer interface to include getPriorityActions, updates the Project Home hook/adapter/content flow to use the standalone priority-actions envelope, and updates tests/docs so explicit backend mode consumes home, priority-actions, and document-control while default fixture rendering performs no fetch.

No new transport file, new fetch callsite, backend route, write route, backend default, auth wiring, tenant mutation, package/lockfile change, manifest change, workflow change, deployment, .sppkg, app catalog upload, hosted validation, or production rollout is introduced.
```

## Recommended Commit Summary if Deferred

```text
docs(pcc): defer wave 5 priority actions backend wiring
```

## Recommended Commit Description if Deferred

```text
Documents deferral of standalone priority-actions backend read-model consumption for Wave 5 after repo-truth inspection.

Preserves fixture-default Project Home behavior and records the route/client/guard conditions required before a future prompt can safely wire getPriorityActions under explicit backend opt-in mode.

No source code, backend runtime, new fetch callsite, write route, backend default, tenant mutation, package/lockfile change, manifest change, workflow change, deployment, .sppkg, app catalog upload, hosted validation, or production rollout is introduced.
```
