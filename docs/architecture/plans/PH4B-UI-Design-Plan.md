# HB-Intel — Phase 4b: UI Design Implementation Plan
### Comprehensive UI Kit + Shell Integration

**Version:** 1.2
**Date:** March 5, 2026
**Depends On:** Phase 4 (UI Kit component build — partially complete)
**Research Basis:** Comprehensive UI analysis of Procore (CORE Design System v8–v12, NGX 2025–2026), Autodesk Construction Cloud, Trimble Viewpoint, CMiC, InEight, Oracle Primavera Cloud/Aconex, and Bluebeam Studio — sourced from official documentation, release notes, design system publications, and 2025–2026 verified user reviews (G2, Capterra, TrustRadius)
**Objective:** Deliver a fully wired UI Kit and Shell such that any page built to the system is guaranteed to render correctly according to HBC design specifications — with zero design decisions required from the page author.

---

## Table of Contents

1. [Objective & Success Criteria](#1-objective--success-criteria)
2. [Architectural Decisions (Binding Constraints)](#2-architectural-decisions-binding-constraints)
3. [Prerequisites & Audit Remediation](#3-prerequisites--audit-remediation)
4. [Phase 4b.1 — Build & Packaging Foundation](#4-phase-4b1--build--packaging-foundation)
5. [Phase 4b.2 — Shell Completion & WorkspacePageShell](#5-phase-4b2--shell-completion--workspacepageshell)
6. [Phase 4b.3 — Layout Variant System](#6-phase-4b3--layout-variant-system)
7. [Phase 4b.4 — Command Bar & Page Actions](#7-phase-4b4--command-bar--page-actions)
8. [Phase 4b.5 — Navigation & Active State](#8-phase-4b5--navigation--active-state)
9. [Phase 4b.6 — Theme & Token Enforcement](#9-phase-4b6--theme--token-enforcement)
10. [Phase 4b.7 — Data Loading & State Handling](#10-phase-4b7--data-loading--state-handling)
11. [Phase 4b.8 — Form Architecture](#11-phase-4b8--form-architecture)
12. [Phase 4b.9 — Notifications & Feedback](#12-phase-4b9--notifications--feedback)
13. [Phase 4b.10 — Mobile & Field Mode](#13-phase-4b10--mobile--field-mode)
14. [Phase 4b.11 — Component Consumption Enforcement](#14-phase-4b11--component-consumption-enforcement)
15. [Phase 4b.12 — Integration Verification & Acceptance](#15-phase-4b12--integration-verification--acceptance)
16. [Developer Playbook](#16-developer-playbook)
17. [Completion Criteria](#17-completion-criteria)

---

## 1. Objective & Success Criteria

### Primary Objective

Deliver a fully wired UI Kit and Shell such that **any page built to the system is guaranteed to render correctly according to HBC design specifications** — with zero design decisions required from the page author.

### What "Guaranteed to Render Correctly" Means

A page is guaranteed when all of the following are true without any effort from the page author:

- ✅ It appears inside the correct shell frame (header, sidebar, content area)
- ✅ It uses a named layout variant appropriate to its purpose
- ✅ Its action buttons appear in the correct command bar zone
- ✅ Its sidebar navigation item is highlighted automatically
- ✅ Its colors, spacing, and typography come from HBC design tokens only
- ✅ Its loading, empty, and error states render consistently
- ✅ Its forms follow the standard validation and submission pattern
- ✅ Its feedback (save, delete, error) triggers a consistent toast notification
- ✅ It adapts correctly between office desktop and field mobile contexts
- ✅ It uses only `@hb-intel/ui-kit` components — never raw HTML or direct Fluent UI imports

### Success Metrics

| Metric | Target |
|--------|--------|
| Pages using `WorkspacePageShell` | 100% of all workspace pages |
| Pages using a named layout variant | 100% |
| Token violations in CI | 0 |
| Direct `@fluentui/react-components` imports in `apps/` | 0 |
| Components with Storybook stories | 100% (44/44) |
| Components with reference documentation | 100% (44/44) |
| Loading/error state handled by shell | 100% of data pages |
| Build artifact contamination in `src/` | 0 files |

---

## 2. Architectural Decisions (Binding Constraints)

These 10 decisions were established through the Phase 4b design interview and are **binding constraints** for all implementation work. They are not subject to re-evaluation during implementation without a formal ADR update.

| # | Decision | Binding Rule |
|---|----------|-------------|
| **D-01** | Shell enforcement model | Every page **must** use `WorkspacePageShell` as its outer container. Direct rendering without the shell is prohibited. |
| **D-02** | Layout variant system | Every page **must** declare one of the named layout variants: `dashboard`, `list`, `form`, `detail`, or `landing`. No free-composition inside the wrapper. |
| **D-03** | Command bar zone | All page actions **must** be passed to the shell's command bar zone via the `actions` prop on `WorkspacePageShell`. Direct button placement outside the command bar is prohibited. |
| **D-04** | Navigation active state | Active sidebar state **must** be derived automatically from the router. Pages must never manually set active nav state. |
| **D-05** | Token enforcement | All color, spacing, typography, and shadow values **must** come from `@hb-intel/ui-kit` tokens. Hardcoded values are a lint error. |
| **D-06** | Data state handling | Loading, empty, and error states **must** be passed to `WorkspacePageShell` via `isLoading`, `isEmpty`, and `isError` props. Pages must not implement their own spinners or error UIs. |
| **D-07** | Form architecture | All data entry forms **must** use `HbcForm`, `HbcFormLayout`, `HbcFormSection`, and `HbcStickyFormFooter`. Raw form elements are prohibited in page code. |
| **D-08** | Notifications | All user feedback (success, error, warning) **must** be triggered via `useToast`. Inline feedback components on pages are prohibited except `HbcBanner` for persistent page-level warnings. |
| **D-09** | Mobile/field mode | Pages **must** declare supported layout modes. The shell handles all context switching via `useFieldMode`. Pages must not contain their own breakpoint logic. |
| **D-10** | Component consumption | Pages **must** import exclusively from `@hb-intel/ui-kit`. Direct imports from `@fluentui/react-components`, raw HTML structural elements, and inline styles are prohibited and enforced via ESLint. |

---

## 16. Developer Playbook

This section is the **franchise playbook** — the complete reference for any developer building a new page in HB-Intel. It must be published to `docs/how-to/developer/phase-4b-developer-playbook.md`.

### Building a New Page — The 5-Step Formula

Every new page in HB-Intel follows exactly this pattern. No exceptions.

**Step 1: Choose your layout variant**

| My page is... | Use layout |
|--------------|------------|
| A dashboard with KPI cards and charts | `"dashboard"` |
| A list or index of records (table + filters) | `"list"` |
| A form to create or edit a record | `"form"` |
| A detail view of a single record | `"detail"` |
| A module home page with sub-module cards | `"landing"` |

**Step 2: Wire your data query**

```ts
const { data, isLoading, isError } = useRiskItems(); // from @hb-intel/query-hooks
const isEmpty = !isLoading && !data?.length;
```

**Step 3: Define your page actions**

```ts
const actions: CommandBarAction[] = [
  { key: 'new', label: 'New Item', icon: 'Add', onClick: handleNew, isPrimary: true },
  { key: 'export', label: 'Export', icon: 'ArrowExport', onClick: handleExport },
];
```

**Step 4: Wrap in `WorkspacePageShell`**

```tsx
return (
  <WorkspacePageShell
    layout="dashboard"
    title="Risk Register"
    isLoading={isLoading}
    isError={isError}
    isEmpty={isEmpty}
    actions={actions}
  >
    {/* Step 5: Your content here */}
  </WorkspacePageShell>
);
```

**List page variant of Step 4** — declare your filter config, the layout handles the rest:

```tsx
// List pages pass filter config and table config to WorkspacePageShell.
// ListLayout renders the filter toolbar, saved views bar, and pagination automatically.
// You only provide HbcDataTable as the child.
return (
  <WorkspacePageShell
    layout="list"
    title="Risk Register"
    isLoading={isLoading}
    isError={isError}
    isEmpty={isEmpty}
    emptyMessage="No risk items match the current filters."
    emptyActionLabel="Clear Filters"
    onEmptyAction={() => clearFilters('risk-register')}
    listConfig={{
      filterStoreKey: 'risk-register',       // unique key — drives ALL filter/view persistence
      primaryFilters: [                       // max 3 — always visible in toolbar
        { key: 'status', label: 'Status', type: 'select', options: RISK_STATUSES },
        { key: 'category', label: 'Category', type: 'select', options: RISK_CATEGORIES },
        { key: 'due_date', label: 'Due Date', type: 'date-range' },
      ],
      advancedFilters: RISK_ADVANCED_FILTERS, // in HbcPanel slide-out
      savedViewsEnabled: true,                // personal / project / org scope views
      selectable: true,                       // checkbox row selection for bulk ops
      bulkActions: [
        { key: 'close', label: 'Close', icon: 'Checkmark', onClick: handleBulkClose },
        { key: 'delete', label: 'Delete', icon: 'Delete', onClick: handleBulkDelete, isDestructive: true },
      ],
    }}
    actions={actions}
  >
    <HbcDataTable
      rows={data}
      columns={RISK_COLUMNS}
      filterStoreKey="risk-register"    // wires auto-density, column config, row panel
      onRowClick={handleRowClick}        // opens HbcPanel slide-out preview
      responsibilityField="assignee_id"  // drives responsibility heat mapping
    />
    {/* No FilterToolbar, SavedViewsBar, or Pagination here — ListLayout adds them */}
  </WorkspacePageShell>
);
```

**Step 5: Build your content using only `@hb-intel/ui-kit` components**

```tsx
import { HbcDataTable, HbcCard, HbcStatusBadge } from '@hb-intel/ui-kit';
// Never: import { Button } from '@fluentui/react-components'
// Never: <button>, <input>, <div style={{ color: '#red' }}>
```

### What You Get For Free

By following the formula, these are automatic — you write zero additional code:

| Feature | How it works |
|---------|-------------|
| Correct page frame | `WorkspacePageShell` handles it |
| Sidebar highlights | TanStack Router handles it |
| Loading spinner/skeleton | `isLoading` prop handles it |
| Empty state | `isEmpty` prop handles it |
| Error state | `isError` prop handles it |
| Consistent action bar | `actions` prop handles it |
| Filter toolbar with primary filters | `listConfig.primaryFilters` handles it |
| Active filter pill strip | `ListLayout` + `useFilterStore` handles it |
| Advanced filter panel | `listConfig.advancedFilters` + `HbcPanel` handles it |
| Saved views (3 scopes) | `listConfig.savedViewsEnabled` + `useFilterStore` handles it |
| Deep-link filter sharing | `useFilterStore` URL encoding handles it |
| Filter/sort/column state persistence | `useFilterStore` via `filterStoreKey` handles it |
| Table auto-density (3 tiers) | `HbcDataTable` + `useDensity()` + pointer/viewport detection handles it |
| Card transformation at mobile widths | `HbcDataTable` handles it automatically below 640px |
| Responsibility heat mapping | `HbcDataTable` `responsibilityField` prop handles it |
| Dual-channel status encoding | `HbcStatusBadge` handles it on all status columns |
| Row panel slide-out | `HbcDataTable` `onRowClick` + `HbcPanel` handles it |
| Floating bulk action bar | `listConfig.bulkActions` + row selection handles it |
| Pagination | `ListLayout.Pagination` handles it |
| Unsaved changes warning | `HbcForm` handles it |
| Draft auto-save | `HbcForm` + `useFormDraftStore` handles it |
| Toast on save/error | `useToast()` in mutation handles it |
| Mobile/field layout | `useFieldMode` handles it |
| Token-correct styling | ESLint enforces it at dev time |

### The Complete Import Map

```ts
// ✅ Your only allowed import sources as a page author:
import { ... } from '@hb-intel/ui-kit';        // All UI components
import { ... } from '@hb-intel/app-shell';      // Shell and WorkspacePageShell
import { ... } from '@hb-intel/query-hooks';    // Data hooks and stores
import { ... } from '@hb-intel/auth';           // Auth guards
import { ... } from '@tanstack/react-router';   // Navigation only

// ❌ Never import these in apps/:
import { ... } from '@fluentui/react-components'; // ESLint error
import { ... } from 'zustand';                    // Use query-hooks stores
import { ... } from 'react-query';                // Use query-hooks wrappers
```

---

## 17. Completion Criteria

Phase 4b is **complete** when all of the following are true simultaneously:

### Code Quality Gates (CI enforced)
- [ ] `pnpm turbo run build` passes with 0 errors
- [ ] `pnpm turbo run type-check` passes with 0 TypeScript errors
- [ ] `pnpm turbo run lint` passes with 0 ESLint errors
- [ ] All Storybook stories pass test-runner (0 failures)
- [ ] All Playwright e2e specs pass (0 failures)

### Coverage Gates
- [ ] 44/44 ui-kit components exported from `src/index.ts`
- [ ] 44/44 ui-kit components have Storybook stories
- [ ] 44/44 ui-kit components have reference documentation
- [ ] 100% of workspace app pages use `WorkspacePageShell`
- [ ] 100% of workspace app pages declare a layout variant (`dashboard`, `list`, `form`, `detail`, or `landing`)
- [ ] 0 direct `@fluentui/react-components` imports in `apps/`
- [ ] 0 hardcoded token values in `apps/`

### Structural Gates
- [ ] 0 build artifacts committed to `src/`
- [ ] `storybook-static/` not tracked in git
- [ ] `eslint-plugin-hbc` is a proper workspace package
- [ ] Single `WorkspacePageShell` source in `packages/ui-kit`
- [ ] `module-configs/` in `packages/shell` (not `packages/ui-kit`)
- [ ] `packages/app-shell` fully implemented as auth facade
- [ ] ADR naming standardized, ADR-0015 gap documented

### Documentation Gates
- [ ] `docs/how-to/developer/phase-4b-developer-playbook.md` published
- [x] All 9 missing component reference docs created
- [x] `DESIGN_SYSTEM.md` updated with dual entry point documentation (via docs/reference/ui-kit/entry-points.md)
- [ ] ADR-0034 written documenting Phase 4b architectural decisions

### The Guarantee

When all completion criteria above are met, the following statement is **mechanically true**:

> Any developer who follows the Phase 4b Developer Playbook will produce a page that renders correctly to HBC design specifications — because the ESLint plugin will not allow them to deviate, the shell will automatically provide consistent framing, and every state transition (loading, empty, error, feedback) is handled by the system without any additional code.

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.2 — March 5, 2026 (amended: competitive list layout spec from industry research)*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4b.3 (Layout Variant System) completed: 2026-03-05
  - §6 DashboardLayout + ListLayout created
  - §16 LAYOUT_MAP wired into WorkspacePageShell
  - §17 All 5 layout story files complete
  - ADR-0037 created
  - Reference docs: DashboardLayout.md, ListLayout.md, WorkspacePageShell.md updated

Phase 4b.4 (Command Bar & Page Actions) completed: 2026-03-05
  - §7 CommandBarAction enhanced (isDestructive, tooltip), overflow menu, field mode FAB
  - fieldModeActionsStore for Cmd+K palette injection
  - ESLint rule hbc/no-direct-buttons-in-content (D-03)
  - ADR-0038 created
  - Reference docs: WorkspacePageShell.md updated with D-03 pattern + field mode behavior

Phase 4b.5 (Navigation & Active State) completed: 2026-03-05
§17 items: 4b.5.1-4b.5.4 all complete
ADR: ADR-0039-navigation-and-active-state.md
Next: Phase 4b.6

Phase 4b.9 (Notifications & Feedback) completed: 2026-03-06
  - 4b.9.1: HbcToastContainer mounted once in AppShellLayout (@hbc/app-shell) per D-08
  - 4b.9.2: useToast expanded to 4 variants (success/error/warning/info) with convenience API
  - 4b.9.3: Canonical mutation wiring documented in docs/reference/ui-kit/HbcToast.md
  - 4b.9.4: Banner prop in WorkspacePageShell verified (BannerConfig, HbcBanner)
  - 4b.9.5: ESLint rule @hbc/hbc/no-inline-feedback added (D-08 enforcement)
  - ADR-0043 created (amends ADR-0022 §1 three-category restriction)
  - Storybook stories updated for all 4 toast variants
  - Build: pnpm turbo run build — 23/23 packages successful
  - §17 acceptance: all 4b.9 items marked complete
-->