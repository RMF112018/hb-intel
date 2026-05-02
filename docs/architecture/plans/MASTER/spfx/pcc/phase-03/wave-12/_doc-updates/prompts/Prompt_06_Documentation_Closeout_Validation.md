# Prompt 06 — Documentation Closeout Validation

## Objective

Validate and close the Wave 12 documentation update package after all governing docs, target architecture docs, risk/exposure docs, workbook mapping, and reference JSON files are in place.

## Repo-Truth Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
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
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Documentation_Closeout.md
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

1. Re-run repo baseline and validation commands.
2. Confirm all intended Wave 12 files exist.
3. Validate JSON files.
4. Run Prettier check against touched markdown/json files.
5. Confirm no docs/architecture/plans/** edits.
6. Confirm no source/runtime/backend/SPFx/package/lockfile/manifest/workflow/tenant/external-system changes.
7. Add closeout with evidence, residual risks, and recommended next prompt.
8. Commit the completed documentation update.


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
docs(pcc): close wave 12 constraints log planning
```

## Commit Description

```text
Closes Wave 12 Constraints Log documentation planning. Validates governing docs, target architecture, risk/exposure model, workbook mapping, reference JSONs, and docs-only guardrails. No runtime, package, lockfile, manifest, external-system, tenant, or legal/claim behavior changes.
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
