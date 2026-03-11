# SF13-T04 — Hooks: `@hbc/project-canvas`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Decisions Applied:** D-02, D-04, D-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan — SF13-T04 hooks task; sub-plan of `SF13-Project-Canvas.md`.

---

## Objective

Implement `useProjectCanvas`, `useCanvasEditor`, and `useRoleDefaultCanvas`.

---

## Hook Contracts

- `useRoleDefaultCanvas(role: string, projectId: string): ICanvasTilePlacement[]`
  - resolves role baseline and applies first-load PH Pulse smart adjustments
- `useProjectCanvas(projectId: string)`
  - loads user config or falls back to role default
  - resolves mandatory tile overlays and data-source metadata for tile headers
- `useCanvasEditor(initialTiles)`
  - supports add/remove/move/resize
  - tracks `hasUnsavedChanges`
  - returns dynamic recommendations (health + phase + usage history) with explanatory notes

---

## Invariants

- locked tiles cannot be removed or moved
- mandatory tiles cannot be removed and retain lock semantics across save/reset
- tile additions deduplicate by `tileKey`
- editor cancel restores last saved state
- smart-default promotions never remove required role baseline tiles

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas test -- useRoleDefaultCanvas useProjectCanvas useCanvasEditor
pnpm --filter @hbc/project-canvas check-types
```

<!-- IMPLEMENTATION PROGRESS & NOTES
T04 completed: 2026-03-11
Hooks implemented (6 total):
  - useRoleDefaultCanvas — role-default tile resolution with auto-layout (useMemo, pure computation)
  - useCanvasConfig — config load/save/reset via CanvasApi (useState + useEffect + useCallback)
  - useCanvasMandatoryTiles — mandatory tile resolution + isMandatory/isLocked helpers
  - useCanvasRecommendations — recommendation fetch with signal-priority sorting + graceful degradation
  - useCanvasEditor — full editor with add/remove/move/resize/reorder + constraint enforcement (no-op on locked/mandatory)
  - useProjectCanvas — orchestrator composing config + defaults + mandatory overlay
Tests created (5 suites, 43 tests):
  - useCanvasConfig.test.ts (7 tests)
  - useCanvasEditor.test.ts (17 tests)
  - useCanvasRecommendations.test.ts (5 tests)
  - useCanvasMandatoryTiles.test.ts (7 tests)
  - useProjectCanvas.test.ts (7 tests)
Barrel exports updated: src/hooks/index.ts, src/index.ts
Verification: check-types ✓, build ✓, test 66/66 ✓
Next: T05 (HbcProjectCanvas grid renderer)
-->
