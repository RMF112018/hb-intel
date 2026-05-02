# Prompt 07 — Tests, Guardrails, and Implementation Closeout

## Objective

Add final regression tests, guardrail proofs, and implementation closeout documentation for Wave 11 Responsibility Matrix.

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

Use Prompt 01–06 results. Likely files include:

```text
packages/models/src/pcc/*ResponsibilityMatrix*
backend/functions/src/hosts/pcc-read-model/*responsibility*
apps/project-control-center/src/surfaces/responsibilityMatrix/
apps/project-control-center/src/tests/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Implementation_Closeout.md
```

Do not edit `docs/architecture/plans/**`.

## Required Final Regression Coverage

Add or confirm tests for:

- shared model shape and fixture counts;
- JSON/reference-data count posture;
- owner-contract active default obligations remain `0`;
- contract-party `C = Contractor` is never RACI `C = Consulted`;
- source marks are not blindly converted into final RACI;
- backend endpoint is GET-only/read-only;
- provider returns safe degraded envelopes;
- SPFx client fixture/backend parity;
- eight-lane surface rendering;
- Matrix Health Score and exception rendering;
- Priority Actions / Project Readiness / Approvals / Team & Access / Document Control seam boundaries;
- no forbidden imports/calls for Graph, PnP, SharePoint REST, Procore, Sage, AHJ;
- no backend write routes.

## Closeout Documentation

Create or update only the approved Wave 11 blueprint closeout path, likely:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Implementation_Closeout.md
```

Closeout must document:

- implementation scope completed;
- files changed;
- validation commands and results;
- lockfile before/after hash;
- package/dependency/manifest/workflow/deployment unchanged confirmation;
- legal/external/runtime/evidence/approval/Team & Access guardrails;
- residual risks;
- readiness for fresh reviewer prompt.

## Final Validation Sweep

Run all repo-appropriate validations:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
pnpm exec prettier --check <touched files>
git diff --cached --name-only
```

If a command has known unrelated pre-existing failures, record the exact failure and prove it predates Wave 11.

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
