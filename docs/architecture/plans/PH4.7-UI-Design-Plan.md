# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 7
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 7. Data Visualization & Table System

---

### 7.1 `HbcDataTable` — Full Specification **[V2.1 — Adaptive Density + Responsibility Heat Map]**

**Dependencies:** `@tanstack/react-table ^8.21.0`, `@tanstack/react-virtual ^3.13.0`

#### Adaptive Density System **[V2.1]**

`HbcDataTable` automatically selects a density tier based on device input signals. No manual configuration is required from users. The correct experience is delivered by default.

**Tier Selection Logic:**

| Tier | Row Height | Font Size | Touch Target | Activation Condition |
|---|---|---|---|---|
| **Compact** | 36px | 13px | 36px | `pointer: fine` (mouse) AND viewport width ≥ 1440px |
| **Standard** | 48px | 14px | 44px | `pointer: fine` AND viewport 768–1439px, OR `pointer: coarse` on large screen with keyboard |
| **Touch** | 64px | 16px | **56px** | `pointer: coarse` AND viewport < 1024px, OR tablet detected |

**Auto-detection implementation:**
```ts
// Evaluated once on mount, re-evaluated on resize/orientation change
function detectDensityTier(): DensityTier {
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const width = window.innerWidth;
  if (isCoarse && width < 1024) return 'touch';
  if (width >= 1440 && !isCoarse) return 'compact';
  return 'standard';
}
```

**Manual override:** A density control in `HbcCommandBar` shows the current auto-detected tier and allows the user to override. Override preference is persisted to `localStorage` key `hbc-density-{toolId}`. If an override exists, it takes precedence over auto-detection. The control label shows: `"Density: Auto (Touch)"` or `"Density: Compact (Manual)"`.

**Card transformation:** When viewport width < 640px, `HbcDataTable` automatically renders as a **card stack** rather than a table. Each card shows the 4–5 most critical columns (defined per tool via `mobileCardFields` prop) with a chevron to expand full details inline. This eliminates horizontal scrolling on mobile — the most frequently cited mobile frustration across all reviewed platforms.

**Field Mode density:** In Field Mode, the Touch tier activates by default regardless of `pointer` media query, on the assumption that field users in dark mode are on a mobile device. Override remains available.

#### Responsibility Heat Map **[V2.1]**

When the `responsibilityField` prop is set on `HbcDataTable`, rows where the authenticated user matches that field's value receive visual responsibility highlighting:

```
┌──────────────────────────────────────────────────────────────────┐
│▌ RFI #042  Concrete Pour Question   ● Overdue  John Smith  ...  │ ← 4px #F37021 left border + #FFF5EE bg
│  RFI #043  Submittal Review         ● Open     Jane Doe    ...  │ ← standard row
│▌ RFI #047  Change Order Review      ● Open     John Smith  ...  │ ← 4px #F37021 left border + #FFF5EE bg
│  RFI #051  Waterproofing Detail     ● Closed   Tom Brown   ...  │ ← standard row
└──────────────────────────────────────────────────────────────────┘
```

- Left border: `4px solid #F37021` (`--hbc-accent-orange`)
- Background: `#FFF5EE` (`--hbc-responsibility-bg`) in light mode; `#2A1F0F` in Field Mode
- The heat map applies regardless of density tier
- Works on both table and card-stack views (card-stack shows a top border instead of left border)
- `responsibilityField` prop value: the column accessor key for the Ball in Court / assignee field (e.g., `"ballInCourt"`, `"assigneeId"`)
- The authenticated user's ID is passed via `currentUserId` prop

#### Required Features (Full)

**Column Configuration**
- Column show/hide toggle via column picker panel.
- Drag-to-reorder via drag handles on column headers.
- Column resize via drag handles on column borders.
- Per-column sort toggle with directional arrow indicator.

**Saved Views System** (see Section 7.2)

**Inline Editing**
- Double-click editable cell to activate. Pencil icon on row hover.
- Tab: next editable cell. Enter/blur: save. Escape: revert.
- Editable cells: subtle dashed bottom border in default state.

