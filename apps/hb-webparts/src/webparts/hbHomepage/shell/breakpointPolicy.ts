// =============================================================================
// Breakpoint policy — shell entry-state resolution
// -----------------------------------------------------------------------------
// This module encodes the shell's runtime entry-state model. It maps an
// observed container width (and optionally height) to a single
// {@link ShellEntryState} from the governing breakpoint spec at
// `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`.
//
// Entry-state → practical shell design target (usable content width):
//   ultrawide-desktop       → 1600–2200 px
//   standard-laptop         → ~1180–1400 px (primary baseline; max extends
//                             up to 1599 so the band stays continuous with
//                             ultrawide; CSS density still transitions at
//                             1600)
//   tablet-landscape        → ~980–1179 px (collapses spec's landscape
//                             large/medium tiers into one state — shell
//                             behavior is identical between them)
//   tablet-portrait-large   → ~820–979 px
//   tablet-portrait         → ~720–819 px
//   phone-portrait          → ~320–719 px (covers both iPhone Pro and Pro
//                             Max CSS-class usable widths; shell behavior
//                             is identical)
//   phone-landscape         → height-constrained state, not a pure width
//                             band (see `SHORT_HEIGHT_THRESHOLD_PX`)
//
// CSS / runtime threshold relationship:
//   The CSS in `HbHomepageShell.module.css` uses container queries at
//   768 / 1180 / 1600 / 1900 to adjust shell density (gap + padding). The
//   runtime thresholds declared in this file decide which entry-state and
//   first-lane policy applies. Density thresholds and state thresholds do
//   not have to be identical, but both should evolve together; the named
//   constants below are the single source of truth for runtime state
//   selection.
// =============================================================================

import type { ShellEntryState, ShellEntryStateId } from './shellTypes.js';

export const SHELL_ENTRY_STATES: readonly ShellEntryState[] = [
  {
    id: 'ultrawide-desktop',
    label: 'Premium wide composition',
    minWidth: 1600,
    maxWidth: 2200,
    firstLaneColumns: 2,
    firstLanePairingAllowed: true,
    dominanceRule: 'left-dominant',
  },
  {
    id: 'standard-laptop',
    label: 'Compressed flagship desktop (primary baseline)',
    minWidth: 1180,
    maxWidth: 1599,
    firstLaneColumns: 2,
    firstLanePairingAllowed: true,
    dominanceRule: 'left-dominant',
  },
  {
    id: 'tablet-landscape',
    label: 'Tablet landscape guided',
    minWidth: 980,
    maxWidth: 1179,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  {
    id: 'tablet-portrait-large',
    label: 'Guided single-column',
    minWidth: 820,
    maxWidth: 979,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  {
    id: 'tablet-portrait',
    label: 'Large-mobile style',
    minWidth: 720,
    maxWidth: 819,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  {
    id: 'phone-portrait',
    label: 'Immediate mobile',
    minWidth: 320,
    maxWidth: 719,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  {
    id: 'phone-landscape',
    label: 'Compact banner + fast actions',
    minWidth: 480,
    maxWidth: 960,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
] as const;

const WIDTH_ORDERED_STATES = SHELL_ENTRY_STATES.filter(
  (s) => s.id !== 'phone-landscape',
).sort((a, b) => b.minWidth - a.minWidth);

const PHONE_LANDSCAPE_STATE = SHELL_ENTRY_STATES.find(
  (s) => s.id === 'phone-landscape',
)!;

const FALLBACK_STATE = SHELL_ENTRY_STATES.find(
  (s) => s.id === 'phone-portrait',
)!;

export interface ContainerDimensions {
  readonly width: number;
  readonly height?: number;
}

/**
 * Short-height constraint threshold (CSS px). When measured container
 * height falls below this value AND the width is wide enough for the
 * phone-landscape band, the resolver overrides the width-based pick
 * with `phone-landscape` and marks the result as short-height
 * constrained. The shell then adopts `compact-banner` posture per
 * `entryStackPolicy.ts`.
 *
 * Protected by `PROTECTED_ENTRY_STATE_RULES.shortHeightConstrainedCompactBanner`.
 */
export const SHORT_HEIGHT_THRESHOLD_PX = 500 as const;

/**
 * Reason the resolver selected a given entry state. Enables inspectable
 * diagnostics distinguishing normal width-driven selection from a
 * short-height override or a bottom-of-range fallback.
 */
export type EntryStateSelectionReason =
  /** Selected because the container width matches the state's band. */
  | 'width-match'
  /** Overridden to phone-landscape because height was below the short-height threshold. */
  | 'short-height-override'
  /** Width was below every state's minimum; fell back to phone-portrait. */
  | 'fallback-below-narrowest';

/**
 * Runtime-resolved entry state plus diagnostic reason. Exposed so the
 * shell, harnesses, and tests can inspect *why* a given state applied.
 */
export interface ResolvedEntryState {
  readonly state: ShellEntryState;
  readonly reason: EntryStateSelectionReason;
  readonly shortHeightConstrained: boolean;
}

/**
 * Resolve a {@link ShellEntryState} from observed container dimensions.
 * Back-compat wrapper returning only the state. New callers should
 * prefer {@link resolveEntryStateWithReason} for inspectable selection.
 */
export function resolveEntryState(dimensions: ContainerDimensions): ShellEntryState {
  return resolveEntryStateWithReason(dimensions).state;
}

/**
 * Resolve a {@link ResolvedEntryState} from observed container
 * dimensions. Rules:
 *   1. If height is known and below `SHORT_HEIGHT_THRESHOLD_PX` and
 *      width meets the phone-landscape minimum, return
 *      `phone-landscape` with reason `short-height-override`.
 *   2. Otherwise, pick the widest-first state whose `minWidth` is
 *      satisfied by the observed width.
 *   3. If no state matched, fall back to `phone-portrait` with reason
 *      `fallback-below-narrowest`.
 */
export function resolveEntryStateWithReason(
  dimensions: ContainerDimensions,
): ResolvedEntryState {
  const { width, height } = dimensions;

  if (
    height !== undefined &&
    height < SHORT_HEIGHT_THRESHOLD_PX &&
    width >= PHONE_LANDSCAPE_STATE.minWidth
  ) {
    return {
      state: PHONE_LANDSCAPE_STATE,
      reason: 'short-height-override',
      shortHeightConstrained: true,
    };
  }

  for (const state of WIDTH_ORDERED_STATES) {
    if (width >= state.minWidth) {
      return { state, reason: 'width-match', shortHeightConstrained: false };
    }
  }

  return {
    state: FALLBACK_STATE,
    reason: 'fallback-below-narrowest',
    shortHeightConstrained: false,
  };
}

export function isFirstLanePairingAllowed(stateId: ShellEntryStateId): boolean {
  const state = SHELL_ENTRY_STATES.find((s) => s.id === stateId);
  return state?.firstLanePairingAllowed ?? false;
}

export function getEntryState(id: ShellEntryStateId): ShellEntryState | undefined {
  return SHELL_ENTRY_STATES.find((s) => s.id === id);
}
