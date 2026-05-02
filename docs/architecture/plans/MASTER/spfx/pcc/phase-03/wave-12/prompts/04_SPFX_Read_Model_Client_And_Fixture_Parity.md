# Prompt 04 — SPFx Read-Model Client and Fixture Parity

## Objective

Add the typed SPFx client seam and fixture fallback for the Wave 12 Constraints Log read model, preserving fixture-first behavior and backend opt-in only where existing PCC conventions support it.

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
apps/project-control-center/src/api/
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/fixtures/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/tests/
packages/models/src/pcc/ConstraintsLog.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/fixtures/constraintsLog.ts
```

Do not build the full UI surface in this prompt unless a tiny adapter fixture view model is required for client tests.

## Prohibited Scope

- No external-system runtime calls.
- No tenant-hosted requirements.
- No SharePoint list creation or Graph permission work.
- No backend writes.
- No evidence-binary operations.
- No approvals execution.
- No legal/claim/delay determinations.


## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` as the controlling file map. At minimum inspect the files relevant to this prompt scope, then rely on Prompt 01 findings where still current.


## Implementation Steps

1. Verify Prompt 03 backend route/provider and Prompt 02 shared model exports are present.
2. Inspect existing PCC SPFx client patterns for backend opt-in and fixture fallback.
3. Add a typed `Constraints Log` client function using repo-standard HTTP/read-model client infrastructure.
4. Keep fixture default safe.
5. Use backend opt-in only if existing PCC configuration conventions support it.
6. Normalize client results into stable UI-ready read-model data.
7. Add loading, error, empty, degraded, and access-denied result semantics if repo conventions support these at the client layer.
8. Add tests for:
   - fixture fallback default;
   - backend opt-in behavior where applicable;
   - normalized response shape;
   - degraded/error behavior;
   - fixture/backend shape parity;
   - no prohibited external imports or runtime clients.

## Expected Client Posture

- Fixture data should work without tenant/backend setup.
- Backend calls should be opt-in and use existing PCC client conventions.
- Client should not know anything about Procore, P6, Graph, SharePoint REST, PnP, Sage, Autodesk, AHJ portals, or other external systems.


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
feat(spfx-pcc): add constraints log read-model client
```

Suggested commit description:

```text
Adds the Wave 12 Constraints Log SPFx read-model client seam, fixture fallback, normalization, and parity tests while preserving fixture-first behavior and no external-system runtime dependencies.
```


## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
- State the exact commit hash if a commit was created.
