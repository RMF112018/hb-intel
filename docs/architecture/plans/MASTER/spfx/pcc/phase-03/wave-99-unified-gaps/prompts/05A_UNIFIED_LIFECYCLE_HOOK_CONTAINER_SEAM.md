# Prompt 05A — Unified Lifecycle Read-Model Hook / Container Seam

## Objective

Add the SPFx hook/container seam that consumes the unified lifecycle read-model client method added in Prompt 04A and converts the resulting envelope into the aggregate view model created in Prompt 04B.

This prompt prepares runtime consumption for Project Home and Project Readiness, but does **not** integrate any UI surfaces.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 04D has completed and confirmed Prompt 05 readiness.

Expected completed work:

- Prompt 04A:
  - `getUnifiedLifecycle(projectId, viewerPersona?)`
  - `getProjectMemory(projectId, viewerPersona?)`
  - `getProjectLenses(projectId, viewerPersona?)`
  - `getProjectTraceability(projectId, viewerPersona?)`
  - `getWarrantyTrace(projectId, viewerPersona?)`
  - `getCrossProjectKnowledge(projectId, viewerPersona?)`
  - `getUnifiedSearch(projectId, viewerPersona?, query?)`

- Prompt 04B:
  - `buildPccUnifiedLifecycleViewModel`
  - seven leaf adapters/view models

- Prompt 04C:
  - seven presentational preview components

- Prompt 04D:
  - seam hardening/readiness complete

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify uncommitted files as:

- user-owned;
- agent-owned;
- unknown.

Preserve unrelated and user-owned files.

## Files to Inspect

Inspect current hook/read-model patterns only as needed:

- `apps/project-control-center/src/surfaces/projectReadiness/use*ReadModel.ts`
- `apps/project-control-center/src/surfaces/teamAccess/useTeamAccessReadModel.ts`
- `apps/project-control-center/src/surfaces/documents/*ViewModel.ts`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/`
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/tests/`

Do not re-read files still in current context unless needed to verify repo truth.

## Required Work

Add a focused unified lifecycle hook/container seam.

Recommended file:

```text
apps/project-control-center/src/surfaces/unifiedLifecycle/useUnifiedLifecycleReadModel.ts
```

If repo conventions suggest a different filename, follow repo convention.

The hook should:

- accept a read-model client and project ID;
- call `client.getUnifiedLifecycle(projectId, viewerPersona?)`;
- convert the envelope with `buildPccUnifiedLifecycleViewModel`;
- own loading/error state;
- preserve the fixture fallback pattern used by comparable PCC surfaces if the repo already uses that pattern;
- return a discriminated state shape suitable for surface containers.

Recommended exported interface:

```ts
export interface IPccUnifiedLifecycleReadModelClient {
  getUnifiedLifecycle: IPccReadModelClient['getUnifiedLifecycle'];
}
```

Use the actual existing client types if they already export the right method shape.

## State Model

The hook/container seam may use `loading`, `error`, and `preview/ready` state because this is runtime consumption. This is intentionally different from the pure adapters created in Prompt 04B, which must remain envelope-in/view-model-out and should not own loading/error state.

The state model must distinguish:

- loading;
- error;
- available preview data;
- source-unavailable;
- backend-unavailable;
- unauthorized/forbidden if already represented by existing source-status mapping.

## Constraints

Do not modify:

- Project Home.
- Project Readiness.
- Shell/router.
- `PccSurfaceRouter`.
- `PccApp` / mount files.
- backend.
- models.
- package files.
- lockfile.
- docs/blueprint/canonical plan library.

Do not add:

- UI cards.
- new routes.
- new workspace.
- query input.
- active lens local state.
- external writes.
- live tenant integrations.

## Tests

Add focused tests for the hook/container seam.

Tests must prove:

- calls `getUnifiedLifecycle(projectId, viewerPersona?)`;
- returns loading initially if current hook conventions use initial loading state;
- converts an available envelope through `buildPccUnifiedLifecycleViewModel`;
- handles rejected client call as error state;
- preserves read-only/fixture posture in the returned VM;
- does not call any of the seven leaf routes in this hook;
- does not call unified search separately;
- uses no non-canonical route IDs;
- has no router/shell/workspace behavior.

Use existing hook testing conventions in the repo. If hook testing utilities are not present, use the simplest established pattern from neighboring hooks.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

Run models check only if a type issue implicates model exports:

```bash
pnpm --filter @hbc/models check-types
```

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Hook/container seam added.
4. Tests added/updated.
5. Validation results.
6. Lockfile MD5 before/after.
7. Remaining gaps for Prompt 05B.
8. Commit hash if committed.
9. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 05A-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(spfx-pcc): add unified lifecycle read-model hook seam
```
