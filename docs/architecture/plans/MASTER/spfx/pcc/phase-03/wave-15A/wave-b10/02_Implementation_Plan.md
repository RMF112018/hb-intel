# Phase 05 Implementation Plan — Grouped Tab Module Navigation

## Objective

Implement registry-driven grouped tab/module navigation in the Project Control Center. The result must show eight production-grade primary dashboard tabs, each with an accessible dropdown of child modules. The implementation must preserve read-only/no-writeback posture, SharePoint host-fit, bento direct-child invariants, accessibility, and production-grade UI copy.

## Phase Strategy

Use an incremental implementation sequence that reduces risk:

1. Audit current repo truth.
2. Add typed navigation registry and tests.
3. Extend shell state with active module context.
4. Generalize tab dropdown UI.
5. Add dashboard surfaces / preview shells for the new primary tabs.
6. Implement module selection and disabled state behavior.
7. Refine Document Control visible naming and scope.
8. Add accessibility, false-affordance, and no-developer-copy tests.
9. Capture live evidence if hosted behavior changes.

## Prompt Sequence

| Prompt | Scope | Runtime Risk |
|---|---|---|
| Prompt 00 | Repo-truth audit only | None |
| Prompt 01 | Registry/types/tests | Low |
| Prompt 02 | Shell state active module model | Low / Medium |
| Prompt 03 | Generalize tab dropdowns | Medium |
| Prompt 04 | Router + dashboard shells | Medium |
| Prompt 05 | Module selection/disabled behavior/copy | Medium |
| Prompt 06 | Document Control tab refinement | Low / Medium |
| Prompt 07 | A11y and false-affordance tests | Low |
| Prompt 08 | Evidence and closeout | Low |

## Step 0 — Repo-Truth Audit

### Read

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/surfaces/
apps/project-control-center/src/tests/
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccCapabilities.ts
```

### Confirm

- Current surface IDs.
- Current tab order and dropdown behavior.
- Current state hook shape.
- Current router shape.
- Current tests for navigation, active panel ownership, and surface smoke.
- Current references to `documents` and visible `Documents` copy.
- Current references to Project Home child surfaces under the hardcoded dropdown.

### Output

- No code changes.
- Short findings summary.
- Confirm whether package assumptions still match `main`.

## Step 1 — Registry and Types

### Implement

Create a typed navigation registry.

Preferred location:

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
```

Fallback location if package exports become disruptive:

```text
apps/project-control-center/src/shell/pccPrimaryNavigation.ts
```

### Include

- `PCC_PRIMARY_TAB_IDS`
- `PccPrimaryTabId`
- `PCC_MODULE_IDS`
- `PccModuleId`
- `PCC_MODULE_STATES`
- `PccModuleState`
- `PCC_MODULE_STATE_COPY`
- `PCC_PRIMARY_NAVIGATION_TABS`
- `PCC_NAVIGATION_MODULES`
- helper functions

### Tests

Add registry tests proving:

- exact tab order;
- exact visible labels;
- exact module membership;
- no duplicate IDs;
- all module parent tabs exist;
- disabled module reason copy exists;
- no forbidden UI terms in labels/summaries/reasons.

## Step 2 — Shell State Extension

### Implement

Extend `usePccShellState`:

```ts
activeSurfaceId: PccPrimaryTabId;
activeModuleId?: PccModuleId;
selectPrimarySurface(id: PccPrimaryTabId): void;
selectModule(id: PccModuleId): void;
clearActiveModule(): void;
setSelectedProject(id: PccProjectId | undefined): void;
```

### Preserve

- `previewMode: true`.
- Safe normalization of invalid surface IDs.
- Stable setter references.
- No URL routing.
- No persistence.
- No tenant reads.

### Behavior

- `selectPrimarySurface` clears active module.
- `selectModule` does nothing for non-selectable modules.
- `selectModule` sets parent tab and active module for selectable modules.
- `setSelectedProject` clears active module.

### Tests

Update or add `usePccShellState` tests for:

- default surface;
- default no active module;
- primary selection clears module;
- selectable module sets parent tab;
- disabled module does not mutate state;
- invalid surface normalizes to `project-home`;
- invalid module normalizes to no change;
- setter references remain stable.

## Step 3 — Generalize `PccHorizontalTabs`

### Implement

Refactor hardcoded Project Home dropdown logic into registry-driven dropdowns.

Current model:

```text
Project Home has hardcoded child surfaces.
```

