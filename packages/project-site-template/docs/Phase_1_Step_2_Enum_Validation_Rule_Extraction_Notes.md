# Phase 1 Step 2 — Enum and Validation Rule Extraction Notes

## Summary

Phase 1 Step 2 populated the `enums` and `validation-rules` family schemas in `@hbc/project-site-template`. The `enums` schema now defines eight canonical enum sets directly traceable to the Standard Project Site Template Contract and the Phase 0 Step 2 Validation Rule Table Plan. The `validation-rules` schema now defines the rule-record shape, the 13 rule categories, the 8 enforcement layers, and the 30 initial rules (VR-01 through VR-30) extracted verbatim from the Phase 0 Step 2 plan. The root template-contract instance and the high-level template-contract scaffold schema were updated to reflect the new `populated` status. No other family schemas were modified. No backend, SPFx, provisioning, manifest, test, generated, CI, or root-workspace files were touched. No dependencies were added.

## Files Modified

```text
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/schemas/template-contract.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/README.md
```

## Files Created

```text
packages/project-site-template/docs/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Closeout.md
```

## Source Inputs

- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` (authoritative)
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_1_Scaffold_Closeout.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-01/step-2/README.md`

## Enums Extracted

Eight canonical enum sets are now defined under `canonicalEnumSets` in `enums.schema.json`:

| Enum Set | Allowed Values | Forbidden Values | Source | Validation Rule Refs |
|---|---|---|---|---|
| ProjectType | `commercial`, `multifamily`, `municipal`, `luxury_residential`, `environmental` | `preconstruction_only`, `warranty_closeout`, `active_construction` | Contract §4B.1; D-12 closure | VR-01, VR-05, VR-06, VR-08 |
| ProjectStage | `lead`, `estimating`, `preconstruction`, `active_construction`, `closeout`, `warranty` | `Archived` | Contract §4B.0 | VR-02, VR-04, VR-07, VR-30 |
| ProjectStatus | `Active`, `On Hold`, `Closed`, `Archived` | (none) | Contract §3.2 | VR-03, VR-09, VR-29 |
| DecisionClosureStatus | `Frozen for MVP`, `Runtime Configuration`, `Deferred`, `Proof-Gated` | (none) | Contract §22; Phase 0 Step 2 Schema Family Taxonomy | VR-24 |
| SiteHealthSeverity | `Info`, `Warning`, `Blocking`, `Repair Required`, `Security Risk` | (none) | Contract §19 | VR-21 |
| RepairAutomationTier | `T1 Auto`, `T2 Approval`, `T3 IT Security`, `T4 Manual Only` | (none) | Contract §19A | VR-22 |
| EnforcementLayer | `Schema`, `Provisioning`, `Backend`, `SPFx`, `Site Health`, `Governance`, `Documentation`, `Cross-Layer` | (none) | Phase 0 Step 2 Validation Rule Table Plan | VR-12, VR-13, VR-17, VR-23 |
| ValidationRuleCategory | 13 values (see Validation Rules Extracted) | (none) | Phase 0 Step 2 Validation Rule Table Plan | (n/a) |

Anti-regression tokens (`preconstruction_only`, `warranty_closeout`, `active_construction`-as-Type, `Archived`-as-Stage) appear only inside `forbiddenValues` arrays — never as valid enum members.

## Validation Rules Extracted

`validation-rules.schema.json` now contains:

- the 13 `ruleCategoryCatalog` entries: Enum Binding; Conditional Visibility; Stage / Status Behavior; Runtime Configuration; Permission / Ownership; Procore Boundary; System of Record; No Secret; No Native SharePoint Admin; Referential Integrity; Site Health / Drift / Repair; Provisioning Validation; MVP / Deferred Scope.
- the 8 `enforcementLayerCatalog` entries: Schema; Provisioning; Backend; SPFx; Site Health; Governance; Documentation; Cross-Layer.
- the 30 `initialRules` records VR-01 through VR-30, extracted verbatim from the Phase 0 Step 2 Validation Rule Table Plan.

Cross-layer rules (VR-07, VR-09, VR-10, VR-11, VR-12, VR-13, VR-14, VR-15, VR-16, VR-17, VR-20, VR-23, VR-27, VR-28, VR-29, VR-30) carry an explicit `participatingLayers` list. JSON Schema alone does not enforce runtime behavior for these rules; the rule's `notes` field records the runtime enforcement responsibility.

No rules beyond VR-30 were added in this step. The `initialRules` array is append-only as later Phase 1 steps surface additional bindings.

## Status Naming Reconciliation

The Phase 0 Step 2 Schema Family Taxonomy explicitly binds `mvp_status` to the Decision Closure Register's canonical four-value enum (Standard Project Site Template Contract §22; VR-24):

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

The Phase 1 Step 1 scaffold introduced temporary shorthand `["mvp", "deferred", "placeholder"]` in all 14 family skeletons. Phase 1 Step 2 reconciled this on the **narrow path** allowed by the prompt: only `enums.schema.json`, `validation-rules.schema.json`, and `template-contract.json` were updated. The 12 untouched family skeletons retain the scaffold-local shorthand for now.

