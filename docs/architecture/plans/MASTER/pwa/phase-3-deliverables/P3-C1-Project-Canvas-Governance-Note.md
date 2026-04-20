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
| **References** | [Phase 3 Plan §9](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A2 §5](P3-A2-Membership-Role-Authority-Contract.md); [P3-G1 §6](P3-G1-Lane-Capability-Matrix.md); [P2-D2](../phase-2-deliverables/P2-D2-Adaptive-Layout-and-Zone-Governance-Spec.md); [P2-F1](../phase-2-deliverables/P2-F1-My-Work-Hub-UI-Quality-and-Mold-Breaker-Conformance-Plan.md); [ADR-0102](../../../architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md); [`@hbc/project-canvas` README](../../../../packages/project-canvas/README.md); [UI-Kit Mold-Breaker Principles](../../../reference/ui-kit/UI-Kit-Mold-Breaker-Principles.md); [UI-Kit Visual Language Guide](../../../reference/ui-kit/UI-Kit-Visual-Language-Guide.md); [UI-Kit Field-Readability Standards](../../../reference/ui-kit/UI-Kit-Field-Readability-Standards.md); [UI-Kit Adaptive Data Surface Patterns](../../../reference/ui-kit/UI-Kit-Adaptive-Data-Surface-Patterns.md); [UI-Kit Usage and Composition Guide](../../../reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md) |

---

## Governance Statement

The Project Hub project-scoped home is **canvas-first** (Phase 3 plan §9.1). `@hbc/project-canvas` is a required foundation for the canonical project-scoped Control Center route at `/project-hub/{projectId}` — that surface is not a fixed dashboard with optional personalization bolted on later. Canvas governance is part of the product definition. The unscoped `/project-hub` portfolio root is a separate operating surface and is not governed by this note.

Phase 3 uses **governed flexibility**:

- Every project role receives a **default canvas** arrangement.
- Some tiles are **mandatory and locked** — they cannot be removed, hidden, or displaced.
- Some tiles are **role-default but adjustable** — present on first load, but users may reorder or resize them.
- Some tiles are **optional/user-managed** — added from the tile catalog at the user's discretion.

This note formalizes the tile registration rules, mandatory tile policy, role-default assignments, complexity-tier rendering, edit-mode constraints, data-source transparency, persistence model, and cross-lane consistency rules that govern the canvas-first project-scoped home / Control Center.

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
- UI-Kit conformance requirements for all Phase 3 Project Hub surfaces (canvas, modules, spines, reports, executive review)

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

6. **Route split is live; canvas adoption on the project-scoped Control Center remains controlled evolution**
   Repo truth now explicitly separates the meaningful unscoped portfolio root (`/project-hub`) from the project-scoped Control Center at `/project-hub/{projectId}`. The remaining controlled-evolution gap is canvas adoption on that project-scoped Control Center route and the matching SPFx home surface. The portfolio root is not replaced by canvas; the project-scoped Control Center is the route that must render `HbcProjectCanvas`. Classified as **controlled evolution**.

7. **Tile catalog uses `@dnd-kit/core` for drag-and-drop — compliant**
   The `HbcCanvasEditor` component uses `@dnd-kit/core` for tile drag-and-drop during edit mode, which is declared as a dependency. Classified as **compliant**.

---

## 12. Acceptance Gate Reference

**Gate:** Home/canvas gates (Phase 3 plan §18.3)

| Field | Value |
|---|---|
| **Pass condition** | Project home is canvas-first; mandatory operational core surfaces exist on every home canvas; canvas governance supports locked, role-default, and optional tile classes |
| **Evidence required** | P3-C1 (this document), `HbcProjectCanvas` rendered on the project-scoped Control Center in both lanes, mandatory tile presence verification, edit-mode constraint tests, role-default layout tests |
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

## 14. UI Conformance Requirements for Phase 3 Project Hub Surfaces

Every Phase 3 Project Hub surface — canvas/home, all module surfaces (Financial, Schedule, Constraints, Permits, Safety, QC, Warranty), all shared spine surfaces (Health, Activity, Work Queue, Related Items), Reports workspace, and executive review surfaces — must conform to the HB Intel UI Kit standards and the Phase 2 UI quality precedents established in P2-F1.

