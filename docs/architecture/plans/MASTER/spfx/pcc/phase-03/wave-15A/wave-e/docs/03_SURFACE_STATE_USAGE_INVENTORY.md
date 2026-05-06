# 03 — Surface State Usage Inventory

## Purpose

Define the surface-by-surface Wave E inspection matrix. This file is a source map and acceptance checklist for local remediation.

## Routed Surface Inventory

The current router dispatches these primary surfaces:

| Surface ID | Component | State-model focus |
|---|---|---|
| `project-home` | `PccProjectHome` | Priority scan path must not be dominated by preview state. State should support project health, setup gaps, pending decisions, readiness, and source confidence. |
| `team-and-access` | `PccTeamAccessSurface` | Invites/requests/execution must clearly distinguish visible roster/review context from disabled execution. |
| `documents` | `PccDocumentsSurface` | Must explain Microsoft Files, external source binding, permissions, reviews, mapping, and source health. |
| `project-readiness` | `PccProjectReadinessSurface` | Must distinguish read-only, degraded, blocked, missing config, empty, and error readiness conditions. |
| `approvals` | `PccApprovalsSurface` | Must show preview-safe approval context and avoid unavailable-placeholder dominance. |
| `external-systems` | `PccExternalSystemsSurface` | Must explain each integration's purpose, owner, data direction, activation status, and action state. |
| `control-center-settings` | `PccControlCenterSettingsSurface` | Must distinguish editable, locked, missing, preview-only, and setup-required settings. |
| `site-health` | `PccSiteHealthSurface` | Must make security, drift, repair, degraded, and unavailable states operationally explicit. |

## Surface-Specific Required Checks

### Project Home

Inspect:

- `PccProjectHome.tsx`
- `PccProjectHomeReadModelContent.tsx`
- `PccProjectIntelligenceCard.tsx`
- `PccPriorityActionsCard.tsx`
- `PccPriorityActionsRail.tsx`
- `PccMissingConfigurationsCard.tsx`
- `PccDocumentControlCard.tsx`
- `projectHomeAdapter.ts`

Acceptance:

- Preview/reference status is secondary to the project command-center scan path.
- Setup gaps explain owner and next action.
- Priority actions are either active, reference-only, or explicitly disabled with reason.
- No "Wave", "Prompt", "fixture", or "read-model" text is primary user-facing.

### Team & Access

Inspect:

- `PccTeamAccessSurface.tsx`
- `PccTeamAccessHeaderCard.tsx`
- `PccTeamAccessLaneShell.tsx`
- `PccTeamViewerLaneCard.tsx`
- `PccPermissionRequestLaneCard.tsx`
- `PccAccessManagerLaneCard.tsx`
- `PccAccessRequestQueue.tsx`
- `PccAccessExecutionQueue.tsx`
- `PccAccessReviewControls.tsx`
- `PccExecutionStatusPanel.tsx`
- `PccTeamAccessReadModelContent.tsx`
- `useTeamAccessReadModel.ts`

Acceptance:

- User can tell what roster/access information is visible.
- User can tell which actions are disabled and why.
- Permission request and access manager actions use `PccDisabledAffordance` or a visible equivalent.
- Access restrictions are framed as operational/authorization state, not missing content.

### Documents

Inspect:

- `PccDocumentsSurface.tsx`
- `PccDocumentsHeaderCard.tsx`
- `PccDocumentControlLaneCard.tsx`
- `PccDocumentControlPermissionsCard.tsx`
- `PccDocumentControlReviewsCard.tsx`
- `sourceStateMessaging.ts`
- `documentControlViewModel.ts`
- `useDocumentsReadModel.ts` or equivalent read-model hook/client file.

Acceptance:

- Source health and binding state are visible per lane.
- Disabled browse/open/review actions explain activation requirements.
- Empty state means no records, not missing source.
- Backend unavailable and source unavailable are distinct.

### Project Readiness

Inspect:

- `PccProjectReadinessSurface.tsx`
- `projectReadinessAdapter.ts`
- `lifecycleReadinessAdapter.ts`
- `permitInspectionControlCenterViewModel.ts`
- `PccPermitInspectionControlCenterRegions.tsx`
- `responsibilityMatrixAdapter.ts`
- `constraintsLogAdapter.ts`
- `buyoutLogAdapter.ts`

Acceptance:

- Blocked and degraded states read as operational posture.
- Read-only execution constraints are explained.
- Severity is meaningful; warning/error states are not neutralized.
- Empty lanes remain distinct from missing configuration.

### Approvals

Inspect:

- `PccApprovalsSurface.tsx`
- `approvalsViewModel.ts`
- `approvalsAdapter.ts`
- `PccApprovalsCheckpointsCard.tsx` if project-home related.

Acceptance:

- Approval queue is visible where data exists.
- Unavailable states do not dominate the surface.
- Approve/reject/route actions explain disabled execution.
- Tests verify each approval action's reason chain.

### External Systems

Inspect:

- `PccExternalSystemsSurface.tsx`
- `PccExternalSystemsLaunchPadHeaderCard.tsx`
- `PccExternalSystemsLaunchPadSummaryCard.tsx`
- `PccExternalSystemTile.tsx`
- `PccExternalSystemsProjectLinksCard.tsx`
- `PccExternalSystemsProcoreConfigurationStatusCard.tsx`
- `PccExternalSystemsReviewQueueCard.tsx`
- `PccExternalSystemsAddEditLinkDrawer.tsx`
- `launchPadAdapter.ts`
- `launchPadViewModel.ts`

Acceptance:

- Integration tiles show purpose, owner, status, data direction, and activation state.
- Add/edit link workflow explains why save/execution is unavailable.
- "Source unavailable" is not the only message a business user sees.
- External-system actions are either active, reference, or disabled with reason.

### Control Center Settings

Inspect:

- `PccControlCenterSettingsSurface.tsx`
- settings cards, sections, and any local constants.

Acceptance:

- Editable, locked, setup-required, and preview-only settings are distinct.
- Missing configuration explains owner/next step.
- No fake edit/save path exists.

### Site Health

Inspect:

- `PccSiteHealthSurface.tsx`
- `PccSiteHealthOverviewCard.tsx`
- `PccSiteHealthDriftCard.tsx`
- any repair/security cards.

Acceptance:

- Security-risk and repair states are prominent enough for operational use.
- Drift/unavailable states explain impact and owner.
- State severity is not generic.

## Router Fallback

Inspect `PccSurfaceRouter.tsx`.

Required:

- Confirm fallback is unreachable from normal navigation.
- If reachable, replace generic fallback with operational copy:
  - what surface is unavailable;
  - why this route is not available;
  - what user can do next;
  - owner or support path.
- Avoid `unavailable-fixture` as a visible state key or data marker if it can leak to automated screenshot/evidence tooling.
