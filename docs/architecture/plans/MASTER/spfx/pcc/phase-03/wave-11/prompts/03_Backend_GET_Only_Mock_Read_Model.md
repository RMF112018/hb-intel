# Prompt 03 — Backend GET-Only Mock Read Model

## Objective

Add a GET-only backend mock read-model endpoint for the Responsibility Matrix, using the existing PCC read-model route/provider/envelope convention.

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
- Do not change dependencies, package manifests, lockfiles, workflows, CI, SPFx packaging, deployment files, app settings, or secrets unless this prompt explicitly authorizes a narrow change and you can justify it.
- Do not add runtime calls to Graph, PnP, SharePoint REST, Procore, Sage, AHJ portals, Document Crunch, Adobe Sign, or other external systems.
- Do not add backend write routes.
- Do not mutate Team & Access state.
- Do not execute approvals/checkpoints owned by Wave 14.
- Do not implement evidence file upload/download/sync/storage behavior.
- Do not provide legal advice, infer legal obligations, create legal obligations, or replace executed contracts.
- Stop and report if local repo truth contradicts the Wave 11 documentation package or this prompt.

## Allowed / Likely Files

Use Prompt 01/02 results. Likely files include:

```text
packages/models/src/pcc/PccReadModels.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/services/__tests__/<repo-consistent guardrail tests>
```

## Required Backend Behavior

Implement a GET-only endpoint in the repo-consistent route pattern, likely:

```text
GET /api/pcc/projects/{projectId}/responsibility-matrix
```

The endpoint must return:

- `PccReadModelEnvelope<PccResponsibilityMatrixReadModel>` or repo-consistent equivalent;
- `readOnly: true`;
- deterministic fixture data;
- known-project available state;
- unknown-project degraded/source-unavailable state;
- backend-unavailable simulation if provider pattern supports it;
- warnings for owner-contract placeholder/schema-only posture and ambiguous source semantics where appropriate.

## Prohibited Backend Behavior

Do not add:

- POST/PUT/PATCH/DELETE routes;
- approval execution;
- Team & Access mutation;
- Document Control binary storage;
- Graph/PnP/SharePoint REST/Procore/Sage/AHJ runtime calls;
- external writeback/sync/mirror;
- legal interpretation;
- auth model changes unless existing route pattern requires a narrow typed update.

## Required Tests

Add or extend backend tests to prove:

- only GET is registered;
- route returns read-only envelope;
- fixture count metadata is present;
- degraded unknown-project envelope is safe;
- no forbidden runtime imports/calls appear in touched backend source;
- response-map/provider interfaces remain type-safe;
- route family matches existing PCC read-model conventions.

## Validation Commands

Run only repo-appropriate commands based on touched files and actual package scripts.

Baseline before edits:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml
```

Core validation after edits:

```bash
git diff --check
pnpm exec prettier --check <touched files>
git diff --cached --name-only
git status --short
md5 pnpm-lock.yaml
```

Package validation, as applicable:

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

## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
