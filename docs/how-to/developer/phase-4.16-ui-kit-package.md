# Working with @hbc/ui-kit V2.1

Developer guide for the finalized HB Intel Design System package.

## Package Overview

The `@hbc/ui-kit` package (v2.1.0) provides the complete component library for HB Intel, supporting both PWA (Next.js 14) and SPFx (SharePoint Framework) targets.

## Installation

```bash
pnpm add @hbc/ui-kit
```

The package is a workspace dependency — in the monorepo, use `workspace:*`.

## Import Paths

| Path | Contents |
|------|----------|
| `@hbc/ui-kit` | All components, theme tokens, hooks |
| `@hbc/ui-kit/theme` | Theme tokens, hooks (useHbcTheme, useConnectivity, useDensity) |
| `@hbc/ui-kit/icons` | SVG icon components |
| `@hbc/ui-kit/app-shell` | App shell components |

## Using Theme Hooks

### Theme Mode

```tsx
import { useHbcTheme } from '@hbc/ui-kit/theme';

function MyComponent() {
  const { theme, isFieldMode, toggleFieldMode } = useHbcTheme();
  return (
    <button onClick={toggleFieldMode}>
      Current: {theme} {/* 'light' or 'field' */}
    </button>
  );
}
```

### Connectivity Status

```tsx
import { useConnectivity } from '@hbc/ui-kit/theme';

function StatusBar() {
  const status = useConnectivity(); // 'online' | 'syncing' | 'offline'
  return <span>Network: {status}</span>;
}
```

### Density Management

```tsx
import { useDensity, DENSITY_BREAKPOINTS } from '@hbc/ui-kit/theme';

function DataGrid() {
  const { tier, setOverride, clearOverride } = useDensity();
  const rowHeight = DENSITY_BREAKPOINTS[tier]; // 32 | 40 | 56

  return (
    <div>
      <p>Density: {tier} ({rowHeight}px rows)</p>
      <button onClick={() => setOverride('compact')}>Compact</button>
      <button onClick={clearOverride}>Auto</button>
    </div>
  );
}
```

## Building the Package

```bash
# Type-safe build (production)
pnpm turbo run build --filter=@hbc/ui-kit

# Storybook development
pnpm --filter @hbc/ui-kit storybook

# Bundle analysis
pnpm --filter @hbc/ui-kit analyze
```

## Adding a New Component

1. Create a directory: `packages/ui-kit/src/HbcMyComponent/`
2. Add `index.ts` with component + type exports
3. Add `HbcMyComponent.tsx` implementation
4. Add `HbcMyComponent.stories.tsx` for Storybook
5. Export from `packages/ui-kit/src/index.ts`
6. Create `docs/reference/ui-kit/HbcMyComponent.md`

## Extending the Theme

See `packages/ui-kit/src/theme/README.md` for details on:
- Adding new tokens
- Overriding Fluent UI tokens
- Adding animations
- Extending density tiers

## ESLint Enforcement

The `eslint-plugin-hbc` plugin enforces design system compliance:
- `hbc/no-raw-colors` — disallows hardcoded color values
- `hbc/use-hbc-components` — enforces HBC component usage over raw HTML

Configure in `.eslintrc`:
```json
{
  "plugins": ["hbc"],
  "rules": {
    "hbc/no-raw-colors": "error",
    "hbc/use-hbc-components": "warn"
  }
}
```

## Component Documentation

Per-component reference docs are in `docs/reference/ui-kit/`. Each file covers:
- Props table with types and defaults
- Usage examples
- Field Mode (dark theme) behavior
- Accessibility notes
- SPFx deployment constraints
