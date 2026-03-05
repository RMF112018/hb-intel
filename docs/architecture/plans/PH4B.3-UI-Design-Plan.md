# HB-Intel — Phase 4b: UI Design Implementation Plan Task 3
### Comprehensive UI Kit + Shell Integration

**Version:** 1.0
**Date:** March 5, 2026
**Depends On:** Phase 4 (UI Kit component build — partially complete)
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
| **D-02** | Layout variant system | Every page **must** declare one of the named layout variants: `dashboard`, `form`, `detail`, or `landing`. No free-composition inside the wrapper. |
| **D-03** | Command bar zone | All page actions **must** be passed to the shell's command bar zone via the `actions` prop on `WorkspacePageShell`. Direct button placement outside the command bar is prohibited. |
| **D-04** | Navigation active state | Active sidebar state **must** be derived automatically from the router. Pages must never manually set active nav state. |
| **D-05** | Token enforcement | All color, spacing, typography, and shadow values **must** come from `@hb-intel/ui-kit` tokens. Hardcoded values are a lint error. |
| **D-06** | Data state handling | Loading, empty, and error states **must** be passed to `WorkspacePageShell` via `isLoading`, `isEmpty`, and `isError` props. Pages must not implement their own spinners or error UIs. |
| **D-07** | Form architecture | All data entry forms **must** use `HbcForm`, `HbcFormLayout`, `HbcFormSection`, and `HbcStickyFormFooter`. Raw form elements are prohibited in page code. |
| **D-08** | Notifications | All user feedback (success, error, warning) **must** be triggered via `useToast`. Inline feedback components on pages are prohibited except `HbcBanner` for persistent page-level warnings. |
| **D-09** | Mobile/field mode | Pages **must** declare supported layout modes. The shell handles all context switching via `useFieldMode`. Pages must not contain their own breakpoint logic. |
| **D-10** | Component consumption | Pages **must** import exclusively from `@hb-intel/ui-kit`. Direct imports from `@fluentui/react-components`, raw HTML structural elements, and inline styles are prohibited and enforced via ESLint. |

---

## 6. Phase 4b.3 — Layout Variant System

**Goal:** Four named layout variants implemented, documented, and enforced as the only legal page structures inside `WorkspacePageShell`.

**Depends on:** Phase 4b.2 complete

### Layout Variant Specifications

#### `dashboard` layout
- Multi-column KPI card grid at top (responsive: 4-col → 2-col → 1-col)
- Full-width chart/data zone below
- No sticky footer
- Use for: Leadership KPI, Portfolio Overview, Project Dashboard

```tsx
<WorkspacePageShell layout="dashboard" title="Portfolio Overview" actions={[...]}>
  <KpiRow>{/* HbcKpiCard × N */}</KpiRow>
  <ChartZone>{/* HbcChart components */}</ChartZone>
  <DataZone>{/* HbcDataTable */}</DataZone>
</WorkspacePageShell>
```

#### `form` (CreateUpdateLayout)
- Single-column form body, max-width constrained for readability
- Sticky `HbcStickyFormFooter` with Save/Cancel always visible
- `HbcFormSection` dividers for multi-section forms
- Use for: New Scorecard, New Risk Item, New Contract, all create/edit pages

```tsx
<WorkspacePageShell layout="form" title="New Scorecard" actions={[...]}>
  <HbcForm onSubmit={handleSubmit}>
    <HbcFormSection title="Project Details">
      {/* HbcTextField, HbcSelect components */}
    </HbcFormSection>
    <HbcStickyFormFooter onSave={handleSubmit} onCancel={handleCancel} />
  </HbcForm>
</WorkspacePageShell>
```

#### `detail` (DetailLayout)
- Two-zone: primary content (left, ~65%) + metadata panel (right, ~35%)
- Responsive: stacks to single column on tablet/mobile
- Use for: Project detail, Risk item detail, Contract detail

```tsx
<WorkspacePageShell layout="detail" title="Risk Item #142" actions={[...]}>
  <DetailLayout.Primary>{/* Main content */}</DetailLayout.Primary>
  <DetailLayout.Metadata>{/* HbcCard with key fields */}</DetailLayout.Metadata>
</WorkspacePageShell>
```

#### `landing` (ToolLandingLayout)
- Full-width hero zone with page title and description
- Card grid below for sub-module navigation
- Use for: Module home pages (Estimating, Safety, HR landing pages)

```tsx
<WorkspacePageShell layout="landing" title="Estimating" actions={[...]}>
  <LandingHero description="Manage bids, templates, and project setup" />
  <ToolCardGrid>{/* HbcCard × N for sub-modules */}</ToolCardGrid>
</WorkspacePageShell>
```

### Tasks

#### 4b.3.1 — Implement layout variant components

Complete implementation of the three existing layout scaffolds in `packages/ui-kit/src/layouts/`:
- `ToolLandingLayout.tsx` — verify complete, add stories
- `DetailLayout.tsx` — verify complete, add stories
- `CreateUpdateLayout.tsx` — verify complete, add stories
- Add `DashboardLayout.tsx` — new component

#### 4b.3.2 — Wire layout variants into `WorkspacePageShell`

```ts
// WorkspacePageShell selects layout based on prop
const LAYOUT_MAP = {
  dashboard: DashboardLayout,
  form: CreateUpdateLayout,
  detail: DetailLayout,
  landing: ToolLandingLayout,
};
const Layout = LAYOUT_MAP[props.layout];
```

#### 4b.3.3 — Add layout variant stories

Each layout variant needs stories showing:
- Fully populated state
- Loading state (via `isLoading` prop)
- Empty state (via `isEmpty` prop)
- Error state (via `isError` prop)
- Field/mobile mode (via `useFieldMode`)

### Acceptance Criteria

- [ ] All 4 layout variants implemented and exported from `@hb-intel/ui-kit`
- [ ] `WorkspacePageShell` `layout` prop is required (TypeScript error if omitted)
- [ ] All 4 variants have Storybook stories covering all states
- [ ] Layout variants are documented in `docs/reference/ui-kit/WorkspacePageShell.md`
- [ ] `CreateUpdateLayout` includes `HbcStickyFormFooter` automatically
- [ ] `DetailLayout` responsive stacking verified at 768px breakpoint

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.0 — March 5, 2026*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*