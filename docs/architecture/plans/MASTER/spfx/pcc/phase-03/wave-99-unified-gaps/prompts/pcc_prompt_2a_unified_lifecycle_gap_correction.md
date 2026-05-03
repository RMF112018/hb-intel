# Prompt 2A — Gap Correction: Complete PCC Unified Lifecycle Contract Depth Before Backend Routes

## Objective

Complete the missing model-contract depth from the original PCC Unified Lifecycle Prompt 01 and Prompt 02 before any backend, SPFx, or UI route work proceeds.

This is a **gap-correction prompt**, not a backend implementation prompt.

The current repo has already implemented:

- Prompt 1 commit `dcd3319400104df8bf48b77251beea281bacdea4`
  - `packages/models/src/pcc/UnifiedLifecycle.ts`
  - `packages/models/src/pcc/fixtures/unifiedLifecycle.ts`
  - lifecycle/memory/lens/traceability/warranty/cross-project/search foundational contracts and fixtures

- Prompt 2 commit `8e4c9db54e9111f1c704f64c40af0f37b2d6dfaf`
  - `packages/models/src/pcc/UnifiedLifecycleReadModels.ts`
  - `packages/models/src/pcc/fixtures/unifiedLifecycleReadModels.ts`
  - `PccReadModelResponseMap` entries and envelope fixtures for:
    - `unified-lifecycle`
    - `project-memory`
    - `project-lenses`
    - `project-traceability`
    - `warranty-trace`
    - `cross-project-knowledge`
    - `unified-search`

Those commits are useful and should be preserved. Do **not** replace or duplicate their work. Instead, extend/refine the existing model layer so it fully satisfies the original Prompt 01 and Prompt 02 contract requirements.

## Hard Scope

Allowed:

- `packages/models/src/pcc/**`
- `packages/models/src/pcc/fixtures/**`
- `packages/models/src/pcc/*.test.ts`
- model export seams only:
  - `packages/models/src/pcc/index.ts`
  - `packages/models/src/pcc/fixtures/index.ts`
  - `packages/models/src/index.ts` only if required by existing export convention

Not allowed:

- backend routes
- backend provider methods
- Azure Function runtime work
- SPFx clients
- SPFx UI/surfaces
- docs broad formatting
- package/dependency changes
- lockfile changes
- Graph/Procore/Sage/CRM/SharePoint integrations
- tenant mutation
- production behavior

## Pre-Edit Repo Truth Required

Before editing, run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify all uncommitted files as:

- user-owned;
- agent-owned;
- unknown.

Preserve unrelated and user-owned changes. Do not overwrite, normalize, stage, or format unrelated files.

If files are still in your current context or memory, do not re-read them unnecessarily. Re-open only files needed to verify current repo truth, exact type names, export conventions, fixture patterns, and test patterns.

## Source Documents to Use

Inspect the relevant doctrine docs only as needed:

- `docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`

## Current Gap Summary

The current model layer is directionally correct but incomplete against the original Prompt 01 and Prompt 02 requirements.

The current implementation includes simplified contracts such as:

- `ProjectLifecycleEvent`
- `ProjectStageTransitionCheckpoint`
- `LifecycleGateSignal`
- `LifecycleContextReference`
- `ProjectMemoryRecord`
- `ProjectDecisionRecord`
- `ProjectAssumptionRecord`
- `ProjectStageLens`
- `ProjectTraceabilityEdge`
- `WarrantyTraceRecord`
- `CrossProjectReference`
- `ProjectKnowledgeReference`
- `UnifiedSearchAskHbiResponse`

The missing work is deeper domain vocabulary, required status modeling, required record types, traceability graph rigor, obligation/vendor/product models, warranty evidence posture, cross-project knowledge read models, and tests proving the fixture story and no source-of-record conflict.

## Implementation Strategy

Preserve the existing file structure unless a focused new file improves clarity.

Preferred approach:

1. Extend `UnifiedLifecycle.ts` with missing vocabulary/types where appropriate.
2. Add a focused traceability/warranty/knowledge model file only if the existing file would become too large.
   - Recommended candidate: `UnifiedLifecycleTraceability.ts`
   - Use this only if it aligns with repo conventions.
