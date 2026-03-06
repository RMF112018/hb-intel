# @hbc/ui-kit Theme System

Extension guide for the HB Intel Design System V2.1 theme layer.

## Architecture

```
src/theme/
├── tokens.ts          # Semantic color tokens & brand ramp
├── theme.ts           # Fluent UI theme objects (light, field, dark)
├── typography.ts      # Intent-based type scale
├── grid.ts            # Spacing, breakpoints, media queries
├── animations.ts      # Keyframes, transitions, timing
├── elevation.ts       # Dual-shadow elevation (light & field)
├── z-index.ts         # Layering constants
├── density.ts         # Density tier detection & persistence
├── useHbcTheme.ts     # Canonical theme hook
├── useConnectivity.ts # Canonical connectivity hook
├── useDensity.ts      # Density tier hook
└── index.ts           # Barrel export
```

## Token Reference Table

> **D-05 Enforcement:** All color, spacing, typography, and shadow values in `apps/` must use these tokens. Hardcoded hex, rgb/rgba, and pixel values are lint errors enforced by `@hbc/eslint-plugin-hbc/enforce-hbc-tokens`. See ADR-0040.

### Brand Colors

| Token | Light | Field Mode | Use For |
|-------|-------|------------|---------|
| `HBC_PRIMARY_BLUE` | `#004B87` | — | Brand identity, logo reference |
| `HBC_ACCENT_ORANGE` | `#F37021` | — | CTA highlights, accent elements |
| `hbcColorBrandPrimary` | `#004B87` | `#337AAB` | Primary brand in themed contexts |
| `hbcColorBrandAccent` | `#F37021` | `#F7A93B` | Accent in themed contexts |

### Status Colors (V2.1 sunlight-optimized)

| Token | Value | Use For |
|-------|-------|---------|
| `HBC_STATUS_COLORS.success` / `hbcColorStatusSuccess` | `#00C896` | Success badges, on-track indicators |
| `HBC_STATUS_COLORS.warning` / `hbcColorStatusWarning` | `#FFB020` | Warning alerts, at-risk indicators |
| `HBC_STATUS_COLORS.error` / `hbcColorStatusError` | `#FF4D4D` | Error states, critical indicators |
| `HBC_STATUS_COLORS.info` / `hbcColorStatusInfo` | `#3B9FFF` | Info badges, in-progress indicators |
| `HBC_STATUS_COLORS.neutral` / `hbcColorStatusNeutral` | `#8B95A5` | Neutral/pending/draft states |

### Status Color Ramps (5-stop HSL lightness scale)

| Ramp | 10 (dark) | 30 | 50 (base) | 70 | 90 (light) |
|------|-----------|----|-----------|----|------------|
| `HBC_STATUS_RAMP_GREEN` | `#003D2E` | `#007A5C` | `#00C896` | `#66DDB8` | `#CCF3E6` |
| `HBC_STATUS_RAMP_RED` | `#4D0000` | `#B30000` | `#FF4D4D` | `#FF9999` | `#FFE0E0` |
| `HBC_STATUS_RAMP_AMBER` | `#4D3300` | `#996600` | `#FFB020` | `#FFD07A` | `#FFF0D4` |
| `HBC_STATUS_RAMP_INFO` | `#001A4D` | `#0050B3` | `#3B9FFF` | `#8CC5FF` | `#DCE9FF` |
| `HBC_STATUS_RAMP_GRAY` | `#1A1D23` | `#4A5060` | `#8B95A5` | `#B8BFC9` | `#E8EAED` |

### Surface Tokens

| Token | Light | Field Mode | Use For |
|-------|-------|------------|---------|
| `hbcColorSurface0` | `#FFFFFF` | `#0F1419` | Page background |
| `hbcColorSurface1` | `#FAFBFC` | `#1A2332` | Card/panel background |
| `hbcColorSurface2` | `#F0F2F5` | `#243040` | Nested surface, alternating rows |
| `hbcColorSurface3` | `#E4E7EB` | `#2E3D50` | Hover states, selected rows |

### Border Tokens

| Token | Light | Field Mode | Use For |
|-------|-------|------------|---------|
| `hbcColorBorderDefault` | `#D1D5DB` | `#3A4A5C` | Default borders, dividers |
| `hbcColorBorderFocus` | `#004B87` | `#337AAB` | Focus rings, active borders |

### Text Tokens

| Token | Light | Field Mode | Use For |
|-------|-------|------------|---------|
| `hbcColorTextPrimary` | `#1A1D23` | `#E8EAED` | Primary content text |
| `hbcColorTextMuted` | `#6B7280` | `#8B95A5` | Secondary/muted text, timestamps |

### Header Tokens

| Token | Light | Field Mode | Use For |
|-------|-------|------------|---------|
| `hbcColorHeaderBg` | `#1E1E1E` | `#0A0E14` | App header background |
| `hbcColorHeaderText` | `#FFFFFF` | `#FFFFFF` | Header text |
| `hbcColorHeaderIconMuted` | `#A0A0A0` | `#6B7280` | Header icon muted state |

### Connectivity Tokens

| Token | Value | Use For |
|-------|-------|---------|
| `hbcColorConnOnline` | `#00C896` | Online indicator |
| `hbcColorConnSyncing` | `#FFB020` | Sync-in-progress indicator |
| `hbcColorConnOffline` | `#FF4D4D` | Offline indicator |

