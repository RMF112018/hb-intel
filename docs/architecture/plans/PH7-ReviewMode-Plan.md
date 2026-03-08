# PH7-ReviewMode-Plan — Review Mode Master Summary

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-08
**Derived from:** Structured product-owner interview (2026-03-08); all decisions locked.
**Type:** MASTER SUMMARY — index only; all implementation detail in numbered task files below.

---

## Purpose

Review Mode is a reusable, fullscreen presentation layer that transforms any HB Intel data table into a structured, navigable record-by-record review session. Its primary use case is the Estimating department's weekly standup — reviewing every active pursuit, preconstruction engagement, and submitted estimate in a single meeting without leaving the app. Secondary use cases span any module where a team reviews a list of records together.

This feature is built once as a shared package (`@hbc/review-mode`) so that every future module can opt in with a simple configuration object — avoiding the scattered, non-templated copies that accumulated in previous application versions.

---

## Locked Interview Decisions

| # | Topic | Decision |
|---|---|---|
| RM-1 | Package location | New `@hbc/review-mode` standalone package |
| RM-2 | Card rendering | Hybrid — schema pills in sidebar, render prop for card body |
| RM-3 | Multi-section navigation | Session config array at launch; top tab bar for section switching |
| RM-4 | Inline editing | Slide-out edit drawer within the Review Mode overlay |
| RM-5 | Action items storage | Shared `HBIntelActionItems` SP list owned by `@hbc/review-mode` |
| RM-6 | Navigation panel | Collapsible left sidebar with real-time search |
| RM-7 | Launch configuration | Instant launch with in-session filter bar |
| RM-8 | Fullscreen behavior | Context-aware — CSS overlay (SPFx), native Browser API (PWA) |
| RM-9 | Presenter controls | Edge chevrons + keyboard arrows + auto-hiding shortcut legend |
| RM-10 | Action item creation UX | Floating "+" button → slide-up compact tray, source auto-populated |
| RM-11 | Session progress tracking | "Mark as Reviewed" with persistent `lastReviewedAt` on source records |
| RM-12 | Entry point | Prominent toolbar button with presentation-screen icon |
| RM-13 | Meeting facilitation | Session summary on exit — records, time elapsed, action items, clipboard/Teams export |
| RM-14 | Access control | Inherits page read permission; edit drawer gated by write permission |
| RM-15 | Initial rollout scope | Package + Estimating `reviewConfig` (3 sections); BD gets documented stub |

---

## Module Scope

`@hbc/review-mode` owns:
- The fullscreen overlay shell (CSS overlay for SPFx, native fullscreen API for PWA)
- Collapsible, searchable left sidebar with section tabs and reviewed-state pills
- Record card frame with render prop slot for feature-defined card body
- Slide-out edit drawer (renders feature-supplied edit form)
- Floating action item creation tray
- `HBIntelActionItems` SP list and all action item CRUD
- Session progress tracking (`lastReviewedAt` field updated on source records)
- Session summary / exit screen with clipboard and Teams webhook export
- `IReviewConfig<T>` interface — the contract every feature implements to opt in

