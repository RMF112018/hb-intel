# Prompt 03 — Backend GET-Only Mock Read Model

## Objective

Add a Wave 12 GET-only backend mock read model route/provider following existing PCC read-model conventions. The route must serve deterministic fixture-backed Constraints Log read-model data and preserve safe degraded/unknown-project behavior.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```


## Global Guardrails

You must preserve these guardrails throughout this prompt:

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting across the repo.
- Do not make source/runtime changes outside this prompt scope.
- Do not change dependencies, package manifests, lockfiles, workflows, CI, SPFx packaging, deployment files, app settings, secrets, or tenant settings unless this prompt explicitly authorizes a narrow change and you can justify it.
- Do not add runtime calls to Microsoft Graph, PnP, SharePoint REST, Procore, Sage, Primavera/P6, Autodesk, AHJ portals, utility portals, Document Crunch, Adobe Sign, or other external systems.
- Do not add backend write routes.
- Do not add scraping, polling, sync, mirroring, writeback, or external-system mutation behavior.
- Do not implement evidence-binary upload/download/sync/storage behavior.
- Do not execute approvals/checkpoints owned by Wave 14.
- Do not provide legal advice, infer claim entitlement, determine compensability, calculate delay damages, decide notice sufficiency, or perform forensic schedule-analysis conclusions.
- Stop and report if local repo truth contradicts Wave 12 documentation or this prompt.


## Allowed / Likely Files

Use Prompt 01's exact allowed-file list. Likely files include:

```text
backend/functions/src/hosts/pcc-read-model/
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/services/__tests__/
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/ConstraintsLog.ts
packages/models/src/pcc/fixtures/constraintsLog.ts
packages/models/src/pcc/index.ts
```

Do not touch SPFx UI files in this prompt.

## Prohibited Scope

- No backend write routes.
- No queue/timer/webhook routes.
- No external calls.
- No Graph, PnP, SharePoint REST, Procore, Primavera/P6, Sage, Autodesk, AHJ, utility portal, Document Crunch, or Adobe Sign runtime behavior.
- No evidence-binary operations.
- No approval execution.
- No legal/claim/delay determinations.


## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` as the controlling file map. At minimum inspect the files relevant to this prompt scope, then rely on Prompt 01 findings where still current.


## Implementation Steps

1. Verify Prompt 02 committed model/fixture contracts and source-model placement correction.
2. Inspect existing `pcc-read-model` host route/provider conventions and tests.
3. Add a Wave 12 read-model contract shape only if not already added in Prompt 02.
4. Add deterministic mock provider behavior for known project IDs using shared fixtures.
5. Add degraded/unknown-project behavior consistent with existing PCC read-model envelope/source-status conventions.
6. Add a GET-only route under the existing PCC read-model route family, using repo-standard path naming.
7. Ensure route returns stable envelopes with source status and warnings when degraded.
8. Ensure the route does not mutate anything and does not import prohibited runtime clients.
9. Add tests proving:
   - route is GET-only;
   - known project response shape;
   - unknown/degraded response behavior;
   - source-status/warning semantics;
   - no write route was added;
   - no prohibited imports were introduced;
   - no external-system calls exist.

## Expected Route Shape

Do not invent a path if repo conventions point elsewhere. Expected family, subject to local repo truth:

```text
GET /api/pcc/projects/{projectId}/constraints-log
```

If existing conventions use a different noun or path structure, follow repo conventions and document the reason in final output.


## Validation Commands

Run only repo-appropriate commands based on touched files and actual package scripts. Inspect package scripts before treating any package command as mandatory.

Baseline before edits:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Core validation after edits:

```bash
git diff --check
pnpm exec prettier --check <touched markdown/json files>
git diff --name-only
git diff --cached --name-only
git diff --cached --stat
git status --short
md5 pnpm-lock.yaml
```

Package validation, as applicable after local script inspection:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```



## Staged-File Proof Before Commit

Before committing, show:

```bash
git diff --cached --name-only
git diff --cached --stat
md5 pnpm-lock.yaml
```

If `pnpm-lock.yaml` changed, stop and report unless this prompt explicitly authorized a dependency change.



## Commit Requirements

Use this format in your final response:

```text
Commit summary:
<type(scope): concise summary>

Commit description:
<short body explaining what changed, what was validated, and what was intentionally not changed>
```


Suggested commit summary:

```text
feat(functions-pcc): add constraints log read model
```

Suggested commit description:

```text
Adds a GET-only Wave 12 Constraints Log backend read-model provider and route with deterministic mock data, degraded/unknown-project handling, source-status warnings, and no external-system or mutation behavior.
```


## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
- State the exact commit hash if a commit was created.