### 14.1 Governing UI-Kit documents

Implementors must read the governing document before making the corresponding implementation decision. A design choice not traceable to a governing source requires Experience lead approval.

| Governing Document | What It Governs for Phase 3 |
|---|---|
| [UI-Kit-Mold-Breaker-Principles.md](../../../reference/ui-kit/UI-Kit-Mold-Breaker-Principles.md) | MB-01–MB-08 governing constraints for all Phase 3 surfaces. These are constraints, not aspirational goals. |
| [UI-Kit-Visual-Language-Guide.md](../../../reference/ui-kit/UI-Kit-Visual-Language-Guide.md) | All `HBC_*` token values: color palette, shape/radius, typography scale, spacing, elevation shadows, surface roles. Hardcoded values are prohibited. |
| [UI-Kit-Field-Readability-Standards.md](../../../reference/ui-kit/UI-Kit-Field-Readability-Standards.md) | Touch target sizes (`HBC_DENSITY_TOKENS`), row height minimums, body/label text minimums, contrast ratio requirements, and `useDensity()` usage. |
| [UI-Kit-Visual-Hierarchy-and-Depth-Standards.md](../../../reference/ui-kit/UI-Kit-Visual-Hierarchy-and-Depth-Standards.md) | Elevation levels, content levels (`HBC_CONTENT_LEVELS`), zone distinctions (`HBC_ZONE_DISTINCTIONS`), card weight classes (`HBC_CARD_WEIGHTS`), and the Three-Second Read Standard. |
| [UI-Kit-Adaptive-Data-Surface-Patterns.md](../../../reference/ui-kit/UI-Kit-Adaptive-Data-Surface-Patterns.md) | Data surface type selection: dense analysis table, responsive hybrid, card/list view, summary strip. Horizontal scroll prohibition enforcement. |
| [UI-Kit-Wave1-Page-Patterns.md](../../../reference/ui-kit/UI-Kit-Wave1-Page-Patterns.md) | Approved composition patterns. `WorkspacePageShell` is required for every Project Hub page. |
| [UI-Kit-Accessibility-Findings.md](../../../reference/ui-kit/UI-Kit-Accessibility-Findings.md) | ARIA requirements, focus ring patterns, reduced-motion compliance. |
| [UI-Kit-Usage-and-Composition-Guide.md](../../../reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md) | Component import rules (Fluent UI through `@hbc/ui-kit` only), token import patterns, card weight class usage, `useDensity()` usage, and common composition mistakes. |
| [UI-Kit-Application-Standards-Conformance-Report.md](../../../reference/ui-kit/UI-Kit-Application-Standards-Conformance-Report.md) | 6 contribution governance rules binding on all Phase 3 feature development. |

### 14.2 Implementation rules binding on all Phase 3 Project Hub surfaces

