# Phase 4.3 — Design System Foundation Developer Guide

**Package:** `@hbc/ui-kit`
**Version:** V2.1
**ADR:** [ADR-0016](../../architecture/adr/0016-ui-design-system-foundation.md)

## Overview

Phase 4.3 introduces the V2.1 design system foundation: sunlight-optimized colors, intent-based typography, a grid/spacing system, Field Mode theme, and 60+ icons. This guide shows how to use each subsystem.

---

## Tokens

All design tokens live in `@hbc/ui-kit` and are importable directly:

```ts
import {
  HBC_STATUS_COLORS,
  HBC_SURFACE_LIGHT,
  HBC_CONNECTIVITY,
  HBC_DARK_HEADER,
} from '@hbc/ui-kit';
```

### Status Colors

Use `HBC_STATUS_COLORS` for status indicators:

```ts
HBC_STATUS_COLORS.success  // '#00C896'
HBC_STATUS_COLORS.warning  // '#FFB020'
HBC_STATUS_COLORS.error    // '#FF4D4D'
HBC_STATUS_COLORS.info     // '#3B9FFF'
HBC_STATUS_COLORS.neutral  // '#8B95A5'
```

Map aliases: `onTrack` = success, `atRisk` = warning, `critical` = error, `pending`/`draft` = neutral, `inProgress` = info, `completed` = success.

### Status Ramps (HSL)

Each status color has a 5-step lightness ramp for derived use (backgrounds, borders, text):

```ts
import { HBC_STATUS_RAMP_GREEN } from '@hbc/ui-kit';

HBC_STATUS_RAMP_GREEN[10]  // darkest
HBC_STATUS_RAMP_GREEN[50]  // base
HBC_STATUS_RAMP_GREEN[90]  // lightest (backgrounds)
```

Available ramps: `HBC_STATUS_RAMP_GREEN`, `HBC_STATUS_RAMP_RED`, `HBC_STATUS_RAMP_AMBER`, `HBC_STATUS_RAMP_INFO`, `HBC_STATUS_RAMP_GRAY`.

### Surface & Text Tokens

```ts
import { HBC_SURFACE_LIGHT, HBC_SURFACE_FIELD } from '@hbc/ui-kit';

HBC_SURFACE_LIGHT['surface-0']     // '#FFFFFF'
HBC_SURFACE_LIGHT['text-primary']  // '#1A1D23'
HBC_SURFACE_FIELD['surface-0']     // '#0F1419' (Field Mode)
```

---

## Themes

### Light Theme (default)

```tsx
import { FluentProvider } from '@fluentui/react-components';
import { hbcLightTheme } from '@hbc/ui-kit';

<FluentProvider theme={hbcLightTheme}>
  <App />
</FluentProvider>
```

### Field Mode Theme

For outdoor/jobsite use with high-contrast dark surfaces:

```tsx
import { hbcFieldTheme } from '@hbc/ui-kit';

<FluentProvider theme={hbcFieldTheme}>
  <App />
</FluentProvider>
```

### Accessing Semantic Tokens

Both themes include HBC semantic tokens accessible via the theme object:

```ts
const theme = useTheme() as HbcTheme;
theme.hbcColorStatusSuccess  // V2.1 status green
theme.hbcColorSurface0       // theme-aware surface
theme.hbcColorTextPrimary    // theme-aware text
theme.hbcColorConnOnline     // connectivity indicator
```

---

## Typography

V2.1 uses intent-based naming. Import directly:

```ts
import { display, heading1, heading2, body, label, code } from '@hbc/ui-kit';
```

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `display` | 2rem | 700 | Dashboard headers, banners |
| `heading1` | 1.5rem | 700 | Page titles |
| `heading2` | 1.25rem | 600 | Card headers |
| `heading3` | 1rem | 600 | Panel headers, modals |
| `heading4` | 0.875rem | 600 | Table headers |
| `body` | 0.875rem | 400 | Primary content |
| `bodySmall` | 0.75rem | 400 | Secondary content |
| `label` | 0.75rem | 500 | Labels, metadata |
| `code` | 0.8125rem | 400 | Code, project IDs |

Old names (`displayHero`, `bodyLarge`, etc.) are deprecated but still exported.

---

## Grid & Spacing

### Spacing Scale