3. Update `UnifiedLifecycleReadModels.ts` only where new read-model types or fields are required.
4. Extend fixtures in:
   - `fixtures/unifiedLifecycle.ts`
   - `fixtures/unifiedLifecycleReadModels.ts`
   - or a new focused fixture file if justified by existing fixture conventions.
5. Extend tests to prove the original Prompt 01/02 requirements now hold.

Do not break existing exports, fixtures, or tests from commits `dcd331940` and `8e4c9db54`.

## Required Gap Corrections — Prompt 01 Contract Depth

Add or align the following exported types/interfaces/vocabularies. If exact names already exist under shorter names, add repo-safe aliases or explicit exported compatibility types rather than duplicating logic.

### Lifecycle Required Types

Add or align:

- `PccProjectLifecycleStage`
- `PccProjectLifecycleEventType`
- `PccProjectLifecycleEventStatus`
- `PccProjectLifecycleEvent`
- `PccProjectStageTransitionCheckpoint`
- `PccLifecycleGateSignal`
- `PccLifecycleContextReference`
- `PccLifecycleTimelineReadModel`

Required lifecycle stages:

- `lead-pursuit`
- `pursuit-go-no-go`
- `estimating`
- `preconstruction`
- `project-setup`
- `active-construction`
- `closeout`
- `warranty`
- `archive`
- `future-reference`

Required event categories/types must cover:

- stage transition
- decision
- assumption
- readiness gate
- external-system milestone
- evidence capture
- risk/constraint signal
- warranty signal
- knowledge reuse signal

Required event status values must be explicit. Include, at minimum, values equivalent to:

- draft
- active
- pending-review
- accepted
- superseded
- archived

Use repo-appropriate names if existing conventions differ, but tests must prove the lifecycle has clear status modeling.

### Project Memory Required Types

Add or align:

- `PccProjectMemoryRecordType`
- `PccProjectMemoryRecordStatus`
- `PccProjectMemoryRecord`
- `PccProjectDecisionRecord`
- `PccProjectAssumptionRecord`
- `PccProjectMemorySummaryReadModel`

Required memory record types:

- `decision`
- `assumption`
- `obligation`
- `risk`
- `constraint`
- `vendor-selection`
- `product-selection`
- `estimate-reference`
- `scope-reference`
- `change-reference`
- `inspection-reference`
- `closeout-reference`
- `warranty-reference`
- `lesson-learned`
- `executive-note`
- `pursuit-note`

Required memory statuses must support:

- open
- validated
- invalidated
- superseded
- converted-to-action
- archived

If some statuses apply only to assumptions, model that cleanly.

### Lenses Required Types

Add or align:

- `PccProjectLensType`
- `PccProjectLensVisibilityMode`
- `PccProjectStageLens`
- `PccRoleStageLensDefinition`
- `PccProjectLensReadModel`

Required lens types:

- `estimating`
- `preconstruction`
- `operations`
- `field`
- `accounting`
- `closeout`
- `warranty`
- `executive`
- `admin`
- `future-pursuit-reference`

Required visibility modes must distinguish, at minimum:

- active-work
- historical-context
- read-only-reference
- restricted
- redacted-summary
- hidden

Use repo-appropriate names if existing conventions differ, but tests must prove lenses do not create separate workspaces and instead filter shared project truth.

## Required Gap Corrections — Prompt 02 Contract Depth

Add or align the following traceability, warranty, obligation, vendor/product, and cross-project knowledge models.

### Traceability Required Types

Add or align:

- `PccTraceableRecordType`
- `PccTraceabilityEdgeType`
- `PccTraceabilityDirection`
- `PccTraceabilityConfidence`
- `PccProjectTraceabilityEdge`
- `PccRelatedRecordCluster`
- `PccTraceabilityGraphReadModel`

Required traceable record types:

- `estimate-line-item`
- `estimate-assembly`
- `bid-package`
- `scope-package`
- `subcontractor-bid`
- `commitment`
- `purchase-order`
- `vendor`
- `subcontractor`
- `product-material`
- `submittal`
- `rfi`
- `asi-ccd-change-event`
- `inspection`
- `constraint`
- `responsibility-matrix-item`
- `punch-item`
- `closeout-document`
- `warranty-claim`
- `lesson-learned`
- `project-memory-record`
- `lifecycle-event`

Required edge types:

