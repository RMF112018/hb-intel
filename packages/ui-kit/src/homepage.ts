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

import { body, display, displayLg, displayXl, heading1, heading2, heading3, heading4 } from './theme/typography.js';
import { HBC_DENSITY_TOKENS, type DensityTier } from './theme/density.js';
import { HBC_SPACE_LG, HBC_SPACE_MD, HBC_SPACE_SM, HBC_SPACE_XL, HBC_SPACE_2XL, HBC_SPACE_3XL } from './theme/grid.js';
import {
  HBC_SURFACE_PRESENTATION,
  hbcPresentationCSSVars,
  HBC_PRESENTATION_BLUE,
  HBC_PRESENTATION_BLUE_RGB,
  HBC_PRESENTATION_ORANGE,
  HBC_PRESENTATION_ORANGE_RGB,
} from './theme/tokens.js';
import { elevationHero, elevationEditorial } from './theme/elevation.js';
import { TRANSITION_DRAMATIC } from './theme/animations.js';

// W01-P03: Presentation-lane foundation tokens for homepage compositions
export { HBC_SURFACE_PRESENTATION, hbcPresentationCSSVars };
export { elevationHero, elevationEditorial };
export { TRANSITION_DRAMATIC };
export { displayLg, displayXl };
export { HBC_SPACE_2XL, HBC_SPACE_3XL };
// W01r-P08: Governed presentation-lane brand colors for consumer use
export { HBC_PRESENTATION_BLUE, HBC_PRESENTATION_BLUE_RGB, HBC_PRESENTATION_ORANGE, HBC_PRESENTATION_ORANGE_RGB };
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

// ── Phase 16-02 — Premium dependency re-exports ──────────────────────
// Re-export key P16 dependencies so homepage webparts can consume them
// through the governed @hbc/ui-kit/homepage entrypoint without needing
// direct package.json dependencies on motion, lucide, clsx, or cva.

export { motion, AnimatePresence } from 'motion/react';
export { clsx } from 'clsx';
export { cva } from 'class-variance-authority';
export type { VariantProps } from 'class-variance-authority';
export { Root as Separator } from '@radix-ui/react-separator';

// Lucide icons — curated set for homepage use
export {
  ArrowRight,
  ExternalLink,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  Circle,
  Search,
  Shield,
  DollarSign,
  Users,
  Settings,
  FileText,
  Briefcase,
  Building2,
  HardHat,
  BarChart3,
  Landmark,
  Keyboard,
  Mail,
  Link2,
  Trophy,
  Sparkles,
  ThumbsUp,
  ChevronDown,
  Eye,
  type LucideIcon,
} from 'lucide-react';

// ── Phase 16-02 — Premium primitives (cva + lucide + motion + radix) ──

export { HbcPremiumSurface } from './HbcPremiumSurface/index.js';
export type { HbcPremiumSurfaceProps, SurfaceIntent, SurfaceElevation } from './HbcPremiumSurface/index.js';

export { HbcPremiumIcon } from './HbcPremiumIcon/index.js';
export type { HbcPremiumIconProps, PremiumIconSize, PremiumIconTint } from './HbcPremiumIcon/index.js';

export { HbcPremiumCta } from './HbcPremiumCta/index.js';
export type { HbcPremiumCtaProps, PremiumCtaVariant, PremiumCtaSize } from './HbcPremiumCta/index.js';

export { HbcPremiumBadge } from './HbcPremiumBadge/index.js';
export type { HbcPremiumBadgeProps, PremiumBadgeStatus, PremiumBadgeSize } from './HbcPremiumBadge/index.js';

export { HbcPremiumSection } from './HbcPremiumSection/index.js';
export type { HbcPremiumSectionProps, PremiumSectionAccent } from './HbcPremiumSection/index.js';

// ── Phase 17-03 — Surface family primitives ─────────────────────────────
// Purpose-built surface components per homepage zone family.

export { HbcSignatureHeroSurface } from './HbcSignatureHeroSurface/index.js';
export type { HbcSignatureHeroSurfaceProps, HeroBackground, HeroLayout } from './HbcSignatureHeroSurface/index.js';

export { HbcCommandSurface } from './HbcCommandSurface/index.js';
export type { HbcCommandSurfaceProps, CommandUrgency, CommandItem } from './HbcCommandSurface/index.js';

export { HbcLauncherSurface } from './HbcLauncherSurface/index.js';
export type { HbcLauncherSurfaceProps, LauncherLayout, LauncherTileTint, LauncherTile, LauncherGroup } from './HbcLauncherSurface/index.js';

