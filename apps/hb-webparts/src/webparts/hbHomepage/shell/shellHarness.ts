// =============================================================================
// Shell harness — bounded, developer-facing closure-proof utility
// -----------------------------------------------------------------------------
// This module is a BOUNDED preview/harness path. It is NOT a tenant admin
// surface and NOT a freeform layout editor. It is a pure-function API
// that lets shell tests, shell harnesses, and closure-evidence generators
// exercise the shell at every required entry class and receive a
// structured, inspectable proof object.
//
// What this harness proves:
//   - selected entry state + selection reason
//   - preset id + band count
//   - diagnostics count (errors / warnings / info) + normalization state
//   - per-band pair vs stack outcome + reason
//   - per-slot effective column span + render mode + comfort reason
//   - short-height constrained flag
//
// What this harness does NOT do:
//   - render any child webpart
//   - mutate any production state
//   - replace the existing validation preview helpers (which remain
//     useful for property-pane-style authoring checks)
// =============================================================================

import {
  SHORT_HEIGHT_THRESHOLD_PX,
  resolveEntryStateWithReason,
  type EntryStateSelectionReason,
} from './breakpointPolicy.js';
import { resolveBandLayout, type PairingDecision } from './slotComfortResolver.js';
import {
  resolveShellConformance,
  type ShellConformanceReport,
} from './shellConformance.js';
import { parseShellLayout } from './shellValidation.js';
import { resolveFirstLaneBand } from './firstLaneResolver.js';
import type {
  ColumnSpan,
  OccupantId,
  ShellDiagnostic,
  ShellEntryStateId,
  ShellLayoutInput,
  SlotRole,
} from './shellTypes.js';

export interface ShellHarnessInput {
  readonly width: number;
  readonly height?: number;
  readonly layout?: ShellLayoutInput;
  /** Optional human-readable label used in generated evidence artifacts. */
  readonly label?: string;
}

export interface ShellHarnessSlotProof {
  readonly slotId: string;
  readonly occupantId: OccupantId | null;
  readonly role: SlotRole;
  readonly effectiveColumnSpan: ColumnSpan;
  readonly renderMode: string;
  readonly comfortReason: string;
}

export interface ShellHarnessBandProof {
  readonly bandId: string;
  readonly semanticRole: string;
  readonly isEntryBand: boolean;
  readonly columns: 1 | 2;
  readonly pairingDecision: PairingDecision;
  readonly slots: readonly ShellHarnessSlotProof[];
}

export interface ShellHarnessProof {
  readonly label: string;
  readonly input: { readonly width: number; readonly height?: number };
  readonly entryState: {
    readonly id: ShellEntryStateId;
    readonly reason: EntryStateSelectionReason;
    readonly shortHeightConstrained: boolean;
    readonly firstLaneColumns: 1 | 2;
    readonly firstLanePairingAllowed: boolean;
  };
  readonly preset: {
    readonly id: string;
    readonly title: string;
    readonly bandCount: number;
    readonly normalizedFromDefault: boolean;
  };
  readonly diagnostics: {
    readonly total: number;
    readonly errors: readonly ShellDiagnostic[];
    readonly warnings: readonly ShellDiagnostic[];
    readonly info: readonly ShellDiagnostic[];
  };
  readonly firstLaneDecision: {
    readonly action: string;
    readonly reason: string;
    readonly replacements: number;
  };
  readonly bands: readonly ShellHarnessBandProof[];
}

/**
 * Run one shell-harness case and return a full inspectable proof
 * object. This is the primitive that tests and documentation
 * generators should use to prove shell behavior at a specific entry
 * class.
 */
