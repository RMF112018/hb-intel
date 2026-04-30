# Prompt 05 — Wave 3 Read-Only Backend Routes, Mock Mode Only

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Implement the initial read-only PCC backend route family using the mock/local read-model provider from Prompt 04.

These routes must be GET-only, read-only, mock/local-provider-backed, and non-operational. They must not mutate tenant resources, call Graph/PnP/SharePoint REST, call Procore, execute workflows, execute approvals, execute repairs, or invoke provisioning.

## Required Prerequisite

Verify:

- `Wave_3_Backend_Mock_Provider_Closeout.md` exists.
- backend mock provider tests passed.
- provider has no route registration yet.
- `Wave_3_Backend_Route_and_DTO_Placement.md` finalized the route namespace.

If missing or contradictory, stop and document the blocker.

## Required Initial Routes

Implement only the route list approved in Prompt 02. Unless repo truth says otherwise:

```text
GET /api/pcc/projects/{projectId}/profile
GET /api/pcc/projects/{projectId}/modules
GET /api/pcc/projects/{projectId}/home
GET /api/pcc/projects/{projectId}/priority-actions
GET /api/pcc/projects/{projectId}/document-control
GET /api/pcc/projects/{projectId}/external-links
GET /api/pcc/projects/{projectId}/site-health
```

Do not add write routes.

## Required Backend Patterns

Follow existing backend conventions:

- Azure Functions route registration style used by repo.
- `withAuth()` if the route family should require authentication under existing backend doctrine.
- request ID propagation.
- existing response helpers.
- existing validation helpers where applicable.
- package-scoped tests.

If auth posture is ambiguous, implement the safest repo-consistent authenticated route posture and document the decision. Do not invent a weaker public route posture.

## Allowed Files

Modify only:

```text
backend/functions/src/**
backend/functions/package.json only if strictly required and justified
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Read_Only_Routes_Closeout.md
```

Avoid package manifest edits unless required by existing backend registration patterns.

## Forbidden Work

Do not add:

- POST, PATCH, PUT, DELETE, or mutation routes;
- route names containing apply, execute, provision, repair, scan, sync, mirror, writeBack, upload, delete, mutate, approve, reject, permission;
- Graph/PnP/SharePoint REST calls;
- Procore runtime or SDK;
- Document Crunch runtime;
- Adobe Sign runtime;
- tenant mutation;
- provisioning executor invocation;
- repair runner;
- scanner;
- approval execution;
- permission execution;
- persistence writes;
- workflow writes;
- deployment workflows;
- `.sppkg`;
- app catalog changes.

## Required Route Behavior

Each route must:

- return a typed `PccReadModelEnvelope<T>`;
- use the mock/local provider;
- handle unknown project IDs with repo-consistent error/empty semantics;
- preserve request IDs if existing helper patterns support them;
- return read-only metadata;
- include source/mode/status metadata as defined in the shared contracts.

## Required Tests

Add tests proving:

1. each route is registered;
2. each route calls the provider and returns the correct envelope shape;
3. unknown project ID behavior is stable;
4. no write methods are registered;
5. route source has no forbidden runtime imports;
6. route source has no mutation verbs in executable seams;
7. auth/unauthorized behavior matches existing backend patterns, if auth is applied.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
```

If other backend smoke/contract tests are repo-standard for route registration, run the narrowest applicable test and document it.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Read_Only_Routes_Closeout.md
```

Closeout must include:

- files changed;
- routes added;
- provider used;
- auth posture;
- no-write/no-mutation confirmation;
- forbidden-work confirmation;
- validation results;
- package/lockfile status;
- recommended next prompt.

## Expected Commit Summary

```text
feat(functions-pcc): add read-only pcc mock read-model routes
```

## Expected Commit Description

```text
Adds the initial Phase 3 Wave 3 PCC backend route family as GET-only mock read-model endpoints.

Routes return typed PCC read-model envelopes from the mock/local provider. No write routes, Graph/PnP calls, SharePoint REST calls, Procore runtime, Document Crunch runtime, Adobe Sign runtime, provisioning executor, repair runner, scanner, approval execution, permission execution, workflow writes, persistence writes, deployment, `.sppkg`, app catalog, package/version bump, or tenant mutation is introduced.
```
