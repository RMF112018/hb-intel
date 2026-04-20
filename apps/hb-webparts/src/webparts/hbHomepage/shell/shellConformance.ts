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
import { SHELL_PROTECTED_DECISIONS } from './protectedDecisions.js';
import type { BandLayoutResult, OccupantRenderMode, PairingDecision } from './slotComfortResolver.js';
import type { FirstLaneDecision } from './firstLaneResolver.js';
import type { ProtectedRowPairing, ShellDiagnostic, ShellPreset } from './shellTypes.js';
import type {
  BandOrientation,
  BandSemanticRole,
  ColumnSpan,
  OccupantId,
  ShellBand,
  ShellBandRecipeId,
  ShellEntryState,
  SlotRole,
} from './shellTypes.js';
import { effectiveBandOrientation } from './shellTypes.js';

/** Orientation value emitted on the band conformance record. `stacked`
 *  is reported for single-column bands so consumers can distinguish
 *  "rendering as stacked" from "paired with no handedness declared". */
export type BandOrientationState = BandOrientation | 'stacked';

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
  readonly recipe: ShellBandRecipeId;
  readonly fallbackRecipe: ShellBandRecipeId;
  readonly isEntryBand: boolean;
  readonly columns: 1 | 2;
  /** `'stacked'` for single-column bands; otherwise the band's declared
   *  (or defaulted) handedness. */
  readonly orientation: BandOrientationState;
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
  readonly firstLaneDecision?: {
    action: FirstLaneDecision['action'];
    reason: string;
    replacements: number;
    candidatesConsidered: number;
  };
  /** Per-band conformance, in preset order. Index 0 is the entry band. */
  readonly bands: readonly BandConformance[];
}

export interface ShellConformanceInput {
  readonly bands: readonly ShellBand[];
  readonly bandLayouts: readonly BandLayoutResult[];
  readonly entryState: ShellEntryState;
  readonly shortHeightConstrained: boolean;
  readonly firstLaneDecision?: FirstLaneDecision;
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
  const orientation: BandOrientationState =
    layout.columns === 2 ? effectiveBandOrientation(band) : 'stacked';
  return {
    bandId: band.id,
    semanticRole: band.semanticRole,
    recipe: layout.recipe,
    fallbackRecipe: layout.fallbackRecipe,
    isEntryBand,
    columns: layout.columns,
    orientation,
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
    firstLaneDecision: input.firstLaneDecision
      ? {
          action: input.firstLaneDecision.action,
          reason: input.firstLaneDecision.reason,
          replacements: input.firstLaneDecision.slotDecisions.filter((d) => d.from !== d.to).length,
          candidatesConsidered: input.firstLaneDecision.candidateEvaluations?.length ?? 0,
        }
      : undefined,
    bands: bandConformance,
  };
}

// =============================================================================
// Wave-01 Prompt-04 — Shell closure proof
// -----------------------------------------------------------------------------
// `ShellClosureProof` is a deterministic, inspectable aggregate that asserts
// the rendered shell matches the locked three-row composition governed by
// `SHELL_PROTECTED_DECISIONS.protectedRowPairings`. It synthesizes only
// from the existing conformance report + the active preset + the live
// diagnostics list — no resolver re-entry, no child-zone coupling.
//
// The proof is intentionally flat and boolean-heavy so a harness, a test,
// or a hosted DOM inspector can read it without any domain knowledge.
// `closureHolds` is the single aggregate predicate; `closureNotes` is a
// short human-readable log of every failing sub-claim for closure review.
// =============================================================================

export interface OccupantMembershipCheckRow {
  readonly rowKey: ProtectedRowPairing['rowKey'];
  readonly bandSemanticRole: ProtectedRowPairing['bandSemanticRole'];
  readonly expectedPrimaryOccupantId: ProtectedRowPairing['primaryOccupantId'];
  readonly expectedSecondaryOccupantId: ProtectedRowPairing['secondaryOccupantId'];
  readonly actualPrimaryOccupantId: string | null;
  readonly actualSecondaryOccupantId: string | null;
  readonly primaryMatches: boolean;
  readonly secondaryMatches: boolean;
}

export type BandOrientationSequence = readonly BandOrientationState[];

export interface ShellClosureProof {
  /** Locked row count. Always `3`. */
  readonly expectedRowCount: 3;
  readonly rowCount: number;

  readonly expectedRowOrder: readonly ProtectedRowPairing['bandSemanticRole'][];
  readonly rowOrder: readonly string[];
  readonly rowOrderMatches: boolean;

