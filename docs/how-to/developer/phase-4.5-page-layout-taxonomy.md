# Phase 4.5 — Page Layout Taxonomy (Developer Guide)

**Reference:** PH4.5-UI-Design-Plan.md §5, Blueprint §1f/§2c

## Overview

Every page in HB Intel renders inside `<main>` as a child of `HbcAppShell` and **must** use exactly one of three canonical layouts. No custom layouts are permitted.

## Decision Tree — Which Layout?

1. **Am I showing a list/dashboard of items?** → `ToolLandingLayout`
2. **Am I showing a single item's details?** → `DetailLayout`
3. **Am I creating or editing an item?** → `CreateUpdateLayout`

## ToolLandingLayout

Tool list/dashboard pages (e.g., RFI list, Buyout Schedule).

```tsx
import { ToolLandingLayout } from '@hbc/ui-kit';

<ToolLandingLayout
  toolName="RFIs"
  primaryAction={{ key: 'create', label: 'New RFI', onClick: handleCreate }}
  kpiCards={kpiData}
  commandBar={<HbcCommandBar ... />}
  statusBar={{ showing: 42, total: 156, lastSynced: '2 min ago' }}
>
  <HbcDataTable ... />
</ToolLandingLayout>
```

**Structure (top→bottom):** Page Header (64px sticky) → Command Bar (48px sticky) → KPI Cards (responsive grid) → Content → Status Bar (24px sticky bottom)

**KPI Card Breakpoints:**
- Desktop (≥1200px): 4 columns
- Tablet (768–1199px): 2 columns
- Mobile (<768px): 1 column

## DetailLayout

Single-item detail pages (e.g., RFI detail, Contract detail).

```tsx
import { DetailLayout } from '@hbc/ui-kit';

<DetailLayout
  breadcrumbs={[
    { label: 'RFIs', href: '/rfis' },
    { label: 'RFI-042' },
  ]}
  backLink="/rfis"
  backLabel="Back to RFIs"
  itemTitle="RFI-042: Foundation Rebar"
  statusBadge={<HbcStatusBadge variant="inProgress" label="In Progress" />}
  tabs={tabs}
  activeTabId={activeTab}
  onTabChange={setActiveTab}
  mainContent={<TabContent />}
  sidebarContent={<MetadataPanel />}
  onNavigate={router.push}
/>
```

**Structure:** Breadcrumb (32px sticky) → Detail Header (64px sticky) → Tab Bar (40px sticky) → Content Split (8:4 grid on desktop, stacked on tablet/mobile)

**Accessibility:**
- Tab bar uses `role="tablist"` with `role="tab"` on each tab
- Active tab has `aria-selected="true"`
- Arrow keys navigate between tabs
- Content area uses `role="tabpanel"` with `aria-labelledby`

## CreateUpdateLayout

Create/edit form pages with Focus Mode.

```tsx
import { CreateUpdateLayout } from '@hbc/ui-kit';

<CreateUpdateLayout
  mode="create"
  itemType="RFI"
  onCancel={handleCancel}
  onSubmit={handleSubmit}
  isSubmitting={isPending}
>
  <FormFields />
</CreateUpdateLayout>
```

**Structure:** Form Header (64px sticky) → Form Content (centered, max 66.67% width) → Sticky Footer (56px)

## Focus Mode

Focus Mode reduces visual distractions during form editing:

- **Touch/tablet devices:** Auto-activates on mount (detected via `pointer: coarse`)
- **Desktop:** Manual toggle via button in form header, persisted to `localStorage`
- **Visual effects:** Sidebar collapses to 56px icon-rail, overlay dims background to 40% opacity, form content gets elevated shadow

**Technical implementation:** Uses `CustomEvent('hbc-focus-mode-change')` + `data-focus-mode` DOM attribute. HbcAppShell and HbcSidebar listen for the event and react accordingly.

```tsx
// Using the hook directly (advanced):
import { useFocusMode } from '@hbc/ui-kit';

const { isFocusMode, toggleFocusMode, isAutoFocus } = useFocusMode();
```

## Data Attributes

| Layout | Attribute |
|--------|-----------|
| ToolLandingLayout | `data-hbc-layout="tool-landing"` |
| DetailLayout | `data-hbc-layout="detail"` |
| CreateUpdateLayout | `data-hbc-layout="create-update"` |

## Responsive Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| Mobile | <768px | Single column, sidebar hidden |
| Tablet | 768–1023px | DetailLayout stacks columns |
| Desktop | ≥1024px | Full multi-column layouts |
| Wide | ≥1200px | KPI 4-column grid |
