# 02 — Source Ownership Map

Use this map to avoid broad rediscovery.

## Shell and App Ownership

| Concern | Known Owner |
|---|---|
| Top-level PCC app composition | `apps/project-control-center/src/PccApp.tsx` |
| Shell frame | `apps/project-control-center/src/shell/PccShell.tsx` |
| Shell CSS / host fit | `apps/project-control-center/src/shell/PccShell.module.css` |
| Current vertical rail | `apps/project-control-center/src/shell/PccNavigationRail.tsx` |
| Current vertical rail CSS | `apps/project-control-center/src/shell/PccNavigationRail.module.css` |
| Current header | `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx` |
| Current header CSS | `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css` |
| Command/search | `apps/project-control-center/src/shell/PccCommandSearch.tsx` |
| Surface router | `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` |
| Shell state | `apps/project-control-center/src/state/usePccShellState.ts` |
| Project placeholder data | `apps/project-control-center/src/preview/projectPlaceholder.ts` |

## Layout Ownership

| Concern | Known Owner |
|---|---|
| Responsive modes and spans | `apps/project-control-center/src/layout/footprints.ts` |
| Container width observation | `apps/project-control-center/src/layout/useContainerBreakpoint.ts` |
| Bento grid | `apps/project-control-center/src/layout/PccBentoGrid.tsx` |
| Bento grid CSS | `apps/project-control-center/src/layout/PccBentoGrid.module.css` |
| Dashboard card | `apps/project-control-center/src/layout/PccDashboardCard.tsx` |
| Dashboard card CSS | `apps/project-control-center/src/layout/PccDashboardCard.module.css` |
| Row-span measurement | `apps/project-control-center/src/layout/useBentoRowSpan.ts` |

## Project Home Ownership

| Concern | Known Owner |
|---|---|
| Project Home order | `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx` |
| Project Intelligence card | `apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx` |
| Priority Actions card | `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx` |
| Read-model content path | `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx` |

## Test Ownership

| Concern | Known Tests |
|---|---|
| Shell navigation | `apps/project-control-center/src/tests/PccShell.navigation.test.tsx` |
| Shell responsive modes | `apps/project-control-center/src/tests/PccShell.responsive.test.tsx` |
| Shell state | `apps/project-control-center/src/tests/usePccShellState.test.ts` |
| Bento integration | `apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx` |
| Opt-in read model | `apps/project-control-center/src/tests/PccApp.optIn.test.tsx` |
| Footprints | `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx` |
| Header/context | `apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx` |
| Import/runtime guards | `apps/project-control-center/src/tests/pcc-import-guards.test.ts` |
| API dormancy | `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` |

## Target New Files

| Target | New File |
|---|---|
| Horizontal tabs | `apps/project-control-center/src/shell/PccHorizontalTabs.tsx` |
| Horizontal tabs CSS | `apps/project-control-center/src/shell/PccHorizontalTabs.module.css` |
| Horizontal tabs test | `apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx` |
| Project Hero Band | `apps/project-control-center/src/shell/PccProjectHeroBand.tsx` |
| Project Hero Band CSS | `apps/project-control-center/src/shell/PccProjectHeroBand.module.css` |
| Project Hero Band test | `apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx` |

## Context-Efficient Use

Each prompt may rely on this map. The agent should not rediscover this ownership with broad search unless a path is missing, renamed, or validation fails.
