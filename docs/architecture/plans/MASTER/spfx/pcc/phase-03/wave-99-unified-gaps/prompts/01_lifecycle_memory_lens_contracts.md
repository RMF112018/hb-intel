# Prompt 01 — Add PCC Lifecycle, Memory, and Lens Model Contracts

## Objective

Implement the first model-contract layer for the accepted unified lifecycle architecture. Add TypeScript contracts and deterministic fixtures for:

- project lifecycle events;
- stage transition checkpoints;
- lifecycle gate signals;
- lifecycle context references;
- project memory records;
- project decision records;
- project assumption records;
- project stage lenses;
- role/stage/task lens definitions.

This prompt must stay inside the model layer unless a test or export seam requires a minimal adjacent update.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Context Handling

Do not re-read files still in current context or memory. Re-open only the model files and doctrine docs needed to verify exact names, export conventions, fixture patterns, and test patterns.

## Required Source Docs

Use these doctrine docs as source of truth:

- `docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`

## Files to Inspect

Inspect current conventions in:

- `packages/models/src/pcc/`
- `packages/models/src/pcc/fixtures/`
- `packages/models/src/pcc/*.test.ts`
- `packages/models/src/index.ts`
- `packages/models/package.json`

## Required Contracts

Create or extend model files using repo naming conventions. Prefer small focused files if that matches existing PCC model style.

At minimum, define these exported types/interfaces/enums:

### Lifecycle

- `PccProjectLifecycleStage`
- `PccProjectLifecycleEventType`
- `PccProjectLifecycleEventStatus`
- `PccProjectLifecycleEvent`
- `PccProjectStageTransitionCheckpoint`
- `PccLifecycleGateSignal`
- `PccLifecycleContextReference`
- `PccLifecycleTimelineReadModel`

Required stages:

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

Required event categories:

- stage transition;
- decision;
- assumption;
- readiness gate;
- external-system milestone;
- evidence capture;
- risk/constraint signal;
- warranty signal;
- knowledge reuse signal.

### Project Memory

- `PccProjectMemoryRecordType`
- `PccProjectMemoryRecordStatus`
- `PccProjectMemoryRecord`
- `PccProjectDecisionRecord`
- `PccProjectAssumptionRecord`
- `PccProjectMemorySummaryReadModel`

Required memory record types:

- decision;
- assumption;
- obligation;
- risk;
- constraint;
- vendor-selection;
- product-selection;
- estimate-reference;
- scope-reference;
- change-reference;
- inspection-reference;
- closeout-reference;
- warranty-reference;
- lesson-learned;
- executive-note;
- pursuit-note.

### Lenses

- `PccProjectLensType`
- `PccProjectLensVisibilityMode`
- `PccProjectStageLens`
- `PccRoleStageLensDefinition`
- `PccProjectLensReadModel`

Required lens types:

- estimating;
- preconstruction;
- operations;
- field;
- accounting;
- closeout;
- warranty;
- executive;
- admin;
- future-pursuit-reference.

## Required Shared Fields

Every core record must include:

- stable `id`;
- `projectId` where applicable;
- lifecycle stage/context;
- source lineage reference or clear PCC-native ownership marker;
- evidence links where applicable;
- security/sensitivity classification;
- created/updated metadata if existing repo patterns support it;
- read/write posture;
- status.

Use existing PCC source-lineage/evidence-link primitives where present. If current primitives are insufficient, add minimal reusable primitives in a clearly named model file and update tests.

## Fixtures

Add deterministic fixture data that demonstrates:

- one project moving from pursuit to estimating to operations to warranty;
- at least one estimating assumption visible later in operations;
- at least one decision record with evidence;
- at least one sensitive pursuit or executive record with restricted visibility metadata;
- at least one lifecycle event that rolls up to project readiness;
- at least one lens changing visibility without changing source ownership.

## Tests

Add or update tests to prove:

- required lifecycle stages are present;
- event records include source lineage or PCC-native ownership;
- memory records include security classification;
- assumption records can be open, validated, invalidated, superseded, or converted-to-action;
- lens definitions do not create separate workspaces;
- fixture records are deterministic and internally consistent;
- package public exports include the new contracts.

## Constraints

- No backend implementation in this prompt.
- No SPFx implementation in this prompt.
- No dependency changes.
- No lockfile change.
- No broad formatting.
- No external-system live calls.
- No tenant mutation.

## Validation

Run the narrowest relevant validation first, then broader package validation if feasible:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
md5 pnpm-lock.yaml
```

If repo scripts differ, inspect package scripts and run the closest equivalent.

## Required Response

Return:

1. Files changed.
2. Contracts added.
3. Fixtures added.
4. Tests added/updated.
5. Validation results.
6. Lockfile MD5 before/after.
7. Remaining gaps passed to Prompt 02.
