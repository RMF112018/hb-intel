# Prompt 04 — SPFx Read-Model Client and Fixture Parity

## Objective

You are working in `/Users/bobbyfetting/hb-intel`.

Add SPFx read-model client and fixture parity for the Phase 3 / Wave 10 Permit & Inspection Control Center read model.

This prompt must preserve the app’s fixture-default posture. Backend reads may be represented only through the existing explicit backend opt-in pattern.

Do not build the user-facing Wave 10 UI in this prompt except for minimal test fixtures or type wiring required to prove the client shape.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Repo-Truth Files to Inspect

Use previous prompt findings first. Re-open only as needed:

- `packages/models/src/pcc/PermitInspectionControlCenter.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClient.test.ts`
- `apps/project-control-center/src/api/index.ts`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `apps/project-control-center/package.json`

## Allowed Files / Likely Files

Use Prompt 01’s exact allowed list. Likely allowed files:

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/index.ts`
- `apps/project-control-center/src/api/pccReadModelClient.test.ts`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `packages/models/src/pcc/PccReadModels.ts` only if a missing type-map adjustment remains

Do not touch package manifests or lockfiles.

## Required Client Behavior

Extend the SPFx read-model client boundary with:

- route ID: `permit-inspection-control-center`, unless Prompt 01 found a repo-required alternative;
- route path: `pcc/projects/{projectId}/permit-inspection-control-center`;
- interface method equivalent to `getPermitInspectionControlCenter(projectId, viewerPersona?)`;
- fixture client implementation returning deterministic `mode: 'fixture'` envelopes;
- backend client implementation using the existing GET-only backend client pattern, not a new freehand runtime pattern.

The fixture client must:

- return the same data shape as the backend mock provider;
- support `simulateBackendUnavailable`;
- preserve unknown-project handling consistent with existing fixture client behavior;
- perform no HTTP calls.

The backend client must:

- use only the existing internal GET/fetch wrapper pattern if present;
- not add additional `fetch(` callsites unless the existing backend client architecture requires it and tests are updated accordingly;
- not add auth wiring or external runtime integrations.

## Prohibited Scope

Do not edit `docs/architecture/plans/**`.

Do not build Wave 10 SPFx UI.

Do not add package dependencies.

Do not change package manifests.

Do not change `pnpm-lock.yaml`.

Do not change SPFx manifests.

Do not change CI/workflows.

Do not run broad formatting.

Do not introduce AHJ scraping, AHJ API calls, AHJ inspection scheduling, AHJ permit submission, or AHJ status polling.

Do not introduce Procore runtime integration.

Do not introduce Microsoft Graph runtime integration.

Do not introduce SharePoint REST or PnP runtime operations.

Do not introduce evidence upload, sync, mirror, or storage behavior.

Do not introduce backend write behavior.

Do not introduce approval execution.

Do not introduce production rollout or deployment behavior.

## Implementation Steps

1. Capture baseline:

```bash
git status --short
md5 pnpm-lock.yaml
```

2. Extend route ID/path metadata.

3. Extend the `IPccReadModelClient` interface.

4. Implement the fixture client method from deterministic Wave 10 fixtures.

5. Implement backend client parity using the existing GET-only route convention.

6. Export new client types/functions through existing API barrel patterns.

7. Add or extend tests proving:
   - route ID/path exists;
   - fixture and backend client expose the same method shape;
   - fixture client returns `readOnly: true`;
   - fixture client uses no HTTP calls;
   - backend client path matches backend route;
   - forbidden external runtime imports remain absent;
   - default app behavior is still fixture-first.

## Validation Commands

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
pnpm exec prettier --check <exact touched files>
md5 pnpm-lock.yaml
```

Confirm the lockfile hash is unchanged from baseline.

## Staged-File Proof Before Commit

Before committing, run:

```bash
git status --short
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Stage only files touched for this prompt. Do not stage unrelated files.

## Commit Instructions

Commit summary:

```text
feat(spfx-pcc): add permit inspection read-model client parity
```

Commit description:

```text
Adds SPFx read-model client and fixture parity for the Phase 3 Wave 10 Permit & Inspection Control Center read model.

Extends route metadata, client interface, fixture client, backend client, and tests while preserving fixture-first default behavior and explicit backend opt-in posture.

No Wave 10 UI buildout, package/dependency change, lockfile change, manifest change, CI/workflow change, AHJ runtime, Procore runtime, Microsoft Graph runtime, SharePoint REST/PnP runtime, evidence storage, backend write, approval execution, tenant mutation, packaging, deployment, or production rollout.
```

## Final Output Requirements

Return:

1. files changed;
2. route metadata added;
3. client methods added;
4. fixture/backend parity proof;
5. validation results;
6. staged-file proof;
7. lockfile before/after hash;
8. commit hash;
9. confirmation that default SPFx behavior remains fixture-first.
