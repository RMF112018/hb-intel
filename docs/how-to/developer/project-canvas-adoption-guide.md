# Project Canvas Adoption Guide

> **Doc Classification:** Living Reference (Diataxis) — How-to quadrant; developer audience; project-canvas module adoption.

This guide explains how to integrate `@hbc/project-canvas` into feature modules. The package provides role-based configurable dashboards with tile registration, editor mode, mandatory governance, recommendation-first catalog, data-source transparency, and AI tile extensibility.

**ADR:** [ADR-0102](../../architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md)
**API Reference:** [project-canvas API](../../reference/project-canvas/api.md)
**Master Plan:** [SF13-Project-Canvas](../../architecture/plans/shared-features/SF13-Project-Canvas.md)

---

## 1. When to Use project-canvas

Use `@hbc/project-canvas` when a feature module needs:

- A role-aware project dashboard with configurable tile layout
- User-customizable tile arrangement with persistence
- Admin-governed mandatory tiles that cannot be removed
- Data-source transparency badges on tile headers
- Recommendation-first tile catalog with PH Pulse smart defaults

If your feature only needs a static layout, a standard page component is sufficient. Use `@hbc/project-canvas` when the dashboard must adapt to the user's role, project context, and governance policy.

---

## 2. Registering Tiles in TileRegistry

Every tile must be registered before it can appear in a canvas. Use `register()` for a single tile or `registerMany()` for batch registration:

```tsx
import { register, registerMany } from '@hbc/project-canvas';
import type { ICanvasTileDefinition } from '@hbc/project-canvas';

// Single registration
register({
  id: 'my-custom-tile',
  label: 'My Custom Tile',
  description: 'Displays custom project metrics',
  category: 'analytics',
  defaultColSpan: 4,
  defaultRowSpan: 2,
  dataSourceBadge: 'Live',
  essentialComponent: () => import('./MyTileEssential'),
  standardComponent: () => import('./MyTileStandard'),
  expertComponent: () => import('./MyTileExpert'),
});

// Batch registration
registerMany([tile1, tile2, tile3]);
```

Each tile definition must provide all three complexity-tier lazy components (`essentialComponent`, `standardComponent`, `expertComponent`) per D-06.

---

## 3. Defining Role-Default Tile Sets

Role defaults determine which tiles appear on first load for each role. The `ROLE_DEFAULT_TILES` constant maps each of the six core roles to an ordered array of tile placements:

```tsx
import { ROLE_DEFAULT_TILES } from '@hbc/project-canvas';

// Access defaults for a specific role
const superintendentTiles = ROLE_DEFAULT_TILES.superintendent;
// Returns: ICanvasTilePlacement[]
```

To add a tile to role defaults, update the `canvasDefaults.ts` constants. Each placement specifies `tileId`, `col`, `row`, `colSpan`, and `rowSpan`.

---

## 4. Enabling Editor Mode and Save/Reset Flows

The `useCanvasEditor` hook manages editor state, including add/remove/rearrange/resize operations with unsaved-change tracking:

```tsx
import { useCanvasEditor } from '@hbc/project-canvas';

function CanvasWithEditor() {
  const {
    isEditing,
    startEditing,
    stopEditing,
    addTile,
    removeTile,
    moveTile,
    resizeTile,
    hasUnsavedChanges,
    saveLayout,
    resetLayout,
  } = useCanvasEditor();

  return (
    <>
      <button onClick={isEditing ? stopEditing : startEditing}>
        {isEditing ? 'Done' : 'Edit'}
      </button>
      {hasUnsavedChanges && (
        <>
          <button onClick={saveLayout}>Save</button>
          <button onClick={resetLayout}>Reset</button>
        </>
      )}
    </>
  );
}
```

The `HbcCanvasEditor` component wraps `HbcProjectCanvas` with built-in drag-and-drop rearrangement using `@dnd-kit/core` (D-08).

---

## 5. Applying Lock and Mandatory Governance

