# Prompt 02 — Phase 1 Step 5 Create Validation Harness

## Objective

Create the package-local schema validation harness, representative fixtures, and contract integrity checks for `@hbc/project-site-template`.

This prompt creates the actual validation artifacts. It may add package-local validation scripts and package-local dev dependencies if repo convention permits.

Do not run deployment, provisioning, backend, SPFx, package publishing, or CI tasks.

---

## Required Files to Create

Create:

```text
packages/project-site-template/validation/README.md
packages/project-site-template/validation/validate-template-contract.mjs
packages/project-site-template/validation/contract-integrity-checks.mjs
packages/project-site-template/validation/fixtures/valid/
packages/project-site-template/validation/fixtures/invalid/
packages/project-site-template/validation/reports/.gitkeep
packages/project-site-template/docs/Phase_1_Step_5_Schema_Validation_Harness_Notes.md
```

Create valid fixtures:

```text
packages/project-site-template/validation/fixtures/valid/template-manifest.valid.json
packages/project-site-template/validation/fixtures/valid/enums.valid.json
packages/project-site-template/validation/fixtures/valid/settings.valid.json
packages/project-site-template/validation/fixtures/valid/permissions.valid.json
packages/project-site-template/validation/fixtures/valid/site.valid.json
packages/project-site-template/validation/fixtures/valid/pages.valid.json
packages/project-site-template/validation/fixtures/valid/libraries.valid.json
packages/project-site-template/validation/fixtures/valid/lists.valid.json
packages/project-site-template/validation/fixtures/valid/modules.valid.json
packages/project-site-template/validation/fixtures/valid/workflows.valid.json
packages/project-site-template/validation/fixtures/valid/integrations.valid.json
packages/project-site-template/validation/fixtures/valid/site-health.valid.json
packages/project-site-template/validation/fixtures/valid/provisioning-validation.valid.json
packages/project-site-template/validation/fixtures/valid/validation-rules.valid.json
```

Create invalid fixtures:

```text
packages/project-site-template/validation/fixtures/invalid/invalid_project_type_active_construction.json
packages/project-site-template/validation/fixtures/invalid/invalid_project_stage_archived.json
packages/project-site-template/validation/fixtures/invalid/invalid_mvp_status_shorthand.json
packages/project-site-template/validation/fixtures/invalid/invalid_integration_missing_procore_boundary_consts.json
packages/project-site-template/validation/fixtures/invalid/invalid_integration_procore_secret_like_field.json
packages/project-site-template/validation/fixtures/invalid/invalid_module_visibility_keyed_on_project_type.json
packages/project-site-template/validation/fixtures/invalid/invalid_template_contract_missing_family.json
```

You may add a fixture metadata file if useful:

```text
packages/project-site-template/validation/fixtures/fixture-manifest.json
```

---

## Package Metadata

Inspect:

```text
packages/project-site-template/package.json
root package.json
pnpm-workspace.yaml
```

Use package-local scripts.

If adding dependencies, add only package-local dev dependencies needed for validation, preferably:

```text
ajv
ajv-formats
```

Do not add runtime dependencies.

Do not modify root workspace files unless required by repo package convention.

Do not add build or publish scripts.

---

## Validation Script Requirements

### `validate-template-contract.mjs`

Must:

1. Load all 14 family schemas.
2. Load `template-contract.schema.json`.
3. Load `template-contract.json`.
4. Compile schemas using JSON Schema Draft 2020-12.
5. Register schemas with stable `$id` support.
6. Validate `template-contract.json`.
7. Validate every valid fixture and require success.
8. Validate every invalid fixture and require failure.
9. Produce clear console output by family/fixture.
10. Exit non-zero on any unexpected failure.
11. Write a JSON report to:

```text
packages/project-site-template/validation/reports/schema-validation-report.json
```

The report should be committed only if repo convention allows generated reports. Prefer not to commit generated report output unless it is deterministic and intentionally part of the package. If not committed, document command output expectations in notes.

### `contract-integrity-checks.mjs`

Must verify cross-file constraints:

1. All expected schema files exist.
2. All 14 families are listed in `template-contract.json`.
3. All 14 families are `status: "populated"` before final closeout.
4. `fullExtractionComplete` state is consistent with the current prompt stage.
5. Family schema paths in the contract exist.
6. Field maps exist for the 12 Step 3 field-map families.
7. `object-catalog-field-disposition.json` contains 18 OC rows.
8. OC-17 and OC-18 remain placeholder-only / Deferred.
9. `integrations.schema.json` includes:
   - `noFullProcoreMirror` `const: true`
   - `noDirectSpfxToProcore` `const: true`
   - `noProcoreSecrets` `const: true`
   - `procoreDirectoryComparison_ReadOnly` `const: true`
   - `procoreWriteback_Deferred` `const: true`
   - `procoreMapping_ProcoreCompanyId.default === "5280"`
10. No schema or fixture contains secret-like field names or values outside no-secret guardrail descriptions.
11. No valid enum definition uses scaffold shorthand values:
   - `mvp`
   - `deferred`
   - `placeholder`
12. No `projectType` enum includes:
   - `preconstruction_only`
   - `warranty_closeout`
   - `active_construction`
13. No `projectStage` enum includes:
   - `Archived`
14. `modules.visibilityByStage` does not key on ProjectType.
15. `seedRule.keyedOn` / `verticalSeeding.keyedOn` uses `projectType` where present.
16. No backend, SPFx, provisioning, manifest, generated, CI, dependency, or root-workspace files are required for validation.

It must exit non-zero on any failed check.

---

## Fixture Design Rules

Valid fixtures should be minimal but realistic. They must:

- include all required fields;
- use canonical enum values;
- include source traceability fields;
- avoid secrets and live URLs where not required;
- use clearly fake example values;
- include Procore example values only as safe configuration, not secrets;
- include `ProcoreCompanyId = "5280"` where required by integration/settings examples;
- include Deferred examples where required (HBI Assistant, external users, Procore write-back).

Invalid fixtures should target one failure each and be documented in fixture manifest or inline script metadata.

Do not include production data, secrets, real tokens, real users, or live URLs.

---

## Documentation Requirements

Update:

```text
packages/project-site-template/validation/README.md
```

Required sections:

```markdown
# Project Site Template Validation Harness

## Purpose
## Commands
## Tooling
## Schema Coverage
## Fixture Coverage
## Integrity Checks
## Reports
## Guardrails
## What This Does Not Validate
```

Update:

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

Recommended next prompt:

```text
Phase 1 Step 5 — Run Harness and Remediate Schema Defects
```

---

## Validation Before Completion

Before completing this prompt, run at minimum:

```text
node packages/project-site-template/validation/validate-template-contract.mjs
node packages/project-site-template/validation/contract-integrity-checks.mjs
```

If package scripts are added, also run:

```text
<package manager> --filter @hbc/project-site-template validate:all
```

Use the repo's package manager convention.

If validation fails due to schema defects, do not broadly fix in this prompt. Record failures and proceed to Prompt 03.

---

## Completion Summary

Output:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Dev Dependencies / Scripts
### Harness Created
### Fixtures Created
### Integrity Checks Created
### Validation Commands Run
### Validation Result
### Failures Requiring Prompt 03
### Guardrails Preserved
### Suggested Commit Message
```

Suggested commit message:

```text
test(project-site-template): add schema validation harness
```
