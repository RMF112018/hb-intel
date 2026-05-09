# Prompt 03 — Generalize PccHorizontalTabs to Registry-Driven Primary Tabs and Module Dropdowns

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation**.

This prompt wires the Phase 05 registry and state into the horizontal navigation component only. It must not migrate dashboard surface routing or create new dashboard surfaces.

---

## Objective

Replace the hardcoded Project Home-only dropdown pattern in `PccHorizontalTabs` with a registry-driven primary-tab/module-dropdown navigation model:

```text
Primary Tab = Dashboard Surface
Dropdown / Child Module Link = Module Entry Point under that Dashboard Surface
```

Every primary tab must render from the Phase 05 registry. Every primary tab must expose a module dropdown. Module selection must use the Phase 05 shell-state actions added in Prompt 02.

---

## Current Repo-Truth Baseline to Respect

Prompt 01 added the registry exports in `@hbc/models/pcc`:

```ts
PCC_PRIMARY_TAB_IDS
PccPrimaryTabId
PCC_MODULE_IDS
PccModuleId
PCC_PRIMARY_NAVIGATION_TABS
PCC_NAVIGATION_MODULES
getModule
getModulesForPrimaryTab
isSelectableModule
```

Prompt 02 added compatibility-first shell state:

```ts
activeSurfaceId: PccMvpSurfaceId;        // legacy runtime surface, still used by router/hero
activePrimaryTabId: PccPrimaryTabId;     // Phase 05 selected primary tab
activeModuleId?: PccModuleId;            // Phase 05 selected module
setActiveSurface(id: PccMvpSurfaceId): void;
selectPrimarySurface(id: PccPrimaryTabId): void;
selectModule(id: PccModuleId): void;
clearActiveModule(): void;
setSelectedProject(id: PccProjectId | undefined): void;
```

Current runtime still has these compatibility constraints:

- `PccSurfaceRouter` still receives `activeSurfaceId: PccMvpSurfaceId`.
- `projectShellViewModel`, `surfaceHeaderMetadata`, and `surfaceHeroCopy` still key off `PccMvpSurfaceId`.
- `PccShell` still owns the single `<main role="tabpanel">`.
- Dashboard/router parity moves in Prompt 04.
- Hero/copy parity and final visible label cleanup move in later prompts.
- Live Playwright evidence moves in Prompt 08.

Therefore Prompt 03 must wire the tab/dropdown UI to `activePrimaryTabId` / `activeModuleId`, while leaving the legacy router/content path intact until Prompt 04.

---

## Allowed Files

Modify only these files unless a directly failing tab-navigation test requires a nearby test update:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/shellSurfaceSelection.ts
```

If any additional file appears necessary, stop and report the conflict instead of broadening scope.

---

## Files and Paths You Must Not Touch

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
packages/models/src/pcc/PccPrimaryNavigation.test.ts
packages/models/src/pcc/index.ts

apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/tests/usePccShellState.test.ts

apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/surfaces/**
apps/project-control-center/config/package-solution.json
e2e/pcc-live/**
playwright.pcc-live.config.ts
package.json
apps/project-control-center/package.json
packages/models/package.json
pnpm-lock.yaml
```

---

## Guardrails

- Work against current `main`.
- Inspect repo truth before editing.
- Preserve the existing shell-owned `<main role="tabpanel">`.
- Preserve legacy `activeSurfaceId` routing/content until Prompt 04.
- Do not modify `PccSurfaceRouter`.
- Do not modify hero metadata or hero copy.
- Do not add new dashboard surface components.
- Do not delete existing surfaces.
- Do not add a standalone hero/header Module Launcher.
- Do not add a sidebar, rail, drawer, or persistent secondary navigator.
- Do not add URL routing, query-string routing, SharePoint page routing, browser-history state, `localStorage`, or `sessionStorage`.
- Do not introduce Procore, Sage, SharePoint, tenant, group, list, library, approval, file, HBI, integration, or external-system writeback.
- Do not add disabled-but-clickable false affordances. Non-selectable module items may be focusable for explanation, but must clearly expose their disabled/non-selectable state and must not invoke `onSelectModule`.
- Do not modify package versions, SPFx manifest versions, package-solution versions, or feature versions.
- Do not run Playwright.
- Do not generate live evidence.

