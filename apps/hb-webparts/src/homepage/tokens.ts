/**
 * Homepage design tokens.
 *
 * Local token system for homepage shared primitives and webpart composition.
 * These tokens replace scattered hardcoded values with a coherent,
 * documented set of design decisions.
 *
 * These are LOCAL to apps/hb-webparts — not exported via @hbc/ui-kit.
 * Promotion to ui-kit requires 2+ non-homepage consumers.
 *
 * Brand color governance (W01r-P08):
 * The presentation-lane brand colors used here (#225391 / #E57E46) are
 * formally governed in @hbc/ui-kit as HBC_PRESENTATION_BLUE / HBC_PRESENTATION_ORANGE.
 * Consumer webparts should import those tokens via @hbc/ui-kit/homepage
 * rather than hardcoding. This file retains inline rgba() values for
 * composition-level gradients and zone tints where template interpolation
 * would reduce readability.
 *
 * Phase 15-02 — Premium surface system rebuild:
 * - Zone backgrounds strengthened to perceptible levels
 * - Surface-family-specific spacing and radius added
 * - Stronger border treatments for zone differentiation
 *
 * @see docs/architecture/plans/MASTER/spfx/homepage/phase-15/Premium-Benchmark-Brief.md
 */

// ── Spacing scale ──────────────────────────────────────────────────────
// Tight 4-step scale for homepage composition rhythm.

export const HP_SPACE = {
  /** 4px — tightest gap (action descriptions, inline metadata) */
  xs: 4,
  /** 6px — compact gap (utility tile grids, list item spacing) */
  sm: 6,
  /** 8px — standard gap (badge rows, heading-to-content, icon margins) */
  md: 8,
  /** 10px — card interior (featured item padding, secondary card padding) */
  lg: 10,
  /** 12px — section rhythm (grid-to-section, CTA margin, zone flex gap) */
  xl: 12,
  /** 16px — generous interior (featured card padding) */
  '2xl': 16,
  /** 20px — hero interior padding */
  '3xl': 20,
  /** 28px — signature surface interior */
  '4xl': 28,
  /** 40px — zone separation gap */
  '5xl': 40,
} as const;

// ── Border radius ──────────────────────────────────────────────────────
// Surface-family-aware radius tokens.

export const HP_RADIUS = {
  /** 6px — image/media clipping */
  image: 6,
  /** 6px — compact radius for utility/command surfaces */
  command: 6,
  /** 8px — standard card and container radius */
  card: 8,
  /** 10px — editorial and discovery surfaces */
  editorial: 10,
  /** 10px — hero banner / prominent surface */
  hero: 10,
  /** 12px — signature surfaces (welcome, hero cards) */
  signature: 12,
} as const;

// ── Border treatment ───────────────────────────────────────────────────
// Semantic border strengths for light-theme surfaces.

export const HP_BORDER = {
  /** Subtle secondary container — rgba(0,0,0,0.08) */
  subtle: '1px solid rgba(0,0,0,0.08)',
  /** Standard card/featured border — rgba(0,0,0,0.12) */
  standard: '1px solid rgba(0,0,0,0.12)',
  /** Input/interactive border — rgba(0,0,0,0.25) */
  interactive: '1px solid rgba(0,0,0,0.25)',
  /** Brand accent — visible brand-colored border for zone emphasis */
  brandAccent: '1px solid rgba(34,83,145,0.15)',
  /** Warm accent — visible warm-colored border for editorial zones */
  warmAccent: '1px solid rgba(229,126,70,0.15)',
} as const;

// ── Text opacity ───────────────────────────────────────────────────────
// Semantic opacity tiers for secondary/muted text on light backgrounds.

export const HP_TEXT_OPACITY = {
  /** 0.75 — metadata, timestamps, freshness labels, descriptions */
  secondary: 0.75,
  /** 0.85 — slightly muted but still prominent (hero metadata) */
  muted: 0.85,
} as const;

// ── Image sizing ───────────────────────────────────────────────────────

export const HP_IMAGE = {
  /** Featured media max-height — leadership/editorial hero images */
  featuredMaxHeight: 220,
  /** Compact media max-height — people/secondary images */
  compactMaxHeight: 180,
  /** Standard object-fit for all media */
  objectFit: 'cover' as const,
} as const;

// ── Layout breakpoints ─────────────────────────────────────────────────
// Min-width values for flex-based zone layouts.

