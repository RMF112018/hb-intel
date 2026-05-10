# Prompt 07 — Phase 05 A11y Regression, False-Affordance, and No-Routing Test Hardening

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation** inside `apps/project-control-center`.

This prompt is **tests-first hardening** after Prompts 01–06. It must not reopen registry, state, router, dashboard, module-copy, or hero-axis migrations unless a test exposes a narrowly scoped defect.

---

## Objective

Complete final pre-live-evidence regression coverage for Phase 05 navigation:

```text
1. tab / tabpanel accessibility contracts
2. dropdown/menu ARIA contracts
3. keyboard and blur behavior
4. false-affordance prevention
5. no developer-copy rendered text
6. no sidebar / no URL routing / no persistence / no writeback
7. no regression of bento direct-child invariants
```

Prompt 07 should primarily add or refine tests. Production changes are allowed only as small defect fixes required to make the new tests pass.

---

## Current Repo-Truth Baseline to Respect

Prompts 01–06 have landed:

- Prompt 01: `PccPrimaryNavigation.ts` registry with eight primary tabs and 42 modules.
- Prompt 02: `usePccShellState` has `activePrimaryTabId` and `activeModuleId`; `activeSurfaceId` remains hook-internal compatibility state.
- Prompt 03: `PccHorizontalTabs` renders registry-driven primary tabs and module dropdowns.
- Prompt 04: `PccSurfaceRouter` and shell panel markers migrated to `activePrimaryTabId`; Prompt 03 bridge removed.
- Prompt 05: module-selection UX/copy hardening and selected-module dashboard markers landed.
- Prompt 06: shell hero/header metadata migrated to `activePrimaryTabId`.

Existing coverage already includes substantial assertions in:

```text
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/usePccShellState.test.ts
apps/project-control-center/src/tests/PccShell.invariants.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Do not duplicate existing tests blindly. Inspect current tests first and add only the missing or insufficient assertions.

---

## Non-Negotiable Guardrails

- Work against current `main`.
- Inspect repo truth before editing.
- Do not re-read files already in current context unless needed to verify stale, missing, or contradictory repo truth.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve `Primary Tab = Dashboard Surface` and `Module = child entry point`.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not add a standalone Module Launcher.
- Do not add a sidebar, rail, drawer, or persistent secondary navigator.
- Do not introduce URL routing, query-string routing, SharePoint page routing, browser-history state, `localStorage`, or `sessionStorage`.
- Do not introduce Procore, Sage, SharePoint, tenant, group, list, library, approval, HBI, integration, or external-system writeback.
- Do not change registry IDs, module IDs, primary-tab IDs, parent mappings, states, or selectability.
- Do not change package versions, SPFx manifest versions, package-solution versions, feature versions, package files, or `pnpm-lock.yaml`.
- Do not run Playwright.
- Do not generate live evidence.
- Do not render developer copy in product UI.

Forbidden product-rendered strings:

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

---

## Allowed Files

### Preferred test-only scope

Expected files:

```text
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.invariants.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/usePccShellState.test.ts
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

You may add one new focused test file if doing so is cleaner than bloating existing files:

```text
apps/project-control-center/src/tests/PccPhase05A11yRegression.test.tsx
```

### Production files allowed only for defect fixes

