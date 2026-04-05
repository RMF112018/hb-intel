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
 * @see docs/architecture/plans/MASTER/spfx/homepage/phase-02/Homepage-Design-Token-Map.md
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
} as const;

// ── Border radius ──────────────────────────────────────────────────────

export const HP_RADIUS = {
  /** 6px — image/media clipping */
  image: 6,
  /** 8px — standard card and container radius */
  card: 8,
  /** 10px — hero banner / prominent surface */
  hero: 10,
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
// Subtle background tints to create zone identity without breaking host awareness.

export const HP_ZONE = {
  /** Top-band: warm neutral tint */
  topBand: { background: 'rgba(34,83,145,0.03)' },
  /** Utility: clean white (default) — density creates zone identity instead of color */
  utility: { background: 'transparent' },
  /** Communications: light warm tint */
  communications: { background: 'rgba(229,126,70,0.02)' },
  /** Operational: light cool tint */
  operational: { background: 'rgba(34,83,145,0.02)' },
  /** Discovery: neutral */
  discovery: { background: 'rgba(0,0,0,0.015)' },
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
  accentWidth: 4,
  /** Greeting font size multiplier — signature-level greeting */
  greetingFontSize: '1.5rem',
  /** Greeting font weight */
  greetingFontWeight: 700,
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

/** Featured item container */
export const hpFeaturedContainer: React.CSSProperties = {
  marginTop: HP_SPACE.lg,
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.card,
};

/** Secondary items grid */
export const hpSecondaryGrid: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.lg,
  marginTop: HP_SPACE.xl,
};

/** Secondary item card */
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

/** Zone section with subtle background tint */
export function hpZoneSection(zone: keyof typeof HP_ZONE): React.CSSProperties {
  return {
    background: HP_ZONE[zone].background,
    borderRadius: HP_RADIUS.card,
    padding: HP_SPACE['2xl'],
  };
}
