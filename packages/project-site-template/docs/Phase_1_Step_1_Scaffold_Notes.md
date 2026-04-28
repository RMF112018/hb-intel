# Phase 1 Step 1 — Scaffold Notes

## Summary

Phase 1 Step 1 created the `@hbc/project-site-template` package as a scaffold-only target for the machine-readable Project Site Template Contract. It established a 14-family schema skeleton tree, a root template-contract instance skeleton, and a high-level template-contract scaffold schema. It performed no full schema extraction, introduced no new architecture decisions, and required no changes outside the new package directory (and an optional Phase 1 documentation closeout under `docs/architecture/blueprint/sp-project-control-center/phase-1/`).

The package is traceable to the Phase 0 Step 2 Closeout Report (Phase 1 entry gate: `Ready to Open Phase 1`), the Phase 0 Step 2 Schema Family Taxonomy, and the Standard Project Site Template Contract.

## Files Created

```text
packages/project-site-template/package.json
packages/project-site-template/README.md
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/template-contract.schema.json
packages/project-site-template/schemas/families/template-manifest.schema.json
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/settings.schema.json
packages/project-site-template/schemas/families/permissions.schema.json
packages/project-site-template/schemas/families/site.schema.json
packages/project-site-template/schemas/families/pages.schema.json
packages/project-site-template/schemas/families/libraries.schema.json
packages/project-site-template/schemas/families/lists.schema.json
packages/project-site-template/schemas/families/modules.schema.json
packages/project-site-template/schemas/families/workflows.schema.json
packages/project-site-template/schemas/families/integrations.schema.json
packages/project-site-template/schemas/families/site-health.schema.json
packages/project-site-template/schemas/families/provisioning-validation.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/docs/Phase_1_Step_1_Scaffold_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_1_Scaffold_Closeout.md
```

## Source Inputs

- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` (authoritative)
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/README.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-01/step-1/README.md`

## Family Skeletons Created

All 14 Phase 0 Step 2 planning families are represented:

| Family | Status | Notes |
|---|---|---|
| template-manifest | skeleton | Outermost wrapper; identity and version metadata. |
| enums | skeleton | ProjectType, ProjectStage, ProjectStatus, decision closure, severity, repair tier, module visibility, integration status, forbidden-value sets. |
| settings | skeleton | Site-level configuration; three-form ProcoreCompanyId contract referenced. |
| permissions | skeleton | Role / SharePoint group / permission-level mappings; external users deferred. |
| site | skeleton | Site identity, naming, URL rules, project metadata, archive behavior. |
| pages | skeleton | Site page structure and SPFx webpart placement. |
| libraries | skeleton | Document library declarations, content types, retention. |
| lists | skeleton | SharePoint list declarations, columns, content types, views. |
| modules | skeleton | SPFx webpart and module declarations; HBI Assistant deferred. |
| workflows | skeleton | Decision closure, approvals, hand-offs, stage-gated transitions. |
| integrations | skeleton | Procore (read-only), Sage Intacct (book of record); placeholder Procore link / summary records; write-back deferred. |
| site-health | skeleton | Drift detection, severity, repair tier, audit. |
| provisioning-validation | skeleton | Provisioning-time invariants, pre-flight checks, no-native-SharePoint-admin guards. |
| validation-rules | skeleton | Declarative registry across the 8 enforcement layers; seeded by VR-01 through VR-30. |

Every skeleton declares common traceability properties (`id`, `kind`, `mvp_status`, `sourceContractSection`, `sourceCatalogId`, `sourceBlueprintSection`, `sourceDecisionRef`, `validationRuleRefs`, `ownerCategory`) and requires the four safe universal fields (`id`, `kind`, `mvp_status`, `sourceContractSection`). Each schema's top-level `description` states "skeleton only", "not fully populated", and points to the later Phase 1 step responsible for full population.

## Root Contract Skeleton

`packages/project-site-template/template-contract.json` declares:

- `templateName`, `templateFamily`, `templateVersion: "1.0.0-proposed"`, `phase: "Phase 1 Step 1 scaffold"`,
- `source` pointing to the Standard Project Site Template Contract, the Target Architecture Blueprint, and the Phase 0 Step 2 Closeout Report,
- `status: { readiness: "scaffold-only", fullExtractionComplete: false, containsNewArchitectureDecisions: false }`,
- a `families` map keyed by all 14 family names, each pointing at its skeleton schema with `status: "skeleton"` and a short note.

The companion scaffold schema `schemas/template-contract.schema.json` validates this root shape, requires all 14 family entries, and documents the relative paths to each family skeleton via a `familyReferences` map (`$ref` binding to instance documents arrives in later Phase 1 steps once family schemas are populated).

## What Was Not Extracted

- Enum values (deferred to Phase 1 Step 2).
- Validation rule entries beyond the planning catalog (deferred to Phase 1 Step 2).
- Per-family field consolidation (deferred to Phase 1 Step 3).
- Per-family schema population (deferred to Phase 1 Step 4).
- Schema validation harness, tooling, and TypeScript surface (deferred to Phase 1 Step 5).

## Deferred Phase 1 Work

| Step | Title | Primary Output |
|---|---|---|
| Phase 1 Step 2 | Enum and Validation Rule Extraction | Populated `enums.schema.json` and `validation-rules.schema.json` |
| Phase 1 Step 3 | Object Family Field Consolidation | Consolidated field sets per family from Contract §4A |
| Phase 1 Step 4 | Per-Family Schema Population | Populated remaining 12 family schemas |
| Phase 1 Step 5 | Schema Validation Harness | Validation harness + tooling; introduces TypeScript / build conventions |

## Guardrails Preserved

- No new architecture decisions introduced.
- Direct SPFx-to-Procore calls remain prohibited.
- No Procore secrets present. `ProcoreCompanyId = 5280` recorded as configuration.
- Procore Object Link Records and Procore Curated Summary Records remain placeholder / future-reference only.
- No full Procore canonical model.
- No full Procore mirror.
- Sage Intacct remains the accounting book of record.
- External users, HBI Assistant, and Procore write-back remain deferred from MVP.
- Deprecated enum values (`preconstruction_only`, `warranty_closeout`, `active_construction`-as-Type) appear only in guardrail / forbidden-value context, never as valid enum values.
- `Archived` remains `ProjectStatus` only, never `ProjectStage`.
- `active_construction` remains `ProjectStage` only, never `ProjectType`.

## Validation Performed

- File-presence check: all required scaffold files were created.
- Folder-structure check: scaffold matches the required structure exactly.
- JSON well-formedness: all `.json` files written as valid JSON (single-document structure; no trailing commas).
- Boundary check: no backend, SPFx, provisioning, manifest, test, generated, CI, or root-workspace files were modified. The root `pnpm-workspace.yaml` already covers `packages/*`, so no workspace changes were required.
- Dependency check: `package.json` declares no `dependencies` or `devDependencies`; no scripts that build, lint, test, or publish.
- Secret check: no secrets are present.
- Anti-regression check: deprecated enum values appear only inside guardrail / forbidden-value language in README, scaffold notes, and family descriptions; never as valid enum members.

No build / test / lint / typecheck / packaging / deployment commands were run; they do not apply to a scaffold-only package with no executable code or scripts. The Phase 1 Step 5 harness will introduce schema validation tooling.

## Recommended Next Step

```text
Phase 1 Step 2 — Enum and Validation Rule Extraction
```