---

## Required `PccHorizontalTabs` Contract

Replace the legacy `PccMvpSurfaceId` tab props with the Phase 05 primary-tab/module props:

```ts
export interface PccHorizontalTabsProps {
  mode: PccResponsiveMode;
  activePrimaryTabId: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
  onSelectPrimarySurface: (id: PccPrimaryTabId) => void;
  onSelectModule: (id: PccModuleId) => void;
  panelId?: string;
  ariaLabel?: string;
}
```

Do not keep the old hardcoded `TAB_LABELS`, `TOP_LEVEL_SURFACE_IDS`, `PROJECT_HOME_CHILD_SURFACE_IDS`, or `PROJECT_HOME_CHILD_SET`.

Render from:

```ts
PCC_PRIMARY_NAVIGATION_TABS
getModulesForPrimaryTab
```

---

## Required `PccShell` Contract

Update `PccShellProps` to preserve the legacy surface path and add the Phase 05 navigation path:

```ts
export interface PccShellProps {
  heroViewModel: IPccShellHeroViewModel;
  activeSurfaceId: PccMvpSurfaceId;
  activePrimaryTabId: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
  onSelectPrimarySurface?: (id: PccPrimaryTabId) => void;
  onSelectModule?: (id: PccModuleId) => void;
  forceMode?: PccResponsiveMode;
  children: ReactNode;
}
```

Wire `PccHorizontalTabs` like:

```tsx
<PccHorizontalTabs
  mode={shellMode}
  activePrimaryTabId={activePrimaryTabId}
  activeModuleId={activeModuleId}
  onSelectPrimarySurface={(id) => onSelectPrimarySurface?.(id)}
  onSelectModule={(id) => onSelectModule?.(id)}
  panelId={ACTIVE_PANEL_ID}
/>
```

For the shell `<main>` during Prompt 03:

- Preserve `data-pcc-active-surface-panel={activeSurfaceId}`.
- Preserve the bento grid.
- Prefer `aria-labelledby={`pcc-tab-${activePrimaryTabId}`}` so the active tab and tabpanel label remain aligned with the Phase 05 tab state.
- Do not change routed child content yet.

Add a comment only if needed to clarify that `data-pcc-active-surface-panel` remains legacy until Prompt 04.

---

## Required `PccApp` Wiring

Update `PccApp.tsx` to pass Prompt 02 shell-state fields/actions into `PccShell`:

```tsx
<PccShell
  heroViewModel={heroViewModel}
  activeSurfaceId={shell.activeSurfaceId}
  activePrimaryTabId={shell.activePrimaryTabId}
  activeModuleId={shell.activeModuleId}
  onSelectPrimarySurface={shell.selectPrimarySurface}
  onSelectModule={shell.selectModule}
  forceMode={forceMode}
>
  <PccSurfaceRouter activeSurfaceId={shell.activeSurfaceId} readModelClient={readModelClient} />
</PccShell>
```

Do not change `deriveShellHeroViewModel` yet. It still receives `shell.activeSurfaceId`.

Do not change `PccSurfaceRouter` yet. It still receives `shell.activeSurfaceId`.

---

## Required `PccHorizontalTabs` Rendering

### Primary tabs

For every record in `PCC_PRIMARY_NAVIGATION_TABS`, render a primary tab button in registry order.

Each primary tab button must have:

