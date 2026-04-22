# 01 — Safety Implementation Map

## 1. Root runtime
### `apps/safety/src/App.tsx`
The app root composes:
- `HbcThemeProvider`
- `QueryClientProvider`
- `HbcErrorBoundary`
- `ComplexityProvider`
- `SafetyRepositoryProvider`
- `RouterProvider`

This means the visible Safety posture is shaped by:
- shared theme mode behavior,
- shared repository state,
- TanStack Router memory-history navigation,
- and shared shell/layout primitives.

### Key implication
The app is not a standalone visual island. It inherits platform theme behavior and shared UI-kit shell/layout behavior before any page-specific code runs.

---

## 2. Router and shell composition
### `apps/safety/src/router/index.ts`
Uses `createMemoryHistory({ initialEntries: ['/'] })`.

### `apps/safety/src/router/root-route.tsx`
Wraps every page in `ShellLayout mode="simplified"` and injects a custom `toolPickerSlot`.

### `packages/shell/src/ShellLayout/index.tsx`
Simplified mode composes:
- `HeaderBar`
- `BackToProjectHub`
- `main[data-hbc-shell="shell-content"]`

### `packages/shell/src/HeaderBar/index.tsx`
The default header tool picker would normally render nav-store items, but Safety bypasses that by providing its own `toolPickerSlot`.

### Structural finding
Safety is not using a governed navigation primitive here. It is rendering raw buttons in a `<nav>` inside `toolPickerSlot`, with no explicit active-route styling, no route-aware selection state, and no richer disclosure model.

---

## 3. Route tree
### `apps/safety/src/router/routes.ts`
Routes:
- `/` → Upload
- `/upload`
- `/periods`
- `/projects/$projectNumber/weeks/$weekStartDate`
- `/inspections`
- `/inspections/$inspectionEventId`
- `/review`
- `/incidents`

### Structural finding
The route tree is more complete than the screenshots alone suggest. The weakness is not missing routes; it is weak surface realization of those routes.

---

## 4. Page layer
### Upload
`apps/safety/src/pages/UploadPage.tsx`
- uses `WorkspacePageShell layout="form"`
- direct content buttons
- hidden native file input
- custom result banner logic
- no page actions contract
- no explicit loading/empty state props to WPS

### Reporting period dashboard
`apps/safety/src/pages/ReportingPeriodDashboardPage.tsx`
- uses `WorkspacePageShell layout="dashboard"`
- no `dashboardConfig`
- raw `<table>`
- manual empty row
- no KPI layer
- no chart zone

### Review queue
`apps/safety/src/pages/ReviewQueuePage.tsx`
- uses `WorkspacePageShell layout="list"`
- no `listConfig`
- raw `<table>`
- direct action buttons in content zone
- manual empty row

### Inspections
`apps/safety/src/pages/InspectionsPage.tsx`
- uses `WorkspacePageShell layout="list"`
- no `listConfig`
- raw `<table>`
- raw filter wiring
- manual no-results row

### Inspection detail
`apps/safety/src/pages/InspectionDetailPage.tsx`
- uses `WorkspacePageShell layout="detail"`
- direct loading text
- fixed 4-column stat grid via inline style
- raw list and raw table
- direct external link
- section summary manually composed

### Project week detail
`apps/safety/src/pages/ProjectWeekDetailPage.tsx`
- uses `WorkspacePageShell layout="detail"`
- fixed 4-column stat grid
- raw table
- manual empty row

### Incidents
`apps/safety/src/pages/IncidentsPage.tsx`
- uses `WorkspacePageShell layout="list"`
- full-page smart empty state
- explicit future-wave placeholder content

---

## 5. Governing page-shell contract
### `packages/ui-kit/src/WorkspacePageShell/index.tsx`
WPS is intended to own:
- title/breadcrumb/header rhythm,
- command bar actions,
- layout-aware loading states,
- layout-aware empty/error states,
- dashboard and list layout integration,
- supported mode gating,
- field/office mode action treatment.

### `docs/reference/ui-kit/WorkspacePageShell.md`
Documents explicit requirements:
- pages should pass loading/empty/error via props,
- page actions should flow through `actions` / `overflowActions`,
- list pages should use `listConfig`,
- dashboard pages should use `dashboardConfig`,
- field mode and supported mode behavior are first-class.

### Structural finding
The Safety pages are using WPS only partially. They get the title shell, but much of the intended layout/state/action contract is bypassed.

---

## 6. Layout primitives being bypassed
### `packages/ui-kit/src/layouts/DashboardLayout.tsx`
Provides:
- responsive KPI grid,
- chart zone,
- full-width data zone.

### `packages/ui-kit/src/layouts/ListLayout.tsx`
Provides:
- filter toolbar,
- saved views bar,
- pill strip,
- table/card zone,
- bulk action bar,
- responsive/controlled filter model.

### Structural finding
Safety’s dashboard page does not supply KPI/chart content. Safety’s list pages do not supply `listConfig`. So the app is missing most of the structure the repo already created to make these page families look productized.

---

## 7. Theme and mode seam
### `apps/safety/src/App.tsx`
Wraps in `HbcThemeProvider`.

### `docs/architecture/plans/archive/PH4C.11-Field-Mode-Theme-Wiring.md`
Explicitly states all app roots, including `apps/safety`, use `HbcThemeProvider` and inherit live field-mode state.

### Structural finding
The wrong dark/field presentation is likely not a local CSS anomaly. It is likely a result of shared theme-mode inheritance plus the Safety pages failing to constrain `supportedModes`.

---

## 8. CSS and package posture
### `apps/safety/src/webpart.css`
Minimal CSS:
- shell layout flex,
- shell content padding,
- no dark canvas definitions.

### `apps/safety/config/package-solution.json`
Package name is `hb-intel-safety`, version `1.2.0.0`.

### `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`
- title `HB Intel Safety`
- supports theme variants
- SharePoint + TeamsPersonalApp host support

### Structural finding
The visible dark posture is not explained by the local webpart CSS. That strengthens the case that theme/shell inheritance is the deeper root cause.

---

## 9. Validation footprint
### `e2e/webparts/safety.spec.ts`
Only validates:
- no error boundary,
- simplified shell content renders,
- back-to-project-hub text visible.

### `apps/safety/src/test/router.test.ts`
Only validates router creation and root route resolution.

### Structural finding
The current automated acceptance bar is far below the flagship quality bar. Existing tests do not verify:
- navigation quality,
- page-shell contract usage,
- responsive behavior,
- state-model completeness,
- or any visual/interaction requirements tied to doctrine.
