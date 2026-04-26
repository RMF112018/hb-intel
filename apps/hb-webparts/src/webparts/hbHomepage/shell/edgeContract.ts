import type { BandOrientation, ColumnSpan, OccupantId } from './shellTypes.js';

// ---------------------------------------------------------------------------
// HB Homepage edge-to-window contract
// ---------------------------------------------------------------------------
// This module defines the shell + entry-stack edge contract used by the
// homepage shell renderer and the entry-stack wrapper. The contract is split
// across two authorities (deliberately):
//
//   * `HbHomepageShell` governs the post-hero shell body where Foleon lanes
//     are mounted. Its slot-level metadata (`data-shell-slot-visual-side`,
//     `data-shell-slot-edge-bleed`) is resolved here.
//
//   * `HbHomepageEntryStack` governs the hero region and shared edge
//     alignment. Its root attributes (`data-hb-homepage-edge-mode`,
//     `data-hb-homepage-hero-edge`) are resolved from the same policy
//     object exported here.
//
// Default policy preserves current visual output. Opt-in `edge-to-window`
// mode activates real CSS behavior gated by attribute selectors in the
// shell + entry-stack CSS modules. There is no property-pane surface for
// this policy yet; promotion to a property-pane control is a follow-up.
// ---------------------------------------------------------------------------

export type ShellBandLayoutMode = 'paired' | 'stacked';

export type ShellSlotVisualSide = 'left' | 'right' | 'full';

export type ShellSlotEdgeBleed = 'left' | 'right' | 'both' | 'none';

export type HomepageEdgeMode = 'standard' | 'edge-to-window';

export type HomepageHeroEdge = 'none' | 'both';

export interface HomepageEdgePolicy {
  readonly edgeMode: HomepageEdgeMode;
  readonly heroEdge: HomepageHeroEdge;
}

/**
 * Default edge policy. `standard` / `none` produces output that is
 * geometrically identical to pre-contract rendering. Hosted production
 * stays on this default until a follow-up prompt opts in.
 */
export const DEFAULT_HOMEPAGE_EDGE_POLICY: HomepageEdgePolicy = {
  edgeMode: 'standard',
  heroEdge: 'none',
};

/**
 * Occupants permitted to participate in shell edge bleed. Restricted to
 * the three Foleon-served lanes by Phase-04 Wave-01 design — Safety, HB
 * Kudos, and People & Culture must not receive Foleon edge-bleed CSS.
 */
export const EDGE_BLEED_ELIGIBLE_OCCUPANTS: ReadonlySet<OccupantId> = new Set<OccupantId>([
  'project-portfolio-spotlight',
  'company-pulse',
  'leadership-message',
]);

export function isEdgeBleedEligibleOccupant(occupantId: OccupantId | null | undefined): boolean {
  if (!occupantId) return false;
  return EDGE_BLEED_ELIGIBLE_OCCUPANTS.has(occupantId);
}

// ---------------------------------------------------------------------------
// Pure resolvers
// ---------------------------------------------------------------------------

export function resolveShellBandLayoutMode(columns: 1 | 2): ShellBandLayoutMode {
  return columns === 2 ? 'paired' : 'stacked';
}

export interface ResolveShellSlotVisualSideInput {
  readonly columns: 1 | 2;
  readonly orientation: BandOrientation;
  readonly effectiveColumnSpan: ColumnSpan;
}

/**
 * Resolve a slot's visual side from layout, orientation, and effective
 * column span. Side is **not** inferred from DOM order — right-dominant
 * preset row 2 places the major slot on the right even though Safety
 * (minor) sits first in the slot array.
 */
export function resolveShellSlotVisualSide(
  input: ResolveShellSlotVisualSideInput,
): ShellSlotVisualSide {
  if (input.columns === 1) return 'full';
  if (input.effectiveColumnSpan === 'full') return 'full';

  if (input.orientation === 'left-dominant') {
    if (input.effectiveColumnSpan === 'major') return 'left';
    if (input.effectiveColumnSpan === 'minor') return 'right';
  }

  if (input.orientation === 'right-dominant') {
    if (input.effectiveColumnSpan === 'major') return 'right';
    if (input.effectiveColumnSpan === 'minor') return 'left';
  }

  return 'full';
}

export interface ResolveShellSlotEdgeBleedInput {
  readonly occupantId: OccupantId | null | undefined;
  readonly visualSide: ShellSlotVisualSide;
}

/**
 * Resolve a slot's edge-bleed eligibility. Non-eligible occupants always
 * resolve to `none` regardless of visual side. Eligible occupants resolve
 * to `left` / `right` for paired placement and `both` for stacked /
 * full-span placement.
 */
export function resolveShellSlotEdgeBleed(
  input: ResolveShellSlotEdgeBleedInput,
): ShellSlotEdgeBleed {
  if (!isEdgeBleedEligibleOccupant(input.occupantId)) return 'none';

  switch (input.visualSide) {
    case 'left':
      return 'left';
    case 'right':
      return 'right';
    case 'full':
      return 'both';
    default:
      return 'none';
  }
}
