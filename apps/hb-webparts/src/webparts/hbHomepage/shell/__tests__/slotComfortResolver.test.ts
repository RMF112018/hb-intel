import { describe, it, expect } from 'vitest';
import { resolveBandLayout } from '../slotComfortResolver.js';
import type { ShellBand, ShellEntryState } from '../shellTypes.js';

const DESKTOP_STATE: ShellEntryState = {
  id: 'standard-laptop',
  label: 'Desktop baseline',
  minWidth: 1180,
  maxWidth: 1599,
  firstLaneColumns: 2,
  firstLanePairingAllowed: true,
  dominanceRule: 'left-dominant',
};

const TABLET_PORTRAIT_STATE: ShellEntryState = {
  id: 'tablet-portrait-large',
  label: 'Tablet portrait',
  minWidth: 820,
  maxWidth: 979,
  firstLaneColumns: 1,
  firstLanePairingAllowed: false,
  dominanceRule: 'single',
};

const PHONE_STATE: ShellEntryState = {
  id: 'phone-portrait',
  label: 'Phone portrait',
  minWidth: 320,
  maxWidth: 719,
  firstLaneColumns: 1,
  firstLanePairingAllowed: false,
  dominanceRule: 'single',
};

const pairedBand: ShellBand = {
  id: 'band-editorial',
  semanticRole: 'communications-newsroom',
  slots: [
    { id: 's1', occupantId: 'company-pulse', role: 'primary', columnSpan: 'major' },
    { id: 's2', occupantId: 'leadership-message', role: 'secondary', columnSpan: 'minor' },
  ],
  maxDominantOccupants: 1,
};

const singleBand: ShellBand = {
  id: 'band-recognition',
  semanticRole: 'recognition',
  slots: [
    { id: 's1', occupantId: 'hb-kudos', role: 'primary', columnSpan: 'full' },
  ],
  maxDominantOccupants: 1,
};

describe('resolveBandLayout — paired state', () => {
  it('allows pairing on desktop entry band when comfort is met', () => {
    const result = resolveBandLayout(pairedBand, DESKTOP_STATE, true, 1300);
    expect(result.columns).toBe(2);
    expect(result.slots).toHaveLength(2);
  });

  it('forces stacking on tablet portrait entry band', () => {
    const result = resolveBandLayout(pairedBand, TABLET_PORTRAIT_STATE, true, 900);
    expect(result.columns).toBe(1);
    expect(result.slots).toHaveLength(2);
  });

  it('forces stacking on phone entry band', () => {
    const result = resolveBandLayout(pairedBand, PHONE_STATE, true, 400);
    expect(result.columns).toBe(1);
  });
});

describe('resolveBandLayout — single occupant', () => {
  it('always uses single column for single-occupant bands', () => {
    const result = resolveBandLayout(singleBand, DESKTOP_STATE, false, 1300);
    expect(result.columns).toBe(1);
    expect(result.slots).toHaveLength(1);
  });
});

describe('resolveBandLayout — comfort-forced stacking', () => {
  it('stacks when container width forces occupant below minWidth in paired mode', () => {
    const result = resolveBandLayout(pairedBand, DESKTOP_STATE, true, 800);
    expect(result.columns).toBe(1);
    expect(result.slots.some((s) => s.comfort.reason.includes('comfort') || s.comfort.reason.includes('entry-state'))).toBe(true);
  });
});

describe('resolveBandLayout — hierarchy preservation', () => {
  it('preserves slot roles when stacking', () => {
    const result = resolveBandLayout(pairedBand, TABLET_PORTRAIT_STATE, true, 900);
    const primary = result.slots.find((s) => s.slot.role === 'primary');
    const secondary = result.slots.find((s) => s.slot.role === 'secondary');
    expect(primary).toBeDefined();
    expect(secondary).toBeDefined();
  });
});
