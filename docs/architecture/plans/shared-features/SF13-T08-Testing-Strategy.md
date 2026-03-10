# SF13-T08 — Testing Strategy: `@hbc/project-canvas`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Decisions Applied:** D-04, D-05, D-08, D-10
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF13-T08 testing strategy task; sub-plan of `SF13-Project-Canvas.md`.

---

## Objective

Define fixture factories and test coverage for registry, hooks, editor interactions, and tile rendering behavior.

---

## Testing Sub-Path

- `createMockTileDefinition`
- `createMockCanvasConfig`
- `createMockTilePlacement`
- `mockRoleDefaultCanvases`

---

## Required Coverage

- TileRegistry register/get/duplicate handling
- CanvasApi get/save/reset flows
- role-default resolution correctness
- editor add/remove/move/resize + lock constraints
- component render checks for canvas/editor/catalog
- Storybook variants: role + complexity + edit states
- Playwright: edit/save/reload persistence scenario

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas test --coverage
pnpm --filter @hbc/project-canvas storybook
pnpm exec playwright test --grep "project-canvas"
```