- `derived-from`
- `references`
- `satisfies`
- `supersedes`
- `caused-by`
- `contributed-to`
- `approved-by`
- `installed-by`
- `warranted-by`
- `assigned-to`
- `closed-by`
- `reused-by`
- `comparable-to`

The current simplified `ProjectTraceabilityEdgeType` is not sufficient by itself. Extend it or add a `PccTraceabilityEdgeType` vocabulary and compatibility mapping.

### Warranty / Obligation / Vendor / Product Required Types

Add:

- `PccObligationTraceRecord`
- `PccVendorProductTraceRecord`
- `PccWarrantyTraceStatus`
- `PccWarrantyTraceRecord`
- `PccWarrantyTraceReadModel`

A warranty trace record must support source-backed links to:

- original scope or estimate reference;
- commitment/subcontract/vendor;
- approved product/material;
- submittal or closeout record;
- installation/inspection evidence;
- punch or issue context;
- warranty term/obligation evidence;
- responsible party recommendation with confidence and required evidence.

Warranty modeling must explicitly prohibit unsupported responsibility conclusions.

Add statuses or fields that represent:

- insufficient evidence;
- unresolved responsibility;
- pending evidence;
- responsibility recommended;
- responsibility confirmed;
- resolved;
- closed.

Required derived-conclusion posture:

- Any responsible-party recommendation must include confidence and evidence references.
- If evidence is insufficient, the model must represent that as an explicit status/posture, not as a recommendation.
- Tests must prove unsupported warranty conclusions are impossible or represented as insufficient/unresolved.

### Cross-Project Knowledge Required Types

Add or align:

- `PccProjectKnowledgeReferenceType`
- `PccCrossProjectReferenceStatus`
- `PccCrossProjectReference`
- `PccProjectKnowledgeReference`
- `PccClosedProjectReferenceReadModel`

Required reference types:

- `comparable-project`
- `comparable-scope`
- `vendor-performance`
- `product-performance`
- `estimate-variance`
- `warranty-pattern`
- `lesson-learned`
- `risk-pattern`
- `constructability-note`
- `pursuit-reference`

Required cross-project statuses must include values equivalent to:

- candidate
- approved
- restricted
- redacted
- archived
- rejected

## Required Shared Record Fields

Every new or revised core record must include or inherit:

- stable ID;
- `projectId` where applicable;
- lifecycle stage/context where applicable;
- source lineage reference or explicit PCC-native ownership marker;
- evidence links where applicable;
- security/sensitivity classification;
- redaction/summary posture where applicable;
- allowed role/persona/lens access metadata where applicable;
- confidence or verification status where conclusions are derived;
- read/write posture;
- status;
- created/updated metadata if consistent with repo conventions.

If current primitives are insufficient, extend them minimally and consistently.

## Required Fixture Stories

Extend deterministic fixtures so they demonstrate all of the following:

1. A single project moving from:
   - pursuit → estimating → operations/active construction → closeout → warranty.

2. At least one estimating assumption visible later in operations.

3. At least one decision record with evidence.

4. At least one sensitive pursuit or executive record with restricted visibility metadata.

5. At least one lifecycle event that rolls up to project readiness.

6. At least one lens that changes visibility without changing source ownership.

7. An estimate reference connected to:
   - commitment;
   - approved product/material;
   - vendor/subcontractor;
   - source evidence.

8. A warranty claim traced back to:
   - product/material;
   - vendor/subcontractor;
   - original scope or estimate reference;
   - submittal/closeout record;
   - installation/inspection evidence;
   - warranty obligation evidence.

9. A warranty trace with insufficient evidence that cannot assign responsibility.

10. A lesson learned from a closed project reused as a future pursuit reference.

11. A restricted cross-project reference hidden/redacted from unauthorized roles by metadata.

Use `example.invalid` for all URLs. Do not introduce live tenant URLs.

## Required Tests

Add or update tests to prove all of the following:

### Prompt 01 Tests

- Required lifecycle stages are present exactly or as a superset.
- Required lifecycle event categories/statuses are present.
- Event records include source lineage or PCC-native ownership.
- Memory record types include all required vocabulary.
- Memory records include security classification.
- Assumption records can be:
  - open;
  - validated;
  - invalidated;
  - superseded;
  - converted-to-action.
- Lens types and visibility modes include all required vocabulary.
- Lens definitions do not create separate workspaces.
- Fixture records are deterministic and internally consistent.
- Package public exports include all new/aliased contracts.

