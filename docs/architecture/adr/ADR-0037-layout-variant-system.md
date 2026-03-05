# ADR-0037: Layout Variant System

**Status:** Accepted
**Date:** 2026-03-05
**Phase:** 4b.3
**Governing docs:** PH4B.3-UI-Design-Plan.md §6 | PH4B-UI-Design-Plan.md §§2, 6, 16, 17 | Blueprint §1f, §2c

## Context

Phase 4b.2 delivered WorkspacePageShell (WPS) with the `layout` prop required at the type level (D-02), but layout rendering was a pass-through — children rendered directly regardless of the `layout` value. Three layout components existed (ToolLandingLayout, DetailLayout, CreateUpdateLayout) but two were missing (DashboardLayout, ListLayout), and the LAYOUT_MAP was not wired.

## Decision

### D1: Selective LAYOUT_MAP wrapping

WPS wraps `children` in `DashboardLayout` or `ListLayout` for those two variants (which accept `children` as their content slot). For `form`, `detail`, and `landing`, WPS passes `children` through — those layouts require page-specific props (`onSubmit`, `tabs`, `mainContent`) that only the page author provides. Pages using form/detail/landing import and compose those layouts directly inside `<WorkspacePageShell>`.

The `layout` prop still enforces D-02 at the type level and sets `data-layout` for CSS hooks.

### D2: DashboardLayout — lightweight KPI + chart + data zones

- Responsive KPI card grid: 4-col (>1200px) -> 2-col (768-1199px) -> 1-col (<768px)
- Reuses `HbcKpiCard` for rendering
- Chart zone: full-width ReactNode slot
- Data zone: full-width children slot (flexGrow: 1)
- `DashboardConfig` interface for WPS prop forwarding

### D3: ListLayout — controlled props pattern

- 4-zone structure: FilterToolbar (sticky) -> SavedViewsBar (conditional) -> children (flexGrow) -> BulkActionBar (floating)
- Filter state uses controlled props — parent page owns state, no Zustand store in ui-kit
- Reuses HbcSearch (local variant), native select elements, HbcButton
- Advanced features deferred: `useFilterStore`, `HbcLocationFilter`, AI-suggested filters, saved views persistence

### D4: No HbcDataTable changes

HbcDataTable's existing prop surface already covers all needed features. ListLayout stories demonstrate these via prop composition.

## Consequences

- Every page in HB Intel declares one of five layout variants via the WPS `layout` prop
- Dashboard and list pages get automatic layout wrapping with minimal boilerplate
- Form, detail, and landing pages retain full control over their layout composition
- Five comprehensive Storybook story files cover all layout variants with state stories
- New types (`DashboardLayoutProps`, `ListLayoutProps`, `DashboardConfig`, `ListConfig`, `ListFilterDef`, `ListBulkAction`, `ListSavedViewEntry`) are exported from `@hbc/ui-kit`

## Files Created/Modified

| File | Action |
|------|--------|
| `packages/ui-kit/src/layouts/DashboardLayout.tsx` | Created |
| `packages/ui-kit/src/layouts/ListLayout.tsx` | Created |
| `packages/ui-kit/src/layouts/types.ts` | Added DashboardLayoutProps, ListLayoutProps, configs |
| `packages/ui-kit/src/layouts/index.ts` | Added exports |
| `packages/ui-kit/src/WorkspacePageShell/index.tsx` | Wired LAYOUT_MAP |
| `packages/ui-kit/src/WorkspacePageShell/types.ts` | Added DashboardConfig, updated ListConfig |
| `packages/ui-kit/src/index.ts` | Added new layout + type exports |
| `packages/ui-kit/src/layouts/*.stories.tsx` | 5 story files (2 new, 3 updated) |
