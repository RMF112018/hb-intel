# @hbc/ui-kit Entry Points

The `@hbc/ui-kit` package exposes eight entry points aligned to the 4-layer UI system model (W01-P06).

## Entry Point Summary

| Entry point | Layer | Purpose |
|---|---|---|
| `@hbc/ui-kit` | All | Main barrel — full library |
| `@hbc/ui-kit/theme` | 1 (Foundation) | Tokens, hooks, density |
| `@hbc/ui-kit/icons` | 1 (Foundation) | SVG icon factory |
| `@hbc/ui-kit/branding` | 1 (Foundation) | Brand asset registry |
| `@hbc/ui-kit/primitives` | 2 (Primitive) | 30 Layer-2 building blocks |
| `@hbc/ui-kit/homepage` | 3 (Surface) | Presentation-lane surface families + tokens |
| `@hbc/ui-kit/app-shell` | Cross-lane | Lean shell for SPFx customizer |
| `@hbc/ui-kit/fluent` | Adapter | Fluent UI passthroughs for R3 compliance |

## Entry Points

### `@hbc/ui-kit` (Main)

The full library entry point. Exports all component families, theme tokens, icons, hooks, layouts, and module configurations. Contains transitional deprecated exports that will be removed in future versions.

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

### `@hbc/ui-kit/branding`

Brand asset registry. Exports logo assets and brand lookup patterns.

```tsx
import { gritLogo, hbIconBlueBg, brandAssets } from '@hbc/ui-kit/branding';
```

**Use when:** Displaying brand assets (logos, partner marks) without pulling in component code.

### `@hbc/ui-kit/primitives` (W01-P02)

Layer 2 building blocks shared across both productive and presentation lanes. Exports 30 primitive components organized by category: button/typography, status/badges, form primitives, overlay/dialog, messaging/feedback, navigation, data display, and workflow.

```tsx
import { HbcButton, HbcCard, HbcStatusBadge, HbcTabs } from '@hbc/ui-kit/primitives';
```

**Use when:** Consuming only Layer 2 primitives without surface families, module-specific UI, or app-shell components. Preferred for new feature packages that need clean dependency boundaries.
**Does not include:** DataTable, Charts, Layouts, WorkspacePageShell, CommandBar (surface families), PeoplePicker (has data-fetching dependency), or module-specific UI.

### `@hbc/ui-kit/fluent` (W01-P06)

Fluent UI passthrough adapters. Re-exports Fluent components through ui-kit to enforce Rule R3 (no direct `@fluentui/*` imports outside ui-kit).

```tsx
import { FluentProvider, Text, tokens } from '@hbc/ui-kit/fluent';
```

**Use when:** Consuming Fluent components where no HBC equivalent exists. Where an HBC equivalent is available (`HbcButton` instead of `Button`, `HbcCard` instead of `Card`, `HbcSpinner` instead of `Spinner`), prefer the HBC primitive from `@hbc/ui-kit/primitives`.
**Naming collisions:** Fluent `Button`, `Card`, `Spinner` overlap with HBC equivalents — use the HBC versions for branded, token-aware behavior.

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
    "./homepage": { "types": "./dist/homepage.d.ts", "import": "./dist/homepage.js" },
    "./branding": { "types": "./dist/branding/index.d.ts", "import": "./dist/branding/index.js" },
    "./primitives": { "types": "./dist/primitives.d.ts", "import": "./dist/primitives.js" },
    "./fluent": { "types": "./dist/fluent.d.ts", "import": "./dist/fluent.js" }
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
| `@hbc/ui-kit/primitives` | Layer 2 primitives not governed for SPFx homepage context — use `@hbc/ui-kit/homepage` instead |
| `@hbc/ui-kit/fluent` | Raw Fluent components bypass homepage governance — use governed equivalents from `@hbc/ui-kit/homepage` |

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
