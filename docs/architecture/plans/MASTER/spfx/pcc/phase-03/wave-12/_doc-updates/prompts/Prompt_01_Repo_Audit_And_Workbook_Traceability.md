# Prompt 01 — Repo Audit and Workbook Traceability

## Objective

Perform a read-only repo-truth audit for Phase 3 Wave 12 and verify the Constraints Log workbook source posture before any documentation edits.

## Repo-Truth Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/PccWorkCenters.ts
docs/reference/example/HB_ConstraintsLog_Template.xlsx
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

No file edits in this prompt unless you create/update a Wave 12 repo-audit note under:
```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
```
Only create that note if the wave-12 directory already exists or your plan explicitly creates it as part of documentation scaffolding.

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

1. Capture local repo baseline commands.
2. Verify current Wave 12 naming and placement in governing docs.
3. Verify whether `constraints-log` is currently assigned to `risk-issues-decision` in `WorkflowModules.ts`.
4. Verify workbook path and compare against the uploaded/source extraction assumptions if available.
5. Record that the workbook is source/reference taxonomy only.
6. Do not make product changes in this prompt unless needed to create the audit note.


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
docs(pcc): audit wave 12 constraints log source posture
```

## Commit Description

```text
Audits Wave 12 Constraints Log repo truth, workbook posture, and current module-placement alignment. Documentation-only; no runtime, package, lockfile, manifest, external-system, tenant, or legal/claim behavior changes.
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
