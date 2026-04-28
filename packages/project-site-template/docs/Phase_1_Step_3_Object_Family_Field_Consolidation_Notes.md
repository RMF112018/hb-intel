# Phase 1 Step 3 — Object Family Field Consolidation Notes

## Summary

Phase 1 Step 3 produced field-consolidation artifacts for the 12 remaining schema families of `@hbc/project-site-template`. Each family now has a structured `.fields.json` map declaring field name, type, required/optional, MVP treatment (canonical Decision Closure status), source contract section, source catalog ID, source decision-register reference, validation rule references, description, and notes. All 18 Contract §4A Object Catalog rows are dispositioned. A family dependency map is recorded. The 12 family schema skeletons under `schemas/families/` remain skeleton-only; the `enums` and `validation-rules` family schemas (populated in Phase 1 Step 2) were not modified. The `template-contract.json` instance was advanced to phase `"Phase 1 Step 3 object family field consolidation"` and points at the new field maps; `fullExtractionComplete` remains `false` and none of the 12 families are marked populated.

## Files Modified

```text
packages/project-site-template/template-contract.json
packages/project-site-template/README.md
```

## Files Created

```text
packages/project-site-template/fields/README.md
packages/project-site-template/fields/common-fields.json
packages/project-site-template/fields/object-catalog-field-disposition.json
packages/project-site-template/fields/family-field-dependencies.json
packages/project-site-template/fields/families/template-manifest.fields.json
packages/project-site-template/fields/families/settings.fields.json
packages/project-site-template/fields/families/permissions.fields.json
packages/project-site-template/fields/families/site.fields.json
packages/project-site-template/fields/families/pages.fields.json
packages/project-site-template/fields/families/libraries.fields.json
packages/project-site-template/fields/families/lists.fields.json
packages/project-site-template/fields/families/modules.fields.json
packages/project-site-template/fields/families/workflows.fields.json
packages/project-site-template/fields/families/integrations.fields.json
packages/project-site-template/fields/families/site-health.fields.json
packages/project-site-template/fields/families/provisioning-validation.fields.json
packages/project-site-template/docs/Phase_1_Step_3_Object_Family_Field_Consolidation_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_3_Object_Family_Field_Consolidation_Closeout.md
```

The exact final file count is captured in the closeout via `git status`.

## Source Inputs

- `Standard_Project_Site_Template_Contract.md` (authoritative for fields)
- `HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `Project_Control_Center_Development_Roadmap.md`
- All Phase 0 Step 1 deliverables
- All Phase 0 Step 2 deliverables (Schema Extraction Plan, Object Catalog Disposition, Schema Family Taxonomy, Validation Rule Table Plan, Closeout Report)
- `Phase_1_Step_1_Scaffold_Closeout.md`
- `Phase_1_Step_2_Enum_Validation_Rule_Extraction_Closeout.md`
- `packages/project-site-template/schemas/families/enums.schema.json`
- `packages/project-site-template/schemas/families/validation-rules.schema.json`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-01/step-3/README.md`

## Field Families Consolidated

| Family | Approx Field Count | Anchors | VR Refs |
|---|---|---|---|
| template-manifest | 19 | §4 | VR-01, VR-02, VR-03, VR-13, VR-24 |
| site | 49 | §3.2, §5, §5.6, §6.1, §6.2 | VR-01, VR-02, VR-03, VR-04, VR-05, VR-06, VR-08, VR-09, VR-11, VR-14, VR-23, VR-27, VR-29 |
| settings | 25 | §10, §10.6, §11.6, §15.2, §18.1.5 | VR-10, VR-11, VR-13, VR-17, VR-21, VR-28 |
| permissions | 17 | §8, §11.2A, §11.3, §11.5, §11.6, §11.7, §12 | VR-11, VR-15, VR-17, VR-18, VR-24, VR-27, VR-30 |
| pages | 7 | §13 | VR-07, VR-24, VR-26 |
| libraries | 16 | §3.2, §4B.2, §5.6, §14.1, §14.2, §14.5, §14.5A | VR-08, VR-09, VR-17, VR-29 |
| lists | 41 | §3.2, §4B.2, §15, §15.1A, §15.1D, §15.2, §16 | VR-08, VR-17, VR-24, VR-25, VR-26, VR-29 |
| modules | 15 | §4B.2, §8.1, §8.2, §8.3, §13, §14.1, §15.2, §17, §18 | VR-07, VR-19, VR-24, VR-26, VR-30 |
| workflows | 21 | §17.1–§17.8, §4B.2 | VR-08, VR-09, VR-24, VR-26 |
| integrations | 41 | §10.6, §11.7, §15.13.1–§15.13.6, §18.0, §18.1.5, §18.1.7, §18.1.12, §18.1.13, §22.2, Roadmap §8 | VR-10, VR-11, VR-12, VR-13, VR-14, VR-15, VR-16, VR-17, VR-20, VR-22, VR-28 |
| site-health | 18 | §15.2, §19, §19.1, §19.3, §19A | VR-13, VR-17, VR-21, VR-22 |
| provisioning-validation | 22 | §6.1, §19A, §20, §20.1, §20.2 | VR-17, VR-23 |