```tsx
id={`pcc-tab-${tab.id}`}
role="tab"
type="button"
aria-selected={tab.id === activePrimaryTabId}
aria-controls={panelId}
tabIndex={tab.id === activePrimaryTabId ? 0 : -1}
data-pcc-tab-id={tab.id}
data-pcc-tab-active={tab.id === activePrimaryTabId ? 'true' : 'false'}
data-pcc-tab-mode={mode}
```

Visible label must be `tab.label`.

Required visible primary labels:

```text
Project Home
Core Tools
Document Control
Estimating & Preconstruction
Project Startup & Closeout
Project Controls
Cost & Time
Systems Administration
```

Visible `Documents` as a primary tab label must be absent.

### Parent wrapper

Wrap each primary tab + toggle/menu group with:

```tsx
data-pcc-surface-nav-parent={tab.id}
data-pcc-parent-active={tab.id === activePrimaryTabId ? 'true' : 'false'}
data-pcc-module-menu-open={openMenuId === tab.id ? 'true' : 'false'}
```

### Dropdown toggle

Render a dropdown toggle for every primary tab.

Each toggle must have:

```tsx
type="button"
aria-label={`Open ${tab.label} modules`}
aria-haspopup="menu"
aria-expanded={openMenuId === tab.id ? 'true' : 'false'}
aria-controls={menuIdForTab}
data-pcc-nav-toggle={tab.id}
```

Clicking the toggle must only open/close the dropdown. It must not select a primary tab and must not select a module.

### Module menu

When open, render a menu for the active parent:

```tsx
id={menuIdForTab}
role="menu"
data-pcc-module-menu={tab.id}
```

Menu must contain all modules returned by `getModulesForPrimaryTab(tab.id)` in registry order.

### Module item

Each module item must render as a button with `role="menuitem"`.

Each module item must have:

```tsx
type="button"
role="menuitem"
data-pcc-module-nav-item={module.id}
data-pcc-module-parent-tab={module.parentTabId}
data-pcc-module-state={module.state}
data-pcc-module-selectable={module.selectable ? 'true' : 'false'}
data-pcc-module-active={module.id === activeModuleId ? 'true' : 'false'}
aria-disabled={module.selectable ? undefined : 'true'}
```

Visible content must include:

- module label;
- state label;
- module summary;
- authority cue;
- disabled reason for non-selectable modules.

For non-selectable modules, the visible reason must be `module.disabledReason`.

Do not use native `disabled` on non-selectable module buttons if it prevents keyboard focus and reason review. Use `aria-disabled="true"` and guard click/key activation.

---

## Required Interaction Behavior

### Primary tab activation

Primary tab click:

- Calls `onSelectPrimarySurface(tab.id)`.
- Closes any open module menu.
- Does not call `onSelectModule`.

Primary tab `Enter` or `Space`:

- Calls `onSelectPrimarySurface(tab.id)` once.
- Closes any open module menu.
- Does not call `onSelectModule`.
- Prevents duplicate native button key synthesis.

### Primary tab arrow keys

On the tablist:

- `ArrowRight`: selects/focuses next primary tab, wrapping.
- `ArrowLeft`: selects/focuses previous primary tab, wrapping.
- `Home`: selects/focuses first primary tab.
- `End`: selects/focuses last primary tab.

These keys call `onSelectPrimarySurface`.

### Dropdown opening and menu focus

On a primary tab:

- `ArrowDown`: opens that tab's module menu and focuses the first module item.
- `Escape`: if a menu is open, closes the menu and focuses the active/parent primary tab.

On a dropdown toggle:

- click toggles the menu;
- `ArrowDown` opens the menu and focuses the first module item;
- `Escape` closes the menu and focuses the parent primary tab.

### Module menu keyboard behavior

On a module item:

- `ArrowDown`: moves focus to next module item, wrapping.
- `ArrowUp`: moves focus to previous module item, wrapping.
- `Home`: focuses first module item.
- `End`: focuses last module item.
- `Escape`: closes menu and focuses parent primary tab.
- `Enter` / `Space`:
  - selectable module: calls `onSelectModule(module.id)` once and closes menu;
  - non-selectable module: does not call `onSelectModule` and keeps menu open enough for reason copy review.

