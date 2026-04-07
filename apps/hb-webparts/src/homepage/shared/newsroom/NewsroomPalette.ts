/**
 * Newsroom brand palette — editorial-tuned premium surface tokens.
 * Wave 02 — CompanyPulse newsroom primitives.
 *
 * Cooler and more authoritative than PeopleCulture's warm cream/orange
 * palette. Blue-led hierarchy with restrained warm accents. Aligned
 * with ProjectPortfolioSpotlight's premium grammar but tuned for
 * newsroom/editorial content.
 */

/** HB brand foundation — sourced from @hbc/ui-kit HBC_HOMEPAGE_BRAND_FOUNDATION */
export const NR = {
  blue: '#225391',
  blueRgb: '34, 83, 145',
  orange: '#E57E46',
  orangeRgb: '229, 126, 70',
} as const;

export const NR_PALETTE = {
  /** Root container — white with blue-authority left accent */
  rootBg: '#ffffff',
  rootBorder: `4px solid ${NR.blue}`,
  rootShadow: `0 1px 3px rgba(${NR.blueRgb}, 0.06), 0 4px 20px rgba(${NR.blueRgb}, 0.08)`,
  rootRadius: 12,

  /** Featured story zone — subtle cool blue tint */
  featuredBg: `rgba(${NR.blueRgb}, 0.025)`,
  /** Featured story image scrim — editorial readability */
  featuredScrim: `linear-gradient(to top, rgba(${NR.blueRgb}, 0.60) 0%, rgba(${NR.blueRgb}, 0.10) 50%, transparent 100%)`,
  /** Featured image placeholder — branded slate */
  featuredPlaceholderBg: `rgba(${NR.blueRgb}, 0.06)`,

  /** Headline stack rail — slightly stronger cool tint */
  railBg: `rgba(${NR.blueRgb}, 0.035)`,
  railHover: `rgba(${NR.blueRgb}, 0.06)`,

  /** Separators */
  headerSeparator: `linear-gradient(90deg, rgba(${NR.blueRgb}, 0.20) 0%, rgba(${NR.orangeRgb}, 0.08) 60%, transparent 100%)`,
  itemDivider: `rgba(${NR.blueRgb}, 0.08)`,

  /** Text hierarchy */
  text1: '#1a1a1a',
  text2: 'rgba(26, 26, 26, 0.68)',
  text3: 'rgba(26, 26, 26, 0.48)',
  text4: 'rgba(26, 26, 26, 0.34)',

  /** Eyebrow — editorial blue authority (not warm orange) */
  eyebrow: NR.blue,
  eyebrowBg: `rgba(${NR.blueRgb}, 0.08)`,

  /** Header title — brand blue for newsroom authority */
  headerTitle: NR.blue,
  headerIconBg: `rgba(${NR.blueRgb}, 0.08)`,
  headerIconColor: NR.blue,
} as const;

/** Category color mapping — editorial-appropriate variants */
export const NR_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  update: {
    bg: `rgba(${NR.blueRgb}, 0.08)`,
    text: NR.blue,
    border: `rgba(${NR.blueRgb}, 0.20)`,
  },
  safety: {
    bg: 'rgba(245, 158, 11, 0.08)',
    text: '#b45309',
    border: 'rgba(245, 158, 11, 0.20)',
  },
  recognition: {
    bg: 'rgba(16, 185, 129, 0.08)',
    text: '#047857',
    border: 'rgba(16, 185, 129, 0.20)',
  },
  milestone: {
    bg: `rgba(${NR.orangeRgb}, 0.08)`,
    text: '#c2410c',
    border: `rgba(${NR.orangeRgb}, 0.20)`,
  },
} as const;

/** No-motion sentinel for reduced-motion support */
export const NR_NO_MOTION = {
  initial: undefined,
  animate: undefined,
  transition: undefined,
} as const;

export function getNrFeaturedMotion(reduced: boolean) {
  if (reduced) return NR_NO_MOTION;
  return {
    initial: { opacity: 0, y: 12 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function getNrRailMotion(reduced: boolean) {
  if (reduced) return NR_NO_MOTION;
  return {
    initial: { opacity: 0, x: 8 } as const,
    animate: { opacity: 1, x: 0 } as const,
    transition: { duration: 0.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const },
  };
}
