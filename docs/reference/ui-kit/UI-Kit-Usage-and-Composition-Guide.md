# UI Kit Usage and Composition Guide

> **Doc Classification:** Living Reference — WS1-T10 developer-facing guide for Wave 1 teams using `@hbc/ui-kit`.

**Audience:** Wave 1 developers building Personal Work Hub, Project Hub, and other Wave 1 surfaces
**Read With:** `UI-Kit-Wave1-Page-Patterns.md` (T08), `UI-Kit-Visual-Language-Guide.md` (T10)

---

## Installation and Import

### Install

```bash
pnpm add @hbc/ui-kit
```

`@hbc/ui-kit` is a private workspace package — it's already available in the monorepo.

### Import Components

```tsx
import { HbcButton, HbcCard, HbcDataTable, WorkspacePageShell } from '@hbc/ui-kit';
```

### Import Theme Tokens

```tsx
import {
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
  HBC_SURFACE_LIGHT,
  hbcRadii,
  hbcTypeScale,
  hbcSpacing,
} from '@hbc/ui-kit';
```

### Import Types

```tsx
import type { HbcCardProps, CardWeight, DensityTier, ContentLevel } from '@hbc/ui-kit';
```

### Fluent UI Passthrough

Import Fluent UI primitives through `@hbc/ui-kit`, not directly from `@fluentui/react-components`:

```tsx
// Correct
import { FluentProvider, Text, Badge, Button } from '@hbc/ui-kit';

// Incorrect — violates D-10
import { FluentProvider } from '@fluentui/react-components';
```

---

## Density System

### Using `useDensity()`

```tsx
import { useDensity, HBC_DENSITY_TOKENS } from '@hbc/ui-kit';

function MyComponent() {
  const { tier } = useDensity();
  const tokens = HBC_DENSITY_TOKENS[tier];

  return (
    <div style={{ minHeight: tokens.rowHeightMin }}>
      {/* Content adapts to density tier */}
    </div>
  );
}
```

### Density Tier Mapping

| Tier | Mode | Row Height | Touch Target | Use Context |
|------|------|------------|--------------|-------------|
| `compact` | Desktop | 32px | 24px | Keyboard + pointer, office |
| `comfortable` | Tablet | 40px | 36px | Hybrid touch/keyboard |
| `touch` | Field-first | 48px+ | 44px+ | Job site, bright light, gloves |

### User Override

```tsx
const { setOverride, clearOverride } = useDensity();
setOverride('touch');   // Force field density
clearOverride();        // Return to auto-detection
```

### Field Mode

Field mode auto-defaults density to `comfortable`. The field theme (`hbcFieldTheme`) provides sunlight-optimized colors.

```tsx
import { useHbcTheme, useFieldMode } from '@hbc/ui-kit';

function MyPage() {
  const { theme } = useHbcTheme();
  const { isFieldMode } = useFieldMode();
  // theme is automatically hbcFieldTheme in field mode
}
```

---

## Composing Wave 1 Page Patterns

### Required Wrapper

Every page must use `WorkspacePageShell`:

```tsx
import { WorkspacePageShell } from '@hbc/ui-kit';

function MyPage() {
  return (
    <WorkspacePageShell
      title="Budget Overview"
      layout="dashboard"
      breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: 'Budget' }]}
      actions={[{ label: 'Export', onClick: handleExport }]}
      dashboardConfig={{ kpiCards, chartContent }}
    >
      <HbcDataTable {...tableProps} />
    </WorkspacePageShell>
  );
}
```

### Layout Types

| Layout | Shell Config Prop | Use For |
|--------|------------------|---------|
| `dashboard` | `dashboardConfig` | KPI + chart + data zones |
| `list` | `listConfig` | Filterable, searchable lists |
| `detail` | — | Single-item detail with tabs |
| `form` | — | Structured data entry |
| `landing` | — | Module landing, wizard flows |

### Zone System

Every page has defined zones per T04. Use the zone hierarchy to ensure correct visual weight:

| Zone | Visual Weight | Typical Content |
|------|--------------|-----------------|
| Page header | Heavy | Title, breadcrumb, project context |
| Command area | Standard | Actions, overflow menu |
| Summary area | Heavy | KPI cards, metric strip |
| Primary content | Standard | Tables, forms, detail panels |
| Secondary detail | Light | Sidebar, metadata, related items |
| Activity history | Light | Audit trail, comments, changelog |

