# Prompt 04 — Risk and Constraint Exposure Model

## Objective

Create the detailed Wave 12 risk matrix, constraint exposure matrix, state machine, data model, fixture, test, and read-model documentation.

## Repo-Truth Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Constraints_Log_Target_Architecture.md
reference/risk_matrix_config_reference.json
reference/constraint_exposure_scoring_reference.json
packages/models/src/pcc/ (read-only for vocabulary alignment)
backend/functions/src/hosts/pcc-read-model/ (read-only for envelope/read-model conventions)
```


## Universal Guardrails

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

This prompt is documentation-only. Do not change source/runtime code, backend routes, SPFx surfaces, package manifests, dependencies, lockfiles, workflows, CI, deployment manifests, tenant configuration, or external-system integrations.

Do not edit `docs/architecture/plans/**` unless a separate explicit authorization is provided.

Do not introduce Procore, Primavera/P6, Sage, Microsoft Graph, SharePoint REST/PnP, Autodesk, AHJ, utility portal, or other external-system runtime behavior.

Do not create legal, claim, entitlement, compensability, delay-damages, or forensic schedule analysis determinations.

Preserve the distinction:
- risk = uncertain future event or condition;
- constraint = known blocker to planned work;
- issue = active problem;
- delay exposure = potential or actual schedule-impact condition requiring review;
- change exposure = potential or actual scope/cost/contract impact requiring review.


## Allowed / Likely Files

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Risk_And_Constraint_Exposure_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/risk_matrix_config_reference.json
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/constraint_exposure_scoring_reference.json
```

## Prohibited Scope

- `docs/architecture/plans/**`
- source/runtime code
- backend route files
- SPFx surfaces
- package/dependency files
- `pnpm-lock.yaml`
- manifests
- workflows/CI
- tenant/deployment files
- external-system integration files

## Implementation Steps

1. Add risk likelihood/impact scales.
2. Add impact dimensions and governing impact rule.
3. Add initial/residual risk scoring and bands.
4. Add constraint urgency scoring.
5. Add constraint exposure scoring and bands.
6. Add severity override rules.
7. Add risk and constraint state machines.
8. Add TypeScript-ready interface sketches.
9. Add read-model contract and degraded-state expectations.
10. Add fixture requirements and validation/test requirements.
11. Confirm that the model does not authorize runtime implementation in this documentation wave.


## Validation Commands

Run repo-correct equivalents of:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
git diff --cached --name-only
git diff --name-only
```

For JSON touched in Wave 12, also run:

```bash
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/default_constraints_log_seed_structure.json >/tmp/wave12_constraints_seed_structure_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/risk_matrix_config_reference.json >/tmp/wave12_risk_matrix_config_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/constraint_exposure_scoring_reference.json >/tmp/wave12_constraint_exposure_config_validated.json
```



## Staged-File Proof Before Commit

Before committing, provide:

```bash
git diff --cached --name-only
git diff --name-only
git status --short
md5 pnpm-lock.yaml
```

State explicitly whether any non-documentation, package, lockfile, manifest, workflow, runtime, backend, SPFx, tenant, or external-system files changed.


## Commit Summary

```text
docs(pcc): add wave 12 risk and exposure model
```

## Commit Description

```text
Adds Wave 12 Risk and Constraint Exposure Model documentation with risk matrix scoring, constraint exposure scoring, state machines, data model sketches, read-model contract, fixture requirements, tests, and guardrails. Documentation-only.
```

## Final Output Requirements

Return:
- files changed;
- summary of documentation updates;
- validation results;
- staged-file proof;
- lockfile MD5 before/after;
- confirmation of documentation-only scope;
- any repo-truth discrepancies found and how they were handled.
