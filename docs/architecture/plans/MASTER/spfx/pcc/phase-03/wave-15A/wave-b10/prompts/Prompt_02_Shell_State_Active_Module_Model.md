# Prompt 02 — Shell State Active Primary Tab and Active Module Model

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation**.

This prompt updates the **PCC shell state hook only** so later prompts can wire the new grouped primary-tab/module navigation model safely.

---

## Objective

Extend `usePccShellState` with in-memory Phase 05 state for:

```text
activePrimaryTabId
activeModuleId
```

while preserving the existing runtime compatibility surface:

```text
activeSurfaceId: PccMvpSurfaceId
setActiveSurface(id: PccMvpSurfaceId)
```

The current app shell, hero metadata, horizontal tabs, and router still consume `activeSurfaceId` as a legacy `PccMvpSurfaceId`. Do **not** break that contract in this prompt.

---

## Current Repo-Truth Baseline to Respect

Prompt 01 has already added the model-layer registry in `@hbc/models/pcc`:

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
```

It exports:

```ts
PCC_PRIMARY_TAB_IDS
PccPrimaryTabId
PCC_MODULE_IDS
PccModuleId
PCC_MODULE_STATES
PccModuleState
PCC_MODULE_STATE_COPY
PCC_PRIMARY_NAVIGATION_TABS
PCC_NAVIGATION_MODULES
getPrimaryNavigationTab
getModule
getModulesForPrimaryTab
isSelectableModule
getParentTabForModule
normalizePrimaryTabId
normalizeModuleId
```

Current runtime wiring still has these constraints:

- `PccApp.tsx` calls `deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, shell.activeSurfaceId)`.
- `PccApp.tsx` passes `shell.activeSurfaceId` into `PccShell`.
- `PccApp.tsx` passes `shell.setActiveSurface` into `PccShell`.
- `PccApp.tsx` passes `shell.activeSurfaceId` into `PccSurfaceRouter`.
- `PccShell.tsx` props still require `activeSurfaceId: PccMvpSurfaceId`.
- `PccShell.tsx` still passes `activeSurfaceId` into `PccHorizontalTabs`.
- `PccSurfaceRouter.tsx` still routes the legacy eight `PccMvpSurfaceId` values.
- `surfaceHeaderMetadata.ts`, `surfaceHeroCopy.ts`, and `projectShellViewModel.ts` still key against `PccMvpSurfaceId`.
- `PccHorizontalTabs.tsx` still renders the old hardcoded four-top-level-tab / Project Home dropdown model.

Therefore, this prompt must be **additive and compatibility-first**. Do not change `activeSurfaceId` to `PccPrimaryTabId` yet.

---

## Allowed Files

Modify exactly these files:

```text
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/tests/usePccShellState.test.ts
```

No other files may be changed.

---

## Files and Paths You Must Not Touch

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
packages/models/src/pcc/PccPrimaryNavigation.test.ts
packages/models/src/pcc/index.ts

apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
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

If implementation appears to require any file outside the allowed list, stop and report the conflict instead of broadening scope.

---

## Guardrails

- Work against current `main`.
- Inspect repo truth before editing.
- Preserve the existing shell-owned active panel contract.
- Preserve the existing `activeSurfaceId` runtime compatibility contract.
- Preserve `previewMode === true`.
- Do not wire grouped tabs into `PccHorizontalTabs` in this prompt.
- Do not update `PccApp`, `PccShell`, or `PccSurfaceRouter` in this prompt.
- Do not add UI.
- Do not add a standalone Module Launcher.
- Do not add a sidebar, rail, drawer, or persistent secondary navigator.
- Do not add URL routing, query-string routing, SharePoint page routing, browser-history state, `localStorage`, or `sessionStorage`.
- Do not introduce Procore, Sage, SharePoint, tenant, group, list, library, approval, file, HBI, integration, or external-system writeback.
- Do not modify package versions, SPFx manifest versions, package-solution versions, or feature versions.
- Do not run `pnpm install`.
- Do not run Playwright.
- Do not generate evidence.
- Do not render developer-facing copy. This prompt should not change rendered UI at all.

---

## Target State Shape

Update the shell state interfaces to this compatibility-first shape:

```ts
export interface PccShellState {
  /**
   * Legacy rendered surface id used by current PccApp/PccShell/PccSurfaceRouter.
   * Do not change this type in Prompt 02.
   */
  readonly activeSurfaceId: PccMvpSurfaceId;

  /**
   * Phase 05 primary dashboard tab context.
   * This is not wired into the runtime shell/router until later prompts.
   */
  readonly activePrimaryTabId: PccPrimaryTabId;

  /**
   * Phase 05 active module context under the active primary tab.
   */
  readonly activeModuleId?: PccModuleId;

  readonly previewMode: true;
  readonly selectedProjectId?: PccProjectId;
}

export interface PccShellStateActions {
  /**
   * Legacy compatibility action used by current runtime shell/tabs/router.
   * Must remain stable and continue to normalize against PCC_MVP_SURFACE_IDS.
   */
  setActiveSurface(id: PccMvpSurfaceId): void;

