# Phase 4 Development Plan — UI Foundation & HB Intel Design System
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

**V2.1 Change Summary:** Ten decisions added from a structured competitive analysis of Procore, Autodesk Construction Cloud, Trimble Viewpoint, CMiC, InEight, Oracle Primavera Cloud, and Bluebeam Studio (March 2026). Changes affect: color tokens (§3.1), iconography (§3.4), shell connectivity bar (§4.1), adaptive density (§7.1), responsibility heat mapping (§7.1), saved views scope (§7.2), status badge encoding (§6), focus mode (§5 + §12), command palette (§6 + §12), Field Mode / dark mode elevation (§3.1 + §14), elevation & micro-interactions (§8 + §12), touch targets & voice input (§6 + §11), and the completion checklist (§20). All V2.0 decisions remain in force. New decisions are marked **[V2.1]**.

---

## CRITICAL GOVERNING PRINCIPLE

> HB Intel does **not** mirror Procore's UI 1:1. Procore — and the broader construction technology category — serves as a structural and interaction familiarity framework so that construction professionals can onboard rapidly. All visual identity derives from **HBC firm branding** as defined in `@hbc/ui-kit`. Any developer encountering apparent conflicts between industry patterns and HBC branding must always defer to HBC branding. The goal is to build the best field-first construction platform on the market, not a Procore clone.

---

## Table of Contents

1. Document Purpose & Scope
2. Locked Decision Registry
3. Design System Foundation
   - 3.1 Color & Token System
   - 3.2 Typography System
   - 3.3 Grid & Spatial System
   - 3.4 Iconography
4. Global Application Shell
   - 4.1 Dark Header Anatomy
   - 4.2 SPFx Application Customizer Integration
   - 4.3 Collapsible Icon-Rail Sidebar
5. Page Layout Taxonomy
6. Component Library
7. Data Visualization & Table System
8. Overlay & Surface System
9. Messaging & Feedback System
10. Navigation UI System
11. Form Architecture
12. Interaction Pattern Library
13. Module-Specific UI Patterns
14. Mobile & PWA Adaptations
15. NGX Modernization Strategy
16. `@hbc/ui-kit` Package Implementation
17. Storybook Configuration & Testing
18. UI Deficiencies & Mitigation Strategies
19. Granular UI Recommendations
20. Phase 4 Completion Checklist

---

## 1. Document Purpose & Scope

This document is the sole authoritative implementation guide for Phase 4 of the HB Intel platform. It is written so that a developer with zero prior familiarity with the HB Intel project can implement Phase 4 flawlessly by following this plan sequentially. No assumptions are made about prior context.

**What this document covers:**
- The complete HB Intel Design System (tokens, typography, grid, icons)
- The global application shell (dark header + connectivity bar + sidebar + SPFx customizer)
- All page layouts, components, overlays, forms, and interaction patterns
- Module-specific UI compositions for every HB Intel tool
- Mobile/PWA adaptations, Field Mode, command palette, and voice input
- Step-by-step `@hbc/ui-kit` package implementation instructions

**What this document does not cover:**
- API integrations, SharePoint list schemas, or data models (see Blueprint V4)
- SignalR architecture (see separate SignalR planning documents)
- State management patterns (see Blueprint V4 §architecture)

---

## 2. Locked Decision Registry

All decisions below were finalized through structured interview processes. No implementation agent may deviate from these decisions without creating a formal Architecture Decision Record (ADR) and obtaining sign-off. Decisions marked **[V2.1]** were added in this version from competitive analysis of seven leading construction technology platforms.

