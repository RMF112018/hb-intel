# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 3
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 3. Design System Foundation

All design tokens, component styles, and interaction rules originate from `@hbc/ui-kit`. No module or webpart may introduce styling outside of this package. No hardcoded hex values are permitted in component files — all color references must use CSS custom property tokens.

---

### 3.1 Color & Token System

The color system uses an HSL-based token architecture. Token names follow a lightness-indexed convention (`color-10` through `color-100`) to support Field Mode (dark) inversion without code changes. All values are defined as CSS custom properties in `src/theme/tokens.ts`.

**File:** `packages/ui-kit/src/theme/tokens.ts`

#### Primary Brand Colors

| Token | Hex Value | Usage |
|---|---|---|
| `--hbc-primary-blue` | `#004B87` | Brand identity. Navigation active states, primary headings, focus rings, header accents |
| `--hbc-accent-orange` | `#F37021` | High-emphasis CTAs only: the `+ Create` button, primary form Submit, and responsibility heat map border. Never used for status |
| `--hbc-dark-header` | `#1E1E1E` | Global header background. Fixed. Never overridden by any theme or Field Mode switch |
| `--hbc-header-text` | `#FFFFFF` | All text and icons within the dark header |
| `--hbc-header-icon-muted` | `#A0A0A0` | Secondary/inactive icons in the dark header |

#### Semantic Status Color Ramps **[V2.1 — Sunlight-Optimized]**

Status colors have been upgraded from standard web values to sunlight-optimized values that maintain legibility on construction jobsite screens. Field research documents that 63% of field users struggle to read standard web color palettes in direct sunlight. All status colors are defined as full HSL ramps (lightness scale 10–100). The `*-50` value is the base display color.

| Semantic Role | Base Token | Base Hex | V2.0 Hex | Improvement |
|---|---|---|---|---|
| Success / Complete | `--hbc-green-50` | `#00C896` | `#28A745` | Higher saturation — legible in direct sunlight |
| Danger / Critical | `--hbc-red-50` | `#FF4D4D` | `#DC3545` | Saturated red — visible on dimmed screens |
| Warning / Attention | `--hbc-amber-50` | `#FFB020` | `#FFC107` | Warm amber — avoids yellow-on-white invisibility |
| Informational | `--hbc-info-50` | `#3B9FFF` | `#17A2B8` | High-saturation blue — legible on both light and dark |
| Neutral / Draft | `--hbc-gray-50` | `#8B95A5` | `#6C757D` | Blue undertone adds depth |

**Ramp convention example (green):**
- `--hbc-green-10`: `#002B1F` (darkest — for text on dark Field Mode backgrounds)
- `--hbc-green-30`: `#007A5A` (dark — for dark badge text)
- `--hbc-green-50`: `#00C896` (base display color)
- `--hbc-green-70`: `#7DE8CB` (medium tint — for badge backgrounds)
- `--hbc-green-90`: `#D0F7EE` (light tint — for row highlight backgrounds in light mode)

Apply this same ramp pattern for red, amber, info, and gray using the new base values.

#### Background & Surface Colors **[V2.1 — Warm Off-White Light Surfaces]**

Pure white (`#FFFFFF`) data surfaces are replaced with warm off-white (`#FAFBFC`) to reduce glare fatigue during extended office sessions. Pure white is retained only for modal and panel surfaces where maximum contrast with background content is needed.

| Token | Hex Value | Usage |
|---|---|---|
| `--hbc-surface-0` | `#FFFFFF` | Modal interiors, panel interiors, form card backgrounds — maximum contrast contexts |
| `--hbc-surface-1` | `#FAFBFC` | **[V2.1]** Page background, primary content area, data table background (warm off-white — replaces `#FFFFFF`) |
| `--hbc-surface-2` | `#F0F2F5` | Secondary panels, collapsed sidebar, toolbar backgrounds, alternating table rows |
| `--hbc-surface-3` | `#E8ECF0` | Hover states, selected rows, active filter backgrounds |
| `--hbc-border-default` | `#DEE2E6` | Default border on inputs, cards, table rows |
| `--hbc-border-focus` | `#004B87` | Focus ring on all interactive elements (accessibility requirement) |
| `--hbc-text-primary` | `#1A1A1A` | All primary body text |
| `--hbc-text-muted` | `#6C757D` | Placeholder text, metadata, helper text |
| `--hbc-responsibility-bg` | `#FFF5EE` | **[V2.1]** Background tint for responsibility heat map rows |

#### Field Mode (Dark Theme) Token Overrides **[V2.1]**

Field Mode is a first-class feature, not a cosmetic preference. It is optimized for outdoor construction site readability. All tokens below are overrides applied when `[data-theme="field"]` is present on the root element or `prefers-color-scheme: dark` is active.