```ts
import { hbcSpacing, HBC_SPACE_MD } from '@hbc/ui-kit';

hbcSpacing.xs   // 4px
hbcSpacing.sm   // 8px
hbcSpacing.md   // 16px
hbcSpacing.lg   // 24px
hbcSpacing.xl   // 32px
hbcSpacing.xxl  // 48px
```

### Breakpoints

```ts
import { hbcBreakpoints, hbcMediaQuery } from '@hbc/ui-kit';

hbcMediaQuery('tablet')  // '@media (min-width: 768px)'
hbcMediaQuery('desktop') // '@media (min-width: 1200px)'
```

### Grid Configuration

```ts
import { hbcGrid } from '@hbc/ui-kit';

hbcGrid.columns      // 12
hbcGrid.baseUnit     // 4 (px)
hbcGrid.gutterDefault // 24 (px)
```

### CSS Custom Properties

```ts
import { hbcSpacingCSSVars } from '@hbc/ui-kit';

// Generates: --hbc-space-xs: 4px; --hbc-space-sm: 8px; ...
const cssVars = hbcSpacingCSSVars();
```

---

## Icons

### Basic Usage

```tsx
import { Home, Search, DrawingSheet } from '@hbc/ui-kit';

<Home size="md" weight="regular" />
<Search size="lg" weight="bold" color="#004B87" />
<DrawingSheet size="sm" weight="light" aria-label="Drawings" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 16px / 20px / 24px |
| `weight` | `'light' \| 'regular' \| 'bold'` | `'regular'` | Stroke width 1.5 / 2 / 2.5 |
| `color` | `string` | `'currentColor'` | SVG stroke color |
| `aria-label` | `string` | — | Accessible label (sets role="img") |
| `className` | `string` | — | CSS class |

### Categories

- **Construction (14):** DrawingSheet, RFI, PunchItem, ChangeOrder, Submittal, DailyLog, BudgetLine, GoNoGo, Turnover, SafetyObservation, HardHat, CraneEquipment, BlueprintRoll, Inspection
- **Navigation (13):** Home, Toolbox, Search, Notifications, Settings, ChevronBack/Forward/Down/Up, Expand, Collapse, Menu, CommandPalette
- **Action (15):** Create, Edit, Delete, Download, Upload, Share, Filter, Sort, Save, Cancel, MoreActions, Star, StarFilled, Microphone, MicrophoneActive
- **Status (5):** StatusCompleteIcon, StatusOverdueIcon, StatusAttentionIcon, StatusInfoIcon, StatusDraftIcon
- **Connectivity (3):** CloudOffline, CloudSyncing, CloudSynced
- **Layout (9):** ViewList, ViewGrid, ViewKanban, SidePanelOpen/Close, FullScreen, ExitFullScreen, FocusModeEnter/Exit

---

## ESLint Token Enforcement

A stub ESLint rule `enforce-hbc-tokens` is available at `packages/ui-kit/src/lint/enforce-hbc-tokens.ts`. It warns when hardcoded hex values are detected and suggests using HBC design tokens instead. This will be wired into the active ESLint configuration during Phase 8 CI integration.

---

## Storybook Theme Switcher

The Storybook preview includes a toolbar dropdown to toggle between **Light** and **Field Mode** themes. Use the paintbrush icon in the Storybook toolbar to switch.

---

## Migration from V2.0

| V2.0 | V2.1 | Notes |
|------|------|-------|
| `displayHero` | `display` | Deprecated alias preserved |
| `displayLarge` | `heading1` | Deprecated alias preserved |
| `displayMedium` | `heading2` | Deprecated alias preserved |
| `titleLarge` | `heading3` | Deprecated alias preserved |
| `titleMedium` | `heading4` | Deprecated alias preserved |
| `bodyLarge` | `body` | Deprecated alias preserved |
| `bodyMedium` | `bodySmall` | Deprecated alias preserved |
| `caption` | `label` | Deprecated alias preserved |
| `monospace` | `code` | Deprecated alias preserved |
| `hbcDarkTheme` | `hbcFieldTheme` | `hbcDarkTheme` is now a deprecated alias |
| `hbcColorSurfaceElevated` | `hbcColorSurface0` | Deprecated property preserved |
| `hbcColorSurfaceSubtle` | `hbcColorSurface1` | Deprecated property preserved |
| `hbcColorTextSubtle` | `hbcColorTextMuted` | Deprecated property preserved |
