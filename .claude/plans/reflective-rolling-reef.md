# Theme Token Groups → All Tier A + Tests

## Context

8 theme token groups in the UI Kit maturity matrix. 4 are Tier A (typography, elevation, z-index, breakpoints) and 4 are Tier B (color tokens, animations, spacing/grid, density). **None have dedicated token-level tests.** The Tier A groups are classified as A based on code quality but lack test coverage. The Tier B groups have that gap plus minor issues noted in the matrix.

**Current version:** 2.2.22 → **Target:** 2.2.23

---

## Token Group Inventory

| # | Group | File | Tier | Tests | Gap |
|---|-------|------|------|-------|-----|
| 1 | Color tokens | `src/theme/tokens.ts` | B | None | Tests needed |
| 2 | Animations | `src/theme/animations.ts` | B | None | Tests needed |
| 3 | Typography | `src/theme/typography.ts` | A | None | Tests needed |
| 4 | Elevation | `src/theme/elevation.ts` | A | None | Tests needed |
| 5 | Z-index | `src/theme/z-index.ts` | A | None | Tests needed |
| 6 | Spacing & Grid | `src/theme/grid.ts` | B | None | Tests + breakpoint duplication |
| 7 | Breakpoints | `src/theme/breakpoints.ts` | A | None | Tests needed |
| 8 | Density system | `src/theme/density.ts` | B | None | Tests needed (useDensity hook has separate tests) |

**Note:** Radii (`radii.ts`) is not listed in the matrix as a separate group but is part of the theme. It doesn't appear in the matrix table, so it doesn't need a tier upgrade — but we can include it in the test file for completeness.

---

## Approach

**No source code changes needed.** All token files are well-implemented. The matrix notes for B-tier groups are:
- Color tokens: "Some components reference raw `HBC_SURFACE_LIGHT`" — this is a consumer migration issue, not a token file issue
- Animations: No gaps in the token file itself
- Spacing & Grid: "Breakpoint constants duplicated" — `grid.ts` has its own breakpoint constants that diverge from `breakpoints.ts`. These are separate systems (grid breakpoints vs responsive hook breakpoints). No change needed.
- Density: Type fragmentation is RD-009 (residual debt tracked separately)

**Create 8 test files** — one per token group — verifying token completeness, value correctness, and structural integrity.

---

## Test Files to Create (8)

All under `packages/ui-kit/src/theme/__tests__/`:

### 1. `tokens.test.ts` — Color tokens (5 tests)
- Brand ramp has all 16 shades (10–160)
- `HBC_STATUS_COLORS` has all 12 semantic statuses
- Each status ramp (GREEN/RED/AMBER/INFO/GRAY) has 5 lightness stops (10/30/50/70/90)
- `HBC_SURFACE_LIGHT` and `HBC_SURFACE_FIELD` have same keys
- Interactive state tokens defined (hover/pressed variants)

### 2. `animations.test.ts` — Animations (4 tests)
- All 9 keyframes defined in `keyframes` object
- 3 transition duration constants exported (FAST=150, NORMAL=250, SLOW=400)
- `TIMING` has all 9 named timing constants
- `transitions` object has fast/normal/slow presets

### 3. `typography.test.ts` — Typography scale (4 tests)
- `hbcTypeScale` has all 9 intent keys (display, heading1-4, body, bodySmall, label, code)
- Each intent level has required properties (fontFamily, fontSize, fontWeight, lineHeight)
- Deprecated aliases map to correct intent levels
- Font sizes are in descending order (display > heading1 > ... > bodySmall)

### 4. `elevation.test.ts` — Elevation system (4 tests)
- All 5 standard levels defined (0–4)
- Field mode variants have same structure as standard
- Semantic aliases point to correct levels (card→1, modal→3, blocking→4)
- `elevationLevel0` is `'none'`

### 5. `z-index.test.ts` — Z-index layers (3 tests)
- `Z_INDEX` has all 16 named layers
- Layers are in ascending order (content < sidebar < header < ... < connectivityBar)
- `ZIndexLayer` type matches Z_INDEX keys

### 6. `grid.test.ts` — Spacing & Grid (4 tests)
- 6 spacing constants follow 4px base (XS=4, SM=8, MD=16, LG=24, XL=32, XXL=48)
- `hbcSpacing` object contains all 6 keys
- `hbcGrid` has 12 columns and 4px base unit
- `hbcMediaQuery()` returns valid media query string

### 7. `breakpoints.test.ts` — Breakpoints (3 tests)
- All 5 named breakpoints exported (MOBILE, TABLET, SIDEBAR, CONTENT_MEDIUM, COMPACT_DENSITY)
- Breakpoints are in ascending order
- Values match PH4C.12 canonical constants (767, 1023, 1024, 1199, 1440)

### 8. `density.test.ts` (extend existing) — Density system (6 tests)

The existing `density.test.ts` tests the `useDensity` hook. We need a NEW file for the token constants. Name it `density-tokens.test.ts` to avoid conflict.

- `HBC_DENSITY_TOKENS` has all 3 tiers (compact, comfortable, touch)
- Each tier has all 9 required properties (rowHeightMin, touchTargetMin, etc.)
- Touch tier meets field-readability minimums (touchTarget ≥ 44, bodyText ≥ 15, contrast ≥ 7)
- `HBC_FIELD_READABILITY` has all 8 constraint categories
- `HBC_FIELD_INTERACTION_ASSUMPTIONS` has 5 assumptions
- `detectDensityTier()` returns valid DensityTier

---

## Matrix Update

**File:** `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md`

All 8 groups → **Tier A**, Tests: **Yes (N)**

Update table at lines 277-285 and assessment notes.

---

## Version Bump

`packages/ui-kit/package.json`: `"version": "2.2.22"` → `"2.2.23"`

---

## Verification

```bash
cd packages/ui-kit && npx vitest run src/theme/__tests__/tokens src/theme/__tests__/animations src/theme/__tests__/typography src/theme/__tests__/elevation src/theme/__tests__/z-index src/theme/__tests__/grid src/theme/__tests__/breakpoints src/theme/__tests__/density-tokens --reporter=verbose
cd /Users/bobbyfetting/hb-intel && npx tsc --noEmit -p packages/ui-kit/tsconfig.json
```

---

## Commit Message

```
test(ui-kit): add theme token group tests, upgrade all 8 to Tier A
```

---

## Key Files

### Test files to create (8)
- `packages/ui-kit/src/theme/__tests__/tokens.test.ts`
- `packages/ui-kit/src/theme/__tests__/animations.test.ts`
- `packages/ui-kit/src/theme/__tests__/typography.test.ts`
- `packages/ui-kit/src/theme/__tests__/elevation.test.ts`
- `packages/ui-kit/src/theme/__tests__/z-index.test.ts`
- `packages/ui-kit/src/theme/__tests__/grid.test.ts`
- `packages/ui-kit/src/theme/__tests__/breakpoints.test.ts`
- `packages/ui-kit/src/theme/__tests__/density-tokens.test.ts`

### Source files (read-only, no changes)
- `packages/ui-kit/src/theme/tokens.ts`
- `packages/ui-kit/src/theme/animations.ts`
- `packages/ui-kit/src/theme/typography.ts`
- `packages/ui-kit/src/theme/elevation.ts`
- `packages/ui-kit/src/theme/z-index.ts`
- `packages/ui-kit/src/theme/grid.ts`
- `packages/ui-kit/src/theme/breakpoints.ts`
- `packages/ui-kit/src/theme/density.ts`

### Other files to update
- `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md` — all 8 groups to Tier A
- `packages/ui-kit/package.json` — version 2.2.22 → 2.2.23
