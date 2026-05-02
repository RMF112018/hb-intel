# Prompt 03 — Target Architecture Documentation

## Objective

Create the canonical Wave 12 target architecture documentation for the Constraints Log module using the resolved architecture in this package.

## Repo-Truth Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
reference/default_constraints_log_seed_structure.json
reference/risk_matrix_config_reference.json
reference/constraint_exposure_scoring_reference.json
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
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Constraints_Log_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Constraints_Log_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Resolved_Decisions_Register.md
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

1. Create/update the Wave 12 directory.
2. Add the full target architecture.
3. Add scope lock.
4. Add resolved decisions register.
5. Resolve product decisions with no open product questions.
6. Include product pillars, definitions, personas, permissions, UX surfaces, saved views, metrics, integration boundaries, workbook posture, and definition of done.
7. Preserve documentation-only posture.


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
docs(pcc): define wave 12 constraints log architecture
```

## Commit Description

```text
Defines the Wave 12 Constraints Log target architecture, scope lock, and resolved decisions register. Establishes the Make-Ready Constraint & Risk Exposure Center, embedded risk matrix, constraint exposure matrix, role boundaries, integrations, metrics, guardrails, and definition of done. Documentation-only.
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
