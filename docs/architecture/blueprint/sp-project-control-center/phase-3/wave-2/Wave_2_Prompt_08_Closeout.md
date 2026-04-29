# Wave 2 Prompt 08 Closeout

## Files Changed
- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccPermissionRequestLaneCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessManagerLaneCard.tsx`
- `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx`
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/tests/PccPreviewState.states.test.tsx`
- `apps/project-control-center/src/tests/PccPrompt07.surfaces.test.tsx`
- `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx`
- `apps/project-control-center/src/tests/pcc-import-guards.test.ts`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Prompt_08_Closeout.md`

## Required Preview-State Coverage Map
`PCC_PREVIEW_STATES` now contains exactly 8 states:
1. `preview`
2. `loading`
3. `empty`
4. `error`
5. `missing-config`
6. `unavailable-fixture`
7. `unauthorized-persona`
8. `not-yet-implemented-operation`

Test coverage in `PccPreviewState.states.test.tsx` verifies:
- exactly 8 unique states;
- every state has spec entry with non-empty `badge`, `title`, and `description`;
- render output includes `data-pcc-state` and `data-pcc-state-tone` markers for every state.

## Prompt 07 Fallback Standardization Evidence
- Team & Access:
  - header uses `preview` state;
  - non-access-manager restriction card uses `unauthorized-persona`;
  - disabled request and manager action sections include `not-yet-implemented-operation`;
  - empty request/permission-template fixture branches render `unavailable-fixture`.
- Control Center Settings:
  - surface banner uses `preview`;
  - configuration backlog card includes `missing-config`.
- Approvals:
  - surface banner uses `preview`;
  - pending/submitted sections render `unavailable-fixture` when arrays are empty.
- Project Readiness:
  - surface banner uses `preview`;
  - readiness grid renders `unavailable-fixture` when list is empty.

Credible fixture-backed content remains in place; fallback states were added only where applicable.

## Guard-Test Coverage Map
`pcc-import-guards.test.ts` now enforces two layers:
- module specifier guard (import/export specifiers) for:
  - `@pnp/`, `@pnp/sp`
  - Graph client package seams
  - Procore SDK/client seams
  - backend client/route seams
  - homepage paired-row and direct `apps/hb-webparts/src/webparts/hbHomepage/` seams
- executable seam guard (stripped code scan) for:
  - Graph/Procore runtime client symbols
  - `fetch(`, `XMLHttpRequest`
  - `navigator.clipboard`, `localStorage`, `sessionStorage`, `window.open`
  - `ensureUser`, PeoplePicker/live lookup seams
  - SharePoint permission/group mutation seams
  - tenant mutation seams

## Import-Specifier Scan Fix
Previous guard logic stripped all string literals before scanning, which could hide import specifiers.

Prompt 08 fix:
- added a dedicated module-specifier extraction path that scans import/export specifiers from comment-stripped raw source;
- retained stripped-code scanning for executable seam detection;
- continued ignoring prose/comments to reduce false positives.

This restores reliable detection of forbidden module imports while keeping comment/prose noise out of the guard results.

## Fixture Safety Confirmations
- Existing `@hbc/models/pcc` fixtures remain the primary source.
- No real tenant URLs, UPNs, tokens, API keys, client IDs, Procore identifiers, or secrets were introduced.
- No new app-local secret-bearing fixture data was added.

## Layout Guard Evidence
`PccBentoGrid.footprints.test.tsx` now includes a Project Home regression assertion that verifies:
- multiple footprint values are rendered;
- non-uniform column spans are rendered;
- layout remains variable-footprint/variable-span and not fixed paired-row dependent.

## Validation Results
Commands run:
1. `git status --short`
2. `pnpm --filter @hbc/spfx-project-control-center check-types`
3. `pnpm --filter @hbc/spfx-project-control-center test`
4. `pnpm --filter @hbc/spfx-project-control-center build`
5. `pnpm --filter @hbc/spfx-project-control-center lint`

Results:
- `check-types`: pass
- `test`: pass (`15` files, `173` tests)
- `build`: pass
- `lint`: pass

## Remaining Acceptable Preview Limitations
- All action affordances remain preview-only/disabled.
- No request persistence, approval execution, or access mutation paths are enabled.
- No Graph/PnP/backend/Procore runtime calls exist.
- No live people-picker lookup exists.

## Runtime/Mutation Guardrail Confirmation
No runtime/live/mutation paths were introduced in this prompt.