export { HbcDiscoverySurface } from './HbcDiscoverySurface/index.js';
export type {
  HbcDiscoverySurfaceProps,
  DiscoveryQuickPath,
  DiscoveryCategory,
  DiscoveryCategoryItem,
  DiscoveryPromotedItem,
} from './HbcDiscoverySurface/index.js';

export { HbcEditorialSurface } from './HbcEditorialSurface/index.js';
export type {
  HbcEditorialSurfaceProps,
  EditorialFeaturedItem,
  EditorialSecondaryItem,
} from './HbcEditorialSurface/index.js';

export { HbcOperationalSurface } from './HbcOperationalSurface/index.js';
export type {
  HbcOperationalSurfaceProps,
  OperationalSignalSeverity,
  OperationalFeatured,
  OperationalSignal,
} from './HbcOperationalSurface/index.js';

// ── Wave 01 follow-on — People & Culture surface family ──────────────
// Cohesive presentation-lane surface for the warm-celebratory recognition
// zone, plus the kudos composer flyout/form/preview group and a shared
// avatar stack primitive used by both.

export { HbcPeopleCultureSurface } from './HbcPeopleCultureSurface/index.js';
export type {
  HbcPeopleCultureSurfaceProps,
  PeopleCultureSurfaceModel,
  PeopleCultureKudosModel,
  PeopleCultureRecipient,
  PeopleCultureAnnouncement,
  PeopleCultureCelebration,
  PeopleCultureAnnouncementType,
  PeopleCultureCelebrationType,
  KudosSpotlightItem,
  KudosRailItem,
} from './HbcPeopleCultureSurface/index.js';

export {
  HbcKudosComposerFlyout,
  HbcKudosComposerForm,
  HbcKudosComposerPreview,
  HbcKudosComposerSuccess,
  HbcKudosComposerError,
  EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS,
} from './HbcKudosComposer/index.js';
export type {
  HbcKudosComposerFlyoutProps,
  HbcKudosComposerFormProps,
  HbcKudosComposerPreviewProps,
  HbcKudosComposerSuccessProps,
  HbcKudosComposerErrorProps,
  HbcKudosComposerActionProps,
  KudosComposerDraft,
  KudosComposerValidationErrors,
  KudosComposerRecipientBucketsDraft,
  KudosComposerRecipientBucketKind,
  KudosComposerRecipientsMode,
} from './HbcKudosComposer/index.js';

export { HbcPeoplePicker } from './HbcPeoplePicker/index.js';
export type { HbcPeoplePickerProps, PersonEntry, PeopleSearchFn, PersonPhotoFn, PhotoState, PersonPhotoEntry } from './HbcPeoplePicker/index.js';
export { useGraphPeopleSearch, createStaticPeopleSearch, rankPeopleResults } from './HbcPeoplePicker/useGraphPeopleSearch.js';
export { usePersonPhotoCache, createGraphPersonPhotoFn } from './HbcPeoplePicker/usePersonPhotoCache.js';

// Authoring-safety hook re-export so homepage-family consumers
// (e.g., the HB Publisher webpart) can reach it without touching the
// ui-kit root barrel. Canonical implementation still lives at
// `./hooks/useUnsavedChangesBlocker.js` and is re-exported from the
// root package for non-subpath consumers.
export { useUnsavedChangesBlocker } from './hooks/useUnsavedChangesBlocker.js';
export type {
  UseUnsavedChangesBlockerOptions,
  UseUnsavedChangesBlockerReturn,
} from './hooks/useUnsavedChangesBlocker.js';

export { HbcAvatarStack } from './HbcAvatarStack/index.js';
export type {
  HbcAvatarStackProps,
  HbcAvatarStackPerson,
  HbcAvatarSize,
} from './HbcAvatarStack/index.js';

// ── Wave 01 follow-on — Project / Portfolio Spotlight surface family ──
// Cohesive presentation-lane surface for the homepage project-spotlight
// zone. Reuses HbcAvatarStack for the project team strip. Consumers stay
// thin — SharePoint fetch, normalization, stale detection, and manifest
// fallback remain local to the consuming webpart.

export { HbcProjectSpotlightSurface } from './HbcProjectSpotlightSurface/index.js';
export type {
  HbcProjectSpotlightSurfaceProps,
  ProjectSpotlightSurfaceModel,
  ProjectSpotlightFeaturedItem,
  ProjectSpotlightRailItem,
  ProjectSpotlightMilestone,
  ProjectSpotlightTeamMember,
  ProjectSpotlightStatus,
  ProjectSpotlightStatusVariant,
  ProjectSpotlightMedia,
  ProjectSpotlightCta,
} from './HbcProjectSpotlightSurface/index.js';

