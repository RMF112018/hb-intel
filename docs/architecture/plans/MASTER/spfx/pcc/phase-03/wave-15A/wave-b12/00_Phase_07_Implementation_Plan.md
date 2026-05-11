# PCC Phase 07 Implementation Plan — Cross-Surface Operational Realignment and Phase 05 Remediation

**Application:** HB Intel Project Control Center  
**Repo:** `RMF112018/hb-intel`  
**Primary app path:** `apps/project-control-center`  
**Phase:** Phase 07  
**Plan status:** Ready for developer execution  
**Decision posture:** No open decisions  
**Generated for:** Bobby / HB  
**Current live baseline:** PCC `1.0.0.218` following Phase 06 evidence closeout  

---

## 1. Objective

Phase 07 converts the non-Project Home PCC primary dashboards from generic status/reporting pages into operational work surfaces that align with the PCC Basis of Design.

The phase also includes a required Phase 05 remediation: remove the redundant top-level bento cards that returned on the shared primary-dashboard pages and permanently block their reintroduction through explicit regression tests.

Affected shared primary-dashboard pages:

1. `Core Tools`
2. `Estimating & Preconstruction`
3. `Project Startup & Closeout`
4. `Project Controls`
5. `Cost & Time`
6. `Systems Administration`

Preserved/non-remediation surfaces:

1. `Project Home`
2. `Document Control`

Project Home already has Phase 06 operational choreography, gateway behavior, analytics, and live evidence. Document Control already has a specialized three-lane surface and should not be forced into the shared dashboard implementation during Phase 07.

---

## 2. Current Baseline and Evidence

### 2.1 Current live package baseline

Use this as the Phase 07 starting assumption unless repo-truth preflight proves otherwise:

```text
PCC package posture: 1.0.0.218 / 1.0.0.218
solution.version: 1.0.0.218
solution.features[0].version: 1.0.0.218
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
```

### 2.2 Phase 06 evidence commits

Phase 07 must treat the following commits as the governing Phase 06 evidence baseline:

```text
4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a
e6886489bb4f85d32840f69914dfb3b615f28aaf
```

### 2.3 Phase 06 evidence root

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/
docs/architecture/evidence/pcc-live/surface-smoke-1778491135146/
```

### 2.4 Phase 06 live evidence facts to preserve or intentionally update

The Phase 06 evidence established:

| Surface | Phase 06 live card count | Phase 07 expected posture |
|---|---:|---|
| `project-home` | 18 live read-model cards | Preserve. Do not include in shared-dashboard remediation. |
| `core-tools` | 3 | Intentional change expected. Remove duplicate top card. |
| `documents` | 5 | Preserve specialized surface. No shared-dashboard refactor. |
| `estimating-preconstruction` | 5 | Intentional change expected. Remove duplicate top card. |
| `startup-closeout` | 6 | Intentional change expected. Remove duplicate top card. |
| `project-controls` | 6 | Intentional change expected. Remove duplicate top card. |
| `cost-time` | 6 | Intentional change expected. Remove duplicate top card while preserving Sage cue. |
| `systems-administration` | 6 | Intentional change expected. Remove duplicate top card. |

Phase 06 evidence also confirmed:

- 8/8 surfaces passed live surface smoke.
- Total live card count was 55.
- Console errors: 0.
- Page errors: 1.
- Active surface ownership was shell-owned on `main[role="tabpanel"]`.
- No card-level `data-pcc-active-surface-panel`.
- No nested `[data-pcc-card]`.
- No `Project Intelligence` regression.
- Project Home gateway actions were buttons, not anchors.
- Phase 06 analytics rendered on the live tenant.

### 2.5 Evidence caveat

The one observed page error in Phase 06 evidence is a carry-forward evidence caveat. Phase 07 should not treat it as a blocker unless it reproduces or maps to a PCC defect. Phase 07 must not claim Phase 08 scorecard readiness or full accessibility closeout.

---

## 3. Governing Product and Technical Decisions

These decisions are closed.

### D-07-01 — Phase 07 includes Phase 05 remediation

Phase 7 must explicitly remediate the Phase 5 regression where the six shared primary-dashboard pages regained redundant top-level bento cards.

### D-07-02 — Shared-dashboard top cards must be removed

The following generic card pattern must be removed from `PccPrimaryDashboardSurface`:

```tsx
<PccDashboardCard
  footprint="hero"
  hierarchy="primary"
  tier="tier1"
  region="command"
  eyebrow="Dashboard"
  title={tab.dashboardTitle}