export function runShellHarnessCase(input: ShellHarnessInput): ShellHarnessProof {
  const resolved = resolveEntryStateWithReason({ width: input.width, height: input.height });
  const layoutState = parseShellLayout(input.layout);
  const firstLane = resolveFirstLaneBand({
    band: layoutState.preset.bands[0],
    reports: new Map(),
    entryState: resolved.state,
  });
  const resolvedBands = [firstLane.band, ...layoutState.preset.bands.slice(1)];

  const bands: ShellHarnessBandProof[] = resolvedBands.map((band, index) => {
    const isEntryBand = index === 0;
    const layout = resolveBandLayout(band, resolved.state, isEntryBand, input.width);
    return {
      bandId: band.id,
      semanticRole: band.semanticRole,
      isEntryBand,
      columns: layout.columns,
      pairingDecision: layout.pairingDecision,
      slots: layout.slots.map((s) => ({
        slotId: s.slot.id,
        occupantId: s.slot.occupantId,
        role: s.slot.role,
        effectiveColumnSpan: s.comfort.effectiveColumnSpan,
        renderMode: s.comfort.renderMode,
        comfortReason: s.comfort.reason,
      })),
    };
  });

  return {
    label: input.label ?? `${input.width}x${input.height ?? 'auto'}`,
    input: { width: input.width, height: input.height },
    entryState: {
      id: resolved.state.id,
      reason: resolved.reason,
      shortHeightConstrained: resolved.shortHeightConstrained,
      firstLaneColumns: resolved.state.firstLaneColumns,
      firstLanePairingAllowed: resolved.state.firstLanePairingAllowed,
    },
    preset: {
      id: layoutState.preset.id,
      title: layoutState.preset.title,
      bandCount: layoutState.preset.bands.length,
      normalizedFromDefault: layoutState.normalizedFromDefault,
    },
    diagnostics: {
      total: layoutState.diagnostics.length,
      errors: layoutState.diagnostics.filter((d) => d.severity === 'error'),
      warnings: layoutState.diagnostics.filter((d) => d.severity === 'warning'),
      info: layoutState.diagnostics.filter((d) => d.severity === 'info'),
    },
    firstLaneDecision: {
      action: firstLane.decision.action,
      reason: firstLane.decision.reason,
      replacements: firstLane.decision.slotDecisions.filter((d) => d.from !== d.to).length,
    },
    bands,
  };
}

// -----------------------------------------------------------------------------
// Canonical breakpoint matrix covering every required entry class.
// -----------------------------------------------------------------------------

export interface ShellBreakpointMatrixCase {
  readonly label: string;
  readonly width: number;
  readonly height?: number;
  readonly expectedEntryStateId: ShellEntryStateId;
  readonly expectedFirstLanePairing: boolean;
}

/**
 * Canonical shell breakpoint matrix. Covers every entry class in
 * HB-Shell-Entry-Breakpoint-Spec.md, including short-height constrained
 * reflow. Each case is executable through {@link runShellHarnessMatrix}.
 */
export const SHELL_BREAKPOINT_MATRIX: readonly ShellBreakpointMatrixCase[] = [
  {
    label: 'ultrawide-desktop',
    width: 1800,
    height: 1000,
    expectedEntryStateId: 'ultrawide-desktop',
    expectedFirstLanePairing: true,
  },
  {
    label: 'ultrawide-desktop-expanded-canvas',
    width: 2200,
    height: 1100,
    expectedEntryStateId: 'ultrawide-desktop',
    expectedFirstLanePairing: true,
  },
  {
    label: 'standard-laptop (primary baseline)',
    width: 1300,
    height: 900,
    expectedEntryStateId: 'standard-laptop',
    expectedFirstLanePairing: true,
  },
  {
    label: 'tablet-landscape-large',
    width: 1150,
    height: 850,
    expectedEntryStateId: 'tablet-landscape',
    expectedFirstLanePairing: false,
  },
  {
    label: 'tablet-landscape-medium',
    width: 1000,
    height: 800,
    expectedEntryStateId: 'tablet-landscape',
    expectedFirstLanePairing: false,
  },
  {
    label: 'tablet-portrait-large',
    width: 900,
    height: 1200,
    expectedEntryStateId: 'tablet-portrait-large',
    expectedFirstLanePairing: false,
  },
  {
    label: 'tablet-portrait-medium',
    width: 780,
    height: 1100,
    expectedEntryStateId: 'tablet-portrait',
    expectedFirstLanePairing: false,
  },
  {
    label: 'phone-portrait-large (iPhone 17 Pro Max)',
    width: 430,
    height: 900,
    expectedEntryStateId: 'phone-portrait',
    expectedFirstLanePairing: false,
  },
  {
    label: 'phone-portrait-standard (iPhone 17 Pro)',
    width: 390,
    height: 850,
    expectedEntryStateId: 'phone-portrait',
    expectedFirstLanePairing: false,
  },
  {
    label: 'phone-landscape (short-height constrained)',
    width: 700,
    height: 400,
    expectedEntryStateId: 'phone-landscape',
    expectedFirstLanePairing: false,
  },
  {
    label: 'constrained-reflow (desktop width, short height)',
    width: 1300,
    height: 420,
    expectedEntryStateId: 'phone-landscape',
    expectedFirstLanePairing: false,
  },
  {
    label: 'below-narrowest-fallback',
    width: 280,
    height: 700,
    expectedEntryStateId: 'phone-portrait',
    expectedFirstLanePairing: false,
  },
] as const;

