# @hbc/project-canvas

Role-based configurable project dashboard canvas for HB Intel — Mold Breaker Signature Solution #1.

## Overview

`@hbc/project-canvas` provides a drag-and-drop, role-aware canvas that surfaces the most relevant project tiles for each user. Tiles are registered via a central `TileRegistry`, laid out on a 12-column CSS Grid, and default to role-specific sets that can be further customized per-user and per-project.

## Quick Start

```tsx
import {
  HbcProjectCanvas,
  createSpfxCanvasStorageAdapter,
} from '@hbc/project-canvas';

function ProjectDashboard({ projectId }: { projectId: string }) {
  return (
    <HbcProjectCanvas
      projectId={projectId}
      userId="user-001"
      role="Project Manager"
      persistenceAdapter={createSpfxCanvasStorageAdapter()}
    />
  );
}
```

## Role-Default and Locking Model

Each of the six core roles (Superintendent, Project Manager, Project Engineer, Chief Estimator, VP of Operations, Director of Preconstruction) receives a curated default tile set on first load. Administrators can **lock** mandatory tiles to prevent user removal, ensuring governance compliance across all projects.

## Smart Defaulting from Project Health Pulse

On first load (or when no user config exists), the system intelligently adjusts the role-default tile set using current Project Health Pulse metrics — for example, automatically promoting schedule or constraint tiles when Schedule Health is red — while still respecting core role defaults and allowing immediate user override.

## Mandatory Governance Tier

Administrators can designate tiles as **mandatory** for specific roles, enforcing an "Apply to all projects" policy. Mandatory tiles cannot be removed or hidden by end users and are visually distinguished in the canvas.

## Tile Registry and Editor Model

Tiles are registered via `TileRegistry.register()` with metadata including complexity-tier variants (Essential / Standard / Expert), grid sizing, and role defaults. The `HbcCanvasEditor` component provides add/remove/rearrange/resize controls, and the `HbcTileCatalog` presents available tiles with AI-driven dynamic recommendation ordering.

## Data-Source Badge Model

Each tile displays a data-source badge indicating its data freshness:

| Badge | Meaning |
|-------|---------|
| **Live** | Real-time data from connected systems |
| **Manual** | User-entered or imported data |
| **Hybrid** | Combination of live and manual sources |

Badges integrate with the notification hub to surface data-quality alerts.

## AIInsightTile Container

The `AIInsightTile` component provides a standardized container for AI-driven insight tiles. It supports registration via the tile registry and renders the appropriate complexity-tier variant based on user preferences.

## Exports

| Entry Point | Description |
|-------------|-------------|
| `@hbc/project-canvas` | Full package: types, constants, registry, API, hooks, components |
| `@hbc/project-canvas/testing` | Test factories: `createMockTileDefinition`, `createMockCanvasConfig`, `createMockTilePlacement`, `mockRoleDefaultCanvases` |

## Persistence Adapters

`HbcProjectCanvas`, `useProjectCanvas`, and `useCanvasConfig` default to the shared `CanvasApi` persistence path. Consumers that need a different governed runtime seam may supply an additive `ICanvasPersistenceAdapter` instead of forking the canvas logic.

- PWA or API-backed consumers can keep the default `CanvasApi` path.
- SPFx consumers can use `createSpfxCanvasStorageAdapter()` for immediate local persistence and compose additional host-specific mirror sync above that adapter.

## Architecture Boundaries

- **Runtime dependency**: `@dnd-kit/core` for drag-and-drop interactions
- **Peer dependencies**: `react`, `react-dom` (^18.3.0)
- **SPFx compatibility**: Components use inline styles only (D-07); no external CSS imports
- **Bundle boundary**: `sideEffects: false` enables tree-shaking for consuming packages
- **ESLint boundary rules**: Enforced via `@hbc/eslint-plugin-hbc`

## Related Documentation

- [SF13 Master Plan](../../docs/architecture/plans/shared-features/SF13-Project-Canvas.md)
- [SF13-T09 Testing & Deployment](../../docs/architecture/plans/shared-features/SF13-T09-Testing-and-Deployment.md)
- [ADR-0102 — Project Canvas Role-Based Dashboard Primitive](../../docs/architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md)
- [Adoption Guide](../../docs/how-to/developer/project-canvas-adoption-guide.md)
- [API Reference](../../docs/reference/project-canvas/api.md)