>
  <p>{tab.dashboardDescription}</p>
  ...
</PccDashboardCard>
```

This card is a duplicate surface title/description card. Surface identity belongs in the shell hero/header, not the bento grid.

### D-07-03 — Reintroduction must be blocked by tests

Phase 07 must add regression tests that fail if any of the six shared primary dashboards reintroduces a top-level surface title card.

### D-07-04 — Project Home is preserved

Do not change Project Home card order, gateway behavior, analytics, read-model path, or Phase 06 row-sum choreography unless a direct compile/test failure requires a minimal compatibility adjustment.

### D-07-05 — Document Control is preserved

Do not move `documents` into the shared primary-dashboard surface. Document Control remains owned by `PccDocumentsSurface`.

### D-07-06 — Current Phase 05 grouped primary-tab model remains the runtime model

Phase 07 uses the current runtime primary tabs:

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

Do not revert to the older eight-work-center tab model.

### D-07-07 — Operational content starts each shared dashboard

After Phase 07, the first direct bento card on each affected shared primary dashboard must be operational content, not a title/description card.

### D-07-08 — Preserve Phase 06 analytics

The Phase 06 analytics cards must remain present on applicable tabs:

| Tab | Analytics cards to preserve |
|---|---|
| `estimating-preconstruction` | Handoff Continuity Preview; Estimate Exposure Preview |
| `startup-closeout` | Startup Readiness Completion; Responsibility Coverage; Closeout & Warranty Readiness |
| `project-controls` | Constraints Aging; Permit / Inspection Readiness; Risk / Issue Severity Distribution |
| `cost-time` | Schedule Milestone Posture; Procurement / Buyout Exposure; Commitment / Cost Exposure Preview |
| `systems-administration` | Integration Health Summary; Configuration Severity; Procore Mapping / Sync Posture |
| `core-tools` | No analytics in Phase 07 unless separately authorized |

### D-07-09 — Cost & Time Sage cue is preserved

The Sage book-of-record cue remains required and scoped only to `cost-time`:

```text
Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.
```

It must be moved out of the generic top-level dashboard card and into an operational governance/source cue card or within a Cost & Time operational first-card body.

### D-07-10 — No dependency changes

Do not install dependencies. Do not add `echarts-for-react`. Preserve the current direct ECharts implementation.

### D-07-11 — No command-model behavior

Phase 07 remains read-only/preview/no-writeback. It must not introduce:

- source-system mutation;
- SharePoint writeback;
- Procore writeback;
- Sage writeback;
- approval execution;
- sync execution;
- autonomous HBI decisioning;
- command-model actions.

### D-07-12 — Card count drift is intentional and must be documented

Removing the shared top card will change card counts on the six affected pages unless replacement operational cards are introduced. Phase 07 must update tests and evidence expectations accordingly.

### D-07-13 — Developer copy is prohibited in UI

Do not render developer-facing terms in end-user UI:

```text
todo
tbd
placeholder
stub
mock
fixture
debug
dev-only
not implemented
developer
code agent
prompt
repo
test selector
internal only
coming soon
```

Source comments and test names may contain implementation terminology only where appropriate.

---

## 4. Current Problem Statement

### 4.1 Current implementation issue

`PccPrimaryDashboardSurface` currently emits a generic top-level `Dashboard` card before `Module status`, analytics, and selected-module content. Because `PccPrimaryDashboardSurface` is shared by six pages, the regression appears on all six shared primary dashboards.

Current affected card structure:

```text
Generic Dashboard card
  ↓
Module status
  ↓
