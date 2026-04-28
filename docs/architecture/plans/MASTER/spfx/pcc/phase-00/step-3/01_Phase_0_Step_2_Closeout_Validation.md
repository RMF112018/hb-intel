# Prompt 01 — Phase 0 Step 2 Closeout Validation

You are working in the GitHub repository:

```text
RMF112018/hb-intel
```

## Objective

Validate and close out:

```text
Phase 0 Step 2 — Schema Extraction Plan and Object Catalog Disposition
```

Create the formal closeout report that confirms whether Step 2 is complete, bounded, and ready for review before Phase 1 begins.

This is a **documentation closeout validation task only**.

Do **not** create schemas.

Do **not** create `packages/project-site-template/`.

Do **not** implement backend provisioning.

Do **not** implement SPFx surfaces.

Do **not** modify app code, backend code, tests, manifests, package versions, provisioning scripts, generated files, build tooling, or any non-markdown implementation artifact.

Do **not** run builds, tests, lint, typecheck, packaging, or deployment unless a markdown-only validation command already exists and is clearly applicable.

Do **not** re-read files that are still within your current context or memory unless you need to verify exact file presence, exact section headings, exact table structure, or exact validation evidence.

---

## Required Source Files

Validate these Step 2 files:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md
```

Reference these Step 1 files:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
```

Use these governing files only as needed for targeted verification:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/README.md
```

Primary implementation authority remains:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
```

---

## Required Carry-Forward From Step 1 and Step 2

Carry forward these Step 1 conclusions:

1. Step 1 Consistency Check Register has zero Fail rows.
2. There are no P0 blockers.
3. Schema extraction may proceed to Phase 1.
4. Step 1 found representation work, not architecture defects.
5. Phase 1 must not introduce new architecture decisions.
6. If extraction exposes a true undecided architecture point, return it to Phase 0 review instead of resolving it inside schema output.

Carry forward these Step 2 conclusions:

1. Step 2 produced a planning-only extraction plan.
2. Step 2 did not create schemas.
3. Step 2 did not create `packages/project-site-template/`.
4. Step 2 declared a 14-family planning taxonomy.
5. Step 2 dispositioned all 18 Contract §4A Object Catalog rows.
6. Step 2 treated Procore Object Link Records and Procore Curated Summary Records as placeholder / future-reference treatment only.
7. Step 2 distinguished schema-enforceable rules from provisioning, backend, SPFx, Site Health, governance, documentation, and cross-layer rules.
8. Step 2 required review acceptance before Phase 1 proceeds to schema generation.
9. Step 2 found no need for Prompt 02 architecture-gap escalation.

---

## Required Validation Checks

Validate and document each check in the closeout report.

### A. File Presence

Confirm these four Step 2 files exist:

```text
Phase_0_Step_2_Schema_Extraction_Plan.md
Phase_0_Step_2_Object_Catalog_Disposition.md
Phase_0_Step_2_Schema_Family_Taxonomy.md
Phase_0_Step_2_Validation_Rule_Table_Plan.md
```

### B. Step 2 Schema Extraction Plan

Confirm the plan includes:

- Executive Summary
- Source Inputs
- Phase 0 Step 1 Carry-Forward
- Extraction Objectives
- Non-Objectives
- Extraction Principles
- Required Schema Families
- Extraction Sequence
- Representation Work Required Before JSON Schema Generation
- Required / Optional Field Marking Plan
- Validation Rule Extraction Plan
- Object Disposition Method
- File and Folder Plan for Future Phase 1
- Out-of-Scope Items
- Phase 1 Entry Gate
- Phase 1 Exit Criteria
- Risks and Mitigations
- Recommended Next Step

Confirm it clearly states:

- planning-only;
- no schemas created;
- no `packages/project-site-template/` created;
- no new architecture decisions;
- Phase 1 should not proceed to schema generation until Step 2 files are reviewed and accepted;
- Phase 1 may begin creating `packages/project-site-template/` only after review acceptance and a separate Phase 1 prompt.

### C. Object Catalog Disposition

Confirm:

- every Contract §4A Object Catalog row is dispositioned;
- the disposition table includes all 18 rows;
- no Object Catalog rows are invented;
- required columns are present:
  - Catalog ID
  - Contract Object Kind
  - Contract Section
  - Proposed Schema Family
  - MVP Treatment
  - Extraction Disposition
  - Dependencies
  - Required Field Consolidation?
  - Required Validation Rules?
  - Notes
- rows 17 and 18 are placeholder / future-reference treatment only;
- rows 17 and 18 do not become full Phase 1 Procore canonical models;
- no-full-Procore-mirror rule is preserved;
- every row has a clear Phase 1 disposition.

### D. Schema Family Taxonomy

Confirm:

- the taxonomy declares 14 families;
- it states the taxonomy is a planning taxonomy, not a new architecture decision;
- every family traces to existing Contract / Blueprint / Roadmap / Step 1 content;
- every family includes purpose, ownership, dependencies, common fields, status fields, traceability fields, governance fields, validation metadata, naming conventions, and future folder-layout guidance.

