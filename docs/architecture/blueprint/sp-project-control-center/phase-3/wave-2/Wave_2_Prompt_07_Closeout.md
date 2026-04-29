# Wave 2 Prompt 07 Closeout

## Scope
Prompt 07 preview-only implementation for the following routed surfaces in `apps/project-control-center/`:
- `team-and-access`
- `control-center-settings`
- `approvals`
- `project-readiness`

No runtime workflow execution, persistence, live integration, permission mutation, approval execution, or backend calls were introduced.

## Files Changed
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamViewerLaneCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccPermissionRequestLaneCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessManagerLaneCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.module.css`
- `apps/project-control-center/src/surfaces/teamAccess/shared.ts`
- `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx`
- `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.module.css`
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx`
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.module.css`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css`
- `apps/project-control-center/src/tests/PccPrompt07.surfaces.test.tsx`
- `apps/project-control-center/src/tests/PccTeamAccessSurface.test.tsx`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Prompt_07_Closeout.md`

## Surface Coverage Evidence
- `PccSurfaceRouter` now routes these four surface ids to dedicated preview components:
  - `team-and-access` → `PccTeamAccessSurface`
  - `control-center-settings` → `PccControlCenterSettingsSurface`
  - `approvals` → `PccApprovalsSurface`
  - `project-readiness` → `PccProjectReadinessSurface`
- Existing routes for `project-home`, `documents`, `external-systems`, and `site-health` remain untouched.

## Team & Access Three-Lane Evidence
- `PccTeamAccessSurface` consumes shared Team & Access fixtures/models via `@hbc/models/pcc`.
- Implemented lanes:
  - Team Viewer Lane (`data-pcc-team-access-lane="team-viewer"`)
  - Permission Request Lane (`data-pcc-team-access-lane="permission-request"`)
  - Access Manager Lane (`data-pcc-team-access-lane="access-manager"`)
- Branch behavior:
  - Access Manager persona branch shows all three lanes and manager preview affordances.
  - Non-manager with project-site access shows Team Viewer context including current role + permission template.
  - Non-manager without project-site access shows request-access lane only.

## Role/Access-State Branch Test Evidence
- `apps/project-control-center/src/tests/PccTeamAccessSurface.test.tsx` validates:
  - manager affordances (add/search, assignment, execution status cues)
  - non-manager with access (viewer lane + current assignment context)
  - non-manager without access (request-access entry only)

## Settings / Approvals / Readiness Preview Evidence
- `control-center-settings`: scope cards + missing configuration preview items only; no save/update path.
- `approvals`: preview counts/lists only; no approve/reject execution path.
- `project-readiness`: preview rollup cards only; no backend rollup or workflow execution.

## Active-Surface Router Invariant Evidence
- `apps/project-control-center/src/tests/PccPrompt07.surfaces.test.tsx` validates for each Prompt 07 surface id:
  - exactly one `data-pcc-active-surface-panel` marker exists;
  - marker value equals active surface id.

## Validation Results
Commands run:
1. `git status --short`
2. `pnpm --filter @hbc/spfx-project-control-center check-types`
3. `pnpm --filter @hbc/spfx-project-control-center test`
4. `pnpm --filter @hbc/spfx-project-control-center build`
5. `pnpm --filter @hbc/spfx-project-control-center lint`

Results:
- `check-types`: pass (after router fallback type narrowing fix)
- `test`: pass (`12` files, `134` tests)
- `build`: pass
- `lint`: pass

## Guardrail Confirmations
Confirmed no introduction of:
- SharePoint/Entra/Teams group or permission mutation;
- Graph, PnP, backend API, Procore API, or tenant API calls;
- people-picker live lookup;
- request persistence;
- approval execution;
- `window.open`, clipboard write, storage write, form-submit execution, or live link launch behavior.

All Prompt 07 action affordances are preview-only/disabled UI cues.

## Cross-Prompt Integrity Confirmations
- Document Control model/export parity work remains untouched in this prompt and stays resolved.
- Team & Access model alignment in `@hbc/models/pcc` was consumed by the app surface implementation and was not redefined here.
