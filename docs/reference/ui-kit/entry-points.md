# @hbc/ui-kit Entry Points

The `@hbc/ui-kit` package exposes four entry points to support tree-shaking and SPFx bundle budget constraints.

## Entry Points

### `@hbc/ui-kit` (Main)

The full library entry point. Exports all 35 component families, theme tokens, icons, hooks, layouts, and module configurations.

```tsx
import { HbcButton, HbcDataTable, HbcAppShell } from '@hbc/ui-kit';
```

**Use when:** Building PWA pages, dev-harness, or any context where bundle size is not constrained.

### `@hbc/ui-kit/app-shell`

Lean entry point for SPFx webparts. Exports only `HbcConnectivityBar`, `HbcAppShell`, and their associated types.

```tsx
import { HbcAppShell, HbcConnectivityBar } from '@hbc/ui-kit/app-shell';
```

**Use when:** Building SPFx webparts that need the shell chrome but must stay within the SharePoint bundle budget (~200 KB gzipped).

### `@hbc/ui-kit/theme`

Theme tokens only. Exports color ramps, semantic tokens, typography scale, elevation, spacing, breakpoints, density, and CSS custom properties.

```tsx
import { hbcLightTheme, hbcFieldTheme, hbcBrandRamp } from '@hbc/ui-kit/theme';
```

**Use when:** Consuming theme tokens without pulling in any component code. Useful for custom components or third-party integrations.

### `@hbc/ui-kit/icons`

Icon set only. Exports the HB Intel SVG icon factory and all icon components.

```tsx
import { HomeIcon, RfiIcon, CameraIcon } from '@hbc/ui-kit/icons';
```

**Use when:** Using icons independently of the component library.

## Why the Split Exists

SPFx webparts run inside SharePoint's iframe sandbox with strict bundle size constraints. The full `@hbc/ui-kit` entry point includes ECharts, TanStack Table, PDF.js integration, and other heavy dependencies that would exceed the SPFx budget. The `/app-shell` entry point provides the shell chrome (~15 KB) without those dependencies.

The `/theme` and `/icons` entry points allow granular imports for packages that only need tokens or icons, avoiding unnecessary component code in the dependency graph.

## Package Configuration

```json
{
  "exports": {
    ".":          { "types": "./dist/index.d.ts",       "import": "./dist/index.js" },
    "./app-shell": { "types": "./dist/app-shell.d.ts",   "import": "./dist/app-shell.js" },
    "./theme":    { "types": "./dist/theme/index.d.ts",  "import": "./dist/theme/index.js" },
    "./icons":    { "types": "./dist/icons/index.d.ts",  "import": "./dist/icons/index.js" }
  },
  "sideEffects": false
}
```

The `sideEffects: false` flag enables bundlers to tree-shake unused exports from any entry point.

## Related References

- [HbcChart](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcChart.md), [HbcBarChart](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcBarChart.md), [HbcDonutChart](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcDonutChart.md), [HbcLineChart](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcLineChart.md)
- [HbcInput](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcInput.md), [HbcTextArea](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcTextArea.md), [HbcRichTextEditor](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcRichTextEditor.md)
- [HbcToast](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcToast.md), [HbcToastProvider](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcToastProvider.md), [HbcToastContainer](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcToastContainer.md)