Confirm the 14 families include:

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

### E. Validation Rule Table Plan

Confirm:

- the rule table structure has these exact columns:
  - Rule ID
  - Rule Category
  - Source Section
  - Applies To
  - Rule Statement
  - Schema Family
  - Enforcement Layer
  - MVP Treatment
  - Blocks Generation If Missing?
  - Notes
- it defines 13 rule categories;
- it defines 8 Enforcement Layers:
  - Schema
  - Provisioning
  - Backend
  - SPFx
  - Site Health
  - Governance
  - Documentation
  - Cross-Layer
- it includes at least 30 initial validation rules;
- it covers all required minimum prompt items;
- it clearly distinguishes schema-enforceable rules from cross-layer behavior rules;
- it does not imply JSON Schema alone can enforce behavior such as no direct SPFx-to-Procore calls.

### F. Phase 1 Gate

Confirm the closeout states whether Phase 1 is:

```text
Ready to Open Phase 1
Ready to Open Phase 1 with Review Notes
Not Ready to Open Phase 1
```

Use this decision logic:

- `Ready to Open Phase 1` if all Step 2 files exist, all validation checks pass, no architecture gaps exist, and no remediation is required.
- `Ready to Open Phase 1 with Review Notes` if all critical checks pass but review comments remain.
- `Not Ready to Open Phase 1` if any required file is missing, Object Catalog rows are incomplete, taxonomy is missing required families, validation-rule structure is incomplete, or Phase 1 would need a new architecture decision.

### G. Boundary Validation

Confirm:

- no JSON, TypeScript, JavaScript, YAML, package, manifest, schema, test, backend, SPFx, generated, or provisioning files changed;
- no `packages/project-site-template/` directory was created;
- no schema files were created;
- no secrets were introduced;
- no package versions changed;
- no build / test / lint / package / deploy commands were run unless markdown-only and clearly applicable.

### H. Anti-Regression Validation

Confirm:

- deprecated enum values are not reintroduced as active values:
  - `preconstruction_only`
  - `warranty_closeout`
- `active_construction` appears only as ProjectStage, not ProjectType;
- `Archived` appears only as ProjectStatus, not ProjectStage;
- `ProcoreCompanyId = 5280` remains configuration, not a secret;
- Procore direct SPFx calls remain prohibited;
- Sage Intacct remains accounting book of record;
- Procore remains operational / project-management financial state;
- external users remain deferred from MVP;
- HBI Assistant remains deferred from MVP;
- Procore write-back remains deferred from MVP;
- SharePoint remains not a full Procore mirror.

---

## Required Closeout Report

Create or update this markdown file:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md
```

Required sections:

```markdown
# Phase 0 Step 2 — Closeout Report

## Summary
## Files Validated
## Files Created
## Files Modified
## Step 1 Carry-Forward Validation
## Step 2 Deliverable Validation
## Object Catalog Disposition Summary
## Schema Family Taxonomy Summary
## Validation Rule Plan Summary
## Phase 1 Readiness Decision
## Remaining Blockers
## Remaining Risks
## Review Notes
## Boundary Validation
## Anti-Regression Validation
## Validation Results
## Recommended Next Prompt
## Commit Summary
## Commit Description
```

## Required Closeout Tables

Include these tables.

### Files Validated

```markdown
| File | Exists? | Validation Result | Notes |
```

### Step 2 Validation Results

```markdown
| Area | Required Result | Actual Result | Pass / Fail | Notes |
```

### Phase 1 Gate

```markdown
| Gate Item | Required State | Actual State | Pass / Fail |
```

### Boundary Validation

```markdown
| Boundary | Required State | Actual State | Pass / Fail |
```

### Anti-Regression Validation

```markdown
| Check | Required State | Actual State | Pass / Fail |
```

---

## Required Recommended Next Prompt

If the Phase 1 decision is `Ready to Open Phase 1` or `Ready to Open Phase 1 with Review Notes`, recommend:

```text
Phase 1 Step 1 — Machine-Readable Template Contract Scaffold and Schema Family Skeleton
```

If the decision is `Not Ready to Open Phase 1`, recommend the specific remediation prompt required before Phase 1.

---

## Required Commit Summary and Description

The closeout report must include a concise commit summary and description.

Use this summary unless validation materially changes the outcome:

```text
docs(sp-project-control-center): close phase 0 schema extraction planning
```

Use this description structure:

```text
Adds the Phase 0 Step 2 closeout report confirming the schema extraction plan, object catalog disposition, schema family taxonomy, and validation rule table plan are complete and bounded for review.

Confirms [Ready to Open Phase 1 / Ready to Open Phase 1 with Review Notes / Not Ready to Open Phase 1] based on validation results.

Markdown-only; no code, schema, SPFx, backend, manifest, test, provisioning, package-version, generated-file, or packages/project-site-template changes.
```

---

## Required Completion Summary

When complete, output:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Phase 1 Readiness Decision
### Validation Result
### Remaining Blockers
### Remaining Risks
### Review Notes
### Boundary Confirmation
### Anti-Regression Confirmation
### Suggested Commit Message
```
