# PH7-SF-26: Saved Views — Shared Filter, Column, Grouping & Workspace State Management for Data Grids

**Priority Tier:** 2 — Application Layer (shared package; cross-module data workspace utility)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Addendum A — Recommended package candidate (not yet interview-locked)
**Mold Breaker Source:** UX-MB §1 (Role-Based Project Canvas); con-tech §12 (Workflow Configurability)

---

## Problem Solved

HB Intel is increasingly table- and queue-driven. Across modules, users will need to repeatedly shape the data workspace to match how they actually work:

- choose which columns are visible
- set filter groups and default sorts
- group by project, owner, status, date, or responsibility
- change density / row height where the table implementation supports it
- save a personal working view
- share a role- or team-specific view with others
- restore the workspace quickly without rebuilding it every time

Without a shared saved-view layer, every major table implementation will manage its own persistence format and UX. The result is predictable:

- inconsistent “save view” behavior across modules
- lost productivity as users rebuild the same filters again and again
- inconsistent treatment of personal vs shared views
- no stable contract for making a saved view the default
- future migration pain as tables evolve or move between implementations

The **Saved Views** package is the shared workspace-state layer that makes the platform remember how the user works with data while remaining independent of the specific business records being displayed.

---

## Mold Breaker Rationale

The Role-Based Project Canvas principle says the platform should adapt to the user’s work context instead of forcing the user to navigate a rigid, one-size-fits-all interface. The workflow configurability principle says users should be able to shape the system within controlled guardrails.

`@hbc/saved-views` is the package that applies those ideas to data-heavy work surfaces:

1. It lets users preserve the view that matches their role and priorities.
2. It lets teams distribute standard views for recurring workflows.
3. It creates a normalized view-state contract so every module does not invent its own persistence model.
4. It supports complexity reduction by making simplified, role-specific views easy to deliver and recall.

This package is not a grid component. It is the persistence and orchestration layer for reusable workspace state.

---

## Saved View Model

The package should support both personal productivity and shared operational standards.

### View Scopes
- `personal` — visible only to the current user
- `team` — shared with a configured team / department
- `role` — provided to everyone in a role
- `system` — admin- or module-defined default views

### View Types
- **Table View** — columns, filters, sort, grouping, density
- **Queue View** — operational filters plus pinned next actions
- **Record List View** — lightweight list layouts for small screens or simplified modes

### Standard View Actions
- Save current view
- Save as new view
- Rename view
- Duplicate view
- Delete view
- Set as default
- Reset to module default
- Share with team / role (when permitted)

---

## Saved View Structure

A saved view should capture only normalized workspace state, not module business logic.

### Core Persisted Elements
- visible columns and order
- filter definitions
- sort definitions
- groupings
- density or presentation preferences
- pinned summary metrics where applicable
- optional default export format or action preference in the future

### Important Boundaries
**Included**
- state needed to restore the workspace
- labels, ownership, scope, and timestamps
- compatibility metadata for schema changes

**Excluded**
- record data itself
- module business rules
- permissions logic beyond scope and ownership checks
- full-screen behavior (belongs in shell/UI kit)

---

## Interface Contract

```typescript
export type SavedViewScope = 'personal' | 'team' | 'role' | 'system';

export interface IFilterClause {
  field: string;
  operator:
    | 'equals'
    | 'not-equals'
    | 'contains'
    | 'in'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'between'
    | 'is-empty'
    | 'is-not-empty';
  value?: unknown;
}

export interface ISortDefinition {
  field: string;
  direction: 'asc' | 'desc';
}

export interface IGroupDefinition {
  field: string;
}

export interface IViewPresentationState {
  density?: 'compact' | 'standard' | 'comfortable';
  visibleColumnKeys?: string[];
  columnOrder?: string[];
}

export interface ISavedViewDefinition {
  viewId: string;
  moduleKey: string;
  workspaceKey: string;
  title: string;
  description?: string;
  scope: SavedViewScope;
  ownerUserId?: string;
  filterClauses: IFilterClause[];
  sortBy: ISortDefinition[];
  groupBy: IGroupDefinition[];
  presentation: IViewPresentationState;
  isDefault?: boolean;
  schemaVersion: number;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface ISavedViewStateMapper<TState> {
  serialize(state: TState): Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'>;
  deserialize(view: ISavedViewDefinition): TState;
}
```