| # | Decision Area | Locked Decision |
|---|---|---|
| 1 | Global App Shell | Dark header (#1E1E1E) + flyout toolbox + Microsoft 365 waffle icon on the right |
| 2 | Shell Architecture | Single shared shell deployed as an SPFx Application Customizer — visible in both the standalone PWA and SharePoint-embedded webparts |
| 3 | Color System | HBC firm branding extended with HSL token architecture. `HBC_PRIMARY_BLUE #004B87`, `HBC_ACCENT_ORANGE #F37021` |
| 4 | + Create Button Color | HBC Accent Orange (`#F37021`) filled button in the dark header |
| 5 | Typography | Intent-based 9-level system extending existing HBC firm fonts |
| 6 | Grid & Spatial System | 12-column grid extending existing UI-Kit layout helpers |
| 7 | Iconography | SVG React component icon system. Three optical weight variants per icon (light / regular / bold) |
| 8 | Sidebar Navigation | Collapsible icon-rail (56px collapsed default, 240px expanded). Bottom navigation on mobile/tablet |
| 9 | Page Layout Taxonomy | Three layouts: `ToolLandingLayout`, `DetailLayout`, `CreateUpdateLayout` |
| 10 | Component Library | Full field-first component library extending existing UI-Kit. HBC-branded throughout |
| 11 | Interaction Patterns | Form Pattern, Inline Error Validation, Overlay Usage, Focus Mode, Optimistic UI |
| 12 | Semantic Status Colors | Industry-standard semantic mapping via HBC HSL token ramps |
| 13 | Data Visualization | Configurable `HbcDataTable` with auto-adaptive density, inline editing, KPI cards. ECharts for charts |
| 14 | DataTable Saved Views | Three-tier saved-view system (personal / project / organization) with shareable deep-link URLs |
| 15 | Overlay & Surface System | Modal, Panel, Tearsheet, Popover, Card — with strict documented usage rules |
| 16 | Messaging & Feedback | Semantic Banners, Toast, Empty State, Tooltips |
| 17 | Navigation UI | Breadcrumbs, Tabs, Pagination, Tree, Search, Command Palette |
| 18 | Form Architecture | Semantic sections, inline validation, Dropzone, sticky footer, voice input on text fields |
| 19 | Module-Specific Patterns | Full UI patterns for every HB Intel tool |
| 20 | NGX Modernization | Build modern from day one. No legacy components introduced |
| 21 | Mobile & PWA | Responsive rules, bottom navigation, Field Mode, offline-aware UI, push notifications, installability |
| 22 | Granular UI Recommendations | Prioritized recommendations with effort estimates |
| 23 | **[V2.1]** Adaptive Density | `HbcDataTable` auto-selects density tier via `pointer` media query + viewport width. Manual override persisted per user per tool |
| 24 | **[V2.1]** Focus Mode | Auto-activates on touch/tablet when entering `CreateUpdateLayout`. Opt-in toggle on desktop via form header button |
| 25 | **[V2.1]** Connectivity Bar | Persistent 2px ambient connectivity bar above dark header (green/amber/red). Offline-aware interactive elements display cloud-offline icon |
| 26 | **[V2.1]** Status Encoding | Dual-channel: color + icon shape on all `HbcStatusBadge` variants. Never color alone |
| 27 | **[V2.1]** Responsibility Heat Map | 4px `#F37021` left-border + `#FFF5EE` background tint on rows where authenticated user is Ball in Court. Applied via `responsibilityField` prop |
| 28 | **[V2.1]** Command Palette | `Cmd/Ctrl+K` AI command palette via Anthropic API. Offline keyword navigation via cached intent map |
| 29 | **[V2.1]** Field Mode | Dark mode elevated to Phase 4 first-class "Field Mode." Auto-activates via `prefers-color-scheme: dark`. Manual override in `HbcUserMenu`. Light surfaces use `#FAFBFC` warm off-white. Sunlight-optimized status colors |
| 30 | **[V2.1]** Elevation & Micro-interactions | Dual-shadow (ambient + key) 4-level elevation. Layout-matched shimmer skeleton loaders. Precise animation timing specifications |
| 31 | **[V2.1]** Touch & Voice | 56×56px touch targets in Touch density tier. Web Speech API voice dictation on `HbcTextArea` and `HbcRichTextEditor` |
| 32 | **[V2.1]** Saved Views Scope | Three-tier scope: personal (per-user), project (PM+ role), organization (Admin only). Deep-link URL sharing. Service worker cached |

---

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

---

## 4. Global Application Shell

The global shell is the persistent chrome visible on every authenticated screen. It is built once in `@hbc/ui-kit` and deployed in two environments:
1. As the root layout wrapper in the standalone PWA
2. As an SPFx Application Customizer injected into all SharePoint pages

---

### 4.1 Dark Header Anatomy

The header is a **fixed-position horizontal bar, 56px tall**, background `#1E1E1E`. It is the most recognizable element of the HB Intel UI.

**Above the dark header:** The `HbcConnectivityBar` — a 2px persistent ambient strip (see below). The combined visual unit is 58px total.

**Component:** `packages/ui-kit/src/HbcAppShell/HbcHeader.tsx`

#### `HbcConnectivityBar` — Ambient Network Status **[V2.1]**

**Component:** `packages/ui-kit/src/HbcAppShell/HbcConnectivityBar.tsx`

A 2px horizontal bar that sits above the dark header at the very top of the viewport. It is always visible and communicates network state through color alone — no text, no icons, no interruption to workflow.

| State | Color Token | Hex | Visual Treatment |
|---|---|---|---|
| Online & synced | `--hbc-connectivity-online` | `#00C896` | Solid 2px bar |
| Online, syncing | `--hbc-connectivity-syncing` | `#FFB020` | Solid 4px bar with subtle pulse animation |
| Offline | `--hbc-connectivity-offline` | `#FF4D4D` | Solid 4px bar with pulse animation (1.5s cycle) |

**Implementation:**
- Driven by `navigator.onLine` + `online`/`offline` window events.
- The service worker communicates sync queue state to the UI via `postMessage` to drive the amber "syncing" state.
- When offline, any interactive element that requires network connectivity displays the `CloudOffline` icon (16px, `--hbc-text-muted` color) in place of its normal action icon. Tapping an offline-blocked element shows a `HbcTooltip`: `"This action requires a network connection and will sync when you reconnect."`.
- `z-index: 10001` — above the Application Customizer header.
- In Field Mode (dark), the bar colors remain the same saturated values — they are intentionally high-contrast against the dark background.

#### Header Layout (Left to Right)

```
[ 2px connectivity bar — full viewport width                         ]
[ Logo ] [ Project Selector ▼ ] [ Toolbox ] [ ★ Favs ] [ 🔍 Search ] [ ⌘K ] [ + Create ] [ ⊞ ] [ 🔔 ] [ Avatar ]
|←—— LEFT ——|  |←————————— CENTER —————————→|  |← CENTER-RIGHT →|  |←—————————— RIGHT ————————————→|
```

#### Header Element Specifications

| Element | Specification |
|---|---|
| **HB Intel Logo** | `hb_logo_icon-NoBG.svg` white variant. Height: 32px. Links to Project Home. Left margin: 16px |
| **Project Selector** | Active project name. `heading-4` intent, white. Click opens searchable project dropdown. Chevron-down right |
| **Toolbox Menu** | Grid icon, 20px, `--hbc-header-icon-muted`. Opens `HbcToolboxFlyout` — full-width overlay listing all permissioned tools by role group |
| **Favorite Tools** | Up to 6 starred tool icons (20px, white). Hidden if no favorites saved |
| **Global Search** | Text input, min-width 320px. Placeholder: `"Search projects, RFIs, drawings…"`. On focus: renders `HbcSearchOverlay`. Keyboard: `Cmd+K` or `Ctrl+K` also opens Command Palette |
| **Command Palette Trigger** | `⌘K` badge displayed in the search bar right region. Also activates via keyboard shortcut. See Section 12 |
| **+ Create Button** | Background: `#F37021`. Text: white, `label` intent. Border-radius: 4px. Padding: `8px 16px`. Context-sensitive create actions based on active tool |
| **M365 Waffle** | Microsoft 365 official waffle SVG (24px, white). Opens native M365 app switcher |
| **Notifications Bell** | Bell icon, 20px, white. Red badge showing unread count. Click opens `HbcNotificationsPanel` |
| **User Avatar** | 32px circular avatar. Click opens `HbcUserMenu`: Profile Settings, Field Mode toggle, Sign Out |

#### `HbcUserMenu` — Field Mode Toggle **[V2.1]**

The user menu includes a **Field Mode** toggle. It is presented with a construction-specific label and icon, not as generic "Dark Mode":

```
[ 🌙  Field Mode  ] ●——○   (toggle, currently off = light)
```

When enabled, the toggle activates `hbcFieldTheme` and applies `[data-theme="field"]` to the root element. Preference is persisted to `localStorage` key `hbc-field-mode`. The toggle is overridden by `prefers-color-scheme: dark` (the system preference is respected unless the user explicitly sets a preference via this toggle — in which case their explicit choice wins).

#### Header Accessibility Requirements

- All icon-only buttons: `aria-label` required.
- Tab order (left to right): Logo → Project Selector → Toolbox → Search/Command Palette → Create → M365 Waffle → Notifications → Avatar.
- Minimum 3:1 contrast ratio for all icons against `#1E1E1E`.
- `Escape` closes any open flyout and returns focus to triggering element.
- `role="banner"` on the header element.

---

### 4.2 SPFx Application Customizer Integration

**Purpose:** Inject the identical dark header + connectivity bar into SharePoint pages.

**Component:** `packages/spfx/src/extensions/hbIntelHeader/HbIntelHeaderApplicationCustomizer.ts`

#### Implementation Steps

1. Generate the extension:
   ```bash
   yo @microsoft/sharepoint
   # → Extension → Application Customizer → Name: HbIntelHeaderCustomizer
   ```

2. Render into the Top placeholder:
   ```ts
   const topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
   if (topPlaceholder) {
     ReactDOM.render(
       <FluentProvider theme={hbcLightTheme}>
         <HbcConnectivityBar />
         <HbcAppShell context={this.context} />
       </FluentProvider>,
       topPlaceholder.domElement
     );
   }
   ```

3. The dark header background (`#1E1E1E`) and connectivity bar are hardcoded and do not respond to `FluentProvider` theme switching.

4. Suppress SharePoint's native suite bar:
   ```css
   .o365cs-topBar, #SuiteNavWrapper { display: none !important; }
   ```

5. `z-index: 10000` on the Application Customizer container. Connectivity bar: `z-index: 10001`.

6. Deploy to the SharePoint App Catalog scoped to the HB Intel site collection.

#### SPFx Bundle Size Constraint

The Application Customizer bundle must stay **under 250KB**. Create a separate `@hbc/app-shell` package exporting only `HbcConnectivityBar`, `HbcAppShell`, and direct dependencies. The full component library is consumed only by webpart bundles.

---

### 4.3 Collapsible Icon-Rail Sidebar

**Component:** `packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx`

#### Sidebar States

| State | Width | Behavior |
|---|---|---|
| **Collapsed** (default) | 56px | Icon-only. Hover shows tooltip + mini-flyout of tool links |
| **Expanded** | 240px | Role-group label + all tool links with icon + text. Transition: `width 250ms cubic-bezier(0.4, 0, 0.2, 1)` **[V2.1]** |
| **Mobile/Tablet `< 1024px`** | Hidden | Bottom navigation bar replaces sidebar |

#### Expand/Collapse Behavior

- Collapse/Expand toggle button at the bottom of the sidebar.
- User preference persisted to `localStorage` key `hbc-sidebar-state`.
- Hover does **not** auto-expand. Click/keyboard only.
- In Focus Mode (Section 12), the sidebar auto-collapses to 56px regardless of saved preference.

#### Role-Based Navigation Groups

| Group | Visible To | Tools |
|---|---|---|
| **Marketing** | Marketing role members | Proposals, Presentations, Project Photography |
| **Preconstruction** | Preconstruction role members | Go/No-Go Scorecards, Estimating, Bid Management |
| **Operations** | Operations role members | Project Controls, RFIs, Punch List, Drawings, Budget, Daily Log, Turnover, Documents |
| **Admin** | Admin role only | User Management, System Settings, Audit Logs |

#### Active State Visual Treatment

- **Active tool link (expanded):** 3px solid left border `#F37021` + background `#E8F1F8` + text color `#004B87`
- **Active tool link (collapsed):** Icon fill `#F37021` + 3px left border `#F37021`
- **Hover state:** Background `#F0F2F5`, text color `#004B87`

---

## 5. Page Layout Taxonomy

Every screen in HB Intel uses exactly one of three canonical layouts. All three layouts are React components exported from `@hbc/ui-kit`. No developer may create a custom page layout outside this taxonomy.

---

### Layout 1: `ToolLandingLayout`

**Used for:** Every tool's primary list/dashboard view.

```
┌─────────────────────────────────────────────────────────────────┐
│  CONNECTIVITY BAR (2px, fixed)                          [V2.1]  │
│  DARK HEADER (56px, fixed)                                       │
├──────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR  │  PAGE HEADER (64px)                                  │
│ (56–240) │  [ Tool Name (heading-1) ]  [ + Create ]  [ Export ] │
│          ├──────────────────────────────────────────────────────┤
│          │  TOOLBAR / COMMAND BAR (48px)                        │
│          │  [ 🔍 Search ] [ Filters ▼ ] [ Views ▼ ] [ ⚙ cols ] │
│          ├──────────────────────────────────────────────────────┤
│          │  KPI CARDS ROW (optional, tool-specific)             │
│          │  [ Card ] [ Card ] [ Card ] [ Card ]                  │
│          ├──────────────────────────────────────────────────────┤
│          │  CONTENT AREA (HbcDataTable or card grid)            │
│          │  — scrollable —                                       │
│          ├──────────────────────────────────────────────────────┤
│          │  STATUS BAR (24px)                                    │
│          │  Showing 1–25 of 142 items  |  Last synced 2m ago    │
└──────────┴──────────────────────────────────────────────────────┘
```

**Props:** `toolName`, `primaryAction`, `secondaryActions[]`, `kpiCards[]`, `children`, `showKpiCards`.

---

### Layout 2: `DetailLayout`

**Used for:** Viewing the full detail of a single item.

```
┌─────────────────────────────────────────────────────────────────┐
│  CONNECTIVITY BAR (2px) + DARK HEADER (56px)                    │
├──────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR  │  BREADCRUMB (32px)                                   │
│          │  RFIs / RFI #042 — Concrete Pour Sequence Question   │
│          ├──────────────────────────────────────────────────────┤
│          │  DETAIL HEADER (64px)                                │
│          │  ← Back  |  RFI #042  [ Status Badge ]              │
│          │  [ Edit ]  [ Delete ]  [ Close RFI ]                 │
│          ├──────────────────────────────────────────────────────┤
│          │  TAB BAR (40px)                                       │
│          │  [ General ] [ Responses ] [ Related ] [ History ]   │
│          ├────────────────────────────┬────────────────────────┤
│          │  MAIN COLUMN (8/12 cols)   │  SIDEBAR (4/12 cols)   │
│          │  DetailSection components  │  Related Items          │
│          │  Rich text fields          │  Activity Feed          │
│          │  — scrollable —            │  Attachments            │
└──────────┴────────────────────────────┴────────────────────────┘
```

**Props:** `backLink`, `backLabel`, `itemId`, `itemTitle`, `statusBadge`, `actions[]`, `tabs[]`, `mainContent`, `sidebarContent`.

---

### Layout 3: `CreateUpdateLayout`

**Used for:** Creating or editing any item. Triggers Focus Mode automatically on touch/tablet. **[V2.1]**

```
┌─────────────────────────────────────────────────────────────────┐
│  CONNECTIVITY BAR (2px) + DARK HEADER → [Focus: breadcrumb only]│
├──────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR  │  FORM HEADER (64px)                                  │
│ [Focus:  │  Create New RFI  [ ⊡ Focus ] [ Cancel ] [ Save ]    │
│ 56px]    ├──────────────────────────────────────────────────────┤
│          │  FORM CONTENT (scrollable, max 8/12 cols centered)   │
│          │  HbcFormSection: General Information                  │
│          │  HbcFormSection: Attachments                          │
│          │  HbcFormSection: Related Items                        │
│          ├──────────────────────────────────────────────────────┤
│          │  STICKY FOOTER (56px)                                │
│          │                           [ Cancel ]  [ Save ]       │
└──────────┴──────────────────────────────────────────────────────┘
```

**Props:** `mode` (`"create"` | `"edit"`), `itemType`, `itemTitle`, `onCancel`, `onSubmit`, `isSubmitting`, `children`.

**Focus Mode behavior on `CreateUpdateLayout`:**
- On touch/tablet: auto-activates on mount. Sidebar collapses to 56px. Header reduces to minimal breadcrumb + Cancel + Save only. Surrounding UI dims to 40% opacity.
- On desktop: a `FocusModeEnter` icon button appears in the form header. Click toggles focus mode.
- Focus mode state persisted to `localStorage` key `hbc-focus-mode-desktop` (desktop preference only; touch auto-activates every time).
- Exit via the `FocusModeExit` icon button or by saving/cancelling the form.

---

## 6. Component Library

All components are built on **Fluent UI v9 + Griffel**, exported from `@hbc/ui-kit`, styled exclusively with HBC design tokens.

### Component File Structure

```
packages/ui-kit/src/HbcComponentName/
├── index.tsx                         # Main component. Controlled props. data-hbc-ui attribute.
├── styles.ts                         # Griffel makeStyles. Only var(--hbc-*) tokens.
├── types.ts                          # TypeScript props interfaces. Full JSDoc.
└── HbcComponentName.stories.tsx      # Default, AllVariants, FieldMode, A11yTest stories.
```

> **[V2.1]** All components now require a `FieldMode` Storybook story in addition to Default, AllVariants, and A11yTest.

### Priority Build Order

1. **`HbcStatusBadge`** — Validates token system + dual-channel encoding **[V2.1]**
2. **`HbcConnectivityBar`** — Validates service worker state integration **[V2.1]**
3. **`HbcTypography`** — Validates intent-based type scale
4. **`HbcEmptyState`** — Validates layout + icon + button composition
5. **`HbcErrorBoundary`** — Wraps all major page sections
6. **`HbcButton`** — All variants required before any interactive component
7. **`HbcInput`** — Full input suite including voice dictation **[V2.1]**
8. **`HbcForm` / `HbcFormSection`** — Required before `CreateUpdateLayout`
9. **`HbcPanel`** — Required before detail views
10. **`HbcCommandBar`** — Required before `ToolLandingLayout`
11. **`HbcCommandPalette`** — Required before any tool is shipped **[V2.1]**
12. **`HbcDataTable`** — Complex. See Section 7.
13. **`HbcChart`** — Lazy-loaded. Build last.

### Component Authoring Rules

1. Every component renders `data-hbc-ui="component-name"` for automated test targeting.
2. All interactive components must be fully keyboard-navigable.
3. Never hardcode hex values — always reference `var(--hbc-token-name)`.
4. All components must render correctly in both `hbcLightTheme` and `hbcFieldTheme`.
5. Every component must have Default, AllVariants, FieldMode, and A11yTest Storybook stories. **[V2.1]**
6. All exported types must have JSDoc on every prop.

### Component Specifications

#### `HbcStatusBadge` **[V2.1 — Dual-Channel Encoding]**

Variants: `success` | `danger` | `warning` | `info` | `neutral`
Sizes: `sm` (12px label) | `md` (14px label)

Every variant renders **both** a color fill AND a paired icon shape. Color is never the sole indicator of status.

| Variant | Color (bg) | Text Color | Icon | Aria Label Pattern |
|---|---|---|---|---|
| `success` | `--hbc-green-90` | `--hbc-green-30` | `StatusCompleteIcon` (filled circle + checkmark) | `"Status: [label]"` |
| `danger` | `--hbc-red-90` | `--hbc-red-30` | `StatusOverdueIcon` (triangle + exclamation) | `"Status: [label]"` |
| `warning` | `--hbc-amber-90` | `--hbc-amber-30` | `StatusAttentionIcon` (circle + clock) | `"Status: [label]"` |
| `info` | `--hbc-info-90` | `--hbc-info-30` | `StatusInfoIcon` (circle + i) | `"Status: [label]"` |
| `neutral` | `--hbc-gray-90` | `--hbc-gray-30` | `StatusDraftIcon` (dashed circle) | `"Status: [label]"` |

Badge anatomy: `[Icon sm] [Label text]` — icon always left of label, always visible. In the `sm` size, the icon is 10px; in the `md` size, 12px.

#### `HbcConnectivityBar` **[V2.1]**

A stateless presentational component that reads connectivity state from a React context (`HbcConnectivityContext`) provided at the app root.

Props: `state` (`"online"` | `"syncing"` | `"offline"`). Height expands from 2px to 4px when `state` is `"syncing"` or `"offline"`. Pulse animation: `opacity 0.6 → 1.0 → 0.6` at 1.5s cycle when offline.

#### `HbcCommandPalette` **[V2.1]**

**Component:** `packages/ui-kit/src/HbcCommandPalette/index.tsx`

Activated via `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux) from anywhere in the application, or by clicking the `⌘K` badge in the header search bar.

**Anatomy:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Overlay backdrop — rgba(0,0,0,0.6) — full viewport             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  [ 🔍 What do you need? (AI-powered)      ] [ esc ]      │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  RECENT  |  TOOLS  |  ITEMS  |  ACTIONS                  │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  > RFI Log                    Navigate                    │  │
│  │  > Create Punch Item          Action                      │  │
│  │  > Overdue RFIs               Filtered View               │  │
│  │  > Budget Variance            AI Query                 ✦  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction modes:**

| Input | Behavior | Requires Network |
|---|---|---|
| `"rfi"` or `"punch list"` | Navigate to tool | No — cached intent map |
| `"create rfi"` | Open `CreateUpdateLayout` for RFI | No — local navigation |
| `"overdue rfis"` | Navigate to RFI log with overdue filter pre-applied | No — cached intent map |
| `"what's the budget variance on phase 2"` | Anthropic API query — returns inline data answer | Yes |
| `"show me rfis assigned to me"` | Anthropic API query + navigation | Yes |

**Offline behavior:** When offline, the AI query mode is disabled. The input still accepts keyword navigation commands against a locally cached intent map (JSON file, cached by service worker). A subtle `CloudOffline` indicator appears in the input right region when in offline mode. A tooltip on hover: `"AI queries require a connection. Navigation commands work offline."`.

**Anthropic API integration:**
- Model: `claude-sonnet-4-20250514`
- System prompt (injected at runtime): current user role, active project context, available tools list
- Each query sends: user's natural language input + project context
- Response is parsed for intent: navigate, filter, create, or answer
- Answers render inline in the palette result list — not in a separate panel
- AI results are marked with a ✦ sparkle icon to distinguish from deterministic results

**Result actions:**
- Arrow keys navigate results. Enter executes. Escape closes.
- Tab cycles between result categories.
- Each result shows: icon + label + action type tag (Navigate / Action / AI Query)

**Props:** `isOpen`, `onClose`, `projectContext`, `userRole`.

#### `HbcButton`

| Variant | Style | Usage |
|---|---|---|
| `primary` | `#F37021` filled, white text | Single highest-priority action per page |
| `secondary` | `#004B87` outlined, blue text | Supporting actions |
| `ghost` | Transparent, `#004B87` text | Cancel, tertiary actions |
| `danger` | `#FF4D4D` outlined or filled | Destructive actions |

> **Rule:** Never place more than one `primary` variant button on a single page view.

Sizes: `sm` (32px height) | `md` (40px height) | `lg` (48px height)

In Touch density tier, all buttons scale up one size automatically: `sm` → `md`, `md` → `lg`. **[V2.1]**

#### `HbcInput` Suite **[V2.1 — Voice Dictation]**

All inputs share: `label`, `required`, `error`, `helperText`, `disabled` props.

`HbcTextArea` and `HbcRichTextEditor` additionally accept a `voiceDictation` prop (default: `true`). When enabled, a microphone icon button (`MicrophoneIcon`, `sm` size) renders in the field's top-right corner. Tapping/clicking it:

1. Requests microphone permission via the browser (one-time, standard browser permission prompt).
2. Activates the Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`).
3. The microphone icon transitions to `MicrophoneActiveIcon` with a subtle pulse animation.
4. Transcribed text is appended to the field's current value in real time.
5. Tapping again or pressing `Escape` stops dictation.
6. If the Speech API is unavailable (non-supporting browser or no microphone), the microphone icon is hidden entirely — graceful degradation, no error shown.

| Component | Construction Use Case | Voice |
|---|---|---|
| `HbcTextInput` | Item titles, subjects, short text | No |
| `HbcTextArea` | Long descriptions, notes, meeting minutes | **Yes** |
| `HbcRichTextEditor` | RFI questions/responses, formal correspondence | **Yes** |
| `HbcCurrencyInput` | Budget amounts, cost impacts | No |
| `HbcNumberInput` | Quantities, percentages | No |
| `HbcDateSelect` | Due dates, scheduled dates | No |
| `HbcSingleSelect` | Status, type, priority | No |
| `HbcMultiSelect` | Distribution lists, assignees | No |
| `HbcTieredSelect` | Cost code hierarchies | No |
| `HbcPillSelect` | Compact multi-value | No |
| `HbcContactPicker` | User/company assignment | No |
| `HbcCheckbox` | Boolean fields, checklist items | No |
| `HbcRadioGroup` | Mutually exclusive options | No |
| `HbcSwitch` | Feature toggles | No |
| `HbcSlider` | Confidence levels, completion percentages | No |

#### `HbcPanel`

Right-side slide-in surface. Animation: `transform: translateX` from `100%` to `0`, duration `250ms cubic-bezier(0.4, 0, 0.2, 1)`. **[V2.1 updated timing]**

Widths: `sm` (360px) | `md` (480px) | `lg` (640px)

On mobile (`< 768px`), all panels render as bottom sheets (slide up from bottom, full width) regardless of the `width` prop.

#### `HbcCommandBar`

Toolbar component for all `ToolLandingLayout` screens:
- `HbcSearch` (local, left-aligned)
- Active filter chips (dismissable pills)
- Saved view selector dropdown (three-tier: personal / project / org)
- View mode toggle (List / Grid)
- Density override control (Compact / Standard / Touch) — shows auto-detected tier, allows override **[V2.1]**
- Secondary action buttons (Export, Reports)
- Column configurator trigger (gear icon)

---

## 7. Data Visualization & Table System

---

### 7.1 `HbcDataTable` — Full Specification **[V2.1 — Adaptive Density + Responsibility Heat Map]**

**Dependencies:** `@tanstack/react-table ^8.21.0`, `@tanstack/react-virtual ^3.13.0`

#### Adaptive Density System **[V2.1]**

`HbcDataTable` automatically selects a density tier based on device input signals. No manual configuration is required from users. The correct experience is delivered by default.

**Tier Selection Logic:**

| Tier | Row Height | Font Size | Touch Target | Activation Condition |
|---|---|---|---|---|
| **Compact** | 36px | 13px | 36px | `pointer: fine` (mouse) AND viewport width ≥ 1440px |
| **Standard** | 48px | 14px | 44px | `pointer: fine` AND viewport 768–1439px, OR `pointer: coarse` on large screen with keyboard |
| **Touch** | 64px | 16px | **56px** | `pointer: coarse` AND viewport < 1024px, OR tablet detected |

**Auto-detection implementation:**
```ts
// Evaluated once on mount, re-evaluated on resize/orientation change
function detectDensityTier(): DensityTier {
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const width = window.innerWidth;
  if (isCoarse && width < 1024) return 'touch';
  if (width >= 1440 && !isCoarse) return 'compact';
  return 'standard';
}
```

**Manual override:** A density control in `HbcCommandBar` shows the current auto-detected tier and allows the user to override. Override preference is persisted to `localStorage` key `hbc-density-{toolId}`. If an override exists, it takes precedence over auto-detection. The control label shows: `"Density: Auto (Touch)"` or `"Density: Compact (Manual)"`.

**Card transformation:** When viewport width < 640px, `HbcDataTable` automatically renders as a **card stack** rather than a table. Each card shows the 4–5 most critical columns (defined per tool via `mobileCardFields` prop) with a chevron to expand full details inline. This eliminates horizontal scrolling on mobile — the most frequently cited mobile frustration across all reviewed platforms.

**Field Mode density:** In Field Mode, the Touch tier activates by default regardless of `pointer` media query, on the assumption that field users in dark mode are on a mobile device. Override remains available.

#### Responsibility Heat Map **[V2.1]**

When the `responsibilityField` prop is set on `HbcDataTable`, rows where the authenticated user matches that field's value receive visual responsibility highlighting:

```
┌──────────────────────────────────────────────────────────────────┐
│▌ RFI #042  Concrete Pour Question   ● Overdue  John Smith  ...  │ ← 4px #F37021 left border + #FFF5EE bg
│  RFI #043  Submittal Review         ● Open     Jane Doe    ...  │ ← standard row
│▌ RFI #047  Change Order Review      ● Open     John Smith  ...  │ ← 4px #F37021 left border + #FFF5EE bg
│  RFI #051  Waterproofing Detail     ● Closed   Tom Brown   ...  │ ← standard row
└──────────────────────────────────────────────────────────────────┘
```

- Left border: `4px solid #F37021` (`--hbc-accent-orange`)
- Background: `#FFF5EE` (`--hbc-responsibility-bg`) in light mode; `#2A1F0F` in Field Mode
- The heat map applies regardless of density tier
- Works on both table and card-stack views (card-stack shows a top border instead of left border)
- `responsibilityField` prop value: the column accessor key for the Ball in Court / assignee field (e.g., `"ballInCourt"`, `"assigneeId"`)
- The authenticated user's ID is passed via `currentUserId` prop

#### Required Features (Full)

**Column Configuration**
- Column show/hide toggle via column picker panel.
- Drag-to-reorder via drag handles on column headers.
- Column resize via drag handles on column borders.
- Per-column sort toggle with directional arrow indicator.

**Saved Views System** (see Section 7.2)

**Inline Editing**
- Double-click editable cell to activate. Pencil icon on row hover.
- Tab: next editable cell. Enter/blur: save. Escape: revert.
- Editable cells: subtle dashed bottom border in default state.

**Row Selection**
- Checkbox leftmost column. Select All selects current page.
- Selecting any row reveals bulk action bar in `HbcCommandBar`.

**Empty State**
- `HbcEmptyState` in table body when no rows or filtered to zero.
- Each tool provides `emptyStateConfig` prop: icon, title, description, primary action.

**Loading State — Shimmer Skeleton [V2.1]**
- Layout-matched shimmer skeletons replace the generic spinner-then-content pattern.
- Skeleton rows match the exact column widths and heights of the current density tier.
- Shimmer animation: gradient sweep `left-to-right` at 1.5s cycle on `--hbc-surface-2` background.
- Skeleton count: matches the last known page size (or 10 rows if unknown).
- When data loads, skeleton rows crossfade to real rows at `200ms ease-out` — no layout shift.

**Virtualization**
- `@tanstack/react-virtual` applied for tables with 100+ rows.
- 60fps maintained on mid-range Android tablet.
- Row height values from active density tier fed into the virtualizer.

**Horizontal Scroll**
- Native horizontal scrollbar when column count exceeds viewport.
- Up to 2 columns may be frozen (leftmost by default: the item identifier column).

**Data Freshness Indicator [V2.1]**
- When table data is served from service worker cache (stale-while-revalidate), the table container renders a `1px dashed top border` using `--hbc-border-default`.
- When background revalidation completes and fresh data loads, the border transitions to solid at `300ms ease`.
- This provides ambient data freshness awareness without any text or toast notification.

---

### 7.2 Saved Views — Three-Tier Specification **[V2.1]**

| Attribute | Specification |
|---|---|
| **Scopes** | **Personal** (per-user, per-tool) · **Project** (shared with all project members, created by PM role+) · **Organization** (shared across all projects, Admin only) |
| **Contents** | Visible columns, column order, column widths, active filters, active sort column + direction, group-by setting, density tier override |
| **Persistence** | `HBIntel_UserViews` SharePoint list. Schema: `UserId` (text), `ToolId` (text), `Scope` (text: personal/project/org), `ProjectId` (text, null for org scope), `ViewName` (text, max 50 chars), `ViewConfig` (JSON string), `IsDefault` (boolean) |
| **Deep Links** | Each saved view generates a shareable URL encoding the view state as a base64-encoded query parameter: `?view=eyJ...`. Navigating to this URL restores the exact filter/sort/column state. Service worker caches view definitions in IndexedDB for offline access |
| **System Default** | Each tool ships with a system default view. `IsDefault: true`. Cannot be deleted |
| **View Limit** | Max 20 personal views per user per tool. Warn at 18. Block at 20 |
| **Selector UI** | Dropdown in `HbcCommandBar` showing: personal views, then project views (labeled `[Project]`), then org views (labeled `[HBC]`). "Save current view" and "Manage views" options |

---

### 7.3 KPI Cards

KPI cards render above `HbcDataTable` in `ToolLandingLayout`. Click filters the table.

**Card Anatomy:**
```
┌─────────────────────────┐
│ Metric Label (label)    │  ← muted, label intent
│                         │
│  142                    │  ← display intent, bold
│                         │
│  ↑ 12% from last week   │  ← body-small, colored per trend
└─────────────────────────┘
     ▲ 3px top border in semantic color
```

Active card: `2px solid #004B87` full border + `#E8F1F8` background.

Maximum: 5 KPI cards per tool.

---

### 7.4 Chart Components

All charts use **ECharts** via `echarts-for-react`. Lazy-loaded. ECharts bundle in its own Rollup chunk.

| Component | Chart Type | Construction Use Cases |
|---|---|---|
| `HbcBarChart` | Vertical/Horizontal bar | Items by Company, Cost by Trade |
| `HbcDonutChart` | Donut/Pie | Status distribution |
| `HbcLineChart` | Line/Area | Budget variance over time |
| `HbcKpiCard` | Single metric | Standalone KPI |

All chart series use HBC brand palette. Charts click-to-filter the associated `HbcDataTable`. Charts reflow on sidebar expand/collapse.

---

## 8. Overlay & Surface System **[V2.1 — Precision Elevation]**

### Elevation System **[V2.1]**

The elevation system uses dual-shadow (ambient + key) layering to create a legible spatial hierarchy. This replaces V2.0's generic single-shadow scale.

| Level | Usage | CSS `box-shadow` |
|---|---|---|
| **Level 0 — Rest** | In-flow content, table rows, body text | `none` |
| **Level 1 — Card** | Cards, toolbar containers, filter bars | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` |
| **Level 2 — Raised** | Dropdowns, popovers, side panels | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` |
| **Level 3 — Modal** | Modals, command palette, tearsheets | `0 10px 20px rgba(0,0,0,0.10), 0 6px 6px rgba(0,0,0,0.08)` |

In Field Mode, shadow opacity increases by 50% (`0.08` → `0.12`) to maintain visibility against dark surfaces.

**File:** `packages/ui-kit/src/theme/elevation.ts`
```ts
export const hbcElevation = {
  rest: 'none',
  card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  raised: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
  modal: '0 10px 20px rgba(0,0,0,0.10), 0 6px 6px rgba(0,0,0,0.08)',
} as const;
```

### Surface Usage Rules

| Surface | Width | When to Use | When NOT to Use |
|---|---|---|---|
| `HbcModal` | 480 / 600 / 720px | Confirmations. Simple single-section forms. Alerts | Complex multi-section workflows. Detail views |
| `HbcPanel` | 360 / 480 / 640px | Detail views keeping list context. Filter panels | Primary creation workflows. Confirmations |
| `HbcTearsheet` | Full-width overlay | Multi-step workflows (Turnover, Go/No-Go submission) | Simple confirmations. Detail views |
| `HbcPopover` | 240 / 320px | Contextual info on hover/click: user cards, field help | Forms. Confirmations |
| `HbcCard` | Fluid (grid-based) | Grouping related content: dashboards, KPI metrics | Navigation. Data tables |
| `HbcCommandPalette` | 640px centered | `Cmd+K` AI command layer | — Never render in any other context |

### Z-Index Scale

| Layer | Z-Index |
|---|---|
| Page content | 0–99 |
| Sidebar / Sticky elements | 100–199 |
| Dark header | 200 |
| `HbcPopover` | 1000–1099 |
| `HbcPanel` | 1100–1199 |
| `HbcModal` / `HbcTearsheet` | 1200–1299 |
| `HbcCommandPalette` | 1250 |
| Toast notifications | 1300 |
| SPFx Application Customizer | 10000 |
| `HbcConnectivityBar` | 10001 |

### Modal Anatomy Standard

- Header: Title (`heading-3`) + X close button. Always present.
- Body: Scrollable if > 60vh. Padding: `var(--hbc-space-lg)`.
- Footer: Right-aligned buttons. Primary action rightmost. Max 3 buttons.
- Backdrop: `rgba(0,0,0,0.5)`. Click outside closes unless destructive confirmation in progress.
- Focus trap while open. `Escape` closes and returns focus to triggering element.

---

## 9. Messaging & Feedback System

| Component | Specification |
|---|---|
| **`HbcBanner`** | Full-width bar below dark header. Variants: `info` / `success` / `warning` / `error`. Use for persistent page-level messages. Always include X dismiss unless critical |
| **`HbcToast`** | **[V2.1]** Three categories only: success (green, auto-dismiss 3s), error (red, requires dismissal), sync-status (blue, auto-dismiss on sync completion). Informational toasts eliminated — direct manipulation feedback replaces them. Bottom-right. Max 3 visible |
| **`HbcEmptyState`** | Centered in content area. Required: `icon`, `title` (heading-2), `description` (body). Optional: `primaryAction`, `secondaryAction` |
| **`HbcTooltip`** | Max-width 280px. Show delay: 300ms. Never place interactive elements inside — use `HbcPopover` |
| **`HbcSpinner`** | Sizes: `sm` (20px) / `md` (40px) / `lg` (64px). Always with visually hidden `aria-label`. Min display time: 300ms |

---

## 10. Navigation UI System

| Component | Specification |
|---|---|
| **`HbcBreadcrumbs`** | Below dark header in `DetailLayout` and `CreateUpdateLayout`. Format: `[Tool] / [Item]`. Max 3 levels. In Focus Mode, the header reduces to breadcrumbs only |
| **`HbcTabs`** | Horizontal tab bar. Active: 3px solid `#F37021` underline + bold label. Keyboard-navigable via arrow keys. Lazy render tab panels |
| **`HbcPagination`** | `HbcDataTable` footer. Previous / pages / Next. Page size: 25, 50, 100. Hidden when ≤ page size |
| **`HbcSearch` (Global)** | Dark header. Focus opens `HbcSearchOverlay` + `HbcCommandPalette` trigger |
| **`HbcSearch` (Local)** | `HbcCommandBar`. Debounced 200ms client-side filter |
| **`HbcTree`** | Documents tool folder structure. Keyboard-navigable |
| **`HbcCommandPalette`** | **[V2.1]** See Section 6 for full specification. The primary navigation upgrade over all current platforms |

---

## 11. Form Architecture

All forms in HB Intel use the `HbcForm` / `HbcFormSection` component system. Direct HTML `<form>` elements are prohibited.

### Form Composition Pattern

```tsx
<HbcForm onSubmit={handleSubmit} onDirtyChange={setIsDirty}>
  <HbcFormSection title="General Information" collapsible={false}>
    <HbcFormRow>
      <HbcTextInput name="subject" label="Subject" required />
      <HbcSingleSelect name="type" label="Type" options={typeOptions} />
    </HbcFormRow>
    <HbcFormRow>
      <HbcContactPicker name="assignee" label="Assignee" required />
      <HbcDateSelect name="dueDate" label="Due Date" />
    </HbcFormRow>
    {/* voiceDictation prop enables microphone button — [V2.1] */}
    <HbcRichTextEditor name="description" label="Description" fullWidth voiceDictation />
  </HbcFormSection>

  <HbcFormSection title="Cost Impact" collapsible defaultCollapsed={false}>
    <HbcFormRow>
      <HbcSingleSelect name="costImpact" label="Cost Impact" options={['Yes','No','TBD']} />
      <HbcCurrencyInput name="costAmount" label="Amount" />
    </HbcFormRow>
  </HbcFormSection>

  <HbcFormSection title="Attachments" collapsible defaultCollapsed={false}>
    <HbcDropzone accept={['image/*', '.pdf', '.dwg']} maxSize={25 * 1024 * 1024} />
  </HbcFormSection>

  <HbcFormSection title="Notes" collapsible defaultCollapsed={false}>
    {/* voiceDictation on HbcTextArea for field use — [V2.1] */}
    <HbcTextArea name="notes" label="General Notes" voiceDictation />
  </HbcFormSection>

  <HbcFormSection title="Related Items" collapsible defaultCollapsed>
    <HbcRelatedItemsPicker types={['drawing', 'specification', 'photo']} />
  </HbcFormSection>

  <HbcStickyFormFooter>
    <HbcButton variant="ghost" onClick={onCancel}>Cancel</HbcButton>
    <HbcButton variant="primary" type="submit" loading={isSubmitting}>Save</HbcButton>
  </HbcStickyFormFooter>
</HbcForm>
```

### Inline Error Validation Rules

1. Validate on blur for text inputs. Validate on change for selects, dates, checkboxes.
2. Red (`#FF4D4D`) border + red error text (`body-small`) directly below field. Error icon in field right region.
3. Required indicator: asterisk `*` on label. Tooltip: `"This field is required"`.
4. Form-level error summary: `HbcBanner` (error variant) at form top. Each item is an anchor link.
5. Never clear user data on validation failure.

### Dropzone Specification

- Default: `2px dashed --hbc-border-default`, upload icon, `"Drag files here or click to browse"`.
- Drag-over: Border `#004B87`, background `#E8F1F8`.
- Upload progress: inline per file. File-level errors inline with red icon.

### `HbcStickyFormFooter`

Fixed to viewport bottom. `z-index: 100`. `box-shadow: 0 -2px 8px rgba(0,0,0,0.1)`.

### Touch Target Specification **[V2.1]**

| Density Tier | Minimum Touch Target | Rationale |
|---|---|---|
| Compact | 36px (mouse use — no gloves) | Desktop mouse users |
| Standard | 44px (WCAG recommendation) | Mixed office/tablet use |
| **Touch** | **56×56px** | **Gloved hand construction field use** |

All interactive elements in the Touch density tier must meet the 56×56px minimum. This includes buttons, icon buttons, table row action icons, form field inputs, checkboxes, and the microphone dictation button.

---

## 12. Interaction Pattern Library

### Pattern: Focus Mode **[V2.1]**

Focus Mode reduces cognitive load when a user is actively composing or editing. It directly addresses the "information overload" and "too many options" criticisms documented in 60–70% of cross-platform user reviews.

**Activation:**
- **Touch/tablet (automatic):** Activates immediately when `CreateUpdateLayout` mounts on a `pointer: coarse` device.
- **Desktop (manual):** A `FocusModeEnter` icon button in the `CreateUpdateLayout` form header. Keyboard shortcut: `Cmd/Ctrl+Shift+F`.

**Visual changes when active:**
1. Sidebar collapses to 56px (icon-only) regardless of saved preference.
2. Dark header reduces to: Logo + breadcrumb + Cancel + Save. All other header elements hidden.
3. All non-form UI elements outside the form content area reduce to 40% opacity.
4. The form content area receives full focus ring treatment.

**Deactivation:**
- Click the `FocusModeExit` button in the form header.
- Keyboard shortcut: `Cmd/Ctrl+Shift+F` (toggle).
- Saving or cancelling the form always deactivates Focus Mode and restores full UI.
- On touch/tablet, Focus Mode is always active in `CreateUpdateLayout` — it cannot be manually deactivated to prevent accidental dismissal.

**Animations:**
- Sidebar collapse: `width 250ms cubic-bezier(0.4, 0, 0.2, 1)`
- Header element fade: `opacity 150ms ease-out`
- Background dim: `opacity 200ms ease-out`

### Pattern: AI Command Palette **[V2.1]**

`Cmd/Ctrl+K` opens `HbcCommandPalette` from anywhere in the application. See Section 6 for full specification. Key behavioral rules:

- The palette never replaces the existing navigation — it is an accelerator layer on top of it.
- Results from the Anthropic API are clearly marked with a ✦ sparkle icon.
- Queries that modify data (create, update) always show a confirmation step before executing.
- The palette respects the user's current role permissions — it does not surface tools or actions the user cannot access.
- All keyboard-only users must be able to accomplish any palette action without a mouse.

### Pattern: Confirm Destructive Action

```
Modal title: "Delete Punch Item #127?"
Body: "This action cannot be undone. The punch item and all associated photos and comments will be permanently deleted."
Footer: [Cancel (ghost)] [Delete (danger, primary position)]
```

### Pattern: Optimistic UI Update

Update UI immediately on user action. Dispatch API request in background. On failure: revert UI + `HbcToast` (error) with Retry button.

### Pattern: Loading States Hierarchy **[V2.1 — Shimmer Skeletons]**

| Context | Loading Component |
|---|---|
| Full page initial load | `HbcSpinner` (`lg`), centered |
| Tab content load | `HbcSpinner` (`md`), centered in tab panel |
| Table data fetch | Layout-matched shimmer skeleton rows (see §7.1) |
| Inline action | Spinner replaces button label. Button disabled |
| Chart data fetch | `HbcSpinner` (`md`) overlaid on chart container |
| Command Palette AI query | Animated ✦ sparkle indicator in result area |

**Minimum display time:** 300ms to prevent flicker.

### Pattern: Unsaved Changes Warning

`HbcForm` fires `onDirtyChange(true)` when any field is modified. Intercept navigation via React Router `useBlocker`:

```
Title: "Leave without saving?"
Body: "You have unsaved changes that will be lost if you leave this page."
Footer: [Stay & Save (primary)] [Leave without Saving (danger)]
```

### Pattern: Real-Time Status Updates (SignalR)

1. Status badge crossfade: `opacity + transform: scale` at 200ms. Badge scales `1.0 → 1.1 → 1.0` at 300ms. **[V2.1 micro-interaction]**
2. `HbcToast` (sync-status variant): `"[User Name] updated [Item Title] — [New Status]"`. Auto-dismiss when complete.
3. Update only the affected row via `queryClient.setQueryData` — no full table re-render.

### Pattern: Micro-Interaction Timing Specifications **[V2.1]**

All animations respect `prefers-reduced-motion`. When `prefers-reduced-motion: reduce`, transitions use `opacity` only (no transforms, no movement).

| Interaction | Duration | Easing |
|---|---|---|
| Page/route transition | 200ms cross-fade | `ease-out` |
| Sidebar expand/collapse | 250ms width | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Panel slide in/out | 250ms translateX | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Modal appear | 200ms opacity + scale | `ease-out` (scale 0.97→1.0) |
| Row hover background | 150ms | `ease` |
| Status badge change | 300ms opacity cross-fade | `ease-in-out` |
| Status badge pulse | 300ms scale 1.0→1.1→1.0 | `ease-in-out` |
| Skeleton shimmer sweep | 1500ms linear loop | `linear` |
| Focus Mode activation | 200ms opacity dim | `ease-out` |
| Connectivity bar expand | 100ms height | `ease` |
| Button loading state | 150ms opacity | `ease` |

---

## 13. Module-Specific UI Patterns

### 13.1 Go/No-Go Scorecards

**Landing View (`ToolLandingLayout`)**
- `responsibilityField="ballInCourt"` — responsibility heat map active **[V2.1]**
- KPI Cards: Total Active, Pending My Review, Approved This Month, Rejected This Month
- Columns: Project Name, Score (0–100), Recommendation badge (Go / No-Go / Conditional), Status, Submitted By, Ball in Court, Last Modified
- Default sort: Last Modified, descending

**Scorecard Detail (`DetailLayout`)**
- Tabs: Scorecard | Approval Chain | Change History
- Main column: Criterion scoring table + horizontal score bar (red 0–40 / amber 41–69 / green 70–100)
- Sidebar: Vertical approval chain stepper with avatar, name, role, decision, timestamp

**Create/Edit Scorecard (`CreateUpdateLayout`)**
- Focus Mode auto-activates on tablet **[V2.1]**
- Sections: Project Selection, Scoring Criteria (dynamic weighted rows), Narrative (`HbcRichTextEditor` + voice), Attachments, Related Items

---

### 13.2 RFIs

**Landing View (`ToolLandingLayout`)**
- `responsibilityField="ballInCourt"` — responsibility heat map active **[V2.1]**
- KPI Cards: Total Open, Overdue (danger if > 0), Average Response Time, Closed This Week
- Columns: RFI #, Subject, Status badge, Ball in Court, Due Date (red if overdue), Received Date, Responding Company, Cost Impact badge
- Frozen column: RFI #

**RFI Detail (`DetailLayout`)**
- Tabs: General | Responses | Related Items | Change History
- Main: Question (`HbcRichTextEditor` view-only), Official Response, Response thread
- Sidebar: Activity feed, Attachments, Related Drawings/Specs

**Create RFI (`CreateUpdateLayout`)**
- Focus Mode auto-activates on tablet **[V2.1]**
- Sections: General Info, Question (`HbcRichTextEditor` + voice **[V2.1]**), Distribution List, Related Items, Attachments

---

### 13.3 Punch List

**Landing View (`ToolLandingLayout`)**
- `responsibilityField="assigneeId"` — responsibility heat map active **[V2.1]**
- Dashboard tab: Status donut + Items by Company bar + Average Response Time + Total Overdue
- List tab: `HbcDataTable`
- Columns: Item #, Description, Status badge, Assignee, Company, Due Date, Location, Photo count

**Punch Item Detail (`DetailLayout`)**
- Tabs: General | Photos | Change History
- Main: Description, Location (drawing link), Inspection Type, Trade Responsible
- Sidebar: Photo grid, Activity feed, Attachments

---

### 13.4 Drawings

**Landing View (`ToolLandingLayout`)**
- View modes: Table (default) | Thumbnail Grid (toggle in CommandBar)
- Columns: Sheet #, Title, Revision, Discipline, Issue Date, Status badge
- Discipline filter chip row below CommandBar

**Drawing Viewer (`DetailLayout` — modified)**
- Main column expands to 12/12 columns (full width).
- Canvas: High-resolution PDF renderer, touch-optimized pan/zoom (two-finger pinch, one-finger pan). **[V2.1 gesture-first]**
- Toolbar: Sheet/Revision selector, Markup toggle, Layer filter, Activity log toggle
- Markup toolbar: Selection, Freehand pen, Shapes (cloud, rectangle, ellipse), Lines/arrows, Text, Measurement, Link pin (RFI/Punch Item)
- Drawings pre-cached by service worker when project is selected (cache-first strategy for drawing files) **[V2.1]**

---

### 13.5 Budget / Cost Management

**Landing View (`ToolLandingLayout`)**
- KPI Cards: Revised Budget, Forecasted Cost, Variance (color-coded), Approved Change Orders, Pending Change Orders
- Density auto-detects to Compact on desktop (wide viewport + mouse) **[V2.1]**
- Table: Expandable row hierarchy — cost code divisions → sub-codes
- Columns: Cost Code, Description, Original Budget, Revised Budget, Actual Cost, Forecast, Variance ($), Variance (%), Status badge
- Frozen columns: Cost Code + Description

> **Note:** Highest information density view in HB Intel. Horizontal scroll is expected. Compact density default for this tool reduces the frequency of horizontal scroll without eliminating any financial columns.

---

### 13.6 Daily Log

**Landing View** — Calendar/date-centric:
- Month calendar with date-picker header
- Each day cell: log status badge, weather icon, crew count
- Click navigates to that day's log

**Daily Log Entry (`CreateUpdateLayout`)**
- Focus Mode auto-activates on tablet **[V2.1]**
- Sections: Date + Weather (auto-populated), Work Log, Visitors, Deliveries, Safety Observations, General Notes (`HbcRichTextEditor` + **voice dictation** — high-value field input **[V2.1]**), Attachments
- All sections independently collapsible

---

### 13.7 Turnover to Operations

**Landing View (`ToolLandingLayout`)**
- `responsibilityField="pendingSignatoryId"` — responsibility heat map active **[V2.1]**
- KPI Cards: Total, In Progress, Completed, Pending Signatures
- Columns: Package Name, Project, Status badge, Phase, Created By, Target Handoff Date, Signature Status

**Turnover Detail (`DetailLayout`)**
- Tabs: Checklist | Agenda | Signatures | Change History
- Checklist: Grouped items with checkboxes, assignees, due dates
- Signatures: Stepper with signatory status + timestamps

**Create Turnover Package (`HbcTearsheet`)**
- Multi-step: Step 1 Package Details, Step 2 Checklist Items, Step 3 Meeting Agenda, Step 4 Signatories
- Uses `HbcTearsheet` due to multi-step nature

---

### 13.8 Documents

**Landing View (`ToolLandingLayout`)**
- Left column (3/12): `HbcTree` folder navigator
- Right column (9/12): File list `HbcDataTable` — Name, Type icon, Size, Modified Date, Modified By, Version
- Preview pane: Optional right `HbcPanel` (md) for selected file thumbnail + metadata

---

## 14. Mobile & PWA Adaptations

HB Intel is deployed as an installable Progressive Web App (PWA). The delivery architecture — service workers, Background Sync, Push Notifications, Application Badging — is what enables every field-first feature in this plan.

> **Critical context:** As of March 2026, **no current construction technology platform** implements a Web App Manifest for installability, service workers for offline caching, the Background Sync API, or the Push API. HB Intel's PWA architecture is a category-defining differentiator, not an enhancement.

### PWA Manifest **[V2.1 — Expanded]**

```json
{
  "name": "HB Intel",
  "short_name": "HB Intel",
  "description": "Hedrick Brothers Construction — Project Intelligence Platform",
  "theme_color": "#1E1E1E",
  "background_color": "#004B87",
  "display": "standalone",
  "orientation": "any",
  "start_url": "/",
  "categories": ["productivity", "business"],
  "icons": [
    { "src": "/assets/hb_icon_blueBG.jpg", "sizes": "192x192", "type": "image/jpeg", "purpose": "any" },
    { "src": "/assets/hb_icon_blueBG.jpg", "sizes": "512x512", "type": "image/jpeg", "purpose": "any" },
    { "src": "/assets/hb_icon_maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/assets/screenshot-wide.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" },
    { "src": "/assets/screenshot-narrow.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ],
  "shortcuts": [
    { "name": "RFIs", "url": "/rfis", "icons": [{ "src": "/assets/icon-rfi.png", "sizes": "96x96" }] },
    { "name": "Punch List", "url": "/punch-list", "icons": [{ "src": "/assets/icon-punch.png", "sizes": "96x96" }] },
    { "name": "Daily Log", "url": "/daily-log", "icons": [{ "src": "/assets/icon-daily-log.png", "sizes": "96x96" }] }
  ]
}
```

### Service Worker Caching Strategy **[V2.1]**

| Asset Type | Strategy | Rationale |
|---|---|---|
| App shell (HTML, CSS, JS, fonts, icons) | Cache-first + version-keyed cache | Instant load from cache. Updated via SW update lifecycle |
| Drawing files (PDFs, rendered tiles) | Cache-first + background revalidation | Pre-cached when project selected. Offline drawing access |
| API data (item lists, detail records) | Stale-while-revalidate | Instant render from cache, fresh data loads behind |
| Form submissions (POST requests) | Background Sync | Queue offline. Replay when connected |
| Photos and markup annotations | Background Sync with upload queue | Optimistic UI + upload when connected |
| Command Palette intent map (JSON) | Cache-first | Offline keyword navigation always available |
| Saved view definitions | IndexedDB + SW cache | Offline filter/sort access |

### Application Badging API **[V2.1]**

Use the Badging API to display the count of action-required items on the installed PWA icon. A superintendent's home screen showing "5" on the HB Intel icon communicates five pending items before the app is opened.

```ts
// Update badge whenever responsibility items count changes
if ('setAppBadge' in navigator) {
  navigator.setAppBadge(myResponsibilityItemsCount);
}
// Clear when all items addressed
if ('clearAppBadge' in navigator) {
  navigator.clearAppBadge();
}
```

### Push Notifications **[V2.1]**

Register for Push API to deliver workflow notifications directly to the device notification center. Notifications include action buttons:

```
"RFI #042 requires your response — due tomorrow"
[ Review Now ]  [ Remind in 1 Hour ]
```

Ball in Court transitions, approval requests, deadline warnings, and signature requests are the primary notification triggers.

### Installability Promotion **[V2.1]**

Display the custom install banner (triggered by `beforeinstallprompt`) after the user has visited 3+ times OR spent 5+ minutes in a session — not on first visit. Banner copy:

```
Install HB Intel for instant offline access,
push notifications, and a full-screen experience.
[ Install ]  [ Not now ]
```

### Responsive Behavior

| Viewport | Navigation | Layout Changes |
|---|---|---|
| Desktop `≥ 1024px` | Icon-rail sidebar | Standard 3-region layout |
| Tablet `768px – 1023px` | Bottom navigation bar | Sidebar hidden. Full-width content. `DetailLayout` sidebar stacks below |
| Mobile `< 768px` | Bottom navigation bar | Single-column. All multi-column rows stack vertically |
| `< 640px` | Bottom navigation | `HbcDataTable` transforms to card stack |

### Bottom Navigation Bar (Tablet & Mobile)

- Fixed to viewport bottom. Height: 56px. Background: `#1E1E1E`.
- 5 slots: 4 primary tool shortcuts + "More" bottom sheet.
- Active tab: Icon fill `#F37021`, label color `#F37021`.

### Field Mode (Dark Theme) **[V2.1 — Phase 4 First-Class Feature]**

Field Mode is completed in Phase 4. It is not a Phase 5 enhancement.

**Activation priority (highest to lowest):**
1. User's explicit manual override via `HbcUserMenu` toggle (`localStorage` key `hbc-field-mode: "light"` or `"dark"`)
2. System `prefers-color-scheme: dark` (auto-activates if no manual override)
3. Default: light theme

**Implementation:**
- `[data-theme="field"]` applied to `<html>` root element.
- All `--hbc-surface-*` and `--hbc-text-*` tokens resolve to Field Mode values (Section 3.1).
- The dark header (`#1E1E1E`) is unchanged.
- Status colors are the same sunlight-optimized values in both modes.
- `theme_color` meta tag updates dynamically when mode switches:
  ```html
  <meta name="theme-color" content="#1E1E1E">  <!-- Field Mode -->
  <meta name="theme-color" content="#004B87">  <!-- Light Mode -->
  ```
- All Storybook stories must pass in both `hbcLightTheme` and `hbcFieldTheme`.
- `prefers-reduced-motion` is respected in both modes.

### Mobile-Specific Adaptations

- **`HbcDataTable`:** Cards below 640px. Tap row to expand inline detail. "View Full Detail" link.
- **`HbcPanel`:** Bottom sheet on mobile. Full width.
- **`HbcModal`:** Full-screen on mobile.
- **`HbcCommandPalette`:** Full-screen on mobile. Bottom-up slide animation instead of center overlay.
- **Forms:** Single-column input layout below 768px.

### Offline Indicator (Replaced by Connectivity Bar)

The V2.0 `HbcBanner` offline indicator is **replaced** by the `HbcConnectivityBar` (Section 4.1). The connectivity bar is always visible and never pushes page content down. The `HbcBanner` component is still used for other persistent page-level messages — it is not deprecated, only removed from offline indicator duty.

---

## 15. NGX Modernization Strategy

### Build Modern From Day One

HB Intel introduces no legacy component patterns. Every component built in Phase 4 is the modern standard. There is no modernization backlog at launch.

### Modernization Tracker

| Tool | Modern UI Status | Notes |
|---|---|---|
| Go/No-Go Scorecards | ✅ Modern (Phase 4) | Responsibility heat map, Focus Mode, voice |
| RFIs | ✅ Modern (Phase 4) | Responsibility heat map, voice dictation |
| Punch List | ✅ Modern (Phase 4) | Responsibility heat map, card-stack mobile |
| Drawings | ✅ Modern (Phase 4) | Gesture-first canvas, offline pre-cache |
| Budget | ✅ Modern (Phase 4) | Auto-compact density, frozen columns |
| Daily Log | ✅ Modern (Phase 4) | Voice dictation (highest field value) |
| Turnover | ✅ Modern (Phase 4) | Responsibility heat map, Focus Mode |
| Documents | ✅ Modern (Phase 4) | Tree nav, offline service worker cache |

### Design Consistency Enforcement

- `enforce-hbc-tokens` ESLint rule active on all `styles.ts` files.
- No module may import colors, fonts, or spacing from outside `@hbc/ui-kit`.
- PR introducing a new UI component requires: Storybook story (Default + AllVariants + FieldMode + A11yTest). No exceptions.
- All components must pass in both `hbcLightTheme` and `hbcFieldTheme` before merge.
- `DESIGN_SYSTEM.md` in `packages/ui-kit/` documents all authoring rules.

---

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

---

## 17. Storybook Configuration & Testing

### Storybook Setup — `preview.tsx` **[V2.1 — Field Mode story support]**

```tsx
import type { Preview } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { hbcLightTheme, hbcFieldTheme } from '../src/theme';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'HB Intel theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'field', title: 'Field Mode (Dark)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'field' ? hbcFieldTheme : hbcLightTheme;
      const bg = context.globals.theme === 'field' ? '#0F1419' : '#FAFBFC';
      return (
        <FluentProvider theme={theme}>
          <div style={{ padding: '24px', background: bg, minHeight: '100vh' }}>
            <Story />
          </div>
        </FluentProvider>
      );
    },
  ],
};

export default preview;
```

### Required Story Structure Per Component **[V2.1]**

Every component must export four named stories:

1. **`Default`** — Most common use case with representative props
2. **`AllVariants`** — Every visual variant, size, and state in one view
3. **`FieldMode`** — **[V2.1]** The `Default` story rendered with `hbcFieldTheme` and dark background
4. **`A11yTest`** — Accessibility-focused story with explicit `aria-label` props

### Automated Testing Requirements **[V2.1]**

| Test Type | Tool | Pass Criteria |
|---|---|---|
| Accessibility | `@storybook/addon-a11y` | Zero WCAG 2.2 AA violations on all stories in both themes |
| Contrast (light) | `addon-a11y` | All text ≥ 4.5:1 ratio (normal), ≥ 3:1 (large/icons) |
| Contrast (Field Mode) | `addon-a11y` | All text ≥ 7:1 ratio (target AAA — sunlight visibility requirement) |
| Dual-channel status | Manual review | Every `HbcStatusBadge` variant shows both icon AND color in both themes |
| Animation performance | Browser DevTools | All animations at 60fps on mid-range hardware |
| Bundle size | `vite-bundle-visualizer` | All chunks under 500KB. ECharts in own chunk |
| TypeScript | `tsc --noEmit` | Zero type errors |
| Touch targets | Manual / Storybook controls | Touch density tier: all interactive elements ≥ 56×56px hit area |

---

## 18. UI Deficiencies & Mitigation Strategies **[V2.1 — Updated]**

| Deficiency Risk | Industry Problem | HB Intel Mitigation |
|---|---|---|
| **Horizontal Scroll Overload** | Financial tables require excessive horizontal scroll | Frozen columns, column configurator, auto-Compact density on wide desktop, card-stack on mobile |
| **Information Density Overload** | Tables cause visual overwhelm — especially on tablets | Auto-adaptive density (Compact/Standard/Touch). No manual configuration required. Responsibility heat map provides instant visual priority |
| **Legacy-Modern Visual Seams** | Inconsistent UI between modernized and legacy modules | No legacy modules. All tools built modern in Phase 4. ESLint enforcement |
| **Field Color Illegibility** | Standard web colors unreadable in direct sunlight (63% of field users affected) | **[V2.1]** Sunlight-optimized status colors. Field Mode dark theme. Warm off-white light surfaces. Target AAA contrast in Field Mode |
| **Color-Only Status Encoding** | Colorblind users (8% of males) and sunlight glare make color-only status ambiguous | **[V2.1]** Dual-channel encoding: every status badge shows color + icon shape. Never color alone |
| **No Offline Capability** | All 7 analyzed platforms rely on native apps for offline. Web shows error page | **[V2.1]** Service worker caching. Background Sync. Connectivity bar ambient state. Offline drawing pre-cache. No "you are offline" error pages |
| **Steep Learning Curve** | 3–6 month proficiency timeline documented across all platforms | **[V2.1]** Command Palette (`Cmd+K`) with AI navigation bypasses the need to learn module locations entirely |
| **Gloved-Hand Input Failure** | 44px touch targets insufficient for gloved construction field use | **[V2.1]** 56×56px targets in Touch density tier. Voice dictation on text fields |
| **Mobile-Web UI Divergence** | Separate design systems for mobile and web | `@hbc/ui-kit` is the single token source. Field Mode serves mobile-first needs on the web platform |
| **Primary Button Contrast** | Orange-on-white WCAG risk | `HbcButton` primary uses white text on `#F37021`. Verified ≥ 4.5:1 in addon-a11y. Fallback: `#D4621A` |
| **No Ambient Connectivity Feedback** | "You are offline" modal dialogs interrupt workflow | **[V2.1]** Persistent 2px connectivity bar. Offline-aware interactive elements. No disruptive modal dialogs |

---

## 19. Granular UI Recommendations **[V2.1 — Updated]**

Items promoted from Phase 5 to Phase 4 are marked **[PROMOTED]**. New items are marked **[V2.1]**.

| # | Recommendation | Effort | Timing | Rationale |
|---|---|---|---|---|
| 1 | **Responsive Table Collapse** — Secondary columns collapse into expandable row detail on viewports < 1024px | High | Phase 5 | Card-stack (Phase 4) covers < 640px. This covers 640–1024px tablet range |
| 2 | ~~**Full Dark Mode Activation**~~ | — | **[PROMOTED to Phase 4]** | Now called Field Mode. Completed in Phase 4 per V2.1 decisions |
| 3 | ~~**Global UI Density Control**~~ | — | **[PROMOTED to Phase 4]** | Auto-adaptive density system completed in Phase 4 per V2.1 decisions |
| 4 | **Standardize Panel-Based Detail Navigation** — All tools default to opening item details in `HbcPanel` (lg). Full page via "Open Full Page" link | High | Phase 5 | Maintains list context. Reduces navigation steps. Procore's most impactful recent NGX improvement |
| 5 | **Primary Button Contrast Audit** — Formal WCAG AA audit on `#F37021` white text | Low | Phase 4 (end) | Run before launch. Adjust to `#D4621A` if needed |
| 6 | **Unified Mobile-Web Token Layer** — Future native mobile app imports same `@hbc/ui-kit` tokens | Medium | Mobile Phase | Prevents divergence from day one |
| 7 | **Quick Capture FAB (Mobile)** — Persistent floating action button for one-tap photo capture + auto-link to active project | Medium | Phase 5 | High-value field workflow. Reduces documentation friction |
| 8 | ~~**AI Assist Panel**~~ | — | **[PROMOTED to Phase 4]** | Implemented as `HbcCommandPalette` per V2.1 decisions |
| 9 | **[V2.1] Spatial Drawing Cross-Module Linking** — One-tap pushpin annotations that suggest relevant RFIs/punch items based on drawing location (spec section, grid coordinates) | High | Phase 5 | Addresses Procore's most-requested missing feature (2017 to present). Location-aware suggestions reduce manual search |
| 10 | **[V2.1] Drawing Offline Pre-Cache UI** — Progress indicator showing drawing set download status after project selection | Low | Phase 5 | Service worker caching architecture is Phase 4. The progress UI can be a Phase 5 polish item |
| 11 | **[V2.1] Proactive AI Contextual Suggestions** — When viewing a drawing, AI surfaces: "3 open punch items on this sheet — tap to highlight." When viewing budget, AI surfaces cost codes exceeding forecast | High | Phase 6 | Requires AI integration maturity. Command Palette (Phase 4) establishes the AI foundation |
| 12 | **[V2.1] Org-Level View Templates** — Admin-defined organization saved views that auto-populate for new users as their default views | Medium | Phase 5 | Three-tier view architecture is Phase 4. Admin UI for managing org templates is Phase 5 |

---

## 20. Phase 4 Completion Checklist **[V2.1 — Updated]**

All items must pass. There are no optional items.

### Design System

- [ ] All token files in `src/theme/`: `tokens.ts`, `theme.ts`, `typography.ts`, `grid.ts`, `animations.ts`, `elevation.ts`, `density.ts`, `useHbcTheme.ts`, `useConnectivity.ts`, `useDensity.ts`, `README.md`
- [ ] `hbcBrandVariants` 16-shade ramp verified in Storybook theme switcher
- [ ] All sunlight-optimized status color ramps defined (green `#00C896`, red `#FF4D4D`, amber `#FFB020`, info `#3B9FFF`, gray `#8B95A5`) **[V2.1]**
- [ ] Warm off-white `#FAFBFC` applied to `--hbc-surface-1` (page background, table background) **[V2.1]**
- [ ] `hbcFieldTheme` (Field Mode dark) token overrides complete and verified in Storybook **[V2.1]**
- [ ] `enforce-hbc-tokens` ESLint rule active and passing on all `styles.ts` files
- [ ] Dual-shadow elevation system (Level 0–3) defined in `elevation.ts` **[V2.1]**
- [ ] All animations defined in `animations.ts` with `prefers-reduced-motion` fallbacks **[V2.1]**

### Global Application Shell

- [ ] `HbcConnectivityBar` renders above dark header (2px green/amber/red, expands to 4px when offline/syncing) **[V2.1]**
- [ ] Connectivity bar driven by `navigator.onLine` events and service worker `postMessage` for sync state **[V2.1]**
- [ ] Offline-aware interactive elements display `CloudOffline` icon when network unavailable **[V2.1]**
- [ ] `HbcHeader` renders all elements at correct 56px height with `#1E1E1E` background
- [ ] `+ Create` button color is `#F37021`
- [ ] `HbcUserMenu` includes Field Mode toggle with correct persistence to `localStorage` **[V2.1]**
- [ ] Field Mode auto-activates via `prefers-color-scheme: dark` when no manual override **[V2.1]**
- [ ] SPFx Application Customizer bundle under 250KB
- [ ] Application Customizer renders correctly in SharePoint without conflicts
- [ ] `HbcSidebar` collapses to 56px / expands to 240px with `cubic-bezier(0.4, 0, 0.2, 1)` timing **[V2.1]**
- [ ] Sidebar role-based group visibility driven by Azure AD membership
- [ ] Bottom navigation renders on viewports < 1024px

### Page Layouts

- [ ] `ToolLandingLayout`, `DetailLayout`, `CreateUpdateLayout` render correctly in both light and Field Mode **[V2.1]**
- [ ] `CreateUpdateLayout` Focus Mode auto-activates on touch/tablet (`pointer: coarse`) **[V2.1]**
- [ ] `CreateUpdateLayout` Focus Mode toggle button visible on desktop **[V2.1]**
- [ ] Focus Mode animations (sidebar collapse, header fade, bg dim) all within V2.1 timing specs **[V2.1]**
- [ ] `CreateUpdateLayout` sticky footer remains visible during form scroll

### Components

- [ ] `HbcStatusBadge` — dual-channel encoding: all 5 variants show color + paired icon in both sizes and both themes **[V2.1]**
- [ ] `HbcConnectivityBar` — all 3 states, correct colors, correct expand animation **[V2.1]**
- [ ] `HbcCommandPalette` — opens via `Cmd+K`/`Ctrl+K`, keyword navigation offline, Anthropic API natural language queries online, result action types (Navigate/Action/AI Query) clearly labeled **[V2.1]**
- [ ] `HbcTypography` — all 9 intents in both themes
- [ ] `HbcEmptyState` — renders with icon, title, description, optional actions
- [ ] `HbcErrorBoundary` — catches errors without crashing the page
- [ ] `HbcButton` — all 4 variants, 3 sizes, auto-scale in Touch density tier **[V2.1]**
- [ ] `HbcTextArea` and `HbcRichTextEditor` — voice dictation button renders and activates Web Speech API. Graceful fallback when API unavailable **[V2.1]**
- [ ] All other `HbcInput` suite components — label, error state, disabled, required indicator
- [ ] `HbcForm` + `HbcFormSection` — collapsible sections, inline validation, sticky footer
- [ ] `HbcDropzone` — drag-over state, file list, progress, file-level errors
- [ ] `HbcPanel` — all 3 widths, `cubic-bezier(0.4, 0, 0.2, 1)` slide-in, focus trap, bottom-sheet on mobile **[V2.1]**
- [ ] `HbcModal` — all 3 widths, backdrop, focus trap, Escape close
- [ ] `HbcTearsheet` — full-width, multi-step navigation
- [ ] `HbcCommandBar` — search, filter chips, three-tier saved view selector, density control showing auto-detected tier **[V2.1]**
- [ ] `HbcDataTable` — adaptive density auto-detects correctly on mouse vs. touch devices **[V2.1]**
- [ ] `HbcDataTable` — manual density override persisted per tool to `localStorage` **[V2.1]**
- [ ] `HbcDataTable` — card-stack transformation below 640px viewport **[V2.1]**
- [ ] `HbcDataTable` — responsibility heat map (4px orange border + warm bg) on `responsibilityField` rows **[V2.1]**
- [ ] `HbcDataTable` — layout-matched shimmer skeletons (not generic spinner) during data fetch **[V2.1]**
- [ ] `HbcDataTable` — data freshness dashed/solid top border indicator **[V2.1]**
- [ ] `HbcDataTable` — column configurator, saved views (three-tier), inline editing, row selection, 60fps virtualization
- [ ] `HbcDataTable` — Touch density tier: 56×56px touch targets on all row interactive elements **[V2.1]**
- [ ] `HbcChart` — lazy-loaded, HBC color palette, click-to-filter
- [ ] All messaging: `HbcBanner`, `HbcToast` (3-category only), `HbcTooltip`, `HbcSpinner`
- [ ] All navigation: `HbcBreadcrumbs`, `HbcTabs`, `HbcPagination`, `HbcTree`, `HbcSearch`

### Saved Views

- [ ] Three-tier scope implemented: personal / project / organization **[V2.1]**
- [ ] `HBIntel_UserViews` SharePoint list schema includes `Scope` and `ProjectId` columns **[V2.1]**
- [ ] Deep-link URL generation (base64-encoded view state in query param) **[V2.1]**
- [ ] Navigating to a deep-link URL restores exact filter/sort/column state **[V2.1]**
- [ ] View definitions cached in IndexedDB via service worker for offline access **[V2.1]**

### Testing

- [ ] Zero WCAG 2.2 AA violations in both `hbcLightTheme` and `hbcFieldTheme` across all stories **[V2.1]**
- [ ] All text in light mode: ≥ 4.5:1 contrast ratio
- [ ] All text in Field Mode: ≥ 7:1 contrast ratio (AAA target for sunlight visibility) **[V2.1]**
- [ ] `HbcButton` primary (`#F37021`) passes 4.5:1 with white text — adjust to `#D4621A` if not
- [ ] `HbcDataTable` Touch tier: all interactive elements verified ≥ 56×56px hit area **[V2.1]**
- [ ] `HbcDataTable` density auto-detection tested on mouse device (Chrome DevTools), touch simulation, and real tablet **[V2.1]**
- [ ] `HbcDataTable` 60fps virtualization with 500 rows (verified via DevTools Performance panel)
- [ ] All `HbcStatusBadge` variants manually verified: icon shape visible independent of color (verify by viewing in grayscale) **[V2.1]**
- [ ] Voice dictation tested in Chrome (full support) and Safari (partial support) — graceful fallback confirmed in Firefox (no support) **[V2.1]**
- [ ] All Storybook stories have: `Default`, `AllVariants`, `FieldMode`, `A11yTest` exports **[V2.1]**
- [ ] ECharts in its own chunk, verified via `vite-bundle-visualizer`
- [ ] All chunks under 500KB

### Documentation

- [ ] One markdown file per component in `docs/reference/ui-kit/` — each includes Field Mode behavior section **[V2.1]**
- [ ] `ADR 0008` at `docs/architecture/adr/0008-ui-kit-v2-design-system.md`
- [ ] `ADR 0009` at `docs/architecture/adr/0009-field-first-ui-upgrades.md` **[V2.1]**
- [ ] `DESIGN_SYSTEM.md` in `packages/ui-kit/` with all authoring rules
- [ ] `src/theme/README.md` completed with token extension guide
- [ ] NGX Modernization tracker in `docs/architecture/ngx-tracker.md`

### PWA

- [ ] `manifest.json` complete: `display: standalone`, `orientation: any`, `categories`, maskable icon, screenshots, shortcuts **[V2.1]**
- [ ] Service worker registered. Caching strategies implemented for shell, drawings, API data, form submissions **[V2.1]**
- [ ] Background Sync API implemented for offline form submissions **[V2.1]**
- [ ] Push Notifications registered and delivering workflow events (BIC transitions, approvals, deadlines) **[V2.1]**
- [ ] Application Badging API updating badge count with responsibility item count **[V2.1]**
- [ ] Installability banner displays after 3+ visits or 5+ minutes (not on first visit) **[V2.1]**
- [ ] `HbcConnectivityBar` driven by `navigator.onLine` + service worker sync state **[V2.1]**
- [ ] Field Mode `theme-color` meta tag updates dynamically on mode switch **[V2.1]**
- [ ] Field Mode toggle in `HbcUserMenu` functional. Preference persisted. `prefers-color-scheme` respected **[V2.1]**

---

*PH4-UI-Design-Plan.md V2.1 — Hedrick Brothers Construction · HB Intel Platform · March 2026*
*Supersedes V2.0. Governed by HB-Intel-Blueprint-V4.md and CLAUDE.md v1.2.*
*V2.1 incorporates competitive analysis of 7 leading construction technology platforms (March 2026).*
*All deviations from locked decisions require a formal ADR and sign-off.*