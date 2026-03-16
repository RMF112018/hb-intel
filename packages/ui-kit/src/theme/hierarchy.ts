/**
 * HB Intel Design System — Visual Hierarchy System (V2.1.2)
 * WS1-T04 — Anti-flatness hierarchy rules, zone distinctions, card weight
 * classes, and 3-second read standard.
 *
 * Every constant in this file is a typed reference that downstream tasks
 * (T07 component polish, T08 composition audit) consume as their governing
 * standard. Values map to existing theme tokens so the hierarchy system
 * is implementable without new visual primitives.
 */

// ---------------------------------------------------------------------------
// Content Level Hierarchy
// ---------------------------------------------------------------------------

/** The 12 content levels that appear in HB Intel interfaces */
export type ContentLevel =
  | 'pageTitle'
  | 'sectionTitle'
  | 'summaryMetric'
  | 'bodyContent'
  | 'metadata'
  | 'secondaryAnnotation'
  | 'helperText'
  | 'statusIndicator'
  | 'urgencyIndicator'
  | 'primaryAction'
  | 'secondaryAction'
  | 'destructiveAction';

export interface ContentLevelSpec {
  /** Typography token key from hbcTypeScale */
  typography: string;
  /** Font weight override (when differs from typography default) */
  fontWeight?: string;
  /** Color token reference */
  color: string;
  /** Minimum spacing above in px */
  spacingAbove: number;
  /** Visual priority rank: 1 = highest visual weight */
  priorityRank: number;
  /** Usage guidance for T07 implementers */
  usage: string;
}

/**
 * Hierarchy rule set: maps every content level to its visual treatment.
 * Priority ranks define relative visual weight — rank 1 draws the eye first.
 * Multiple levels may share a rank when they serve equivalent scanning roles.
 */
export const HBC_CONTENT_LEVELS: Record<ContentLevel, ContentLevelSpec> = {
  pageTitle: {
    typography: 'display',
    color: 'hbcColorTextPrimary',
    spacingAbove: 0,
    priorityRank: 1,
    usage: 'Largest treatment on the page; unambiguous top-level landmark. One per page.',
  },
  sectionTitle: {
    typography: 'heading1',
    color: 'hbcColorTextPrimary',
    spacingAbove: 48,
    priorityRank: 2,
    usage: 'Clearly subordinate to page title; clearly superior to body content. Separates major content groups.',
  },
  summaryMetric: {
    typography: 'heading1',
    fontWeight: '700',
    color: 'hbcColorTextPrimary',
    spacingAbove: 24,
    priorityRank: 3,
    usage: 'High visual weight for KPIs; value more prominent than label. Scannable at distance.',
  },
  bodyContent: {
    typography: 'body',
    color: 'hbcColorTextPrimary',
    spacingAbove: 16,
    priorityRank: 5,
    usage: 'Standard weight; comfortable reading density. The default for primary content text.',
  },
  metadata: {
    typography: 'bodySmall',
    color: 'hbcColorTextMuted',
    spacingAbove: 8,
    priorityRank: 7,
    usage: 'Reduced weight; must not compete with body content. Timestamps, record IDs, secondary labels.',
  },
  secondaryAnnotation: {
    typography: 'label',
    color: 'hbcColorTextMuted',
    spacingAbove: 4,
    priorityRank: 8,
    usage: 'Further reduced; supporting role only. Inline notes, edit history, counts.',
  },
  helperText: {
    typography: 'label',
    color: 'hbcColorTextMuted',
    spacingAbove: 4,
    priorityRank: 9,
    usage: 'Smallest readable size; no visual competition. Form hints, validation guidance.',
  },
  statusIndicator: {
    typography: 'label',
    fontWeight: '600',
    color: 'semantic-status',
    spacingAbove: 8,
    priorityRank: 4,
    usage: 'Semantic color treatment with bold weight for rapid scanning. Badges, row states, inline status.',
  },
  urgencyIndicator: {
    typography: 'heading4',
    fontWeight: '700',
    color: 'HBC_STATUS_COLORS.critical',
    spacingAbove: 8,
    priorityRank: 3,
    usage: 'Must stand out from status; bold + critical color. Overdue alerts, blocked items, safety flags.',
  },
  primaryAction: {
    typography: 'heading4',
    fontWeight: '600',
    color: 'HBC_ACCENT_ORANGE',
    spacingAbove: 16,
    priorityRank: 4,
    usage: 'Visually prominent; obvious without shouting. Primary CTA buttons, main form submit.',
  },
  secondaryAction: {
    typography: 'body',
    fontWeight: '500',
    color: 'HBC_PRIMARY_BLUE',
    spacingAbove: 8,
    priorityRank: 6,
    usage: 'Clearly subordinate to primary; not competing. Cancel, back, alternative options.',
  },
  destructiveAction: {
    typography: 'body',
    fontWeight: '500',
    color: 'HBC_STATUS_COLORS.error',
    spacingAbove: 8,
    priorityRank: 6,
    usage: 'Distinguishable from primary by color; not casually placed. Delete, archive, revoke.',
  },
} as const;