Only if a new or existing test exposes an actual production defect, you may minimally edit:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.module.css
```

If a defect appears to require changes outside these files, stop and report.

---

## Files and Paths You Must Not Touch

```text
packages/models/**
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts

apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/surfaces/approvals/**
apps/project-control-center/src/surfaces/externalSystems/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/surfaces/teamAccess/**
apps/project-control-center/src/surfaces/siteHealth/**
apps/project-control-center/src/surfaces/controlCenterSettings/**
apps/project-control-center/src/surfaces/buyoutLog/**
apps/project-control-center/src/surfaces/constraintsLog/**
apps/project-control-center/src/surfaces/responsibilityMatrix/**
apps/project-control-center/src/surfaces/unifiedLifecycle/**

apps/project-control-center/config/package-solution.json
e2e/pcc-live/**
playwright.pcc-live.config.ts
package.json
apps/project-control-center/package.json
packages/models/package.json
pnpm-lock.yaml
```

---

## Pre-Edit Repo Check

Before editing, run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/models build
```

If the working tree contains only user-provided prompt/plan artifacts, report them before editing and do not stage them. If runtime/test files are dirty, stop.

---

## Required Test Review Before Adding Tests

Inspect existing coverage first. Confirm whether each item below is already covered:

```text
PccHorizontalTabs.test.tsx
- eight tabs in order
- all toggles render
- toggle opens menu
- opening one menu closes prior menu
- toggle click does not select tab/module
- mouse toggle keeps focus on toggle
- Escape closes focused module menu and returns focus
- ArrowDown from primary tab opens menu and focuses first item
- ArrowUp/ArrowDown/Home/End inside menu
- selectable module click/Enter/Space calls once
- non-selectable click/Enter/Space does not call
- disabled reason visible
- active marker
- role-boundary guard
- forbidden-copy guard
- HBI / launch-only / approvals authority-copy guards

PccShell.navigation.test.tsx
- eight primary tabs and toggles render
- exactly eight role=tab elements
- no legacy compat marker
- default panel marker
- tab click updates selected tab, panel marker, aria-labelledby, hero title
- selectable module active marker
- non-selectable module not active
- Document Control visible label and no bare Documents primary label
- no URL/history/storage mutation

PccSurfaceRouter.phase05.test.tsx
- every primary tab renders cards
- project-home/documents reuse existing surfaces
- new dashboards render 3 direct-child cards
- selected-module context markers/content
- HBI/launch-only/approvals/Sage copy guards
- forbidden-copy guard

usePccShellState.test.ts
- state axis and non-selectable behavior
- activeSurfaceId remains unchanged by selectModule

PccShell.invariants.test.tsx
- shell hero does not leak into active panel
- active primary tab / panel / aria-labelledby consistency
- no bare Apps or bare Systems tab labels
```

Do not add duplicative tests unless they close an actual gap.

---

## Required New or Strengthened Coverage

Add or strengthen tests for the following gaps only if they are not already fully covered.

### 1. Dropdown toggle ARIA target integrity

Test each primary tab toggle:

- `aria-haspopup="menu"`.
- closed state has `aria-expanded="false"`.
- `aria-controls` references a menu id that is not currently mounted when closed.
- after opening, `aria-expanded="true"`.
- `aria-controls` resolves to the mounted `[role="menu"][data-pcc-module-menu="{tabId}"]`.
- after closing, `aria-expanded="false"`.

Preferred location: `PccHorizontalTabs.test.tsx`.

### 2. Tab ARIA target integrity across all primary tabs

Test each primary tab:

- `id="pcc-tab-${tabId}"`.
- `aria-controls="pcc-active-surface-panel"` when rendered through `PccApp`.
- exactly one selected primary tab at a time.
- shell main has `role="tabpanel"`.
- shell main `aria-labelledby` references an existing selected tab node.
- shell main `data-pcc-active-surface-panel` equals the selected tab id.

Preferred location: `PccShell.navigation.test.tsx` or `PccShell.invariants.test.tsx`.

### 3. Blur-outside behavior

Add a direct `PccHorizontalTabs` test:

- open a menu;
- focus a module item;
- blur/focus outside the nav root;
- await microtask;
- menu closes.

Also confirm that focus movement within the nav root does not close the menu prematurely if this is not already adequately covered.

Preferred location: `PccHorizontalTabs.test.tsx`.

### 4. Non-selectable false-affordance hardening

Strengthen direct component tests:

- every non-selectable module item across all menus:
  - is a `button`, not an anchor;
  - has `aria-disabled="true"`;
  - has `data-pcc-module-selectable="false"`;
  - has visible disabled reason copy;
  - does not call `onSelectModule` on click, Enter, or Space;
  - menu remains open after attempted activation.
- every selectable module item:
  - has no `aria-disabled="true"`;
  - calls `onSelectModule` exactly once on click, Enter, and Space;
  - menu closes after activation.

Preferred location: `PccHorizontalTabs.test.tsx`.

### 5. No persistent sidebar / drawer / module launcher markers

Add an integration test over `PccApp` rendering each primary tab:

Must not render any persistent navigation alternative markers or common forbidden structural affordances:

```css
[data-pcc-sidebar]
[data-pcc-navigation-sidebar]
[data-pcc-module-launcher]
[data-pcc-module-drawer]
[data-pcc-side-rail]
[aria-label="Module Launcher"]
[aria-label="PCC sidebar"]
```

This does **not** prohibit the existing horizontal tablist or module dropdown menus.

Preferred location: `PccShell.invariants.test.tsx` or a new `PccPhase05A11yRegression.test.tsx`.

### 6. No anchors in primary tab/dropdown navigation

Add a test scoped to `[data-pcc-horizontal-tabs]`:

- no `<a>` elements render in the primary tab/dropdown navigation.
- module entries remain buttons.
- launch-only modules communicate launch/no-writeback posture but are not live external anchors in Phase 05.

Preferred location: `PccHorizontalTabs.test.tsx`.

### 7. Visible product-copy guard over full app states

Add an integration copy guard that renders `PccApp`, then for every primary tab:

- click primary tab;
- scan:
  - `[data-pcc-project-hero-band]`
  - `main[role="tabpanel"]`
  - `[data-pcc-horizontal-tabs]` with that tab’s menu opened;
- assert forbidden product terms do not render.

Do not scan test names, source comments, code identifiers, or docs.

Preferred location: `PccShell.navigation.test.tsx` or new `PccPhase05A11yRegression.test.tsx`.

### 8. Source grep guard for routing / persistence / bridge / writeback

Add validation-time grep commands; do not necessarily encode all of these as tests.

Required manual/source guards after changes:

```bash
grep -rE "onSelectLegacySurface|PRIMARY_TAB_LEGACY_SURFACE_MAP|MODULE_LEGACY_SURFACE_MAP|LEGACY_COMPAT_TAB_IDS|legacyCompatMarker|getSurfaceSelectionControl" apps/project-control-center/src/
```

Expected: zero bridge-code matches. Existing positive absence assertions for `data-pcc-legacy-compat` are acceptable.

```bash
grep -rE "localStorage|sessionStorage|history\.pushState|URLSearchParams|window\.location" apps/project-control-center/src/shell apps/project-control-center/src/surfaces/phase05Dashboard apps/project-control-center/src/tests
```

Review matches. Test assertions that prove no mutation are acceptable; production usage in shell/dashboard code is not.

```bash
grep -rE "data-pcc-sidebar|data-pcc-navigation-sidebar|data-pcc-module-launcher|data-pcc-module-drawer|data-pcc-side-rail" apps/project-control-center/src/
```

Expected: zero runtime markers unless a test asserts absence as a string literal.

---

## Production Fix Rules

If a new test fails:

1. Confirm whether it is a test bug or real production defect.
2. If production defect:
   - fix only the smallest needed implementation detail;
   - stay within allowed production files;
   - preserve all existing selectors unless they are the defect;
   - add/update the failing test to lock the repair.
3. Do not make visual redesign changes.
4. Do not alter copy unless the test reveals a product-rendered forbidden term or false-affordance problem.
5. Do not change state/router/shell/hero/model contracts.

Examples of acceptable production fixes:

- missing `aria-expanded` state correction;
- `aria-controls` pointing at a wrong menu id;
- blur handler failing to close when focus moves outside;
- non-selectable module activation leak;
- missing `aria-disabled` on non-selectable module button;
- CSS focus/disabled treatment if an existing class is present but insufficient.

Examples of unacceptable production changes:

- changing registry module states or selectability;
- adding URL routing;
- adding external anchors;
- adding a sidebar/module launcher;
- changing `PccSurfaceRouter`;
- changing `usePccShellState`;
- changing hero metadata/copy;
- changing package or SPFx versions.

---

## Required Validation

Before editing:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/models build
```

After editing:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccHorizontalTabs.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccShell.navigation.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccShell.invariants.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccSurfaceRouter.phase05.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/usePccShellState.test.ts
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If a new focused test file is created, add it to targeted validation.

If Prettier fails, run `pnpm exec prettier --write` only on changed files, then rerun targeted tests and the full SPFx package test.

Do not run Playwright.

Do not run package builds beyond `@hbc/models build` unless required by type/test failure investigation.

Do not change `pnpm-lock.yaml`.

---

## Required Closeout

Return a chat closeout only. Do not create a closeout markdown file unless explicitly instructed.

Include:

```markdown
## Prompt 07 Closeout — A11y Regression and False-Affordance Test Hardening

### Files Changed
- ...

### Coverage Added / Strengthened
- Dropdown ARIA:
- Tab/tabpanel integrity:
- Blur-outside behavior:
- Non-selectable false-affordance:
- No sidebar/module launcher:
- No anchors/routing/persistence:
- Product-copy guard:

### Production Defects Found / Fixed
- ...

### Validation Results
- `git status --short` before:
- `pnpm-lock.yaml` MD5 before:
- `pnpm --filter @hbc/models build`:
- SPFx typecheck:
- targeted tests:
- full SPFx test:
- Prettier:
- `git diff --check`:
- grep guards:
- `pnpm-lock.yaml` MD5 after:
- `git status --short` after:

### Scope Confirmation
- Registry untouched:
- State hook untouched:
- PccApp/PccShell/PccSurfaceRouter untouched:
- Hero metadata/copy untouched:
- Dashboard surfaces untouched unless a defect fix was required:
- Legacy surfaces untouched:
- e2e/live evidence untouched:
- Package/manifest/lockfile untouched:
- No standalone Module Launcher/sidebar/routing/persistence/writeback introduced:

### Notes / Risks for Prompt 08
- ...
```

---

## Hard Stop Conditions

Stop and report instead of editing if:

- Current repo is not post-Prompt-06.
- Working tree contains runtime/test changes before editing.
- Adding tests requires changing registry IDs, module IDs, parent mappings, states, or selectability.
- Tests require reintroducing Prompt 03 bridge code.
- Tests require changes to `PccApp`, `PccShell`, `PccSurfaceRouter`, `usePccShellState`, hero metadata/copy, or legacy surfaces.
- Validation requires `pnpm install` or lockfile changes.
- The only way to satisfy the prompt would be to add URL routing, storage, browser history mutation, live external anchors, source-system writeback, a sidebar, or a standalone module launcher.
