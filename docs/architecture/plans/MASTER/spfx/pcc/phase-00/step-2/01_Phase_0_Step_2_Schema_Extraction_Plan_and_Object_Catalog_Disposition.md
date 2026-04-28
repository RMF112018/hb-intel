# Prompt 01 — Phase 0 Step 2 Schema Extraction Plan and Object Catalog Disposition

You are working in the GitHub repository:

```text
RMF112018/hb-intel
```

## Objective

Execute:

```text
Phase 0 Step 2 — Schema Extraction Plan and Object Catalog Disposition
```

Convert the Phase 0 Step 1 audit findings into a concrete schema-extraction plan for the future Phase 1 — Machine-Readable Template Contract effort.

This prompt must answer:

1. Which object families from the Standard Project Site Template Contract must become machine-readable schema families?
2. How should every Object Catalog row be dispositioned for schema extraction?
3. What schema-family taxonomy should Phase 1 use?
4. What validation-rule categories must be extracted before JSON Schema generation?
5. What required/optional field marking work must occur before Phase 1 schemas are generated?
6. What is explicitly out of scope for Phase 1 schema extraction?

This is a **documentation, planning, and disposition task only**.

Do **not** create schemas.

Do **not** create `packages/project-site-template/`.

Do **not** implement backend provisioning.

Do **not** implement SPFx surfaces.

Do **not** modify app code, backend code, tests, manifests, package versions, provisioning scripts, generated files, or build tooling.

Do **not** run builds, tests, lint, typecheck, packaging, or deployment unless a markdown-only validation command already exists and is clearly applicable.

Do **not** re-read files that are still within your current context or memory unless you need to verify exact section headings, resolve a contradiction, or confirm repo truth.

---

## Required Source Files

Use these files as repo-truth inputs:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/README.md
```

Primary authority for implementation disposition:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
```

Use the blueprint for strategic alignment and terminology only. Do not derive implementation fields from the blueprint where the contract is more specific.

---

## Required Carry-Forward From Phase 0 Step 1

Carry forward these Step 1 conclusions as hard constraints:

1. Schema extraction may proceed to Phase 1.
2. The Step 1 Consistency Check Register has zero Fail rows.
3. There are no P0 blockers.
4. Step 1 identified representation work, not architecture defects.
5. Phase 1 must not introduce new architecture decisions.
6. If extraction exposes a true undecided architecture point, return it to Phase 0 review instead of resolving it inside schema output.

Carry forward these P1 representation work items:

- consolidate per-object columns from pages, lists, libraries, modules, workflows, settings, permissions, integrations, and health records;
- apply uniform required/optional markers across object families;
- define the Schema Family taxonomy before creating schema files;
- map every Object Catalog row to one schema family;
- build a structured Validation Rule Table plan covering enum bindings, conditional visibility, read-only-by-status behavior, referential rules, ownership rules, no-secret rules, and no-direct-Procore rules;
- preserve Procore Phase 8 / Phase 9 canonical-model work as out of scope for Phase 1 except where mapping, launch-link, summary, audit, object-link, and sync-health placeholders are already governed by the contract.

---

## Required Deliverables

Create or update these markdown files only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md
```

Do not create non-markdown files.

Do not modify governing files unless a true blocking contradiction is discovered. If a blocking contradiction is discovered, stop and use Prompt 02 instead of patching directly.

---

## Deliverable 1 — Schema Extraction Plan

File:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md
```

Required sections:

```markdown
# Phase 0 Step 2 — Schema Extraction Plan

## Executive Summary
## Source Inputs
## Phase 0 Step 1 Carry-Forward
## Extraction Objectives
## Non-Objectives
## Extraction Principles
## Required Schema Families
## Extraction Sequence
## Representation Work Required Before JSON Schema Generation
## Required / Optional Field Marking Plan
## Validation Rule Extraction Plan
## Object Disposition Method
## File and Folder Plan for Future Phase 1
## Out-of-Scope Items
## Phase 1 Entry Gate
## Phase 1 Exit Criteria
## Risks and Mitigations
## Recommended Next Step
```

### Required Extraction Principles

Include these principles:

- Contract-first extraction.
- No new architecture decisions inside schema output.
- Every schema object must trace to a contract section and Object Catalog row where applicable.
- MVP, Future, Deferred, Runtime Configuration, and Proof-Gated statuses must remain explicit.
- Procore mapping/summary/audit placeholders may be represented; full Procore canonical model is out of Phase 1 scope.
- External users remain deferred from MVP.
- HBI Assistant remains deferred from MVP.
- Direct SPFx-to-Procore calls remain prohibited.
- Procore secrets are never schema fields.
- Sage Intacct remains accounting book of record.
- SharePoint is not a full Procore mirror.

