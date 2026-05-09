# Prompt 04 — Migrate PCC Surface Router to Phase 05 Primary Dashboards and Retire Prompt 03 Legacy Bridge

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation** inside `apps/project-control-center`.

This prompt migrates runtime dashboard routing from the legacy `PccMvpSurfaceId` axis to the Phase 05 `PccPrimaryTabId` axis and removes the Prompt 03 compatibility bridge.

---

## Objective

Complete the Phase 05 runtime routing migration for the PCC shell:

```text
Primary Tab = Dashboard Surface
Dropdown / Child Module Link = Module Entry Point under that Dashboard Surface
```

After this prompt:

- `PccSurfaceRouter` must route by `activePrimaryTabId: PccPrimaryTabId`, not legacy `activeSurfaceId: PccMvpSurfaceId`.
- The shell `<main role="tabpanel">` must label and mark the active Phase 05 primary tab.
- Every Phase 05 primary tab must render a production-grade dashboard surface with direct-child bento cards.
- The temporary Prompt 03 legacy compatibility bridge must be removed.
- Existing legacy surfaces must not be deleted; they must be reused, wrapped, or mapped safely inside the new primary-tab dashboard surfaces where appropriate.
- Hero/header copy migration remains out of scope unless typecheck forces a minimal compatibility adjustment.

---

## Current Repo-Truth Baseline to Respect

Prompt 01 added the Phase 05 navigation registry in `@hbc/models/pcc`.

Prompt 02 added shell state fields/actions:

```ts
activeSurfaceId: PccMvpSurfaceId;        // legacy, still exists in hook
activePrimaryTabId: PccPrimaryTabId;
activeModuleId?: PccModuleId;
selectPrimarySurface(id: PccPrimaryTabId): void;
selectModule(id: PccModuleId): void;
clearActiveModule(): void;
setActiveSurface(id: PccMvpSurfaceId): void; // legacy compatibility only
```

Prompt 03 wired `PccHorizontalTabs` to the Phase 05 primary-tab/module model but added a temporary bridge so legacy router/hero tests stayed green:

- `PccApp` still passes `onSelectLegacySurface={shell.setActiveSurface}`.
- `PccApp` still passes `shell.activeSurfaceId` to `PccSurfaceRouter`.
- `PccShell` still accepts/forwards `onSelectLegacySurface`.
- `PccShell` still labels the panel with `aria-labelledby={`pcc-tab-${activeSurfaceId}`}`.
- `PccHorizontalTabs` still contains temporary bridge maps and sr-only legacy compatibility markers.
- `shellSurfaceSelection.ts` still maps legacy `PccMvpSurfaceId` navigation requests onto Phase 05 controls.

Prompt 04 must retire those transitional seams.

---

## Non-Negotiable Guardrails

- Work against current `main`.
- Inspect repo truth before editing.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not add URL routing, query-string routing, SharePoint page routing, browser-history state, `localStorage`, or `sessionStorage`.
- Do not introduce Procore, Sage, SharePoint, tenant, group, list, library, approval, HBI, integration, or external-system writeback.
- Do not add a standalone Module Launcher.
- Do not add a sidebar, rail, drawer, or persistent secondary navigator.
- Do not delete existing surfaces.
- Do not render developer copy in product UI.
- Do not render these strings in product UI: TODO, TBD, placeholder, stub, mock, fixture, debug, dev-only, not implemented, lorem, developer, code agent, prompt, repo, test selector, internal only.
- Do not change package versions, SPFx manifest versions, package-solution versions, feature versions, package files, or `pnpm-lock.yaml`.
- Do not run Playwright.
- Do not generate live evidence.

---

## Allowed Files

Modify only files needed for router/dashboard migration, bridge removal, and tests.

Expected files:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css

