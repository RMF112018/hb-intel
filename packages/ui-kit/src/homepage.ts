/**
 * @hbc/ui-kit/homepage
 *
 * Constrained entrypoint for HB Central homepage webparts.
 * This surface intentionally exposes a small, governed subset that is safe for
 * SPFx homepage composition and avoids shell recreation primitives.
 *
 * Phase 15-02 — Premium surface system rebuild:
 * - Added SectionAccent type export
 * - Added HBC_HOMEPAGE_SURFACE_FAMILIES constant
 * - Strengthened brand foundation anti-patterns
 */

import { body, display, heading1, heading2, heading3, heading4 } from './theme/typography.js';
import { HBC_DENSITY_TOKENS, type DensityTier } from './theme/density.js';
import { HBC_SPACE_LG, HBC_SPACE_MD, HBC_SPACE_SM, HBC_SPACE_XL } from './theme/grid.js';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js';

export { HbcBanner } from './HbcBanner/index.js';
export type { HbcBannerProps, BannerVariant } from './HbcBanner/index.js';

export { HbcThemeProvider } from './HbcAppShell/index.js';
export type { HbcThemeProviderProps } from './HbcAppShell/HbcThemeContext.js';

export { HbcButton } from './HbcButton/index.js';
export type { ButtonVariant, HbcButtonProps } from './HbcButton/index.js';

export { HbcCard } from './HbcCard/index.js';
export type { CardWeight, HbcCardProps } from './HbcCard/index.js';

export { HbcEmptyState } from './HbcEmptyState/index.js';
export type { HbcEmptyStateProps } from './HbcEmptyState/index.js';

export { HbcSearch } from './HbcSearch/index.js';
export type { HbcSearchProps, HbcSearchVariant } from './HbcSearch/index.js';

export { HbcSpinner } from './HbcSpinner/index.js';
export type { HbcSpinnerProps, SpinnerSize } from './HbcSpinner/index.js';

export { HbcStatusBadge } from './HbcStatusBadge/index.js';
export type { HbcStatusBadgeProps, StatusVariant } from './HbcStatusBadge/index.js';

export { usePrefersReducedMotion as useHomepageReducedMotion };

// ── Phase 11A — Homepage shared primitives ────────────────────────────

export { HbcHomepageSectionShell } from './HbcHomepageSectionShell/index.js';
export type { HbcHomepageSectionShellProps, SectionAccent } from './HbcHomepageSectionShell/types.js';

export { HbcHomepageCta } from './HbcHomepageCta/index.js';
export type { HbcHomepageCtaProps, HomepageCtaVariant, HomepageCtaSize } from './HbcHomepageCta/types.js';

export { HbcHomepageMetadataRow } from './HbcHomepageMetadataRow/index.js';
export type { HbcHomepageMetadataRowProps } from './HbcHomepageMetadataRow/types.js';

export { HbcHomepageIconFrame } from './HbcHomepageIconFrame/index.js';
export type { HbcHomepageIconFrameProps, IconFrameSize, IconFrameTint } from './HbcHomepageIconFrame/types.js';

export { HbcHomepageSurfaceCard } from './HbcHomepageSurfaceCard/index.js';
export type { HbcHomepageSurfaceCardProps } from './HbcHomepageSurfaceCard/types.js';

export { HbcHomepageActionRow } from './HbcHomepageActionRow/index.js';
export type { HbcHomepageActionRowProps } from './HbcHomepageActionRow/types.js';

// ── Phase 12B-02 — Top-band editorial hierarchy primitive ────────────

export { HbcHomepageEyebrow } from './HbcHomepageEyebrow/index.js';
export type { HbcHomepageEyebrowProps, EyebrowTone } from './HbcHomepageEyebrow/types.js';

export type HomepageSurfaceClass = 'hero' | 'welcome' | 'editorial' | 'utility' | 'operational' | 'discovery';

export type HomepagePrimitiveName =
  | 'HbcBanner'
  | 'HbcButton'
  | 'HbcCard'
  | 'HbcEmptyState'
  | 'HbcHomepageActionRow'
  | 'HbcHomepageCta'
  | 'HbcHomepageEyebrow'
  | 'HbcHomepageIconFrame'
  | 'HbcHomepageMetadataRow'
  | 'HbcHomepageSectionShell'
  | 'HbcHomepageSurfaceCard'
  | 'HbcSearch'
  | 'HbcSpinner'
  | 'HbcStatusBadge'
  | 'HbcThemeProvider';

/**
 * Prompt-02 locked HB homepage brand direction.
 * Phase 15-02: strengthened anti-pattern list per Premium-Benchmark-Brief.
 */