// ── Wave 01 follow-on — Newsroom / Company Pulse surface family ──────
// Cohesive presentation-lane surface for the homepage Company Pulse
// newsroom zone. Three data-driven layout modes (rich / sparse /
// headline-only) resolved via `resolveNewsroomLayout`. Consumers stay
// thin — normalization, audience filtering, authoring governance, and
// webpart integration remain local to the consuming webpart.

export { HbcNewsroomSurface, resolveNewsroomLayout } from './HbcNewsroomSurface/index.js';
export type {
  HbcNewsroomSurfaceProps,
  HbcNewsroomSurfaceModel,
  HbcNewsroomFeaturedItem,
  HbcNewsroomHeadlineItem,
  HbcNewsroomTertiaryItem,
  HbcNewsroomMedia,
  HbcNewsroomCta,
  HbcNewsroomCategoryKey,
  HbcNewsroomLayoutMode,
} from './HbcNewsroomSurface/index.js';

// ── Homepage launcher band (destructive replacement of flagship rail) ──
// Premium horizontal launcher tile family owned by @hbc/ui-kit/homepage and
// consumed by the homepage wrapper's entry-stack. Replaces the earlier
// vertical-tile HbcPriorityRail "homepage-flagship" context on the
// homepage render path. HbcPriorityRail remains the surface for
// standalone / admin-preview rail mounts.

export {
  HbcHomepageLauncher,
  HbcHomepageLauncherTile,
  HbcHomepageLauncherChip,
  HbcHomepageLauncherOverflow,
  HBC_HOMEPAGE_LAUNCHER_SURFACE_ID,
  HBC_HOMEPAGE_LAUNCHER_HANDHELD_MODE_RULE,
  HBC_HOMEPAGE_LAUNCHER_VERSION,
  HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT,
} from './HbcHomepageLauncher/index.js';
export type {
  HbcHomepageLauncherProps,
  HbcHomepageLauncherTileProps,
  HomepageLauncherTileModel,
  HomepageLauncherTileVariant,
  HbcHomepageLauncherChipProps,
  HbcHomepageLauncherOverflowProps,
  HomepageLauncherChipModel,
  HomepageLauncherDeviceClass,
  HomepageLauncherDrawerSource,
  HomepageLauncherCapGovernance,
  HomepageLauncherHandheldMode,
  HomepageLauncherOverflowMode,
} from './HbcHomepageLauncher/index.js';

// ── Phase 02 — Priority Rail surface family ─────────────────────────
// Governed rail/list surface family for standalone priority-action mounts.
// Shared by the public runtime rail and admin preview surface.
// Hosted homepage launcher authority is the `HbcHomepageLauncher` family.

export {
  HbcPriorityRailSurface,
  HbcPriorityRailAction,
  HbcPriorityRailOverflow,
  HbcPriorityRailSkeleton,
  HbcPriorityRailEmptyState,
  HbcPriorityRailErrorState,
  HbcPriorityRailPreviewSurface,
} from './HbcPriorityRail/index.js';
export type {
  HbcPriorityRailSurfaceProps,
  HbcPriorityRailActionProps,
  HbcPriorityRailOverflowProps,
  HbcPriorityRailSkeletonProps,
  HbcPriorityRailEmptyStateProps,
  HbcPriorityRailErrorStateProps,
  HbcPriorityRailPreviewSurfaceProps,
  PriorityRailActionModel,
  PriorityRailGroupModel,
  PriorityRailUrgency,
  PriorityRailBadgeVariant,
  PriorityRailLayoutMode,
  PriorityRailState,
  PriorityRailContext,
} from './HbcPriorityRail/index.js';

export type HomepageSurfaceClass =
  | 'hero'
  | 'welcome'
  | 'editorial'
  | 'utility'
  | 'operational'
  | 'discovery'
  | 'people-culture'
  | 'newsroom';

