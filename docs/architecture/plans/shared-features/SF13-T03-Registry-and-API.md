# SF13-T03 — Registry and API: `@hbc/project-canvas`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Decisions Applied:** D-01, D-03, D-05
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan — SF13-T03 registry/API task; sub-plan of `SF13-Project-Canvas.md`.

---

## Objective

Implement tile registry and configuration API surfaces.

---

## TileRegistry

- `register(tile: ICanvasTileDefinition)`
- `registerMany(tiles: ICanvasTileDefinition[])`
- `get(tileKey: string)`
- `getAll()`
- duplicate key registration throws
- registration validation enforces Essential/Standard/Expert variants
- optional AI tile registration is supported through `aiComponent`/`AIInsightTile` contract
- registry exposes governance metadata (`mandatory`, `lockable`, data-source support)

---

## CanvasApi

- `getConfig(userId, projectId)`
- `saveConfig(config: ICanvasUserConfig)`
- `resetToRoleDefault(userId, projectId, role)`
- `getRoleMandatoryTiles(role)`
- `applyMandatoryTilesToAllProjects(role)`
- `getCanvasRecommendations(userId, projectId)` (PH Pulse, phase, usage history)
- `getTileDataSourceMetadata(projectId, tileKey)` for badge tooltip details

Persistence target: `HbcCanvasConfigs` list via backend API.
Mandatory-governance target: SharePoint admin list or central config for role-tile mandates.

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas test -- TileRegistry CanvasApi
pnpm --filter @hbc/project-canvas check-types
```

<!-- IMPLEMENTATION PROGRESS & NOTES
T03 completed: 2026-03-11
- TileRegistry: full Map-based singleton with register, registerMany, get, getAll, _clearRegistryForTests
- CanvasApi: object-export with 7 methods (getConfig, saveConfig, resetToRoleDefault, getRoleMandatoryTiles, applyMandatoryTilesToAllProjects, getCanvasRecommendations, getTileDataSourceMetadata)
- Registry throws on duplicate key, validates Essential/Standard/Expert variants
- 23 tests (14 registry + 9 API) all passing
- Barrel exports updated: registry/index.ts, api/index.ts, src/index.ts
-->