| Token (Field Mode) | Hex Value | Light Mode Equivalent |
|---|---|---|
| `--hbc-surface-1` | `#0F1419` | `#FAFBFC` |
| `--hbc-surface-2` | `#1A2332` | `#F0F2F5` |
| `--hbc-surface-3` | `#243040` | `#E8ECF0` |
| `--hbc-border-default` | `#2D3A4A` | `#DEE2E6` |
| `--hbc-text-primary` | `#F0F4F8` | `#1A1A1A` |
| `--hbc-text-muted` | `#8B95A5` | `#6C757D` |
| `--hbc-responsibility-bg` | `#2A1F0F` | `#FFF5EE` |

The dark header (`#1E1E1E`) is unchanged in Field Mode — it is already dark and requires no modification. Status colors remain the same sunlight-optimized values in both modes.

#### Connectivity Bar Colors **[V2.1]**

| Token | Hex Value | State |
|---|---|---|
| `--hbc-connectivity-online` | `#00C896` | Connected and fully synced |
| `--hbc-connectivity-syncing` | `#FFB020` | Connected but syncing queued changes |
| `--hbc-connectivity-offline` | `#FF4D4D` | No network connection |

#### Fluent UI Theme Override

```ts
// src/theme/theme.ts
import { createLightTheme, createDarkTheme } from '@fluentui/react-components';
import { hbcBrandVariants } from './tokens';

export const hbcLightTheme = {
  ...createLightTheme(hbcBrandVariants),
  colorNeutralBackground1: '#FFFFFF',
  colorNeutralBackground2: '#FAFBFC',  // [V2.1] warm off-white
  colorNeutralBackground3: '#F0F2F5',
};

export const hbcFieldTheme = {  // [V2.1] Field Mode (dark)
  ...createDarkTheme(hbcBrandVariants),
  colorNeutralBackground1: '#1A2332',
  colorNeutralBackground2: '#0F1419',
  colorNeutralBackground3: '#243040',
};
```

---

### 3.2 Typography System

The typography system uses **intent-based** scale names — not raw size values. Developers reference intents (`"display"`, `"heading-1"`, `"body"`, etc.) rather than pixel values.

**File:** `packages/ui-kit/src/theme/typography.ts`

| Intent | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 32px / 2rem | Bold 700 | 1.25 | Page-level hero headings, dashboard titles |
| `heading-1` | 24px / 1.5rem | Bold 700 | 1.3 | Tool landing page primary heading |
| `heading-2` | 20px / 1.25rem | SemiBold 600 | 1.35 | Section headings within a tool |
| `heading-3` | 16px / 1rem | SemiBold 600 | 1.4 | Card titles, panel section headers |
| `heading-4` | 14px / 0.875rem | SemiBold 600 | 1.4 | Table column headers, form section labels |
| `body` | 14px / 0.875rem | Regular 400 | 1.5 | All primary body content |
| `body-small` | 12px / 0.75rem | Regular 400 | 1.5 | Metadata, timestamps, helper text |
| `label` | 12px / 0.75rem | Medium 500 | 1.4 | Form field labels, badge text |
| `code` | 13px / 0.8125rem | Regular 400 | 1.6 | Courier New — code snippets only |

In Touch density tier, `body` scales to 16px and `label` scales to 14px automatically via the density system (Section 7.1).

---

### 3.3 Grid & Spatial System

**File:** `packages/ui-kit/src/theme/grid.ts`

HB Intel uses a **12-column fluid grid** with a base spacing unit of **4px**. All spacing values are multiples of 4px.

#### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `--hbc-space-xs` | `4px` | Icon padding, tight inline spacing |
| `--hbc-space-sm` | `8px` | Input internal padding, compact element gaps |
| `--hbc-space-md` | `16px` | Standard component padding, card content spacing |
| `--hbc-space-lg` | `24px` | Section spacing, card margins |
| `--hbc-space-xl` | `32px` | Page section separation |
| `--hbc-space-xxl` | `48px` | Major page section separation, hero spacing |

#### Breakpoints & Grid Behavior

| Breakpoint | Columns | Gutter | Max Page Width |
|---|---|---|---|
| Mobile `< 768px` | 4 columns | 16px | 100% |
| Tablet `768px – 1199px` | 8 columns | 24px | 100% |
| Desktop `≥ 1200px` | 12 columns | 24px | 1440px |
| Wide `≥ 1600px` | 12 columns | 32px | 1600px |

---

### 3.4 Iconography **[V2.1 — Three Optical Weights]**

All icons are **SVG React components**. No icon fonts are used. Icons are exported as named React components from `@hbc/ui-kit/icons`.

