# Phase 1 Step 3 — Object Family Field Consolidation Closeout

## Summary

Phase 1 Step 3 produced field-consolidation artifacts for the 12 remaining schema families of `@hbc/project-site-template`. Each family now has a structured `.fields.json` map; all 18 Contract §4A Object Catalog rows are dispositioned; a family dependency map is recorded; and the canonical Decision Closure status taxonomy is the single `mvp_status` vocabulary used in the new artifacts. The 12 family schema skeletons under `schemas/families/` remain skeleton-only. `enums.schema.json` and `validation-rules.schema.json` (populated in Phase 1 Step 2) were not modified. No new architecture decisions were introduced. Phase 1 Step 4 — Per-Family Schema Population — is ready to proceed.

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

Final file count taken from `git status` at commit time: **18 new files** under the scope above, plus 2 modifications.

## Files Modified

```text
packages/project-site-template/template-contract.json
packages/project-site-template/README.md
```

`template-contract.json` was advanced to phase `"Phase 1 Step 3 object family field consolidation"` and now carries a `fieldMaps` block referencing the new artifacts. `status.fullExtractionComplete` remains `false`. None of the 12 remaining family entries are marked populated.

`README.md` gained a Phase 1 Step 3 status section pointing at `fields/README.md`.

## Field Family Consolidation Summary

| Family | Approx Field Count | VR Refs |
|---|---|---|
| template-manifest | 19 | VR-01, VR-02, VR-03, VR-13, VR-24 |
| site | 49 | VR-01, VR-02, VR-03, VR-04, VR-05, VR-06, VR-08, VR-09, VR-11, VR-14, VR-23, VR-27, VR-29 |
| settings | 25 | VR-10, VR-11, VR-13, VR-17, VR-21, VR-28 |
| permissions | 17 | VR-11, VR-15, VR-17, VR-18, VR-24, VR-27, VR-30 |
| pages | 7 | VR-07, VR-24, VR-26 |
| libraries | 16 | VR-08, VR-09, VR-17, VR-29 |
| lists | 41 | VR-08, VR-17, VR-24, VR-25, VR-26, VR-29 |
| modules | 15 | VR-07, VR-19, VR-24, VR-26, VR-30 |
| workflows | 21 | VR-08, VR-09, VR-24, VR-26 |
| integrations | 41 | VR-10, VR-11, VR-12, VR-13, VR-14, VR-15, VR-16, VR-17, VR-20, VR-22, VR-28 |
| site-health | 18 | VR-13, VR-17, VR-21, VR-22 |
| provisioning-validation | 22 | VR-17, VR-23 |

Total in-scope fields consolidated across the 12 families: ~291.

## Object Catalog Disposition Summary

All 18 Contract §4A rows dispositioned in `fields/object-catalog-field-disposition.json`. Treatment distribution:

- `consolidated-for-step-4`: 14 rows (OC-01, OC-02, OC-03, OC-04, OC-05, OC-06, OC-07, OC-08, OC-09, OC-10, OC-11, OC-12, OC-13, OC-16)
- `runtime-configuration-reference`: 2 rows (OC-14 Procore Project Mapping, OC-15 Procore Subject Area Registry)
- `placeholder-only`: 2 rows (OC-17 Procore Object Link Records, OC-18 Procore Curated Summary Records) — both `mvpTreatment: Deferred`; both preserve Contract P-10 no-full-Procore-mirror.

## Status Naming / mvp_status Summary

All field-consolidation artifacts use the canonical Decision Closure four-value enum:

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

The 12 family schema skeletons under `schemas/families/` retain temporary scaffold shorthand (`mvp`, `deferred`, `placeholder`) introduced in Phase 1 Step 1; this is reconciled when each family schema is populated in Phase 1 Step 4 using the field maps as canonical inputs. Mapping (informational):

```text
mvp          → Frozen for MVP
deferred     → Deferred
placeholder  → Proof-Gated   (or Deferred, per family)
```

## Dependency Summary

`fields/family-field-dependencies.json` records cross-family dependencies for Step 4 schema population. Recommended Step 4 population order:

```text
template-manifest → site → settings → permissions → libraries → lists → modules → pages → workflows → integrations → provisioning-validation → site-health
```

Every family depends on `enums` and `validation-rules`. `site-health` is last because it depends on every other family.

## Boundary Validation