Analytics cards, where applicable
  ↓
Selected module
```

Target Phase 07 structure:

```text
Operational surface card / queue / module gateway summary
  ↓
Module status or module gateway matrix
  ↓
Analytics cards, where applicable
  ↓
Selected module / source-governance card
```

### 4.2 Why this matters

The Basis of Design requires the bento grid to contain working operational content, not duplicate identity cards. Surface identity, title, description, and broad surface context belong in the shell hero/header.

The redundant cards undermine:

- command-center hierarchy;
- first-fold density;
- user task orientation;
- Phase 05 intent;
- Phase 06 card choreography consistency;
- future scorecard posture under layout, workflow, and command-center clarity pillars.

---

## 5. Target Surface Matrix

### 5.1 Current-to-target card counts

The target counts below are closed for Phase 07. These counts intentionally remove the redundant top-level card. They do not add replacement cards unless needed for a specific surface rule.

| Surface | Current live count | Phase 07 target count | Reason |
|---|---:|---:|---|
| `core-tools` | 3 | 2 | Remove generic Dashboard card. Keep Module status + Selected module. |
| `estimating-preconstruction` | 5 | 4 | Remove generic Dashboard card. Keep Module status + 2 analytics + Selected module. |
| `startup-closeout` | 6 | 5 | Remove generic Dashboard card. Keep Module status + 3 analytics + Selected module. |
| `project-controls` | 6 | 5 | Remove generic Dashboard card. Keep Module status + 3 analytics + Selected module. |
| `cost-time` | 6 | 5 | Remove generic Dashboard card. Keep Module status + 3 analytics + Selected module; preserve Sage cue in Module status or selected-module area. |
| `systems-administration` | 6 | 5 | Remove generic Dashboard card. Keep Module status + 3 analytics + Selected module. |
| `documents` | 5 | 5 | Preserve specialized Document Control surface. |
| `project-home` | 18 read-model / 12 fixture | unchanged | Preserve Phase 06. |

### 5.2 Target first direct bento card by surface

The first direct bento card titles are closed:

| Surface | First direct bento card after Phase 07 |
|---|---|
| `core-tools` | `Module status` |
| `estimating-preconstruction` | `Module status` |
| `startup-closeout` | `Module status` |
| `project-controls` | `Module status` |
| `cost-time` | `Module status` |
| `systems-administration` | `Module status` |

Rationale: Phase 07’s primary required remediation is removal/blocking of the redundant top card. The existing `Module status` card already provides operational module state, summary, selectability, and preview/deferred context without introducing a new component system. Further operational card specialization can occur in a later phase after Phase 07 locks the regression.

### 5.3 Prohibited first-card titles on shared dashboards

The first direct bento card on the six affected surfaces must never be:

```text
Core Tools
Estimating & Preconstruction
Project Startup & Closeout
Project Controls
Cost & Time
Systems Administration
Dashboard
```

### 5.4 Prohibited first-card patterns

Tests must fail if the first direct bento card on the six affected surfaces has any of the following markers or content pattern:

```text
eyebrow: Dashboard
title: tab.dashboardTitle
footprint: hero
hierarchy: primary
tier: tier1
region: command
body: tab.dashboardDescription as primary body copy
```

The existence of `tier1` or `hierarchy=primary` is not globally prohibited in the application. It is prohibited only when used as a generic top-level surface identity card on these shared dashboards.

---

## 6. Target Composition by Surface

### 6.1 Core Tools

Target order:

```text
1. Module status
2. Selected module
```

Target content:

- HBI Assistant
- External Platforms
- Team & Access
- Project Directory
- Approvals & Checkpoints

Rules:

- Preserve module status row markers.
- Preserve HBI advisory/no-decision/no-approval/no-writeback cue when selected.
- Preserve launch-only/no-writeback cue for External Platforms.
- No analytics are added in Phase 07.

### 6.2 Estimating & Preconstruction

Target order:

```text
1. Module status
2. Handoff Continuity Preview
3. Estimate Exposure Preview
4. Selected module
```

Rules:

- Preserve both Phase 06 analytics cards.
- Preserve preview/sample data disclosure.
- Preserve deferred module state for current estimating modules.
- No new estimating workflow execution.

### 6.3 Project Startup & Closeout

Target order:

```text
1. Module status
2. Startup Readiness Completion
3. Responsibility Coverage
4. Closeout & Warranty Readiness
5. Selected module
```

Rules:

- Preserve all three Phase 06 analytics cards.
- Preserve visible preview/deferred states for closeout, turnover, warranty, lessons learned, and subcontractor performance modules.
- No workflow execution or approval behavior.

### 6.4 Project Controls

Target order:

```text
1. Module status
2. Constraints Aging
3. Permit / Inspection Readiness
4. Risk / Issue Severity Distribution
5. Selected module
```

Rules:

- Preserve all three Phase 06 analytics cards.
- Preserve constraints and permit/inspection preview posture.
- Do not introduce claims-handling, delay-analysis, or formal change-management workflow execution.

### 6.5 Cost & Time

Target order:

```text
1. Module status
2. Schedule Milestone Posture
3. Procurement / Buyout Exposure
4. Commitment / Cost Exposure Preview
5. Selected module
```

Rules:

- Preserve all three Phase 06 analytics cards.
- Preserve Sage book-of-record cue.
- Move Sage cue into one of the following approved locations:
  1. the `Module status` card footer, scoped by `data-pcc-dashboard-book-of-record="cost-time"`; or
  2. a Cost & Time-specific governance paragraph in the selected-module card when no module is selected.

Closed implementation direction: use option 1. Place the Sage cue as a footer/paragraph inside the `Module status` card only when `activePrimaryTabId === 'cost-time'`. Preserve the existing marker:

```text
data-pcc-dashboard-book-of-record="cost-time"
```

### 6.6 Systems Administration

Target order:

```text
1. Module status
2. Integration Health Summary
3. Configuration Severity
4. Procore Mapping / Sync Posture
5. Selected module
```

Rules:

- Preserve all three Phase 06 analytics cards.
- Preserve Procore mapping/sync posture as context-only.
- No Procore writeback, sync, repair execution, or mapping mutation.

### 6.7 Documents

Target order remains owned by `PccDocumentsSurface`.

Rules:

- Do not alter Document Control composition except for test compatibility if global helper changes require it.
- Preserve source-unavailable state card behavior.
- Preserve three-lane document model.
- Preserve no-writeback posture.

### 6.8 Project Home

Rules:

- Preserve Phase 06 operational spine and analytics.
- Preserve live evidence expectations unless unrelated tests require updated shared helpers.
- Do not change Project Home card order.
- Do not change Project Home gateway button semantics.
- Do not change Project Home row-sum choreography.
- Do not reintroduce `Project Intelligence`.

---

## 7. Implementation Approach

### 7.1 Minimal-risk architecture

Use a minimal refactor in `PccPrimaryDashboardSurface`:

1. Remove the generic top-level `PccDashboardCard`.
2. Keep the existing `Module status` card as the first card.
3. Move Cost & Time book-of-record cue into the `Module status` card.
4. Preserve `renderPrimaryDashboardAnalytics`.
5. Preserve selected-module card behavior.
6. Update card-count tests.
7. Add anti-regression tests.

This approach is preferred because it fixes the Phase 05 regression without destabilizing Phase 06 analytics, Project Home, Document Control, shell state, or ECharts.

### 7.2 Files expected to change

Likely source file:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
```

