# Wave 2 Team & Access Model Alignment Closeout

Date: 2026-04-29

## Summary

This run aligns the shared `@hbc/models/pcc` capability and fixture foundation for Team & Access to the corrected Wave 2 lifecycle-preview posture (Team Viewer, Permission Request, Access Manager) so Prompt 07 can consume deterministic shared model data.

## Files Changed

- `packages/models/src/pcc/TeamAccess.ts`
- `packages/models/src/pcc/fixtures/TeamAccessFixtures.ts`
- `packages/models/src/pcc/PccCapabilities.ts`
- `packages/models/src/pcc/PccCapabilities.test.ts`
- `packages/models/src/pcc/TeamAccess.test.ts`
- `packages/models/src/pcc/fixtures/index.ts`
- `packages/models/src/pcc/fixtures/Fixtures.test.ts`
- `packages/models/src/pcc/index.ts`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Team_Access_Model_Alignment_Closeout.md`

## Capability Mapping Before / After

`manage-team-access` persona mapping before:

- `pcc-admin`
- `project-executive`
- `project-manager`

`manage-team-access` persona mapping after (exact `TEAM_ACCESS_MANAGER_PERSONAS` source set):

- `pcc-admin`
- `it-admin`
- `estimating-coordinator`
- `lead-estimator`
- `project-executive`
- `project-manager`
- `manager-of-operational-excellence`

Exhaustive tests now prove every `PCC_PERSONAS` entry follows this exact rule:

- in `TEAM_ACCESS_MANAGER_PERSONAS` => has `manage-team-access`
- not in `TEAM_ACCESS_MANAGER_PERSONAS` => does not have `manage-team-access`

## New Team & Access Model / Fixture Exports

Added shared Team & Access model vocabulary and types in `TeamAccess.ts`, including:

- `TEAM_ACCESS_MANAGER_PERSONAS`
- lane/audience/member-kind/request/execution status constants and literal types
- lane model interfaces for Team Viewer, Permission Request, and Access Manager

Added deterministic Team & Access fixture domain in `TeamAccessFixtures.ts`, including:

- Team Viewer lane fixture
- Permission Request lane fixture
- Access Manager lane fixture
- aggregate preview model fixture
- at least one access-manager example
- at least one user with project-site access
- at least one user without project-site access
- at least one current role + permission assignment
- at least one permission request preview
- at least one approval/comment/execution-status preview

Updated barrels:

- `packages/models/src/pcc/index.ts`
- `packages/models/src/pcc/fixtures/index.ts`

## Prompt 07 Consumability

Prompt 07 can now consume a shared deterministic Team & Access read-model/fixture domain for all three Wave 2 preview lanes without needing ad hoc lane-shape invention.

## Guardrail / No-Mutation Confirmation

No UI implementation was introduced.

No runtime/backend/provisioning/tenant behavior was introduced.

No Graph/PnP/SharePoint/Entra/Teams calls or mutation paths were introduced.

No persistence, approval execution, group assignment, or permission mutation behavior was introduced.

`pnpm-lock.yaml` was not changed.

## Validation Results

Executed:

- `git status --short`
- `pnpm --filter @hbc/models check-types`
- `pnpm --filter @hbc/models test`
- `pnpm --filter @hbc/models build`

Results:

- `check-types`: pass
- `test`: pass (30 files, 220 tests)
- `build`: pass

