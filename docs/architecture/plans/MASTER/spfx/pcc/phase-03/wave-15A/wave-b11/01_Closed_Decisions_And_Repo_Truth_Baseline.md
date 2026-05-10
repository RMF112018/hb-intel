# Closed Decisions and Repo-Truth Baseline

## Closed Decisions

| Topic | Final Decision |
|---|---|
| ECharts package | Use direct `echarts` for MVP. |
| React wrapper package | Do not add `echarts-for-react` for MVP. |
| Post-MVP wrapper TODO | Add TODO to evaluate `echarts-for-react` only if it materially improves UI/UX, lifecycle handling, animation, responsiveness, accessibility, or maintainability. |
| Dependency install | User installs `echarts`; local agent does not install dependencies. |
| Lockfile change | `pnpm-lock.yaml` change caused by user-installed `echarts` is intentional and must be documented, not reverted. |
| Analytics placement | Analytics cards should be sprinkled through dashboards near related operational cards where feasible. |
| Analytics preview/degraded state | Render deterministic sample-data visualizations with clear product-grade preview explanation. |
| Span overrides | Dashboard-specific typed overrides only. |
| Global footprints | Do not mutate global footprint defaults for dashboard-specific composition. |
| Project Home first-fold | First nine operational cards take precedence over lifecycle/HBI/deep-detail sections. |
| Lifecycle/HBI/Procore detail | Move below first operational fold where necessary. |
| Gateway actions | Add truthful card-level gateway actions. |
| Project Readiness gateway | Use `startup-center` with label `Open Startup Center` for MVP. |
| Recent Activity gateway | Use disabled/preview-only action unless a real module exists. |
| SPFx version | Bump solution and feature versions from `1.0.0.215` to `1.0.0.216` unless user says otherwise. |
| Animation | Enabled by default; reduced-motion aware; centrally configurable. |
| TODO documentation | Add comprehensive post-MVP stage/lifecycle TODOs in code comments or docs, not visible UI. |

## Repo-Truth Baseline To Reconfirm

The local agent must reconfirm before editing:

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
packages/models/src/pcc/PccPrimaryNavigation.ts
apps/project-control-center/config/package-solution.json
```

## Current Primary Navigation Model

Current primary tab IDs expected from repo truth:

```text
project-home
core-tools
documents
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Do not implement analytics against older surface names if current repo truth has the Phase 05 grouped primary-tab model.

## Current Project Home Gap

Current Project Home already removed `Project Intelligence`, but still needs:

- target Phase 06 order;
- target span choreography;
- gateway actions;
- analytics cards;
- read-model path alignment.

## Current Layout Gap

Current `PccDashboardCard` resolves spans from footprint only. Phase 06 must add typed `spanOverrides`.

## Current Analytics Gap

No current PCC-owned ECharts analytics wrapper exists. Phase 06 creates it.

## Current Evidence Gap

Existing tests cover direct-child, no duplicate header, and footprint basics. Phase 06 must add tests and Playwright evidence for:

- exact target rows;
- analytics render;
- preview/degraded visualization state;
- no horizontal overflow;
- accessible fallback summaries;
- gateway behavior.