Likely test files:

```text
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
```

Likely per-surface analytics test files to update where card counts/order are asserted:

```text
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx
```

New recommended test file:

```text
apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
```

Optional docs closeout path if developer is asked to document Phase 07 implementation:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b12/
```

Do not edit these unless necessary:

```text
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/analytics/
packages/models/src/pcc/PccPrimaryNavigation.ts
packages/ui-kit/src/HbcChart/EChartsRenderer.tsx
```

---

## 8. Detailed Execution Sequence

### Step 00 — Preflight repo-truth gate

Run and record:

```bash
git status --short
git log --oneline -10
git merge-base HEAD main
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
cat apps/project-control-center/config/package-solution.json
```

Confirm:

- current branch is based on the latest intended `main`;
- Phase 06 evidence commits are present or reachable:
  - `4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a`
  - `e6886489bb4f85d32840f69914dfb3b615f28aaf`
- `pnpm-lock.yaml` md5 starts as `7c19ccfa8718a42f7f55ce178a626996`;
- package version is `1.0.0.218`.

Do not re-read files already in current context unless needed to verify drift.

### Step 01 — Add failing anti-regression tests

Create or update tests to prove the current bug before fixing it.

Add `PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx` with coverage for these surfaces:

```text
core-tools
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Assertions:

