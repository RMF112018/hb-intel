# 01 — Safety Implementation Map

## 1. Entrypoints and runtime ownership

### Development entry
- `apps/safety/src/main.tsx`
- boots mock auth when `resolveAuthMode() === 'mock'`
- mounts `<App />`
- imports `./webpart.css`

### SPFx entry
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- resolves SPFx permissions in `onInit()`
- bootstraps SPFx auth
- mounts `<App spfxContext={this.context} />`

### Manifest
- `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`
- SharePoint webpart + TeamsPersonalApp host support
- titled `HB Intel Safety`

## 2. Application composition seam

### App shell
- `apps/safety/src/App.tsx`

Responsibilities:
- theme provider
- react-query provider
- error boundary
- complexity provider
- safety repository provider
- runtime list-GUID overlay application
- sharepoint-vs-mock repository selection
- router creation / mounting

Assessment:
- good orchestration boundary
- weak product surface posture is not caused by `App.tsx`; it is caused mostly by downstream presentation pages and shell usage quality

## 3. Router and workspace shell seam

### Router
- `apps/safety/src/router/index.ts`
- `apps/safety/src/router/root-route.tsx`
- `apps/safety/src/router/routes.ts`

Routes:
- `/` → Upload
- `/upload`
- `/periods`
- `/projects/$projectNumber/weeks/$weekStartDate`
- `/inspections`
- `/inspections/$inspectionEventId`
- `/review`
- `/incidents`

### Simplified shell seam
- `root-route.tsx` wraps the app in `ShellLayout`
- simplified config exposes:
  - Upload
  - Periods
  - Review
  - Inspections
  - Incidents

Material issue:
- the tool-picker slot is a flat set of raw `<button>` elements
- no premium tab treatment
- no active-state system
- no shell-fit intelligence
- no mobile-aware overflow strategy
- this seam materially contributes to the app reading as generic and underdesigned

## 4. Shared shell and page-shell seams

### Shell container
- `packages/shell/src/ShellLayout/index.tsx`
- `packages/shell/src/HeaderBar/index.tsx`

Material behavior:
- app-owned header strip inside SharePoint page canvas
- optional back-to-project-hub band
- content area rendered inside `[data-hbc-shell="shell-content"]`

### Page shell
- `packages/ui-kit/src/WorkspacePageShell/index.tsx`

Capabilities available:
- loading / error / empty states
- dashboard layout
- list layout
- command bar
- sticky header mode
- banner support
- field-mode FAB
- supported-mode gating

Critical gap:
- the Safety pages mostly **do not use these capabilities meaningfully**
- they pass `layout` labels, but not the configuration/state props that would let the shell do real work

## 5. Page seams

### Upload
- `apps/safety/src/pages/UploadPage.tsx`

Current posture:
- narrow form rail
- plain description text
- raw hidden file input
- minimal success/error banner
- extremely sparse page occupancy

### Reporting period dashboard
- `apps/safety/src/pages/ReportingPeriodDashboardPage.tsx`

Current posture:
- select control + raw table
- `layout="dashboard"` used nominally, but no `dashboardConfig`
- no real dashboard object model

### Project week detail
- `apps/safety/src/pages/ProjectWeekDetailPage.tsx`

Current posture:
- title block
- fixed 4-column stat grid
- summary text
- raw inspection table

### Inspections
- `apps/safety/src/pages/InspectionsPage.tsx`

Current posture:
- filter row
- raw table
- no responsive list adaptation
- no premium scanning hierarchy

### Inspection detail
- `apps/safety/src/pages/InspectionDetailPage.tsx`

Current posture:
- title/meta
- source workbook link
- fixed 4-column stat row
- findings as plain unordered list
- section summary as raw table

### Review queue
- `apps/safety/src/pages/ReviewQueuePage.tsx`

Current posture:
- explanatory copy
- raw table
- inline action cluster per row
- likely strongest workflow value page, but still visually plain

### Incidents
- `apps/safety/src/pages/IncidentsPage.tsx`

Current posture:
- explicit future-release placeholder via `HbcSmartEmptyState`
- exposed route but not credible product surface yet

## 6. Data seams

### Domain package
- `packages/features/safety/src/index.ts`
- `packages/features/safety/README.md`

Material strengths:
- typed contracts
- query hooks
- repository abstraction
- ingestion pipeline contract
- documented list topology
- replay lineage rules
- explicit terminal states

### Query seam
- `packages/features/safety/src/hooks/queries.ts`

Material weakness as-visible-in-UX:
- the hooks expose rich query state potential
- the pages mostly collapse that state into `data = []` rendering, leaking ambiguity into the UX

## 7. Styling seams

### Global app css
- `apps/safety/src/webpart.css`

Visible effects:
- root font baseline
- `#root { min-height: 100vh; }`
- shell layout/body/content flex treatment
- content padding of 24px

Assessment:
- extremely thin styling layer
- contributes to large blank canvas and generic structure
- no serious local primitive system
- no page-family styling contract

### Local page styling
- mostly inline `style={...}` blocks inside page files

Assessment:
- maintainability drift
- weak variant governance
- poor path to flagship refinement

## 8. Validation seams

### E2E
- `e2e/webparts/safety.spec.ts`

Coverage today:
- renders without error boundary
- shows simplified shell content
- shows back-to-project-hub link

Assessment:
- useful smoke coverage
- nowhere near enough for flagship proof, responsive proof, or closure proof

## 9. Hosted evidence seam

### Attached screenshot
Observed outcome:
- the SharePoint host remains intact
- the Safety surface stays inside the canvas
- the workspace is visually too sparse, too narrow in authority, and too empty below the fold
- the first screen reads as “functional internal tool shell” rather than “premium product surface”