| Rule | Governing Source |
|---|---|
| Every Project Hub page surface MUST use `WorkspacePageShell` as the page wrapper | UI-Kit-Wave1-Page-Patterns.md; UI-Kit-Usage-and-Composition-Guide.md |
| All Fluent UI primitives MUST be imported through `@hbc/ui-kit` — never directly from `@fluentui/react-components` (D-10) | UI-Kit-Usage-and-Composition-Guide.md; Application Standards Conformance Report |
| No hardcoded hex, rgb, or pixel values in component CSS — use `HBC_*` tokens exclusively; the `enforce-hbc-tokens` ESLint rule must pass clean on all Phase 3 surfaces | MB-08; UI-Kit-Visual-Language-Guide.md |
| Card weight classes MUST differentiate visual hierarchy — never render a grid of identically-weighted cards; use `weight="primary"` for the dominant card, `"standard"` for general content, `"supporting"` for metadata | T04 (UI-Kit-Visual-Hierarchy-and-Depth-Standards.md) |
| Data surfaces MUST be selected per the T06 decision guide (dense analysis table / responsive hybrid / card/list / summary strip) — the selection must be documented per live routed surface and per planned deeper module data zone | UI-Kit-Adaptive-Data-Surface-Patterns.md |
| Density system MUST be implemented via `useDensity()` and `HBC_DENSITY_TOKENS` — all surfaces must function correctly in compact (desktop), comfortable (tablet), and touch (field) tiers | MB-05; UI-Kit-Field-Readability-Standards.md |
| Touch targets MUST meet `HBC_DENSITY_TOKENS[tier].touchTargetMin` minimums: 44px in touch, 36px in comfortable, 24px in compact | MB-07; UI-Kit-Field-Readability-Standards.md |
| Horizontal scrolling is PROHIBITED as a default behavior for data surfaces — use adaptive column hiding (`columnVisibility`), `frozenColumns`, and card fallback per T06 | MB-04; UI-Kit-Adaptive-Data-Surface-Patterns.md |
| Every data-dependent zone MUST use `HbcSmartEmptyState` or `HbcEmptyState` — no blank areas or null-rendered zones | MB-01; UI-Kit-Usage-and-Composition-Guide.md |
| Reusable visual primitives BELONG IN `@hbc/ui-kit` — no feature-local duplicates of kit components (enforced by T12 contribution governance) | Architecture invariant; Application Standards Conformance Report |
| All new `@hbc/ui-kit` contributions require: Storybook stories covering all states and density variants, ARIA compliance, token-only styling, and README documentation | Application Standards Conformance Report §Contribution Governance |

**Repo-truth reconciliation — 2026-03-25.** Stage 11.2 splits T06 conformance into two inventories so implementation evidence stays honest. The live routed SPFx Project Hub surfaces currently implemented in `apps/project-hub` use: summary-strip / KPI for the home-route summary band, and card/list view for the governed module-lane summary/action surfaces and dashboard escalation or launcher zones. Future deeper module data zones keep their T06 commitments documented now without being treated as already-live SPFx runtime: Financial budget-line and scorecard comparisons are `dense analysis table`; Schedule milestone and upload-history lists are `responsive hybrid`; Constraints and Permits ledger-style logs are `responsive hybrid`; Work Queue and Activity feeds are `card/list view`; Project health summary bands remain `summary strip / KPI`. Undocumented ad hoc surface choices do not satisfy Stage 11.2.

**Repo-truth reconciliation — 2026-03-25.** Stage 11.3 closes a separate conformance gap from T06. The live Project Hub SPFx routed surfaces and shared `src/spfx-lane` surface still had hardcoded spacing/layout literals and inline-style debt after Stage 11.2, while the existing `enforce-hbc-tokens` rule only verified hex literals in app scope. Stage 11.3 therefore requires both runtime cleanup and rule/scope expansion: the routed app surfaces and shared lane surface must use token-backed styling, `enforce-hbc-tokens` must verify hex/rgb/pixel literals in style-bearing contexts, and D-10 direct-import proof must stay explicit and separate from token verification. Unrelated package areas with independent UI debt are not valid substitutes for Stage 11.3 evidence on the live Project Hub SPFx lane.

### 14.3 Mold-breaker principle bindings for Project Hub

| Principle | Project Hub implementation requirement |
|---|---|
| **MB-01 Lower cognitive load** | Canvas home opens to role-appropriate current work; complexity tiers (essential/standard/expert) implemented on all tiles and module surfaces; smart empty states guide users to next actionable step; first actionable item reachable in <30 seconds |
| **MB-02 Stronger first-glance hierarchy** | Status and next-move ownership indicators present on all work items, constraint records, permit records, and health pulse tiles; minimum 3-level type scale; status colors exceed 7:1 contrast ratio |
| **MB-03 Less shell fatigue** | Project identity, current phase, and role-appropriate actions always visible in project context header; work queue spine consolidates actionable items; no scattered module-level notification indicators |
| **MB-04 Less horizontal scrolling** | All module data tables (Financial budget lines, Schedule milestones, Constraints log, Permits log) operate without horizontal scroll at ≥1024px via adaptive column hiding; card fallback at <640px; split-pane financial views reflow at <1366px |
| **MB-05 More adaptive density** | Three-tier density (Essential/Standard/Expert) implemented on all Project Hub surfaces; device-aware defaults; role-based admin configuration supported; advanced fields hidden in lower tiers with "?" disclosure affordance |
| **MB-06 More deliberate depth** | Measured elevation system (2px/4px/8px/16px) applied to all Project Hub panels and overlays; module detail views include context breadcrumb enabling jump-back to canvas; interactive states (hover/focus/active/disabled) visually distinct on all controls |
| **MB-07 Field-usable contrast and touch** | Status colors meet ≥7:1 contrast ratio for sunlight readability; Safety and field-primary module surfaces verified in touch density; all interactive elements meet touch target minimums per tier |
| **MB-08 No version-boundary seams** | All Project Hub surfaces use the single `@hbc/ui-kit` token set; no module-level visual overrides; all modules share identical button styles, card patterns, table layouts, and status color semantics |

