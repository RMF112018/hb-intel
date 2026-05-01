# Prompt 03 — Wave 9 Backend Mock Read-Model and GET Route

## Objective

Extend the PCC backend mock read-model provider with a read-only Project Lifecycle Readiness Center envelope and a GET-only route if repo truth and Prompt 01 authorize route extension.


## Mandatory Preflight

Run before any edits:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated pre-existing changes and do not stage or modify them. Do not use `git add .`. Stage only explicit paths approved by this prompt.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.


## Preconditions

- Prompt 02 approved and committed.
- Shared `@hbc/models/pcc` lifecycle readiness types/fixtures exist.
- Route extension is authorized by Prompt 01 and current Wave 9 docs.

## Allowed Files

```text
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
backend/functions/src/hosts/pcc-read-model/read-models/
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/services/__tests__/
```

## Implementation Requirements

- Add a lifecycle-readiness read-model entry to the shared response map.
- Extend provider interface with `getLifecycleReadiness` or repo-consistent equivalent.
- Extend mock provider to return deterministic startup/safety/closeout readiness data from `@hbc/models/pcc` fixtures.
- Register a GET-only route using the repo’s route-family pattern, likely:

```text
pcc/projects/{projectId}/lifecycle-readiness
```

- Update exact route-count tests deliberately.
- Preserve withAuth/read-only/envelope posture from existing routes.
- Unknown project should return source-unavailable envelope, not throw.
- Backend-unavailable simulation should return degraded envelope.
- No POST/PUT/PATCH/DELETE routes.
- No writes/persistence/external runtime.


## Forbidden Scope

Do not implement or introduce:

- live Microsoft Graph file operations;
- live SharePoint/PnP/SharePoint REST operations;
- SharePoint list/library mutation or provisioning;
- tenant mutation;
- permission/group mutation;
- Procore runtime/API integration or writeback;
- Sage runtime/API integration or writeback;
- Outlook/calendar/email runtime mutation;
- Document Crunch or Adobe Sign runtime/writeback;
- Safety platform runtime integration;
- workflow/approval execution;
- Power Automate flows;
- notifications;
- production persistence writes;
- package/dependency/version/manifest changes unless this prompt explicitly authorizes and proves need;
- SPFx packaging/deployment/app-catalog upload;
- secrets/app settings;
- broad format rewrites outside touched files.


## Validation

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
git diff --check
md5 pnpm-lock.yaml
```

## Commit

Summary:

```text
feat(functions-pcc): add lifecycle readiness read model
```

Body:

```text
Adds a read-only Wave 9 lifecycle-readiness mock read-model envelope and GET-only PCC route for Project Lifecycle Readiness Center posture. Extends shared read-model mappings, provider contracts, mock provider data, route registration, and tests while preserving deterministic fixture-backed behavior and no-write/no-mutation guardrails.

No persistence, write route, Graph/PnP, SharePoint REST, Procore, Sage, Outlook, approval execution, notification, package, lockfile, manifest, workflow, deployment, tenant, or production changes are introduced.
```


## Required Closeout Response

Your final response must include:

- files changed;
- validation results;
- lockfile MD5 before/after;
- package/dependency/manifest status;
- explicit exclusions;
- remaining risks/operator-pending items;
- recommended next prompt.

If committing, use explicit path staging only. Do not use `git add .`.