Mapping (informational):

```text
mvp          → Frozen for MVP
deferred     → Deferred
placeholder  → Proof-Gated   (or Deferred, per family)
```

Final binding to the canonical enum will be performed when each family is populated in Phase 1 Step 3 / Step 4. Because this leaves the 12 skeleton schemas using shorthand inconsistent with VR-24, this is recorded as a remaining risk to be retired as families are populated.

A narrow correction was also applied to `schemas/template-contract.schema.json`: the `familyEntry.status` enum was extended with `populated` so the high-level scaffold schema honestly reflects the new state recorded in `template-contract.json`.

## Cross-Layer Enforcement Notes

The `validation-rules.schema.json` `enforcementLayerCatalog` records that:

> JSON Schema alone cannot enforce a runtime call boundary. Cross-layer rules participate across multiple layers; participating layers are listed per-rule.

Concrete examples preserved verbatim from the Phase 0 plan:

- **VR-12 (Procore Boundary)** — "SPFx must not call the Procore API directly." Enforcement: `Cross-Layer` with participating layers `SPFx + Backend + Documentation`. Schema does not authorize runtime calls; SPFx code review, backend routing, and the no-direct-Procore governance rule are the actual enforcement mechanisms.
- **VR-13 (No Secret)** — Spans Schema (omits fields), SPFx, Backend, Governance, and Documentation. Schema enforces by structure; secret storage is backend / key vault.
- **VR-17 (No Native SharePoint Admin)** — Schema declares posture; SPFx UI directs users away from native screens; backend audits; governance reviews enforce no-bypass.

## What Was Not Extracted

- Per-family field consolidation (deferred to Phase 1 Step 3).
- Per-family schema population for the 12 untouched family skeletons (deferred to Phase 1 Step 4).
- Schema validation harness, tooling, and TypeScript surface (deferred to Phase 1 Step 5).
- Reconciliation of `mvp_status` shorthand on the 12 untouched family skeletons (rolled into the per-family extraction of Phase 1 Step 3 / Step 4).
- Procore canonical model (out of Phase 1 scope; rows 17 and 18 remain placeholder / future-reference only).
- Object Catalog rows beyond the rule-bound enum sets (deferred to later Phase 1 steps).

## Guardrails Preserved

- No new architecture decisions introduced.
- No full schema extraction beyond `enums` and `validation-rules`.
- No direct SPFx-to-Procore calls implied or enabled (VR-12 is `Cross-Layer`).
- No Procore secrets present (VR-13).
- `ProcoreCompanyId = 5280` recorded as Runtime Configuration (VR-10), not a secret.
- Procore Object Link Records and Procore Curated Summary Records remain placeholder / future-reference only.
- No full Procore canonical model. No full Procore mirror (VR-16).
- Sage Intacct remains accounting book of record (VR-14).
- External users, HBI Assistant, and Procore write-back remain `Deferred` (VR-18, VR-19, VR-20).
- Deprecated tokens (`preconstruction_only`, `warranty_closeout`, `active_construction`-as-Type) appear only in `forbiddenValues` arrays and rule notes — never as valid enum members.
- `Archived` remains `ProjectStatus` only, never `ProjectStage` (VR-04).
- `active_construction` remains `ProjectStage` only, never `ProjectType` (VR-05).
- Validation rules distinguish Schema, Provisioning, Backend, SPFx, Site Health, Governance, Documentation, and Cross-Layer enforcement.

## Validation Performed

- JSON well-formedness: all five JSON files (`enums.schema.json`, `validation-rules.schema.json`, `template-contract.schema.json`, `template-contract.json`, `package.json`) parse cleanly with `JSON.parse`.
- Enum-value verification: ProjectType, ProjectStage, ProjectStatus, DecisionClosureStatus, SiteHealthSeverity, RepairAutomationTier, EnforcementLayer, and ValidationRuleCategory values match the Standard Project Site Template Contract and Phase 0 Step 2 plan verbatim.
- VR coverage: VR-01 through VR-30 are all present and traceable to their Contract section references.
- Cross-layer classification: cross-layer rules carry `enforcementLayer: "Cross-Layer"` and a `participatingLayers` array. No cross-layer rule is classified as Schema-only.
- Boundary check: `git status` confirms only the listed files changed; no backend, SPFx, provisioning, manifest, test, generated, CI, or root-workspace files were touched.
- Dependency check: `package.json` declares no `dependencies`, `devDependencies`, or scripts.
- Secret check: no secrets are present.
- Anti-regression check: deprecated tokens appear only inside `forbiddenValues` arrays and rule statements.

No build / test / lint / typecheck / packaging / deployment commands were run; they remain out of scope for this step.

## Recommended Next Step

```text
Phase 1 Step 3 — Object Family Field Consolidation
```
