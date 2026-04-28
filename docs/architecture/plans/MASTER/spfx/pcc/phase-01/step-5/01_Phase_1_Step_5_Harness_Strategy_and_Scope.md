# Prompt 01 — Phase 1 Step 5 Harness Strategy and Scope

You are working in the GitHub repository:

```text
RMF112018/hb-intel
```

## Objective

Execute:

```text
Phase 1 Step 5 — Schema Validation Harness and Contract Integrity Checks
```

Create the validation harness and integrity-check package required to prove that the Phase 1 machine-readable Project Site Template contract is internally coherent.

This is the final Phase 1 validation gate before Phase 2 provisioning planning.

---

## Current State

Phase 1 Step 4 populated all 14 schema families and confirmed:

- all 14 family schemas are populated;
- `template-contract.json` marks all 14 families `status: "populated"`;
- `status.fullExtractionComplete` remains `false`;
- the Procore boundary is hard-encoded;
- scaffold shorthand is retired across populated schemas;
- no backend, SPFx, provisioning, manifest, test, generated, CI, dependency, script, root-workspace, package, or deploy changes were introduced;
- Phase 1 Step 5 is the next required step.

---

## Required Source Files

Use these files as source inputs:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_4_Per_Family_Schema_Population_Closeout.md
packages/project-site-template/README.md
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/template-contract.schema.json
packages/project-site-template/schemas/families/*.schema.json
packages/project-site-template/fields/common-fields.json
packages/project-site-template/fields/object-catalog-field-disposition.json
packages/project-site-template/fields/family-field-dependencies.json
packages/project-site-template/fields/families/*.fields.json
packages/project-site-template/docs/Phase_1_Step_4_Per_Family_Schema_Population_Notes.md
```

Primary machine-readable sources:

```text
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/
packages/project-site-template/fields/
```

Primary human-readable authority:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
```

Do not re-read files that are still within your current context or memory unless exact section anchors, exact schema paths, exact fields, or exact validation failures must be verified.

---

## Allowed File Changes

You may create or modify files only under:

```text
packages/project-site-template/
docs/architecture/blueprint/sp-project-control-center/phase-1/
```

Allowed file types for Step 5:

```text
.json
.md
.mjs
```

Allowed package-local files:

```text
packages/project-site-template/package.json
packages/project-site-template/README.md
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/template-contract.schema.json
packages/project-site-template/schemas/families/*.schema.json
packages/project-site-template/validation/
packages/project-site-template/validation/README.md
packages/project-site-template/validation/validate-template-contract.mjs
packages/project-site-template/validation/contract-integrity-checks.mjs
packages/project-site-template/validation/fixtures/
packages/project-site-template/validation/fixtures/valid/
packages/project-site-template/validation/fixtures/invalid/
packages/project-site-template/validation/reports/
packages/project-site-template/docs/Phase_1_Step_5_Schema_Validation_Harness_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_5_Schema_Validation_Harness_Closeout.md
```

You may update family schemas only if the validation harness exposes a mechanical schema defect, such as invalid JSON Schema syntax, bad `$ref`, missing required property definition, mismatch with already-approved enum values, or a contradiction with the field maps. Do not use Step 5 to expand the contract or add new architecture.

Do not modify:

- backend files;
- SPFx files;
- provisioning files;
- manifests;
- generated files;
- CI files;
- root workspace files;
- unrelated package dependencies;
- deployment files.

Do not run package/deployment/provisioning commands.

---

## Tooling Policy

Prefer a package-local validation harness.

If the repo already has a JSON Schema validation dependency or standard script, use the existing convention.

If no existing convention exists, you may use one of these approaches:

### Preferred

Add package-local development dependency:

```json
"devDependencies": {
  "ajv": "<compatible current repo-supported version>",
  "ajv-formats": "<compatible current repo-supported version>"
}
```

Add package-local scripts only:

```json
"scripts": {
  "validate": "node validation/validate-template-contract.mjs",
  "validate:integrity": "node validation/contract-integrity-checks.mjs",
  "validate:all": "node validation/validate-template-contract.mjs && node validation/contract-integrity-checks.mjs"
}
```

Do not modify root workspace files unless repo conventions require it and the reason is documented.

### Fallback

If adding dependencies is not acceptable under repo policy, create a dependency-light structural checker using Node built-ins and document the limitation clearly:

```text
JSON well-formedness and structural integrity checks only; full JSON Schema validation deferred.
```

Only use fallback if the repo clearly rejects package-local dev dependencies.

---

## Required Harness Capabilities

The validation harness must validate:

1. Every schema file parses as JSON.
2. Every family schema is valid JSON Schema Draft 2020-12.
3. Every representative valid fixture passes its family schema.
4. Representative invalid fixtures fail as expected.
5. `template-contract.json` validates against `template-contract.schema.json`.
6. Every family entry in `template-contract.json` references an existing schema file.
7. All 14 family entries have `status: "populated"`.
8. `fullExtractionComplete` remains false until the closeout prompt explicitly flips it.
9. `mvp_status` values use the canonical Decision Closure four-value enum.
10. Scaffold shorthand values do not appear as valid `mvp_status` enum values:
   - `mvp`
   - `deferred`
   - `placeholder`
11. Deprecated ProjectType tokens are not valid enum values:
   - `preconstruction_only`
   - `warranty_closeout`
   - `active_construction` as ProjectType
12. `Archived` is not valid ProjectStage.
13. ProjectStage and ProjectType boundaries are preserved.
14. Procore boundary const values are enforced in representative integration fixtures.
15. OC-17 and OC-18 fields remain optional placeholder-only.
16. No Procore secrets appear in schemas, fixtures, reports, markdown, or validation scripts.
17. Sage Intacct remains accounting book of record.
18. External users, HBI Assistant, and Procore write-back remain Deferred where applicable.
19. Field maps and schemas remain aligned at the family level.
20. No backend/SPFx/provisioning/runtime files are required or touched.

---

## Required Representative Fixture Coverage

Create representative valid fixtures for all 14 families:

```text
template-manifest
enums
settings
permissions
site
pages
libraries
lists
modules
workflows
integrations
site-health
provisioning-validation
validation-rules
```

At minimum, each family must have one valid fixture.

Create targeted invalid fixtures for key guardrails:

```text
invalid_project_type_active_construction.json
invalid_project_stage_archived.json
invalid_mvp_status_shorthand.json
invalid_integration_missing_procore_boundary_consts.json
invalid_integration_procore_secret_like_field.json
invalid_module_visibility_keyed_on_project_type.json
invalid_template_contract_missing_family.json
```

Invalid fixtures may be grouped by family if the harness expects fixture metadata.

---

## Required Integrity Checks Beyond Schema Validation

Create an integrity-check script that verifies cross-file constraints not easily enforced by a single JSON Schema:

1. All 14 schema families exist.
2. All 14 families are listed in `template-contract.json`.
3. All 14 families are `status: "populated"`.
4. Every family schema has `$schema`, `$id`, `title`, `description`, `type`, `properties`, and `required`.
5. Every family schema includes canonical traceability fields.
6. Every family schema uses canonical Decision Closure enum where `mvp_status` exists.
7. No populated family schema contains scaffold shorthand as valid enum values.
8. `enums.schema.json` and `validation-rules.schema.json` remain present and parse.
9. Field map family files exist for the 12 families from Step 3.
10. `object-catalog-field-disposition.json` includes all 18 OC rows.
11. OC-17 and OC-18 remain placeholder-only / Deferred.
12. `integrations.schema.json` contains hard Procore boundary consts.
13. No raw secret-like keys are added.
14. `fullExtractionComplete` should be false until the closeout prompt has passed all checks.

---

## Required Notes

Create:

```text
packages/project-site-template/docs/Phase_1_Step_5_Schema_Validation_Harness_Notes.md
```

Required sections:

```markdown
# Phase 1 Step 5 — Schema Validation Harness Notes

## Summary
## Files Created
## Files Modified
## Tooling Decision
## Harness Capabilities
## Fixture Coverage
## Integrity Checks
## Validation Commands
## Results
## What Was Not Implemented
## Guardrails Preserved
## Recommended Next Step
```

---

## Required Completion Summary

When done with strategy/harness creation, output:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Tooling Decision
### Harness Capabilities
### Fixture Coverage
### Integrity Checks Added
### Guardrails Preserved
### Validation Commands
### Remaining Risks
### Recommended Next Prompt
```

Recommended next prompt:

```text
Phase 1 Step 5 — Run Harness and Remediate Schema Defects
```
