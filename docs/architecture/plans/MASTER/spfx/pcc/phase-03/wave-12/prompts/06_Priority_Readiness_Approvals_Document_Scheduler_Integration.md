# Prompt 06 — Priority, Readiness, Approvals, Document, and Scheduler Integration Seams

## Objective

Wire reference-only integration seams between Wave 12 Constraints Log and related PCC modules without creating external-system runtime behavior, approval execution, evidence-binary ownership, or legal/claim/delay determinations.

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
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/fixtures/constraintsLog.ts
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/priorityActions/
apps/project-control-center/src/surfaces/documentControl/
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/tests/
```

Only edit files that local repo truth shows are necessary for reference-only seam display or shared model references.

## Prohibited Scope

- No Priority Actions queue mutation unless an existing safe candidate/reference pattern explicitly supports read-only candidate output.
- No Wave 14 approval execution.
- No Document Control evidence-binary ownership.
- No Scheduler/P6 runtime integration.
- No Procore, Graph, PnP, SharePoint REST, Sage, Autodesk, AHJ, utility portal, Document Crunch, or Adobe Sign runtime behavior.
- No legal/claim/delay determinations.


## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` as the controlling file map. At minimum inspect the files relevant to this prompt scope, then rely on Prompt 01 findings where still current.


## Required Integration Seams

Wire or expose reference-only posture for:

- Project Readiness Framework / Priority Actions candidate references;
- Wave 9 Project Lifecycle Readiness Center;
- Wave 10 Permit & Inspection Control Center;
- Wave 11 Responsibility Matrix;
- Wave 14 Approvals / Checkpoints;
- HB Document Control Center evidence-link references;
- Scheduler / Look Ahead references;
- External Systems launcher/reference links only.

## Implementation Steps

1. Inspect existing integration and reference-link conventions.
2. Add shared reference types only where existing models do not already provide them.
3. Add fixture references showing cross-module relationships without mutation.
4. Surface references in the Constraints Log UI where they improve context.
5. Add clear disabled/reference-only labels for:
   - approval/checkpoint execution;
   - evidence-binary handling;
   - external-system launchers;
   - Scheduler/Look Ahead linkage.
6. Ensure Priority Actions posture is candidate/reference-only unless existing repo conventions safely support more.
7. Add tests proving seams are reference-only and no prohibited imports/routes/clients were introduced.

## Required Boundary Copy

UI copy should make this clear:

- Delay exposure is a project-controls review flag, not a forensic schedule-analysis conclusion.
- Change exposure is a review flag, not a change-order entitlement or compensability determination.
- Evidence links reference Document Control; Wave 12 does not own evidence files.
- Approval/checkpoint execution remains outside Wave 12.


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
feat(pcc): add constraints log integration seams
```

Suggested commit description:

```text
Adds reference-only Wave 12 Constraints Log seams to Project Readiness, Priority Actions, lifecycle readiness, permit/inspection, responsibility matrix, approvals/checkpoints, Document Control, scheduler/look-ahead, and external launcher posture without external-system mutation or legal/claim/delay determination behavior.
```


## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
- State the exact commit hash if a commit was created.
