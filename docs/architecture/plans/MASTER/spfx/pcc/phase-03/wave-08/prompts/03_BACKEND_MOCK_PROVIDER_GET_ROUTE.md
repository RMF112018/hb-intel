<!--
PCC Phase 3 Wave 8 Prompt Bundle
Use this file as a standalone prompt for the local code agent.
Do not combine with later prompts until this prompt has been completed, validated, committed, and closed out.
-->

## Package-Level Operating Rules

- Work in `/Users/bobbyfetting/hb-intel`.
- Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
- Protect unrelated working-tree changes. Record them, do not overwrite them, and do not stage them.
- Do not use `git add .` or broad staging.
- Use explicit path staging only.
- Run `git diff --check` before commit.
- Record `md5 pnpm-lock.yaml` before and after.
- Do not run `pnpm install`, `pnpm add`, or `pnpm update` unless explicitly authorized.
- Do not edit `docs/architecture/plans/**` unless this prompt explicitly authorizes it. Prefer current-state documentation under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/`.
- Preserve Wave 8 as the Project Readiness Module Framework; do not implement Wave 9 checklist content, Wave 10 Permit Log, Wave 11 RACI, Wave 12 Constraints Log, Wave 13 Buyout Log, or Wave 14 Approvals runtime.
- Preserve no-mutation posture: no live Graph file operations, SharePoint list mutations, tenant mutations, permission mutations, Procore runtime/writeback, external-system writeback, approval/workflow execution, secrets/app settings, SPFx package/deployment, or production rollout.

---

# Prompt 03 — Backend Mock Provider and GET-Only Route-Family Extension

## Role

You are a backend TypeScript implementer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Extend the existing PCC read-model backend mock provider and GET-only route family to expose the Wave 8 Project Readiness Framework read model.

This must remain mock/read-only. No live integrations, persistence, mutations, external clients, or tenant operations.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Required preconditions

Verify Prompt 02 landed and `@hbc/models/pcc` exports the readiness framework contracts and fixture.

If readiness model contracts do not exist, stop and report the blocker.

## Files to inspect

```text
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts
backend/functions/package.json
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
```

## Files you may modify

Expected:

```text
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts
```

Do not modify:

```text
apps/**
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required implementation

Add provider method:

```ts
getProjectReadiness(
  projectId: PccProjectId,
  viewerPersona?: PccPersona,
): Promise<PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>>
```

Add GET-only route:

```text
pcc/projects/{projectId}/project-readiness
```

Recommended Azure Function route name:

```text
getPccProjectReadiness
```

Preserve response shape:

```ts
{ data: envelope }
```

Unknown projects should return a source-unavailable or degraded envelope consistent with existing provider patterns.

## Required tests

Update route tests to expect **exactly nine** approved GET-only routes, including `project-readiness`.

Prove:

- route path is `pcc/projects/{projectId}/project-readiness`;
- method is GET only;
- no POST/PUT/PATCH/DELETE;
- existing auth wrapper posture remains;
- provider method is called with projectId;
- response shape is `{ data: envelope }`;
- unknown project behavior returns a read-only source-unavailable/degraded envelope;
- no prohibited runtime imports are introduced.

## Forbidden runtime behavior

Do not introduce:

- Graph/PnP/SharePoint REST;
- Procore/Sage/Adobe/Document Crunch clients;
- Azure Tables or persistence writes;
- write routes;
- POST/PUT/PATCH/DELETE;
- scoring engines;
- workflow execution;
- tenant mutation;
- package changes.

## Validation commands

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

Run model validation if imports or model contracts were touched:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
feat(functions-pcc): add project readiness mock read-model route
```

## Commit body

```text
Extends the PCC read-model mock provider and GET-only route family for Phase 3 Wave 8 Project Readiness Module Framework.

Adds a read-only project-readiness envelope route backed by deterministic @hbc/models fixtures and updates route/provider tests to preserve GET-only, authenticated, mock-provider, no-mutation behavior.

No write routes, persistence writes, Graph/PnP/SharePoint REST runtime, Procore/Sage/Document Crunch/Adobe runtime, workflow execution, scoring engine, tenant mutation, package/dependency changes, lockfile changes, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- route added;
- explicit exclusions;
- remaining risks;
- recommended next prompt: Prompt 04.

---