| Boundary | Required State | Actual State | Pass / Fail |
|---|---|---|---|
| 12 family schema skeletons modified | None | None | Pass |
| `enums.schema.json` modified | No | No | Pass |
| `validation-rules.schema.json` modified | No | No | Pass |
| `template-contract.schema.json` modified | No | No | Pass |
| Backend files modified | None | None | Pass |
| SPFx files modified | None | None | Pass |
| Provisioning files modified | None | None | Pass |
| Manifests modified | None | None | Pass |
| Tests modified | None | None | Pass |
| Generated files modified | None | None | Pass |
| CI files modified | None | None | Pass |
| Root workspace files modified | None | None | Pass |
| Package dependencies added | None | None | Pass |
| Package scripts added | None | None | Pass |
| Build / lint / test / typecheck / package / deploy run | None | None | Pass |
| `template-contract.json` marks any of 12 families populated | No | No | Pass |
| `template-contract.json` `fullExtractionComplete` | false | false | Pass |

## Anti-Regression Validation

| Check | Required State | Actual State | Pass / Fail |
|---|---|---|---|
| `preconstruction_only` as active enum | Forbidden only | Confined to forbidden-value contexts | Pass |
| `warranty_closeout` as active enum | Forbidden only | Confined to forbidden-value contexts | Pass |
| `active_construction` as ProjectType | Forbidden | Confined to forbidden-value contexts (ProjectStage only) | Pass |
| `Archived` as ProjectStage | Forbidden | Confined to forbidden-value contexts (ProjectStatus only) | Pass |
| `ProcoreCompanyId = 5280` as configuration | Configuration, not secret | Recorded as Runtime Configuration in three forms (canonical / surface / business) | Pass |
| Direct SPFx-to-Procore calls prohibited | Prohibited | VR-12 cross-layer with `SPFx + Backend + Documentation` | Pass |
| No Procore secrets | Required | No secrets in any field-consolidation artifact | Pass |
| External users deferred | Deferred | VR-18 mvpStatus Deferred preserved | Pass |
| HBI Assistant deferred | Deferred | VR-19 mvpStatus Deferred preserved | Pass |
| Procore write-back deferred | Deferred | VR-20 mvpStatus Deferred preserved | Pass |
| Procore Object Link / Curated Summary placeholders | Placeholder only, Deferred | OC-17 + OC-18 extractionTreatment placeholder-only, mvpStatus Deferred | Pass |
| No full Procore canonical model | Preserved | Rows 17 + 18 explicitly do not become canonical models | Pass |
| No full Procore mirror | Preserved | VR-16 enforces allowed-shape lists | Pass |
| Sage Intacct = accounting book of record | Preserved | VR-14 records system-of-record posture | Pass |

## Remaining Risks

- The 12 family schema skeletons still carry scaffold-local `mvp_status` shorthand. This is documented temporary state to be retired in Phase 1 Step 4 using the field maps as canonical inputs.
- The `lists` and `integrations` families have the largest field counts and the most cross-family dependencies. Step 4 population should follow the recommended order to ensure each family's referenced family is already populated.
- One `unknown` field type appears in `integrations.outlook_CalendarMapping`. The contract describes the concept but not a concrete type; this is resolvable in Step 4 without a new architecture decision.
- Per-list field sets for ~70 SharePoint lists (§15 catalog) are summarized via the `lists` baseline + per-list `requiredFields` / `optionalFields` arrays. Full per-list expansion happens in Step 4.

## Phase 1 Step 4 Readiness Decision

`Ready for Phase 1 Step 4`.

All Phase 1 Step 3 deliverables are complete and bounded. All 18 Object Catalog rows are dispositioned. All 12 family field maps exist. The 12 schema skeletons were not populated. `enums` and `validation-rules` were not modified. Rows 17 and 18 remain placeholder-only. No new architecture decisions were introduced. No Prompt 02 escalation required.

## Recommended Next Prompt

```text
Phase 1 Step 4 — Per-Family Schema Population
```

## Commit Summary

```text
feat(project-site-template): consolidate object family fields
```

## Commit Description

```text
Add Phase 1 Step 3 field-consolidation artifacts for the Project Site Template contract.

Creates common field definitions, 12 family field maps, object catalog field disposition, family dependency mapping, package field-map README, Step 3 notes, and Step 3 closeout documentation. Keeps enums and validation-rules as the only populated schema families and prepares the remaining families for Phase 1 Step 4 schema population.

Field-consolidation only: no remaining family schema population, backend, SPFx, provisioning, Procore integration, CI, generated files, dependencies, scripts, or deployment artifacts.
```