---

## Component Architecture

```
packages/saved-views/src/
├── components/
│   ├── SavedViewPicker.tsx             # switch between available views
│   ├── SaveViewDialog.tsx              # save / rename / duplicate / scope selection
│   ├── SavedViewScopeBadge.tsx         # personal / team / role / system indicator
│   ├── DefaultViewToggle.tsx           # set / unset default
│   └── ViewCompatibilityBanner.tsx     # warns if schema changed or columns missing
├── hooks/
│   ├── useSavedViews.ts                # load/apply/save/delete/default actions
│   ├── useViewCompatibility.ts         # column/schema reconciliation
│   └── useWorkspaceStateMapper.ts
├── adapters/
│   ├── sharePointSavedViewsAdapter.ts  # MVP persistence path
│   └── azureSavedViewsAdapter.ts       # future persistence path
├── mappers/
│   └── tanstackTableMapper.ts          # first-class mapper for current grid pattern
├── types.ts
└── index.ts
```

---

## Component Specifications

### `SavedViewPicker` — Shared View Switcher

```typescript
interface SavedViewPickerProps {
  moduleKey: string;
  workspaceKey: string;
  activeViewId?: string;
  onApplyView: (viewId: string) => void;
}
```

**Visual behavior:**
- appears consistently in grid / queue command bars
- separates personal, shared, and system views visually
- shows current default view
- exposes quick actions to save current workspace as a new view

### `SaveViewDialog` — Controlled Save/Share Workflow

Shows:
- title
- optional description
- scope selection based on permissions
- replace existing vs save as new
- set as default toggle

It should make sharing intentional and clear rather than implicitly pushing a personal view to others.

### `ViewCompatibilityBanner` — Schema Change Guardrail

If a module changes columns or filters after a view was saved, the package should reconcile gracefully and explain what changed:
- missing column removed
- filter field no longer valid
- fallback order applied
- incompatible grouping cleared

This protects saved views from becoming brittle as modules evolve.

### `useSavedViews` — Shared Lifecycle Hook

Responsible for:
- load views
- apply active view to workspace
- persist changes
- set/remove default
- delete or duplicate a view
- enforce scope/ownership rules

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/ui-kit` | picker, dialogs, badges, command bar controls |
| `@hbc/complexity` | provides simplified default views by role/complexity level |
| `@hbc/project-canvas` | workspace defaults can feed role-based project canvases |
| table/grid abstractions | primary workspace state source and apply target |
| `@hbc/bulk-actions` | active view can determine which data subset the user acts on |
| `@hbc/export-runtime` | exports can honor the active saved view |
| `@hbc/auth` | permission checks for team/role/system scopes |

---

## Expected Consumers

- all major data grids and queue views
- My Work and notification-adjacent work surfaces
- Business Development pursuit lists
- Estimating work queues and benchmarks
- Project Hub logs and issue lists
- Admin governance/configuration tables
- future operations, staffing, and scheduler tables

---

## Priority & ROI

**Priority:** P2 — implement once shared table patterns are stable enough to justify a single state model  
**Estimated build effort:** 3–4 sprint-weeks (view contracts, picker/save dialogs, state mapper, compatibility handling, MVP persistence adapter)  
**ROI:** substantial user productivity gain, consistent workspace behavior across modules, lower UX drift, and a reusable state layer that also strengthens export and bulk-action workflows

---

## Definition of Done

- [ ] normalized saved-view contract defined
- [ ] personal / team / role / system scopes supported
- [ ] save, rename, duplicate, delete, and set-default flows implemented
- [ ] active view apply/restore logic implemented
- [ ] first-class mapper for current table implementation created
- [ ] schema compatibility/reconciliation behavior implemented
- [ ] SharePoint-backed persistence path implemented for MVP
- [ ] permission guardrails on shared scopes implemented
- [ ] exports can honor active saved view context
- [ ] unit tests on serialization, scope permissions, default behavior, and compatibility handling
- [ ] E2E test: configure grid → save personal view → reload → apply default → share a team view

---

## ADR Reference

Create `docs/architecture/adr/0035-saved-views.md` documenting the normalized workspace-state contract, the boundary between saved view persistence and grid implementation, the scope/ownership model, and the decision to make reusable table/queue workspace memory a shared platform package.
