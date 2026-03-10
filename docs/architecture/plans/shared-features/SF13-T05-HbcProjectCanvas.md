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
- each tile card includes title and lock indicator
- edit entry action opens `HbcCanvasEditor`
- tile components lazy-load independently
- supports complexity-aware tile body rendering hooks

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas test -- HbcProjectCanvas
pnpm --filter @hbc/project-canvas build
```
