# Project Site Template Field Consolidation

`@hbc/project-site-template` — `fields/` artifact tree

## Purpose

Phase 1 Step 3 produces structured field-consolidation artifacts that translate the Standard Project Site Template Contract and the Phase 0 / Phase 1 planning deliverables into machine-readable field maps. These maps tell Phase 1 Step 4 which fields belong to each schema family, how each traces back to the contract, which validation rules bind, and which fields are required, optional, deferred, proof-gated, or runtime-configuration.

The `enums` and `validation-rules` family schemas were already populated in Phase 1 Step 2; the maps in this directory cover the 12 remaining families.

## Phase 1 Step 3 Scope

This step is field-consolidation only. It does not populate the 12 remaining family schema skeletons. It does not modify `enums.schema.json` or `validation-rules.schema.json`. It does not implement provisioning, backend, SPFx, Procore, or any executable code.

## Source of Truth

| Source | Path |
|---|---|
| Standard Project Site Template Contract (authoritative) | `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` |
| HB Project Control Center Target Architecture Blueprint | `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` |
| Phase 0 Step 2 Schema Family Taxonomy | `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md` |
| Phase 0 Step 2 Object Catalog Disposition | `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md` |
| Phase 0 Step 2 Validation Rule Table Plan | `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md` |
| Phase 1 Step 2 enums | `packages/project-site-template/schemas/families/enums.schema.json` |
| Phase 1 Step 2 validation-rules | `packages/project-site-template/schemas/families/validation-rules.schema.json` |

## Field Map Files

```text
fields/
  README.md
  common-fields.json
  object-catalog-field-disposition.json
  family-field-dependencies.json
  families/
    template-manifest.fields.json
    settings.fields.json
    permissions.fields.json
    site.fields.json
    pages.fields.json
    libraries.fields.json
    lists.fields.json
    modules.fields.json
    workflows.fields.json
    integrations.fields.json
    site-health.fields.json
    provisioning-validation.fields.json
```

## Common Fields

`common-fields.json` defines the cross-family fields: `id`, `kind`, `mvp_status`, `sourceContractSection`, `sourceCatalogId`, `sourceBlueprintSection`, `sourceDecisionRef`, `validationRuleRefs`, `ownerCategory`, `notes`. The `mvp_status` field is bound to the canonical Decision Closure status enum:

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

Scaffold-local shorthand introduced in Phase 1 Step 1 (`mvp` / `deferred` / `placeholder`) is **not** preserved as canonical in any field-consolidation artifact.

## Family Field Maps

| Family | File | Status |
|---|---|---|
| template-manifest | `families/template-manifest.fields.json` | consolidated |
| site | `families/site.fields.json` | consolidated |
| settings | `families/settings.fields.json` | consolidated |
| permissions | `families/permissions.fields.json` | consolidated |
| pages | `families/pages.fields.json` | consolidated |
| libraries | `families/libraries.fields.json` | consolidated |
| lists | `families/lists.fields.json` | consolidated |
| modules | `families/modules.fields.json` | consolidated |
| workflows | `families/workflows.fields.json` | consolidated |
| integrations | `families/integrations.fields.json` | consolidated |
| site-health | `families/site-health.fields.json` | consolidated |
| provisioning-validation | `families/provisioning-validation.fields.json` | consolidated |

The `enums` and `validation-rules` families are already populated by Phase 1 Step 2 and have no field map in this directory.

## Object Catalog Field Disposition

`object-catalog-field-disposition.json` consolidates all 18 Contract §4A Object Catalog rows and maps each row to its schema family, field map file, extraction treatment, MVP treatment, validation rule refs, and Step 4 readiness. Rows 17 (Procore Object Link Records) and 18 (Procore Curated Summary Records) are dispositioned `placeholder-only` with `mvpTreatment: Deferred` and remain placeholder / future-reference only — they do not become full Procore canonical models in Phase 1.

## Family Dependencies

`family-field-dependencies.json` records which family field maps depend on which other families to populate cleanly in Phase 1 Step 4. The recommended Step 4 population order is: `template-manifest → site → settings → permissions → libraries → lists → modules → pages → workflows → integrations → provisioning-validation → site-health`. `site-health` is last because it depends on every other family.

## What This Enables

- Phase 1 Step 4 can populate the 12 remaining family schemas using the field maps as input without inventing fields.
- Each field carries explicit Contract section traceability and the validation rules that bind to it.
- The canonical Decision Closure status taxonomy is the single mvp_status vocabulary used across maps.

## What This Does Not Do

- It does not populate any of the 12 remaining family schema skeletons.
- It does not modify `enums.schema.json` or `validation-rules.schema.json`.
- It does not implement provisioning, backend, SPFx, Procore, or any executable code.
- It does not create or extend any backend / SPFx / provisioning / manifest / test / generated / CI / root-workspace files.
- It does not declare runtime dependency behavior between families; the dependencies file is for field consolidation only.

## Guardrails

- No new architecture decisions.
- Procore Object Link / Curated Summary records remain placeholder / future-reference only (rows 17 + 18, `mvpStatus: Deferred`).
- No full Procore canonical model. No full Procore mirror (VR-16; Contract P-10).
- No direct SPFx-to-Procore calls implied (VR-12).
- No Procore secrets in any artifact (VR-13).
- `ProcoreCompanyId = 5280` recorded as Runtime Configuration (VR-10) in three forms (canonical / surface / business), never as a secret.
- Sage Intacct = accounting book of record (VR-14). Procore = operational state.
- External users, HBI Assistant, and Procore write-back remain `Deferred` (VR-18, VR-19, VR-20).
- Deprecated tokens (`preconstruction_only`, `warranty_closeout`, `active_construction`-as-Type, `Archived`-as-Stage) appear only in forbidden / anti-regression contexts.
- Validation rules distinguish Schema, Provisioning, Backend, SPFx, Site Health, Governance, Documentation, and Cross-Layer enforcement (VR-01 through VR-30).

## Recommended Next Step

```text
Phase 1 Step 4 — Per-Family Schema Population
```