1. The first direct child card exists.
2. The first direct child card title is `Module status`.
3. The first direct child card title is not the active tab label.
4. The first direct child card title is not `Dashboard`.
5. The first card does not contain the active tab dashboard description.
6. The first card does not have:
   - `data-pcc-card-tier="tier1"`
   - `data-pcc-card-region="command"`
   - `data-pcc-card-hierarchy="primary"`
   when those markers are attached to a generic title/description card.
7. No direct child card with `eyebrow="Dashboard"` and `title={tab.dashboardTitle}` exists.
8. No shared-dashboard surface renders a generic top-level surface identity card anywhere in the bento grid.
9. The shell `main[role="tabpanel"]` remains the only owner of `data-pcc-active-surface-panel`.

Implementation note:

- Query by DOM markers and visible headings, not brittle class names.
- Do not rely only on card count; the regression is content/semantic, not only quantity.

### Step 02 — Remove generic Dashboard card

In `PccPrimaryDashboardSurface.tsx`:

1. Delete the first `PccDashboardCard` that renders:
   - `eyebrow="Dashboard"`
   - `title={tab.dashboardTitle}`
   - `tab.dashboardDescription`
   - `NO_WRITEBACK_POSTURE`
   - optional `postureNote`
2. Keep the `tab` lookup if still needed for future logic; remove unused variables/imports after the deletion.
3. Keep `modules`, `contextModule`, and `postureNote` if needed for Cost & Time cue relocation.
4. Preserve `renderPrimaryDashboardAnalytics`.
5. Preserve selected-module behavior.

### Step 03 — Relocate Cost & Time Sage cue

Inside the existing `Module status` card:

- After the `<dl>` list, render the existing `postureNote` only when present.
- Keep the marker:

```tsx
data-pcc-dashboard-book-of-record={activePrimaryTabId}
```

Expected behavior:

- `cost-time` renders the Sage book-of-record paragraph inside `Module status`.
- No other tab renders `data-pcc-dashboard-book-of-record`.

### Step 04 — Preserve no-writeback posture

Do not reinsert the deleted generic `NO_WRITEBACK_POSTURE` card.

The shared dashboards already expose no-writeback/source posture through:

- module authority cues in registry data;
- selected-module card;
- launch-only/deferred/read-only copy;
- Cost & Time Sage cue;
- analytics preview/sample/source labels.

If additional general no-writeback copy is required, add it only as compact footer copy within `Module status`, not as a separate generic title card.

Closed direction: do not add a general no-writeback footer in Phase 07. Preserve existing module-level authority cues instead.

### Step 05 — Update shared dashboard card-count tests

Update current shared-dashboard expected counts:

```ts
const EXPECTED_DIRECT_CARD_COUNT_BY_TAB = {
  'core-tools': 2,
  'estimating-preconstruction': 4,
  'startup-closeout': 5,
  'project-controls': 5,
  'cost-time': 5,
  'systems-administration': 5,
}
```

Do not apply this mapping to:

```text
project-home
documents
```

### Step 06 — Update Phase 06 regression coverage

Update `PccPhase06RegressionCoverage.test.tsx` carefully:

