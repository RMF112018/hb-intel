# Phase 1 Step 2 — Enum and Validation Rule Extraction Closeout

## Summary

Phase 1 Step 2 populated the `enums` and `validation-rules` family schemas in `@hbc/project-site-template` and reconciled the canonical `mvp_status` taxonomy on the narrow path. The eight canonical enum sets and the 30 initial validation rules (VR-01 through VR-30) are now machine-readable and traceable to the Standard Project Site Template Contract and the Phase 0 Step 2 Validation Rule Table Plan. No other family schemas were touched. No new architecture decisions were introduced. No full object-family extraction was performed.

## Files Modified

```text
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/schemas/template-contract.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/README.md
```

Files created in this step:

```text
packages/project-site-template/docs/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Closeout.md
```

No other files were modified.

## Enum Extraction Summary

| Enum Set | Allowed | Forbidden | Validation Rule Refs |
|---|---|---|---|
| ProjectType | 5 (`commercial`, `multifamily`, `municipal`, `luxury_residential`, `environmental`) | 3 (`preconstruction_only`, `warranty_closeout`, `active_construction`) | VR-01, VR-05, VR-06, VR-08 |
| ProjectStage | 6 (`lead`, `estimating`, `preconstruction`, `active_construction`, `closeout`, `warranty`) | 1 (`Archived`) | VR-02, VR-04, VR-07, VR-30 |
| ProjectStatus | 4 (`Active`, `On Hold`, `Closed`, `Archived`) | 0 | VR-03, VR-09, VR-29 |
| DecisionClosureStatus | 4 (`Frozen for MVP`, `Runtime Configuration`, `Deferred`, `Proof-Gated`) | 0 | VR-24 |
| SiteHealthSeverity | 5 (`Info`, `Warning`, `Blocking`, `Repair Required`, `Security Risk`) | 0 | VR-21 |
| RepairAutomationTier | 4 (`T1 Auto`, `T2 Approval`, `T3 IT Security`, `T4 Manual Only`) | 0 | VR-22 |
| EnforcementLayer | 8 | 0 | VR-12, VR-13, VR-17, VR-23 |
| ValidationRuleCategory | 13 | 0 | (n/a) |

## Validation Rule Extraction Summary

- **13 rule categories** declared in `ruleCategoryCatalog`: Enum Binding; Conditional Visibility; Stage / Status Behavior; Runtime Configuration; Permission / Ownership; Procore Boundary; System of Record; No Secret; No Native SharePoint Admin; Referential Integrity; Site Health / Drift / Repair; Provisioning Validation; MVP / Deferred Scope.
- **8 enforcement layers** declared in `enforcementLayerCatalog`: Schema; Provisioning; Backend; SPFx; Site Health; Governance; Documentation; Cross-Layer.
- **30 initial rules** declared in `initialRules` (VR-01 through VR-30), each with `ruleId`, `ruleCategory`, `sourceSection`, `appliesTo`, `ruleStatement`, `schemaFamily`, `enforcementLayer`, `mvpTreatment`, `blocksGenerationIfMissing`, and `notes`. Cross-layer rules carry an explicit `participatingLayers` array.

The rule structure preserves the Phase 0 Step 2 distinction between schema-enforceable rules and cross-layer rules. Rules that span runtime behavior (e.g., VR-12 SPFx-must-not-call-Procore-directly) are classified `Cross-Layer` with participating layers, never as Schema-only.

## Status Naming Decision

The Phase 0 Step 2 Schema Family Taxonomy binds `mvp_status` to the Decision Closure Register's canonical four-value enum (`Frozen for MVP`, `Runtime Configuration`, `Deferred`, `Proof-Gated`), per Standard Project Site Template Contract §22 and VR-24.

The Phase 1 Step 1 scaffold introduced temporary shorthand `["mvp", "deferred", "placeholder"]` in all 14 family skeletons. Phase 1 Step 2 took the **narrow reconciliation path** allowed by the prompt:

- Updated only `enums.schema.json`, `validation-rules.schema.json`, and `template-contract.json` to use canonical taxonomy.
- Added `populated` to `template-contract.schema.json`'s `familyEntry.status` enum so the contract instance validates honestly.
- Left the 12 untouched family skeletons with scaffold-local shorthand for now.
- Documented the mapping (`mvp → Frozen for MVP`, `deferred → Deferred`, `placeholder → Proof-Gated` or `Deferred` per family) in the Phase 1 Step 2 notes.

