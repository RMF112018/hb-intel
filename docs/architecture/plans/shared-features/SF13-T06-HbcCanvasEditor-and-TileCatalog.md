# SF13-T06 — `HbcCanvasEditor` and `HbcTileCatalog`: `@hbc/project-canvas`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Decisions Applied:** D-04, D-05, D-08
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T05

> **Doc Classification:** Canonical Normative Plan — SF13-T06 editor/catalog task; sub-plan of `SF13-Project-Canvas.md`.

---

## Objective

Implement edit-mode operations and tile catalog selection flow.

---

## Editor Behavior

- drag-to-rearrange via `@dnd-kit/core`
- resize handles constrained to valid spans
- remove button hidden/disabled on locked and mandatory tiles
- mandatory tiles remain non-removable and non-repositionable in editor mode
- save/cancel controls

## Catalog Behavior

- shows only role-eligible tiles not already placed
- tile card includes title/description/preview
- selecting tile adds to editor layout and closes catalog
- recommendation-first ordering uses Project Health Pulse, project phase, and usage history
- recommended tiles include short explanatory notes and still allow immediate user override

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas test -- HbcCanvasEditor HbcTileCatalog
pnpm --filter @hbc/project-canvas build
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF13-T06 completed: 2026-03-11
Files modified:
  - src/components/HbcCanvasEditor.tsx — full editor with toolbar, grid, tile cards, catalog overlay
  - src/components/HbcTileCatalog.tsx — catalog browser with filtering, sorting, mandatory badges
  - src/components/HbcProjectCanvas.tsx — wired HbcCanvasEditor into isEditing block, destructured save
  - src/__tests__/HbcCanvasEditor.test.tsx — 14 tests (toolbar, governance, catalog integration)
  - src/__tests__/HbcTileCatalog.test.tsx — 8 tests (filtering, add action, empty state, mandatory badge)
Verification: 10 test files, 106 tests passed; zero type/build/lint errors
DnD deferred: reorder via move-up/move-down buttons using reorderTiles(fromIndex, toIndex)
Next: T07 (Reference Integrations)
-->
