# Source File Map Template — Wave D

## Repo State

- HEAD:
- Branch:
- Worktree before:
- Worktree after:

## Shared Primitives

| Area | File | Ownership | Change required? | Notes |
| --- | --- | --- | --- | --- |
| Bento grid | `apps/project-control-center/src/layout/PccBentoGrid.tsx` | Shared layout |  |  |
| Bento CSS | `apps/project-control-center/src/layout/PccBentoGrid.module.css` | Shared layout |  |  |
| Card | `apps/project-control-center/src/layout/PccDashboardCard.tsx` | Shared layout |  |  |
| Card CSS | `apps/project-control-center/src/layout/PccDashboardCard.module.css` | Shared layout |  |  |
| Footprints | `apps/project-control-center/src/layout/footprints.ts` | Shared layout |  |  |
| Row span | `apps/project-control-center/src/layout/useBentoRowSpan.ts` | Shared layout |  |  |
| Container breakpoint | `apps/project-control-center/src/layout/useContainerBreakpoint.ts` | Shared layout |  |  |
| Shell canvas | `apps/project-control-center/src/shell/PccShell.tsx` / `.module.css` | Shell |  |  |

## Surfaces

| Surface | Primary file | Tier adoption required? | Tests to update | Notes |
| --- | --- | --- | --- | --- |
| Project Home | `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx` |  |  |  |
| Team & Access | `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx` |  |  | High-risk constrained layout. |
| Documents | `apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx` |  |  |  |
| Project Readiness | `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx` |  |  | Card-heavy. |
| Approvals | `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx` |  |  | Card-heavy. |
| External Systems | `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx` |  |  | Drawer excluded from grid. |
| Control Center Settings | `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx` |  |  |  |
| Site Health | `apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthSurface.tsx` |  |  |  |

## Tests

| Test file | Current coverage | Add/update required? |
| --- | --- | --- |
| `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx` |  |  |
| `apps/project-control-center/src/layout/useBentoRowSpan.test.tsx` |  |  |
| Surface route tests |  |  |
