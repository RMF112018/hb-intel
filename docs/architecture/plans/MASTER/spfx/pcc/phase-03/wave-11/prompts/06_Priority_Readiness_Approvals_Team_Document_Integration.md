# Prompt 06 — Priority / Readiness / Approvals / Team / Document Integration

## Objective

Wire Responsibility Matrix signals into existing PCC integration seams without taking ownership of other modules or enabling prohibited runtime actions.

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

Use Prompt 01–05 results. Likely files include:

```text
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/ResponsibilityMatrix.ts
packages/models/src/pcc/fixtures/responsibilityMatrix.ts
apps/project-control-center/src/surfaces/responsibilityMatrix/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/fixtures/
apps/project-control-center/src/tests/
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
```

## Required Integration Semantics

### Priority Actions

Represent candidates for:

- missing accountable owner;
- missing responsible owner;
- missing current action owner;
- role vacant;
- person inactive;
- overdue current action;
- handoff required;
- missing evidence reference;
- owner-contract ambiguity;
- decision-rights gap.

Do not create or mutate Priority Actions unless an existing safe preview framework already supports this as fixture/reference data.

### Project Readiness

Expose Responsibility Matrix health into the Wave 8 Project Readiness framework as source-lineage/readiness signals.

Do not redefine Wave 8 scoring doctrine or ownership.

### Approvals / Checkpoints

Represent approval/checkpoint references or requests only.

Do not execute approvals. Wave 14 owns approval/checkpoint execution.

### Team & Access

Consume or mock role/person resolution posture.

Do not mutate Team & Access roster/access state.

### Document Control

Reference evidence links only.

Do not upload, download, sync, store, mirror, or manage evidence binaries.

## Required UI/Fixture Conditions

Ensure fixtures/surface demonstrate:

- missing accountable;
- missing responsible;
- current-action overdue;
- role vacant;
- person inactive;
- handoff required;
- evidence missing;
- owner-contract ambiguity;
- decision-rights gap;
- source review required.

## Tests

Add tests to prove:

- integration signals are present and read-only;
- ownership boundaries are visible in UI copy and model fields;
- no approval execution;
- no Team & Access mutation;
- no Document Control binary ownership;
- no external runtime calls;
- degraded source health is displayed safely.

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
