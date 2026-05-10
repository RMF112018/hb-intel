# Phase 06 Complete Implementation Plan

## Objective

Implement Phase 06 for the PCC SPFx application by introducing typed span overrides, intentional dashboard card choreography, and a project-specific analytics preview system using direct `echarts`. The result should materially improve Project Home and dashboard visual rhythm, eliminate stranded horizontal grid gaps, provide previewable analytics cards across current primary dashboards, preserve read-only/no-writeback boundaries, and document post-MVP stage/lifecycle-aware Project Home context.

## Current Repo-Truth Baseline

The implementation plan assumes the current PCC app has:

- SPFx app root: `apps/project-control-center`.
- Current primary navigation registry: `packages/models/src/pcc/PccPrimaryNavigation.ts`.
- Current primary tabs:
  - `project-home`
  - `core-tools`
  - `documents`
  - `estimating-preconstruction`
  - `startup-closeout`
  - `project-controls`
  - `cost-time`
  - `systems-administration`
- Current shell active surface ownership on `main[role="tabpanel"]`.
- Current Project Home no longer rendering `Project Intelligence` as a bento card.
- Current Project Home order still not matching Phase 06 target order.
- Current global footprint system only supports `footprint`, not dashboard-specific span overrides.
- Current analytics system not yet implemented.
- Current package solution and feature versions at `1.0.0.215`.

## Closed Decisions

| ID | Decision | Final Direction |
|---|---|---|
| D-01 | Chart package | Use direct `echarts` only for MVP. |
| D-02 | `echarts-for-react` | Do not install for MVP. Add TODO to evaluate post-MVP only if it materially improves UI/UX or maintainability. |
| D-03 | Dependency install | User installs `echarts`; local agent must not install dependencies. |
| D-04 | Analytics placement | Sprinkle analytics cards throughout dashboards near related operational cards where possible. |
| D-05 | Analytics preview/degraded state | Render a preview visualization using deterministic sample project data and product-grade explanatory copy. |
| D-06 | Span override scope | Dashboard-specific typed overrides only; do not mutate global footprint defaults. |
| D-07 | Lifecycle/HBI/Procore placement | Move below first operational fold where they create visual imbalance. |
| D-08 | Gateway behavior | Selectable preview/read-only modules may be opened, with visible preview/read-only/no-writeback copy. |
| D-09 | SPFx versioning | Runtime/dependency/package changes require solution and feature version bump from `1.0.0.215` to `1.0.0.216`, unless user says otherwise. |
| D-10 | Animation default | Animation on by default, centrally configurable, reduced-motion aware, and deterministic where tests require it. |
| D-11 | Project Readiness Project Home gateway | Use `startup-center` for MVP with label `Open Startup Center`. Do not imply a dedicated `project-readiness` module exists. |
| D-12 | Recent Activity gateway | Preview-only/disabled for MVP unless a real module exists. Use visible reason copy. |
| D-13 | Mock data | Deterministic sample data only; no random render-time values. |
| D-14 | UI copy | All visible copy must be end-user/product-grade. No developer copy, no `TODO`, no `dummy`, no `mock chart`. |
| D-15 | Stage/lifecycle-aware TODOs | Add comprehensive non-UI TODO documentation for post-MVP implementation aligned to Product Architecture / User Journey Blueprint. |

## Target File Change Map

### Create

```text
apps/project-control-center/src/analytics/
  PccAnalyticsCard.tsx
  PccAnalyticsCard.module.css
  PccEchartsCanvas.tsx
  PccEchartsCanvas.module.css
  pccAnalyticsA11y.ts
  pccAnalyticsFixtures.ts
  pccAnalyticsOptions.ts
  pccAnalyticsTheme.ts
  pccAnalyticsTypes.ts
  pccAnalyticsViewModels.ts
  index.ts

apps/project-control-center/src/layout/
  pccDashboardComposition.ts

apps/project-control-center/src/tests/
  PccProjectHome.phase06Composition.test.tsx
  PccProjectHomeGatewayActions.test.tsx
  PccDashboardAnalyticsCards.test.tsx
  PccAnalyticsPreviewStates.test.tsx

apps/project-control-center/src/analytics/
  PccEchartsCanvas.test.tsx
  PccAnalyticsCard.test.tsx

apps/project-control-center/src/layout/
  PccDashboardCard.spanOverrides.test.tsx
  pccDashboardComposition.test.ts
```

