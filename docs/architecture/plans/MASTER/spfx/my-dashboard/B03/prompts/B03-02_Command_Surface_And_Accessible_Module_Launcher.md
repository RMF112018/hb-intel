# B03-02 — Implement My Work Command Surface and Accessible Module Launcher

## Objective

Implement the My Work shell command surface and one-surface/one-module navigation pattern, adapting PCC’s grouped tab + module launcher architecture without carrying over PCC project semantics.

## Prerequisite

Prompt B03-01 is complete. The My Work navigation registry and shell-state hook exist and compile.

## Read first

Do not re-read files that are still in your current context or memory. Inspect only what you need.

Reference targets:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccShell.module.css
packages/models/src/myWork/MyWorkNavigation.ts
apps/my-dashboard/src/state/useMyWorkShellState.ts
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B03_My_Work_Shell_Navigation_And_UX_Development.md
```

## Implement

### 1. Create shell/navigation components

Create:

```text
apps/my-dashboard/src/shell/MyWorkShell.tsx
apps/my-dashboard/src/shell/MyWorkShell.module.css
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.module.css
```

### 2. Shell root and command surface

`MyWorkShell` must own:

- shell root:
  - `data-my-work-shell`
  - `data-my-work-shell-mode`
  - `data-my-work-view-state`
- command surface:
  - `data-my-work-command-surface`
- canvas:
  - `data-my-work-canvas`
- active panel main:
  - `id="my-work-active-surface-panel"`
  - `role="tabpanel"`
  - `aria-labelledby="my-work-tab-my-work-home"`
  - `data-my-work-active-surface-panel="my-work-home"`

Do not create active-panel markers anywhere else.

### 3. My Work primary navigation

Render one primary tab group:

- primary surface:
  - label `My Work Home`,
  - `role="tab"`,
  - `aria-selected`,
  - `aria-controls`,
  - `id="my-work-tab-my-work-home"`,
  - `data-my-work-tab-id="my-work-home"`,
  - `data-my-work-tab-active`.

- attached module launcher button:
  - native `<button>`,
  - `aria-label="Open My Work Home modules"`,
  - `aria-haspopup="menu"`,
  - `aria-expanded`,
  - `aria-controls`,
  - `data-my-work-module-launcher="my-work-home"`.

### 4. Adobe Sign module menu

The open menu must render:

- `role="menu"`,
- `data-my-work-module-menu="my-work-home"`.

The Adobe queue item must render:

- `role="menuitem"`,
- `data-my-work-module-menu-item="adobe-sign-action-queue"`,
- `data-my-work-module-active`,
- label,
- state label `Read-only`,
- summary,
- authority cue.

Use the registry metadata created in B03-01. Do not duplicate the copy by hand in multiple files.

### 5. Keyboard behavior

Implement the B03 contract:

| Key | Expected behavior |
|---|---|
| Enter / Space on tab | activates home and clears focused module |
| ArrowDown on tab or launcher | opens menu and moves focus to first module item |
| ArrowUp / ArrowDown inside menu | cycles module items (only one currently, but preserve generic behavior) |
| Home / End inside menu | first/last item behavior |
| Escape inside menu | closes menu and returns focus to home tab or launcher per your chosen pattern; document and test the exact behavior |
| Enter / Space on module item | selects Adobe module and closes menu |

Use PCC’s tested behavior as the implementation precedent where applicable.

### 6. Mouse/touch behavior

- Clicking the launcher toggles the menu.
- Clicking the Adobe module selects it.
- Clicking the home tab returns to home state.
- Do not rely on hover-only access.

### 7. Styling expectations

Use CSS Modules and the My Dashboard design direction inherited from B02/B03:

- premium command-surface quality,
- visible active indicator,
- readable compact/comfortable density,
- strong focus-visible styles,
- no raw mock/dev visual treatment,
- respect reduced motion.

Do not add command search here.

## Tests

Add/extend tests for:

- tablist/tab semantics,
- launcher ARIA attributes,
- menu/menuitem semantics,
- keyboard activation,
- Escape focus return,
- module selection callback,
- no extra primary tabs,
- data-attribute presence.

## Validation

Run changed-scope tests and type checks. Report exact commands/outcomes.

## Hard no-go rules

- No detached hero/global module launcher.
- No fake additional tabs.
- No command search.
- No route/search-param implementation.
- No project-context vocabulary.
- Do not re-read files still in current context or memory.

## Completion note

Report:
- files changed,
- interaction pattern implemented,
- exact focus-return behavior chosen/tested,
- whether Prompt 03 is unblocked.