### Spacing Tokens (4px base unit)

| Token | Value | Use For |
|-------|-------|---------|
| `HBC_SPACE_XS` | `4px` | Tight spacing, icon margins |
| `HBC_SPACE_SM` | `8px` | Compact spacing, inline gaps |
| `HBC_SPACE_MD` | `16px` | Standard vertical/horizontal padding |
| `HBC_SPACE_LG` | `24px` | Section spacing, card padding, gutters |
| `HBC_SPACE_XL` | `32px` | Large spacing, section breaks |
| `HBC_SPACE_XXL` | `48px` | Hero spacing, page-level padding |
| `hbcSpacing` | `{ xs, sm, md, lg, xl, xxl }` | Object form for programmatic access |

### Typography Tokens (intent-based V2.1)

| Token | Size | Weight | Use For |
|-------|------|--------|---------|
| `display` | `2rem` | 700 | Dashboard headers, feature banners |
| `heading1` | `1.5rem` | 700 | Section headers, page titles |
| `heading2` | `1.25rem` | 600 | Card headers, subpage titles |
| `heading3` | `1rem` | 600 | Panel headers, modal titles |
| `heading4` | `0.875rem` | 600 | Table headers, toolbar labels |
| `body` | `0.875rem` | 400 | Primary content text |
| `bodySmall` | `0.75rem` | 400 | Secondary content, captions |
| `label` | `0.75rem` | 500 | Labels, metadata, timestamps |
| `code` | `0.8125rem` | 400 | Code blocks, project codes |

### Elevation Tokens (dual-shadow V2.1)

| Token | Use For | Field Mode Variant |
|-------|---------|-------------------|
| `elevationLevel0` | Flat surface (no shadow) | `elevationFieldLevel0` |
| `elevationLevel1` / `elevationCard` | Cards, table containers | `elevationFieldLevel1` |
| `elevationLevel2` | Popovers, dropdowns, floating | `elevationFieldLevel2` |
| `elevationLevel3` / `elevationModal` | Dialogs, panels, tearsheets | `elevationFieldLevel3` |

### Breakpoints

| Token | Value | Columns | Gutter |
|-------|-------|---------|--------|
| `BREAKPOINT_MOBILE` | `768px` | 4 | `16px` |
| `BREAKPOINT_TABLET` | `1024px` | 8 | `24px` |
| `BREAKPOINT_DESKTOP` | `1200px` | 12 | `24px` |
| `BREAKPOINT_WIDE` | `1600px` | 12 | `32px` |

### Z-Index Layers

Import from `@hbc/ui-kit/theme` via `Z_INDEX`:

| Layer | Value | Use For |
|-------|-------|---------|
| `Z_INDEX.base` | `0` | Default stacking |
| `Z_INDEX.dropdown` | `1000` | Dropdowns, comboboxes |
| `Z_INDEX.sticky` | `1100` | Sticky headers, toolbars |
| `Z_INDEX.overlay` | `1200` | Overlays, backdrops |
| `Z_INDEX.modal` | `1300` | Dialogs, panels |
| `Z_INDEX.popover` | `1400` | Tooltips, popovers |
| `Z_INDEX.toast` | `1500` | Toast notifications |

## Adding New Tokens

1. Define the token in `tokens.ts` with a semantic name (e.g., `HBC_MY_TOKEN`).
2. Export it from `tokens.ts` and add it to the barrel in `index.ts`.
3. If the token maps to a Fluent UI token, include it in the theme objects in `theme.ts`.

## Overriding Fluent UI Tokens

The theme objects in `theme.ts` extend Fluent UI's `Theme` type. To override a Fluent token:

```ts
// theme.ts
export const hbcLightTheme: HbcTheme = {
  ...webLightTheme,
  colorBrandBackground: HBC_PRIMARY_BLUE,
  // Add your override here
};
```

## Adding Animations

1. Add keyframes to the `keyframes` object in `animations.ts`.
2. Add transition presets to `transitions` if needed.
3. Export from `animations.ts` — the barrel re-exports automatically.

## Extending Density Tiers

The density system supports three tiers: `compact` (32px), `comfortable` (40px), `touch` (56px).

To use density in a component:

```tsx
import { useDensity, DENSITY_BREAKPOINTS } from '@hbc/ui-kit/theme';

function MyComponent() {
  const { tier } = useDensity();
  const rowHeight = DENSITY_BREAKPOINTS[tier];
  return <div style={{ height: rowHeight }}>...</div>;
}
```

To add a new tier, update `DensityTier`, `DENSITY_BREAKPOINTS`, and `detectDensityTier()` in `density.ts`.

## Canonical Hooks

| Hook | Import | Delegates To |
|------|--------|--------------|
| `useHbcTheme()` | `@hbc/ui-kit/theme` | `useFieldMode` |
| `useConnectivity()` | `@hbc/ui-kit/theme` | `useOnlineStatus` |
| `useDensity()` | `@hbc/ui-kit/theme` | `density.ts` utilities |

These hooks provide stable, canonical import paths. Prefer importing from `@hbc/ui-kit/theme` over deep imports into `HbcAppShell/hooks`.
