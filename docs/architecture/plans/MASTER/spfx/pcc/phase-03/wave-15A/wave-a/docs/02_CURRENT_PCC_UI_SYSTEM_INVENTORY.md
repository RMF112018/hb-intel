# 02 — Current PCC UI System Inventory

## Purpose

Inventory the current PCC UI system areas and distinguish shared/systemic remediation from surface-specific remediation.

## Inventory

| UI/System Area | Repo Files Involved | Current Purpose | Issue Class | Known or Suspected Doctrine Risks |
| --- | --- | --- | --- | --- |
| Shell / frame | PccApp.tsx; PccShell.tsx; PccSurfaceRouter.tsx | Frames PCC app, routes surfaces, hosts nav/context. | Shared/systemic | Shell dominance, host-fit, nav clarity. |
| Navigation / surface selector | PccShell.tsx; PccSurfaceRouter.tsx | Moves between PCC modules/surfaces. | Shared/systemic | Module-first IA may not communicate status/workflow. |
| Project context | Project Home cards; shell/header if present | Communicates active project and operational status. | Shared/systemic | Inconsistent context across surfaces. |
| Grid / bento layout | PccBentoGrid.tsx; useBentoRowSpan.ts; PccDashboardCard.tsx | Controls surface card composition. | Shared/systemic | Narrow unusable spans; flat hierarchy. |
| Preview/state model | PccPreviewState.tsx; pccReadModelStateMapping.ts; sourceStateMessaging.ts | Communicates preview/read-only/degraded states. | Shared/systemic | Developer-facing or generic copy. |
| Project Home | PccProjectHome.tsx and projectHome cards | Primary first-impression surface. | Surface-specific | Needs command-center hierarchy and project context. |
| Team & Access | teamAccess components/adapters/view model | Team, access requests, execution/read-model state. | Surface-specific | Reported layout collapse; complex three-lane hierarchy. |
| Documents | PccDocumentsSurface.tsx; documentControlViewModel.ts; document read-model components | SharePoint document control and project record view. | Surface-specific | Needs Project Record vs working-file distinction. |
| Project Readiness | PccProjectReadinessSurface.tsx; readiness adapters | Blocker/readiness/constraint reporting. | Surface-specific | Needs stronger readiness hierarchy. |
| Approvals | PccApprovalsSurface.tsx; approvals cards/tests | Approval/checkpoint review surface. | Surface-specific | Needs preview-safe queue content. |
| External Systems | PccExternalSystemsCard.tsx; ExternalSystems tests/surface | Procore/other system integration visibility. | Surface-specific | Needs workflow value and mapping status. |
| Control Center Settings | PccControlCenterSettingsSurface.tsx | Governance/settings ownership surface. | Surface-specific | Needs ownership, locked/editable/preview distinctions. |
| Site Health | siteHealth components; Procore sync/repair card | Security, repair, configuration, sync state. | Surface-specific | Needs security/repair hierarchy. |

## Shared/Systemic Remediation Candidates

These should be remediated before individual surface work:

- PCC shell visual hierarchy and SharePoint host fit.
- Navigation IA and status-aware surfacing.
- Project context and surface header standard.
- Bento/grid/card primitive hierarchy.
- Preview/read-only/degraded state model.
- Disabled-control reason and next-step pattern.
- Responsive/container behavior and footprint constraints.
- Token/spacing/color/typography discipline.

## Surface-Specific Remediation Candidates

These should occur after shared primitives are stabilized:

- Project Home.
- Team & Access.
- Documents.
- Project Readiness.
- Site Health.
- Control Center Settings.
- Approvals.
- External Systems.

## Hidden States / Panels / Dialogs to Discover Locally

Prompt 01 and subsequent prompts must search for:

- dialogs,
- drawers,
- panels,
- popovers,
- hidden preview states,
- degraded/empty/error states,
- disabled controls,
- status badges,
- read-only controls,
- permission-based content,
- mobile/container-specific alternate layouts.

Do not assume the list in this package is exhaustive.