Click behavior:

- selectable module: calls `onSelectModule(module.id)` and closes menu;
- non-selectable module: does not call `onSelectModule`.

Opening one module menu must close the previously open module menu.

Blur behavior:

- If focus leaves the tablist/menu root, close the open menu.
- If focus remains inside the tablist/menu root, keep menu state as required.

---

## Required CSS / Styling Constraints

Update `PccHorizontalTabs.module.css` to support:

- eight primary tab groups;
- compact density without horizontal clipping at standard laptop widths;
- module dropdown menus with adequate width and readable copy;
- clear active module item state;
- clear non-selectable module state;
- focus-visible rings on primary tabs, toggles, and module items;
- no hardcoded hex colors;
- existing `--pcc-color-*`, spacing, border, radius, and elevation variables where practical;
- reduced-motion safe transitions.

Do not add global CSS.

Do not introduce a sidebar, drawer, rail, or persistent secondary navigator.

---

## Required Test Updates

Update `PccHorizontalTabs.test.tsx` to test the component directly with Phase 05 props.

Use these helper defaults:

```ts
const onSelectPrimarySurface = vi.fn();
const onSelectModule = vi.fn();

<PccHorizontalTabs
  mode="desktop"
  activePrimaryTabId="project-home"
  activeModuleId={undefined}
  onSelectPrimarySurface={onSelectPrimarySurface}
  onSelectModule={onSelectModule}
  panelId="pcc-active-panel"
/>
```

Required direct component tests:

1. Renders all eight primary tabs from `PCC_PRIMARY_TAB_IDS` / `PCC_PRIMARY_NAVIGATION_TABS`.
2. Renders every primary tab in the locked order.
3. Renders visible `Document Control`.
4. Does not render visible primary tab label `Documents`.
5. Every primary tab has a dropdown toggle with `data-pcc-nav-toggle="{primaryTabId}"`.
6. Toggle click opens the matching `[data-pcc-module-menu="{primaryTabId}"]`.
7. Opening one dropdown closes the previously open dropdown.
8. Toggle click does not call `onSelectPrimarySurface`.
9. Toggle click does not call `onSelectModule`.
10. `Escape` closes an open menu and returns focus to the parent tab.
11. `ArrowDown` on a primary tab opens the menu and focuses first module item.
12. `ArrowDown` / `ArrowUp` navigate module items.
13. `Home` / `End` navigate module items.
14. Selectable module click calls `onSelectModule(module.id)`.
15. Selectable module Enter/Space calls `onSelectModule(module.id)` once.
16. Non-selectable module click does not call `onSelectModule`.
17. Non-selectable module Enter/Space does not call `onSelectModule`.
18. Deferred module reason copy is visible.
19. Active module has `data-pcc-module-active="true"`.
20. Non-selectable module has `data-pcc-module-selectable="false"` and `aria-disabled="true"`.
21. Primary tab click calls `onSelectPrimarySurface(tab.id)` and closes menus.
22. Primary tab Enter/Space calls `onSelectPrimarySurface(tab.id)` once.
23. ArrowLeft / ArrowRight / Home / End select primary tabs via `onSelectPrimarySurface`.
24. No forbidden developer copy renders in the tablist.

Update `PccShell.navigation.test.tsx` to stop asserting four top-level tabs and old Project Home child-surface dropdown behavior.

Required integration tests:

1. `PccApp` renders all eight primary tab controls.
2. `PccApp` defaults active primary tab to `project-home`.
3. Clicking `Core Tools` makes `data-pcc-tab-id="core-tools"` active.
4. Clicking `Document Control` makes `data-pcc-tab-id="documents"` active.
5. `PccApp` still keeps the legacy shell panel marker present:
   - `main[role="tabpanel"][data-pcc-active-surface-panel]`
   - Do not require the legacy panel marker to equal the active primary tab until Prompt 04.