  readonly occupantMembership: readonly OccupantMembershipCheckRow[];
  readonly occupantsAppearOnce: boolean;
  /** Occupant ids rendered that are not part of the locked six-surface set. */
  readonly extraOccupants: readonly string[];
  /** Occupant ids from the locked six-surface set that are missing from the preset. */
  readonly missingOccupants: readonly string[];

  /** Per-band orientation reported by conformance. `'stacked'` for
   *  single-column bands at handheld / narrow entry states. */
  readonly orientationSequence: BandOrientationSequence;
  readonly expectedOrientationSequenceAtPairedTier: readonly [
    BandOrientationState,
    BandOrientationState,
    BandOrientationState,
  ];
  /** True only when every band is paired AND the orientation sequence
   *  equals `['left-dominant','right-dominant','left-dominant']`. */
  readonly handednessAlternates: boolean;

  /** True when every band expected to pair at the active entry state
   *  actually reports `columns === 2`. False surfaces the standard-laptop
   *  case where minor-slot thresholds still force Rows 1 and 3 to stack. */
  readonly pairingResolvedAtTier: boolean;

  /** True when the entry state is a handheld / short-height state AND
   *  every band reports `columns: 1` with `orientation: 'stacked'`. */
  readonly handheldStackCollapseClean: boolean;

  /** Mirrors whether validation surfaced any Prompt-03 protected-row
   *  drift diagnostics. `false` when the preset is clean, `true` when
   *  `PROTECTED_ROW_PAIRING_*` or `PROTECTED_ROW_ORIENTATION_*` fired. */
  readonly driftDiagnosticsSurfaced: boolean;

  /** Aggregate closure predicate. True when the shell is demonstrably
   *  rendering the locked arrangement at the active entry state. */
  readonly closureHolds: boolean;

  /** Short human-readable reasons for any failing sub-claim. Empty when
   *  `closureHolds === true`. */
  readonly closureNotes: readonly string[];
}

export interface ShellClosureProofInput {
  readonly conformance: ShellConformanceReport;
  readonly preset: ShellPreset;
  readonly diagnostics: readonly ShellDiagnostic[];
}

const HANDHELD_ENTRY_STATES = new Set([
  'tablet-portrait-large',
  'tablet-portrait',
  'phone-portrait',
  'phone-landscape',
]);

function isHandheldTier(report: ShellConformanceReport): boolean {
  return (
    HANDHELD_ENTRY_STATES.has(report.entryState.id) ||
    report.shortHeightConstrained ||
    !report.entryState.firstLanePairingAllowed
  );
}