### Prompt 02 Tests

- Traceable record types include all required vocabulary.
- Traceability edge types include all required vocabulary.
- Traceability edges only connect recognized record types.
- Related-record clusters have no orphaned required references.
- Obligation trace records include source/evidence/security fields.
- Vendor/product trace records connect vendor/subcontractor/product/material/submittal evidence.
- Warranty trace records represent insufficient-evidence/unresolved responsibility without assigning unsupported blame.
- Responsible-party recommendation, when present, includes confidence and evidence.
- Cross-project references carry security/redaction/eligible lens metadata.
- Closed-project reference read model supports future pursuit reuse.
- Fixtures form a deterministic traceability graph.
- No fixture response claims PCC is the system of record for source-owned records.
- No non-`example.invalid` URLs are introduced.
- Public exports include all new/aliased contracts.

### Read-Model Compatibility Tests

The existing Prompt 2 `PccReadModelResponseMap` keys must remain unchanged:

- `unified-lifecycle`
- `project-memory`
- `project-lenses`
- `project-traceability`
- `warranty-trace`
- `cross-project-knowledge`
- `unified-search`

If read-model DTOs need additional fields to expose the deeper contract layer, extend them in a backward-compatible way.

Do not rename route IDs.

## Export Requirements

Ensure all new or aliased contracts are exported through the existing PCC model seams.

At minimum, public exports must include:

### Prompt 01 Names

- `PccProjectLifecycleStage`
- `PccProjectLifecycleEventType`
- `PccProjectLifecycleEventStatus`
- `PccProjectLifecycleEvent`
- `PccProjectStageTransitionCheckpoint`
- `PccLifecycleGateSignal`
- `PccLifecycleContextReference`
- `PccLifecycleTimelineReadModel`
- `PccProjectMemoryRecordType`
- `PccProjectMemoryRecordStatus`
- `PccProjectMemoryRecord`
- `PccProjectDecisionRecord`
- `PccProjectAssumptionRecord`
- `PccProjectMemorySummaryReadModel`
- `PccProjectLensType`
- `PccProjectLensVisibilityMode`
- `PccProjectStageLens`
- `PccRoleStageLensDefinition`
- `PccProjectLensReadModel`

### Prompt 02 Names

- `PccTraceableRecordType`
- `PccTraceabilityEdgeType`
- `PccTraceabilityDirection`
- `PccTraceabilityConfidence`
- `PccProjectTraceabilityEdge`
- `PccRelatedRecordCluster`
- `PccTraceabilityGraphReadModel`
- `PccObligationTraceRecord`
- `PccVendorProductTraceRecord`
- `PccWarrantyTraceStatus`
- `PccWarrantyTraceRecord`
- `PccWarrantyTraceReadModel`
- `PccProjectKnowledgeReferenceType`
- `PccCrossProjectReferenceStatus`
- `PccCrossProjectReference`
- `PccProjectKnowledgeReference`
- `PccClosedProjectReferenceReadModel`

If the repo already has functionally equivalent names, add explicit aliases and tests so consumers can import the expected names without ambiguity.

## Guardrails

- Do not create separate departmental workspace concepts.
- Do not duplicate source-of-record ownership.
- Do not make PCC the source of record for Procore/Sage/CRM/Autodesk/SharePoint-native records unless the System of Record Matrix explicitly says PCC owns that record.
- Do not infer warranty responsibility without evidence.
- Do not expose restricted pursuit, executive, warranty, or cross-project content without security/redaction metadata.
- Do not introduce backend routes.
- Do not introduce SPFx clients or UI.
- Do not change package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not broadly reformat unrelated files.

## Validation Required

Run and report:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
md5 pnpm-lock.yaml
```

If broader tests fail for pre-existing reasons, report the failure clearly and provide targeted passing evidence for all Prompt 2A-owned tests.

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Uncommitted workspace classification.
3. Files changed.
4. Existing contracts preserved.
5. New/aliased contracts added.
6. Fixture stories represented.
7. Tests added/updated.
8. Validation results.
9. Lockfile MD5 before/after.
10. Remaining gaps, if any, that must be addressed before backend Prompt 3.
11. Commit hash if committed.
12. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 2A-owned files. Do not stage unrelated files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(models-pcc): complete unified lifecycle traceability contract gaps
```
