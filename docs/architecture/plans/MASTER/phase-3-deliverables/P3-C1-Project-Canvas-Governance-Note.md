# P3-C1: Project Canvas Governance Note

| Field | Value |
|---|---|
| **Doc ID** | P3-C1 |
| **Phase** | Phase 3 |
| **Workstream** | C — Canvas-first Project Home |
| **Document Type** | Note |
| **Owner** | Experience / Shell Team + Project Hub platform owner |
| **Update Authority** | Experience lead; changes require review by Architecture and Product/Design |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §9](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A2 §5](P3-A2-Membership-Role-Authority-Contract.md); [P3-G1 §6](P3-G1-Lane-Capability-Matrix.md); [P2-D2](../phase-2-deliverables/P2-D2-Adaptive-Layout-and-Zone-Governance-Spec.md); [ADR-0102](../../../architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md); [`@hbc/project-canvas` README](../../../../packages/project-canvas/README.md) |

---

## Governance Statement

The Project Hub home is **canvas-first** (Phase 3 plan §9.1). `@hbc/project-canvas` is a required foundation — the project home surface is not a fixed dashboard with optional personalization bolted on later. Canvas governance is part of the product definition.

Phase 3 uses **governed flexibility**:

- Every project role receives a **default canvas** arrangement.
- Some tiles are **mandatory and locked** — they cannot be removed, hidden, or displaced.
- Some tiles are **role-default but adjustable** — present on first load, but users may reorder or resize them.
- Some tiles are **optional/user-managed** — added from the tile catalog at the user's discretion.

This note formalizes the tile registration rules, mandatory tile policy, role-default assignments, complexity-tier rendering, edit-mode constraints, data-source transparency, persistence model, and cross-lane consistency rules that govern the canvas-first project home.

**Repo-truth audit — 2026-03-21.** `@hbc/project-canvas` (v0.0.1, SF13, ADR-0102 locked) is mature with a complete `TileRegistry`, 12 reference tile definitions, 3 complexity tiers (essential/standard/expert), `ROLE_DEFAULT_TILES` mapping for 6 roles, `useCanvasEditor` with governance enforcement, `useCanvasMandatoryTiles` hook, `CanvasApi` for persistence/reset/recommendations, and health-pulse canvas integration adapter. See §1 for full reconciliation.

---

## Scope

### This note governs

- The canvas-first composition model for Project Hub home
- Tile registration governance (validation rules, complexity-tier requirement)
- Mandatory and locked tile policy by project role
- Role-default canvas assignments
- Complexity-tier rendering rules
- Edit-mode constraints (what users can and cannot modify)
- Data-source badge and transparency rules
- Canvas persistence and reset behavior
- Cross-lane canvas consistency

### This note does NOT govern

