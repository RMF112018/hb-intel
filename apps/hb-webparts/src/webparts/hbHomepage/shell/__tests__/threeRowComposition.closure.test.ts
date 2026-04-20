import { describe, it, expect } from 'vitest';
import { runShellHarnessCase } from '../shellHarness.js';
import { parseShellLayout } from '../shellValidation.js';
import { resolveBandLayout } from '../slotComfortResolver.js';
import {
  resolveShellClosureProof,
  resolveShellConformance,
  toShellConformanceDataAttributes,
} from '../shellConformance.js';
import { DEFAULT_PRESET } from '../defaultPreset.js';
import { SHELL_PROTECTED_DECISIONS } from '../protectedDecisions.js';
import { getEntryState } from '../breakpointPolicy.js';
import type { OccupantId } from '../shellTypes.js';

/**
 * Wave-01 Prompt-04 closure proof.
 *
 * Deterministic assertions on the locked three-row composition at every
 * tier we care about: ultrawide-desktop (pairing tier), standard-laptop
 * (Wave-02 fit gap), and phone-portrait (handheld fallback). The proof
 * consumes only existing conformance + preset + diagnostics state; no
 * resolver re-entry, no subjective visual review.
 */

const EXPECTED_ROW_ORDER = [
  'operational-spotlight',
  'communications-newsroom',
  'communications-editorial',
] as const;

const EXPECTED_OCCUPANTS = new Set<OccupantId>([
  'project-portfolio-spotlight',
  'hb-kudos',
  'company-pulse',
  'safety-field-excellence',
  'leadership-message',
  'people-culture-public',
]);

function buildProof(width: number, height: number) {
  const proof = runShellHarnessCase({ width, height, label: `closure-${width}x${height}` });
  const layoutState = parseShellLayout(undefined);
  const entry = getEntryState(proof.entryState.id)!;
  const bandLayouts = DEFAULT_PRESET.bands.map((b, i) =>
    resolveBandLayout(b, entry, i === 0, width),
  );
  const conformance = resolveShellConformance({
    bands: DEFAULT_PRESET.bands,
    bandLayouts,
    entryState: entry,
    shortHeightConstrained: proof.entryState.shortHeightConstrained,
  });
  const closure = resolveShellClosureProof({
    conformance,
    preset: DEFAULT_PRESET,
    diagnostics: layoutState.diagnostics,
  });
  return { proof, conformance, closure };
}

describe('three-row composition — row order + membership (tier-independent)', () => {
  it('pins row count to 3 and row order to the locked sequence at ultrawide', () => {
    const { closure } = buildProof(1800, 1080);
    expect(closure.rowCount).toBe(3);
    expect(closure.expectedRowCount).toBe(3);
    expect(closure.rowOrder).toEqual(EXPECTED_ROW_ORDER);
    expect(closure.rowOrderMatches).toBe(true);
  });

  it('pins each of the six approved occupants to its target row+role', () => {
    const { closure } = buildProof(1800, 1080);
    for (const row of closure.occupantMembership) {
      const expected = SHELL_PROTECTED_DECISIONS.protectedRowPairings.find(
        (p) => p.rowKey === row.rowKey,
      );
      expect(expected).toBeDefined();
      expect(row.actualPrimaryOccupantId).toBe(expected!.primaryOccupantId);
      expect(row.actualSecondaryOccupantId).toBe(expected!.secondaryOccupantId);
      expect(row.primaryMatches).toBe(true);
      expect(row.secondaryMatches).toBe(true);
    }
  });

  it('proves each occupant appears exactly once with no extras and no gaps', () => {
    const { closure } = buildProof(1800, 1080);
    expect(closure.occupantsAppearOnce).toBe(true);
    expect(closure.extraOccupants).toEqual([]);
    expect(closure.missingOccupants).toEqual([]);
    const rendered = new Set(
      DEFAULT_PRESET.bands
        .flatMap((b) => b.slots.map((s) => s.occupantId))
        .filter((id): id is OccupantId => id !== null),
    );
    expect(rendered).toEqual(EXPECTED_OCCUPANTS);
  });

  it('surfaces no protected-row drift diagnostics against the default preset', () => {
    const { closure } = buildProof(1800, 1080);
    expect(closure.driftDiagnosticsSurfaced).toBe(false);
  });
});