export interface ShellBreakpointMatrixOutcome {
  readonly matrixCase: ShellBreakpointMatrixCase;
  readonly proof: ShellHarnessProof;
  readonly entryStateMatches: boolean;
  readonly firstLanePairingMatches: boolean;
}

/**
 * Run the full canonical breakpoint matrix against the shell. Pass an
 * optional `layout` to exercise a preset or band overrides; otherwise
 * the default preset is used. Each outcome carries the raw proof plus
 * two boolean flags indicating whether the expected entry state and
 * first-lane pairing assumption held.
 */
export function runShellHarnessMatrix(
  layout?: ShellLayoutInput,
): readonly ShellBreakpointMatrixOutcome[] {
  return SHELL_BREAKPOINT_MATRIX.map((matrixCase) => {
    const proof = runShellHarnessCase({
      width: matrixCase.width,
      height: matrixCase.height,
      layout,
      label: matrixCase.label,
    });
    return {
      matrixCase,
      proof,
      entryStateMatches: proof.entryState.id === matrixCase.expectedEntryStateId,
      firstLanePairingMatches:
        proof.entryState.firstLanePairingAllowed === matrixCase.expectedFirstLanePairing,
    };
  });
}

/**
 * Summarize a matrix run in a compact form suitable for a closure
 * report line ("[label] state=X reason=Y paired=Z bands=...").
 */
export function summarizeHarnessProof(proof: ShellHarnessProof): string {
  const bandSummary = proof.bands
    .map((b) => `${b.bandId}:${b.columns}col:${b.pairingDecision.reason}`)
    .join(' | ');
  return (
    `[${proof.label}] state=${proof.entryState.id} ` +
    `reason=${proof.entryState.reason} ` +
    `shortHeight=${proof.entryState.shortHeightConstrained} ` +
    `firstLaneAction=${proof.firstLaneDecision.action} ` +
    `preset=${proof.preset.id} ` +
    `diagnostics=${proof.diagnostics.total} ` +
    `bands=[${bandSummary}]`
  );
}

// -----------------------------------------------------------------------------
// Closure-proof matrix: harness outcome + shell conformance report per case
// -----------------------------------------------------------------------------

export interface ShellConformanceMatrixOutcome {
  readonly matrixCase: ShellBreakpointMatrixCase;
  readonly proof: ShellHarnessProof;
  readonly conformance: ShellConformanceReport;
  readonly entryStateMatches: boolean;
  readonly firstLanePairingMatches: boolean;
}

/**
 * Run the canonical breakpoint matrix and synthesize the Prompt-05
 * {@link ShellConformanceReport} for each case. This is the closure-proof
 * primitive: every matrix case carries the raw harness proof plus the
 * shell-owned conformance report (layout mode, per-band decisions,
 * per-slot state, entry-stack policy linkage), so reviewers can inspect
 * the complete shell-fit outcome per entry class in one pass.
 */
export function runShellConformanceMatrix(
  layout?: ShellLayoutInput,
): readonly ShellConformanceMatrixOutcome[] {
  return SHELL_BREAKPOINT_MATRIX.map((matrixCase) => {
    const proof = runShellHarnessCase({
      width: matrixCase.width,
      height: matrixCase.height,
      layout,
      label: matrixCase.label,
    });
    const resolved = resolveEntryStateWithReason({
      width: matrixCase.width,
      height: matrixCase.height,
    });
    const layoutState = parseShellLayout(layout);
    const firstLane = resolveFirstLaneBand({
      band: layoutState.preset.bands[0],
      reports: new Map(),
      entryState: resolved.state,
    });
    const resolvedBands = [firstLane.band, ...layoutState.preset.bands.slice(1)];
    const bandLayouts = resolvedBands.map((band, index) =>
      resolveBandLayout(band, resolved.state, index === 0, matrixCase.width),
    );
    const conformance = resolveShellConformance({
      bands: resolvedBands,
      bandLayouts,
      entryState: resolved.state,
      shortHeightConstrained: resolved.shortHeightConstrained,
      firstLaneDecision: firstLane.decision,
    });
    return {
      matrixCase,
      proof,
      conformance,
      entryStateMatches: proof.entryState.id === matrixCase.expectedEntryStateId,
      firstLanePairingMatches:
        proof.entryState.firstLanePairingAllowed === matrixCase.expectedFirstLanePairing,
    };
  });
}

// Re-export the short-height threshold for convenience in harness consumers.
export { SHORT_HEIGHT_THRESHOLD_PX };