- Mandatory core tile family definitions (specific tile content/data sources) — see P3-C2
- Lane-aware home/canvas capability matrix — see P3-C3
- Lane capability depth differences — see [P3-G1](P3-G1-Lane-Capability-Matrix.md)
- Project membership and role resolution — see [P3-A2](P3-A2-Membership-Role-Authority-Contract.md)
- Personal Work Hub zone governance — see [P2-D2](../phase-2-deliverables/P2-D2-Adaptive-Layout-and-Zone-Governance-Spec.md)
- Spine publication (data feeding tiles) — see [P3-A3](P3-A3-Shared-Spine-Publication-Contract-Set.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Canvas** | The governed adaptive layout surface on the Project Hub home page, powered by `@hbc/project-canvas` |
| **Tile** | A self-contained UI component that occupies one or more grid cells on the canvas and renders project-relevant data or actions |
| **Tile definition** | A registered metadata record (`ICanvasTileDefinition`) describing a tile's key, title, roles, mandatory status, complexity variants, and default size |
| **Tile placement** | A positioned instance of a tile on a user's canvas (`ICanvasTilePlacement`) with grid coordinates and size |
| **Mandatory tile** | A tile that MUST appear on every canvas for the specified role and cannot be removed by the user |
| **Locked tile** | A tile that is both mandatory and lockable — cannot be removed, moved, resized, or reordered |
| **Role-default tile** | A tile included in the initial canvas arrangement for a role; adjustable by the user |
| **Complexity tier** | One of three rendering variants (`essential`, `standard`, `expert`) that control the detail level of a tile's UI |
| **Edit mode** | The canvas state where users can add, remove, reorder, and resize non-mandatory/non-locked tiles |
| **Tile catalog** | The browsable list of available tiles that users can add to their canvas during edit mode |
| **Data-source badge** | A visual indicator (`Live`, `Manual`, `Hybrid`) showing the data freshness and origin of a tile's content |

---

## 1. Current-State Reconciliation

### 1.1 Canvas infrastructure (mature)

| Artifact | Location | Status |
|---|---|---|
| `@hbc/project-canvas` | `packages/project-canvas/` (v0.0.1) | **Mature** (SF13, ADR-0102 locked) |
| `TileRegistry` | `packages/project-canvas/src/registry/TileRegistry.ts` | **Live** — `register()`, `registerMany()`, `get()`, `getAll()` |
| 12 reference tiles | `packages/project-canvas/src/tiles/referenceTileDefinitions.ts` | **Live** — 3 mandatory, 9 optional |
| `ROLE_DEFAULT_TILES` | `packages/project-canvas/src/constants/canvasDefaults.ts` | **Live** — 6 role mappings |
| `useCanvasEditor` | `packages/project-canvas/src/hooks/useCanvasEditor.ts` | **Live** — governance-enforced editing |
| `useCanvasMandatoryTiles` | `packages/project-canvas/src/hooks/useCanvasMandatoryTiles.ts` | **Live** — mandatory tile enforcement |
| `useProjectCanvas` | `packages/project-canvas/src/hooks/useProjectCanvas.ts` | **Live** — orchestrating hook |
| `CanvasApi` | `packages/project-canvas/src/api/CanvasApi.ts` | **Live** — persistence, reset, recommendations |
| `HbcProjectCanvas` | `packages/project-canvas/src/components/HbcProjectCanvas.tsx` | **Live** — main canvas component |
| Health-pulse adapter | `packages/features/project-hub/src/health-pulse/integrations/projectCanvasAdapter.ts` | **Live** — deterministic projection |

### 1.2 Grid and layout constants

| Constant | Value | Purpose |
|---|---|---|
| `CANVAS_GRID_COLUMNS` | 12 | CSS Grid column count |
| `DEFAULT_COL_SPAN` | 4 | Default tile width on add |
| `DEFAULT_ROW_SPAN` | 1 | Default tile height on add |
| `MIN_COL_SPAN` | 3 | Minimum tile width |
| `MAX_COL_SPAN` | 12 | Maximum tile width |
| `MIN_ROW_SPAN` | 1 | Minimum tile height |
| `MAX_ROW_SPAN` | 2 | Maximum tile height |
| `MANDATORY_GOVERNANCE_APPLY_MODE` | `'role-wide'` | How mandatory tiles are enforced |

---

## 2. Canvas-First Composition Model

### 2.1 Governance model

Phase 3 uses **governed flexibility** — three tile governance tiers:

| Tier | Definition | User control |
|---|---|---|
| **Mandatory locked** | Tile is required for the role AND lockable; appears on every canvas | Cannot remove, move, resize, or reorder |
| **Role-default** | Tile is included in the role's initial arrangement but not mandatory | Can reorder, resize, or remove |
| **User-managed optional** | Tile is available in the catalog; not placed by default | Can add, remove, reorder, resize |

### 2.2 Anti-freeform rule

The canvas is **not** a freeform dashboard builder:

- Every canvas MUST include mandatory locked tiles for the user's project role.
- The tile catalog is governed — only registered tiles appear; arbitrary widget creation is not supported.
- All tiles MUST provide all three complexity-tier variants.
- Grid layout is constrained to a 12-column system with min/max size bounds.

---

## 3. Tile Registration Governance

### 3.1 Registration rules

Every tile that appears on the Project Hub canvas MUST be registered with the `TileRegistry` at app-initialization time.

| Rule | Enforcement |
|---|---|
| Each tile MUST have a unique `tileKey` | Registry throws on duplicate |
| Each tile MUST provide all 3 complexity variants (essential, standard, expert) | Registry validates on registration |
| Tiles are registered once at initialization | No late registration or unregistration |
| Tiles MUST declare `defaultForRoles` | Empty array is acceptable (catalog-only tiles) |
| Tiles MUST declare `mandatory` and `lockable` flags | Governs enforcement behavior |
| Tiles MUST declare `defaultColSpan` and `defaultRowSpan` | Used for role-default layout generation |

### 3.2 Registration contract

The tile definition type `ICanvasTileDefinition` is the registration contract:

| Field | Type | Purpose |
|---|---|---|
| `tileKey` | `string` | Unique identifier |
| `title` | `string` | Display title |
| `description` | `string` | Catalog description |
| `defaultForRoles` | `string[]` | Roles receiving this tile by default |
| `minComplexity` | `ComplexityTier` (optional) | Minimum complexity tier required to show tile |
| `mandatory` | `boolean` | Cannot be removed when true |
| `component.essential` | `React.LazyExoticComponent` | Essential-tier variant |
| `component.standard` | `React.LazyExoticComponent` | Standard-tier variant |
| `component.expert` | `React.LazyExoticComponent` | Expert-tier variant |
| `aiComponent` | `React.LazyExoticComponent` (optional) | AI insight container |
| `defaultColSpan` | `3 \| 4 \| 6 \| 12` | Default width |
| `defaultRowSpan` | `1 \| 2` | Default height |
| `lockable` | `boolean` | Can be admin-locked |

### 3.3 Current reference tile inventory

| Tile Key | Mandatory | Lockable | Default Roles | Default Size |
|---|---|---|---|---|
| `bic-my-items` | Yes | Yes | All 6 roles | 4 × 1 |
| `project-health-pulse` | Yes | Yes | Superintendent, PM, VP | 6 × 1 |
| `pending-approvals` | Yes | Yes | PM, VP, DirPrecon | 4 × 1 |
| `active-constraints` | No | No | Superintendent, PM, PE | 4 × 1 |
| `permit-status` | No | No | Superintendent, PE | 3 × 1 |
| `bd-heritage` | No | No | PM, CE, DirPrecon | 4 × 1 |
| `workflow-handoff-inbox` | No | No | PM, PE, CE, DirPrecon | 6 × 1 |
| `document-activity` | No | No | PE | 4 × 1 |
| `estimating-pursuit` | No | No | CE | 4 × 1 |
| `notification-summary` | No | No | VP | 4 × 1 |
| `related-items` | No | No | (catalog-only) | 4 × 1 |
| `ai-insight` | No | No | (catalog-only) | 6 × 1 |

---

## 4. Mandatory and Locked Tile Policy

### 4.1 Mandatory tile enforcement

A tile is **mandatory** for a role if its `mandatory` flag is `true` AND it appears in the role's default tile set. Mandatory tiles:

- MUST appear on every canvas for that role.
- MUST be automatically appended if missing from a user's saved configuration.
- MUST NOT be removable in edit mode.

### 4.2 Locked tile enforcement

A tile is **locked** if it is both `mandatory: true` AND `lockable: true`. Locked tiles additionally:

- MUST NOT be moved, resized, or reordered by the user.
- MUST display a lock icon (`MANDATORY_TILE_LOCK_ICON = 'lock'`) in edit mode.
- MAY only be repositioned by admin action via `CanvasApi.applyMandatoryTilesToAllProjects()`.

### 4.3 Phase 3 mandatory operational core

Per Phase 3 plan §9.3, every Project Hub home canvas MUST include:

- **Project identity / context header** — always present (rendered by canvas shell, not a registered tile)
- **Project Health visibility** — via `project-health-pulse` tile (mandatory, locked)
- **Next-action / Work Queue visibility** — via work queue tile (to be registered in Phase 3)
- **Related-items visibility** — via `related-items` tile (to be upgraded to mandatory in Phase 3)
- **Recent project activity visibility** — via activity tile (to be registered in Phase 3)

**Gap:** The current 3 mandatory tiles (`bic-my-items`, `project-health-pulse`, `pending-approvals`) do not yet include Work Queue, Related Items, or Activity tiles as mandatory. Phase 3 must register these tiles and update the mandatory set. This is classified as **controlled evolution**.

### 4.4 Reconciliation with P3-A2 role-based defaults

P3-A2 §5 defines canvas defaults by project role. The Phase 3 tile registration must align the current 6-role `ROLE_DEFAULT_TILES` mapping with the 7-level project role taxonomy defined in P3-A2 §3.1.

---

## 5. Role-Default Canvas Assignments

### 5.1 Current role-default mapping

The current `ROLE_DEFAULT_TILES` mapping covers 6 roles:

| Role | Default Tiles |
|---|---|
| Superintendent | `bic-my-items`, `active-constraints`, `project-health-pulse`, `permit-status` |
| Project Manager | `bic-my-items`, `project-health-pulse`, `pending-approvals`, `active-constraints`, `bd-heritage`, `workflow-handoff-inbox` |
| Project Engineer | `bic-my-items`, `active-constraints`, `permit-status`, `document-activity` |
| Chief Estimator | `bic-my-items`, `estimating-pursuit`, `bd-heritage`, `workflow-handoff-inbox` |
| VP of Operations | `project-health-pulse`, `bic-my-items`, `pending-approvals`, `notification-summary` |
| Director of Preconstruction | `bic-my-items`, `workflow-handoff-inbox`, `pending-approvals`, `bd-heritage` |

### 5.2 Phase 3 alignment requirement

Phase 3 must extend this mapping to align with the P3-A2 project role taxonomy. The target mapping must cover:

- Project Administrator
- Project Executive
- Project Manager
- Superintendent
- Project Team Member
- Project Viewer
- External Contributor

The auto-layout algorithm in `useRoleDefaultCanvas` places tiles left-to-right, wrapping to the next row when the grid boundary is reached.

---

## 6. Complexity-Tier Rendering Rules

### 6.1 Tier definitions

| Tier | User experience | Component variant |
|---|---|---|
| `essential` | Coaching-heavy, core features only, simplified interactions | `component.essential` |
| `standard` | Default experience, balanced feature set | `component.standard` |
| `expert` | Full feature set, advanced workflows, maximum data density | `component.expert` |

### 6.2 Tier selection

- The user's complexity preference is read from `useComplexity()` (provided by `@hbc/complexity`).
- `HbcProjectCanvas` selects the appropriate component variant via React Suspense/lazy loading.
- Tiles with `minComplexity` set are hidden when the user's tier is below the minimum.

### 6.3 Tier consistency

- All tiles MUST provide all three variants — the registry enforces this at registration time.
- Tier selection is **user-level**, not project-level or role-level. A user sees the same tier across all projects.
- Both lanes render the same tier for the same user.

---

## 7. Edit-Mode Governance

### 7.1 Edit-mode capabilities

In edit mode, users MAY:

- Add tiles from the catalog
- Remove non-mandatory, non-locked tiles
- Reorder non-locked tiles
- Resize tiles within bounds (column span 3–12, row span 1–2)
- Move non-locked tiles to different grid positions

### 7.2 Edit-mode constraints

In edit mode, users MUST NOT:

- Remove mandatory tiles
- Move, resize, or reorder locked tiles
- Exceed grid boundaries (`colStart + colSpan - 1 <= 12`)
- Add tiles not registered in the `TileRegistry`
- Create tile sizes outside the min/max bounds

### 7.3 Edit-mode enforcement

The `useCanvasEditor` hook enforces all constraints:

- `isMandatory(tileKey)` — blocks removal
- `isLocked(tileKey)` — blocks move, resize, reorder
- `resizeTile()` — clamps to min/max bounds and grid boundary
- `getEditableTiles()` — returns only non-mandatory, non-locked tiles

Unsaved changes can be discarded via `cancel()`.

---

## 8. Data-Source Badge and Transparency Rules

### 8.1 Badge types

Every tile MAY carry a `DataSourceBadge` indicating data origin and freshness:

| Badge | Meaning | Display behavior |
|---|---|---|
| `Live` | Automatically synced from source systems | Show last-sync timestamp, source system name |
| `Manual` | Data entered manually by users | Show quick-controls for editing |
| `Hybrid` | Combines live and manual data | Show last-sync + source system + quick-controls |

### 8.2 Tooltip schema

Each badge has a governed tooltip with `IDataSourceTooltip`:
- `label` — human-readable badge name
- `description` — explanation of data source
- `showLastSync` — whether to display sync timestamp
- `showSourceSystem` — whether to show source system name
- `showQuickControls` — whether to show edit/refresh controls

### 8.3 Transparency rule

Users MUST always be able to understand where a tile's data comes from. The data-source badge is governance infrastructure, not decoration. Tiles SHOULD declare their badge at render time via `ICanvasTileProps.dataSource`.

---

## 9. Canvas Persistence and Reset Rules

### 9.1 Persistence model

| Operation | API | Behavior |
|---|---|---|
| Save config | `CanvasApi.saveConfig(config)` | Persists `ICanvasUserConfig` (userId + projectId + tile placements) |
| Load config | `CanvasApi.getConfig(userId, projectId)` | Returns saved config or `null` (triggers role-default) |
| Reset to defaults | `CanvasApi.resetToRoleDefault(userId, projectId, role)` | Replaces config with role-default layout |
| Apply mandatory tiles | `CanvasApi.applyMandatoryTilesToAllProjects(role)` | Admin action: locks mandatory tiles across all projects for a role |

### 9.2 First-visit behavior

When a user visits a project canvas for the first time (no saved config):

1. Resolve the user's effective project role (P3-A2 §3.2).
2. Generate the role-default canvas via `useRoleDefaultCanvas(role)`.
3. Ensure all mandatory tiles are included.
4. Render the default layout.
5. The user may customize from this starting point.

### 9.3 Reset behavior

When a user resets their canvas:

1. The current config is replaced with the role-default layout.
2. Mandatory tiles are preserved with their lock state.
3. User-added optional tiles are removed.
4. The reset is saved immediately.

---

## 10. Cross-Lane Canvas Consistency

Per P3-G1 §6, both the PWA and SPFx lanes use the same canvas governance:

| Aspect | Rule |
|---|---|
| Canvas package | Both lanes use `@hbc/project-canvas` |
| Tile registry | Same registered tiles in both lanes |
| Mandatory tiles | Same mandatory set per role |
| Role defaults | Same default tile arrangement |
| Governance model | Same mandatory locked + role-default + user-managed tiers |
| Complexity tiers | Same tier selection per user |
| Personalization depth | Both lanes support governed adaptive composition |

Lane differences are limited to **depth and continuity** (PWA richer per P3-G1), not governance model divergence.

**Distinction from Phase 2:** P2-B0 restricts SPFx to curated composition for the Personal Work Hub. Phase 3 Project Hub defines its own lane doctrine where **both lanes use governed adaptive composition** via `@hbc/project-canvas` (P3-G1 §6.2).

---

## 11. Repo-Truth Reconciliation Notes

1. **`@hbc/project-canvas` is mature — compliant**
   The package (v0.0.1, SF13, ADR-0102 locked) provides the complete canvas governance infrastructure: tile registry with validation, 12 reference tiles, role-default mappings, mandatory tile enforcement, edit-mode constraints, Canvas API, and complexity-tier rendering. Classified as **compliant**.

2. **3 mandatory tiles exist; Phase 3 requires 5+ — controlled evolution**
   Current mandatory tiles are `bic-my-items`, `project-health-pulse`, and `pending-approvals`. Phase 3 plan §9.3 requires mandatory visibility for Work Queue, Related Items, and Activity — these tiles must be registered and added to the mandatory set. Classified as **controlled evolution**.

3. **`ROLE_DEFAULT_TILES` covers 6 roles; Phase 3 requires 7 — controlled evolution**
   The current mapping uses job-title-style role names (Superintendent, Project Manager, etc.). P3-A2 defines 7 project roles. The mapping must be extended and aligned with the project role taxonomy. Classified as **controlled evolution**.

4. **Canvas persistence via `CanvasApi` — compliant, not yet wired to backend**
   `CanvasApi` defines the persistence contract but backend storage (where `ICanvasUserConfig` records live) is not yet implemented. Phase 3 must wire this to real storage. Classified as **controlled evolution**.

5. **Health-pulse canvas adapter — compliant**
   `projectHealthPulseToCanvasTile()` in `packages/features/project-hub/src/health-pulse/integrations/projectCanvasAdapter.ts` correctly projects health-pulse data into a canvas tile with `DataSourceBadge: 'Hybrid'`. Classified as **compliant**.

6. **Canvas not yet rendered on project home — controlled evolution**
   Neither the PWA `ProjectHubPage` nor the SPFx `DashboardPage` currently renders `HbcProjectCanvas`. Both show a portfolio-level data table. Phase 3 must replace the portfolio dashboard with the canvas-first per-project home. Classified as **controlled evolution**.

7. **Tile catalog uses `@dnd-kit/core` for drag-and-drop — compliant**
   The `HbcCanvasEditor` component uses `@dnd-kit/core` for tile drag-and-drop during edit mode, which is declared as a dependency. Classified as **compliant**.

---

## 12. Acceptance Gate Reference

**Gate:** Home/canvas gates (Phase 3 plan §18.3)

| Field | Value |
|---|---|
| **Pass condition** | Project home is canvas-first; mandatory operational core surfaces exist on every home canvas; canvas governance supports locked, role-default, and optional tile classes |
| **Evidence required** | P3-C1 (this document), `HbcProjectCanvas` rendered on project home in both lanes, mandatory tile presence verification, edit-mode constraint tests, role-default layout tests |
| **Primary owner** | Experience / Shell + Project Hub platform owner |

---

## 13. Policy Precedence

This note establishes the **canvas governance foundation** that downstream Phase 3 deliverables must conform to:

| Deliverable | Relationship to P3-C1 |
|---|---|
| **P3-A2** — Membership / Role Authority Contract | Provides project role taxonomy that drives role-default assignments (§5) and mandatory tile policy (§4) |
| **P3-C2** — Mandatory Core Tile Family Definition | Must define specific tile content/data sources for mandatory tiles identified in §4.3 |
| **P3-C3** — Lane-Aware Home/Canvas Capability Matrix | Must respect cross-lane consistency rules (§10) |
| **P3-G1** — Lane Capability Matrix | Provides lane composition rules (§6) that this note implements |
| **P3-E1** — Module Classification Matrix | Module tiles must be registered per the governance rules in §3 |
| **P3-H1** — Acceptance Checklist | Must include home/canvas gate evidence |
| **Any tile implementation** | Must register with `TileRegistry`, provide all 3 complexity variants, and declare mandatory/lockable status |

If a downstream deliverable conflicts with this note, this note takes precedence unless the Experience lead approves a documented exception.

---

**Last Updated:** 2026-03-21
**Governing Authority:** [Phase 3 Plan §9](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