describe('three-row composition — ultrawide-desktop (all three rows pair)', () => {
  it('every band pairs with the expected handedness', () => {
    const { conformance } = buildProof(1800, 1080);
    expect(conformance.bands[0].columns).toBe(2);
    expect(conformance.bands[0].orientation).toBe('left-dominant');
    expect(conformance.bands[0].pairingDecision.reason).toBe('paired');
    expect(conformance.bands[1].columns).toBe(2);
    expect(conformance.bands[1].orientation).toBe('right-dominant');
    expect(conformance.bands[1].pairingDecision.reason).toBe('paired');
    expect(conformance.bands[2].columns).toBe(2);
    expect(conformance.bands[2].orientation).toBe('left-dominant');
    expect(conformance.bands[2].pairingDecision.reason).toBe('paired');
  });

  it('orientationSequence is left-right-left and handedness alternates', () => {
    const { closure } = buildProof(1800, 1080);
    expect(closure.orientationSequence).toEqual([
      'left-dominant',
      'right-dominant',
      'left-dominant',
    ]);
    expect(closure.expectedOrientationSequenceAtPairedTier).toEqual([
      'left-dominant',
      'right-dominant',
      'left-dominant',
    ]);
    expect(closure.handednessAlternates).toBe(true);
  });

  it('minor-slot width math follows the 1/3 contract and Row-1 pairing uses it', () => {
    // Prompt-02 contract: resolveSlotWidth returns 2/3 for major and 1/3
    // for minor at 2-column layouts. At 1800px: major = 1200, minor = 600.
    const entry = getEntryState('ultrawide-desktop')!;
    const row1 = resolveBandLayout(DEFAULT_PRESET.bands[0], entry, true, 1800);
    const primary = row1.slots.find((s) => s.slot.columnSpan === 'major')!;
    const secondary = row1.slots.find((s) => s.slot.columnSpan === 'minor')!;
    expect(row1.columns).toBe(2);
    // primary at 1200 is above PPS preferred 720 → comfortable;
    // secondary at 600 is above Kudos narrow 320 but below preferred 720
    // → constrained.
    expect(primary.comfort.reason).toBe('comfortable');
    expect(secondary.comfort.reason).toContain('constrained');
  });

  it('closureHolds = true at ultrawide with no closureNotes', () => {
    const { conformance, closure } = buildProof(1800, 1080);
    expect(closure.closureHolds).toBe(true);
    expect(closure.pairingResolvedAtTier).toBe(true);
    expect(closure.closureNotes).toEqual([]);
    const attrs = toShellConformanceDataAttributes(conformance, { closure });
    expect(attrs['data-shell-closure-holds']).toBe('true');
    expect(attrs['data-shell-closure-row-order']).toBe(EXPECTED_ROW_ORDER.join(','));
    expect(attrs['data-shell-band-orientations']).toBe(
      'left-dominant,right-dominant,left-dominant',
    );
  });
});