  /**
   * Phase 05 primary-tab selection action.
   * Normalizes against PCC_PRIMARY_TAB_IDS and clears activeModuleId.
   */
  selectPrimarySurface(id: PccPrimaryTabId): void;

  /**
   * Phase 05 module selection action.
   * Uses the Phase 05 registry; selectable modules activate their parent primary tab.
   */
  selectModule(id: PccModuleId): void;

  /**
   * Clears only activeModuleId.
   */
  clearActiveModule(): void;

  /**
   * Sets selected project and clears activeModuleId.
   */
  setSelectedProject(id: PccProjectId | undefined): void;
}

export type PccShellStateController = PccShellState & PccShellStateActions;
```

Update `PccShellStateInitial` to support:

```ts
activeSurfaceId?: PccMvpSurfaceId;
activePrimaryTabId?: PccPrimaryTabId;
activeModuleId?: PccModuleId;
selectedProjectId?: PccProjectId;
```

Initial values must be normalized.

---

## Required Imports

Update imports in `usePccShellState.ts` to include the Phase 05 registry types/helpers from `@hbc/models/pcc`:

```ts
import {
  PCC_MVP_SURFACE_IDS,
  getModule,
  isSelectableModule,
  normalizeModuleId,
  normalizePrimaryTabId,
  type PccMvpSurfaceId,
  type PccPrimaryTabId,
  type PccModuleId,
  type PccProjectId,
} from '@hbc/models/pcc';
```

Keep the existing legacy `PccMvpSurfaceId` import/use.

---

## Behavior Rules

### Defaults

- `activeSurfaceId` defaults to `'project-home'`.
- `activePrimaryTabId` defaults to `'project-home'`.
- `activeModuleId` defaults to `undefined`.
- `previewMode` remains literal `true`.
- `selectedProjectId` behaves as it does today.

### Legacy `setActiveSurface(id)`

Keep `setActiveSurface` as the current runtime compatibility action.

Behavior:

- Normalize invalid IDs against the legacy `PCC_MVP_SURFACE_IDS` list.
- Set `activeSurfaceId`.
- Clear `activeModuleId`.
- If the normalized legacy surface ID is also a valid Phase 05 primary tab ID, set `activePrimaryTabId` to that ID.
  - Examples:
    - `'project-home'` -> `activePrimaryTabId = 'project-home'`
    - `'documents'` -> `activePrimaryTabId = 'documents'`
    - `'project-readiness'` is **not** a Phase 05 primary tab, so do not force it into primary-tab state.
- Do not persist state.
- Do not route.

### `selectPrimarySurface(id)`

Behavior:

- Normalize invalid IDs to `'project-home'` using the model helper.
- Set `activePrimaryTabId`.
- Clear `activeModuleId`.
- Do **not** mutate `activeSurfaceId` in this prompt.
  - Rationale: the current runtime router still expects legacy `PccMvpSurfaceId`; Prompt 04 will migrate router/dashboard rendering.
- Do not persist state.
- Do not route.

### `selectModule(id)`

Behavior:

- Normalize invalid IDs using `normalizeModuleId`.
- If invalid, leave state unchanged.
- Use `getModule(normalizedId)`.
- If module is not selectable, leave state unchanged.
- If selectable:
  - set `activePrimaryTabId` to `module.parentTabId`;
  - set `activeModuleId` to `module.id`;
  - do **not** mutate `activeSurfaceId` in this prompt.
- Do not persist state.
- Do not route.
- Do not write to any source system.

### `clearActiveModule()`

Behavior:

- Clear only `activeModuleId`.
- Preserve `activePrimaryTabId`.
- Preserve `activeSurfaceId`.
- Preserve `selectedProjectId`.
- Preserve `previewMode`.

### `setSelectedProject(id)`

Behavior:

- Set `selectedProjectId`.
- Clear `activeModuleId`.
- Preserve `activePrimaryTabId`.
- Preserve `activeSurfaceId`.
- Preserve `previewMode`.

---

## Hook Implementation Requirements

- Keep `useState`.
- Use `useCallback` for all actions.
- Ensure all action references remain stable across rerenders:
  - `setActiveSurface`
  - `selectPrimarySurface`
  - `selectModule`
  - `clearActiveModule`
  - `setSelectedProject`
- Keep helper functions pure.
- Keep runtime guardrails for invalid untyped input.
- Do not throw on invalid initial values or invalid selections.
- Do not add side effects.

You may keep a local helper:

```ts
function normalizeSurfaceId(id: unknown): PccMvpSurfaceId
```

for the legacy `activeSurfaceId` path.

---

## Required Tests

Update only:

```text
apps/project-control-center/src/tests/usePccShellState.test.ts
```

Use existing `renderHook` / `act` style.

Add or update tests proving:

1. Defaults:
   - `activeSurfaceId === 'project-home'`
   - `activePrimaryTabId === 'project-home'`
   - `activeModuleId === undefined`
   - `previewMode === true`
2. Existing legacy `setActiveSurface` still works for legacy surface IDs.
3. Existing legacy `setActiveSurface` still normalizes invalid legacy IDs to `'project-home'`.
4. `setActiveSurface` clears `activeModuleId`.
5. `setActiveSurface('documents')` also aligns `activePrimaryTabId` to `'documents'`.
6. `setActiveSurface('site-health')` does not set `activePrimaryTabId` to `site-health`, because `site-health` is now a Phase 05 module, not a primary tab.
7. `selectPrimarySurface('core-tools')` sets `activePrimaryTabId` to `'core-tools'`.
8. `selectPrimarySurface('core-tools')` clears `activeModuleId`.
9. `selectPrimarySurface` does not mutate `activeSurfaceId`.
10. Invalid primary tab input normalizes to `'project-home'`.
11. Selectable module selection:
    - `selectModule('team-access')` sets `activePrimaryTabId` to `'core-tools'`;
    - sets `activeModuleId` to `'team-access'`;
    - does not mutate `activeSurfaceId`.
12. Selectable module under Document Control:
    - `selectModule('document-control-center')` sets `activePrimaryTabId` to `'documents'`;
    - sets `activeModuleId` to `'document-control-center'`.
13. Non-selectable/deferred module selection leaves state unchanged:
    - example: `'future-estimating-modules'`
14. Invalid module input leaves state unchanged.
15. `clearActiveModule()` clears only `activeModuleId`.
16. `setSelectedProject(id)` clears `activeModuleId`.
17. `setSelectedProject(id)` preserves `activePrimaryTabId`.
18. `setSelectedProject(id)` preserves `activeSurfaceId`.
19. `previewMode === true` across all actions.
20. Setter/action references remain stable across rerenders:
    - `setActiveSurface`
    - `selectPrimarySurface`
    - `selectModule`
    - `clearActiveModule`
    - `setSelectedProject`
21. Initial values normalize:
    - invalid `activeSurfaceId` -> `'project-home'`;
    - invalid `activePrimaryTabId` -> `'project-home'`;
    - invalid `activeModuleId` -> `undefined`.
22. Initial selectable `activeModuleId` sets a valid module context without changing `activeSurfaceId`.
    - If `initial.activeModuleId = 'team-access'`, then:
      - `activeModuleId === 'team-access'`;
      - `activePrimaryTabId === 'core-tools'`;
      - `activeSurfaceId` remains normalized from `initial.activeSurfaceId` or default `'project-home'`.

Use `unknown as PccPrimaryTabId` / `unknown as PccModuleId` only in tests that validate runtime defensive behavior.

---

## Validation

Before editing:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

After editing:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/usePccShellState.test.ts
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/state/usePccShellState.ts apps/project-control-center/src/tests/usePccShellState.test.ts
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not run Playwright in this prompt.

Do not run package builds unless required by type/test failure investigation.

Do not change `pnpm-lock.yaml`. The before/after hash must remain unchanged.

---

## Required Closeout Response

Report:

```markdown
## Prompt 02 Closeout — Shell State Active Primary Tab and Active Module Model

