# Prompt 07 — Tests, Guardrails, and Wave 10 Implementation Closeout

## Objective

You are working in `/Users/bobbyfetting/hb-intel`.

Harden Phase 3 / Wave 10 Permit & Inspection Control Center implementation with regression tests, no-runtime/no-mutation guardrails, documentation closeout, and final validation proof.

This prompt closes the first implementation sequence. It must not introduce new runtime scope.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Repo-Truth Files to Inspect

Use prior prompt findings first. Re-open only as needed:

- all files changed in Prompts 02–06;
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Documentation_Closeout.md`
- existing test guardrails under:
  - `packages/models/src/pcc/*.test.ts`
  - `backend/functions/src/hosts/pcc-read-model/*.test.ts`
  - `apps/project-control-center/src/tests/*.test.ts`
- package scripts:
  - `packages/models/package.json`
  - `backend/functions/package.json`
  - `apps/project-control-center/package.json`
  - `package.json`

## Allowed Files / Likely Files

Use Prompt 01’s exact allowed list. Likely allowed files:

- tests for files changed in Prompts 02–06;
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Implementation_Closeout.md` new;
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md` only for narrow typo/implementation-closeout alignment if required;
- app README only if behavior documentation must be updated and Prompt 01 allowed it.

Do not edit `docs/architecture/plans/**`.

Do not touch package manifests or lockfiles.

## Required Guardrail Coverage

Add or confirm tests proving:

- no backend write route exists for Wave 10;
- backend Wave 10 route is GET-only;
- Wave 10 provider returns `readOnly: true`;
- no AHJ runtime tokens/imports/call patterns exist;
- no AHJ scraping, scheduling, submission, or polling behavior exists;
- no Procore runtime tokens/imports/call patterns exist;
- no Microsoft Graph runtime imports were added;
- no SharePoint REST/PnP runtime imports were added;
- no evidence upload/storage/sync/mirror behavior exists;
- no external-system writeback/sync/mirror behavior exists;
- no approval execution behavior exists;
- fixture default / explicit backend opt-in posture is preserved;
- required target-added fields render or are represented: `revision`, `applicationValue`, `permitFee`, `reInspectionFee`;
- failed/reinspection lineage remains parent/child traceable;
- Project Readiness and Approvals boundaries remain non-authoritative for Wave 10;
- package and lockfile are unchanged.

## Required Closeout Documentation

Create `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Implementation_Closeout.md`.

The closeout must include:

- files changed across Prompts 02–07;
- what was implemented;
- what was intentionally not implemented;
- validation results;
- lockfile before/after hash;
- no package/dependency change confirmation;
- no manifest change confirmation;
- no CI/workflow change confirmation;
- no tenant mutation confirmation;
- no AHJ runtime confirmation;
- no Procore runtime confirmation;
- no Microsoft Graph / SharePoint runtime mutation confirmation;
- no evidence storage/upload/sync confirmation;
- no backend write route confirmation;
- no approval execution confirmation;
- remaining blockers or deferred items;
- recommended next prompt or wave.

Do not edit `docs/architecture/plans/**`.

## Prohibited Scope

Do not add feature scope beyond tests, guardrails, closeout, and narrow correction of Wave 10 implementation evidence.

Do not add package dependencies.

Do not change package manifests.

Do not change `pnpm-lock.yaml`.

Do not change SPFx manifests.

Do not change CI/workflows.

Do not run broad formatting.

Do not introduce AHJ scraping, AHJ API calls, AHJ inspection scheduling, AHJ permit submission, or AHJ status polling.

Do not introduce Procore runtime integration.

Do not introduce Microsoft Graph runtime integration.

Do not introduce SharePoint REST or PnP runtime operations.

Do not introduce evidence upload, sync, mirror, or storage behavior.

Do not introduce external-system writeback/sync/mirror.

Do not introduce backend write routes.

Do not introduce direct approval execution.

Do not introduce packaging, deployment, tenant mutation, or production rollout.

## Implementation Steps

1. Capture baseline:

```bash
git status --short
md5 pnpm-lock.yaml
```

2. Review changed files from Prompts 02–06.

3. Add missing regression tests and guardrail tests.

4. Add implementation closeout documentation.

5. Correct the narrow Wave 10 typo `n- inspection blockers` only if this file is already within allowed scope and the change remains targeted.

6. Do not make broad formatting changes. Run Prettier check only on touched files.

7. Run full relevant validation.

## Validation Commands

Run:

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
pnpm exec prettier --check <exact touched files>
```

Confirm the lockfile hash is unchanged from baseline.

## Staged-File Proof Before Commit

Before committing, run:

```bash
git status --short
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Stage only files touched for this prompt. Do not stage unrelated files.

## Commit Instructions

Commit summary:

```text
test(pcc): close wave 10 permit inspection guardrails
```

Commit description:

```text
Closes the first Phase 3 Wave 10 Permit & Inspection Control Center implementation sequence with regression tests, no-runtime/no-mutation guardrails, and implementation closeout documentation.

Confirms GET-only read-model behavior, fixture/default posture, required target-added fields, failed/reinspection lineage, Priority Actions and readiness signal representation, launcher-only AHJ posture, Procore reference-only posture, evidence reference-only posture, and Wave 8/Wave 14 boundary preservation.

No package/dependency change, lockfile change, manifest change, CI/workflow change, tenant mutation, AHJ runtime, Procore runtime, Microsoft Graph runtime, SharePoint REST/PnP runtime, evidence upload/storage/sync, external writeback/sync, backend write route, approval execution, packaging, deployment, or production rollout.
```

## Final Output Requirements

Return:

1. files changed;
2. closeout doc path;
3. tests/guardrails added;
4. validation results;
5. staged-file proof;
6. lockfile before/after hash;
7. commit hash;
8. explicit no-runtime/no-external/no-mutation confirmations;
9. remaining deferred items;
10. recommended next prompt.
