# 09 — Component Refactor Plan

## Objective

Restructure the Manager UI without destabilizing backend/readiness architecture.

## Files to Inspect

Start with:

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageLaneViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/ManageRegistryPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePlacementPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageMutationUtils.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/manageFields.module.css`
- `apps/hb-intel-foleon/src/pages/manage/foleonManageTokens.css`
- `apps/hb-intel-foleon/src/runtime/**`
- `apps/hb-intel-foleon/src/types/foleon-management.types.ts`
- `apps/hb-intel-foleon/src/services/FoleonManagementApi.ts`
- `apps/hb-intel-foleon/src/pages/__tests__/**`

Also inspect:

- `docs/reference/ui-kit/doctrine/**`
- `docs/reference/spfx-surfaces/**`
- `docs/reference/spfx-surfaces/benchmark/**`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/architecture/plans/MASTER/spfx/foleon-manage/**`
- `docs/architecture/plans/MASTER/platform/config-registry/**`

## Files Likely to Change

Expected likely changes:

- `ManageOrchestrator.tsx`
- `HomepageFoleonContentTab.tsx`
- `FoleonConfigTab.tsx`
- `manageLaneViewModel.ts`
- `manageConfigViewModel.ts`
- `ManageRegistryPanel.tsx`
- `ManageContentEditorPanel.tsx`
- `ManagePlacementPanel.tsx`
- `manageShell.module.css`
- `manageFields.module.css`
- `foleonManageTokens.css`
- tests under `apps/hb-intel-foleon/src/pages/__tests__/**`
- optional new components in `apps/hb-intel-foleon/src/pages/manage/`

Potential new components:

- `ManagerHeader.tsx`
- `ManagerStatusBanner.tsx`
- `ManagerStatusChip.tsx`
- `LaneSummaryCard.tsx`
- `SelectedLaneWorkspace.tsx`
- `PublishReadinessChecklist.tsx`
- `AdminHealthSummary.tsx`
- `RequiredAdminActions.tsx`
- `DiagnosticsDisclosure.tsx`

## Component Responsibilities

### `ManageOrchestrator`

Keep as state owner and data/workflow coordinator.

Responsibilities:

- load safe config/content/placements/sync status;
- maintain selected tab and selected lane/content;
- pass read/write/sync readiness into child components;
- preserve current workflow calls.

### `HomepageFoleonContentTab`

Responsibilities:

- lane cards;
- selected lane workspace;
- content library;
- entry points to editor/placement actions.

### `FoleonConfigTab`

Responsibilities:

- system health summary;
- admin action ranking;
- configuration groups;
- diagnostics disclosure.

### `manageLaneViewModel`

Responsibilities:

- derive lane state;
- derive active/staged content;
- derive placement alignment;
- derive publish readiness;
- derive action disabled reasons.

### `manageConfigViewModel`

Responsibilities:

- map readiness keys to plain-language labels;
- group health states;
- rank admin blockers;
- produce redacted diagnostics view model.

## Surgical Remediation Order

1. Create label mapping and status helpers.
2. Create header and global status banner.
3. Default tab to Homepage Foleon Content.
4. Move raw diagnostics to collapsed disclosure.
5. Add lane summary cards.
6. Add selected-lane workspace.
7. Redesign Config grouping.
8. Add degraded state copy and disabled-action explanations.
9. Add tests.

## Required Preservation

## Non-Negotiable Architecture Guardrails

- Preserve the registry-first architecture.
- Preserve split readiness states; do not collapse readiness into one boolean.
- Preserve degraded consent-required rendering.
- Preserve backend route boundaries; do not add routes unless repo truth proves they are required.
- Preserve redacted diagnostics; never surface raw secrets, tokens, backend URLs, API resources, or list GUIDs in the primary UI.
- Preserve existing content workflows: save, validate, publish, suppress, placement, sync.
- Do not change package/version files as part of the audit/planning package.
- If shipped SPFx behavior changes in implementation, versioning must be handled only in the relevant implementation wave and documented in closure.
- Do not re-read files that remain in active local-agent context unless needed to verify drift, contradictions, or line-level implementation details.