### Required Extraction Sequence

Use and refine this sequence unless repo truth requires a different order:

1. Settings Schema
2. Permission Template Schema
3. Enum and Validation Rule Schema
4. List Schema
5. Library Schema
6. Page Schema
7. Module Schema
8. Workflow Template Schema
9. Integration / Procore Mapping Schema
10. Site Health / Drift / Repair Schema
11. Provisioning Validation Schema
12. Template Manifest / Version Schema

Explain why this order minimizes rework.

---

## Deliverable 2 — Object Catalog Disposition

File:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md
```

Required sections:

```markdown
# Phase 0 Step 2 — Object Catalog Disposition

## Purpose
## Source of Truth
## Disposition Rules
## Object Catalog Disposition Table
## Cross-Family Dependencies
## MVP / Future / Deferred Treatment
## Runtime Configuration Treatment
## Proof-Gated Treatment
## Objects Requiring Field-Level Consolidation
## Objects Requiring Validation Rule Extraction
## Objects Excluded From Phase 1
## Open Questions
## Phase 1 Handoff
```

### Required Disposition Table Columns

Use this exact table structure:

```markdown
| Catalog ID | Contract Object Kind | Contract Section | Proposed Schema Family | MVP Treatment | Extraction Disposition | Dependencies | Required Field Consolidation? | Required Validation Rules? | Notes |
```

### Required Extraction Disposition Values

Use only:

```text
Extract in Phase 1
Extract as Placeholder in Phase 1
Defer from Phase 1
Runtime Configuration Reference
Proof-Gated Reference
Out of Scope
Needs Architecture Review
```

### Object Catalog Coverage

Disposition every Object Catalog row from the contract. At minimum, include rows for:

- Site
- Site Pages
- Document Libraries
- SharePoint Lists
- List/Library Fields
- Views
- SharePoint Groups
- Permission Templates
- Configuration Records
- Module Records
- Integration Records
- Health Records
- Workflow Template Records
- Procore Project Mapping
- Procore Subject Area Registry
- Procore Sync Health
- Procore Object Link Records
- Procore Curated Summary Records

If the contract includes additional rows, include them. Do not invent rows that are not in the contract. If a needed object is not in the catalog but appears in the contract, add a separate “Potential Catalog Gap” table and mark it `Needs Architecture Review`.

---

## Deliverable 3 — Schema Family Taxonomy

File:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md
```

Required sections:

```markdown
# Phase 0 Step 2 — Schema Family Taxonomy

## Purpose
## Taxonomy Principles
## Schema Families
## Family Ownership
## Family Dependencies
## Required Common Fields
## Required Status Fields
## Required Source Traceability Fields
## Required Governance Fields
## Required Validation Metadata
## Field Naming Conventions
## Future Folder Layout Proposal
## Open Questions
## Phase 1 Handoff
```

### Required Schema Families

Include these families unless repo truth forces a change:

| Schema Family | Purpose |
|---|---|
| `template-manifest` | Template identity, version, family, owner, source-traceability, and global MVP status metadata |
| `enums` | ProjectType, ProjectStage, ProjectStatus, Decision Closure status, severity, repair tier, object status, module visibility, integration status |
| `settings` | Control Center Settings, module settings, integration settings, tenant/runtime references |
| `permissions` | SharePoint groups, permission templates, access manager rules, expiration defaults, audit actions |
| `site` | Site identity, naming, URL rules, project metadata, phase association, archive behavior |
| `pages` | Site pages, shell pages, module pages, settings pages, route/page metadata |
| `libraries` | Document libraries, metadata, views, read-only/archive behavior |
| `lists` | SharePoint lists, fields, views, indexes, lookup dependencies, list-level governance |
| `modules` | PCC module registry, visibility, dependencies, rollup contribution, MVP/future treatment |
| `workflows` | Startup, closeout, permits, inspections, responsibility matrix, action generation |
| `integrations` | Integration records, launch links, mapping placeholders, Procore MVP mapping, non-Procore placeholders |
| `site-health` | Health records, checks, severity, drift, repair tiers, audit and validation posture |
| `provisioning-validation` | Provisioning stages, post-provision validation, audit records, rollback/repair references |
| `validation-rules` | Enum, conditional, referential, ownership, system-of-record, no-secret, no-direct-call, and stage/status rules |

If you believe this taxonomy should change, explain why and cite repo truth.

---