---

## Choosing a Data Surface

Use the T06 decision guide:

| Question | If Yes → |
|----------|----------|
| Compare attributes across 6+ columns? | Dense analysis table |
| Scan list where 2–3 attributes dominate? | Responsive list/table hybrid |
| Field-first or mobile-primary? | Card/list view |
| Status communication, not row interaction? | Summary strip / KPI surface |

### Key Props for HbcDataTable

```tsx
<HbcDataTable
  data={items}
  columns={columns}
  enableSorting
  enablePagination
  pageSize={25}
  frozenColumns={1}
  mobileCardFields={['title', 'status', 'assignee', 'dueDate']}
  emptyStateConfig={{ icon: FolderIcon, title: 'No items', description: '...' }}
  savedViewsConfig={{ tableId: 'rfi-list', userId }}
/>
```

---

## Card Weight Classes

Use T04 weight classes to prevent visual flatness:

```tsx
import { HbcCard } from '@hbc/ui-kit';

{/* Most important — draws attention */}
<HbcCard weight="primary" header={<h2>Active Project</h2>}>
  <p>Key metrics</p>
</HbcCard>

{/* Default — general content */}
<HbcCard header={<h3>Details</h3>}>
  <p>Standard content</p>
</HbcCard>

{/* Supporting — recedes */}
<HbcCard weight="supporting" header={<h4>History</h4>}>
  <p>Secondary context</p>
</HbcCard>
```

---

## Common Composition Mistakes

1. **Giving all cards equal weight.** Use `weight="primary"` for the most important card, `"standard"` for general content, `"supporting"` for metadata. Never render a grid of identically-weighted cards.

2. **Skipping empty states.** Every data-dependent zone needs `HbcEmptyState`, not a blank area. Pass `emptyStateConfig` to `HbcDataTable`.

3. **Ignoring field mode.** Test every composition in touch density. Use `mobileCardFields` on data tables. Verify touch targets meet 44px minimum.

4. **Using horizontal scroll for data tables.** Use `frozenColumns` + `columnVisibility` + card fallback instead. Horizontal scroll is prohibited per MB-04.

5. **Importing Fluent UI directly.** All Fluent primitives must be imported through `@hbc/ui-kit` per D-10.

6. **Hardcoding colors or spacing.** Use `HBC_*` tokens. The ESLint rule `enforce-hbc-tokens` will flag violations.

7. **Competing with the shell.** Page content should dominate; shell chrome should support. Don't add heavy styling to page wrappers that competes with the header.

---

## Contributing Components to the Kit

### When to contribute

A component belongs in `@hbc/ui-kit` when:
- It's consumed by 2+ feature packages
- It's a reusable visual primitive (not business-logic-specific)
- It aligns with the kit's design system

### How to contribute

1. Create the component in `packages/ui-kit/src/ComponentName/`
2. Add Griffel styles using theme tokens (no hardcoded hex, px, or rgb values)
3. Export from `packages/ui-kit/src/index.ts`
4. Add Storybook stories with: default, variants, all states, responsive, overflow
5. Add to the theme README if the component introduces new tokens
6. Run `pnpm --filter @hbc/ui-kit check-types && pnpm --filter @hbc/ui-kit lint`

### Story requirements for new components

- Default story at standard density
- All named variants and configurations
- States: default, hover, focus, active, disabled, loading, empty, error
- Long-text/overflow handling
- Responsive behavior (if applicable)
- Field density variant (if density-aware)

---

## Related Documents

- [Visual Language Guide](./UI-Kit-Visual-Language-Guide.md) — design system tokens and decisions
- [Wave 1 Page Patterns](./UI-Kit-Wave1-Page-Patterns.md) — approved composition patterns
- [Field-Readability Standards](./UI-Kit-Field-Readability-Standards.md) — density and field constraints
- [Visual Hierarchy and Depth Standards](./UI-Kit-Visual-Hierarchy-and-Depth-Standards.md) — hierarchy rules
- [Adaptive Data Surface Patterns](./UI-Kit-Adaptive-Data-Surface-Patterns.md) — data surface selection

---

*Usage and Composition Guide v1.0 — WS1-T10 (2026-03-16)*
