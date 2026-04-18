// =============================================================================
// Shell-owned conformance & mode-negotiation seam (Phase-05 Prompt-05)
// -----------------------------------------------------------------------------
// Purpose: turn the shell's runtime comfort / render-mode outcomes into a
// first-class, shell-owned surface that future shell consumers (harnesses,
// inspectors, a governed control-panel preview) can read without scraping
// DOM data-attributes or re-running the slot-comfort resolver.
//
// This module is a pure synthesis layer. It does not re-run pairing,
// comfort, or entry-state resolution; it composes their existing outputs
// (`BandLayoutResult[]`, `ShellEntryState`, `EntryStackPolicy`) into a
// reviewable `ShellConformanceReport`.
//
// Shell-ownership boundary: every field on the report is derived from
// shell-governed state. The seam never exposes child-zone internals and
// never re-opens module-maturity concerns. A future control-panel
// consumer is permitted to READ this seam; it is not permitted to mutate
// it (all returned shapes are readonly).
//
// Scope (Prompt-05):
//   - shared vocabulary for "what layout mode did the shell pick"
//   - per-band pairing decision + reason
//   - per-slot comfort state + render mode
//   - integration point with entry-stack policy (Prompt-04)
//   - stable `data-shell-*` attribute surface for the shell element
// =============================================================================

import { getEntryStackPolicy, type EntryStackPolicy } from './entryStackPolicy.js';
import type { BandLayoutResult, OccupantRenderMode, PairingDecision } from './slotComfortResolver.js';
import type {
  BandSemanticRole,
  ColumnSpan,
  OccupantId,
  ShellBand,
  ShellEntryState,
  SlotRole,
} from './shellTypes.js';

/**
 * Shell-picked macro layout mode for a given render frame. Distinct from
 * the per-band pairing decision; this is the shell-wide posture.
 *
 *  - `paired-rich`        → entry-band paired AND at least one additional
 *                           band paired (wide desktop comfort).
 *  - `paired-entry`       → only the entry band paired; other bands
 *                           stacked (primary baseline).
 *  - `stacked-full`       → every band stacked.
 *  - `short-height-compact` → shell adopted compact-banner posture under
 *                           the short-height override.
 */
export type ShellLayoutMode =
  | 'paired-rich'
  | 'paired-entry'
  | 'stacked-full'
  | 'short-height-compact';

/**
 * Conformance state for a single slot, lifted from the underlying
 * comfort resolver but framed as a stable shell-consumer vocabulary.
 */
export type SlotConformanceState =
  /** Slot width meets or exceeds occupant's preferredWidth. */
  | 'comfortable'
  /** Slot width below preferred but above minimum; render mode may step down. */
  | 'constrained'
  /** Slot width below minimum; band stacks to single-column. */
  | 'force-stacked'
  /** The slot carries no occupant. */
  | 'empty'
  /** Occupant id does not resolve to a descriptor (governance anomaly). */
  | 'unknown-occupant';

export interface SlotConformance {
  readonly slotId: string;
  readonly occupantId: OccupantId | null;
  readonly role: SlotRole;
  readonly columnSpan: ColumnSpan;
  readonly state: SlotConformanceState;
  readonly renderMode: OccupantRenderMode;
  /** Human-readable reason lifted from the comfort resolver. */
  readonly reason: string;
}

export interface BandConformance {
  readonly bandId: string;
  readonly semanticRole: BandSemanticRole;
  readonly isEntryBand: boolean;
  readonly columns: 1 | 2;
  readonly pairingDecision: PairingDecision;
  readonly slots: readonly SlotConformance[];
}

export interface ShellConformanceReport {
  /** Shell-picked macro layout mode for this frame. */
  readonly layoutMode: ShellLayoutMode;
  /** Resolved shell entry state. */
  readonly entryState: ShellEntryState;
  /** True when the phone-landscape short-height override was taken. */
  readonly shortHeightConstrained: boolean;
  /**
   * Entry-stack policy for the active entry state. Exposed so consumers
   * can align hero-height / visible-actions / first-lane expectations to
   * the same policy the shell is honoring.
   */
  readonly entryStackPolicy: EntryStackPolicy;
  /** Per-band conformance, in preset order. Index 0 is the entry band. */
  readonly bands: readonly BandConformance[];
}

export interface ShellConformanceInput {
  readonly bands: readonly ShellBand[];
  readonly bandLayouts: readonly BandLayoutResult[];
  readonly entryState: ShellEntryState;
  readonly shortHeightConstrained: boolean;
}