### Files Changed
- ...

### State API Before / After
- Before:
- After:

### Behavior Implemented
- Defaults:
- Legacy setActiveSurface:
- selectPrimarySurface:
- selectModule:
- clearActiveModule:
- setSelectedProject:

### Tests Added / Updated
- ...

### Validation Results
- `git status --short` before:
- `pnpm-lock.yaml` MD5 before:
- `pnpm --filter @hbc/spfx-project-control-center check-types`:
- `pnpm --filter @hbc/spfx-project-control-center test -- src/tests/usePccShellState.test.ts`:
- `pnpm --filter @hbc/spfx-project-control-center test`:
- `pnpm exec prettier --check ...`:
- `git diff --check`:
- `pnpm-lock.yaml` MD5 after:
- `git status --short` after:

### Scope Confirmation
- PccApp/PccShell/PccHorizontalTabs/PccSurfaceRouter untouched:
- Hero metadata/view-model untouched:
- Surfaces untouched:
- Models untouched:
- Playwright/evidence untouched:
- Package/manifest/lockfile untouched:
- No runtime navigation wiring introduced:
- No standalone Module Launcher/sidebar/routing/persistence/writeback introduced:

### Notes / Risks for Prompt 03
- ...
```

Do not create a closeout markdown file unless explicitly instructed. A chat closeout is sufficient.

---

## Hard Stop Conditions

Stop and report instead of editing if:

- `PccPrimaryNavigation` exports are unavailable from `@hbc/models/pcc`.
- The working tree is not clean before editing.
- Typecheck requires changing `PccApp`, `PccShell`, `PccHorizontalTabs`, `PccSurfaceRouter`, hero metadata, or surface files.
- Runtime wiring must be changed to pass validation.
- Validation would require dependency installation or lockfile change.
- The new state cannot be added additively while preserving the existing `activeSurfaceId: PccMvpSurfaceId` compatibility path.
