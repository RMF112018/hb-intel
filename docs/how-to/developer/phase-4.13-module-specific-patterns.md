# Phase 4.13 — Module-Specific UI Patterns (Developer Guide)

**Phase:** 4.13 | **Blueprint:** §1d | **Plan:** PH4.13-UI-Design-Plan.md §13.1–13.8

## Overview

Phase 4.13 delivers module-specific UI patterns that wire existing ui-kit components into 8 construction modules. The primary deliverable is **module configuration presets** (column definitions, KPI arrays, tab configs) plus 5 new components and a HbcDataTable frozen-columns enhancement.

## New Components

### HbcScoreBar
Horizontal bar with red/amber/green segments and a score marker. Used in Scorecards module detail view.

```tsx
import { HbcScoreBar } from '@hbc/ui-kit';

<HbcScoreBar score={72} showLabel height="14px" />
```

### HbcApprovalStepper
Vertical/horizontal approval workflow stepper with avatars, decision badges, and timestamps. Reused by Scorecards (approval chain) and Turnover (signature stepper).

```tsx
import { HbcApprovalStepper } from '@hbc/ui-kit';

<HbcApprovalStepper
  steps={[
    { id: '1', userName: 'Sarah Chen', userRole: 'PM', decision: 'approved', timestamp: '2026-03-01T10:00:00Z' },
    { id: '2', userName: 'Mike Torres', userRole: 'Safety', decision: 'pending' },
  ]}
/>
```

### HbcPhotoGrid
Responsive CSS Grid photo gallery with hover overlays, "+N more" truncation, and optional add-photo tile. Used by Punch List and Daily Log.

```tsx
import { HbcPhotoGrid } from '@hbc/ui-kit';

<HbcPhotoGrid
  photos={photos}
  columns={3}
  maxDisplay={9}
  onPhotoClick={(photo) => openLightbox(photo)}
  onAddPhoto={() => openUploader()}
/>
```

### HbcCalendarGrid
Month calendar grid for Daily Log. Standalone layout (not ToolLandingLayout). Shows status dots, weather icons, crew counts, and today highlight.

```tsx
import { HbcCalendarGrid } from '@hbc/ui-kit';

<HbcCalendarGrid
  year={2026}
  month={2}
  days={calendarData}
  onDayClick={(date) => navigateToDailyLog(date)}
  onMonthChange={(dir) => handleMonthNav(dir)}
/>
```

### HbcDrawingViewer
3-layer PDF viewer with markup annotations. Uses pdfjs-dist (peer dep, lazy-loaded). Supports pinch-zoom, pan, and SVG-based markup tools.

```tsx
import { HbcDrawingViewer } from '@hbc/ui-kit';

<HbcDrawingViewer
  pdfUrl="/drawings/S-101.pdf"
  enableMarkup
  markups={existingMarkups}
  sheetOptions={sheets}
  onMarkupCreate={(markup) => saveMarkup(markup)}
/>
```

## HbcDataTable Enhancement: Frozen Columns

```tsx
<HbcDataTable
  data={data}
  columns={columns}
  frozenColumns={['costCode', 'description']}
/>
```

Frozen columns use `position: sticky` + cumulative `left` offsets. Compatible with virtualization. Last frozen column gets a shadow border for visual separation.

## Module Configuration Objects

Module configs are **TypeScript data objects**, not React components. They export column definitions, KPI arrays, and tab configurations. Page-level composition happens in `apps/pwa`.

```tsx
import { rfisLanding, rfisDetail } from '@hbc/ui-kit';

// Use in a ToolLandingLayout page:
<ToolLandingLayout toolName={rfisLanding.toolName} kpiCards={rfisLanding.kpiCards}>
  <HbcDataTable
    columns={rfisLanding.table.columns}
    frozenColumns={rfisLanding.table.frozenColumns}
    responsibilityField={rfisLanding.table.responsibilityField}
    data={fetchedData}
  />
</ToolLandingLayout>
```

### Available Configs

| Module | Landing | Detail | Extra |
|--------|---------|--------|-------|
| Scorecards | `scorecardsLanding` | `scorecardsDetail` | — |
| RFIs | `rfisLanding` | `rfisDetail` | — |
| Punch List | `punchListLanding` | `punchListDetail` | — |
| Drawings | `drawingsLanding` | — | `disciplineFilters` |
| Budget | `budgetLanding` | — | — |
| Daily Log | — | — | `dailyLogSections`, `dailyLogVoiceFields` |
| Turnover | `turnoverLanding` | `turnoverDetail` | `turnoverTearsheetSteps` |
| Documents | `documentsLanding` | — | — |

## Peer Dependencies

Phase 4.13 introduces one new peer dependency:

- `pdfjs-dist` >= 4.0.0 — Required only if using `HbcDrawingViewer`. Lazy-loaded via dynamic `import()`.

## Storybook

All new components have dedicated story files. Module pattern stories are at `Module Patterns/Landing Pages` in Storybook.