Total in-scope fields consolidated across the 12 families: ~291.

## Common Field Map

`fields/common-fields.json` declares 10 common fields: `id`, `kind`, `mvp_status`, `sourceContractSection`, `sourceCatalogId`, `sourceBlueprintSection`, `sourceDecisionRef`, `validationRuleRefs`, `ownerCategory`, `notes`. The `mvp_status.canonicalStatus` references the canonical four-value Decision Closure enum. No scaffold shorthand is preserved as canonical in this map.

## Object Catalog Field Disposition

All 18 Contract §4A rows are dispositioned in `fields/object-catalog-field-disposition.json`:

- 13 rows → `consolidated-for-step-4` (OC-01 Site, OC-02 Pages, OC-03 Libraries, OC-04 Lists, OC-05 Fields, OC-06 Views, OC-07 Groups, OC-08 Templates, OC-09 Configuration, OC-10 Modules, OC-11 Integrations, OC-12 Health, OC-13 Workflows, OC-16 Procore Sync Health)
- 2 rows → `runtime-configuration-reference` (OC-14 Procore Project Mapping, OC-15 Procore Subject Area Registry)
- 2 rows → `placeholder-only` (OC-17 Procore Object Link Records, OC-18 Procore Curated Summary Records) — both `mvpTreatment: Deferred`, both preserve the no-full-Procore-mirror constraint (Contract P-10).

(OC-16 lands as `consolidated-for-step-4` rather than runtime-config because Sync Health is a populated record stream once Procore sync is enabled, not a per-site configuration value.)

## Family Dependency Map

`fields/family-field-dependencies.json` records the dependencies for Step 4 schema population. Recommended Step 4 population order: `template-manifest → site → settings → permissions → libraries → lists → modules → pages → workflows → integrations → provisioning-validation → site-health`. `site-health` is last because its checks span every other family.

## Status Shorthand Reconciliation Plan

The 12 family schema skeletons under `schemas/families/` still carry temporary `["mvp", "deferred", "placeholder"]` shorthand in their `mvp_status` enum. **All field-consolidation artifacts created in this step use the canonical Decision Closure four-value enum** (`Frozen for MVP`, `Runtime Configuration`, `Deferred`, `Proof-Gated`). The skeleton shorthand will be retired when each family schema is populated in Phase 1 Step 4 — the field maps act as the canonical source for the Step 4 substitution.

The mapping (informational):

```text
mvp          → Frozen for MVP
deferred     → Deferred
placeholder  → Proof-Gated   (or Deferred, per family)
```

## What Was Not Populated

- Any of the 12 remaining family schemas (deferred to Phase 1 Step 4).
- `enums.schema.json` (already populated in Step 2).
- `validation-rules.schema.json` (already populated in Step 2).
- `template-contract.schema.json` (no reference issue arose; left untouched).
- Backend, SPFx, provisioning, manifest, test, generated, CI, root-workspace, dependency, or script changes.

## Guardrails Preserved

- No new architecture decisions.
- Procore Object Link / Curated Summary records remain placeholder / future-reference only with `mvpStatus: Deferred`. No full Procore canonical model. No full Procore mirror (VR-16; Contract P-10).
- No direct SPFx-to-Procore calls implied (VR-12).
- No Procore secrets in any artifact (VR-13). `ProcoreCompanyId = 5280` recorded as Runtime Configuration in three forms.
- Sage Intacct = accounting book of record (VR-14). Procore = operational state.
- External users, HBI Assistant, Procore write-back remain `Deferred` (VR-18, VR-19, VR-20).
- Deprecated tokens (`preconstruction_only`, `warranty_closeout`, `active_construction`-as-Type, `Archived`-as-Stage) appear only in forbidden / anti-regression contexts.
- Validation rules distinguish Schema, Provisioning, Backend, SPFx, Site Health, Governance, Documentation, and Cross-Layer enforcement.

## Validation Performed

- JSON well-formedness on every modified / created `.json` file (16 total: 1 common + 12 family + 1 disposition + 1 dependencies + template-contract.json).
- Object catalog row count: exactly 18.
- Rows 17 and 18 carry `extractionTreatment: "placeholder-only"` and `mvpTreatment: "Deferred"`.
- All 12 required family `.fields.json` files present.
- The 12 family schema skeletons under `schemas/families/` were NOT modified.
- `enums.schema.json` and `validation-rules.schema.json` were NOT modified.
- `template-contract.json` does not mark any of the 12 families as populated; `fullExtractionComplete` remains `false`.
- All `mvp_status` and `mvpTreatment` values in the field-consolidation artifacts use the canonical Decision Closure four-value enum.
- One `unknown` field type (`integrations.outlook_CalendarMapping`) is documented in family notes as resolvable in Step 4 without an architecture decision.
- Boundary check: no backend, SPFx, provisioning, manifest, test, generated, CI, or root-workspace files changed.
- Dependency check: `package.json` declares no `dependencies`, `devDependencies`, or scripts.
- Secret check: no secrets present.

No build / test / lint / typecheck / packaging / deployment commands were run; they remain out of scope for this step.

## Recommended Next Step

```text
Phase 1 Step 4 — Per-Family Schema Population
```