### 14.4 Phase 2 UI precedents binding on Phase 3

Phase 2 (My Work Hub / Personal Work Hub, P2-F1) established the following patterns that are binding precedents for Phase 3 Project Hub surfaces:

| Phase 2 precedent (P2-F1) | Phase 3 Project Hub application |
|---|---|
| Two-column persistent layout (work feed + right panel) for the primary work surface | Project Hub module detail surfaces and spine panels with primary content + context panels use the same two-column persistent pattern |
| KPI cards use `DashboardLayout` + `HbcKpiCard` with semantic color palette, typographic hierarchy, and click-to-filter | Project Health tile, Financial Summary tile, and all KPI-level data surfaces in Project Hub use `DashboardLayout` + `HbcKpiCard`; no raw custom KPI card implementations |
| Work item rows show lane headers, metadata density, and collapse state; row metadata density standards from P2-F1 G2 | Work Queue spine surface and any work-item list in Project Hub follow the same row metadata density and lane header patterns |
| `@hbc/project-canvas` tile layout for secondary and tertiary zones — no raw custom Griffel grid implementations for canvas zones | Project Hub canvas uses `HbcProjectCanvas` exclusively; no raw custom grid for canvas zones |
| Active filter count visible in toolbar even when filter panel is collapsed | All Project Hub module data surfaces with filter systems show active filter count in the `HbcCommandBar` toolbar |
| Context-sensitive CTA labels that match the current action context | All Project Hub primary actions and CTAs use context-sensitive labels; generic labels ("Submit", "OK") are prohibited |
| Focus ring visibility verified on all interactive components (P2-F1 UIF-017) | All Phase 3 Project Hub interactive elements have visible focus indicators meeting WCAG AA minimum |
| Project color coding in sidebar navigation | Project Hub preserves project identity color coding established in Phase 2 and applies it to the project context header |

### 14.5 Conformance verification requirement

**Repo-truth reconciliation note — 2026-03-25.** Stage 11.4 is not a pure review checkbox. Before this closure pass, the live routed Project Hub SPFx lane still lacked explicit `useDensity()` wiring and had no shell-level density control when a page had no command actions. Stage 11.4 therefore closes a live runtime gap on the routed home, governed module, shared SPFx lane, and unresolved-context fallback surfaces. This density/touch work remains separate from Stage 11.3 token-compliance verification even though both belong to the broader Stage 11 mold-breaker gate.

Before any Phase 3 surface may pass its §18 acceptance gate, it must produce mold-breaker conformance evidence. Use the `.claude/agents/hb-ui-ux-conformance-reviewer.md` specialist to evaluate:

- `@hbc/ui-kit` alignment and any feature-local duplicate primitive detection
- Cross-surface UX consistency between Project Hub surfaces and Personal Work Hub (Phase 2)
- Mold-breaker experience alignment per MB-01 through MB-08
- Touch target and density compliance in all three density tiers
- Token compliance (`enforce-hbc-tokens` ESLint rule passing clean)

Conformance evidence must be recorded in P3-H1 §13 (Evidence Collection Log). No surface may pass the §18.3 home/canvas gate, §18.5 core module gate, or §18.6 reporting gate without mold-breaker conformance evidence.

---

**Last Updated:** 2026-03-25
**Governing Authority:** [Phase 3 Plan §9](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