This intentional partial state will be retired when each family is populated in Phase 1 Step 3 / Step 4. No Prompt 02 escalation was required.

## Boundary Validation

| Boundary | Required State | Actual State | Pass / Fail |
|---|---|---|---|
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
| Other 12 family skeletons modified | None | None | Pass |
| Procore canonical-model files created | None | None | Pass |
| Direct-Procore runtime code created | None | None | Pass |

## Anti-Regression Validation

| Check | Required State | Actual State | Pass / Fail |
|---|---|---|---|
| `preconstruction_only` as active enum | Forbidden only | In ProjectType `forbiddenValues` only; VR-06 references | Pass |
| `warranty_closeout` as active enum | Forbidden only | In ProjectType `forbiddenValues` only; VR-06 references | Pass |
| `active_construction` as ProjectType | Forbidden | In ProjectType `forbiddenValues`; VR-05 references | Pass |
| `Archived` as ProjectStage | Forbidden | In ProjectStage `forbiddenValues`; VR-04 references | Pass |
| `ProcoreCompanyId = 5280` as configuration | Configuration, not secret | Recorded as Runtime Configuration in VR-10 | Pass |
| Direct SPFx-to-Procore calls prohibited | Prohibited | VR-12 Cross-Layer with `SPFx + Backend + Documentation` | Pass |
| External users deferred | Deferred | VR-18 `mvpTreatment: Deferred` | Pass |
| HBI Assistant deferred | Deferred | VR-19 `mvpTreatment: Deferred` | Pass |
| Procore write-back deferred | Deferred | VR-20 `mvpTreatment: Deferred` | Pass |
| Procore Object Link / Curated Summary placeholders | Placeholder only | Preserved in template-contract.json `integrations` notes | Pass |
| No full Procore mirror | Preserved | VR-16 enforces allowed-shape lists | Pass |
| Sage Intacct as accounting book of record | Preserved | VR-14 records system-of-record posture | Pass |

## Remaining Risks

- The 12 untouched family skeletons retain `["mvp", "deferred", "placeholder"]` shorthand inconsistent with VR-24's canonical enum. This is a documented temporary state and will be retired as families are populated in Phase 1 Step 3 / Step 4. Until then, schema-validating those 12 skeletons against the canonical Decision Closure taxonomy will reveal expected shorthand mismatches.
- The `validation-rules.schema.json` rules array is append-only. Phase 1 Step 3 / Step 4 may surface additional rules; care is required not to reclassify cross-layer behaviors as Schema-only when extending.
- A formal schema-validation harness (Phase 1 Step 5) does not yet exist; today's verification is limited to JSON well-formedness and visual / structural review.

## Phase 1 Step 3 Readiness Decision

`Ready for Phase 1 Step 3`.

All Phase 1 Step 2 deliverables are complete and bounded. The canonical enum sets are now machine-readable, the validation rule registry is seeded, and the narrow `mvp_status` reconciliation has been applied with explicit documentation. Per-family field consolidation can proceed.

## Recommended Next Prompt

```text
Phase 1 Step 3 — Object Family Field Consolidation
```

## Commit Summary

```text
feat(project-site-template): extract enums and validation rules
```

## Commit Description

```text
Phase 1 Step 2 — populate the enums and validation-rules family schemas of @hbc/project-site-template.

- enums.schema.json: 8 canonical enum sets (ProjectType, ProjectStage, ProjectStatus, DecisionClosureStatus, SiteHealthSeverity, RepairAutomationTier, EnforcementLayer, ValidationRuleCategory) with allowed and forbidden values traceable to Contract §3.2, §4B.0, §4B.1, §19, §19A, §22.
- validation-rules.schema.json: 13 rule categories, 8 enforcement layers, and the 30 initial rules VR-01 through VR-30 extracted verbatim from the Phase 0 Step 2 Validation Rule Table Plan, with cross-layer rules carrying participating-layer lists.
- template-contract.json: enums and validation-rules family entries marked status: populated; phase advanced to "Phase 1 Step 2 enum and validation-rule extraction".
- template-contract.schema.json: narrow status enum extension to include "populated".
- README.md: schema-family table updated and Decision Closure Status / mvp_status section added.

Narrow mvp_status reconciliation: only the two in-scope family schemas now bind to the canonical Decision Closure four-value enum; the 12 untouched family skeletons retain temporary scaffold shorthand to be reconciled when populated in later Phase 1 steps.

No backend, SPFx, provisioning, manifest, test, generated, CI, or root-workspace changes. No package dependencies or scripts added. No new architecture decisions.
```
