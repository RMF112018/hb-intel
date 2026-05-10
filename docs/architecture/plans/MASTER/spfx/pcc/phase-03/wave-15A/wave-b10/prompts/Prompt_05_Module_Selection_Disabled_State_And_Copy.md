# Prompt 05 — Module Selection UX, Non-Selectable Module Behavior, and Production Copy Hardening

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation** inside `apps/project-control-center`.

This prompt is a **UX/copy/test hardening prompt** after Prompt 04. It must not reopen the router migration, bridge removal, or hero/header migration.

---

## Objective

Harden the Phase 05 module-selection experience now that runtime routing is on the `PccPrimaryTabId` axis.

Focus on:

```text
1. Selectable module behavior
2. Non-selectable / disabled-state behavior
3. Selected-module dashboard context
4. Authority/no-writeback copy
5. False-affordance prevention
6. Product-copy guard coverage
```

After this prompt:

- Selectable modules remain selectable and update `activePrimaryTabId` + `activeModuleId`.
- Non-selectable modules remain focusable/readable but never mutate active module state.
- Disabled/deferred/configuration/source-unavailable reason copy is visible and production-grade.
- Selected-module dashboard context displays module label, state, state reason, summary, and authority cue.
- Module IDs do not render as user-facing selected-module copy.
- HBI, launch-only, approvals, Procore, financial, and Sage authority boundaries are clearly represented where applicable.
- No URL routing, persistence, external writeback, approval action, or standalone module launcher is introduced.

---

## Current Repo-Truth Baseline to Respect

Prompt 01 added the Phase 05 navigation registry in `@hbc/models/pcc`.

Prompt 02 added shell state:

```ts
activeSurfaceId: PccMvpSurfaceId;        // legacy, still present for hero compatibility only
activePrimaryTabId: PccPrimaryTabId;
activeModuleId?: PccModuleId;
selectPrimarySurface(id: PccPrimaryTabId): void;
selectModule(id: PccModuleId): void;
clearActiveModule(): void;
setActiveSurface(id: PccMvpSurfaceId): void; // retained in hook, not wired to runtime UI/router
```

Prompt 04 migrated runtime navigation to the Phase 05 axis:

- `PccApp` passes `activePrimaryTabId` and `activeModuleId` to `PccSurfaceRouter`.
- `PccShell` panel marker and `aria-labelledby` now track `activePrimaryTabId`.
- `PccSurfaceRouter` switches on `activePrimaryTabId`.
- Six primary tabs share `PccPrimaryDashboardSurface`.
- `project-home` reuses `PccProjectHome`.
- `documents` reuses `PccDocumentsSurface`.
- The Prompt 03 legacy bridge is removed.

Current `PccHorizontalTabs` already:

- renders the eight primary tabs from the registry;
- renders module dropdowns from `getModulesForPrimaryTab`;
- uses module buttons with `role="menuitem"`;
- marks non-selectable modules with `aria-disabled="true"` and `data-pcc-module-selectable="false"`;
- guards non-selectable click/key activation;
- calls `onSelectModule(module.id)` only for selectable modules.

Current `PccPrimaryDashboardSurface` already:

- renders three direct-child `PccDashboardCard` items for the six reusable dashboards;
- displays module status from the registry;
- displays selected-module context when `activeModuleId` belongs to the active primary tab;
- falls back to “Select a module” when no active module or mismatched module.

Prompt 05 should improve and prove this behavior. It should not redesign it.

---

## Critical Correction from the Original Prompt 05

Do **not** set `activeSurfaceId` when a module is selected.

The runtime router/panel is now Phase 05 primary-tab based. The correct selected-module behavior is:

```text
selectModule(moduleId)
  → activePrimaryTabId = module.parentTabId
  → activeModuleId = module.id
  → activeSurfaceId remains unchanged legacy hero compatibility state
```

`activeSurfaceId` remains in the hook only for legacy hero compatibility until Prompt 06. Do not use it for Prompt 05 UI/router behavior.

---

## Allowed Files

Modify only files required for module UX/copy/test hardening.

Expected files:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.module.css

apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/usePccShellState.test.ts
```

You may update `packages/models/src/pcc/PccPrimaryNavigation.ts` and `packages/models/src/pcc/PccPrimaryNavigation.test.ts` **only if** repo-truth audit shows the existing registry copy fails the Prompt 05 authority/copy requirements. If model copy is changed, keep it surgical and rerun `@hbc/models` checks/tests. Do not change registry IDs, parent mappings, states, or selectability in this prompt.

---

## Files and Paths You Must Not Touch

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/state/usePccShellState.ts

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

If a validation failure appears to require changes to router, shell, app wiring, hero metadata/copy, legacy surface files, package files, e2e files, or lockfile, stop and report.

---

## Required Behavior

### Selectable modules

When a selectable module is selected by click, Enter, or Space:

1. `selectModule(module.id)` is invoked exactly once.
2. `activePrimaryTabId` becomes `module.parentTabId`.
3. `activeModuleId` becomes `module.id`.
4. The dropdown closes.
5. The parent dashboard renders selected-module context.
6. The selected-module context uses the module label, not the module ID.
7. No URL, browser history, storage, external writeback, or approval action occurs.

### Non-selectable modules

When a non-selectable module is clicked or activated with Enter / Space:

1. `selectModule` is not invoked.
2. `activePrimaryTabId` does not change.
3. `activeModuleId` does not change.
4. The menu remains open.
5. The item remains focusable.
6. `aria-disabled="true"` remains present.
7. `data-pcc-module-selectable="false"` remains present.
8. Reason copy remains visible.
9. It is visually distinct from a selectable action.
10. It is not rendered as an anchor.
11. It does not imply a live workflow.

### Primary tab selection

When a primary tab is selected:

1. `selectPrimarySurface(tab.id)` is invoked.
2. `activePrimaryTabId` becomes `tab.id`.
3. `activeModuleId` clears.
4. Shell panel marker tracks the primary tab.
5. No module context from the prior primary tab remains visible.

---

## Required UI / Copy Hardening

### Dropdown module items

Each module item must visibly include:

- module label;
- state label;
- summary;
- authority cue;
- disabled reason when `selectable === false`.

For non-selectable modules, the disabled reason must be visually associated with the item and remain visible while the menu is open.

Add or preserve clear state markers:

```tsx
data-pcc-module-state={module.state}
data-pcc-module-selectable={module.selectable ? 'true' : 'false'}
data-pcc-module-active={module.id === activeModuleId ? 'true' : 'false'}
aria-disabled={module.selectable ? undefined : 'true'}
```

Do not use native `disabled` for non-selectable module buttons, because the reason copy must remain keyboard-reviewable.

### Selected-module dashboard context

When `activeModuleId` belongs to the active primary tab, the selected-module card must visibly include:

- module label;
- state label;
- state reason from `PCC_MODULE_STATE_COPY[module.state].reason`;
- summary;
- authority cue;
- disabled reason if present.

Add stable markers to the selected-module context if they do not already exist:

```tsx
data-pcc-selected-module-card=""
data-pcc-selected-module-id={contextModule.id}
data-pcc-selected-module-state={contextModule.state}
data-pcc-selected-module-parent-tab={contextModule.parentTabId}
```

If there is no valid module context:

```tsx
data-pcc-selected-module-card=""
data-pcc-selected-module-empty="true"
```

Do not render raw module IDs as visible user-facing text.

### Module status dashboard card

The module status card should distinguish:

- selectable modules;
- non-selectable modules;
- available / preview / read-only / launch-only / configuration-required / source-unavailable / deferred states.

Add stable markers where useful:

```tsx
data-pcc-dashboard-module-row={module.id}
data-pcc-dashboard-module-selectable={module.selectable ? 'true' : 'false'}
data-pcc-dashboard-module-state={module.state}
```

---

## Required Authority / Boundary Copy

Use registry copy as the source of truth where it already satisfies these requirements. If copy is insufficient, update the registry copy surgically and update registry tests.

Required boundaries:

### HBI Assistant

Visible authority cue must communicate:

```text
HBI is advisory.
It does not make decisions.
It does not approve work.
It does not write back to source systems.
```

Do not render copy implying HBI can make decisions, approve, reject, waive, or write back.

### Launch-only external modules

Visible authority cue must communicate:

```text
Opens or references the source system.
PCC does not write back to that system.
```

This applies to launch-only modules such as:

- External Platforms
- Procore Documents
- Document Crunch
- Adobe Sign

### Approvals & Checkpoints

Visible authority cue must communicate read-only/checkpoint context and must not expose or imply:

```text
approve
reject
waive
override
```

Use wording such as:

```text
Checkpoint context only. Approval decisions remain in governed workflows.
```

### Procore

Visible authority cue must communicate that Procore remains source of truth for Procore-owned records or that PCC does not write back to Procore.

### Financial / Sage

Where financial modules or cost/time dashboard copy appears, visible cue must communicate that financial information is presented for review and Sage remains the accounting book of record.

This is especially relevant for:

- Cost & Time dashboard
- Financial Reporting
- Commitment / Cost Exposure
- Procurement & Buyout, if financial exposure is discussed

Do not introduce new Sage integration behavior. This is copy only.

---

## Required Visual / Accessibility Hardening

In `PccHorizontalTabs.module.css` and `PccPrimaryDashboardSurface.module.css`, harden:

- non-selectable module item treatment;
- active module treatment;
- state-chip readability;
- focus-visible treatment;
- no color-only state communication;
- cursor behavior for non-selectable modules;
- readable multi-line module authority/reason copy.

Non-selectable module items should not look like primary enabled actions. They may still be buttons for focus/keyboard review, but their state must be clear through:

- state label text;
- disabled reason text;
- `aria-disabled`;
- visual treatment.

---

## Required Tests

### `usePccShellState.test.ts`

Add or preserve tests proving:

1. `selectModule('team-access')` sets `activePrimaryTabId` to `core-tools` and `activeModuleId` to `team-access`.
2. `selectModule('document-control-center')` sets `activePrimaryTabId` to `documents` and `activeModuleId` to `document-control-center`.
3. Non-selectable module selection leaves state unchanged.
4. Invalid module selection leaves state unchanged.
5. `selectPrimarySurface` clears `activeModuleId`.
6. `activeSurfaceId` is not used as the selected module/router axis and remains unchanged by `selectModule`.

Do not edit hook implementation unless these tests uncover a real regression.

### `PccHorizontalTabs.test.tsx`

Add or preserve tests proving:

1. Selectable module click calls `onSelectModule` exactly once and closes the menu.
2. Selectable module Enter calls `onSelectModule` exactly once and closes the menu.
3. Selectable module Space calls `onSelectModule` exactly once and closes the menu.
4. Non-selectable module click does not call `onSelectModule` and keeps the menu open.
5. Non-selectable module Enter / Space does not call `onSelectModule` and keeps the menu open.
6. Non-selectable module item has `aria-disabled="true"`.
7. Non-selectable module item has `data-pcc-module-selectable="false"`.
8. Non-selectable module item is not a link / anchor.
9. Disabled reason copy is visible for deferred modules.
10. HBI Assistant authority cue includes advisory/no-decision/no-approval/no-writeback meaning.
11. Launch-only module authority cue includes source-system/no-writeback meaning.
12. Approvals & Checkpoints copy does not render approve/reject/waive/override action affordance copy.
13. No forbidden developer copy renders across every opened dropdown menu.

### `PccShell.navigation.test.tsx`

Add or preserve integration tests proving:

1. Selecting a module through the menu updates the parent primary tab and selected-module marker.
2. Selecting a primary tab after selecting a module clears the active module.
3. Non-selectable module selection does not change the active module marker.
4. Shell panel marker remains on `activePrimaryTabId`.
5. No URL/history/storage mutation is introduced. If URL/history/storage cannot be reliably tested, assert no code-level usage through a source grep in validation.

### `PccSurfaceRouter.phase05.test.tsx`

Add or preserve tests proving:

1. Selected-module card uses module label, not module ID.
2. Selected-module card renders state label.
3. Selected-module card renders state reason from `PCC_MODULE_STATE_COPY`.
4. Selected-module card renders authority cue.
5. HBI Assistant selected-module context shows advisory/no-decision/no-approval/no-writeback meaning.
6. Launch-only selected-module context shows no-writeback cue.
7. Approvals selected-module context has no approve/reject/waive/override action copy.
8. Cost & Time / financial context includes Sage/accounting book-of-record copy if financial copy appears.
9. Mismatched `activeModuleId` is ignored.
10. No forbidden developer copy renders.

### Product copy guard

Add or preserve a visible-text scan over:

- horizontal tabs with each menu opened one at a time;
- each reusable Phase 05 dashboard;
- selected-module context for representative modules.

Forbidden terms:

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

Identifiers and test names do not matter. Visible rendered text does.

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
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/usePccShellState.test.ts
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccHorizontalTabs.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccShell.navigation.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccSurfaceRouter.phase05.test.tsx
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If `packages/models/src/pcc/PccPrimaryNavigation.ts` is not changed, `@hbc/models check-types/test` may still be run as a confidence gate. If model copy is changed, those checks are mandatory.

If Prettier fails, run `pnpm exec prettier --write` only on changed files, then rerun targeted tests and the full SPFx package test.

Do not run Playwright in this prompt.

Do not run package builds beyond `@hbc/models build` unless required by a type/test failure investigation.

Do not change `pnpm-lock.yaml`.

---

## Required Source Grep Guard

After implementation, run source checks to prove Prompt 05 did not reintroduce forbidden architecture:

```bash
grep -rE "onSelectLegacySurface|PRIMARY_TAB_LEGACY_SURFACE_MAP|MODULE_LEGACY_SURFACE_MAP|LEGACY_COMPAT_TAB_IDS|data-pcc-legacy-compat|legacyCompatMarker|getSurfaceSelectionControl" apps/project-control-center/src/
```

Expected: zero matches, except positive absence assertions may contain `data-pcc-legacy-compat` in tests if already present. Do not reintroduce bridge code.

Also check for routing/persistence/writeback risk:

```bash
grep -rE "localStorage|sessionStorage|history\.pushState|URLSearchParams|window\.location|approve|reject|waive|override" apps/project-control-center/src/shell apps/project-control-center/src/surfaces/phase05Dashboard apps/project-control-center/src/tests
```

Review any matches. Test assertions may intentionally check forbidden action words are absent; product-rendered UI must not contain approval action affordance copy.

---

## Closeout

Return a chat closeout only. Do not create a closeout markdown file unless explicitly instructed.

Include:

```markdown
## Prompt 05 Closeout — Module Selection UX and Copy Hardening

