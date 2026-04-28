# Prompt 01 — Phase 1 Step 1 Template Contract Scaffold and Schema Family Skeleton

You are working in the GitHub repository:

```text
RMF112018/hb-intel
```

## Objective

Execute:

```text
Phase 1 Step 1 — Machine-Readable Template Contract Scaffold and Schema Family Skeleton
```

Create the first machine-readable scaffold for the Project Control Center Standard Project Site Template Contract.

This step should create the `packages/project-site-template/` scaffold and empty / skeletal schema-family files that reflect the Phase 0 Step 2 planning taxonomy. It must **not** perform full schema extraction yet.

This step prepares the workspace for later Phase 1 work:

```text
Phase 1 Step 2 — Enum and Validation Rule Extraction
Phase 1 Step 3 — Object Family Field Consolidation
Phase 1 Step 4 — Per-Family Schema Population
Phase 1 Step 5 — Schema Validation Harness
```

---

## Phase 0 Readiness Basis

Phase 0 is complete. The Phase 0 Step 2 Closeout Report confirmed:

- all four Step 2 planning files exist;
- all 18 Object Catalog rows are dispositioned;
- the 14-family planning taxonomy is intact;
- the validation rule table plan includes 13 rule categories, 8 enforcement layers, and 30 initial rules;
- no Prompt 02 architecture-gap escalation was required;
- no schemas or `packages/project-site-template/` were created during Phase 0;
- Phase 1 readiness decision: `Ready to Open Phase 1`.

Carry this forward as the execution gate for this prompt.

---

## Required Source Files

Use these files as governing context:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/README.md
```

Use these Phase 0 files as immediate implementation inputs:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md
```

