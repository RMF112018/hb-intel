# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 16
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 16. `@hbc/ui-kit` Package Implementation

### Step 1 — Create Directory Structure

```bash
mkdir -p packages/ui-kit/src/{theme,icons,HbcAppShell,HbcConnectivityBar,HbcStatusBadge,HbcTypography,HbcEmptyState,HbcErrorBoundary,HbcButton,HbcInput,HbcForm,HbcPanel,HbcCommandBar,HbcCommandPalette,HbcDataTable,HbcChart,HbcModal,HbcTearsheet,HbcPopover,HbcCard,HbcBanner,HbcToast,HbcTooltip,HbcSpinner,HbcBreadcrumbs,HbcTabs,HbcPagination,HbcTree,HbcSearch,assets/logos}
cd packages/ui-kit
```

### Step 2 — Create `package.json`

```json
{
  "name": "@hbc/ui-kit",
  "version": "2.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./icons": "./dist/icons/index.js",
    "./theme": "./dist/theme/index.js"
  },
  "scripts": {
    "build": "tsc && vite build",
    "dev": "tsc --watch",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "analyze": "vite-bundle-visualizer",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@fluentui/react-components": "^9.56.0",
    "@griffel/react": "^1.5.0",
    "@tanstack/react-table": "^8.21.0",
    "@tanstack/react-virtual": "^3.13.0",
    "echarts": "^5.6.0",
    "echarts-for-react": "^3.0.0"
  },
  "devDependencies": {
    "@storybook/react-vite": "^8.6.0",
    "@storybook/addon-essentials": "^8.6.0",
    "@storybook/addon-a11y": "^8.6.0",
    "vite-bundle-visualizer": "^1.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### Step 3 — Create `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.stories.tsx"]
}
```

### Step 4 — Create `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hbc/ui-kit/theme': '/src/theme',
      '@hbc/ui-kit/icons': '/src/icons',
    }
  },
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      external: ['react', 'react-dom', '@fluentui/react-components', '@griffel/react'],
      output: {
        manualChunks: { echarts: ['echarts', 'echarts-for-react'] }
      }
    }
  }
});
```

### Step 5 — Place Brand Assets

Place in `src/assets/logos/`:
- `hb_logo_icon-NoBG.svg` — white variant (dark header)
- `hb_icon_blueBG.jpg` — 512×512 app icon (PWA manifest)
- `hb_icon_maskable.png` — 512×512 maskable icon with safe zone (PWA manifest `"purpose": "maskable"`)

### Step 6 — Create Theme Files

| File | Contents |
|---|---|
| `tokens.ts` | All CSS custom property token exports including V2.1 sunlight-optimized status colors, warm off-white surfaces, Field Mode tokens, connectivity bar tokens, `--hbc-responsibility-bg` |
| `theme.ts` | `hbcLightTheme` and `hbcFieldTheme` (replaces `hbcDarkTheme` naming) with Fluent UI `BrandVariants` |
| `typography.ts` | 9-level intent map. Touch tier size overrides |
| `grid.ts` | Breakpoints, spacing scale, density tier definitions |
| `animations.ts` | All micro-interaction keyframes with V2.1 timing values. `prefers-reduced-motion` fallbacks |
| `elevation.ts` | 4-level dual-shadow system (Level 0–3) |
| `density.ts` | `detectDensityTier()` function, density tier type definitions, localStorage persistence helpers |
| `useHbcTheme.ts` | `useHbcTheme()` hook — returns current theme from context, respects `localStorage` and `prefers-color-scheme` |
| `useConnectivity.ts` | `useConnectivity()` hook — returns `'online' | 'syncing' | 'offline'` state from service worker messages and `navigator.onLine` |
| `useDensity.ts` | `useDensity()` hook — returns current density tier, provides override setter |
| `index.ts` | Barrel export of all theme files |
| `README.md` | Extension guide: adding tokens, overriding Fluent UI tokens, adding animations, extending density tiers |

### Step 7 — Create ESLint Enforcement Rule

`tools/eslint-rules/enforce-hbc-tokens.js` — rejects hardcoded hex values in `styles.ts` files. All colors must use `var(--hbc-*)`.

### Step 8 — Build Components in Priority Order

Follow the priority order from Section 6. For each component:
- `index.tsx`: main component, `data-hbc-ui` attribute, Field Mode aware
- `styles.ts`: Griffel `makeStyles` with `var(--hbc-*)` only
- `types.ts`: fully JSDoc'd props
- `ComponentName.stories.tsx`: Default, AllVariants, FieldMode, A11yTest stories

### Step 9 — Create Root Barrel Export `src/index.ts`

```ts
/**
 * @hbc/ui-kit v2.1 — HB Intel Design System
 *
 * Usage:
 *   import { HbcDataTable, HbcStatusBadge, hbcLightTheme } from '@hbc/ui-kit';
 *   import { DrawingSheetIcon } from '@hbc/ui-kit/icons';
 *
 * Wrap app root:
 *   <FluentProvider theme={hbcLightTheme}>
 *     <HbcConnectivityContext.Provider value={connectivity}>
 *       <HbcConnectivityBar />
 *       <HbcAppShell>...</HbcAppShell>
 *     </HbcConnectivityContext.Provider>
 *   </FluentProvider>
 *
 * @see docs/reference/ui-kit/ for component documentation
 * @see DESIGN_SYSTEM.md for authoring rules
 */

// Shell
export * from './HbcAppShell';
export * from './HbcConnectivityBar';
export { ToolLandingLayout, DetailLayout, CreateUpdateLayout } from './HbcAppShell';

// Display
export * from './HbcStatusBadge';
export * from './HbcTypography';
export * from './HbcEmptyState';
export * from './HbcErrorBoundary';
export * from './HbcCard';

// Actions
export * from './HbcButton';
export * from './HbcCommandBar';
export * from './HbcCommandPalette';

// Inputs
export * from './HbcInput';
export * from './HbcForm';

// Overlays & Surfaces
export * from './HbcPanel';
export * from './HbcModal';
export * from './HbcTearsheet';
export * from './HbcPopover';

// Messaging
export * from './HbcBanner';
export * from './HbcToast';
export * from './HbcTooltip';
export * from './HbcSpinner';

// Navigation
export * from './HbcBreadcrumbs';
export * from './HbcTabs';
export * from './HbcPagination';
export * from './HbcTree';
export * from './HbcSearch';

// Data Visualization
export * from './HbcDataTable';
export * from './HbcChart';

// Theme (also at @hbc/ui-kit/theme)
export * from './theme';
```

### Step 10 — Component Documentation

One markdown file per component in `docs/reference/ui-kit/`. Each file contains: overview, props table, usage example, Field Mode behavior, accessibility notes, legacy migration mapping, SPFx constraints. **[V2.1: add Field Mode behavior section to every doc]**

### Step 11 — Create ADRs

- `docs/architecture/adr/0008-ui-kit-v2-design-system.md` — V2.0 foundation decisions
- `docs/architecture/adr/0009-field-first-ui-upgrades.md` — **[V2.1]** V2.1 competitive analysis decisions: adaptive density, Field Mode, command palette, dual-channel status, responsibility heat map, connectivity bar, voice input, precision elevation

### Step 12 — Build and Verify

```bash
pnpm turbo run build --filter=@hbc/ui-kit
pnpm --filter=@hbc/ui-kit storybook    # Verify all stories in both themes
pnpm --filter=@hbc/ui-kit analyze      # Verify chunks under 500KB
```