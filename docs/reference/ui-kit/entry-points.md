# @hbc/ui-kit Entry Points

The `@hbc/ui-kit` package exposes five entry points to support tree-shaking and SPFx bundle budget constraints.

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

### `@hbc/ui-kit/homepage`

Constrained homepage-safe entry point for HB Central SharePoint homepage webparts. Exposes a narrow set of approved primitives and homepage contract constants (brand aliases, typography aliases, motion/a11y policy, density policy, import guardrails).

```tsx
import {
  HbcCard,
  HbcStatusBadge,
  HBC_HOMEPAGE_BRAND_FOUNDATION,
  HBC_HOMEPAGE_ACCESSIBILITY_POLICY,
} from '@hbc/ui-kit/homepage';
```

**Use when:** Building HB Central homepage webparts (`hb-webparts`) and shared homepage wrappers where bundle discipline and governance constraints are stricter than generic app surfaces.
**Do not use for:** shell recreation, broad full-kit passthrough exports, or unrelated PWA app composition.

## Why the Split Exists

SPFx webparts run inside SharePoint's iframe sandbox with strict bundle size constraints. The full `@hbc/ui-kit` entry point includes ECharts, TanStack Table, PDF.js integration, and other heavy dependencies that would exceed the SPFx budget. The `/app-shell` entry point provides the shell chrome (~15 KB) without those dependencies.

The `/theme` and `/icons` entry points allow granular imports for packages that only need tokens or icons, avoiding unnecessary component code in the dependency graph.

## Package Configuration

```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./app-shell": { "types": "./dist/app-shell.d.ts", "import": "./dist/app-shell.js" },
    "./theme": { "types": "./dist/theme/index.d.ts", "import": "./dist/theme/index.js" },
    "./icons": { "types": "./dist/icons/index.d.ts", "import": "./dist/icons/index.js" },
    "./homepage": { "types": "./dist/homepage.d.ts", "import": "./dist/homepage.js" }
  },
  "sideEffects": false
}
```

The `sideEffects: false` flag enables bundlers to tree-shake unused exports from any entry point.

## Homepage Import Policy

This section is the authoritative import policy for `apps/hb-webparts` and any future homepage webpart consumers. Enforced by ESLint `no-restricted-imports` in `apps/hb-webparts/.eslintrc.cjs`.

### Allowed entry points

| Entry Point | Use For |
|-------------|---------|
| `@hbc/ui-kit/homepage` | **Primary.** All shared visual primitives and governance constants for homepage webpart composition |
| `@hbc/ui-kit/theme` | Token-only imports (semantic tokens, typography, spacing, density) when the homepage entry does not export the needed token |
| `@hbc/ui-kit/icons` | Icon-only imports when homepage webparts need icons beyond what the homepage entry exports |

### Prohibited entry points

| Entry Point | Why Prohibited |
|-------------|----------------|
| `@hbc/ui-kit` | Full library exceeds SPFx bundle budget and bypasses homepage governance constraints |
| `@hbc/ui-kit/app-shell` | Shell chrome entry point — homepage is a page-canvas surface, not a shell surface |

### Enforcement

- **ESLint:** `no-restricted-imports` rule in `apps/hb-webparts/.eslintrc.cjs` errors on `@hbc/ui-kit` and `@hbc/ui-kit/app-shell` imports
- **Source:** `HBC_HOMEPAGE_IMPORT_GUARDRAILS` constant in `packages/ui-kit/src/homepage.ts` encodes the policy for programmatic reference
- **Vite:** `apps/hb-webparts/vite.config.ts` aliases only the allowed entry points for build resolution

### When a homepage webpart needs a component not in the homepage entry

1. Check whether the component belongs in the homepage surface at all (consult the [SPFx Governing Standard](./doctrine/UI-Doctrine-SPFx-Governing-Standard.md))
2. If yes, add it to `packages/ui-kit/src/homepage.ts` and re-export
3. If no, reconsider the webpart design — do not bypass the entry point

## Related References

- [HbcChart](./HbcChart.md), [HbcBarChart](./HbcBarChart.md), [HbcDonutChart](./HbcDonutChart.md), [HbcLineChart](./HbcLineChart.md)
- [HbcInput](./HbcInput.md), [HbcTextArea](./HbcTextArea.md), [HbcRichTextEditor](./HbcRichTextEditor.md)
- [HbcToast](./HbcToast.md), [HbcToastProvider](./HbcToastProvider.md), [HbcToastContainer](./HbcToastContainer.md)
- [SharePoint Homepage & Shell Boundaries](../sharepoint-homepage-shell-boundaries.md)
- [SPFx Governing Standard](./doctrine/UI-Doctrine-SPFx-Governing-Standard.md)
