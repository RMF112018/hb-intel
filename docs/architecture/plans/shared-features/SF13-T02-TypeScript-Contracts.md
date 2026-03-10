# SF13-T02 — TypeScript Contracts: `@hbc/project-canvas`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Decisions Applied:** D-01, D-02, D-05, D-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan — SF13-T02 contracts task; sub-plan of `SF13-Project-Canvas.md`.

---

## Objective

Define all public contracts for tile definitions, user configs, placements, role defaults, and editor state.

---

## Core Contracts

```typescript
export interface ICanvasTileDefinition {
  tileKey: string;
  title: string;
  description: string;
  defaultForRoles: string[];
  minComplexity?: ComplexityTier;
  component: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
  defaultColSpan: 3 | 4 | 6 | 12;
  defaultRowSpan: 1 | 2;
  lockable: boolean;
}

export interface ICanvasTileProps {
  projectId: string;
  tileKey: string;
  isLocked?: boolean;
}

export interface ICanvasTilePlacement {
  tileKey: string;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
  isLocked?: boolean;
}

export interface ICanvasUserConfig {
  userId: string;
  projectId: string;
  tiles: ICanvasTilePlacement[];
}
```

---

## Constants

- 12-column grid default
- role default tile-set map
- editor constraints (min/max col span, row span)

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas check-types
pnpm --filter @hbc/project-canvas build
```
