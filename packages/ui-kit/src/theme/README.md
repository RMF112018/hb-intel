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
