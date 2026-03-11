# SF13-T05 — `HbcProjectCanvas`: `@hbc/project-canvas`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Decisions Applied:** D-01, D-06, D-07
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan — SF13-T05 core canvas component task; sub-plan of `SF13-Project-Canvas.md`.

---

## Objective

Implement main 12-column canvas renderer with lazy tile loading and view/edit mode entry.

---

## Component Contract

```typescript
interface HbcProjectCanvasProps {
  projectId: string;
  editable?: boolean;
}
```

---

## Behavior

- renders placement grid from `useProjectCanvas`
- each tile card includes title, lock indicator, and data-source badge (`Live`/`Manual`/`Hybrid`)
- data-source badge tooltip shows source system(s), last sync time, and quick controls
- edit entry action opens `HbcCanvasEditor`
- tile components lazy-load independently
- supports complexity-aware tile body rendering with Essential/Standard/Expert lazy variants
- mandatory tiles render as locked non-removable surfaces
- `notification-summary` tile operates as the single intelligent Immediate/Watch hub with one-click source navigation

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas test -- HbcProjectCanvas
pnpm --filter @hbc/project-canvas build
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF13-T05 completed: 2026-03-11
Files created:
  - src/components/CanvasTileCard.tsx (internal tile card sub-component)
  - src/__tests__/HbcProjectCanvas.test.tsx (18 tests)
  - .eslintrc.cjs (ESLint config for package)
Files rewritten:
  - src/components/HbcProjectCanvas.tsx (full orchestrator replacing placeholder)
Barrel verified: src/components/index.ts already exports HbcProjectCanvas; CanvasTileCard stays internal
Gates passed: check-types ✓ | build ✓ | test (84/84) ✓ | lint ✓
Next: T06 (HbcCanvasEditor + TileCatalog)
-->