// ---------------------------------------------------------------------------
// Zone Distinction System
// ---------------------------------------------------------------------------

/** The 7 major page zones in HB Intel interfaces */
export type PageZone =
  | 'pageHeader'
  | 'commandArea'
  | 'filterArea'
  | 'summaryArea'
  | 'primaryContent'
  | 'secondaryDetail'
  | 'activityHistory';

export interface ZoneSpec {
  /** Surface role reference from HBC_SURFACE_ROLES */
  surfaceRole: string;
  /** Minimum internal padding token key */
  padding: string;
  /** Spacing from adjacent zones in px */
  zoneGap: number;
  /** Elevation level */
  elevation: string;
  /** Relative visual weight */
  visualWeight: 'heavy' | 'standard' | 'light';
  /** Treatment description for T07/T08 implementers */
  treatment: string;
}

/**
 * Zone distinction rules: defines the visual treatment for each major page zone.
 * Zones with 'heavy' weight draw the eye first; 'light' zones recede.
 */
export const HBC_ZONE_DISTINCTIONS: Record<PageZone, ZoneSpec> = {
  pageHeader: {
    surfaceRole: 'baseCanvas',
    padding: 'lg',
    zoneGap: 0,
    elevation: 'elevationLevel0',
    visualWeight: 'heavy',
    treatment: 'Highest-weight zone on page. Uses pageTitle + sectionTitle content levels. Distinct from command area through spacing and type scale.',
  },
  commandArea: {
    surfaceRole: 'secondaryCanvas',
    padding: 'md',
    zoneGap: 8,
    elevation: 'elevationLevel0',
    visualWeight: 'standard',
    treatment: 'Clear separation from header and content. Primary action affordances live here. Does not compete with content for attention.',
  },
  filterArea: {
    surfaceRole: 'insetPanels',
    padding: 'md',
    zoneGap: 8,
    elevation: 'elevationLevel0',
    visualWeight: 'light',
    treatment: 'Visually contained; recessed surface distinguishes from content. Scoping controls that narrow results.',
  },
  summaryArea: {
    surfaceRole: 'cards',
    padding: 'lg',
    zoneGap: 24,
    elevation: 'elevationLevel1',
    visualWeight: 'heavy',
    treatment: 'Elevated above content zone; scannable first. KPIs, metric strips, and summary cards. Uses summaryMetric content level.',
  },
  primaryContent: {
    surfaceRole: 'baseCanvas',
    padding: 'lg',
    zoneGap: 24,
    elevation: 'elevationLevel0',
    visualWeight: 'standard',
    treatment: 'Maximum reading clarity; appropriate density. The main work area — tables, detail panels, forms.',
  },
  secondaryDetail: {
    surfaceRole: 'secondaryCanvas',
    padding: 'md',
    zoneGap: 16,
    elevation: 'elevationLevel0',
    visualWeight: 'light',
    treatment: 'Lower weight than primary content. Related context, sidebar detail, linked records.',
  },
  activityHistory: {
    surfaceRole: 'secondaryCanvas',
    padding: 'md',
    zoneGap: 16,
    elevation: 'elevationLevel0',
    visualWeight: 'light',
    treatment: 'Least weight; supporting role. Temporal stream — audit trail, comments, change log.',
  },
} as const;

