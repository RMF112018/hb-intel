/**
 * People & Culture Public — local design tokens.
 *
 * §6.1 governance: PC-specific accent values that do not exist in the
 * shared HP_* token set. All shared spacing, radius, and border values
 * flow from `../../homepage/tokens.js`.
 */
import {
  HP_SPACE,
  HP_RADIUS,
  HP_BORDER,
  HP_CTA,
  HP_TEXT_OPACITY,
  HP_FOCUS,
} from '../../homepage/tokens.js';

// §6.1 — PC-specific brand accents
export const PC_COLOR = {
  heading: '#0a1b33',
  brandBlue: '#225391',
  warmAccent: '#c2410c',
  bodyText: `rgba(26, 26, 26, ${HP_TEXT_OPACITY.secondary})`,
  supportingBody: 'rgba(26, 26, 26, 0.72)',
  placeholderBg: 'rgba(34, 83, 145, 0.08)',
  cardGradientStart: 'rgba(34, 83, 145, 0.05)',
  badgeBg: 'rgba(34, 83, 145, 0.1)',
  pinnedBadgeBg: 'rgba(226, 113, 37, 0.12)',
  emptyBorder: 'rgba(10, 27, 51, 0.2)',
  emptyBg: 'rgba(10, 27, 51, 0.02)',
  emptyText: 'rgba(10, 27, 51, 0.7)',
} as const;

export function pcCSSVars(): Record<string, string> {
  return {
    '--pc-heading': PC_COLOR.heading,
    '--pc-brand-blue': PC_COLOR.brandBlue,
    '--pc-warm-accent': PC_COLOR.warmAccent,
    '--pc-body-text': PC_COLOR.bodyText,
    '--pc-supporting-body': PC_COLOR.supportingBody,
    '--pc-placeholder-bg': PC_COLOR.placeholderBg,
    '--pc-card-gradient-start': PC_COLOR.cardGradientStart,
    '--pc-card-gradient-end': 'rgb(255, 255, 255)',
    '--pc-badge-bg': PC_COLOR.badgeBg,
    '--pc-pinned-badge-bg': PC_COLOR.pinnedBadgeBg,
    '--pc-empty-border': PC_COLOR.emptyBorder,
    '--pc-empty-bg': PC_COLOR.emptyBg,
    '--pc-empty-text': PC_COLOR.emptyText,
    '--pc-surface-bg': '#ffffff',
    '--pc-cta-color': HP_CTA.color,
    '--pc-focus-outline': HP_FOCUS.outline,
    '--pc-radius-pill': '999px',
    '--pc-space-xs': `${HP_SPACE.xs}px`,
    '--pc-space-sm': `${HP_SPACE.sm}px`,
    '--pc-space-md': `${HP_SPACE.md}px`,
    '--pc-space-lg': `${HP_SPACE.lg}px`,
    '--pc-space-xl': `${HP_SPACE.xl}px`,
    '--pc-space-2xl': `${HP_SPACE['2xl']}px`,
    '--pc-space-3xl': `${HP_SPACE['3xl']}px`,
    '--pc-space-4xl': `${HP_SPACE['4xl']}px`,
    '--pc-radius-image': `${HP_RADIUS.image}px`,
    '--pc-radius-card': `${HP_RADIUS.card}px`,
    '--pc-radius-editorial': `${HP_RADIUS.editorial}px`,
    '--pc-radius-signature': `${HP_RADIUS.signature}px`,
    '--pc-border-subtle': HP_BORDER.subtle,
    '--pc-border-brand': HP_BORDER.brandAccent,
  };
}

export { HP_SPACE, HP_RADIUS, HP_BORDER, HP_CTA, HP_TEXT_OPACITY, HP_FOCUS };
