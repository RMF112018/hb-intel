# UI Kit Visual Language Guide

> **Doc Classification:** Living Reference — WS1-T10 design system reference documenting the visual language decisions behind `@hbc/ui-kit`.

**Audience:** Designers and developers extending the kit or making visual decisions consistently
**Source of Truth:** `@hbc/ui-kit/theme` token files (`tokens.ts`, `radii.ts`, `typography.ts`, `elevation.ts`, `animations.ts`, `grid.ts`, `hierarchy.ts`, `density.ts`)

---

## Color System

### Brand Palette

| Token | Value | Use For |
|-------|-------|---------|
| `HBC_PRIMARY_BLUE` | `#004B87` | Brand identity, primary actions, focus borders |
| `HBC_ACCENT_ORANGE` | `#F37021` | CTA highlights, accent elements |
| `hbcBrandRamp` | 16-shade HSL ramp (shades 10–160) | Brand color variations; shade 80 = primary |

### Status Colors (V2.1 Sunlight-Optimized)

| Status | Color | Light Ramp | Use For |
|--------|-------|-----------|---------|
| Success | `#00C896` | `HBC_STATUS_RAMP_GREEN` | On-track, completed, online |
| Warning | `#FFB020` | `HBC_STATUS_RAMP_AMBER` | At-risk, syncing, attention needed |
| Error | `#FF4D4D` | `HBC_STATUS_RAMP_RED` | Critical, failed, offline |
| Info | `#3B9FFF` | `HBC_STATUS_RAMP_INFO` | In-progress, informational |
| Neutral | `#8B95A5` | `HBC_STATUS_RAMP_GRAY` | Pending, draft, inactive |

Each ramp has 5 stops (10/30/50/70/90) for background tints and dark-mode variants.

### Interactive State Colors

| Token | Value | Use For |
|-------|-------|---------|
| `HBC_ACCENT_ORANGE_HOVER` | `#E06018` | Hover on accent/CTA buttons |
| `HBC_ACCENT_ORANGE_PRESSED` | `#BF5516` | Pressed on accent/CTA buttons |
| `HBC_DANGER_HOVER` | `#E04444` | Hover on danger/destructive buttons |
| `HBC_DANGER_PRESSED` | `#CC3C3C` | Pressed on danger/destructive buttons |

### Surface Colors

Three complete surface token sets for light, dark, and field modes:

| Token | Light | Field | Use For |
|-------|-------|-------|---------|
| `surface-0` | `#FFFFFF` | `#0F1419` | Page background |
| `surface-1` | `#FAFBFC` | `#1A2332` | Card/panel background |
| `surface-2` | `#F0F2F5` | `#243040` | Nested surface, alternating rows |
| `surface-3` | `#E4E7EB` | `#2E3D50` | Hover states, selected rows |
| `surface-active` | `#E8F1F8` | `#1E3A5F` | Active/selected card highlight |

**Design decision:** Field mode uses deep blue-gray tones (not pure black) for better depth perception in outdoor conditions. Contrast ratios meet WCAG AAA (7:1) per T05.

---

## Shape Language

Intent-based radius scale. Every component uses these tokens — no hardcoded pixel values.

| Token | Value | Intent | Components |
|-------|-------|--------|-----------|
| `HBC_RADIUS_NONE` | `0px` | Sharp | Tables, dense lists, data rows |
| `HBC_RADIUS_SM` | `2px` | Tight | Inline badges, score segments, small tags |
| `HBC_RADIUS_MD` | `4px` | Interactive | Buttons, inputs, search, pagination, toolbars |
| `HBC_RADIUS_LG` | `6px` | Container | Toasts, toolbars, sub-panels, score bars |
| `HBC_RADIUS_XL` | `8px` | Surface | Cards, modals, popovers, photos, drawing viewer |
| `HBC_RADIUS_FULL` | `50%` | Circular | FABs, spinners, avatars |

**Design decision:** Sharp (0px) for data-dense surfaces where every pixel counts. Moderate rounding for interactive controls. Softer rounding for cards and overlays. This creates visual rhythm between density and containment.

---

## Surface Roles

Seven canonical surface roles define visual treatment per layer. See `HBC_SURFACE_ROLES` in `tokens.ts`.

| Surface | Background | Elevation | Radius | Use For |
|---------|-----------|-----------|--------|---------|
| Base canvas | `surface-0` | Level 0 | none | Page background |
| Secondary canvas | `surface-1` | Level 0 | none | Sidebar, drawer, secondary panels |
| Cards | `surface-0` | Level 1 | xl | Grouped content units |
| Inset panels | `surface-2` | Level 0 | lg | Contained sub-sections |
| Toolbars | `surface-1` | Level 0 | none | Command and filter areas |
| Overlays | `surface-0` | Level 3 | xl | Dialogs, popovers, dropdowns |
| Focused work zones | `surface-0` | Level 2 | xl | Detail areas requiring focus |

---

## Typography Scale

Intent-based type scale with semantic naming. All components use these tokens via `hbcTypeScale`.