- Preserve all Project Home row-sum and gateway tests.
- Preserve no `echarts-for-react` static guard.
- Update only shared-dashboard card-count expectations.
- Preserve zero nested cards.
- Preserve zero card-level active-panel markers.
- Preserve no `Project Intelligence`.
- Preserve developer/TODO UI copy assertions.

Add a comment that Phase 07 intentionally changed shared-dashboard card counts by removing Phase 05-regressed duplicate top cards.

### Step 07 — Update per-surface analytics tests

For each per-tab analytics test file, update direct-card counts and order.

Expected card title orders:

#### Estimating & Preconstruction

```text
Module status
Handoff Continuity Preview
Estimate Exposure Preview
Select a module
```

#### Project Startup & Closeout

```text
Module status
Startup Readiness Completion
Responsibility Coverage
Closeout & Warranty Readiness
Select a module
```

#### Project Controls

```text
Module status
Constraints Aging
Permit / Inspection Readiness
Risk / Issue Severity Distribution
Select a module
```

#### Cost & Time

```text
Module status
Schedule Milestone Posture
Procurement / Buyout Exposure
Commitment / Cost Exposure Preview
Select a module
```

Also assert that the Sage book-of-record marker still renders on `cost-time` only.

#### Systems Administration

```text
Module status
Integration Health Summary
Configuration Severity
Procore Mapping / Sync Posture
Select a module
```

### Step 08 — Run tests locally

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

If tests fail due to expected card counts or outdated descriptive comments, update tests/comments only where they encode old Phase 06 counts for shared dashboards.

### Step 09 — Format and diff checks

Run:

```bash
pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx \
  apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx \
  apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx \
  apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx \
  apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx

git diff --check
```

If a listed test file does not exist in the local repo, do not create a synthetic replacement just to satisfy this path list. Search the current test tree and update the current equivalent file.

### Step 10 — Optional live Playwright update

Phase 07 does not require a full Phase 08 evidence suite, but it should update focused live smoke expectations before closeout if the local agent is authorized to run Playwright.

Recommended focused evidence:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-07-v1.0.0.218-no-redundant-shared-dashboard-cards" \
  pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.phase06-analytics.spec.ts
