# Project Site Template Contract

`@hbc/project-site-template`

## Purpose

This package is the future machine-readable contract target for the SP Project Control Center (PCC). It carries the declarative shape of the HB Standard Project Site Template — identity, families, schema-family entry points, and traceability — in JSON Schema and JSON form, so downstream provisioning, SPFx, backend, and Site Health layers can consume one source of structured truth.

The Standard Project Site Template Contract markdown document remains the source of truth. This package is a derivative artifact whose contents must always trace back to the markdown contract and the Phase 0 Step 2 planning taxonomy.

## Phase 1 Step 1 Scope

Phase 1 Step 1 — Machine-Readable Template Contract Scaffold and Schema Family Skeleton.

This step creates only:

- a root template-contract instance skeleton,
- a high-level template-contract schema skeleton,
- 14 family schema skeletons reflecting the Phase 0 Step 2 Schema Family Taxonomy,
- this README and the Phase 1 Step 1 scaffold notes.

It performs no full schema extraction.

## Source of Truth

| Source | Path |
|---|---|
| Standard Project Site Template Contract (authoritative) | `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` |
| HB Project Control Center Target Architecture Blueprint | `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` |
| Phase 0 Step 2 Closeout Report (Phase 1 entry gate) | `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md` |
| Phase 0 Step 2 Schema Family Taxonomy | `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md` |
| Phase 0 Step 2 Validation Rule Table Plan | `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md` |

When the markdown contract and this package disagree, the markdown contract wins until the disagreement is reconciled in a later Phase 1 step.

## Current Status

- Readiness: `scaffold-only`
- Full extraction complete: `false`
- Contains new architecture decisions: `false`
- Phase 0 entry gate: `Ready to Open Phase 1` (per Phase 0 Step 2 Closeout Report)

## Folder Structure

```text
packages/project-site-template/
  README.md
  package.json
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

## Schema Families

The 14 families come directly from the Phase 0 Step 2 Schema Family Taxonomy. Each is a planning family, not a new architecture decision.

| Family | Skeleton File | Phase 1 Status |
|---|---|---|
| template-manifest | `schemas/families/template-manifest.schema.json` | skeleton |
| enums | `schemas/families/enums.schema.json` | populated (Phase 1 Step 2) |
| settings | `schemas/families/settings.schema.json` | skeleton |
| permissions | `schemas/families/permissions.schema.json` | skeleton |
| site | `schemas/families/site.schema.json` | skeleton |
| pages | `schemas/families/pages.schema.json` | skeleton |
| libraries | `schemas/families/libraries.schema.json` | skeleton |
| lists | `schemas/families/lists.schema.json` | skeleton |
| modules | `schemas/families/modules.schema.json` | skeleton |
| workflows | `schemas/families/workflows.schema.json` | skeleton |
| integrations | `schemas/families/integrations.schema.json` | skeleton |
| site-health | `schemas/families/site-health.schema.json` | skeleton |
| provisioning-validation | `schemas/families/provisioning-validation.schema.json` | skeleton |
| validation-rules | `schemas/families/validation-rules.schema.json` | populated (Phase 1 Step 2) |

Every skeleton declares the common traceability fields (`id`, `kind`, `mvp_status`, `sourceContractSection`, `sourceCatalogId`, `sourceBlueprintSection`, `sourceDecisionRef`, `validationRuleRefs`, `ownerCategory`) and requires the four safe universal fields (`id`, `kind`, `mvp_status`, `sourceContractSection`).

### Phase 1 Step 3 Status

Phase 1 Step 3 — Object Family Field Consolidation — produced field maps for the 12 remaining families under `fields/`. The 12 family schema skeletons under `schemas/families/` remain skeleton-only; schema population happens in Phase 1 Step 4. See [`fields/README.md`](./fields/README.md) for the field-map index.

### Decision Closure Status / `mvp_status`

The canonical four-value `mvp_status` enum is bound to the Decision Closure Register (Standard Project Site Template Contract §22; VR-24):

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

`enums.schema.json` and `validation-rules.schema.json` already use this canonical enum directly (Phase 1 Step 2). The 12 untouched family skeletons still carry temporary scaffold-local shorthand (`mvp`, `deferred`, `placeholder`) introduced in Phase 1 Step 1; these will be reconciled to the canonical four-value enum when each family is populated in Phase 1 Step 3 / Step 4.

## What This Scaffold Does

- Establishes the package directory and folder structure.
- Declares 14 family schema skeletons with traceability fields.
- Provides a high-level template-contract schema skeleton that validates the scaffold's overall shape.
- Provides a root template-contract instance skeleton that points at each family skeleton.
- Records traceability back to the Phase 0 Step 2 closeout and the Standard Project Site Template Contract.

## What This Scaffold Does Not Do

- It does not perform full schema extraction of any family.
- It does not enumerate enum values, validation rules, list columns, library structures, page layouts, workflow steps, or integration endpoints.
- It does not implement provisioning, Graph, SharePoint, SPFx, or Procore code.
- It does not declare a Procore canonical model.
- It does not store any secrets.
- It does not declare runtime dependencies, build scripts, or executable code.
- It does not modify any other package, manifest, or workspace configuration.

## Guardrails

- No new architecture decisions are introduced.
- No direct SPFx-to-Procore calls are introduced or implied.
- No Procore secrets exist in this package. `ProcoreCompanyId = 5280` is configuration, not a secret.
- Procore Object Link Records and Procore Curated Summary Records remain placeholder / future-reference only — they will not become full Procore canonical models in Phase 1.
- No full Procore mirror exists; the no-full-Procore-mirror constraint (Standard Project Site Template Contract P-10) is preserved.
- Sage Intacct remains the accounting book of record. Procore remains operational / project-management financial state only.
- External users remain deferred from MVP.
- HBI Assistant remains deferred from MVP.
- Procore write-back remains deferred from MVP.
- Deprecated enum values are forbidden, never valid:
  - `preconstruction_only`
  - `warranty_closeout`
  - `active_construction` as ProjectType
- `Archived` is `ProjectStatus` only, never `ProjectStage`.
- `active_construction` is `ProjectStage` only, never `ProjectType`.

## Phase 1 Next Steps

| Step | Title | Output |
|---|---|---|
| Phase 1 Step 2 | Enum and Validation Rule Extraction | Populates `enums.schema.json` and `validation-rules.schema.json` |
| Phase 1 Step 3 | Object Family Field Consolidation | Consolidates Contract §4A object fields into per-family field sets |
| Phase 1 Step 4 | Per-Family Schema Population | Populates the remaining 12 family schemas |
| Phase 1 Step 5 | Schema Validation Harness | Adds the validation harness; introduces TypeScript / tooling once package conventions allow |

The recommended next prompt is `Phase 1 Step 2 — Enum and Validation Rule Extraction`.

## Validation Notes

This step is markdown- and JSON-only. No build, typecheck, lint, test, packaging, or deployment commands were run; none apply to a scaffold-only package whose `package.json` declares no scripts and no dependencies. End-to-end verification was limited to confirming file presence, JSON well-formedness, and absence of changes outside `packages/project-site-template/` and `docs/architecture/blueprint/sp-project-control-center/phase-1/`.

A formal schema-validation harness arrives in Phase 1 Step 5.