### Modify

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/*.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccSurfaceNoDuplicateHeader.test.tsx
apps/project-control-center/config/package-solution.json
```

### Do Not Modify Unless Required

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
```

These files may be read and referenced. They should only be modified if repo-truth proves a narrow change is required and the agent explains why.

## Span Override Contract

### Public type

```ts
export type PccCardSpanOverrides = Partial<Record<PccResponsiveMode, number>>;
```

### `PccDashboardCard` prop

```ts
spanOverrides?: PccCardSpanOverrides;
```

### Resolution rule

1. Resolve base span from `footprint`.
2. If `spanOverrides[mode]` exists, use it.
3. Clamp to `1..columns`.
4. Preserve existing footprint-based `minInlineSize` behavior.
5. Emit:
   - `data-pcc-column-span`
   - `data-pcc-span-source="footprint" | "override"`
   - `data-pcc-span-override-mode="<mode>"` when override is used.

### Non-goals

- Do not create masonry layout.
- Do not use dense grid packing.
- Do not globally change `FOOTPRINT_COLUMN_SPANS` to solve Project Home only.

## Project Home Target Choreography

### Target order

```text
Priority Actions
Site Health Summary
Document Control Center
Project Readiness
Approvals & Checkpoints
Missing Configurations
External Platforms
Team Snapshot
Recent Activity
```

### Span matrix

| Card | 12-col span | 10-col span | Tablet / Phone |
|---|---:|---:|---|
| Priority Actions | 5 | 4 | full available width |
| Site Health Summary | 3 | 3 | full available width |
| Document Control Center | 4 | 3 | full available width |
| Project Readiness | 4 | 4 | full available width |
| Approvals & Checkpoints | 4 | 3 | full available width |
| Missing Configurations | 4 | 3 | full available width |
| External Platforms | 4 | 3 | full available width |
| Team Snapshot | 3 | 3 | full available width |
| Recent Activity | 5 | 4 | full available width |

### Desktop rows

```text
Row 1: 5 + 3 + 4
Row 2: 4 + 4 + 4
Row 3: 4 + 3 + 5
```

### Standard laptop rows

```text
Row 1: 4 + 3 + 3
Row 2: 4 + 3 + 3
Row 3: 3 + 3 + 4
```

## Project Home Gateway Mapping

| Card | Gateway label | Module ID / Behavior |
|---|---|---|
| Priority Actions | Open Action Center | `action-center` |
| Site Health Summary | Open Site Health | `site-health` |
| Document Control Center | Open Document Control | `document-control-center` |
| Project Readiness | Open Startup Center | `startup-center` |
| Approvals & Checkpoints | Open Approvals | `approvals-checkpoints` |
| Missing Configurations | Open Settings | `control-center-settings` |
| External Platforms | Open External Platforms | `external-platforms` |
| Team Snapshot | Open Team & Access | `team-access` |
| Recent Activity | View Activity Context | disabled/preview-only until a real activity module exists |

## Analytics Architecture

### MVP dependency

Use direct `echarts`.

### Required wrapper components

`PccEchartsCanvas` owns:

- ECharts initialization/disposal.
- Modular registration of only required charts/components/renderers where practical.
- Responsive resize behavior.
- Reduced-motion behavior.
- `setOption` application.
- degraded/empty/preview rendering.
- deterministic test markers.
- chart summary/fallback linkage.

`PccAnalyticsCard` owns:

- `PccDashboardCard` composition.
- title/eyebrow/summary/source cue.
- chart canvas.
- fallback summary/list.
- preview/degraded state explanation.
- optional gateway action.
- span overrides.

### Renderer

Default to SVG renderer for crisp dashboard cards unless repo testing proves Canvas is materially better. Keep renderer configurable in the wrapper.

### Reduced motion

Use `window.matchMedia('(prefers-reduced-motion: reduce)')` and disable ECharts animation when true. Tests must be able to force animation disabled.

### Preview/degraded state

Every preview/degraded analytics card should still render a chart using deterministic sample project data. Visible copy must be product-grade:

```text
Preview analytics · sample project data
```

Acceptable explanatory copy:

```text
This preview uses deterministic sample project data until the source read model is connected.
```

Prohibited visible copy:

```text
TODO
Mock chart
Dummy data
Developer preview
Fake data
```

## Analytics Card Inventory

### Project Home

| Card | Related Operational Content | Chart Type | Placement |
|---|---|---|---|
| Action Exposure Mix | Priority Actions | donut or stacked horizontal bar | near Priority Actions / early first or second fold |
| Readiness / Approval Rollup | Project Readiness, Approvals, Missing Configs | grouped bar or compact progress bars | adjacent to readiness/approvals row |
| Project Health Trend | Site Health Summary | line / area / sparkline | near Site Health or after first operational fold |

### Documents

| Card | Related Operational Content | Chart Type | Placement |
|---|---|---|---|
| Document Source Health Matrix | document source cards | stacked bar or matrix-style grid | beside/after source cards |
| Document Readiness by Lane | SharePoint / OneDrive / External systems | grouped bar | near lane cards |
| Expiring / Stale / Missing Documents Preview | document status/reference cards | line or bar | after source posture cards |

### Core Tools

| Card | Related Operational Content | Chart Type | Placement |
|---|---|---|---|
| Module Availability Mix | module status cards | donut or bar | near module overview |
| Access & Responsibility Coverage | Team & Access, Directory | stacked bar | near access/team cards |

### Estimating & Preconstruction

| Card | Related Operational Content | Chart Type | Placement |
|---|---|---|---|
| Handoff Continuity Preview | Preconstruction Handoff | progress / stacked bar | near handoff module card |
| Estimate Exposure Preview | Assumptions / Alternates / Exclusions | waterfall or grouped bar | near estimate context module cards |

### Startup & Closeout

| Card | Related Operational Content | Chart Type | Placement |
|---|---|---|---|
| Startup Readiness Completion | Startup Center | progress / grouped bar | near Startup Center |
| Closeout & Warranty Readiness | Closeout / Warranty | stacked bar | near closeout module cards |
| Responsibility Coverage | Responsibility Matrix | matrix/progress bar | near responsibility module card |

### Project Controls

| Card | Related Operational Content | Chart Type | Placement |
|---|---|---|---|
| Constraints Aging | Constraints Log | histogram / stacked bar | near Constraints Log |
| Permit / Inspection Readiness | Permits & Inspections | grouped bar | near permits/inspections |
| Risk / Issue Severity Distribution | Risk / Issues / Decisions | donut or stacked bar | near risk/issues cards |

### Cost & Time

| Card | Related Operational Content | Chart Type | Placement |
|---|---|---|---|
| Schedule Milestone Posture | Schedule Monitor | line / milestone bar | near schedule card |
| Procurement / Buyout Exposure | Procurement & Buyout | bar / waterfall | near procurement/buyout |
| Commitment / Cost Exposure Preview | Commitment / Cost Exposure | bar | near cost exposure card |

### Systems Administration

| Card | Related Operational Content | Chart Type | Placement |
|---|---|---|---|
| Integration Health Summary | External systems / integration settings | donut or stacked bar | near integration settings |
| Configuration Severity | Missing/module configuration | stacked bar | near configuration cards |
| Procore Mapping / Sync Posture | Procore mapping/sync health | status bar / gauge-like bar | near Procore mapping card |

## Stage/Lifecycle-Aware TODO Documentation

Add non-UI TODOs to relevant composition/view-model files. Do not render TODO text in the UI.

Required TODO content must cover:

- stage-aware Project Home context;
- lifecycle-aware navigation;
- role/persona emphasis;
- current project stage;
- project lifecycle signals;
- source-backed readiness;
- card priority and analytics emphasis;
- gateway recommendation changes;
- future alignment to Product Architecture / User Journey Blueprint;
- no live writeback unless future contract authorizes command-model behavior.

Example:

```ts
// TODO(post-mvp): Implement stage/lifecycle-aware Project Home context using
// the PCC Product Architecture and User Journey Blueprint as the governing
// reference. Project Home should adjust card priority, analytics emphasis,
// gateway recommendations, and command context based on project stage,
// lifecycle signals, role/persona, and source-backed project readiness.
// This must remain read-model driven until a future command-model contract
// authorizes workflow execution or source-system writeback.
```

## Testing Acceptance Criteria

Phase 06 tests must prove:

- span override type, clamp, markers, and base footprint fallback;
- no dense grid auto-flow;
- Project Home target card order;
- Project Home target span rows at 12-column and 10-column modes;
- analytics cards render by dashboard;
- preview/degraded analytics render charts and product-grade sample-data explanation;
- chart accessibility summaries exist;
- reduced-motion disables chart animation;
- gateways are visible and truthful;
- disabled gateway reasons are visible;
- direct-child bento invariant remains intact;
- no card-level active surface panel marker is reintroduced.

## Playwright Evidence Acceptance Criteria

Evidence must include:

- Project Home standard laptop, desktop, ultrawide.
- Project Home analytics cards visible.
- Each dashboard with analytics cards visible.
- Preview/degraded analytics explanation visible.
- No horizontal overflow.
- No duplicate Project Intelligence card.
- No false affordance on disabled gateway actions.
- No clipped analytics card content.
- Keyboard / focus path for gateway actions.
- Axe or existing accessibility evidence where available.

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```
