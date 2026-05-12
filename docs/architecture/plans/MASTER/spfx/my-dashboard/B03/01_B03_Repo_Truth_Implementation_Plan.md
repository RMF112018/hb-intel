# B03 Repo-Truth Implementation Plan

## 1. Implementation objective

Deliver the My Dashboard **My Work shell**, **single-surface navigation**, **focused-module transition**, **hero band**, and **responsive bento composition** defined by B03.

The implementation must start from a branch where B02 has already created the `apps/my-dashboard` domain and package/runtime foundation. If B02 is absent, stop after documenting the prerequisite gap.

## 2. Source-of-truth hierarchy

1. Current repo truth at execution time.
2. B01 and B02 implementation outcomes already merged into the branch.
3. B03 planning artifact.
4. Existing PCC and HB Homepage code patterns.
5. Current official accessibility and Microsoft/Fluent design guidance used only to validate the planning assumptions.

## 3. Repo-truth anchors

### 3.1 PCC shell anchors

Use PCC as the construction reference for:

- shell `<main role="tabpanel">` ownership,
- nav + hero command-surface ordering,
- grouped tab + module menu behavior,
- in-memory primary/module state normalization,
- data-attribute evidence posture.

Representative paths:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/state/usePccShellState.ts
```

### 3.2 PCC layout anchors

Use PCC as the responsive/bento reference for:

- container-aware responsive mode resolution,
- 1/2/6/8/10/12 column policy,
- explicit span overrides,
- direct-child bento card rendering.

Representative paths:

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/layout/useContainerBreakpoint.ts
```

### 3.3 HB Homepage anchors

Use HB Homepage only as a secondary reference for:

- shell-level diagnostics/data attributes,
- shell vs child-module ownership,
- avoiding shell overreach into module internals.

Representative paths:

```text
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx
apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts
```

### 3.4 My Work platform anchors

Use My Work Feed as the guardrail for non-overlap:

```text
packages/my-work-feed/README.md
docs/architecture/adr/ADR-0115-my-work-feed-architecture.md
apps/pwa/src/pages/my-work/MyWorkPage.tsx
```

B03 creates a SharePoint host shell. It must not redefine feed aggregation, count semantics, dedupe, manager projections, or package ownership already governed by `@hbc/my-work-feed`.

## 4. Target implementation sequence

### Step 1 — Typed My Work navigation registry and shell state

Create or update:

```text
packages/models/src/myWork/MyWorkNavigation.ts
packages/models/src/myWork/index.ts
packages/models/src/index.ts
apps/my-dashboard/src/state/useMyWorkShellState.ts
```

Implement:

- `MY_WORK_PRIMARY_SURFACE_IDS`
- `MY_WORK_MODULE_IDS`
- `MY_WORK_MODULE_STATES`
- `MyWorkPrimarySurfaceId`
- `MyWorkModuleId`
- `MyWorkModuleState`
- `MY_WORK_PRIMARY_NAVIGATION_SURFACES`
- `MY_WORK_NAVIGATION_MODULES`
- helper functions:
  - `getMyWorkPrimaryNavigationSurface`
  - `getMyWorkModule`
  - `getMyWorkModulesForPrimarySurface`
  - `isSelectableMyWorkModule`
  - `normalizeMyWorkPrimarySurfaceId`
  - `normalizeMyWorkModuleId`
- shell state:
  - `activePrimarySurfaceId`
  - `activeModuleId?`
  - `selectPrimarySurface`
  - `selectModule`
  - `clearActiveModule`

Do **not** add:
- URL state,
- persisted localStorage navigation,
- runtime preview mode state,
- future modules rendered in the registry.

### Step 2 — Command surface and accessible module launcher

Create or update shell files:

```text
apps/my-dashboard/src/shell/MyWorkShell.tsx
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.module.css
apps/my-dashboard/src/shell/MyWorkShell.module.css
```

Implement:

- shell root with `data-my-work-shell`,
- command surface with `data-my-work-command-surface`,
- one `role="tablist"` navigation container,
- one `role="tab"` primary surface tab,
- attached module launcher button:
  - `aria-haspopup="menu"`
  - `aria-expanded`
  - `aria-controls`
- one menu item for Adobe queue:
  - `role="menuitem"`
  - state label `Read-only`
  - summary text
  - authority cue
