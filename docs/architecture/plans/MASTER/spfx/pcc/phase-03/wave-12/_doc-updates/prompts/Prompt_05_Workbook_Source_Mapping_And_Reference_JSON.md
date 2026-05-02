# Prompt 05 — Workbook Source Mapping and Reference JSON

## Objective

Add workbook source mapping documentation and reference JSON artifacts for Wave 12, preserving source traceability while preventing workbook rows from becoming active default constraints.

## Repo-Truth Files to Inspect

```text
docs/reference/example/HB_ConstraintsLog_Template.xlsx
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
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Workbook_Source_Mapping.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/default_constraints_log_seed_structure.json
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/default_constraints_log_seed_structure_schema.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/workbook_extraction_notes.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/research_source_index.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/source_research_urls.json
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

1. Verify the canonical workbook exists.
2. Inspect workbook structure without modifying it.
3. Confirm sheet names, used ranges, headers, sections, data validations, formulas, hidden rows, and sample rows.
4. Add the seed structure JSON from this package, adjusted only if local workbook truth differs.
5. Add schema and extraction notes.
6. Add research source index.
7. Validate all JSON files.
8. State clearly that no workbook row is an active default constraint unless project-specific verification exists.


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
docs(pcc): map wave 12 constraints workbook sources
```

## Commit Description

```text
Adds Wave 12 workbook source mapping and reference JSON artifacts. Preserves source traceability to the Constraints Log workbook while classifying sections, fields, sample rows, placeholder rows, and ambiguous items. Documentation-only.
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
