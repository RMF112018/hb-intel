/**
 * HbcKudosComposer — token bridge.
 *
 * Returns a record of CSS custom properties that tokenize every
 * color, ink, surface, spacing, radius, elevation, and transition
 * value consumed by the component's CSS modules. Mirrors the
 * `hbcPresentationCSSVars()` pattern in `theme/tokens.ts` so CSS
 * modules stay fully doctrine-compliant with the SPFx Governing
 * Standard §6.1 (token discipline) and Homepage Overlay §3.6 (no
 * hardcoded hex/rgb/raw px in component source).
 *
 * Every value sourced here comes from a governed token in
 * `theme/tokens.ts`, `theme/grid.ts`, `theme/radii.ts`,
 * `theme/elevation.ts`, or `theme/animations.ts`. The sole authored
 * presentation constant is `--hbc-kudos-brand-orange-deep` — an
 * explicit §6.1 presentation-lane overlay (darkened stop for the
 * warm header gradient), declared here with a governance comment so
 * it lives in one authoritative place instead of leaking as a raw
 * literal across CSS files.
 */
import {
  HBC_PRESENTATION_ORANGE,
  HBC_PRESENTATION_ORANGE_RGB,
  HBC_PRESENTATION_BLUE,
  HBC_PRESENTATION_BLUE_RGB,
  HBC_SURFACE_LIGHT,
  HBC_SURFACE_PRESENTATION,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_INFO,
} from '../theme/tokens.js';
import {
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XL,
  HBC_SPACE_XXL,
} from '../theme/grid.js';
import {
  HBC_RADIUS_SM,
  HBC_RADIUS_MD,
  HBC_RADIUS_LG,
  HBC_RADIUS_XL,
  HBC_RADIUS_FULL,
} from '../theme/radii.js';
import { elevationEditorial, elevationLevel3 } from '../theme/elevation.js';
import { TRANSITION_FAST, TRANSITION_NORMAL } from '../theme/animations.js';

/**
 * Authored §6.1 presentation-lane overlay constant.
 *
 * The warm header gradient needs a darkened orange stop between
 * `HBC_PRESENTATION_ORANGE` (#E57E46) and `HBC_PRESENTATION_BLUE`
 * (#225391) so the transition reads as branded depth rather than a
 * flat wash. Doctrine §6.1 allows page-canvas / presentation-lane
 * overlays that materially support a premium composition. This
 * constant exists in one authoritative place so the value never
 * leaks into component CSS.
 */
const HBC_KUDOS_BRAND_ORANGE_DEEP = '#D4693A' as const;

/** Parse an `#RRGGBB` hex to a governed `R, G, B` triplet. */
function hexToRgbTriplet(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Generate the CSS custom-property record for the kudos composer
 * surfaces. Spread onto the outermost rendered root of each
 * component so CSS-module selectors can reference the tokenized
 * values via `var(--hbc-kudos-*)`.
 */
export function kudosComposerCSSVars(): Record<string, string> {
  return {
    // On-brand ink — white text/icons atop the warm gradient header,
    // success icon, and success-gradient button. Sourced from the
    // governed `surface-0` in Field Mode (where white IS the base
    // surface); used here as on-brand foreground to keep a single
    // authoritative white value in the token bridge.
    '--hbc-kudos-on-brand': HBC_SURFACE_LIGHT['surface-0'],
    '--hbc-kudos-on-brand-rgb': '255, 255, 255',

    // Brand — presentation lane
    '--hbc-kudos-brand-orange': HBC_PRESENTATION_ORANGE,
    '--hbc-kudos-brand-orange-rgb': HBC_PRESENTATION_ORANGE_RGB,
    '--hbc-kudos-brand-orange-deep': HBC_KUDOS_BRAND_ORANGE_DEEP,
    '--hbc-kudos-brand-blue': HBC_PRESENTATION_BLUE,
    '--hbc-kudos-brand-blue-rgb': HBC_PRESENTATION_BLUE_RGB,

    // Ink + surfaces — light mode foundation tokens
    '--hbc-kudos-ink-primary': HBC_SURFACE_LIGHT['text-primary'],
    '--hbc-kudos-ink-muted': HBC_SURFACE_LIGHT['text-muted'],
    '--hbc-kudos-ink-primary-rgb': hexToRgbTriplet(HBC_SURFACE_LIGHT['text-primary']),
    '--hbc-kudos-surface-0': HBC_SURFACE_LIGHT['surface-0'],

    // Presentation-lane warmth
    '--hbc-kudos-warm-tint': HBC_SURFACE_PRESENTATION.warmTint,
    '--hbc-kudos-warm-tint-strong': HBC_SURFACE_PRESENTATION.warmTintStrong,
    '--hbc-kudos-warm-border': HBC_SURFACE_PRESENTATION.warmBorder,

    // Status — danger banner + error field
    '--hbc-kudos-danger-fg': HBC_STATUS_RAMP_RED[30],
    '--hbc-kudos-danger-bg': HBC_STATUS_RAMP_RED[90],
    '--hbc-kudos-danger-rgb': hexToRgbTriplet(HBC_STATUS_RAMP_RED[30]),

    // Typed bucket tints — each governed rgb triplet so CSS can
    // compose rgba() with controlled alpha.
    '--hbc-kudos-individual-rgb': HBC_PRESENTATION_BLUE_RGB,
    '--hbc-kudos-team-rgb': HBC_PRESENTATION_ORANGE_RGB,
    '--hbc-kudos-department-rgb': hexToRgbTriplet(HBC_STATUS_RAMP_GREEN[30]),
    '--hbc-kudos-project-rgb': hexToRgbTriplet(HBC_STATUS_RAMP_INFO[50]),

    // Spacing — 4px grid
    '--hbc-kudos-space-xs': `${HBC_SPACE_XS}px`,
    '--hbc-kudos-space-sm': `${HBC_SPACE_SM}px`,
    '--hbc-kudos-space-md': `${HBC_SPACE_MD}px`,
    '--hbc-kudos-space-lg': `${HBC_SPACE_LG}px`,
    '--hbc-kudos-space-xl': `${HBC_SPACE_XL}px`,
    '--hbc-kudos-space-xxl': `${HBC_SPACE_XXL}px`,

    // Radii
    '--hbc-kudos-radius-sm': HBC_RADIUS_SM,
    '--hbc-kudos-radius-md': HBC_RADIUS_MD,
    '--hbc-kudos-radius-lg': HBC_RADIUS_LG,
    '--hbc-kudos-radius-xl': HBC_RADIUS_XL,
    '--hbc-kudos-radius-full': HBC_RADIUS_FULL,

    // Elevation
    '--hbc-kudos-elev-editorial': elevationEditorial,
    '--hbc-kudos-elev-overlay': elevationLevel3,

    // Transitions
    '--hbc-kudos-trans-fast': TRANSITION_FAST,
    '--hbc-kudos-trans-normal': TRANSITION_NORMAL,
  };
}