```

If existing live specs hard-code Phase 06 shared-dashboard card counts, update or create a Phase 07-focused live spec rather than weakening Phase 06 analytics assertions.

Recommended new live spec name:

```text
e2e/pcc-live/pcc-live.phase07-no-redundant-shared-dashboard-cards.spec.ts
```

Live assertions:

- affected six surfaces pass;
- first direct bento card title is `Module status`;
- no generic `Dashboard` card exists;
- shell-owned active panel remains;
- no card-level active panel;
- no nested cards;
- analytics titles still render on applicable surfaces;
- Cost & Time Sage cue still renders;
- Project Home remains unchanged.

---

## 9. Testing Contract

### 9.1 Required unit/component tests

Phase 07 is not complete without tests for:

1. No redundant shared-dashboard top card.
2. First card title is `Module status` on six affected surfaces.
3. No shared dashboard first card has the active tab title.
4. No shared dashboard first card renders `tab.dashboardDescription`.
5. Updated direct-card counts.
6. Analytics still render.
7. Cost & Time Sage cue still renders and remains scoped to `cost-time`.
8. No card-level active-panel marker.
9. No nested cards.
10. No developer copy in rendered UI.
11. Project Home unaffected.
12. Documents unaffected.

### 9.2 Required static search / guard assertions

Add or preserve static guard checks for:

```text
echarts-for-react
Project Intelligence
data-pcc-active-surface-panel on cards
grid-auto-flow: dense
```

Closed direction:

- Do not add `grid-auto-flow: dense`.
- Do not add `echarts-for-react`.
- Do not reintroduce `Project Intelligence`.

### 9.3 Required negative assertions

Tests must fail if any affected shared-dashboard page renders:

```text
Dashboard
Core Tools
Estimating & Preconstruction
Project Startup & Closeout
Project Controls
Cost & Time
Systems Administration
```

as a generic top-level first card heading.

This does not prohibit these terms from appearing in the shell hero, tab labels, or other appropriate navigation locations.

---

## 10. Accessibility and UX Contract

Phase 07 must preserve or improve:

- keyboard navigation;
- tab/tabpanel semantics;
- shell-owned active panel;
- readable card heading hierarchy;
- visible disabled/deferred reasons;
- no color-only status indicators;
- analytics accessible labels;
- analytics text fallback outside the chart;
- no false affordances;
- no horizontal overflow.

Phase 07 must not introduce:

- clickable divs;
- anchors that do not navigate;
- buttons without accessible names;
- disabled actions without reason copy;
- modal/panel behavior;
- new command search interactivity;
- new HBI authority claims.

---

## 11. Source / Authority Copy Bank

Use the following copy exactly or functionally equivalent copy when needed. Do not invent stronger authority claims.

### General PCC read-only posture

```text
Read-only project dashboard. PCC does not write back to source systems from this view.
```

Phase 07 closed direction: do not render this as a standalone top card. Prefer module-level authority cues.

### Preview analytics disclosure

```text
Preview analytics · sample project data
```

```text
This preview uses deterministic sample project data until the source read model is connected.
```

### HBI authority cue

```text
Advisory only. HBI provides context and suggestions; no decisions, no approvals, and no writeback to source systems are performed here.
```

### Launch-only cue

```text
Opens or references the source system. PCC does not write back to that system.
```

### Deferred cue

```text
Not active for the selected project. Planned for a future release.
```

### Sage book-of-record cue

```text
Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.
```

### Procore mapping/sync cue

```text
Mapping and sync-health context only. No writeback to Procore is performed here.
```

---

## 12. Versioning and Dependency Rules

### 12.1 Dependencies

No dependency changes are allowed in Phase 07.

Expected result:

```text
pnpm-lock.yaml md5 before == pnpm-lock.yaml md5 after
```

Expected md5:

```text
7c19ccfa8718a42f7f55ce178a626996
```

If the lockfile changes, the developer must stop and explain why before proceeding.

### 12.2 SPFx package version

Phase 07 changes visible runtime behavior. The developer must report current `package-solution.json` values before and after.

Closed direction:

- If no package/build/deployment closeout is included in the prompt being executed, do not bump the version.
- If the prompt explicitly includes tenant package generation or live Playwright validation against a new deployed package, bump the fourth version segment from `1.0.0.218` to `1.0.0.219` across the relevant SPFx package manifests.

The implementation prompt should tell the developer which path applies. For this plan, the default is **no version bump during code/test remediation**.

---

## 13. Acceptance Criteria

Phase 07 is accepted only when all items below are true.

### 13.1 Phase 05 remediation

- The six shared primary dashboards no longer render the redundant top-level `Dashboard` card.
- The first direct bento card on each affected shared dashboard is `Module status`.
- No affected shared dashboard renders the active tab name as a generic first card.
- No affected shared dashboard renders `tab.dashboardDescription` as the body of a generic first card.
- Tests explicitly fail if the generic top card returns.

### 13.2 Phase 06 preservation

- Project Home card order and row-sum tests remain green.
- Project Home gateway actions remain buttons, not anchors.
- Project Home Recent Activity disabled reason remains visible.
- All Phase 06 analytics cards still render.
- ECharts direct wrapper remains in use.
- No `echarts-for-react` dependency or import appears.
- No `Project Intelligence` card returns.

### 13.3 Surface-specific preservation

- Document Control remains on `PccDocumentsSurface`.
- Cost & Time still renders Sage book-of-record cue.
- Systems Administration Procore mapping/sync posture remains context-only/no-writeback.
- Core Tools HBI selected-module context remains advisory/no-decision/no-approval/no-writeback.

### 13.4 Technical invariants

- No nested cards.
- No card-level active-surface panel marker.
- Shell `main[role="tabpanel"]` remains sole active-panel owner.
- No `grid-auto-flow: dense` introduced.
- No developer copy rendered in UI.
- `check-types` passes.
- Full PCC vitest suite passes.
- Prettier check passes on changed files.
- `git diff --check` passes.

---

## 14. Closeout Report Requirements

The developer’s closeout must include:

```text
Current HEAD
Changed files
SPFx solution.version before/after
SPFx feature.version before/after
pnpm-lock.yaml md5 before/after
Test commands and results
Updated expected card counts
Confirmation redundant top cards removed
Confirmation reintroduction is blocked by tests
Confirmation Project Home preserved
Confirmation Document Control preserved
Confirmation Cost & Time Sage cue preserved
Confirmation no dependency changes
Confirmation no live writeback / command-model behavior introduced
Known limitations
```

Required validation command block:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Optional live validation if authorized:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-07-v1.0.0.218-no-redundant-shared-dashboard-cards" \
  pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.phase07-no-redundant-shared-dashboard-cards.spec.ts
```