`@hbc/review-mode` does NOT own:
- The card body layout (owned by each feature's `reviewConfig.renderCard`)
- The edit form (owned by each feature, passed as `reviewConfig.renderEditForm`)
- Source data fetching (owned by each feature's existing TanStack Query hooks)
- Source SP lists or their schemas (owned by each feature's backend)

---

## Package Structure

```
packages/review-mode/
├── package.json                        (@hbc/review-mode)
├── tsconfig.json
├── src/
│   ├── index.ts                        ← public barrel
│   ├── types/
│   │   ├── IReviewConfig.ts            ← contract each feature implements
│   │   ├── IReviewSection.ts           ← one data source / tab
│   │   ├── IReviewRecord.ts            ← normalized record wrapper
│   │   ├── IActionItem.ts              ← action item data model
│   │   └── ISessionSummary.ts          ← exit summary shape
│   ├── context/
│   │   ├── ReviewModeContext.ts        ← React context + provider
│   │   └── useReviewMode.ts            ← consumer hook
│   ├── components/
│   │   ├── ReviewModeButton.tsx        ← toolbar entry point button
│   │   ├── ReviewModeShell.tsx         ← fullscreen overlay wrapper
│   │   ├── ReviewModeHeader.tsx        ← title, section tabs, filter bar, exit
│   │   ├── NavigationSidebar/
│   │   │   ├── NavigationSidebar.tsx
│   │   │   ├── SidebarSearchInput.tsx
│   │   │   ├── RecordPill.tsx          ← schema-driven pill (title, subtitle, badge)
│   │   │   └── SectionTabList.tsx
│   │   ├── RecordCard/
│   │   │   ├── RecordCardFrame.tsx     ← frame with chevrons, shortcut legend
│   │   │   └── RecordCardBody.tsx      ← render prop slot
│   │   ├── EditDrawer/
│   │   │   ├── EditDrawer.tsx          ← right-side slide-out drawer
│   │   │   └── EditDrawerHeader.tsx
│   │   ├── ActionItems/
│   │   │   ├── ActionItemFab.tsx       ← floating "+" button
│   │   │   ├── ActionItemTray.tsx      ← slide-up compact form
│   │   │   └── ActionItemList.tsx      ← per-record action item list in card
│   │   └── SessionSummary/
│   │       ├── SessionSummaryScreen.tsx
│   │       └── useSessionExport.ts     ← clipboard + Teams webhook
│   ├── hooks/
│   │   ├── useFullscreen.ts            ← context-aware fullscreen (SPFx/PWA)
│   │   ├── useReviewSession.ts         ← session state management
│   │   ├── useActionItems.ts           ← action item CRUD
│   │   └── useKeyboardNav.ts           ← arrow key + Escape handling
│   └── data/
│       └── actionItemsQueries.ts       ← HTTP adapter calls for action items API
```

---

## `IReviewConfig<T>` Contract

Every feature that opts into Review Mode implements this interface:

```typescript
export interface IReviewConfig<T extends { id: string }> {
  /** Unique key for this review session type (e.g., 'estimating'). */
  sessionKey: string;
  /** Human-readable session title shown in the Review Mode header. */
  sessionTitle: string;
  /** One or more data sections. Tab bar appears when sections.length > 1. */
  sections: IReviewSection<T>[];
  /**
   * Permission key required to open the edit drawer.
   * Defaults to the page's write permission if not specified.
   */
  writePermissionKey?: string;
}

export interface IReviewSection<T extends { id: string }> {
  /** Unique section ID used for tab navigation. */
  id: string;
  /** Tab label (e.g., 'Pursuits', 'Preconstruction', 'Log'). */
  label: string;
  /** Records to display. Updated reactively via TanStack Query. */
  data: T[];
  /** Whether data is loading (shows skeleton in sidebar). */
  isLoading?: boolean;
  /**
   * Sidebar pill schema — defines how each record appears in the
   * navigation list without a custom component.
   */
  sidebarSchema: (record: T) => ISidebarPillSchema;
  /**
   * Main card body render prop.
   * The card frame (chevrons, shortcut legend, header) is provided by
   * ReviewMode. Only the content area is feature-defined.
   */
  renderCard: (record: T) => ReactNode;
  /**
   * Edit form render prop.
   * Rendered inside the slide-out drawer when the user clicks Edit.
   * Receives onSave and onCancel callbacks.
   * Optional — if omitted, Edit button is hidden for this section.
   */
  renderEditForm?: (record: T, onSave: () => void, onCancel: () => void) => ReactNode;
  /**
   * Filter definitions for the in-session filter bar.
   * Each entry becomes a filter chip/dropdown in the Review Mode header.
   */
  filters?: IReviewFilter<T>[];
}

export interface ISidebarPillSchema {
  /** Primary label — shown prominently (e.g., project name). */
  title: string;
  /** Secondary label — shown smaller (e.g., project number, date). */
  subtitle?: string;
  /** Optional status badge. */
  statusBadge?: { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' };
}

export interface IReviewFilter<T> {
  id: string;
  label: string;
  /** Filter function applied to section data. */
  filterFn: (record: T, value: string) => boolean;
  /** Options for the filter dropdown. */
  options: { value: string; label: string }[];
}
```

---

## `HBIntelActionItems` SharePoint List

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line | Yes | Action item summary |
| Description | Multi-line | No | Additional detail |
| AssignedToUpn | Single line | No | Azure AD UPN |
| AssignedToName | Single line | No | Display name |
| DueDate | Date | No | |
| Status | Choice | Yes | Open, In Progress, Done |
| Priority | Choice | Yes | High, Medium, Low |
| SourceModule | Single line | Yes | e.g., 'estimating', 'business-development' |
| SourceRecordId | Single line | Yes | UUID of source record |
| SourceRecordLabel | Single line | Yes | Human-readable label (e.g., "26-001-01 — Ocean Towers") |
| CreatedAt | Date/Time | Yes | Auto-set on create |
| CreatedByUpn | Single line | Yes | Auto-set from auth |

---

## `lastReviewedAt` Field Addition

Each SP list participating in Review Mode requires one additional column:

| Column | Type | Required | Notes |
|---|---|---|---|
| LastReviewedAt | Date/Time | No | Set by Review Mode on "Mark as Reviewed" |

Affected lists in initial rollout: `HBIntelActivePursuits`, `HBIntelActivePreconstruction`, `HBIntelEstimateLog`.
Corresponding model interface additions: `lastReviewedAt?: string` on `IActivePursuit`, `IActivePreconstruction`, `IEstimateLogEntry`.

---

## Backend API Endpoints (owned by `@hbc/review-mode`)

```
# Action Items
GET    /api/review/action-items?sourceRecordId={id}   → list action items for a record
GET    /api/review/action-items?sourceModule={module} → list all action items for a module
POST   /api/review/action-items                       → create an action item
PATCH  /api/review/action-items/:id                   → update status, assignee, due date
DELETE /api/review/action-items/:id                   → delete an action item

# lastReviewedAt (proxied per module — Review Mode calls module-specific endpoints)
PATCH  /api/estimating/pursuits/:id                   → existing endpoint, adds lastReviewedAt
PATCH  /api/estimating/preconstruction/:id            → existing endpoint, adds lastReviewedAt
PATCH  /api/estimating/log/:id                        → existing endpoint, adds lastReviewedAt
```

---

## Implementation Sequence

```
RM-1   → Package Foundation (types, context, package scaffold)
RM-2   → Shell and Layout (fullscreen overlay, header, filter bar)
RM-3   → Navigation Sidebar (search, section tabs, reviewed-state pills)
RM-4   → Record Card and Edit Drawer (card frame, render prop slot, drawer)
RM-5   → Action Items (FAB, tray, SP list, API, useActionItems hook)
RM-6   → Session Summary (exit screen, lastReviewedAt, clipboard/Teams export)
RM-7   → Estimating Integration (reviewConfig for all 3 sections + card layouts)
RM-8   → Backend API (action items endpoints + lastReviewedAt patch additions)
RM-9   → Testing and Documentation (Vitest, Playwright, ADR-0080, how-to guide)
```

---

## Task File Index

| File | Title | Priority | Status |
|---|---|---|---|
| `PH7-RM-1-Package-Foundation.md` | Types, Context, Package Scaffold | **CRITICAL** | ⬜ pending |
| `PH7-RM-2-Shell-and-Layout.md` | Fullscreen Shell, Header, Filter Bar | **CRITICAL** | ⬜ pending |
| `PH7-RM-3-NavigationSidebar.md` | Sidebar, Search, Section Tabs, Pills | **CRITICAL** | ⬜ pending |
| `PH7-RM-4-RecordCard-and-EditDrawer.md` | Card Frame, Render Prop, Edit Drawer | **CRITICAL** | ⬜ pending |
| `PH7-RM-5-ActionItems.md` | FAB, Tray, SP List, API, Hook | HIGH | ⬜ pending |
| `PH7-RM-6-SessionSummary.md` | Exit Screen, lastReviewedAt, Export | HIGH | ⬜ pending |
| `PH7-RM-7-EstimatingIntegration.md` | Estimating reviewConfig (3 sections) | HIGH | ⬜ pending |
| `PH7-RM-8-Backend-API.md` | Action Items API + SP Schema | HIGH | ⬜ pending |
| `PH7-RM-9-Testing-and-Documentation.md` | Vitest, Playwright, ADR-0080, How-To | MEDIUM | ⬜ pending |

---

## Cross-Module Integration Notes

**How a feature page opts in (3 steps):**
1. Add `ReviewModeButton` to the page toolbar, passing the `IReviewConfig`
2. Add `lastReviewedAt?: string` to the source model interface
3. Add `LastReviewedAt` column to the source SP list

**Estimating integration files:**
- `packages/features/estimating/src/reviewConfig/estimatingReviewConfig.ts`
- `packages/features/estimating/src/reviewConfig/PursuitReviewCard.tsx`
- `packages/features/estimating/src/reviewConfig/PreconReviewCard.tsx`
- `packages/features/estimating/src/reviewConfig/EstimateLogReviewCard.tsx`

**BD stub location (documented, not built):**
- `packages/features/business-development/src/reviewConfig/bdReviewConfig.stub.ts`

---

## Definition of Done

- [ ] `@hbc/review-mode` package builds without TypeScript errors
- [ ] `IReviewConfig<T>` interface fully documented
- [ ] Fullscreen works in both SPFx (CSS overlay) and PWA (native API) modes
- [ ] Sidebar search filters record pills in real time
- [ ] Section tabs switch data sources without exiting Review Mode
- [ ] Edit drawer opens and saves without exiting Review Mode
- [ ] Action item tray creates items in `HBIntelActionItems` list
- [ ] "Mark as Reviewed" persists `lastReviewedAt` to source record
- [ ] Session summary appears on exit with action item list
- [ ] Clipboard export produces readable plain-text summary
- [ ] Estimating `reviewConfig` covers all 3 sections (Pursuits, Precon, Log)
- [ ] `ReviewModeButton` visible in Estimating page toolbars
- [ ] BD stub file exists with documented pattern
- [ ] Vitest unit tests pass
- [ ] Playwright E2E baseline spec passes
- [ ] ADR-0080 exists in `docs/architecture/adr/`
- [ ] Developer how-to guide exists in `docs/how-to/developer/review-mode-integration.md`
- [ ] `pnpm turbo run build` passes

<!-- IMPLEMENTATION PROGRESS & NOTES
Review Mode master plan created: 2026-03-08
Source: Structured product-owner interview (2026-03-08), RM-1 through RM-15 all locked.
Primary use case: Estimating weekly department standup meeting.
Secondary use cases: Any module with a list of records requiring structured team review.
Next: Create task files RM-1 through RM-9.
-->