Target model:

```text
Every primary tab can expose child modules from registry.
```

### Required Component Props

```ts
interface PccHorizontalTabsProps {
  mode: PccResponsiveMode;
  activeSurfaceId: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
  onSelectSurface: (id: PccPrimaryTabId) => void;
  onSelectModule: (id: PccModuleId) => void;
  panelId?: string;
  ariaLabel?: string;
}
```

### UI Behavior

- Render all eight primary tabs in locked order.
- Render a dropdown toggle for each primary tab with module links.
- Opening one menu closes all others.
- Clicking a primary tab selects dashboard and clears module.
- Clicking an enabled module calls `onSelectModule`.
- Clicking disabled module does not call selection.
- Escape closes menu and returns focus to parent tab.

### Tests

- all eight primary tabs visible;
- Document Control visible label;
- each tab toggle exists;
- every menu opens;
- Escape closes menu;
- disabled items expose reason copy;
- no forbidden developer copy rendered.

## Step 4 — Router and Dashboard Shells

### Implement

Extend router to accept `activeModuleId`.

```ts
interface PccSurfaceRouterProps {
  activeSurfaceId: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
  readModelClient?: IPccSurfaceRouterReadModelClient;
}
```

### Render Strategy

| Tab | Strategy |
|---|---|
| Project Home | Existing Project Home. |
| Core Tools | New dashboard shell composed of production-grade cards/preview summaries. |
| Document Control | Existing `PccDocumentsSurface`, visible label Document Control. |
| Estimating & Preconstruction | New production-grade preview dashboard. |
| Project Startup & Closeout | New dashboard shell, reusing readiness concepts where practical. |
| Project Controls | New dashboard shell, reusing permit/inspection/constraints concepts where practical. |
| Cost & Time | New production-grade preview dashboard. |
| Systems Administration | New dashboard shell, reusing settings/site-health concepts where practical. |

### Dashboard Shell Minimum Content

Every new dashboard must include:

- dashboard title;
- end-user purpose statement;
- 3 to 6 module cards;
- module state badges;
- source/read-only/future-release cues;
- selected module state if active module belongs to the tab.

### UI Copy Rule

Do not use developer copy. Use production-grade language from this package.

## Step 5 — Module Selection and Disabled Behavior

### Implement

- module selection sets parent tab + active module when selectable;
- disabled/future/source-unavailable modules do not change state;
- the active dashboard displays selected module context;
- active module context must use label, not ID.

### Visual Pattern

If `activeModuleId` is set:

```text
Selected module: {Module Label}
{Module summary}
{State label}: {State cue}
```

### Disabled Item Pattern

Disabled menu item should show:

```text
{Module Label}
{State Label}
{Reason Copy}
```

It should not look like a live link.

## Step 6 — Document Control Refinement

### Implement

- visible tab label `Document Control`;
- preserve current `documents` ID unless safely migrated;
- include module links:
  - Primary Documents Tool
  - Document Control Center
  - Drawing & Model Center
  - SharePoint Project Record
  - My Project Files / OneDrive
  - Procore Documents
  - Document Crunch
  - Adobe Sign

### Tests

- `Documents` no longer appears as the visible primary tab label.
- `Document Control` appears.
- Existing document surface tests still pass or are updated without reducing coverage.
- Document dashboard renders production-grade source posture language.

## Step 7 — A11y / False Affordance / Copy Tests

### Required Test Families

- Registry integrity tests.
- State behavior tests.
- Tab navigation tests.
- Dropdown keyboard tests.
- Disabled state tests.
- No developer copy tests.
- No routing tests.
- No sidebar tests.
- Direct-child bento invariant tests.
- Active panel ownership tests.

### No Developer Copy Test

Search rendered PCC app for forbidden terms:

```text
TODO
TBD
placeholder
stub
mock
fixture
debug
dev-only
not implemented
lorem
developer
code agent
prompt
repo
test selector
internal only
```

This test must only scan rendered UI, not source code comments or test names.

## Step 8 — Evidence Closeout

### Required

- baseline validation commands;
- changed-file prettier check;
- lockfile MD5 before/after;
- test summary;
- implementation notes;
- known deferred items.

### Live Evidence

Run if hosted navigation changed materially:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

Capture screenshots showing:

- every primary tab;
- each dropdown open at least once;
- Document Control tab;
- disabled/future module reason copy;
- selected module context;
- no overflow at standard laptop/desktop/ultrawide.
