# Prompt 01 — Wave 5 Scope Lock and Closed Decision Register

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not implement any later Wave 5 prompt early. Do not reread files that are still available in your current context or memory. Use repo truth only. If repo truth conflicts with this prompt, stop and report the conflict before editing files.

## Objective

Open Phase 3 / Wave 5 with documentation-only repo-resident records for the PCC Priority Actions Rail:

1. Wave 5 scope lock.
2. Wave 5 closed decision register.

Do not implement code in this prompt.

## Repo-Truth Basis

Before writing, inspect only the files needed to confirm:

- Wave 4 closeout exists and marks Wave 4 closed.
- Wave 4A is operator-pending and is not a prerequisite to Wave 5.
- Phase 3 planning identifies Wave 5 as Priority Actions Rail.
- Current Project Home already includes `PccPriorityActionsCard`.
- Current models/backend already contain priority action types, fixtures, and route support.
- The closed decisions in this prompt are still compatible with repo truth.

Minimum files to inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/PccReadModels.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
```

## Allowed Files

Create only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Closed_Decisions.md
```

Optionally create this index only if adjacent wave folders already use a per-wave README/index pattern:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/README.md
```

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

Do not create an implementation prompt package inside the repo unless the user explicitly authorizes that separate docs work.

## Implementation Requirements

`Wave_5_Scope_Lock.md` must include:

- phase/wave/status/date/audited HEAD;
- objective;
- repo-truth summary;
- in-scope items;
- out-of-scope items;
- locked implementation direction;
- acceptance criteria;
- explicit statement that Wave 4A is not a Wave 5 prerequisite;
- explicit statement that W4-OD-009 scoped-host ADR is deferred and not blocking Wave 5.

`Wave_5_Closed_Decisions.md` must include:

- W5-OD-001 through W5-OD-008 as closed decisions;
- W4-OD-009 as carry-forward deferred/non-blocking work;
- the final category grouping decision: app-local adapter, no shared category rewrite;
- the final backend decision: consume `priority-actions` only after local rail stability and only under explicit backend opt-in;
- the final action behavior decision: metadata/non-executing only;
- the final persona decision: display-only, no auth/persona derivation;
- the final suppression decision: suppress `documents`, `health`, and `safety` from the user-facing MVP rail;
- the final UI-kit decision: reference only, no direct `HbcPriorityRail` import/reuse in Wave 5;
- the final shared model decision: no mutation in Wave 5;
- the final roadmap decision: no master roadmap/status edits in Wave 5 implementation prompts.

## Guardrails to Preserve

- Fixture remains default.
- Backend read-model mode remains explicit opt-in only.
- No backend default.
- No new `fetch(` callsites.
- No write routes.
- No tenant mutation.
- No Wave 4A hosted validation inside Wave 5 implementation prompts.
- No `.sppkg`, app-catalog upload, tenant validation, or production rollout.
- No package, lockfile, manifest, workflow, or deployment changes.
- No Graph, PnP, SharePoint REST runtime.
- No Procore runtime.
- No Document Crunch runtime.
- No Adobe Sign runtime.
- No auth token wiring.
- No Site Health scan or repair execution.
- No Team & Access permission mutation.
- No approval execution.
- Preserve Project Home bento/grid invariants.
- Preserve the single active-surface-panel invariant.

## Tests / Validation Commands

Documentation-only prompt:

```bash
git status --short
md5 pnpm-lock.yaml
git diff --stat HEAD
git diff --name-only HEAD
```

Confirm `pnpm-lock.yaml` md5 is unchanged.

## Stop Conditions

Stop without editing if:

- Wave 4 closeout is missing or does not mark Wave 4 closed.
- The repo indicates Wave 5 has a different scope than Priority Actions Rail.
- `PccPriorityActionsCard` no longer exists.
- Current repo truth contradicts any closed decision in a way that would make implementation unsafe.
- The required docs directory structure is absent and cannot be created without broader roadmap edits.
- Any requested edit would touch source code, backend, package files, lockfiles, manifests, workflows, deployment files, or Wave 4 closeouts.

## Required Closeout Response

End with:

- files changed;
- audited HEAD;
- validation results;
- final Wave 4 readiness finding;
- whether Wave 5 may proceed;
- closed decisions recorded;
- explicit no-code/no-runtime/no-deployment statement.

## Recommended Commit Summary

```text
docs(pcc): open wave 5 priority actions rail planning
```

## Recommended Commit Description

```text
Opens Phase 3 Wave 5 for the PCC Priority Actions Rail.

Adds the Wave 5 scope lock and closed decision register grounded in current repo truth, including the Wave 4 closeout posture, fixture-default guardrails, explicit backend opt-in boundary, current priority action model/fixture/backend route state, and closed Wave 5 category, backend, action, persona, suppression, UI-kit, shared-model, roadmap, and deferred-ADR decisions.

No source code, backend runtime, tenant mutation, write routes, package/version/lockfile changes, manifest changes, workflow changes, deployment, .sppkg, app catalog upload, hosted validation, or production rollout is introduced.
```
