# PH7-SF-13: `@hbc/project-canvas` — Role-Based Configurable Project Dashboard

**Priority Tier:** 2 — Application Layer (required before Project Hub and cross-module dashboard features)
**Package:** `packages/project-canvas/`
**Interview Decision:** Q23 — Option B confirmed; Bobby confirmed Role-Based Project Canvas (Mold Breaker Signature Solution #1) is covered by this package
**Mold Breaker Source:** UX-MB §1 (Role-Based Project Canvas); ux-mold-breaker.md Signature Solution #1; con-tech-ux-study §7 (Dashboard personalization gaps)

---

## Problem Solved

Project dashboards in construction management software have a universal failure mode: they try to serve every role with the same view. A Superintendent needs to see today's schedule, active constraints, and weather. A Project Manager needs financial performance, pending approvals, and RFI status. A VP of Operations needs portfolio health across all projects, not a single-project view.

When everyone sees the same dashboard, the result satisfies no one. High-value users (VPs, PMs) customize their view in spreadsheets outside the platform. Field users ignore the dashboard entirely because it shows irrelevant information.

HB Intel solves this with a **role-aware, tile-based Project Canvas** where:
- Each role has a curated default tile set relevant to their work
- Users can add, remove, and rearrange tiles within a role-appropriate catalog
- Each tile is a self-contained module widget that fetches its own data
- Tiles respect complexity tier (`@hbc/complexity`) — Essential shows summary tiles, Expert shows full-detail tiles
- Admin can lock certain tiles for specific roles (preventing removal of accountability indicators)

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #1 (Role-Based Project Canvas) specifies: "Each role sees a curated, pre-configured view of the project. The canvas is not a dashboard — it is a role-specific command center." Operating Principle §7.1 (Role-awareness) requires that the first view a user sees after navigating to a project be pre-optimized for their role, not a generic overview page.

The con-tech UX study §7 documents that personalization features in current platforms require IT configuration or are simply absent — no platform provides role-default tile sets that are also user-customizable without administrative overhead.

---

## Canvas Tile Architecture

### Tile Catalog — Phase 7 Confirmed Tiles

| Tile Key | Title | Target Roles | Data Source |
|---|---|---|---|
| `bic-my-items` | My Next Moves | All | `@hbc/bic-next-move` `useBicMyItems` |
| `project-health-pulse` | Project Health | PM, VP, Super | `@hbc/project-canvas` (see SF-21) |
| `active-constraints` | Active Constraints | PM, Super | Project Hub constraints |
| `permit-status` | Permit Log | PM, PE | Project Hub permit log |
| `pending-approvals` | Pending Approvals | PM, Director | `@hbc/acknowledgment` |
| `document-activity` | Recent Documents | All | `@hbc/sharepoint-docs` |
| `bd-heritage` | BD Heritage | PM, CE | BD module (see SF-20) |
| `estimating-pursuit` | Pursuit Status | CE, PM | Estimating module |
| `workflow-handoff-inbox` | Handoff Inbox | All | `@hbc/workflow-handoff` |
| `related-items` | Related Items | All | `@hbc/related-items` |
| `open-annotations` | Open Annotations | PM, Director | `@hbc/field-annotations` |
| `notification-summary` | Notification Summary | All | `@hbc/notification-intelligence` |

### Role-Default Tile Sets

| Role | Default Tiles |
|---|---|
| Superintendent | `bic-my-items`, `active-constraints`, `project-health-pulse`, `permit-status` |
| Project Manager | `bic-my-items`, `project-health-pulse`, `pending-approvals`, `active-constraints`, `bd-heritage`, `workflow-handoff-inbox` |
| Project Engineer | `bic-my-items`, `active-constraints`, `permit-status`, `document-activity` |
| Chief Estimator | `bic-my-items`, `estimating-pursuit`, `bd-heritage`, `workflow-handoff-inbox` |
| VP of Operations | `project-health-pulse`, `bic-my-items`, `pending-approvals`, `notification-summary` |
| Director of Preconstruction | `bic-my-items`, `workflow-handoff-inbox`, `pending-approvals`, `bd-heritage` |

---

## Interface Contract

```typescript
// packages/project-canvas/src/types/IProjectCanvas.ts

export interface ICanvasTileDefinition {
  /** Unique tile identifier */
  tileKey: string;
  /** Display title */
  title: string;
  /** Description shown in tile catalog */
  description: string;
  /** Roles for which this tile appears in the default set */
  defaultForRoles: string[];
  /** Minimum complexity tier required */
  minComplexity?: ComplexityTier;
  /** Tile component (lazy-loaded) */
  component: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
  /** Default size in a 12-column grid */
  defaultColSpan: 3 | 4 | 6 | 12;
  defaultRowSpan: 1 | 2;
  /** Whether admin can lock this tile (prevent user removal) */
  lockable: boolean;
}

export interface ICanvasTileProps {
  projectId: string;
  tileKey: string;
  isLocked?: boolean;
}

export interface ICanvasUserConfig {
  userId: string;
  projectId: string;
  /** Ordered list of tile placements */
  tiles: ICanvasTilePlacement[];
}

export interface ICanvasTilePlacement {
  tileKey: string;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
  isLocked?: boolean;
}
```

---

## Package Architecture

```
packages/project-canvas/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IProjectCanvas.ts
│   │   └── index.ts
│   ├── registry/
│   │   └── TileRegistry.ts               # all tiles registered here
│   ├── api/
│   │   └── CanvasApi.ts                  # get/save user canvas config
│   ├── hooks/
│   │   ├── useProjectCanvas.ts           # loads user config + tile registry
│   │   ├── useCanvasEditor.ts            # drag-to-rearrange, add/remove tiles
│   │   └── useRoleDefaultCanvas.ts       # resolves default tile set for current user role
│   └── components/
│       ├── HbcProjectCanvas.tsx          # main canvas grid renderer
│       ├── HbcCanvasEditor.tsx           # edit mode: add/remove/rearrange tiles
│       ├── HbcTileCatalog.tsx            # catalog of available tiles for adding
│       ├── tiles/
│       │   ├── BicMyItemsTile.tsx
│       │   ├── PendingApprovalsTile.tsx
│       │   ├── DocumentActivityTile.tsx
│       │   ├── WorkflowHandoffInboxTile.tsx
│       │   └── ... (one file per tile)
│       └── index.ts
```

---

## Component Specifications

### `HbcProjectCanvas` — Main Canvas

```typescript
interface HbcProjectCanvasProps {
  projectId: string;
  /** Whether to show the edit controls */
  editable?: boolean;
}
```

**Visual behavior:**
- 12-column CSS Grid layout
- Tiles rendered as cards with header (title, options menu) and body (tile component)
- "Edit Canvas" button in page header enters edit mode (`HbcCanvasEditor`)
- Locked tiles show lock icon; edit controls are hidden for locked tiles
- Tiles lazy-load their data independently — canvas renders immediately even if individual tiles are loading

### `HbcCanvasEditor` — Edit Mode

```typescript
interface HbcCanvasEditorProps {
  projectId: string;
  onSave: () => void;
  onCancel: () => void;
}
```

**Visual behavior:**
- Drag-to-rearrange: tiles become draggable; drop zones highlighted on drag over
- Resize handles: tiles can be resized within grid constraints
- "Add Tile" CTA opens `HbcTileCatalog`
- Remove tile: X button appears on each non-locked tile in edit mode
- "Save Layout" / "Cancel" CTAs; Cancel reverts to last saved state

### `HbcTileCatalog` — Tile Selection Panel

```typescript
interface HbcTileCatalogProps {
  currentTiles: string[];
  onAddTile: (tileKey: string) => void;
  onClose: () => void;
}
```

**Visual behavior:**
- Grid of available tiles not currently on canvas
- Each tile card: title, description, preview thumbnail
- Tiles filtered by current user's role (locked-out tiles not shown)
- Clicking a tile card calls `onAddTile` and closes the catalog

---

## Canvas Persistence

User canvas configurations are stored in `HbcCanvasConfigs` SharePoint list:

| Column | Type | Description |
|---|---|---|
| `ConfigId` | Single line | GUID |
| `UserId` | Single line | UPN |
| `ProjectId` | Single line | Project record ID |
| `TilesJson` | Multiple lines | JSON array of `ICanvasTilePlacement` |
| `LastModified` | Date/Time | UTC timestamp |

If no user config exists for a project, the role-default tile set is rendered and a config is created on first "Save Layout" action.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | `BicMyItemsTile` uses `useBicMyItems` to show all items where user is current BIC owner |
| `@hbc/acknowledgment` | `PendingApprovalsTile` shows all pending acknowledgments for current user |
| `@hbc/workflow-handoff` | `WorkflowHandoffInboxTile` shows pending inbound handoff packages |
| `@hbc/complexity` | Essential: simplified tile bodies (summary only); Expert: full tile detail |
| `@hbc/notification-intelligence` | `NotificationSummaryTile` shows Immediate + Watch tier items |
| `@hbc/sharepoint-docs` | `DocumentActivityTile` shows recent document uploads for the project |
| `@hbc/related-items` | `RelatedItemsTile` shows cross-module linked records |
| PH9b My Work Feed (§A) | `BicMyItemsTile` and `PendingApprovalsTile` are canvas-embedded subsets of the My Work Feed |

---

## SPFx Constraints

- `HbcProjectCanvas` available as a full-page SPFx webpart (primary Project Hub view)
- Tile components import from `@hbc/ui-kit/app-shell` in SPFx context
- Canvas config API routes through Azure Functions backend
- Drag-to-rearrange uses `@dnd-kit/core` (compatible with SPFx modern bundles)

---

## Priority & ROI

**Priority:** P1 — The Project Canvas is the primary Project Hub view for all roles; without it, Project Hub has no meaningful homepage
**Estimated build effort:** 6–8 sprint-weeks (canvas grid, editor, catalog, tile registry, 8+ initial tile components, config API)
**ROI:** Replaces the universal-but-serves-no-one dashboard with role-specific command centers; enables VPs to see portfolio health, PMs to see their action items, and Supers to see their field priorities — all from the same platform

---

## Definition of Done

- [ ] `ICanvasTileDefinition` contract defined; `TileRegistry` allows cross-package tile registration
- [ ] `CanvasApi.getConfig()` and `CanvasApi.saveConfig()` implemented
- [ ] `useProjectCanvas` loads user config or role-default tile set
- [ ] `useCanvasEditor` manages drag, resize, add, remove with unsaved-change tracking
- [ ] `HbcProjectCanvas` renders 12-column grid with lazy-loaded tile components
- [ ] `HbcCanvasEditor` drag-to-rearrange + resize working
- [ ] `HbcTileCatalog` renders available tiles filtered by role
- [ ] All 12 Phase 7 tiles implemented (see tile catalog table above)
- [ ] Role-default tile sets configured for 6 roles (see role table above)
- [ ] Admin tile locking: locked tiles cannot be removed by user
- [ ] `@hbc/complexity` integration: Essential/Standard/Expert tile body variants
- [ ] Canvas config persisted to `HbcCanvasConfigs` SharePoint list
- [ ] SPFx webpart wrapper implemented for Project Hub
- [ ] Unit tests on tile registry, role-default resolution, config persistence
- [ ] E2E test: load canvas → edit mode → add tile → rearrange → save → reload → config restored

---

## ADR Reference

Create `docs/architecture/adr/0022-project-canvas-role-based-dashboard.md` documenting the tile registry pattern, the role-default tile set configuration, the admin locking mechanism, and the choice of `@dnd-kit/core` for drag-to-rearrange.