export const HP_LAYOUT = {
  /** Welcome header minimum width in top-band pair */
  welcomeMinWidth: 280,
  /** Hero banner minimum width in top-band pair */
  heroMinWidth: 320,
  /** Utility group minimum width */
  utilityGroupMinWidth: 220,
  /** Welcome flex basis/ratio in top-band pair */
  welcomeFlex: '1 1 280px',
  /** Hero flex basis/ratio in top-band pair */
  heroFlex: '2 1 440px',
  /** Gap between welcome and hero in the top-band pair (Phase 12B-05) */
  topBandGap: 16,
} as const;

// ── Hero surface ───────────────────────────────────────────────────────

export const HP_HERO = {
  /** Branded gradient overlay for hero banner with background image */
  gradientWithImage: 'linear-gradient(120deg, rgba(34,83,145,0.9), rgba(229,126,70,0.75))',
  /** Branded gradient fallback (no background image) */
  gradientFallback: 'linear-gradient(135deg, rgba(34,83,145,0.94), rgba(28,71,124,0.92))',
  /** Hero text color on gradient background */
  textColor: '#ffffff',
} as const;

// ── Zone differentiation ───────────────────────────────────────────────
// Phase 15-02: Strengthened zone backgrounds to perceptible levels.
// Previous values (0.02–0.03 opacity) were invisible on most displays.

export const HP_ZONE = {
  /** Top-band: warm brand tint — visible but not dominant */
  topBand: { background: 'rgba(34,83,145,0.05)' },
  /** Utility: subtle cool tint — density and background create identity */
  utility: { background: 'rgba(34,83,145,0.025)' },
  /** Communications: visible warm tint — editorial warmth */
  communications: { background: 'rgba(229,126,70,0.04)' },
  /** Operational: cool structured tint — dashboard-adjacent feel */
  operational: { background: 'rgba(34,83,145,0.035)' },
  /** Discovery: warm neutral — inviting, distinct from operational */
  discovery: { background: 'rgba(229,126,70,0.03)' },
} as const;

// ── CTA treatment ──────────────────────────────────────────────────────

export const HP_CTA = {
  /** Primary CTA color — HB brand blue */
  color: '#225391',
  /** CTA font weight */
  fontWeight: 600,
  /** CTA text decoration */
  textDecoration: 'none' as const,
} as const;

// ── Welcome accent ─────────────────────────────────────────────────────

export const HP_WELCOME = {
  /** Left accent border width */
  accentWidth: 5,
  /** Greeting font size multiplier — signature-level greeting */
  greetingFontSize: '1.5rem',
  /** Greeting font weight */
  greetingFontWeight: 700,
} as const;

// ── Motion ─────────────────────────────────────────────────────────────
// Purposeful, fast, restrained transitions. No decorative motion.
// All motion tokens must be gated by prefers-reduced-motion at usage site.

export const HP_MOTION = {
  /** Fast transition for hover/focus — 150ms ease */
  fast: '150ms ease',
  /** Standard transition for layout shifts — 200ms ease */
  standard: '200ms ease',
  /** Hero background transition — 300ms ease (gated in HbHeroBanner) */
  hero: '300ms ease',
  /** No motion — used when prefers-reduced-motion is active */
  none: 'none',
} as const;

// ── Focus treatment ────────────────────────────────────────────────────
// Visible focus for keyboard accessibility. Uses brand blue for
// consistency with CTA treatment.

export const HP_FOCUS = {
  /** Focus outline — 2px solid brand blue, 2px offset */
  outline: '2px solid #225391',
  /** Focus outline offset */
  outlineOffset: 2,
} as const;

// ── Shared inline style fragments ──────────────────────────────────────
// Pre-composed style objects for common patterns. Using these reduces
// object allocation in render and ensures visual consistency.

/** Standard heading reset — margin: 0 */
export const hpHeadingReset: React.CSSProperties = { margin: 0 };

/** Secondary/metadata text — reduced opacity */
export const hpSecondaryText: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  opacity: HP_TEXT_OPACITY.secondary,
};

/** Content paragraph with standard top margin */
export const hpContentParagraph: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
};

/** Badge row — flex, wrap, standard gap */
export const hpBadgeRow: React.CSSProperties = {
  display: 'flex',
  gap: HP_SPACE.md,
  marginTop: HP_SPACE.md,
  flexWrap: 'wrap',
};

/** Featured item container — P15-02: stronger border, more padding */
export const hpFeaturedContainer: React.CSSProperties = {
  marginTop: HP_SPACE.lg,
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.editorial,
};