describe('three-row composition — standard-laptop (closure holds)', () => {
  it('row order, membership, and pairing all hold at 1300px', () => {
    const { closure } = buildProof(1300, 900);
    expect(closure.rowOrder).toEqual(EXPECTED_ROW_ORDER);
    expect(closure.rowOrderMatches).toBe(true);
    expect(closure.occupantsAppearOnce).toBe(true);
    expect(closure.extraOccupants).toEqual([]);
    expect(closure.missingOccupants).toEqual([]);
    expect(closure.driftDiagnosticsSurfaced).toBe(false);
    expect(closure.pairingResolvedAtTier).toBe(true);
    expect(closure.handednessAlternates).toBe(true);
  });

  it('closureHolds = true and the attribute surface reflects it', () => {
    const { conformance, closure } = buildProof(1300, 900);
    expect(closure.closureHolds).toBe(true);
    expect(closure.closureNotes).toEqual([]);
    const attrs = toShellConformanceDataAttributes(conformance, { closure });
    expect(attrs['data-shell-closure-holds']).toBe('true');
    expect(attrs['data-shell-band-orientations']).toBe(
      'left-dominant,right-dominant,left-dominant',
    );
  });
});

describe('three-row composition — tablet-landscape (Prompt-05 closure)', () => {
  it('every band pairs at 1050×800 Retina-default CSS viewport', () => {
    const { conformance, closure } = buildProof(1050, 800);
    expect(conformance.entryState.id).toBe('tablet-landscape');
    for (const band of conformance.bands) {
      expect(band.columns).toBe(2);
      expect(band.pairingDecision.reason).toBe('paired');
    }
    expect(closure.handednessAlternates).toBe(true);
    expect(closure.closureHolds).toBe(true);
    expect(closure.closureNotes).toEqual([]);
    const attrs = toShellConformanceDataAttributes(conformance, { closure });
    expect(attrs['data-shell-closure-holds']).toBe('true');
    expect(attrs['data-shell-band-orientations']).toBe(
      'left-dominant,right-dominant,left-dominant',
    );
  });
});

describe('three-row composition — phone-portrait (handheld fallback)', () => {
  it('every band collapses to columns=1 with orientation="stacked"', () => {
    const { conformance, closure } = buildProof(400, 720);
    for (const band of conformance.bands) {
      expect(band.columns).toBe(1);
      expect(band.orientation).toBe('stacked');
    }
    expect(closure.handheldStackCollapseClean).toBe(true);
  });

  it('layoutMode is stacked-full', () => {
    const { conformance } = buildProof(400, 720);
    expect(conformance.layoutMode).toBe('stacked-full');
  });

  it('closureHolds = true under handheld (stack-collapse is the correct closure)', () => {
    const { conformance, closure } = buildProof(400, 720);
    expect(closure.closureHolds).toBe(true);
    expect(closure.closureNotes).toEqual([]);
    const attrs = toShellConformanceDataAttributes(conformance, { closure });
    expect(attrs['data-shell-closure-holds']).toBe('true');
    expect(attrs['data-shell-layout-mode']).toBe('stacked-full');
    expect(attrs['data-shell-band-orientations']).toBe('stacked,stacked,stacked');
  });
});

describe('three-row composition — drift scenarios flip closure off', () => {
  it('dropping Row 3 from a synthesized preset surfaces drift and flips closureHolds', () => {
    const driftPreset = {
      ...DEFAULT_PRESET,
      bands: DEFAULT_PRESET.bands.slice(0, 2),
    };
    const entry = getEntryState('ultrawide-desktop')!;
    const bandLayouts = driftPreset.bands.map((b, i) =>
      resolveBandLayout(b, entry, i === 0, 1800),
    );
    const conformance = resolveShellConformance({
      bands: driftPreset.bands,
      bandLayouts,
      entryState: entry,
      shortHeightConstrained: false,
    });
    const closure = resolveShellClosureProof({
      conformance,
      preset: driftPreset,
      diagnostics: [
        {
          severity: 'warning',
          code: 'PROTECTED_ROW_PAIRING_MISSING',
          message: 'Protected row "row-3" expects band semantic "communications-editorial" but preset "default-v2" does not declare one.',
        },
      ],
    });
    expect(closure.closureHolds).toBe(false);
    expect(closure.driftDiagnosticsSurfaced).toBe(true);
    expect(closure.missingOccupants).toContain('leadership-message');
    expect(closure.missingOccupants).toContain('people-culture-public');
  });
});
