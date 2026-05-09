# Fresh Local Code Agent Prompt — PCC Phase 05

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation** inside `apps/project-control-center`.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Work against current `main`.
- Inspect repo truth before editing.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between primary dashboard surfaces and child modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not add a standalone hero/header Module Launcher.
- Do not add a persistent PCC sidebar.
- Do not introduce URL routing, query-string routing, or SharePoint page routing.
- Do not introduce Procore, Sage, SharePoint, tenant, group, list, library, approval, or HBI writeback.
- Do not present developer copy in the UI. All rendered content must be production-grade and end-user-facing.
- Do not render these strings in product UI: TODO, TBD, placeholder, stub, mock, fixture, debug, dev-only, not implemented, lorem, developer, code agent, prompt, repo, test selector, internal only.
- Do not delete existing surfaces to satisfy navigation changes. Map, adapt, or wrap them safely.

## Objective

Generalize `PccHorizontalTabs` from a hardcoded Project Home child-menu pattern into registry-driven dropdowns for every primary tab.

## Scope

Modify:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/shellSurfaceSelection.ts
```

and any direct unit tests for tab behavior.

## Target Props

Update props to support active module context:

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

## Required Rendering

- Render primary tabs from `PCC_PRIMARY_NAVIGATION_TABS`.
- Render all eight primary tabs in locked order.
- Render a dropdown toggle for each primary tab.
- Toggle label: `Open {Primary Tab Label} modules`.
- Toggle marker: `data-pcc-nav-toggle="{primaryTabId}"`.
- Parent wrapper marker: `data-pcc-surface-nav-parent="{primaryTabId}"`.
- Menu marker: `data-pcc-module-menu="{primaryTabId}"`.
- Module item marker: `data-pcc-module-nav-item="{moduleId}"`.
- Active module marker: `data-pcc-module-active="true"` on active module item.
- Non-selectable module marker: `data-pcc-module-selectable="false"`.

## Keyboard Behavior

- ArrowLeft / ArrowRight / Home / End select primary tabs.
- ArrowDown on primary tab opens its module menu and focuses first visible module item.
- ArrowDown / ArrowUp move through module items.
- Escape closes menu and returns focus to parent tab.
- Enter / Space on primary tab selects primary dashboard and clears active module.
- Enter / Space on selectable module item calls `onSelectModule`.
- Enter / Space on non-selectable module item does not call `onSelectModule`.

## UI Copy

Dropdown visible content must include:

- module label;
- state label;
- reason/cue copy.

Non-selectable modules must use production-grade reason copy from the registry.

Do not render forbidden developer terms.

## Tests

Add/update tests proving:

- all eight primary tabs render;
- every tab has a dropdown toggle;
- every dropdown can open;
- opening one dropdown closes the previously open dropdown;
- Escape closes dropdown;
- ArrowDown opens dropdown;
- ArrowUp/ArrowDown navigate items;
- selectable module click calls `onSelectModule`;
- non-selectable module click does not call `onSelectModule`;
- disabled/future module reason copy is visible;
- Document Control visible label is present;
- visible Documents tab label is absent;
- no forbidden developer copy renders.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Closeout

Include:

- summary of tab/dropdown behavior;
- accessibility behavior verified;
- tests added/updated;
- confirmation that no separate hero/header module launcher was created.