Primary authority for implementation field truth:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
```

Use the Blueprint for strategic alignment and terminology only.

Do not re-read files that are still in your current context or memory unless you need to verify exact section anchors, exact filenames, exact package conventions, or repo truth.

---

## Required Repo Convention Check

Before creating files, inspect only the minimum necessary repo/package convention files to determine whether `packages/` packages normally include `package.json`, README files, schema folders, or TypeScript build configuration.

Allowed targeted checks:

```text
package.json
pnpm-workspace.yaml
turbo.json
packages/*/package.json
packages/*/README.md
```

Do **not** conduct a broad repo audit. Do **not** alter root workspace configuration unless absolutely required by existing workspace conventions. If root `package.json` or workspace globs already include `packages/*`, do not modify root config.

---

## Allowed File Creation

You may create files under:

```text
packages/project-site-template/
```

You may create a Phase 1 documentation folder under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/
```

Allowed file types for this prompt:

```text
.md
.json
```

Do not create TypeScript, JavaScript, YAML, shell, PowerShell, generated, SPFx, backend, provisioning, manifest, or test files.

Do not create executable code.

Do not create CI workflow changes.

Do not run build, test, lint, typecheck, packaging, deployment, or provisioning commands.

---

## Required Scaffold Structure

Create this structure unless repo conventions force a minor naming adjustment. If a naming adjustment is required, document the reason in the closeout.

```text
packages/project-site-template/
  README.md
  template-contract.json
  schemas/
    template-contract.schema.json
    families/
      template-manifest.schema.json
      enums.schema.json
      settings.schema.json
      permissions.schema.json
      site.schema.json
      pages.schema.json
      libraries.schema.json
      lists.schema.json
      modules.schema.json
      workflows.schema.json
      integrations.schema.json
      site-health.schema.json
      provisioning-validation.schema.json
      validation-rules.schema.json
  docs/
    Phase_1_Step_1_Scaffold_Notes.md
```

Package metadata:

- Create `packages/project-site-template/package.json` only if repo package conventions require package directories to include one.
- If created, it must be non-build/non-publish by default:
  - `"private": true`
  - no build script unless existing package convention strictly requires it;
  - no dependency additions unless unavoidable;
  - no root workspace changes unless required.

Preferred package name, if `package.json` is created:

```json
{
  "name": "@hbc/project-site-template",
  "private": true
}
```

Do not add runtime dependencies.

---

## Required Schema Families

Create a skeleton schema file for each of the 14 Phase 0 Step 2 families:

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

Each family schema skeleton must include:

- `$schema`
- `$id`
- `title`
- `description`
- `type`
- `additionalProperties`
- common traceability properties:
  - `id`
  - `kind`
  - `mvp_status`
  - `sourceContractSection`
  - `sourceCatalogId`
  - `sourceBlueprintSection`
  - `sourceDecisionRef`
  - `validationRuleRefs`
  - `ownerCategory`
- `required` array with only safe universal fields:
  - `id`
  - `kind`
  - `mvp_status`
  - `sourceContractSection`
- a top-level comment or description stating:
  - skeleton only;
  - not fully populated;
  - full extraction occurs in later Phase 1 steps.

Do not fully populate object fields in this step.

Do not invent field definitions not traceable to Phase 0 Step 2 taxonomy or the Contract.

---

## Required Root Contract Skeleton

Create:

```text
packages/project-site-template/template-contract.json
```

This is a skeleton contract instance, not the final extracted contract.

It must include:

```json
{
  "templateName": "HB Standard Project Site Template",
  "templateFamily": "Project Sites",
  "templateVersion": "1.0.0-proposed",
  "phase": "Phase 1 Step 1 scaffold",
  "source": {
    "contract": "docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md",
    "blueprint": "docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md",
    "phase0Closeout": "docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md"
  },
  "status": {
    "readiness": "scaffold-only",
    "fullExtractionComplete": false,
    "containsNewArchitectureDecisions": false
  },
  "families": {}
}
```

Then add a key for each 14 schema family under `families`, with each family pointing to the appropriate skeleton schema file and carrying `status: "skeleton"`.

Do not populate full objects yet.

---

## Required Template Contract Schema Skeleton

Create:

```text
packages/project-site-template/schemas/template-contract.schema.json
```

This schema validates the high-level scaffold shape only. It must:

- define template identity fields;
- define `source`;
- define `status`;
- define `families`;
- reference the 14 family schema files using relative `$ref` where practical;
- clearly mark that family contents are scaffold-only.

Do not attempt to validate fully extracted object details in this step.

---

## Required README

Create:

```text
packages/project-site-template/README.md
```

Required sections:

```markdown
# Project Site Template Contract

## Purpose
## Phase 1 Step 1 Scope
## Source of Truth
## Current Status
## Folder Structure
## Schema Families
## What This Scaffold Does
## What This Scaffold Does Not Do
## Guardrails
## Phase 1 Next Steps
## Validation Notes
```

Required statements:

- This package is the future machine-readable contract target for PCC.
- The Standard Project Site Template Contract remains the source of truth.
- This step creates scaffold and family skeletons only.
- Full extraction happens in later Phase 1 steps.
- No backend, SPFx, provisioning, Graph, SharePoint, or Procore integration implementation lives here.
- Procore canonical model remains out of scope.
- No secrets belong in this package.

---

## Required Phase 1 Step 1 Notes

Create:

```text
packages/project-site-template/docs/Phase_1_Step_1_Scaffold_Notes.md
```

Required sections:

```markdown
# Phase 1 Step 1 — Scaffold Notes

## Summary
## Files Created
## Source Inputs
## Family Skeletons Created
## Root Contract Skeleton
## What Was Not Extracted
## Deferred Phase 1 Work
## Guardrails Preserved
## Validation Performed
## Recommended Next Step
```

Recommended next step:

```text
Phase 1 Step 2 — Enum and Validation Rule Extraction
```

---

## Optional Phase 1 Documentation

Create this only if useful:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_1_Scaffold_Closeout.md
```

If created, keep it concise and reference the scaffold notes rather than duplicating all content.

---

## Required Guardrails

The scaffold must preserve:

- no new architecture decisions;
- no direct SPFx-to-Procore calls;
- no Procore secrets;
- ProcoreCompanyId = 5280 as configuration, not secret;
- Procore Object Link Records and Procore Curated Summary Records remain placeholder / future-reference only;
- no full Procore canonical model;
- no full Procore mirror;
- Sage Intacct remains accounting book of record;
- external users remain deferred from MVP;
- HBI Assistant remains deferred from MVP;
- Procore write-back remains deferred from MVP;
- deprecated enum values are forbidden only and not valid values:
  - `preconstruction_only`
  - `warranty_closeout`
  - `active_construction` as ProjectType;
- `Archived` remains ProjectStatus only, not ProjectStage;
- `active_construction` remains ProjectStage only, not ProjectType.

---

## Required Validation

After creating the scaffold, verify:

1. `packages/project-site-template/` exists.
2. `packages/project-site-template/README.md` exists.
3. `packages/project-site-template/template-contract.json` exists.
4. `packages/project-site-template/schemas/template-contract.schema.json` exists.
5. All 14 family schema skeleton files exist.
6. `packages/project-site-template/docs/Phase_1_Step_1_Scaffold_Notes.md` exists.
7. No backend files changed.
8. No SPFx files changed.
9. No provisioning files changed.
10. No manifests changed.
11. No test files changed.
12. No generated files changed.
13. No CI files changed.
14. No root workspace files changed unless required by package convention and explicitly documented.
15. No secrets were introduced.
16. No package dependencies were added unless required by existing package convention and explicitly documented.
17. No full object extraction was performed.
18. No Procore canonical-model files were created.
19. No direct-Procore runtime code was created.
20. Deprecated enum values appear only in guardrail / forbidden-value context, never as valid enum values.

---

## Required Completion Summary

When complete, output:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Package Scaffold Created
### Family Skeletons Created
### Root Contract Skeleton
### What Was Not Extracted
### Guardrails Preserved
### Validation Performed
### Remaining Risks
### Recommended Next Step
### Suggested Commit Message
```

Suggested commit message:

```text
feat(project-site-template): scaffold machine-readable template contract
```

Commit description:

```text
Create the initial Project Site Template package scaffold for the Phase 1 machine-readable PCC contract.

Adds a root template-contract skeleton, template-contract schema skeleton, 14 schema-family skeleton files, package README, and scaffold notes. The scaffold is traceable to the Phase 0 Step 2 closeout and preserves the no-new-architecture-decisions boundary.

Scaffold only: no full schema extraction, backend provisioning, SPFx implementation, Procore integration, CI changes, generated files, or deployment artifacts.
```