| Intent | Size | Weight | Line Height | Letter Spacing | Use For |
|--------|------|--------|-------------|----------------|---------|
| `display` | 2rem (32px) | 700 | 1.25 | -0.02em | Dashboard headers, feature banners |
| `heading1` | 1.5rem (24px) | 700 | 1.3 | -0.01em | Section headers, page titles |
| `heading2` | 1.25rem (20px) | 600 | 1.35 | 0 | Card headers, subpage titles |
| `heading3` | 1rem (16px) | 600 | 1.4 | 0 | Panel headers, modal titles |
| `heading4` | 0.875rem (14px) | 600 | 1.4 | 0 | Table headers, toolbar labels |
| `body` | 0.875rem (14px) | 400 | 1.5 | 0 | Primary content text |
| `bodySmall` | 0.75rem (12px) | 400 | 1.5 | 0 | Secondary content, captions |
| `label` | 0.75rem (12px) | 500 | 1.4 | 0.01em | Labels, metadata, timestamps |
| `code` | 0.8125rem (13px) | 400 | 1.6 | 0 | Code blocks, technical IDs |

**Design decision:** The `heading4` and `body` intents share the same size (14px) but differ by weight (600 vs 400). This creates hierarchy through weight contrast, not size — critical for the 12 content levels in T04.

**Font families:**
- Primary: `"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif`
- Monospace: `"Courier New", "Cascadia Code", "Fira Code", "Consolas", monospace`

---

## Spacing Scale

4px base unit with 6 named stops.

| Token | Value | Use For |
|-------|-------|---------|
| `HBC_SPACE_XS` | 4px | Tight spacing, icon margins |
| `HBC_SPACE_SM` | 8px | Compact spacing, inline gaps |
| `HBC_SPACE_MD` | 16px | Standard vertical/horizontal padding |
| `HBC_SPACE_LG` | 24px | Section spacing, card padding, gutters |
| `HBC_SPACE_XL` | 32px | Large spacing, section breaks |
| `HBC_SPACE_XXL` | 48px | Hero spacing, page-level padding |

**Responsive breakpoints:**

| Token | Value | Columns | Gutter |
|-------|-------|---------|--------|
| `BREAKPOINT_MOBILE` | 768px | 4 | 16px |
| `BREAKPOINT_TABLET` | 1024px | 8 | 24px |
| `BREAKPOINT_DESKTOP` | 1200px | 12 | 24px |
| `BREAKPOINT_WIDE` | 1600px | 12 | 32px |

---

## Motion Patterns

### Transition Timing

| Token | Duration | Use For |
|-------|----------|---------|
| `TRANSITION_FAST` | 150ms | Button hover, icon transitions |
| `TRANSITION_NORMAL` | 250ms | Panel open/close, page transitions |
| `TRANSITION_SLOW` | 400ms | Complex layout animations |

### Animation Keyframes

| Keyframe | Use For |
|----------|---------|
| `fadeIn` | Empty states, illustrations |
| `slideInRight` | Side panels, drawers |
| `slideInUp` | Banners, toasts, tearsheets |
| `slideInFromBottom` | Bottom nav, mobile modals |
| `scaleIn` | Desktop modals, command palette |
| `pulse` | Connectivity indicator, loading badges |
| `shimmer` | Skeleton loading states |

### Reduced-Motion Compliance

All animations respect `prefers-reduced-motion: reduce`. Under this media query, animation durations are set to `0ms` — providing instant state changes without motion.

```tsx
import { usePrefersReducedMotion, useReducedMotionStyles } from '@hbc/ui-kit';

// Hook approach
const prefersReducedMotion = usePrefersReducedMotion();

// Griffel styles approach
const reducedMotionStyles = useReducedMotionStyles();
```

---

## Elevation / Depth System

5-level dual-shadow scale with field-mode variants (opacity increased ~50%).

| Level | Name | Shadow | Use For |
|-------|------|--------|---------|
| 0 | Base | none | Page background, flat content |
| 1 | Card | Subtle dual-shadow | Cards, table containers |
| 2 | Floating | Medium dual-shadow | Primary cards, sticky headers, popovers |
| 3 | Overlay | Strong dual-shadow | Side panels, drawers, dropdowns |
| 4 | Blocking | Deepest dual-shadow | Modal dialogs, confirmation overlays |

### Z-Index Layers

| Layer | Value | Use For |
|-------|-------|---------|
| `content` | 0 | Default stacking |
| `stickyFooter` | 50 | Sticky form footer |
| `sidebar` | 100 | Sidebar navigation |
| `header` | 200 | Fixed header |
| `bottomNav` | 300 | Mobile bottom nav |
| `popover` | 1000 | Dropdowns, flyouts |
| `panel` | 1100 | Slide-in panels |
| `modal` | 1200 | Dialogs, tearsheets |
| `commandPalette` | 1250 | Command palette |
| `toast` | 1300 | Toast notifications |

**Design decision:** Z-index values have 100+ gaps between major layers to allow intermediate surfaces without reindexing.

---

## Extending the Design System

### Adding a new token

1. Define in the appropriate file under `packages/ui-kit/src/theme/`
2. Export from `theme/index.ts` barrel
3. Re-export from `src/index.ts` if needed by consumers
4. Update `theme/README.md` with the new token
5. Update this guide if the token represents a new design decision

### Maintaining this guide

This guide references token names, not hardcoded values. When token values change, this guide remains accurate. When new token categories are introduced, add a section here documenting the design intent.

---

## Related Documents

- [Usage and Composition Guide](./UI-Kit-Usage-and-Composition-Guide.md) — developer guide for building pages
- [Field-Readability Standards](./UI-Kit-Field-Readability-Standards.md) — density and field constraints
- [Visual Hierarchy and Depth Standards](./UI-Kit-Visual-Hierarchy-and-Depth-Standards.md) — hierarchy rules
- [Theme README](../../packages/ui-kit/src/theme/README.md) — token reference tables

---

*Visual Language Guide v1.0 — WS1-T10 (2026-03-16)*