Administrators can lock tiles and enforce mandatory governance. Locked tiles cannot be moved or removed by end users. Mandatory tiles are role-governed and support role-wide apply:

```tsx
import { useCanvasMandatoryTiles } from '@hbc/project-canvas';
import { MANDATORY_GOVERNANCE_APPLY_MODE, MANDATORY_TILE_LOCK_ICON } from '@hbc/project-canvas';

function GovernanceInfo() {
  const { mandatoryTiles, isMandatory } = useCanvasMandatoryTiles();

  // Check if a specific tile is mandatory for the current role
  const isLocked = isMandatory('notification-summary');
  // MANDATORY_GOVERNANCE_APPLY_MODE: 'role-wide'
  // MANDATORY_TILE_LOCK_ICON: visual indicator for locked tiles
}
```

Mandatory tiles are visually distinguished with a lock icon and cannot be removed or hidden, enforcing governance across all projects for a role (D-05).

---

## 6. Recommendation-First Catalog and PH Pulse Smart Defaults

The `useCanvasRecommendations` hook provides dynamic tile recommendations based on Project Health Pulse signals:

```tsx
import { useCanvasRecommendations } from '@hbc/project-canvas';
import { RECOMMENDATION_SIGNALS } from '@hbc/project-canvas';

function TileCatalogWithRecommendations() {
  const { recommendations, isLoading } = useCanvasRecommendations();

  // recommendations are ordered by relevance score
  // RECOMMENDATION_SIGNALS defines the PH Pulse signal types
}
```

On first load (no saved config), the `useRoleDefaultCanvas` hook auto-adjusts the role default tile set using current PH Pulse metrics. For example, schedule or constraint tiles are promoted when Schedule Health is red (D-02).

---

## 7. Data-Source Badge Transparency and Notification-Summary

Each tile header displays a data-source badge (`Live`, `Manual`, or `Hybrid`) for transparency:

```tsx
import { DATA_SOURCE_BADGES, DATA_SOURCE_TOOLTIP_SCHEMA } from '@hbc/project-canvas';
import type { DataSourceBadge, IDataSourceTooltip } from '@hbc/project-canvas';

// Badge types: 'Live' | 'Manual' | 'Hybrid'
// Tooltip schema provides hover details about data freshness
```

The `notification-summary` tile acts as the single intelligent notification hub for real-time Immediate/Watch items with one-click routing, integrating with `@hbc/notification-intelligence` (D-09).

---

## 8. Registering AI Modules via AIInsightTile

The `AIInsightTile` component is a standardized container for future AI-driven insight tiles:

```tsx
import { AIInsightTile } from '@hbc/project-canvas';

// AIInsightTile provides:
// - Standard tile container with complexity-tier rendering
// - Registration pathway via TileRegistry
// - Consistent styling and data-source badge integration
```

Register AI tiles through the standard `register()` API with the AI category. The `AIInsightTile` container handles complexity-tier variant rendering automatically (D-09).

---

## 9. Using Testing Fixtures from `@hbc/project-canvas/testing`

The testing sub-path exports mock factories for unit and integration tests:

```tsx
import {
  createMockTileDefinition,
  createMockCanvasConfig,
  createMockTilePlacement,
  mockRoleDefaultCanvases,
  createMockRecommendation,
  createMockDataSourceMetadata,
} from '@hbc/project-canvas/testing';

// Create a mock tile definition with overrides
const tile = createMockTileDefinition({ id: 'test-tile', category: 'analytics' });

// Create a full canvas config
const config = createMockCanvasConfig({ placements: [placement1, placement2] });

// Access pre-built role-default canvases
const defaults = mockRoleDefaultCanvases;

// Create mock recommendation for catalog tests
const rec = createMockRecommendation({ tileId: 'schedule-health', score: 0.95 });

// Create mock data-source metadata for badge tests
const meta = createMockDataSourceMetadata({ badge: 'Live' });
```

All mock factories produce type-safe objects that match the package's runtime contracts (D-10).