// ---------------------------------------------------------------------------
// Card Weight System
// ---------------------------------------------------------------------------

/** Three visual weight classes for card/panel treatment */
export type CardWeight = 'primary' | 'standard' | 'supporting';

export interface CardWeightSpec {
  /** Elevation level token reference */
  elevation: string;
  /** Border width */
  borderWidth: string;
  /** Border color token reference */
  borderColor: string;
  /** Body padding in px */
  paddingBody: number;
  /** Header/footer padding in px */
  paddingHeader: number;
  /** Background surface token */
  background: string;
  /** Usage guidance */
  usage: string;
}

/**
 * Card weight system: prevents all cards from reading as equally important.
 * Primary cards draw attention; supporting cards recede; standard is the default.
 */
export const HBC_CARD_WEIGHTS: Record<CardWeight, CardWeightSpec> = {
  primary: {
    elevation: 'elevationLevel2',
    borderWidth: '2px',
    borderColor: 'hbcColorBorderFocus',
    paddingBody: 24,
    paddingHeader: 20,
    background: 'hbcColorSurface0',
    usage: 'Carries the user\'s most important current-context information. Active project, urgent items, key metrics.',
  },
  standard: {
    elevation: 'elevationLevel1',
    borderWidth: '1px',
    borderColor: 'hbcColorBorderDefault',
    paddingBody: 24,
    paddingHeader: 16,
    background: 'hbcColorSurface0',
    usage: 'Default card treatment. Must not compete with primary cards. General content containers.',
  },
  supporting: {
    elevation: 'elevationLevel0',
    borderWidth: '1px',
    borderColor: 'hbcColorBorderDefault',
    paddingBody: 16,
    paddingHeader: 12,
    background: 'hbcColorSurface1',
    usage: 'Recedes visually. Metadata, history, secondary context. Flat with subtle background.',
  },
} as const;

// ---------------------------------------------------------------------------
// Three-Second Read Standard
// ---------------------------------------------------------------------------

export interface ThreeSecondStandard {
  /** Page title identifiable threshold */
  pageTitleThreshold: string;
  /** Primary content zone distinguishable threshold */
  primaryContentThreshold: string;
  /** Primary CTA obvious threshold */
  primaryActionThreshold: string;
  /** No critical info buried rule */
  noCriticalBuried: string;
  /** Evaluation criteria for T08 composition audit */
  evaluationCriteria: readonly string[];
}

/**
 * Operational definition of "communicates hierarchy within 3 seconds."
 * All Wave 1-critical compositions must satisfy these criteria.
 * T08 uses evaluationCriteria as the checklist for composition audit.
 */
export const HBC_THREE_SECOND_STANDARD: ThreeSecondStandard = {
  pageTitleThreshold:
    'Page title identifiable within 1 second — must use pageTitle content level; must be the largest text on the page.',
  primaryContentThreshold:
    'Primary content zone distinguishable from metadata within 2 seconds — must use distinct surface role, spacing, and typography weight from supporting zones.',
  primaryActionThreshold:
    'Primary call to action obvious within 3 seconds — must use primaryAction content level; must have visual weight above bodyContent.',
  noCriticalBuried:
    'No critical information may share identical visual treatment with metadata or secondary annotations.',
  evaluationCriteria: [
    'Page title uses display or heading1 typography — no smaller.',
    'Summary metrics use heading1 or larger with fontWeight 700.',
    'Primary content area has ≥24px spacing from adjacent zones.',
    'Supporting zones use lighter visual weight than primary content.',
    'Status indicators use semantic color — not text color alone.',
    'Primary CTA uses accent color and heading4+ weight.',
    'No more than two content levels may share the same typography token.',
  ],
} as const;
