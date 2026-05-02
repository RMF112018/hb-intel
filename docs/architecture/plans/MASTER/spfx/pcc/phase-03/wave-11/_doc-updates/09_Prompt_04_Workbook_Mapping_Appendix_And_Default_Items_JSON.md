# Prompt 04 — Workbook Mapping Appendix and Default Items JSON

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to create the Wave 11 workbook source mapping appendix and default responsibility item JSON.

## Global Guardrails

- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Do not overwrite unrelated working-tree changes.
- Do not edit `docs/architecture/plans/**` unless the user explicitly authorizes canonical plan-library edits.
- Do not introduce package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not package, deploy, or upload SPFx packages.
- Do not mutate a tenant, SharePoint site, Microsoft Graph object, Procore project, Sage record, AHJ portal, or any external system.
- Do not introduce secrets, app settings, environment variables, CI/workflow changes, deployment manifests, package manifests, or production rollout instructions.
- Keep the work documentation-only unless a later prompt explicitly authorizes runtime implementation.
- Preserve Wave 8 Project Readiness Module Framework boundaries and Wave 14 Approvals / Checkpoints ownership.
- Preserve Team & Access, HB Document Control Center, Priority Actions, External Systems, and Project Readiness integration seams without claiming runtime execution.
- Preserve workbook source traceability for every default responsibility item.
- Treat the Responsibility Matrix workbooks as source references, not final UX constraints.
- Treat contract references as project-controls metadata, not legal interpretation.
- Explicitly prohibit contract interpretation as legal advice and automatic creation of legal obligations.
- Use targeted documentation validation. Do not run broad formatting across the repo.


## Required Files

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Workbook_Source_Mapping.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json
```

Optionally create if useful:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items_schema.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/workbook_extraction_notes.md
```

## Inputs

Use:

```text
docs/reference/example/Responsibility Matrix - Template.xlsx
docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx
```

You may use the package reference file as a starting point, but must verify against the live repo workbook files:

```text
reference/default_responsibility_matrix_items.json
```

## Required JSON Structure

Use this structure:

```json
{
  "metadata": {
    "module": "Responsibility Matrix",
    "phase": "Phase 3",
    "wave": "Wave 11",
    "generatedFrom": "Responsibility Matrix workbook source extraction",
    "sourceFiles": [],
    "classificationPolicy": []
  },
  "sources": [],
  "defaultItems": [],
  "ambiguousItems": []
}
```

## Required Default Item Behavior

- Include every verified default responsibility item row.
- Preserve PM and Field sheet item rows.
- Do not activate owner-contract placeholder rows as default obligations unless live workbook verification proves they contain actual obligation descriptions.
- Include ambiguous rows separately.
- Preserve source row references.
- Preserve source assignment marks and normalized RACI mappings.
- Add `recommendedTargetClassification`.
- Add `requiresUserReview`.
- Add `mappingNotes`.

## Required Mapping Appendix Sections

`Wave_11_Workbook_Source_Mapping.md` must include:

1. Workbook inventory.
2. Extraction methodology.
3. Sheet summary.
4. Used ranges.
5. Header and role columns.
6. Section/grouping rows.
7. Responsibility item row counts.
8. Ambiguous row treatment.
9. Owner-contract workbook interpretation.
10. Assignment mark normalization.
11. Role alias mapping.
12. RACI normalization policy.
13. Contract-party mapping policy.
14. Default item JSON structure.
15. Source traceability fields.
16. Human review requirements.
17. Items excluded from activation.
18. Validation results.

## Validation Checks

In addition to normal docs validation, run a JSON parse check:

```bash
python -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json >/tmp/wave11_default_items_validated.json
```

## Required Validation Commands

Run and capture:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
git diff --cached --name-only
```

Do not run package build/test commands for this documentation-only update unless you intentionally touch source/runtime files, which this prompt does not authorize.


## Commit

Recommended commit summary:

```text
docs(pcc): add wave 11 workbook source mapping
```

Recommended commit description:

```text
Adds Wave 11 Responsibility Matrix workbook source mapping and default item JSON.

Documents extraction posture for the company Responsibility Matrix workbooks, preserves PM and Field default responsibility item traceability, classifies owner-contract template placeholder rows separately, defines assignment mark normalization, RACI mapping, contract-party mapping, source traceability, and human-review requirements.

Documentation/reference-data only. No runtime, package, lockfile, manifest, deployment, tenant, external-system, legal-advice, or production changes.
```

## Final Output Requirements

Return:

- final default item count;
- final ambiguous item count;
- files changed;
- validation results;
- staged file proof;
- commit hash if committed;
- next recommended prompt.
