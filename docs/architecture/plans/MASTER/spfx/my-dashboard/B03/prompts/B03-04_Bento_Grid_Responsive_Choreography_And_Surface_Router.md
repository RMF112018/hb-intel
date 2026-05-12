# B03-04 — Implement My Work Bento Grid, Responsive Choreography, and Surface Router

## Objective

Implement the responsive grid/layout contract and router required for B03’s home vs focused-module view states. This prompt must mirror PCC’s layout philosophy without importing PCC app-local layout primitives directly.

## Prerequisite

Prompts B03-01 through B03-03 are complete.

## Read first

Do not re-read files that are still in your current context or memory. Inspect only what you need.

Reference targets:

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/layout/useContainerBreakpoint.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/my-dashboard/src/shell/MyWorkShell.tsx
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B03_My_Work_Shell_Navigation_And_UX_Development.md
```

## Implement

### 1. Create My Work layout files

```text
apps/my-dashboard/src/layout/MyWorkBentoGrid.tsx
apps/my-dashboard/src/layout/myWorkFootprints.ts
apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts
```

### 2. Responsive modes and columns

Implement B03’s eight-mode responsive policy:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

Columns:

| Mode | Columns |
|---|---:|
| phone | 1 |
| tabletPortrait | 2 |
| tabletLandscape | 6 |
| smallLaptop | 8 |
| standardLaptop | 10 |
| largeLaptop | 12 |
| desktop | 12 |
| ultrawide | 12 |

Use container-width resolution, not raw viewport-width logic.

### 3. Span override contract

Implement a typed override mechanism analogous to PCC’s `resolveDashboardCardColumnSpan`, suitable for B03 cards.

Requirements:
- explicit override wins for the active mode,
- integer truncate and clamp to `[1, columns]`,
- non-finite override falls back to footprint/default behavior,
- exported helpers are testable.

### 4. Grid component

`MyWorkBentoGrid` must expose:

```text
data-my-work-bento-grid
data-my-work-mode
```

and provide enough context for card wrappers to resolve their spans.

### 5. Create surface router

Create:

```text
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
```

Router behavior:

| Condition | Output |
|---|---|
| `activeModuleId` undefined | `MyWorkHomeSurface` |
| `activeModuleId === 'adobe-sign-action-queue'` | `AdobeSignActionQueueModuleSurface` |
| invalid defensive state | normalize/fallback to home |

The router must not own active-panel semantics. The shell main remains the only panel owner.

### 6. Wire router/grid into shell/app path

Ensure the app/shell composition becomes:

```text
MyWorkShell
└── main[tabpanel]
    └── MyWorkBentoGrid
        └── MyWorkSurfaceRouter output
```

### 7. View-state marker

The shell root must surface:

```text
data-my-work-view-state="home"
```

or

```text
data-my-work-view-state="focused-module"
```

based on module selection.

## Tests

Add/extend tests covering:

- responsive mode resolution,
- span override clamping/fallback,
- grid data attributes,
- router home output,
- router focused output,
- fallback behavior,
- shell view-state marker,
- active-panel marker remains only on shell main.

## Validation

Run targeted tests and type checks. Report exact commands/outcomes.

## Hard no-go rules

- Do not import PCC app-local layout components directly into My Dashboard.
- Do not make view-state URL-backed.
- Do not move active-panel ownership into the router.
- Do not re-read files still in current context or memory.

## Completion note

Report:
- layout files introduced,
- responsive policy implemented,
- router path complete,
- whether Prompt 05 is unblocked.
