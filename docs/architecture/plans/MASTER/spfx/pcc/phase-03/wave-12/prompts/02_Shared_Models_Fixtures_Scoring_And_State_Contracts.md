# Prompt 02 — Shared Models, Fixtures, Scoring, and State Contracts

## Objective

Implement Wave 12 shared model contracts, deterministic fixtures, scoring utilities, severity override utilities, and explicit state-transition maps under the repo-consistent PCC model package.

If Prompt 01 confirms the mismatch still exists and local repo truth supports the correction, resolve the `constraints-log` source-model placement mismatch before any backend or SPFx runtime work proceeds.

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
packages/models/src/pcc/ConstraintsLog.ts
packages/models/src/pcc/ConstraintsLog.test.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/WorkflowModules.test.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/ProjectReadinessFramework.test.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/fixtures/constraintsLog.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/index.ts
packages/models/src/index.ts
```

Do not touch backend, SPFx, package, lockfile, manifest, workflow, deployment, or tenant files.

## Prohibited Scope

- No backend routes.
- No SPFx UI.
- No external-system runtime behavior.
- No legal/claim/delay determination behavior.
- No evidence-binary ownership.
- No approval/checkpoint execution.


## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` as the controlling file map. At minimum inspect the files relevant to this prompt scope, then rely on Prompt 01 findings where still current.


## Implementation Steps

1. Reconfirm Prompt 01 findings that are directly relevant to model edits.
2. Inspect existing PCC model naming, export, fixture, and test conventions.
3. Add a Wave 12 model contract file only if repo conventions support one.
4. Define typed vocabulary for:
   - risk item;
   - constraint item;
   - issue/exposure references as review flags only;
   - impact dimensions;
   - likelihood, impact, urgency scales;
   - severity bands;
   - initial and residual risk scoring;
   - constraint exposure scoring;
   - severity override rules;
   - source workbook lineage;
   - owner/responsible/BIC/current action owner;
   - need-by/promised/due/delivered dates;
   - evidence-link references only;
   - Priority Actions candidate references only;
   - Project Readiness source module/workflow module references.
5. Convert documentation state machines into explicit allowed-transition maps:
   - risk: `draft -> identified -> assessed -> response-planned -> monitoring -> triggered -> converted | closed | retired`;
   - constraint: `draft -> identified -> accepted -> action-planned -> in-progress | awaiting-external-party | at-risk | overdue -> resolved-pending-validation -> resolved`.
6. Implement pure utilities for:
   - governing impact score = max impact dimension;
   - risk score = likelihood x governing impact;
   - residual risk score;
   - constraint exposure score = urgency x governing impact;
   - severity band mapping;
   - raise-only severity overrides;
   - transition validation.
7. Add deterministic fixtures covering all required cases in `reference/02_WAVE_12_REQUIRED_FIELDS_STATUSES_AND_SCORING.md`.
8. Resolve the source-model placement mismatch if still present:
   - inspect existing work-center/source-module taxonomy first;
   - prefer the smallest safe correction that aligns `constraints-log` with Project Readiness governance;
   - update tests proving the intended registry placement and no accidental loss of module registration;
   - do not invent a new work center unless repo truth already supports that pattern.
9. Export model and fixture contracts using repo-standard export files.

## Required Tests

Add or update tests proving:

- risk score calculation;
- residual risk calculation;
- constraint exposure score calculation;
- governing impact uses max dimension;
- severity band mapping boundaries;
- severity overrides raise only and require rationale/context;
- risk state allowed/disallowed transitions;
- constraint state allowed/disallowed transitions;
- fixtures are deterministic and cover all severity bands;
- workbook seed rows are reference-only and do not create active default constraints;
- delay/change exposure are review flags only, not legal/claim/delay determinations;
- `constraints-log` placement aligns with the Prompt 01 repo-consistent correction;
- exports are reachable through repo-standard index files.


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
feat(models-pcc): add constraints log contracts and scoring
```

Suggested commit description:

```text
Adds Wave 12 Constraints Log shared model contracts, deterministic fixtures, scoring utilities, severity overrides, and state-transition maps. Resolves the constraints-log source-model placement mismatch in the smallest repo-consistent way after local audit confirmation. Preserves no-runtime/no-external-system/no-legal-claim-delay guardrails.
```


## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
- State the exact commit hash if a commit was created.