**File:** `packages/ui-kit/src/icons/index.tsx`

#### Icon Optical Weight System **[V2.1]**

Each icon is available in three optical weights to match the density tier and context:

| Weight | Stroke | Usage |
|---|---|---|
| `light` | 1.5px | Low-density desktop views, large icon contexts |
| `regular` | 2px | Standard — default for all contexts |
| `bold` | 2.5px | Touch density tier (field), small screen high-contrast contexts |

The `HbcDataTable` density system automatically applies the correct icon weight: `bold` in Touch tier, `regular` in Standard and Compact tiers.

Icons are drawn on a 24×24dp grid with optical corrections applied per icon (circular icons are slightly larger than square icons to appear the same perceptual size). Construction-domain icons use literal visual metaphors — a literal hard hat for safety, a literal blueprint roll for drawings — not abstract shapes requiring learned association.

#### Icon Size Scale

| Size Name | Pixel Value | Usage |
|---|---|---|
| `sm` | 16px | Inline with text, status icon next to badge label |
| `md` | 20px | Toolbar buttons, navigation rail icons |
| `lg` | 24px | Standalone navigation icons, empty state illustrations |

#### Status Icons **[V2.1 — Dual-Channel Shapes]**

Status icons are paired with status colors in `HbcStatusBadge`. The shape encodes the status independently of color so that colorblind users and sunlight-impaired screens can still read status:

| Status | Icon | Shape Description |
|---|---|---|
| Complete / Success | `StatusCompleteIcon` | Filled circle with checkmark |
| Overdue / Danger | `StatusOverdueIcon` | Triangle with exclamation point |
| Attention / Warning | `StatusAttentionIcon` | Circle with clock hands |
| Informational | `StatusInfoIcon` | Circle with letter i |
| Draft / Neutral | `StatusDraftIcon` | Dashed circle (open) |

#### Required Icon Categories

**Construction Domain Icons:** `DrawingSheet`, `RFI`, `PunchItem`, `ChangeOrder`, `Submittal`, `DailyLog`, `BudgetLine`, `GoNoGo`, `Turnover`, `SafetyObservation`, `HardHat`, `CraneEquipment`, `BlueprintRoll`, `Inspection`

**Navigation Icons:** `Home`, `Toolbox`, `Search`, `Notifications`, `Settings`, `ChevronBack`, `ChevronForward`, `ChevronDown`, `ChevronUp`, `Expand`, `Collapse`, `Menu`, `CommandPalette`

**Action Icons:** `Create`, `Edit`, `Delete`, `Download`, `Upload`, `Share`, `Filter`, `Sort`, `Save`, `Cancel`, `MoreActions`, `Star`, `StarFilled`, `Microphone`, `MicrophoneActive`

**Status Icons:** `StatusCompleteIcon`, `StatusOverdueIcon`, `StatusAttentionIcon`, `StatusInfoIcon`, `StatusDraftIcon`

**Connectivity Icons:** `CloudOffline`, `CloudSyncing`, `CloudSynced`

**Layout Icons:** `ViewList`, `ViewGrid`, `ViewKanban`, `SidePanelOpen`, `SidePanelClose`, `FullScreen`, `ExitFullScreen`, `FocusModeEnter`, `FocusModeExit`

#### Icon Authoring Rules

1. Every icon component accepts `size` (`sm` | `md` | `lg`), `weight` (`light` | `regular` | `bold`), `color` (defaults to `currentColor`), and `aria-label` props.
2. Decorative icons (paired with visible text) must have `aria-hidden="true"`.
3. Standalone icon buttons must have an `aria-label` attribute.
4. Never use icons as the sole indicator of status — `HbcStatusBadge` always pairs icon with color and text label.

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.3 completed: 2026-03-04
Step 1: tokens.ts — V2.1 sunlight-optimized status colors, HSL ramps, surface/field tokens, connectivity, expanded HbcSemanticTokens
Step 2: theme.ts — hbcLightTheme warm off-white, hbcFieldTheme, hbcDarkTheme deprecated alias
Step 3: typography.ts — intent-based naming (display/heading1-4/body/bodySmall/label/code), deprecated aliases preserved
Step 4: grid.ts — 4px spacing scale, breakpoints, 12-col grid, CSS var generators
Step 5: icons/index.tsx — 60 icons, 6 categories, 3 weights, 3 sizes, createIcon factory
Step 6: Barrel exports updated (theme/index.ts + src/index.ts)
Step 7: ESLint enforce-hbc-tokens stub created
Step 8: Storybook Light/Field Mode theme switcher added
Step 9: Build verification — zero errors
Step 10: ADR-0016 + developer guide created
-->