export const HBC_HOMEPAGE_BRAND_FOUNDATION = {
  primaryBlue: {
    rgb: 'rgb(34, 83, 145)',
    hex: '#225391',
  },
  secondaryOrange: {
    rgb: 'rgb(229, 126, 70)',
    hex: '#E57E46',
  },
  posture: {
    premium: true,
    established: true,
    polished: true,
    operational: true,
  },
  antiPatterns: [
    'flashy animation-first styling',
    'template-like generic sharepoint tiles',
    'startup-like novelty styling',
    'uniform white-card sameness across zones',
    'invisible zone differentiation below 0.03 opacity',
    'list-like flat launcher behavior',
    'generic text-input search treatment',
    'interchangeable editorial and operational surfaces',
  ],
} as const;

/**
 * Homepage typography aliases mapped to existing ui-kit typography scale.
 */
export const HBC_HOMEPAGE_TYPOGRAPHY = {
  hero: display,
  sectionHeader: heading2,
  editorialCardTitle: heading3,
  utilityTileTitle: heading4,
  intelligenceStripTitle: heading3,
  body,
  greeting: heading1,
} as const;

/**
 * Shared layout rhythm for homepage compositions.
 */
export const HBC_HOMEPAGE_SPACING = {
  sectionGap: HBC_SPACE_XL,
  cardGap: HBC_SPACE_LG,
  tileGap: HBC_SPACE_MD,
  inlineGap: HBC_SPACE_SM,
} as const;

/**
 * Homepage a11y and motion policy for constrained SPFx usage.
 */
export const HBC_HOMEPAGE_ACCESSIBILITY_POLICY = {
  lightThemeFirst: true,
  requireVisibleFocus: true,
  forbidHoverOnlyCriticalInfo: true,
  reducedMotion: {
    mediaQuery: '(prefers-reduced-motion: reduce)',
    required: true,
    hook: 'useHomepageReducedMotion',
  },
  minimumContrast: {
    text: '4.5:1',
    interactive: '3:1',
  },
} as const;

/**
 * Homepage density guidance using existing ui-kit density system.
 */
export const HBC_HOMEPAGE_DENSITY_POLICY: {
  defaultTier: DensityTier;
  minimumTouchTargetPx: number;
  minimumRowHeightPx: number;
} = {
  defaultTier: 'comfortable',
  minimumTouchTargetPx: HBC_DENSITY_TOKENS.touch.touchTargetMin,
  minimumRowHeightPx: HBC_DENSITY_TOKENS.comfortable.rowHeightMin,
};

/**
 * Guardrail metadata for documentation and lint policy references.
 */
export const HBC_HOMEPAGE_IMPORT_GUARDRAILS = {
  allowedEntrypoint: '@hbc/ui-kit/homepage',
  relatedTokenEntrypoints: ['@hbc/ui-kit/theme', '@hbc/ui-kit/icons', '@hbc/ui-kit/branding'],
  prohibitedEntrypointsInHomepageWebparts: ['@hbc/ui-kit', '@hbc/ui-kit/app-shell'],
} as const;

/**
 * Phase 15-02 — Premium surface family definitions.
 *
 * Each homepage surface family has distinct visual characteristics.
 * These definitions are reference metadata for documentation and
 * enforcement — the actual styles live in HbcHomepageSurfaceCard.
 */
export const HBC_HOMEPAGE_SURFACE_FAMILIES = {
  signature: {
    surfaces: ['hero', 'welcome'] as const,
    character: 'commanding, brand-forward, high visual impact',
    shadow: 'elevationLevel2–3',
    radius: '12px',
    background: 'brand-tinted',
    border: 'brand accent or none',
  },
  editorial: {
    surfaces: ['editorial'] as const,
    character: 'spacious, curated, magazine-like hierarchy',
    shadow: 'elevationLevel1',
    radius: '8px',
    background: 'clean white with warm accent',
    border: 'warm left accent',
  },
  command: {
    surfaces: ['utility'] as const,
    character: 'dense, efficient, high-contrast, tool-like',
    shadow: 'elevationLevel0 → elevationLevel1 on hover',
    radius: '6px',
    background: 'subtle cool tint',
    border: 'brand-tinted border',
  },
  operational: {
    surfaces: ['operational'] as const,
    character: 'structured, data-credible, dashboard-adjacent',
    shadow: 'elevationLevel1',
    radius: '8px',
    background: 'cool-tinted',
    border: 'strong brand left accent',
  },
  discovery: {
    surfaces: ['discovery'] as const,
    character: 'inviting, prominent, warm neutral',
    shadow: 'elevationLevel1',
    radius: '10px',
    background: 'warm-tinted',
    border: 'warm-tinted border',
  },
} as const;
