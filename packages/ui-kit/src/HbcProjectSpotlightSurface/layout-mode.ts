/**
 * HbcProjectSpotlightSurface — explicit layout mode contract.
 *
 * The Spotlight surface is mode-governed rather than breakpoint-styled:
 * content posture (which regions are default-visible, how tall the hero
 * media reads, whether the supporting rail and inline metadata appear)
 * is resolved from the surface's own usable space, not from raw device
 * labels. Consumers of `HbcProjectSpotlightSurface` stay thin — they
 * do not select the mode; the surface resolves it internally from the
 * rendered container.
 */
// ---------------------------------------------------------------------------
// Mode contract
// ---------------------------------------------------------------------------

/**
 * Explicit layout modes for the Spotlight surface.
 *
 * - `wide`    — authored-quality editorial composition. Full media, full
 *               milestone list, inline metadata and history visible,
 *               supporting rail present.
 * - `medium`  — standard SharePoint section width. Milestone list still
 *               expanded; history still inline; rail still visible but
 *               shorter tiles.
 * - `compact` — constrained containers (sidebars, split layouts). The
 *               milestone list collapses behind a progress bar; history
 *               stays visible; rail stays but compresses; summary clamps.
 * - `minimal` — narrowest stable nested mode. Only essential editorial
 *               content: media, title, short summary, progress bar, and
 *               primary CTA. Rail, milestone list, inline history, and
 *               secondary chrome drop out.
 */
export type SpotlightLayoutMode = 'wide' | 'medium' | 'compact' | 'minimal';

/**
 * Visibility posture for a resolved mode.
 *
 * `detailsOpenByDefault` governs whether milestone / project details
 * content is expanded inline. `historyOpenByDefault` governs whether
 * the freshness / last-updated history row is shown inline without a
 * disclosure. `mediaHeight` describes the hero posture. `showRail`
 * gates the supporting rail. `showInlineMeta` governs secondary
 * metadata like the media overlay chip row and headline.
 */
export interface SpotlightLayoutVisibility {
  readonly mode: SpotlightLayoutMode;
  /**
   * Whether the featured **details region** (headline, summary, milestone
   * list, freshness row, team strip, CTA) is expanded by default. In
   * closed state only the essentials — media, title, and a single compact
   * signal — remain visible. Explicit disclosure always governs the
   * state; this flag sets only the initial posture.
   */
  readonly detailsOpenByDefault: boolean;
  readonly historyOpenByDefault: boolean;
  readonly mediaHeight: 'tall' | 'standard' | 'reduced' | 'compressed';
  readonly showRail: boolean;
  readonly showInlineMeta: boolean;
  readonly showHeadline: boolean;
  readonly summaryLineClamp: number;
  readonly showMilestoneList: boolean;
  readonly showMilestoneProgress: boolean;
}

/**
 * Visibility matrix keyed by mode. Single source of truth for what each
 * mode shows by default — not derived from CSS. CSS progressively
 * polishes the rendered result via `data-layout-mode`, but the default
 * visibility rules live here.
 */
export const SPOTLIGHT_LAYOUT_VISIBILITY: Readonly<
  Record<SpotlightLayoutMode, SpotlightLayoutVisibility>
> = {
  wide: {
    mode: 'wide',
    detailsOpenByDefault: true,
    historyOpenByDefault: true,
    mediaHeight: 'tall',
    showRail: true,
    showInlineMeta: true,
    showHeadline: true,
    summaryLineClamp: 4,
    showMilestoneList: true,
    showMilestoneProgress: true,
  },
  medium: {
    mode: 'medium',
    detailsOpenByDefault: true,
    historyOpenByDefault: true,
    mediaHeight: 'standard',
    showRail: true,
    showInlineMeta: true,
    showHeadline: true,
    summaryLineClamp: 3,
    showMilestoneList: true,
    showMilestoneProgress: true,
  },
  compact: {
    mode: 'compact',
    detailsOpenByDefault: false,
    historyOpenByDefault: true,
    mediaHeight: 'reduced',
    showRail: true,
    showInlineMeta: false,
    showHeadline: true,
    summaryLineClamp: 2,
    showMilestoneList: true,
    showMilestoneProgress: true,
  },
  minimal: {
    mode: 'minimal',
    detailsOpenByDefault: false,
    historyOpenByDefault: false,
    mediaHeight: 'compressed',
    showRail: false,
    showInlineMeta: false,
    showHeadline: false,
    summaryLineClamp: 2,
    showMilestoneList: false,
    showMilestoneProgress: true,
  },
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

/**
 * Width thresholds (in CSS px of usable container width) for the mode
 * resolver. Tuned to real SharePoint section widths:
 *   - ~1040px section at desktop                → wide
 *   - ~760–1040px section (narrow page section) → medium
 *   - ~440–760px (sidebar / two-up composition) → compact
 *   - <440px (deeply nested / mobile column)    → minimal
 */
export const SPOTLIGHT_LAYOUT_WIDTH_THRESHOLDS = {
  wide: 1040,
  medium: 760,
  compact: 440,
} as const;

/**
 * Vertical pressure threshold. If usable vertical space is below this
 * (e.g. surface rendered in a height-constrained slot), the resolver
 * steps the mode down one tier — a surface that is wide but very short
 * should not pretend to be `wide` with tall media.
 */
export const SPOTLIGHT_LAYOUT_HEIGHT_PRESSURE_PX = 520;

export interface ResolveSpotlightLayoutInput {
  readonly width: number;
  readonly height?: number;
}

function stepDown(mode: SpotlightLayoutMode): SpotlightLayoutMode {
  switch (mode) {
    case 'wide':
      return 'medium';
    case 'medium':
      return 'compact';
    case 'compact':
      return 'minimal';
    case 'minimal':
      return 'minimal';
  }
}

/**
 * Pure mode resolver. Exported for tests, stories, and deterministic
 * rendering. Callers that need live measurement should use the
 * `useSpotlightLayoutMode` hook instead.
 */
export function resolveSpotlightLayoutMode({
  width,
  height,
}: ResolveSpotlightLayoutInput): SpotlightLayoutMode {
  let mode: SpotlightLayoutMode;
  if (width >= SPOTLIGHT_LAYOUT_WIDTH_THRESHOLDS.wide) {
    mode = 'wide';
  } else if (width >= SPOTLIGHT_LAYOUT_WIDTH_THRESHOLDS.medium) {
    mode = 'medium';
  } else if (width >= SPOTLIGHT_LAYOUT_WIDTH_THRESHOLDS.compact) {
    mode = 'compact';
  } else {
    mode = 'minimal';
  }

  if (
    typeof height === 'number' &&
    height > 0 &&
    height < SPOTLIGHT_LAYOUT_HEIGHT_PRESSURE_PX
  ) {
    mode = stepDown(mode);
  }

  return mode;
}

/**
 * Convenience accessor for the visibility posture of a given mode.
 */
export function getSpotlightLayoutVisibility(
  mode: SpotlightLayoutMode,
): SpotlightLayoutVisibility {
  return SPOTLIGHT_LAYOUT_VISIBILITY[mode];
}

export interface SpotlightLayoutDataAttr {
  'data-layout-mode': SpotlightLayoutMode;
}

export function spotlightLayoutDataAttr(
  mode: SpotlightLayoutMode,
): SpotlightLayoutDataAttr {
  return { 'data-layout-mode': mode };
}
