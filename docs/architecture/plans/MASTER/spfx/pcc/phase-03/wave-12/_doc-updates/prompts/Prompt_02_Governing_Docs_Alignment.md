# Prompt 02 — Governing Docs Alignment

## Objective

Update governing Phase 3 documentation to reflect the resolved Wave 12 architecture: Constraints Log remains the official module name, with user-facing subtitle Make-Ready Constraint & Risk Exposure Center.

## Repo-Truth Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
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

Only governing markdown docs listed above, and only if repo truth confirms they require Wave 12 alignment.

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

1. Replace thin descriptions of Wave 12 as a generic item-level workflow with a concise description of a Make-Ready Constraint & Risk Exposure Center.
2. Preserve official module name: `Constraints Log`.
3. Preserve Project Readiness placement.
4. Add explicit note that embedded risk matrix does not replace claims, formal delay analysis, change management, or enterprise risk systems.
5. Add guardrail language for external-system launcher/reference-only posture.
6. Add dependency alignment with Waves 8, 9, 10, 11, 14, Priority Actions, Document Control, Scheduler/Look Ahead, and External Systems.
7. Do not edit source model files even if placement mismatch exists; document the alignment item only.


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
docs(pcc): align wave 12 constraints log governance
```

## Commit Description

```text
Aligns PCC Phase 3 governing docs for Wave 12 Constraints Log as a Project Readiness Make-Ready Constraint & Risk Exposure Center. Documentation-only; no runtime, package, lockfile, manifest, external-system, tenant, or legal/claim behavior changes.
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