- PCC-equivalent keyboard behavior where meaningful.

Do **not**:
- add multiple fake primary tabs,
- add detached hero/module launch controls,
- introduce hover-only usability,
- overload the nav with future module placeholders.

### Step 3 — My Work hero band

Create:

```text
apps/my-dashboard/src/shell/MyWorkHeroBand.tsx
apps/my-dashboard/src/shell/MyWorkHeroBand.module.css
```

Implement state-aware hero copy:

Home:
- Primary: `My Dashboard`
- Secondary: `My Work`
- Description: `Your personal command surface for work requiring attention across connected HB systems.`

Focused Adobe:
- Primary: `My Dashboard`
- Secondary: `Adobe Sign Action Queue`
- Description: `Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.`

Microcopy:
- Home: `Read-only work visibility · Source actions remain in their governing systems.`
- Focused Adobe: `Queue visibility only · Agreement actions remain in Adobe Sign.`

Do **not**:
- add PCC project facts,
- add command search,
- add source counts/details that Batch 04/05 should own.

### Step 4 — Bento layout and router

Create:

```text
apps/my-dashboard/src/layout/MyWorkBentoGrid.tsx
apps/my-dashboard/src/layout/myWorkFootprints.ts
apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
```

Implement:

- eight responsive modes aligned to PCC's philosophy,
- columns per mode:
  - phone 1,
  - tablet portrait 2,
  - tablet landscape 6,
  - small laptop 8,
  - standard laptop 10,
  - large laptop / desktop / ultrawide 12,
- typed span override support,
- `home` vs `focused-module` view-state switching,
- shell main as sole active-panel owner,
- direct children in the bento grid.

### Step 5 — Structural surfaces and cards

Create or update:

```text
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx
apps/my-dashboard/src/surfaces/home/WorkSummaryCard.tsx
apps/my-dashboard/src/surfaces/home/SourceReadinessCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueHomeCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueSummaryCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignAgreementActionListCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueStateCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.tsx
```

Use deterministic structural fixtures or typed local presentation inputs only as needed. The cards must:

- render in the B03-defined order,
- use the B03-defined 10/12-column spans,
- expose stable `data-my-work-card` and role markers,
- support selecting the Adobe module from the home queue card,
- avoid implementing detailed read-model or Adobe business rules not owned by B03.

### Step 6 — Wire app root

Update:

```text
apps/my-dashboard/src/MyDashboardApp.tsx
```

to integrate:

- shell state hook,
- hero state derivation,
- command surface/nav callbacks,
- router output,
- bento children.

Do not bypass the shell with direct card rendering from the app root.

## 5. Testing strategy

Minimum required tests after B03:

1. Navigation registry helpers.
2. Shell state normalization.
3. `MyWorkPrimaryNavigation`:
   - tab/menu semantics,
   - mouse toggle keeps focus behavior if implemented,
   - ArrowDown opens menu and focuses first item,
   - Escape returns focus,
   - selecting module triggers callback.
4. `MyWorkHeroBand`:
   - home copy,
   - focused-module copy,
   - no project facts/search control.
5. `MyWorkShell`:
   - one shell active-panel marker,
   - one `tabpanel`,
   - correct `aria-labelledby`.
6. `MyWorkSurfaceRouter`:
   - home state output,
   - focused module output,
   - defensive normalization.
7. Layout/choreography:
   - correct span overrides for B03 wide and standard-laptop matrices,
   - direct bento child order.
8. App integration:
   - selecting Adobe module updates view-state and hero copy.

## 6. Validation commands

Use the actual package name created by B02. If B02 used the recommended package name `@hbc/spfx-my-dashboard`, the expected command family is:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard lint
```

Also run, where toolchain prerequisites are available:

```bash
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

If the package command cannot run due to missing Node 18 SPFx toolchain prerequisites, document the blocker precisely rather than skipping silently.

## 7. No-go violations

The implementation is non-compliant if it:

- renders multiple fake MVP primary tabs,
- adds command search,
- adds project-context hero facts,
- stores shell runtime mode in shell navigation state,
- routes through URL/search params,
- adds analytics cards,
- creates a new personal-work aggregation primitive beside `@hbc/my-work-feed`,
- implements Adobe OAuth/provider/backend behavior,
- exposes developer placeholder copy.
