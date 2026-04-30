# Prompt 07 — Wave 5 Closeout and Wave 6 Readiness

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not reread files that are still available in your current context or memory. Do not implement Wave 6. Use repo truth only. If repo truth conflicts with the Wave 5 scope lock, closed decisions, or prompt closeouts, stop and report the conflict before editing files.

## Objective

Close Phase 3 / Wave 5 with documentation-only proof.

Summarize the implemented Priority Actions Rail, validation results, guardrails, closed decisions, non-claims, deferred work, and readiness recommendation for Wave 6 Team & Access.

Do not implement code in this prompt.

## Required Prerequisite

Verify Prompts 01–06 are complete and accepted.

Expected Wave 5 records should exist under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/
```

Minimum required:

```text
Wave_5_Scope_Lock.md
Wave_5_Closed_Decisions.md
```

If Prompt 05 deferred backend wiring, also expect:

```text
Wave_5_Backend_Priority_Actions_Deferral.md
```

If required records are missing, stop and report the missing records.

## Repo Files to Inspect

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/**
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Closeout.md
apps/project-control-center/README.md
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.ts
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
packages/models/src/pcc/PriorityActions.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
```

Do not repeatedly re-read unchanged files already in context.

## Allowed Files

Create only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Closeout.md
```

Optionally update a Wave 5 README/index only if one already exists and is clearly intended to summarize the wave. If not, do not create/update it without explicit authorization.

## Forbidden Files / Forbidden Scope

Do not modify:

```text
apps/**
packages/**
backend/**
pnpm-lock.yaml
package.json
.github/**
*.json manifests
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/**
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
```

Do not implement Wave 6, Team & Access mutation, hosted validation, app catalog work, or deployment.

## Required Closeout Content

`Wave_5_Closeout.md` must include:

- phase, wave, status, date, audited HEAD;
- executive summary;
- prompt-by-prompt closeout index;
- implemented files grouped by area;
- final Wave 5 runtime posture;
- final rail placement;
- final four-group mapping posture;
- closed-decision disposition table W5-OD-001 through W5-OD-008;
- W4-OD-009 carry-forward disposition;
- explicit category suppression proof for `documents`, `health`, and `safety`;
- default fixture behavior proof;
- explicit backend opt-in behavior proof or explicit backend-wiring deferral proof;
- Project Home 10-card bento/direct-child invariant proof;
- active-surface-panel invariant proof;
- no-direct-`HbcPriorityRail` proof;
- no-action-execution proof;
- guardrail/test inventory;
- full validation command results;
- package/version/lockfile/manifest/deployment posture;
- deferred work;
- explicit forbidden claims / non-claims;
- Wave 6 readiness recommendation;
- final readiness statement.

## Required Closeout Truth

The closeout must not overclaim. It must state clearly:

- Wave 5 did not create a new top-level Priority Actions surface.
- Wave 5 did not rewrite shared priority categories.
- Wave 5 did not directly import/reuse `HbcPriorityRail`.
- Wave 5 did not execute actions.
- Wave 5 did not perform approval execution.
- Wave 5 did not perform Team & Access permission mutation.
- Wave 5 did not perform Site Health scan/repair execution.
- Wave 5 did not introduce write routes.
- Wave 5 did not introduce Graph/PnP/SharePoint REST live operations.
- Wave 5 did not introduce Procore, Document Crunch, or Adobe Sign runtime.
- Wave 5 did not introduce auth token wiring or real persona derivation.
- Wave 5 did not introduce a provisioning executor.
- Wave 5 did not deploy or package `.sppkg`.
- Wave 5 did not mutate the tenant.
- Wave 4A and Wave 5A remain separate hosted validation gates.
- Production rollout remains separately approved.

## Required Tests

Documentation-only prompt, but run the full relevant validation suite to capture final proof:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
md5 pnpm-lock.yaml
git status --short
git diff --stat HEAD
git diff --name-only HEAD
```

Do not run deployment, `.sppkg`, app catalog, tenant, Graph/PnP live operations, Procore, provisioning executor, repair runner, permission mutation, approval execution, or hosted validation commands.

## Stop Conditions

Stop without editing if:

- Prompts 01–06 are not complete and accepted.
- Validation is failing and the failure is not clearly pre-existing and unrelated.
- Repo truth shows category suppression, fixture default, backend opt-in, no-action-execution, bento invariant, or active-surface-panel invariant is broken.
- Closeout would require source-code edits.
- Any requested edit would touch source code, backend, package files, lockfiles, manifests, workflows, deployment files, Wave 4 closeouts, or master roadmap/status docs.

## Required Closeout Response

End the local-agent response with:

- files changed;
- validation results;
- final fixture/default posture;
- final backend opt-in or backend deferral posture;
- final visible rail grouping posture;
- final suppression posture;
- deferred work;
- Wave 6 readiness recommendation;
- commit summary and description only after the commit lands.

## Recommended Commit Summary

```text
docs(pcc): close wave 5 priority actions rail
```

## Recommended Commit Description

```text
Closes Phase 3 Wave 5 for the PCC Priority Actions Rail.

Documents the Project Home rail integration, app-local four-group adapter, closed decision disposition, suppressed non-MVP categories, fixture-default behavior, explicit backend opt-in or backend deferral posture, non-executing action affordances, no-direct-HbcPriorityRail posture, bento/grid invariant proof, guardrail coverage, validation results, no-mutation posture, deferred work, and Wave 6 readiness recommendation.

No shared model category rewrite, new top-level surface, write route, action execution, approval execution, Team & Access permission mutation, Site Health repair execution, Graph/PnP runtime, Procore runtime, Document Crunch runtime, Adobe Sign runtime, auth token wiring, provisioning executor, tenant mutation, deployment, .sppkg, app catalog upload, package/version bump, manifest change, workflow change, hosted validation, or production rollout is introduced.
```