6. `aria-labelledby` on the shell main references the active primary tab id.
7. Opening a primary tab module menu renders module items.
8. Selecting a selectable module marks it active in the tablist.
9. Selecting a non-selectable module does not mark it active.
10. There is no visible primary tab label `Documents`.

Update `shellSurfaceSelection.ts` only if test helpers still need it.

Preferred helper direction:

- Add `getPrimaryTabSelectionControl(container, id: PccPrimaryTabId)`.
- Add `openPrimaryModuleMenu(container, id: PccPrimaryTabId)`.
- Add `getModuleSelectionControl(container, id: PccModuleId)`.
- Keep the old helper only if existing tests still import it, but do not use it for the new Phase 05 navigation tests.

---

## Product-Copy Guard

No rendered tab/dropdown copy may include these forbidden terms case-insensitively:

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

The scan should cover visible text under `[data-pcc-horizontal-tabs]`.

---

## Validation

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
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/PccApp.tsx apps/project-control-center/src/shell/PccShell.tsx apps/project-control-center/src/shell/PccHorizontalTabs.tsx apps/project-control-center/src/shell/PccHorizontalTabs.module.css apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx apps/project-control-center/src/tests/PccShell.navigation.test.tsx apps/project-control-center/src/tests/shellSurfaceSelection.ts
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If Prettier fails, run `pnpm exec prettier --write` only on changed files, then rerun targeted tests and the full SPFx package test.

Do not run Playwright in this prompt.

Do not run package builds beyond `@hbc/models build` unless required by a type/test failure investigation.

Do not change `pnpm-lock.yaml`. The before/after hash must remain unchanged.

---

## Required Closeout Response

Report:

```markdown
## Prompt 03 Closeout — Registry-Driven Horizontal Tabs and Module Dropdowns

### Files Changed
- ...

### Runtime Wiring Summary
- PccApp:
- PccShell:
- PccHorizontalTabs:

### Navigation Behavior Implemented
- Primary tabs:
- Dropdown toggles:
- Module menus:
- Selectable modules:
- Non-selectable modules:
- Keyboard behavior:
- Blur/escape behavior:

### Tests Added / Updated
- ...

### Validation Results
- `git status --short` before:
- `pnpm-lock.yaml` MD5 before:
- `pnpm --filter @hbc/models build`:
- `pnpm --filter @hbc/spfx-project-control-center check-types`:
- `pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccHorizontalTabs.test.tsx`:
- `pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccShell.navigation.test.tsx`:
- `pnpm --filter @hbc/spfx-project-control-center test`:
- `pnpm exec prettier --check ...`:
- `git diff --check`:
- `pnpm-lock.yaml` MD5 after:
- `git status --short` after:

### Scope Confirmation
- PccSurfaceRouter untouched:
- Hero metadata/copy untouched:
- Surface files untouched:
- Models untouched:
- Playwright/evidence untouched:
- Package/manifest/lockfile untouched:
- No standalone Module Launcher/sidebar/routing/persistence/writeback introduced:
- Runtime content/dashboard parity deferred to Prompt 04:

### Notes / Risks for Prompt 04
- ...
```

Do not create a closeout markdown file unless explicitly instructed. A chat closeout is sufficient.

---

## Hard Stop Conditions

Stop and report instead of editing if:

- Phase 05 registry exports are unavailable from `@hbc/models/pcc`.
- Prompt 02 shell state exports are unavailable from `usePccShellState`.
- The working tree is not clean before editing.
- Typecheck requires changing `PccSurfaceRouter`, hero metadata/copy, projectShellViewModel, or surface files.
- Implementing the dropdowns requires URL routing, persistence, source-system writes, or a standalone module launcher.
- Validation requires `pnpm install` or lockfile changes.
- You cannot preserve the legacy `activeSurfaceId` path while adding registry-driven primary-tab navigation.