### Files Changed
- ...

### Behavior Summary
- Selectable modules:
- Non-selectable modules:
- Primary tab selection:
- Selected-module dashboard context:

### Copy / Authority Boundary Summary
- HBI:
- Launch-only:
- Approvals:
- Procore:
- Financial / Sage:
- No-writeback posture:

### Tests Added / Updated
- ...

### Validation Results
- `git status --short` before:
- `pnpm-lock.yaml` MD5 before:
- `pnpm --filter @hbc/models build`:
- model checks, if run:
- SPFx typecheck:
- targeted tests:
- full SPFx test:
- Prettier:
- `git diff --check`:
- grep guards:
- `pnpm-lock.yaml` MD5 after:
- `git status --short` after:

### Scope Confirmation
- `activeSurfaceId` not reintroduced as the runtime navigation axis:
- Router/app/shell migration from Prompt 04 preserved:
- Prompt 03 bridge not reintroduced:
- Hero metadata/copy untouched:
- e2e/live evidence untouched:
- Package/manifest/lockfile untouched:
- No standalone Module Launcher/sidebar/routing/persistence/writeback introduced:

### Notes / Risks for Prompt 06
- ...
```

---

## Hard Stop Conditions

Stop and report instead of editing if:

- The current repo is not post-Prompt-04, meaning router/panel still runs on `activeSurfaceId`.
- Implementing Prompt 05 would require changing `PccApp`, `PccShell`, `PccSurfaceRouter`, or `usePccShellState`.
- Copy changes require modifying registry IDs, states, parent mappings, or selectability.
- Tests require reintroducing the Prompt 03 legacy bridge.
- Validation requires `pnpm install` or lockfile changes.
- Any product UI would need to render URL routing, persistence, writeback, approval action, or developer-copy affordances.