---

## 15. Implementation Prompt Map for Later Package Generation

This section is a planning map only. It is not the final prompt package.

### Prompt 01 — Repo-Truth and Evidence Baseline Gate

Purpose:

- Verify main/head/package/lockfile baseline.
- Confirm Phase 06 evidence commits are present.
- Confirm current `PccPrimaryDashboardSurface` still contains the generic Dashboard card.
- No production edits except possibly adding an audit note if authorized.

### Prompt 02 — Phase 05 Remediation Test Harness

Purpose:

- Add failing tests that detect the redundant shared-dashboard top card.
- Add target count/order assertions.
- Add anti-reintroduction tests.

### Prompt 03 — Remove Shared Dashboard Top Cards

Purpose:

- Delete generic top-level `Dashboard` card from `PccPrimaryDashboardSurface`.
- Move Cost & Time Sage cue into `Module status`.
- Preserve all analytics and selected-module behavior.

### Prompt 04 — Update Shared Dashboard Regression Counts

Purpose:

- Update `PccSurfaceRouter.phase05.test.tsx`.
- Update `PccPhase06RegressionCoverage.test.tsx`.
- Update per-surface analytics tests.

### Prompt 05 — Surface-by-Surface Verification

Purpose:

- Verify Core Tools, Estimating, Startup/Closeout, Project Controls, Cost & Time, Systems Administration.
- Confirm first card is `Module status`.
- Confirm analytics preserved where applicable.

### Prompt 06 — Project Home and Documents Preservation Sweep

Purpose:

- Prove Project Home and Documents did not regress.
- Confirm Project Home evidence-critical behavior is unchanged.
- Confirm Document Control remains specialized.

### Prompt 07 — Optional Focused Live Evidence

Purpose:

- Add or update Phase 07 Playwright focused spec.
- Run live evidence only if the environment is authorized and ready.
- Do not claim full scorecard readiness.

### Prompt 08 — Closeout Documentation

Purpose:

- Produce closeout with changed files, tests, lockfile/version posture, evidence caveats, and no-writeback confirmation.

---

## 16. Developer Notes

- Do not solve Phase 07 by adding new decorative cards.
- Do not rename the redundant top card and leave it in place.
- Do not hide the card with CSS.
- Do not move surface identity into a different bento card.
- Do not weaken tests that currently protect Project Home.
- Do not loosen no-developer-copy assertions.
- Do not delete Phase 06 evidence or rewrite evidence history.
- Do not create additional analytics cards in this phase.
- Do not add external libraries.
- Do not change runtime navigation taxonomy.

The success condition is simple and strict: the six shared-dashboard pages must start with operational bento content, not a title/description bento card, and tests must permanently block that regression from returning.

---

## 17. Final Target State

After Phase 07:

```text
Shell hero/header:
  Owns surface identity, title, description, command context.

Shared primary-dashboard bento grid:
  Starts with Module status.
  Preserves analytics where applicable.
  Preserves selected-module context.
  Preserves source/read-only/no-writeback cues.
  Contains no generic top-level surface title card.

Project Home:
  Preserved from Phase 06.

Document Control:
  Preserved as specialized surface.

Regression protection:
  Explicitly blocks redundant top-level dashboard cards from returning.
```
