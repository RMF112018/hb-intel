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

---

## CanvasApi

- `getConfig(userId, projectId)`
- `saveConfig(config: ICanvasUserConfig)`
- `resetToRoleDefault(userId, projectId, role)`

Persistence target: `HbcCanvasConfigs` list via backend API.

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas test -- TileRegistry CanvasApi
pnpm --filter @hbc/project-canvas check-types
```