apps/project-control-center/src/surfaces/**

apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.invariants.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/PccSurfaceNoDuplicateHeader.test.tsx
apps/project-control-center/src/tests/PccPrompt07.surfaces.test.tsx
apps/project-control-center/src/tests/shellSurfaceSelection.ts
```

You may update other `apps/project-control-center/src/tests/**` files only if they are directly broken because they still iterate `PCC_MVP_SURFACE_IDS` / legacy surface navigation. Keep such updates narrow and explain them in closeout.

---

## Files and Paths You Must Not Touch

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
packages/models/src/pcc/PccPrimaryNavigation.test.ts
packages/models/src/pcc/index.ts

apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/tests/usePccShellState.test.ts

apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts

apps/project-control-center/config/package-solution.json
e2e/pcc-live/**
playwright.pcc-live.config.ts
package.json
apps/project-control-center/package.json
packages/models/package.json
pnpm-lock.yaml
```

If typecheck or tests require changes to hero metadata/copy, projectShellViewModel, e2e files, package files, manifests, or lockfile, stop and report. Do not silently broaden scope.

---

## Required Bridge Removal

Remove the temporary Prompt 03 compatibility bridge from runtime code.

### `PccApp.tsx`

Remove:

```tsx
onSelectLegacySurface={shell.setActiveSurface}
```

Update router call from legacy:

```tsx
<PccSurfaceRouter activeSurfaceId={shell.activeSurfaceId} readModelClient={readModelClient} />
```

to Phase 05:

```tsx
<PccSurfaceRouter
  activePrimaryTabId={shell.activePrimaryTabId}
  activeModuleId={shell.activeModuleId}
  readModelClient={readModelClient}
/>
```

Keep hero view-model derivation unchanged unless typecheck forces otherwise:

```ts
const heroViewModel = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, shell.activeSurfaceId);
```

Hero copy migration is Prompt 06. Do not make it part of Prompt 04.

### `PccShell.tsx`

Remove from props and implementation:

```ts
onSelectLegacySurface?: (id: PccMvpSurfaceId) => void;
```

Stop forwarding `activeSurfaceId` / `onSelectLegacySurface` into `PccHorizontalTabs`.

Keep `activeSurfaceId` in `PccShellProps` only if still needed by hero/panel compatibility, but do not use it for tabpanel semantics after this prompt.

Update `<main>` to the Phase 05 primary-tab axis:

```tsx
<main
  id={ACTIVE_PANEL_ID}
  role="tabpanel"
  aria-labelledby={`pcc-tab-${activePrimaryTabId}`}
  className={styles.canvas}
  data-pcc-canvas=""
  data-pcc-active-surface-panel={activePrimaryTabId}
>
```

The shell `<main>` must remain the sole semantic owner of `data-pcc-active-surface-panel`.

### `PccHorizontalTabs.tsx`

Remove:

```ts
PRIMARY_TAB_LEGACY_SURFACE_MAP
MODULE_LEGACY_SURFACE_MAP
LEGACY_COMPAT_TAB_IDS
activeSurfaceId?: PccMvpSurfaceId
onSelectLegacySurface?: (id: PccMvpSurfaceId) => void
data-pcc-legacy-compat
legacyCompatMarker rendering
```

Primary tabs become the only `role="tab"` elements. The count of:

```css
[data-pcc-horizontal-tabs] [role="tab"]
```

must equal `PCC_PRIMARY_TAB_IDS.length`.

Primary tab selection:

- calls only `onSelectPrimarySurface(tab.id)`;
- closes any open menu;
- does not call legacy surface selection.

Module selection:

- calls only `onSelectModule(module.id)` for selectable modules;
- closes the menu;
- does not call legacy surface selection.

Non-selectable module selection:

- calls neither callback;
- keeps reason copy reviewable.

Remove comments that say the bridge will be removed in Prompt 04.

### `shellSurfaceSelection.ts`

Migrate away from legacy navigation.

Required helpers:

```ts
export function getPrimaryTabSelectionControl(
  container: HTMLElement,
  id: PccPrimaryTabId,
): HTMLButtonElement | null;

export function getPrimaryNavToggle(
  container: HTMLElement,
  id: PccPrimaryTabId,
): HTMLButtonElement | null;

export function openPrimaryModuleMenu(
  container: HTMLElement,
  id: PccPrimaryTabId,
): HTMLElement | null;

export function getModuleSelectionControl(
  container: HTMLElement,
  id: PccModuleId,
): HTMLButtonElement | null;
```

Preferred: remove `getSurfaceSelectionControl` and migrate tests to Phase 05 helpers. Tests must not rely on legacy navigation after Prompt 04.

---

## Required Router Contract

Update `PccSurfaceRouter.tsx`.

Replace:

```ts
activeSurfaceId: PccMvpSurfaceId;
```

with:

```ts
activePrimaryTabId: PccPrimaryTabId;
activeModuleId?: PccModuleId;
```

Router props:

```ts
export interface PccSurfaceRouterProps {
  activePrimaryTabId: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
  readModelClient?: IPccSurfaceRouterReadModelClient;
}
```

The router must render all eight primary tabs:

```ts
project-home
core-tools
documents
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Unknown primary tab input should defensively normalize to `project-home` if the type is bypassed. Use `normalizePrimaryTabId` if needed.

---

## Required Dashboard Render Strategy

### 1. `project-home`

Render existing `PccProjectHome`.

Must remain reachable from primary tab `project-home`.

### 2. `documents`

Render existing `PccDocumentsSurface`.

Visible primary tab label is `Document Control`, but internal primary tab id remains `documents`.

### 3. New dashboard shells

Create production-grade dashboard shells for:

```text
core-tools
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Preferred implementation:

Create a reusable Phase 05 dashboard component under:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/
```

Suggested files:

```text
PccPrimaryDashboardSurface.tsx
PccPrimaryDashboardSurface.module.css
```

Each new primary dashboard must render as direct children under the shell's existing `PccBentoGrid`.

Because `PccSurfaceRouter` output is placed inside `PccBentoGrid`, each new dashboard surface should return a fragment of `PccDashboardCard` children, not a wrapper `<div>` around all cards.

Each dashboard must include at least three direct-child cards/sections:

1. Overview / purpose card.
2. Module status card.
3. Active module context card or next-actions/context card.

Use registry data for labels and module states:

```ts
getPrimaryNavigationTab(activePrimaryTabId)
getModulesForPrimaryTab(activePrimaryTabId)
getModule(activeModuleId)
PCC_MODULE_STATE_COPY
```

Active module context:

- If `activeModuleId` belongs to the active primary tab, show:
  - module label;
  - state label;
  - summary;
  - authority cue;
  - disabled reason if present.
- If no active module, show production-grade guidance such as:
  - “Select a module from the tab menu to review its project context.”
- If active module does not belong to the active primary tab, do not show stale module context; clear or ignore it in display.

Copy must be production-grade and end-user-facing.

---

## Required Surface Reuse / Mapping

Do not delete existing surfaces. Reuse them where practical:

- `project-home` → `PccProjectHome`
- `documents` → `PccDocumentsSurface`
- `core-tools` may summarize HBI Assistant, External Platforms, Team & Access, Project Directory, Approvals & Checkpoints.
- `startup-closeout` may summarize Startup Center, Responsibility Matrix, Closeout, Warranty, Lessons Learned, and related readiness/closeout concepts.
- `project-controls` may summarize Project Controls, Permits & Inspections, Contract & Compliance, Risk / Issues / Decisions, Constraints Log, Field Operations, Meeting & Communication.
- `cost-time` may summarize Financial Reporting, Schedule Monitor, Procurement & Buyout, Commitment / Cost Exposure.
- `systems-administration` may summarize Site Health, Control Center Settings, Integration Settings, Procore Mapping / Sync Health, Module Configuration.
- `estimating-preconstruction` may summarize future estimating modules, preconstruction handoff, estimate assumptions / alternates / exclusions.

Do not embed old full legacy surfaces inside the new dashboard if that causes nested bento/card wrappers or breaks direct-child invariants. Prefer summary dashboard cards that link conceptually to modules through registry copy.

---

## Required Test Migration

The tests must migrate from legacy `PCC_MVP_SURFACE_IDS` navigation to Phase 05 primary-tab navigation.

### Navigation tests

`PccShell.navigation.test.tsx` must assert:

1. All eight primary tabs render.
2. Exactly eight primary `role="tab"` elements render.
3. No `[data-pcc-legacy-compat]` markers render.
4. Default active panel marker is `project-home`.
5. Clicking each primary tab updates:
   - `[data-pcc-tab-id="${tabId}"][aria-selected="true"]`
   - `main[role="tabpanel"][data-pcc-active-surface-panel="${tabId}"]`
   - `main[role="tabpanel"][aria-labelledby="pcc-tab-${tabId}"]`
6. Opening a module menu and selecting a selectable module keeps the parent primary tab active and shows active module marker.
7. Non-selectable modules do not set active module marker.
8. Visible primary tab label `Document Control` exists.
9. Visible primary tab label `Documents` is absent.

### Router / dashboard tests

Add or update router tests proving:

1. Router renders each of the eight primary tabs.
2. Each primary tab output includes at least one direct child `[data-pcc-card]` under the shell bento grid.
3. Every new dashboard renders at least three direct child cards.
4. `documents` primary tab renders the existing document surface.
5. `project-home` primary tab renders the existing project home surface.
6. Active module context uses the module label, not the module id.
7. Active module context is ignored when it does not belong to the active primary tab.
8. No forbidden developer copy renders.

### Existing collateral tests

Search for tests using:

```text
PCC_MVP_SURFACE_IDS
PCC_MVP_SURFACES
PccMvpSurfaceId
getSurfaceSelectionControl
data-pcc-legacy-compat
team-and-access
external-systems
project-readiness
approvals
control-center-settings
site-health
```

Update only the tests directly affected by the router/navigation axis migration.

Do not weaken tests by merely deleting assertions. Replace legacy navigation assertions with Phase 05 primary-tab/dashboard assertions, or render the legacy surface directly if the test is truly surface-specific.

Add hard assertions that the Prompt 03 bridge is gone:

```ts
expect(container.querySelector('[data-pcc-legacy-compat]')).toBeNull();
expect(container.querySelectorAll('[data-pcc-horizontal-tabs] [role="tab"]')).toHaveLength(PCC_PRIMARY_TAB_IDS.length);
```

Search source for bridge symbols and ensure none remain:

```text
onSelectLegacySurface
PRIMARY_TAB_LEGACY_SURFACE_MAP
MODULE_LEGACY_SURFACE_MAP
LEGACY_COMPAT_TAB_IDS
data-pcc-legacy-compat
legacyCompatMarker
getSurfaceSelectionControl
```

Preferred result is zero matches.

---

## Required Product-Copy Guard

Add or preserve a rendered-copy guard covering the shell + active dashboard content.

Scan visible text under the PCC app container for forbidden developer terms:

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

Comments, test names, and identifiers do not matter. Product-rendered strings do.

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
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccShell.navigation.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccApp.bentoIntegration.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccShell.invariants.test.tsx
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
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
## Prompt 04 Closeout — Phase 05 Router and Dashboard Surface Migration

### Files Changed
- ...

### Runtime Migration Summary
- PccApp:
- PccShell:
- PccHorizontalTabs:
- PccSurfaceRouter:

### Bridge Removal Summary
- onSelectLegacySurface:
- PRIMARY_TAB_LEGACY_SURFACE_MAP:
- MODULE_LEGACY_SURFACE_MAP:
- LEGACY_COMPAT_TAB_IDS:
- data-pcc-legacy-compat:
- getSurfaceSelectionControl:

### Dashboard Render Strategy
- project-home:
- core-tools:
- documents:
- estimating-preconstruction:
- startup-closeout:
- project-controls:
- cost-time:
- systems-administration:

### Tests Added / Updated
- ...

### Validation Results
- `git status --short` before:
- `pnpm-lock.yaml` MD5 before:
- `pnpm --filter @hbc/models build`:
- `pnpm --filter @hbc/spfx-project-control-center check-types`:
- targeted test results:
- `pnpm --filter @hbc/spfx-project-control-center test`:
- `pnpm exec prettier --check ...`:
- `git diff --check`:
- `pnpm-lock.yaml` MD5 after:
- `git status --short` after:

### Scope Confirmation
- Existing surfaces not deleted:
- Hero metadata/copy untouched:
- ProjectShellViewModel untouched:
- Playwright/evidence untouched:
- Package/manifest/lockfile untouched:
- No standalone Module Launcher/sidebar/routing/persistence/writeback introduced:
- Prompt 06 remains responsible for hero/header metadata + final copy cleanup:
- Prompt 08 remains responsible for live Playwright evidence:

### Notes / Risks for Prompt 05
- ...
```

Do not create a closeout markdown file unless explicitly instructed. A chat closeout is sufficient.

---

## Hard Stop Conditions

Stop and report instead of editing if:

- Phase 05 registry exports are unavailable from `@hbc/models/pcc`.
- Prompt 02 shell-state fields/actions are unavailable.
- Prompt 03 grouped tabs are not present.
- The working tree is not clean before editing.
- Typecheck requires changing hero metadata/copy or projectShellViewModel.
- Bridge removal cannot be completed without keeping the full SPFx tests green.
- Dashboard surfaces cannot be rendered as bento direct children without broad surface rewrites.
- Validation requires `pnpm install` or lockfile changes.
- Any change would require external-system writeback, routing, persistence, or package/manifest updates.