**Row Selection**
- Checkbox leftmost column. Select All selects current page.
- Selecting any row reveals bulk action bar in `HbcCommandBar`.

**Empty State**
- `HbcEmptyState` in table body when no rows or filtered to zero.
- Each tool provides `emptyStateConfig` prop: icon, title, description, primary action.

**Loading State — Shimmer Skeleton [V2.1]**
- Layout-matched shimmer skeletons replace the generic spinner-then-content pattern.
- Skeleton rows match the exact column widths and heights of the current density tier.
- Shimmer animation: gradient sweep `left-to-right` at 1.5s cycle on `--hbc-surface-2` background.
- Skeleton count: matches the last known page size (or 10 rows if unknown).
- When data loads, skeleton rows crossfade to real rows at `200ms ease-out` — no layout shift.

**Virtualization**
- `@tanstack/react-virtual` applied for tables with 100+ rows.
- 60fps maintained on mid-range Android tablet.
- Row height values from active density tier fed into the virtualizer.

**Horizontal Scroll**
- Native horizontal scrollbar when column count exceeds viewport.
- Up to 2 columns may be frozen (leftmost by default: the item identifier column).

**Data Freshness Indicator [V2.1]**
- When table data is served from service worker cache (stale-while-revalidate), the table container renders a `1px dashed top border` using `--hbc-border-default`.
- When background revalidation completes and fresh data loads, the border transitions to solid at `300ms ease`.
- This provides ambient data freshness awareness without any text or toast notification.

---

### 7.2 Saved Views — Three-Tier Specification **[V2.1]**

| Attribute | Specification |
|---|---|
| **Scopes** | **Personal** (per-user, per-tool) · **Project** (shared with all project members, created by PM role+) · **Organization** (shared across all projects, Admin only) |
| **Contents** | Visible columns, column order, column widths, active filters, active sort column + direction, group-by setting, density tier override |
| **Persistence** | `HBIntel_UserViews` SharePoint list. Schema: `UserId` (text), `ToolId` (text), `Scope` (text: personal/project/org), `ProjectId` (text, null for org scope), `ViewName` (text, max 50 chars), `ViewConfig` (JSON string), `IsDefault` (boolean) |
| **Deep Links** | Each saved view generates a shareable URL encoding the view state as a base64-encoded query parameter: `?view=eyJ...`. Navigating to this URL restores the exact filter/sort/column state. Service worker caches view definitions in IndexedDB for offline access |
| **System Default** | Each tool ships with a system default view. `IsDefault: true`. Cannot be deleted |
| **View Limit** | Max 20 personal views per user per tool. Warn at 18. Block at 20 |
| **Selector UI** | Dropdown in `HbcCommandBar` showing: personal views, then project views (labeled `[Project]`), then org views (labeled `[HBC]`). "Save current view" and "Manage views" options |

---

### 7.3 KPI Cards

KPI cards render above `HbcDataTable` in `ToolLandingLayout`. Click filters the table.

**Card Anatomy:**
```
┌─────────────────────────┐
│ Metric Label (label)    │  ← muted, label intent
│                         │
│  142                    │  ← display intent, bold
│                         │
│  ↑ 12% from last week   │  ← body-small, colored per trend
└─────────────────────────┘
     ▲ 3px top border in semantic color
```

Active card: `2px solid #004B87` full border + `#E8F1F8` background.

Maximum: 5 KPI cards per tool.

---

### 7.4 Chart Components

All charts use **ECharts** via `echarts-for-react`. Lazy-loaded. ECharts bundle in its own Rollup chunk.

| Component | Chart Type | Construction Use Cases |
|---|---|---|
| `HbcBarChart` | Vertical/Horizontal bar | Items by Company, Cost by Trade |
| `HbcDonutChart` | Donut/Pie | Status distribution |
| `HbcLineChart` | Line/Area | Budget variance over time |
| `HbcKpiCard` | Single metric | Standalone KPI |

All chart series use HBC brand palette. Charts click-to-filter the associated `HbcDataTable`. Charts reflow on sidebar expand/collapse.