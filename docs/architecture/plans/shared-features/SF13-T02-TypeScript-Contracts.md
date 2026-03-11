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
  mandatory?: boolean;
  component: {
    essential: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
    standard: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
    expert: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
  };
  aiComponent?: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
  defaultColSpan: 3 | 4 | 6 | 12;
  defaultRowSpan: 1 | 2;
  lockable: boolean;
}

export interface ICanvasTileProps {
  projectId: string;
  tileKey: string;
  isLocked?: boolean;
  dataSource?: 'Live' | 'Manual' | 'Hybrid';
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
- recommendation signal ordering constants (health, phase, usage-history)
- data-source badge vocabulary and tooltip schema constants
- mandatory-governance constants for role apply behavior

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas check-types
pnpm --filter @hbc/project-canvas build
```

<!-- IMPLEMENTATION PROGRESS & NOTES
T02 completed: 2026-03-11
- IDataSourceTooltip interface added to IProjectCanvas.ts (D-08)
- 5 constant groups added to canvasDefaults.ts: ROLE_DEFAULT_TILES (D-02), editor constraints (D-04), RECOMMENDATION_SIGNALS (D-02), DATA_SOURCE_BADGES + DATA_SOURCE_TOOLTIP_SCHEMA (D-08), MANDATORY_GOVERNANCE_APPLY_MODE + MANDATORY_TILE_LOCK_ICON (D-05)
- RecommendationSignal type derived from RECOMMENDATION_SIGNALS via as-const
- All barrel exports updated (types/index.ts, constants/index.ts, src/index.ts)
- Verification: check-types 0 errors, build 0 errors, turbo build 37/37, turbo check-types 50/50
Next: T03 (Registry and API)
-->
