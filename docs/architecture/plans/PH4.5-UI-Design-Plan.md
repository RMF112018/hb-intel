# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 5
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 5. Page Layout Taxonomy

Every screen in HB Intel uses exactly one of three canonical layouts. All three layouts are React components exported from `@hbc/ui-kit`. No developer may create a custom page layout outside this taxonomy.

---

### Layout 1: `ToolLandingLayout`

**Used for:** Every tool's primary list/dashboard view.

```
┌─────────────────────────────────────────────────────────────────┐
│  CONNECTIVITY BAR (2px, fixed)                          [V2.1]  │
│  DARK HEADER (56px, fixed)                                       │
├──────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR  │  PAGE HEADER (64px)                                  │
│ (56–240) │  [ Tool Name (heading-1) ]  [ + Create ]  [ Export ] │
│          ├──────────────────────────────────────────────────────┤
│          │  TOOLBAR / COMMAND BAR (48px)                        │
│          │  [ 🔍 Search ] [ Filters ▼ ] [ Views ▼ ] [ ⚙ cols ] │
│          ├──────────────────────────────────────────────────────┤
│          │  KPI CARDS ROW (optional, tool-specific)             │
│          │  [ Card ] [ Card ] [ Card ] [ Card ]                  │
│          ├──────────────────────────────────────────────────────┤
│          │  CONTENT AREA (HbcDataTable or card grid)            │
│          │  — scrollable —                                       │
│          ├──────────────────────────────────────────────────────┤
│          │  STATUS BAR (24px)                                    │
│          │  Showing 1–25 of 142 items  |  Last synced 2m ago    │
└──────────┴──────────────────────────────────────────────────────┘
```

**Props:** `toolName`, `primaryAction`, `secondaryActions[]`, `kpiCards[]`, `children`, `showKpiCards`.

---

### Layout 2: `DetailLayout`

**Used for:** Viewing the full detail of a single item.

```
┌─────────────────────────────────────────────────────────────────┐
│  CONNECTIVITY BAR (2px) + DARK HEADER (56px)                    │
├──────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR  │  BREADCRUMB (32px)                                   │
│          │  RFIs / RFI #042 — Concrete Pour Sequence Question   │
│          ├──────────────────────────────────────────────────────┤
│          │  DETAIL HEADER (64px)                                │
│          │  ← Back  |  RFI #042  [ Status Badge ]              │
│          │  [ Edit ]  [ Delete ]  [ Close RFI ]                 │
│          ├──────────────────────────────────────────────────────┤
│          │  TAB BAR (40px)                                       │
│          │  [ General ] [ Responses ] [ Related ] [ History ]   │
│          ├────────────────────────────┬────────────────────────┤
│          │  MAIN COLUMN (8/12 cols)   │  SIDEBAR (4/12 cols)   │
│          │  DetailSection components  │  Related Items          │
│          │  Rich text fields          │  Activity Feed          │
│          │  — scrollable —            │  Attachments            │
└──────────┴────────────────────────────┴────────────────────────┘
```

**Props:** `backLink`, `backLabel`, `itemId`, `itemTitle`, `statusBadge`, `actions[]`, `tabs[]`, `mainContent`, `sidebarContent`.

---

### Layout 3: `CreateUpdateLayout`

**Used for:** Creating or editing any item. Triggers Focus Mode automatically on touch/tablet. **[V2.1]**

```
┌─────────────────────────────────────────────────────────────────┐
│  CONNECTIVITY BAR (2px) + DARK HEADER → [Focus: breadcrumb only]│
├──────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR  │  FORM HEADER (64px)                                  │
│ [Focus:  │  Create New RFI  [ ⊡ Focus ] [ Cancel ] [ Save ]    │
│ 56px]    ├──────────────────────────────────────────────────────┤
│          │  FORM CONTENT (scrollable, max 8/12 cols centered)   │
│          │  HbcFormSection: General Information                  │
│          │  HbcFormSection: Attachments                          │
│          │  HbcFormSection: Related Items                        │
│          ├──────────────────────────────────────────────────────┤
│          │  STICKY FOOTER (56px)                                │
│          │                           [ Cancel ]  [ Save ]       │
└──────────┴──────────────────────────────────────────────────────┘
```

**Props:** `mode` (`"create"` | `"edit"`), `itemType`, `itemTitle`, `onCancel`, `onSubmit`, `isSubmitting`, `children`.

**Focus Mode behavior on `CreateUpdateLayout`:**
- On touch/tablet: auto-activates on mount. Sidebar collapses to 56px. Header reduces to minimal breadcrumb + Cancel + Save only. Surrounding UI dims to 40% opacity.
- On desktop: a `FocusModeEnter` icon button appears in the form header. Click toggles focus mode.
- Focus mode state persisted to `localStorage` key `hbc-focus-mode-desktop` (desktop preference only; touch auto-activates every time).
- Exit via the `FocusModeExit` icon button or by saving/cancelling the form.