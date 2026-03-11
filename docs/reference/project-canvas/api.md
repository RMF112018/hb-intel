# @hbc/project-canvas — API Reference

> **Doc Classification:** Living Reference (Diataxis) — Reference quadrant; developer audience; project-canvas API reference.

Complete export reference for `@hbc/project-canvas`. Source: `packages/project-canvas/src/index.ts` (58 exports) and `packages/project-canvas/testing/index.ts` (9 exports).

**ADR:** [ADR-0102](../../architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md)
**Adoption Guide:** [project-canvas-adoption-guide](../../how-to/developer/project-canvas-adoption-guide.md)

---

## Types

| Export | Kind | Description |
|--------|------|-------------|
| `ComplexityTier` | type | `'essential' \| 'standard' \| 'expert'` — user complexity tier |
| `DataSourceBadge` | type | `'Live' \| 'Manual' \| 'Hybrid'` — tile data freshness indicator |
| `IDataSourceTooltip` | interface | Tooltip metadata for data-source badges |
| `ICanvasTileDefinition` | interface | Full tile registration contract: id, label, category, complexity variants, sizing, data-source badge |
| `ICanvasTileProps` | interface | Props passed to tile components at render time |
| `ICanvasUserConfig` | interface | Persisted user/project canvas configuration |
| `ICanvasTilePlacement` | interface | Grid placement: tileId, col, row, colSpan, rowSpan |
| `RecommendationSignal` | type | PH Pulse signal type for recommendation ordering |
| `ICanvasApi` | interface | Canvas API contract for persistence operations |

---

## Constants

| Export | Type | Description |
|--------|------|-------------|
| `CANVAS_GRID_COLUMNS` | `number` | Grid column count (12) |
| `DEFAULT_COL_SPAN` | `number` | Default tile column span |
| `DEFAULT_ROW_SPAN` | `number` | Default tile row span |
| `MIN_COL_SPAN` | `number` | Minimum tile column span |
| `MAX_COL_SPAN` | `number` | Maximum tile column span |
| `MIN_ROW_SPAN` | `number` | Minimum tile row span |
| `MAX_ROW_SPAN` | `number` | Maximum tile row span |
| `ROLE_DEFAULT_TILES` | `Record<string, ICanvasTilePlacement[]>` | Role-default tile sets for six core roles |
| `RECOMMENDATION_SIGNALS` | `RecommendationSignal[]` | PH Pulse signal types driving recommendation ordering |
| `DATA_SOURCE_BADGES` | `Record<DataSourceBadge, object>` | Badge configuration per data-source type |
| `DATA_SOURCE_TOOLTIP_SCHEMA` | `object` | Tooltip schema for data-source badge hover |
| `MANDATORY_GOVERNANCE_APPLY_MODE` | `string` | Governance apply mode (`'role-wide'`) |
| `MANDATORY_TILE_LOCK_ICON` | `string` | Visual icon identifier for mandatory tile lock |

---

## Registry

| Export | Signature | Description |
|--------|-----------|-------------|
| `register` | `(def: ICanvasTileDefinition) => void` | Register a single tile definition |
| `registerMany` | `(defs: ICanvasTileDefinition[]) => void` | Register multiple tile definitions |
| `get` | `(id: string) => ICanvasTileDefinition \| undefined` | Retrieve a tile definition by ID |
| `getAll` | `() => ICanvasTileDefinition[]` | Retrieve all registered tile definitions |

---

## API

### `CanvasApi`

Canvas configuration persistence API (D-03).

| Method | Signature | Description |
|--------|-----------|-------------|
| `getConfig` | `(userId: string, projectId: string) => Promise<ICanvasUserConfig \| null>` | Retrieve saved canvas config |
| `saveConfig` | `(config: ICanvasUserConfig) => Promise<void>` | Save canvas configuration |
| `resetConfig` | `(userId: string, projectId: string) => Promise<void>` | Reset to role defaults |
| `getLockedTiles` | `(projectId: string) => Promise<string[]>` | Get admin-locked tile IDs |
| `getMandatoryTiles` | `(role: string) => Promise<string[]>` | Get mandatory tile IDs for role |
| `applyMandatoryGovernance` | `(role: string, tileIds: string[]) => Promise<void>` | Apply mandatory tiles role-wide |

---

## Hooks

| Export | Signature | Description |
|--------|-----------|-------------|
| `useProjectCanvas` | `() => { placements, isLoading, error }` | Main canvas hook — resolves placements from saved config or role defaults |
| `useCanvasConfig` | `() => { config, isLoading, save, reset }` | Raw config access with save/reset |
| `useCanvasEditor` | `() => { isEditing, startEditing, stopEditing, addTile, removeTile, moveTile, resizeTile, hasUnsavedChanges, saveLayout, resetLayout }` | Editor state management with unsaved-change tracking (D-04) |
| `useRoleDefaultCanvas` | `() => { defaults, adjustedDefaults }` | Role-default resolver with PH Pulse smart adjustments (D-02) |
| `useCanvasRecommendations` | `() => { recommendations, isLoading }` | Dynamic tile recommendations from PH Pulse signals |
| `useCanvasMandatoryTiles` | `() => { mandatoryTiles, isMandatory }` | Mandatory governance tile resolver (D-05) |

---

## Components

| Export | Props | Description |
|--------|-------|-------------|
| `HbcProjectCanvas` | Standard canvas props | Main canvas renderer: 12-column grid, lazy tile loading, data-source badges (D-01, D-06, D-08) |
| `HbcCanvasEditor` | Editor canvas props | Editor mode wrapper with drag-and-drop rearrangement via `@dnd-kit/core` (D-04, D-08) |
| `HbcTileCatalog` | Catalog props | Tile catalog with recommendation-first ordering and category filtering |
| `AIInsightTile` | AI tile props | Standardized container for AI-driven insight tiles (D-09) |

---

## Reference Tiles

| Export | Type | Description |
|--------|------|-------------|
| `referenceTiles` | `ICanvasTileDefinition[]` | Pre-defined reference tile definitions for 12 Phase 7 tiles |
| `registerReferenceTiles` | `() => void` | Convenience function to register all reference tiles |

---

## Testing Sub-Path (`@hbc/project-canvas/testing`)

| Export | Kind | Description |
|--------|------|-------------|
| `createMockTileDefinition` | factory | Creates a mock `ICanvasTileDefinition` with optional overrides |
| `createMockCanvasConfig` | factory | Creates a mock `ICanvasUserConfig` with optional overrides |
| `createMockTilePlacement` | factory | Creates a mock `ICanvasTilePlacement` with optional overrides |
| `mockRoleDefaultCanvases` | constant | Pre-built role-default canvas configurations for all six roles |
| `createMockRecommendation` | factory | Creates a mock recommendation object with optional overrides |
| `MockRecommendation` | type | Type for mock recommendation objects |
| `createMockDataSourceMetadata` | factory | Creates a mock data-source metadata object with optional overrides |
| `MockDataSourceMetadata` | type | Type for mock data-source metadata objects |
