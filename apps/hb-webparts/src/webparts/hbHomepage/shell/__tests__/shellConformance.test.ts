import { describe, it, expect } from 'vitest';
import {
  resolveShellConformance,
  toShellConformanceDataAttributes,
} from '../shellConformance.js';
import { DEFAULT_PRESET } from '../defaultPreset.js';
import { resolveBandLayout } from '../slotComfortResolver.js';
import { getEntryState } from '../breakpointPolicy.js';
import type { ShellBand, ShellEntryState } from '../shellTypes.js';

const SYNTHETIC_SINGLE_OCCUPANT_BAND: ShellBand = {
  id: 'band-synthetic-single',
  semanticRole: 'recognition',
  recipe: 'stacked-full',
  slots: [
    { id: 's-synth-1', occupantId: 'hb-kudos', role: 'primary', columnSpan: 'full' },
  ],
  maxDominantOccupants: 1,
};

function buildReport(entryStateId: Parameters<typeof getEntryState>[0], width: number, opts?: { shortHeight?: boolean }) {
  const entryState = getEntryState(entryStateId)!;
  const bandLayouts = DEFAULT_PRESET.bands.map((b, i) =>
    resolveBandLayout(b, entryState, i === 0, width),
  );
  return resolveShellConformance({
    bands: DEFAULT_PRESET.bands,
    bandLayouts,
    entryState,
    shortHeightConstrained: opts?.shortHeight ?? false,
  });
}

describe('shellConformance — layout mode derivation', () => {
  it('picks paired-entry at ultrawide when only the entry band pairs', () => {
    const report = buildReport('ultrawide-desktop', 1800);
    expect(['paired-entry', 'paired-rich']).toContain(report.layoutMode);
    expect(report.bands[0].columns).toBe(2);
  });

  it('picks stacked-full at phone-portrait', () => {
    const report = buildReport('phone-portrait', 400);
    expect(report.layoutMode).toBe('stacked-full');
    for (const b of report.bands) {
      expect(b.columns).toBe(1);
    }
  });

  it('picks short-height-compact when shortHeightConstrained is true', () => {
    const report = buildReport('phone-landscape', 720, { shortHeight: true });
    expect(report.layoutMode).toBe('short-height-compact');
    expect(report.shortHeightConstrained).toBe(true);
  });
});

describe('shellConformance — entry-stack policy integration (Prompt-04 link)', () => {
  it('exposes the entry-stack policy matching the active entry state', () => {
    const report = buildReport('standard-laptop', 1300);
    expect(report.entryStackPolicy.entryStateId).toBe('standard-laptop');
    expect(report.entryStackPolicy.heroHeightBudgetPx).toEqual({ min: 300, max: 340 });
  });

  it('tablet-portrait policy enforces single-column first lane', () => {
    const report = buildReport('tablet-portrait', 760);
    expect(report.entryStackPolicy.firstLaneSingleColumnOnly).toBe(true);
    expect(report.bands[0].columns).toBe(1);
  });
});

describe('shellConformance — per-band pairing reasons are preserved', () => {
  it('entry band at tablet-portrait reports state-denies-pairing', () => {
    const report = buildReport('tablet-portrait', 760);
    expect(report.bands[0].pairingDecision.allowed).toBe(false);
    expect(report.bands[0].pairingDecision.reason).toBe('state-denies-pairing');
  });

  it('bands with < 2 active occupants report single-occupant', () => {
    // Default preset has no single-occupant bands — all three rows pair.
    // Verify the single-occupant reason still surfaces via a synthetic band.
    const entryState = getEntryState('ultrawide-desktop')!;
    const layout = resolveBandLayout(SYNTHETIC_SINGLE_OCCUPANT_BAND, entryState, false, 1800);
    expect(layout.pairingDecision.reason).toBe('single-occupant');
    expect(layout.columns).toBe(1);
  });
});

describe('shellConformance — data-attribute surface', () => {
  it('emits the canonical attribute set for harness/CSS inspection', () => {
    const report = buildReport('standard-laptop', 1300);
    const attrs = toShellConformanceDataAttributes(report);
    expect(attrs['data-shell-blackbox-contract']).toBe('prompt07-blackbox-v1');
    expect(attrs['data-shell-fit-path']).toBe('usable-width-accounted');
    expect(attrs['data-shell-entry-class']).toBe('standard-laptop');
    expect(attrs['data-shell-layout-mode']).toBeDefined();
    expect(attrs['data-shell-first-lane-first-view']).toBe('begin-on-first-view');
    expect(attrs['data-shell-first-lane-columns']).toBe(report.bands[0].columns);
    expect(attrs['data-shell-bands-total']).toBe(report.bands.length);
    expect(attrs['data-shell-short-height']).toBeUndefined();
    expect(attrs['data-shell-fit-contract-denials']).toBeGreaterThanOrEqual(0);
    expect(attrs['data-shell-pairing-guard-violations']).toBeGreaterThanOrEqual(0);
    expect(attrs['data-shell-force-stacked-slot-count']).toBeGreaterThanOrEqual(0);
    expect(attrs['data-shell-constrained-slot-count']).toBeGreaterThanOrEqual(0);
    expect(attrs['data-shell-first-lane-action-detail']).toBe('none');
    expect(attrs['data-shell-first-lane-candidates-considered']).toBe(0);
  });

  it('flags short-height when the constraint applies', () => {
    const report = buildReport('phone-landscape', 720, { shortHeight: true });
    const attrs = toShellConformanceDataAttributes(report);
    expect(attrs['data-shell-fit-path']).toBe('short-height-override');
    expect(attrs['data-shell-short-height']).toBe('true');
    expect(attrs['data-shell-layout-mode']).toBe('short-height-compact');
  });
});

describe('shellConformance — slot state mapping', () => {
  it('maps comfort reason "comfortable" to state "comfortable"', () => {
    const report = buildReport('ultrawide-desktop', 1800);
    const anySlot = report.bands.flatMap((b) => b.slots).find((s) => s.reason === 'comfortable');
    expect(anySlot?.state).toBe('comfortable');
  });

  it('maps single-occupant bands to comfortable slots', () => {
    const entryState = getEntryState('ultrawide-desktop')!;
    const layout = resolveBandLayout(SYNTHETIC_SINGLE_OCCUPANT_BAND, entryState, false, 1800);
    const conformance = resolveShellConformance({
      bands: [SYNTHETIC_SINGLE_OCCUPANT_BAND],
      bandLayouts: [layout],
      entryState,
      shortHeightConstrained: false,
    });
    expect(conformance.bands[0].slots[0].state).toBe('comfortable');
  });
});