export type HomepagePrimitiveName =
  | 'HbcAvatarStack'
  | 'HbcBanner'
  | 'HbcButton'
  | 'HbcCard'
  | 'HbcCommandSurface'
  | 'HbcDiscoverySurface'
  | 'HbcEditorialSurface'
  | 'HbcEmptyState'
  | 'HbcHomepageActionRow'
  | 'HbcHomepageCta'
  | 'HbcHomepageEyebrow'
  | 'HbcHomepageIconFrame'
  | 'HbcHomepageMetadataRow'
  | 'HbcHomepageSectionShell'
  | 'HbcHomepageSurfaceCard'
  | 'HbcKudosComposerFlyout'
  | 'HbcKudosComposerForm'
  | 'HbcKudosComposerPreview'
  | 'HbcLauncherSurface'
  | 'HbcPeoplePicker'
  | 'HbcPriorityRailSurface'
  | 'HbcNewsroomSurface'
  | 'HbcOperationalSurface'
  | 'HbcPeopleCultureSurface'
  | 'HbcProjectSpotlightSurface'
  | 'HbcSearch'
  | 'HbcSignatureHeroSurface'
  | 'HbcSpinner'
  | 'HbcStatusBadge'
  | 'HbcThemeProvider';

/**
 * Prompt-02 locked HB homepage brand direction.
 * Phase 15-02: strengthened anti-pattern list per Premium-Benchmark-Brief.
 * W01r-P08: Colors now derive from governed HBC_PRESENTATION_* tokens in tokens.ts.
 */
export const HBC_HOMEPAGE_BRAND_FOUNDATION = {
  primaryBlue: {
    rgb: `rgb(${HBC_PRESENTATION_BLUE_RGB})`,
    hex: HBC_PRESENTATION_BLUE,
  },
  secondaryOrange: {
    rgb: `rgb(${HBC_PRESENTATION_ORANGE_RGB})`,
    hex: HBC_PRESENTATION_ORANGE,
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
  /** W01-P03: Signature hero headline — largest presentation scale */
  heroHeadline: displayXl,
  /** W01-P03: Section hero / editorial feature title */
  heroTitle: displayLg,
  /** Legacy alias — maps to display (32px) */
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
  /** W01-P03: Hero-scale vertical rhythm between major zones */
  heroGap: HBC_SPACE_3XL,
  /** W01-P03: Editorial section break spacing */
  sectionBreak: HBC_SPACE_2XL,
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
 * W01r-P08: Made primitives/fluent prohibition explicit. Homepage webparts
 * should get all needed primitives through @hbc/ui-kit/homepage re-exports.
 */
export const HBC_HOMEPAGE_IMPORT_GUARDRAILS = {
  allowedEntrypoint: '@hbc/ui-kit/homepage',
  relatedTokenEntrypoints: ['@hbc/ui-kit/theme', '@hbc/ui-kit/icons', '@hbc/ui-kit/branding'],
  prohibitedEntrypointsInHomepageWebparts: [
    '@hbc/ui-kit',
    '@hbc/ui-kit/app-shell',
    '@hbc/ui-kit/primitives',
    '@hbc/ui-kit/fluent',
  ],
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
    character:
      'authoritative operational command surface with safety-register nameplate masthead, persistent severity spectrum strip, severity-accented featured signal (default / success / warning / danger), and severity-left-accent signal rows — built to carry Safety & Field Excellence and other high-importance operational storytelling',
    shadow: 'elevationEditorial',
    radius: '12px',
    background: 'clean white with severity-aware accents',
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
  peopleCulture: {
    surfaces: ['people-culture'] as const,
    character:
      'premium celebratory recognition surface with layered warm gradient hero + confetti-dot field, ribbon-tagged kudos spotlight, ringed hero avatar, colored-strip announcement rows, and bolder celebration tiles',
    shadow: 'elevationEditorial',
    radius: '20px',
    background: 'warm cream spotlight + cool mist rail',
    border: 'warm gradient hero band',
  },
  projectSpotlight: {
    surfaces: ['operational'] as const,
    character:
      'flagship image-led portfolio spotlight with nameplate masthead, dominant 440px featured hero, overlay eyebrow + status chips, milestone progress strip, team detail panel, and a numbered 01/02/03 supporting rail',
    shadow: 'elevationEditorial',
    radius: '12px',
    background: 'clean white featured zone + cool-tinted rail',
    border: 'strong brand left accent',
  },
  newsroom: {
    surfaces: ['newsroom'] as const,
    character:
      'premium internal editorial newsroom with nameplate masthead, image-led lead dominance, numbered supporting headline rail, and a quick-reads footer grid rendering tertiary story titles',
    shadow: 'elevationEditorial',
    radius: '12px',
    background: 'clean white lead content + cool-tinted rail',
    border: 'strong brand left accent',
  },
} as const;