## Deliverable 4 — Validation Rule Table Plan

File:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md
```

Required sections:

```markdown
# Phase 0 Step 2 — Validation Rule Table Plan

## Purpose
## Why This Is Required Before JSON Schema Generation
## Rule Categories
## Required Rule Table Structure
## Initial Rule Inventory
## Enum Binding Rules
## Conditional Visibility Rules
## Stage / Status Rules
## Runtime Configuration Rules
## Permission and Ownership Rules
## Procore Boundary Rules
## System-of-Record Rules
## No-Secret Rules
## No-Native-SharePoint-Admin Rules
## Referential Integrity Rules
## Site Health / Drift / Repair Rules
## Provisioning Validation Rules
## Phase 1 Extraction Instructions
## Open Questions
```

### Required Rule Table Columns

Use this exact structure for the proposed future rule table:

```markdown
| Rule ID | Rule Category | Source Section | Applies To | Rule Statement | Schema Family | Enforcement Layer | MVP Treatment | Blocks Generation If Missing? | Notes |
```

### Required Rule Categories

Use these categories:

```text
Enum Binding
Conditional Visibility
Stage / Status Behavior
Runtime Configuration
Permission / Ownership
Procore Boundary
System of Record
No Secret
No Native SharePoint Admin
Referential Integrity
Site Health / Drift / Repair
Provisioning Validation
MVP / Deferred Scope
```

### Required Enforcement Layer Values

Use only:

```text
Schema
Provisioning
Backend
SPFx
Site Health
Governance
Documentation
Cross-Layer
```

### Required Initial Rule Inventory

Include initial rows for at least:

- ProjectType enum allowed values.
- ProjectStage enum allowed values.
- ProjectStatus enum allowed values.
- archive is ProjectStatus, not ProjectStage.
- `active_construction` is ProjectStage, not ProjectType.
- deprecated values are forbidden as active values.
- module visibility is keyed on ProjectStage.
- vertical seeding is keyed on ProjectType.
- archive/read-only behavior is keyed on ProjectStatus.
- `ProcoreCompanyId = 5280` is configuration, not secret.
- Procore mapping owner is Project Manager with Project Executive fallback.
- Project Accountant is not Procore mapping owner.
- SPFx must not call Procore directly.
- Procore secrets must not appear in schema, SharePoint, SPFx, markdown, repo source, or client config.
- Sage Intacct is accounting book of record.
- Procore financial data is operational / project-management state.
- Procore directory comparison does not grant SharePoint access.
- normal users do not use native SharePoint admin/edit screens.
- external users deferred from MVP.
- HBI Assistant deferred from MVP.
- Procore write-back deferred from MVP.
- Site Health severity values.
- Repair tiers T1–T4.
- Decision Closure Register statuses.

---

## Required Quality Bar

Every deliverable must be:

- contract-traceable;
- implementation-oriented;
- explicit about what Phase 1 may and may not do;
- explicit that no schemas are created yet;
- explicit that no new architecture decisions are introduced;
- clear about MVP / Future / Deferred / Runtime Configuration / Proof-Gated treatment;
- clear about Procore boundaries and no-secret posture;
- free of invented IDs, credentials, secrets, or implementation assumptions.

Use tables heavily where useful.

---

## Validation Requirements

Before completion, verify and document:

1. The four required Step 2 markdown files exist.
2. No JSON, TypeScript, JavaScript, YAML, package, manifest, schema, test, backend, SPFx, generated, or provisioning files changed.
3. No `packages/project-site-template/` directory was created.
4. No schema files were created.
5. No secrets were introduced.
6. Deprecated enum values are not reintroduced as active values: `preconstruction_only`, `warranty_closeout`.
7. `active_construction` appears only as ProjectStage, not ProjectType.
8. ProcoreCompanyId remains configuration, not secret.
9. Procore direct SPFx calls remain prohibited.
10. Phase 1 handoff is explicit and does not embed new architecture decisions.
11. Every Object Catalog row has a disposition.
12. Every proposed schema family has a clear purpose.
13. The validation-rule plan includes the required categories and table shape.
14. Closeout states whether Phase 1 may begin creating `packages/project-site-template/` after review.

---

## Required Completion Summary

When complete, provide:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Object Catalog Disposition Result
### Schema Families Proposed
### Validation Rule Categories Proposed
### Phase 1 Handoff
### Open Questions
### Validation Performed
### Confirmation of No Code / Schema / SPFx / Backend Changes
### Suggested Commit Message
```

Suggested commit message:

```text
docs(sp-project-control-center): add phase 0 schema extraction plan
```
