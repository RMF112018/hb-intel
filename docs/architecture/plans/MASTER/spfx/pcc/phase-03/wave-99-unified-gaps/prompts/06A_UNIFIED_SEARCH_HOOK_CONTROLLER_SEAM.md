# Prompt 06A — Unified Search / Ask-HBI Hook Controller Seam

## Objective

Add the SPFx hook/controller seam that consumes the existing canonical unified search client method:

```ts
getUnifiedSearch(projectId, viewerPersona?, query?)
```

This prompt must not build new UI cards and must not integrate anything into Project Home, Project Readiness, shell routing, or the mount layer.

The hook/controller should prepare Prompt 06B for a preview-safe Ask-HBI experience while keeping live LLM/search/vector/external integrations out of scope.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 05D has completed and confirmed closeout readiness.

Expected repo truth:

- `IPccReadModelClient.getUnifiedSearch(projectId, viewerPersona?, query?)` exists.
- The canonical route ID is `unified-search`.
- `UnifiedProjectSearchPreview` already exists as a presentational component with no input/client/hook/fetch/router behavior.
- Unified search view-model types already exist in `surfaces/unifiedLifecycle/unifiedLifecycleViewModel.ts`.

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify uncommitted files as user-owned, agent-owned, or unknown. Preserve unrelated and user-owned files.

## Files to Inspect

Inspect only as needed:

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/unifiedLifecycleViewModel.ts`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/unifiedLifecycleAdapter.ts`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/components/UnifiedProjectSearchPreview.tsx`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/useUnifiedLifecycleReadModel.ts`
- existing hook tests under `apps/project-control-center/src/tests/`

Do not re-read files still in current context unless required to verify repo truth.

## Required Work

Add a focused hook/controller seam for unified search.

Recommended file:

```text
apps/project-control-center/src/surfaces/unifiedLifecycle/useUnifiedSearchReadModel.ts
```

If repo conventions require a different filename, follow repo conventions.

The hook/controller should:

- accept a narrow client interface, project ID, optional viewer persona, and selected query;
- call only `client.getUnifiedSearch(projectId, viewerPersona?, query?)`;
- convert the returned envelope into `IPccUnifiedSearchViewModel` using the existing adapter path;
- own runtime wrapper states:
  - `idle` or `not-started`;
  - `loading`;
  - `ready`;
  - `error`;
- distinguish hook-level rejected promise from envelope-level `backend-unavailable` / `source-unavailable`;
- preserve refusal and grounded-answer posture from the fixture data;
- remain project-scoped by default;
- never call live search/LLM/vector/external systems.

Recommended narrow interface:

```ts
export interface IPccUnifiedSearchReadModelClient {
  getUnifiedSearch(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
    query?: string,
  ): Promise<PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel>>;
}
```

Spell the interface inline. Do not use indexed access against `IPccReadModelClient` if that triggers dormancy/source-guard rules.

## Query Handling

The hook should support a selected query value but should not own a full interactive UI.

Rules:

- prefer `idle` with no client call for blank/undefined/whitespace query;
- trim query values before deciding whether to call;
- pass the trimmed query as the third argument;
- do not serialize query yourself; backend client already maps query to `q`.

## Explicit Non-Goals

Do not modify:

- Project Home.
- Project Readiness.
- Shell/router/mount.
- `src/api/**`.
- backend.
- models.
- package files.
- lockfile.
- docs.
- manifests.

Do not add:

- visual cards;
- query input UI;
- sample query buttons;
- route/workspace registration;
- live LLM/vector/search integration;
- external writes.

## Tests

Add a focused test file, for example:

```text
apps/project-control-center/src/tests/useUnifiedSearchReadModel.test.ts
```

Tests must prove:

1. blank/whitespace query returns idle/no-call;
2. nonblank query calls `getUnifiedSearch(projectId, viewerPersona, trimmedQuery)` exactly once;
3. ready state contains the adapted unified search view model;
4. grounded answers preserve citations;
5. refusal answers preserve refusal reason and empty citations;
6. `backend-unavailable` envelope remains hook-level ready with card state error/degraded posture;
7. rejected promise becomes hook-level error;
8. changing query refetches once per query change;
9. unmount/cancellation does not late-write state;
10. the hook does not call:
    - `getUnifiedLifecycle`
    - `getProjectMemory`
    - `getProjectLenses`
    - `getProjectTraceability`
    - `getWarrantyTrace`
    - `getCrossProjectKnowledge`
11. source scan confirms no live LLM/vector/Graph/Procore/Sage/CRM/search imports.

Use current hook test conventions from 05A.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

Do not run functions tests unless backend files are changed, which should not happen.

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Hook/controller seam added.
4. Tests added/updated.
5. Validation results.
6. Lockfile MD5 before/after.
7. Remaining gaps for Prompt 06B.
8. Commit hash if committed.
9. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 06A-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(spfx-pcc): add unified search hook seam
```
