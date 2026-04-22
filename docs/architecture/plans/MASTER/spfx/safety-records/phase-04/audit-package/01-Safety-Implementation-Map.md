# Safety Implementation Map

## 1. Entry and runtime ownership

### SPFx entry
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- SharePoint boots the webpart, resolves SPFx permissions, bootstraps auth, and mounts the React app.

### React app root
- `apps/safety/src/App.tsx`
- Wraps the application with:
  - `HbcThemeProvider forceTheme="light"`
  - `ForceOfficeMode`
  - `QueryClientProvider`
  - `HbcErrorBoundary`
  - `ComplexityProvider`
  - `SafetyRepositoryProvider`
  - `RouterProvider`

### Repository mode seam
- `packages/features/safety/src/factory.ts`
- Repository is created in:
  - `sharepoint` mode when SPFx HTTP client is present
  - `mock` mode otherwise

This is a real architecture seam with visible UX implications. Any hosted/package drift here can materially change runtime credibility.

## 2. Routing and shell composition

### Root shell
- `apps/safety/src/router/root-route.tsx`
- Uses `ShellLayout` in simplified mode.
- Injects route-aware `HbcTabs` for:
  - Upload
  - Periods
  - Review
  - Inspections

### Route surface map
- `/` → `UploadPage`
- `/upload` → `UploadPage`
- `/periods` → `ReportingPeriodDashboardPage`
- `/projects/$projectNumber/weeks/$weekStartDate` → `ProjectWeekDetailPage`
- `/inspections` → `InspectionsPage`
- `/inspections/$inspectionEventId` → `InspectionDetailPage`
- `/review` → `ReviewQueuePage`
- `/incidents` → redirect to `/periods?from=incidents`

## 3. Data and query seams

### Feature package boundary
- `packages/features/safety/src/index.ts`
- Exports domain types, list descriptors, sharepoint adapters, ingestion pipeline, hooks, and repository context.

### Query hook layer
- `packages/features/safety/src/hooks/queries.ts`
- Thin query/mutation wrappers for:
  - `useReportingPeriods`
  - `useProjectWeeks`
  - `useProjectWeek`
  - `useInspections`
  - `useInspection`
  - `useFindings`
  - `useIngestionRuns`
  - `useReviewQueue`
  - `useSafetyIngestion`
  - `useReplayIngestion`

Mutation invalidation currently uses broad `['safety']` invalidation.

## 4. Page-surface map

### Upload
- `apps/safety/src/pages/UploadPage.tsx`
- Surface model:
  - masthead
  - primary intake card
  - period selector
  - hidden raw file input + button
  - submit action
  - result banner
  - supporting aside cards

### Reporting period dashboard
- `apps/safety/src/pages/ReportingPeriodDashboardPage.tsx`
- Surface model:
  - masthead
  - shell KPI cards
  - period select
  - project-week table
  - redirect info banner from retired incidents route

### Review queue
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- Surface model:
  - masthead
  - review queue table
  - per-row governed actions via `SafetyReviewActions`

### Inspections list
- `apps/safety/src/pages/InspectionsPage.tsx`
- Surface model:
  - masthead
  - period select
  - project-number text filter
  - inspections table

### Inspection detail
- `apps/safety/src/pages/InspectionDetailPage.tsx`
- Surface model:
  - masthead
  - stat strip
  - findings card
  - section summary sidecard
  - provenance sidecard

### Project-week detail
- `apps/safety/src/pages/ProjectWeekDetailPage.tsx`
- Surface model:
  - masthead
  - stat strip
  - optional weekly summary card
  - inspection events table
  - partial-failure banner for inspection events

## 5. Local authored primitives

### Thin authored family
- `SafetyMasthead.tsx`
- `SafetySectionHeader.tsx`
- `SafetyStatStrip.tsx`
- `SafetyScoreStrip.tsx`
- `SafetyFindingsList.tsx`
- `SafetyReviewActions.tsx`

The app does have a recognizable local surface family, but it is intentionally thin and does not yet create a premium flagship design language of its own.

## 6. Styling and responsive seams

### Primary stylesheet
- `apps/safety/src/webpart.css`

### What it governs now
- root shell min-height
- shell-content padding
- page/detail/upload layout grids
- masthead treatment
- stat strip breakpoints
- filter bar sizing
- upload drop-zone
- findings list
- score strip
- review action row
- link affordance
- reduced-motion handling

### Responsive reality
The stylesheet defines a few viewport breakpoints, but the application does **not** yet express a strong, explicit, container-aware narrowest-stable contract.

## 7. Package and host seams

### Package config
- `apps/safety/config/package-solution.json`
- Package path targets `solution/hb-intel-safety.sppkg`

### Hosted evidence in this audit
- Live repo source on `main`
- SharePoint screenshot of the Upload tab in a blocked period-loading state

### Limitation
The actual `.sppkg` binary was referenced in the prompt but was **not available for direct binary inspection in this session**, so package-truth assessment is limited to:
- source structure
- package config
- hosted screenshot evidence
