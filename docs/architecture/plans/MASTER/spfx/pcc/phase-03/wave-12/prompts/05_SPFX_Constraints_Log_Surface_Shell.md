# Prompt 05 — SPFx Constraints Log Surface Shell

## Objective

Implement the user-facing Wave 12 `Constraints Log` surface shell as the `Make-Ready Constraint & Risk Exposure Center`, aligned to existing PCC surface conventions and Project Readiness UI patterns.

The initial UI must be safe, fixture-first, and non-mutating except for local-only interaction state where repo conventions allow it.

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
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/constraintsLogAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/constraintsLogViewModel.ts
apps/project-control-center/src/surfaces/projectReadiness/PccConstraintsLogSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccConstraintsLogSurface.test.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/components/
apps/project-control-center/src/tests/
packages/models/src/pcc/ConstraintsLog.ts
```

Do not touch backend files in this prompt unless tests reveal a type export issue caused by Prompt 03/04.

## Prohibited Scope

- No external-system writes or runtime integrations.
- No legal/claim/delay determinations.
- No evidence-binary ownership.
- No approval/checkpoint execution.
- No tenant deployment or SPFx packaging.
- No broad UI-kit refactors.


## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` as the controlling file map. At minimum inspect the files relevant to this prompt scope, then rely on Prompt 01 findings where still current.


## Required UX Surfaces

Implement a flagship shell with these surfaces, using existing PCC layout/card patterns:

1. Command Center
2. Make-Ready Board
3. Risk Matrix
4. Constraint Exposure Matrix
5. Log Table
6. Detail Drawer / Detail Panel
7. Weekly Huddle
8. Root Cause & Lessons Learned
9. Executive Exposure Summary

## UX Requirements

- Show module name and subtitle.
- Present risk vs constraint vs issue/exposure definitions clearly enough to prevent misuse.
- Make due-soon, overdue, high-exposure, and executive-visible constraints obvious.
- Provide filtering/grouping by status, owner/BIC, category, due window, severity band, source module, and exposure type where practical.
- Matrix cells must drill down to item lists or update local UI selection state only.
- Detail drawer/panel must show source lineage, workbook reference, score breakdown, state, owners, dates, references, comments/history, and guardrail notes.
- Weekly Huddle mode must focus on current commitments: open, due-soon, overdue, blocked, and high-exposure items.
- Root Cause & Lessons Learned should summarize category trends and reasons for variance without claiming legal/delay causation.
- Executive summary must provide concise exposure posture without claim/compensability/damages conclusions.

## Required States

Implement or preserve repo-standard states for:

- loading;
- empty;
- degraded;
- error;
- access denied / limited access if existing PCC conventions support it;
- read-only preview;
- fixture fallback.

## Tests

Add tests proving:

- surface renders with fixture data;
- all required UX zones are present;
- matrix and board interactions are local-only/safe;
- detail panel opens from a selected item;
- degraded/error/empty states render safely;
- legal/claim/delay boundary language is present where needed;
- no external-system mutation/import behavior is introduced;
- router/module placement is consistent with Prompt 02 source-model correction.


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
feat(spfx-pcc): build constraints log surface shell
```

Suggested commit description:

```text
Adds the Wave 12 Constraints Log surface shell with command center, make-ready board, risk matrix, constraint exposure matrix, log table, detail panel, weekly huddle, root-cause/lessons-learned, and executive exposure summary. Preserves fixture-first, read-only/safe-local, no external-system, and no legal/claim/delay determination guardrails.
```


## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
- State the exact commit hash if a commit was created.
