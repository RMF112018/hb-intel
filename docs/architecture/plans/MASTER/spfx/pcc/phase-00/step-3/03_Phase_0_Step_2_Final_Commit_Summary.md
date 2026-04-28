# Prompt 03 — Phase 0 Step 2 Final Commit Summary

Use this prompt after Prompt 01, and after Prompt 02 if Prompt 02 was required.

## Objective

Produce a clean final commit summary and description for the Phase 0 Step 2 closeout validation work.

Do not modify files in this prompt unless the closeout report is missing the final commit summary/description section.

Do not modify code, schemas, SPFx files, backend files, manifests, tests, provisioning scripts, package versions, generated files, or `packages/project-site-template/`.

---

## Required Inputs

Read or use current context for:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md
```

If present, also consider:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md
```

---

## Required Output

Output only the commit summary and description.

Use this structure:

```text
docs(sp-project-control-center): close phase 0 schema extraction planning

Add the Phase 0 Step 2 closeout report under phase-0/, validating the Step 2 schema extraction planning package and confirming the path into Phase 1.

- Validates Phase_0_Step_2_Schema_Extraction_Plan.md.
- Validates Phase_0_Step_2_Object_Catalog_Disposition.md.
- Validates Phase_0_Step_2_Schema_Family_Taxonomy.md.
- Validates Phase_0_Step_2_Validation_Rule_Table_Plan.md.
- Confirms Object Catalog coverage, schema-family taxonomy, validation-rule plan, boundary controls, anti-regression checks, and Phase 1 readiness decision.
- Recommends Phase 1 Step 1 — Machine-Readable Template Contract Scaffold and Schema Family Skeleton, subject to review acceptance.

Markdown-only; no code, schema, SPFx, backend, manifest, test, provisioning, package-version, generated-file, or packages/project-site-template changes.
```

If Prompt 02 was required, include one sentence describing the documentation-only remediation.
