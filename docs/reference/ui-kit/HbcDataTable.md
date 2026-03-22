# HbcDataTable

**Decision Reference:** D-PH4C-12

Virtualized data table with sorting, pagination, density controls, and lane-grouping support. Used by `HbcMyWorkFeed` for the My Work work-queue surface.

## Import

```tsx
import { HbcDataTable } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<T>[]` | required | Column definitions with header, cell renderer, and sizing metadata |
| `data` | `T[]` | required | Row data array |
| `enableSorting` | `boolean` | `false` | Enables interactive sort headers |
| `enableColumnConfig` | `boolean` | `false` | Enables internal column sizing and configuration |
| `height` | `string` | `'auto'` | Table height. `'auto'` = content-driven (no scroll). Pixel value = virtualized scrolling |
| `estimatedRowHeight` | `number` | density-derived | Row height estimate for virtualizer |
| `isLoading` | `boolean` | `false` | Shows layout-matched shimmer overlay |
| `emptyStateConfig` | `DataTableEmptyStateConfig` | `undefined` | Empty-state title/description/action |
| `savedViewsConfig` | `HbcDataTableSavedViewsConfig` | `undefined` | PH4C config-only saved-views integration |
| `onRowClick` | `(row: T) => void` | `undefined` | Row click handler for master-detail |

## Height Behavior

| `height` value | Overflow | Virtualizer | Use case |
|----------------|----------|-------------|----------|
| `'auto'` (default) | `overflow: visible` | Runs but spacers skipped | Small datasets (2-10 rows per lane) |
| Pixel value (e.g., `'600px'`) | `overflow: auto` | Active with spacer rows | Large datasets requiring scroll |

When `height === 'auto'`, the wrapper expands to fit content without scrollbars. The virtualizer still runs (hooks can't be conditional) but top/bottom spacer rows are skipped for auto-height tables.

## Density Tiers

Detected automatically via `useAdaptiveDensity`:

| Tier | Row height | Cell padding Y | Cell padding X | Trigger |
|------|-----------|----------------|----------------|---------|
| standard (default) | 48px | 8px | 12px | Fine pointer, <1440px |
| compact | 36px | 4px | 8px | Fine pointer, ≥1440px |
| touch | 64px | 16px | 16px | Coarse pointer |

## Row Hover

Row hover uses `var(--colorNeutralBackground3)` — a governed Fluent token that provides visible contrast (#F0F2F5 on #FFFFFF in light theme). Clickable rows (`onRowClick` provided) get hover + pointer cursor.

## Lane Grouping (My Work)

When used inside `HbcMyWorkFeed` with lane grouping, each group section gets:

### Lane-Header Accent Colors

Left-border accent color cascades by grouping type:

| Grouping | Accent source | Fallback |
|----------|--------------|----------|
| Priority | `PRIORITY_COLORS` (red/amber/gray) | `DEFAULT_GROUP_ACCENT` |
| Lane | `LANE_COLORS` (red/amber/gray/info) | `DEFAULT_GROUP_ACCENT` |
| Module | `MODULE_COLORS` (info/amber/gray per module) | `DEFAULT_GROUP_ACCENT` |
| Project | — | `DEFAULT_GROUP_ACCENT` (gray) |

No grouping mode falls to `transparent` — there's always a visible accent.

### Lane Title Formatting

`formatGroupLabel()` is acronym-aware: known domain acronyms (BD, RFI, PM, PMP, QC, HSE, MEP, HVAC, BIM, SPFx) stay uppercase instead of naive title-casing.

### Count Badge

Each lane header shows an item count badge with `aria-label={`${count} items`}`.

### Section Overflow

Lane section wrappers use `overflowX: 'hidden'` + `overflowY: 'visible'` to prevent horizontal bleed while preserving vertical row expansion.

## Column Sizing

With `table-layout: fixed` and `width: 100%`, column `size` values are treated as proportional weights. The My Work table uses a total of ~550px across 5 columns (title, status, source, due, actions) to fit within the ~670px primary-zone container at desktop.

## Sortable-Header Semantics

`aria-sort` is only applied to columns where `header.column.getCanSort()` is true. Non-sortable columns do not expose misleading sort ARIA (`aria-sort` is `undefined`).

## Status Badges in Cells

Status column cells use `HbcStatusBadge` with governed variant mapping:

| Status | Variant |
|--------|---------|
| Overdue | `error` |
| Blocked | `warning` |
| New | `info` |
| In Progress | `inProgress` |
| Waiting | `warning` |
| Deferred | `neutral` |
| Completed | `completed` |

## Source Cell Empty-Value Rules

When `projectName` is null, the source cell renders only the module chip — no placeholder dash. The project color dot and project name row are conditionally hidden.

## Project-Grouping Null State

When Group by Project produces only a "No Project" group, an `HbcBanner variant="info"` warns: "No project data available — assign projects to enable meaningful grouping."

## Item-Detail Drawer

Row click opens an inline detail panel (`role="region"`, `aria-label={`Detail: ${title}`}`) in the right column, replacing Insights/Recent Activity. Supports Escape-to-close and focus management (auto-focus on open, focus-return on close).

## Grouping Menu

HbcCommandBar renders groupings as `role="radiogroup"` with `ToggleButton checked={active}`. Active grouping is visually indicated with brand-colored background.

## Field Mode Behavior

Row backgrounds adapt via Fluent token system. Stripe colors use `hbcFieldTheme` tokens. Header row maintains contrast with darker background.

## Accessibility

- `role="table"` with governed `<thead>`/`<tbody>` semantics
- `aria-sort` only on sortable columns (ascending/descending/none)
- Status badges include `aria-label` with variant + label
- Lane count badges include `aria-label` with count
- Keyboard navigation via tabindex on the table wrapper
- Focus indicators on interactive controls

## SPFx Constraints

No SPFx-specific constraints. Column widths use proportional sizing that adapts to container width.