export function resolveShellClosureProof(input: ShellClosureProofInput): ShellClosureProof {
  const { conformance, preset, diagnostics } = input;
  const locked = SHELL_PROTECTED_DECISIONS.protectedRowPairings;
  const expectedRowOrder = locked.map((p) => p.bandSemanticRole);
  const expectedOrientationSequence: [
    BandOrientationState,
    BandOrientationState,
    BandOrientationState,
  ] = [locked[0]!.orientation, locked[1]!.orientation, locked[2]!.orientation];

  const rowOrder = conformance.bands.map((b) => b.semanticRole);
  const rowOrderMatches =
    rowOrder.length === expectedRowOrder.length &&
    rowOrder.every((role, i) => role === expectedRowOrder[i]);

  // Build per-row membership check against the authored preset. Slot
  // occupancy can diverge from conformance at handheld (first-lane
  // resolver reshuffles) so we consult the preset slot array directly.
  const occupantMembership: OccupantMembershipCheckRow[] = locked.map((target) => {
    const band = preset.bands.find((b) => b.semanticRole === target.bandSemanticRole);
    const primarySlot = band?.slots.find((s) => s.role === 'primary');
    const secondarySlot = band?.slots.find((s) => s.role === 'secondary');
    const actualPrimary = primarySlot?.occupantId ?? null;
    const actualSecondary = secondarySlot?.occupantId ?? null;
    return {
      rowKey: target.rowKey,
      bandSemanticRole: target.bandSemanticRole,
      expectedPrimaryOccupantId: target.primaryOccupantId,
      expectedSecondaryOccupantId: target.secondaryOccupantId,
      actualPrimaryOccupantId: actualPrimary,
      actualSecondaryOccupantId: actualSecondary,
      primaryMatches: actualPrimary === target.primaryOccupantId,
      secondaryMatches: actualSecondary === target.secondaryOccupantId,
    };
  });

  const occupantCounts = new Map<string, number>();
  for (const band of preset.bands) {
    for (const slot of band.slots) {
      if (slot.occupantId === null) continue;
      const id: string = slot.occupantId;
      occupantCounts.set(id, (occupantCounts.get(id) ?? 0) + 1);
    }
  }
  const expectedOccupantIds = new Set<string>([
    ...locked.map((p) => p.primaryOccupantId as string),
    ...locked.map((p) => p.secondaryOccupantId as string),
  ]);
  const occupantsAppearOnce = [...occupantCounts.values()].every((c) => c === 1);
  const extraOccupants = [...occupantCounts.keys()].filter((id) => !expectedOccupantIds.has(id));
  const missingOccupants = [...expectedOccupantIds].filter((id) => !occupantCounts.has(id));

  const orientationSequence: BandOrientationSequence = conformance.bands.map((b) => b.orientation);
  const allPaired = conformance.bands.every((b) => b.columns === 2);
  const handednessAlternates =
    allPaired &&
    orientationSequence.length === expectedOrientationSequence.length &&
    orientationSequence.every((o, i) => o === expectedOrientationSequence[i]);

  const handheld = isHandheldTier(conformance);
  const pairingResolvedAtTier = handheld ? true : allPaired;

  const handheldStackCollapseClean =
    handheld &&
    conformance.bands.every((b) => b.columns === 1 && b.orientation === 'stacked');

  const driftDiagnosticsSurfaced = diagnostics.some(
    (d) =>
      d.code === 'PROTECTED_ROW_PAIRING_MISSING' ||
      d.code === 'PROTECTED_ROW_PAIRING_DRIFT' ||
      d.code === 'PROTECTED_ROW_ORIENTATION_DRIFT',
  );

  const notes: string[] = [];
  if (!rowOrderMatches) {
    notes.push(
      `row-order-mismatch: expected [${expectedRowOrder.join(', ')}] got [${rowOrder.join(', ')}]`,
    );
  }
  for (const row of occupantMembership) {
    if (!row.primaryMatches) {
      notes.push(
        `${row.rowKey}-primary-drift: expected ${row.expectedPrimaryOccupantId} got ${row.actualPrimaryOccupantId ?? 'none'}`,
      );
    }
    if (!row.secondaryMatches) {
      notes.push(
        `${row.rowKey}-secondary-drift: expected ${row.expectedSecondaryOccupantId} got ${row.actualSecondaryOccupantId ?? 'none'}`,
      );
    }
  }
  if (!occupantsAppearOnce) {
    notes.push(
      `occupant-duplication: ${[...occupantCounts.entries()]
        .filter(([, c]) => c > 1)
        .map(([id, c]) => `${id}×${c}`)
        .join(', ')}`,
    );
  }
  if (extraOccupants.length > 0) {
    notes.push(`extra-occupants: ${extraOccupants.join(', ')}`);
  }
  if (missingOccupants.length > 0) {
    notes.push(`missing-occupants: ${missingOccupants.join(', ')}`);
  }
  if (!handheld && !pairingResolvedAtTier) {
    const stacked = conformance.bands
      .filter((b) => b.columns !== 2)
      .map((b) => `${b.bandId}:${b.pairingDecision.reason}`);
    notes.push(
      `pairing-not-resolved-at-${conformance.entryState.id}: ${stacked.join('; ')} — expected paired at this tier; surface-level thresholds keep Rows 1/3 stacked below ultrawide until Wave-02 hardens HB Kudos + PCP narrow-slot fit`,
    );
  }
  if (!handheld && !handednessAlternates && allPaired) {
    notes.push(
      `handedness-sequence-drift: expected [${expectedOrientationSequence.join(', ')}] got [${orientationSequence.join(', ')}]`,
    );
  }
  if (handheld && !handheldStackCollapseClean) {
    const dirty = conformance.bands
      .filter((b) => b.columns !== 1 || b.orientation !== 'stacked')
      .map((b) => `${b.bandId}:columns=${b.columns},orientation=${b.orientation}`);
    notes.push(`handheld-stack-not-clean: ${dirty.join('; ')}`);
  }
  if (driftDiagnosticsSurfaced) {
    notes.push('protected-row-drift-diagnostics-surfaced');
  }

  const closureHolds =
    rowOrderMatches &&
    occupantMembership.every((r) => r.primaryMatches && r.secondaryMatches) &&
    occupantsAppearOnce &&
    extraOccupants.length === 0 &&
    missingOccupants.length === 0 &&
    !driftDiagnosticsSurfaced &&
    (handheld ? handheldStackCollapseClean : handednessAlternates && pairingResolvedAtTier);

  return {
    expectedRowCount: 3,
    rowCount: conformance.bands.length,
    expectedRowOrder,
    rowOrder,
    rowOrderMatches,
    occupantMembership,
    occupantsAppearOnce,
    extraOccupants,
    missingOccupants,
    orientationSequence,
    expectedOrientationSequenceAtPairedTier: expectedOrientationSequence,
    handednessAlternates,
    pairingResolvedAtTier,
    handheldStackCollapseClean,
    driftDiagnosticsSurfaced,
    closureHolds,
    closureNotes: notes,
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
  readonly 'data-shell-blackbox-contract': 'prompt07-blackbox-v1';
  readonly 'data-shell-layout-mode': ShellLayoutMode;
  readonly 'data-shell-fit-path': 'usable-width-accounted' | 'short-height-override';
  readonly 'data-shell-entry-class': string;
  readonly 'data-shell-first-lane-first-view': EntryStackPolicy['firstLaneFirstView'];
  readonly 'data-shell-first-lane-columns': 1 | 2;
  readonly 'data-shell-short-height': 'true' | undefined;
  readonly 'data-shell-bands-paired-count': number;
  readonly 'data-shell-bands-total': number;
  readonly 'data-shell-entry-band-recipe': ShellBandRecipeId | 'none';
  readonly 'data-shell-fit-contract-denials': number;
  readonly 'data-shell-pairing-guard-violations': number;
  readonly 'data-shell-force-stacked-slot-count': number;
  readonly 'data-shell-constrained-slot-count': number;
  readonly 'data-shell-first-lane-action-detail': FirstLaneDecision['action'] | 'none';
  readonly 'data-shell-first-lane-reason-detail': string;
  readonly 'data-shell-first-lane-candidates-considered': number;
  /** Comma-separated per-band orientation values, in preset order. */
  readonly 'data-shell-band-orientations': string;
  /** Wave-01 Prompt-04 closure aggregate. `'true'` when the shell
   *  demonstrably matches the locked three-row composition at the
   *  active entry state; `'false'` otherwise. */
  readonly 'data-shell-closure-holds': 'true' | 'false';
  /** Comma-separated row-order semantic roles, in rendered order.
   *  Enables hosted DOM inspection without scraping React state. */
  readonly 'data-shell-closure-row-order': string;
}

export interface ToShellConformanceDataAttributesOptions {
  readonly closure?: ShellClosureProof;
}

export function toShellConformanceDataAttributes(
  report: ShellConformanceReport,
  options: ToShellConformanceDataAttributesOptions = {},
): ShellConformanceDataAttributes {
  const pairedCount = report.bands.filter((b) => b.columns === 2).length;
  const fitContractDenials = report.bands.filter(
    (b) => b.pairingDecision.reason === 'fit-contract-denies-pairing',
  ).length;
  const pairingGuardViolations = report.bands.filter(
    (b) => b.pairingDecision.reason === 'prohibited-pairing',
  ).length;
  const allSlots = report.bands.flatMap((b) => b.slots);
  const forceStackedSlots = allSlots.filter((s) => s.state === 'force-stacked').length;
  const constrainedSlots = allSlots.filter((s) => s.state === 'constrained').length;
  return {
    'data-shell-blackbox-contract': 'prompt07-blackbox-v1',
    'data-shell-layout-mode': report.layoutMode,
    'data-shell-fit-path': report.shortHeightConstrained
      ? 'short-height-override'
      : 'usable-width-accounted',
    'data-shell-entry-class': report.entryState.id,
    'data-shell-first-lane-first-view': report.entryStackPolicy.firstLaneFirstView,
    'data-shell-first-lane-columns': report.bands[0]?.columns ?? 1,
    'data-shell-short-height': report.shortHeightConstrained ? 'true' : undefined,
    'data-shell-bands-paired-count': pairedCount,
    'data-shell-bands-total': report.bands.length,
    'data-shell-entry-band-recipe': report.bands[0]?.recipe ?? 'none',
    'data-shell-fit-contract-denials': fitContractDenials,
    'data-shell-pairing-guard-violations': pairingGuardViolations,
    'data-shell-force-stacked-slot-count': forceStackedSlots,
    'data-shell-constrained-slot-count': constrainedSlots,
    'data-shell-first-lane-action-detail': report.firstLaneDecision?.action ?? 'none',
    'data-shell-first-lane-reason-detail': report.firstLaneDecision?.reason ?? 'none',
    'data-shell-first-lane-candidates-considered':
      report.firstLaneDecision?.candidatesConsidered ?? 0,
    'data-shell-band-orientations': report.bands.map((b) => b.orientation).join(','),
    'data-shell-closure-holds': options.closure?.closureHolds ? 'true' : 'false',
    'data-shell-closure-row-order':
      options.closure?.rowOrder.join(',') ?? report.bands.map((b) => b.semanticRole).join(','),
  };
}