/** Secondary items grid — P15-02: wider gap for breathing room */
export const hpSecondaryGrid: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
  marginTop: HP_SPACE.xl,
};

/** Secondary item card — P15-02: editorial radius */
export const hpSecondaryCard: React.CSSProperties = {
  padding: HP_SPACE.lg,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
};

/** Featured image */
export const hpFeaturedImage: React.CSSProperties = {
  width: '100%',
  maxHeight: HP_IMAGE.featuredMaxHeight,
  objectFit: HP_IMAGE.objectFit,
  borderRadius: HP_RADIUS.image,
};

/** Compact image (people/secondary) */
export const hpCompactImage: React.CSSProperties = {
  width: '100%',
  maxHeight: HP_IMAGE.compactMaxHeight,
  objectFit: HP_IMAGE.objectFit,
  borderRadius: HP_RADIUS.image,
};

/** List indent (milestones, quick paths) */
export const hpListStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  paddingInlineStart: 18,
  display: 'grid',
  gap: HP_SPACE.sm,
};

/** Zone flex layout (utility rail, top-band) */
export const hpZoneFlexLayout: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: HP_SPACE.xl,
};

/** CTA link — branded, weighted, no underline */
export const hpCtaLink: React.CSSProperties = {
  color: HP_CTA.color,
  fontWeight: HP_CTA.fontWeight,
  textDecoration: HP_CTA.textDecoration,
};

/** Leader attribution — weighted name line */
export const hpLeaderAttribution: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontWeight: 600,
};

/** Welcome greeting heading — signature-level */
export const hpGreetingHeading: React.CSSProperties = {
  margin: 0,
  fontSize: HP_WELCOME.greetingFontSize,
  fontWeight: HP_WELCOME.greetingFontWeight,
};

/**
 * Zone section with perceptible background tint.
 * Phase 15-02: Zone backgrounds are now strong enough to see.
 * Phase 15-09: Increased padding for premium breathing room.
 */
export function hpZoneSection(zone: keyof typeof HP_ZONE): React.CSSProperties {
  return {
    background: HP_ZONE[zone].background,
    borderRadius: HP_RADIUS.editorial,
    padding: HP_SPACE['3xl'],
  };
}

/** Branded empty state container — centered, padded, with border */
export const hpEmptyStateContainer: React.CSSProperties = {
  padding: HP_SPACE['2xl'],
  textAlign: 'center',
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(0,0,0,0.015)',
};

/** Branded loading state container — centered, padded */
export const hpLoadingStateContainer: React.CSSProperties = {
  padding: HP_SPACE['3xl'],
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: HP_SPACE.md,
};

/**
 * Branded error state container — distinct from the neutral empty/no-data
 * container so homepage users and page authors can tell a runtime
 * failure apart from an authoring gap. Uses the error status-register
 * ramp (soft red wash + red left accent) without requiring the
 * theme-scoped Griffel banner primitive, so the error state works in
 * consumer contexts that are not wrapped in HbcThemeProvider.
 */
export const hpErrorStateContainer: React.CSSProperties = {
  padding: HP_SPACE['2xl'],
  borderRadius: HP_RADIUS.card,
  background: 'rgba(220, 38, 38, 0.06)',
  borderLeft: '4px solid #DC2626',
  border: '1px solid rgba(220, 38, 38, 0.28)',
  borderLeftWidth: 4,
};

/** Detail text for the error state — subdued, monospace-ish breadcrumb. */
export const hpErrorStateDetail: React.CSSProperties = {
  marginTop: HP_SPACE.sm,
  padding: `${HP_SPACE.xs}px ${HP_SPACE.sm}px`,
  borderRadius: HP_RADIUS.image,
  background: 'rgba(0, 0, 0, 0.04)',
  color: 'rgba(0, 0, 0, 0.65)',
  fontSize: '0.8125rem',
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  wordBreak: 'break-word',
};

/** Media container — stable aspect ratio, prevents layout shift */
export const hpMediaContainer: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: HP_RADIUS.image,
  backgroundColor: 'rgba(0,0,0,0.04)',
};

/** Search input with focus-visible support */
export const hpSearchInput: React.CSSProperties = {
  width: '100%',
  marginTop: HP_SPACE.sm,
  padding: `${HP_SPACE.md}px ${HP_SPACE.lg}px`,
  borderRadius: HP_RADIUS.card,
  border: HP_BORDER.interactive,
  outline: 'none',
  transition: `border-color ${HP_MOTION.fast}`,
};