function deriveSlotState(
  occupantId: OccupantId | null,
  reason: string,
): SlotConformanceState {
  if (!occupantId) return 'empty';
  if (reason === 'unknown-occupant') return 'unknown-occupant';
  if (reason.startsWith('width ') && reason.includes('below minimum')) {
    return 'force-stacked';
  }
  if (reason.startsWith('constrained:')) return 'constrained';
  if (reason === 'comfortable' || reason === 'single-occupant') return 'comfortable';
  // Pairing-decision reasons emitted when the band stacked around this slot
  // (prohibited-pairing, state-denies-pairing, below-narrowest-stable-paired-width,
  // comfort-forced-stack). From the slot's perspective the slot itself is
  // still within its own comfort band; the stack is a band-level outcome.
  return 'comfortable';
}

function resolveBandConformance(
  band: ShellBand,
  layout: BandLayoutResult,
  isEntryBand: boolean,
): BandConformance {
  return {
    bandId: band.id,
    semanticRole: band.semanticRole,
    isEntryBand,
    columns: layout.columns,
    pairingDecision: layout.pairingDecision,
    slots: layout.slots.map((rs) => ({
      slotId: rs.slot.id,
      occupantId: rs.slot.occupantId,
      role: rs.slot.role,
      columnSpan: rs.comfort.effectiveColumnSpan,
      state: deriveSlotState(rs.slot.occupantId, rs.comfort.reason),
      renderMode: rs.comfort.renderMode,
      reason: rs.comfort.reason,
    })),
  };
}

function deriveLayoutMode(
  bands: readonly BandConformance[],
  shortHeightConstrained: boolean,
): ShellLayoutMode {
  if (shortHeightConstrained) return 'short-height-compact';
  const entry = bands[0];
  const entryPaired = entry?.columns === 2;
  const anyNonEntryPaired = bands.slice(1).some((b) => b.columns === 2);
  if (entryPaired && anyNonEntryPaired) return 'paired-rich';
  if (entryPaired) return 'paired-entry';
  return 'stacked-full';
}

/**
 * Synthesize a shell-owned conformance report from the shell's existing
 * per-frame outputs. Pure; does not call into the comfort resolver again.
 */
export function resolveShellConformance(
  input: ShellConformanceInput,
): ShellConformanceReport {
  const bandConformance = input.bands.map((band, index) =>
    resolveBandConformance(band, input.bandLayouts[index]!, index === 0),
  );

  return {
    layoutMode: deriveLayoutMode(bandConformance, input.shortHeightConstrained),
    entryState: input.entryState,
    shortHeightConstrained: input.shortHeightConstrained,
    entryStackPolicy: getEntryStackPolicy(input.entryState.id),
    bands: bandConformance,
  };
}

// -----------------------------------------------------------------------------
// Data-attribute surface
// -----------------------------------------------------------------------------
// Stable `data-shell-*` attribute map derived from the report. The shell
// renderer applies these attributes to the shell root so CSS, harnesses,
// and black-box tests can inspect mode-negotiation outcomes without
// reaching into React state.
// -----------------------------------------------------------------------------

export interface ShellConformanceDataAttributes {
  readonly 'data-shell-layout-mode': ShellLayoutMode;
  readonly 'data-shell-fit-path': 'usable-width-accounted' | 'short-height-override';
  readonly 'data-shell-entry-class': string;
  readonly 'data-shell-first-lane-columns': 1 | 2;
  readonly 'data-shell-short-height': 'true' | undefined;
  readonly 'data-shell-bands-paired-count': number;
  readonly 'data-shell-bands-total': number;
}

export function toShellConformanceDataAttributes(
  report: ShellConformanceReport,
): ShellConformanceDataAttributes {
  const pairedCount = report.bands.filter((b) => b.columns === 2).length;
  return {
    'data-shell-layout-mode': report.layoutMode,
    'data-shell-fit-path': report.shortHeightConstrained
      ? 'short-height-override'
      : 'usable-width-accounted',
    'data-shell-entry-class': report.entryState.id,
    'data-shell-first-lane-columns': report.bands[0]?.columns ?? 1,
    'data-shell-short-height': report.shortHeightConstrained ? 'true' : undefined,
    'data-shell-bands-paired-count': pairedCount,
    'data-shell-bands-total': report.bands.length,
  };
}
