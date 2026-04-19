import { describe, it, expect } from 'vitest';
import { resolveBandLayout, isProminenceAllowed } from '../slotComfortResolver.js';
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
  recipe: 'feature-pair',
  slots: [
    { id: 's1', occupantId: 'company-pulse', role: 'primary', columnSpan: 'major' },
    { id: 's2', occupantId: 'leadership-message', role: 'secondary', columnSpan: 'minor' },
  ],
  maxDominantOccupants: 1,
};

const singleBand: ShellBand = {
  id: 'band-recognition',
  semanticRole: 'recognition',
  recipe: 'stacked-full',
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
    // At 600px container, major slot is 360px which is below the
    // company-pulse minWidth (480), so comfort forces stack before the
    // narrowest-stable-paired check fires.
    const result = resolveBandLayout(pairedBand, DESKTOP_STATE, true, 600);
    expect(result.columns).toBe(1);
    expect(result.slots.every((s) => s.comfort.reason === 'comfort-forced-stack')).toBe(true);
  });

  it('stacks with narrowest-stable-paired reason between minWidth and narrowestStablePairedWidth', () => {
    // At 800px container, major slot is 480px (== minWidth, not below)
    // but below narrowestStablePairedWidth (520), so the narrowest-stable
    // check fires first.
    const result = resolveBandLayout(pairedBand, DESKTOP_STATE, true, 800);
    expect(result.columns).toBe(1);
    expect(result.pairingDecision.reason).toBe('below-narrowest-stable-paired-width');
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

describe('resolveBandLayout — renderMode', () => {
  it('returns standard renderMode at comfortable width', () => {
    const result = resolveBandLayout(singleBand, DESKTOP_STATE, false, 1300);
    expect(result.slots[0].comfort.renderMode).toBe('standard');
  });

  it('returns standard renderMode for paired slots at comfortable width', () => {
    const result = resolveBandLayout(pairedBand, DESKTOP_STATE, true, 1300);
    for (const slot of result.slots) {
      expect(slot.comfort.renderMode).toBe('standard');
    }
  });

  it('includes renderMode on stacked slots', () => {
    const result = resolveBandLayout(pairedBand, PHONE_STATE, true, 400);
    for (const slot of result.slots) {
      expect(slot.comfort.renderMode).toBeDefined();
    }
  });

  it('reports constrained reason when below preferredWidth', () => {
    const result = resolveBandLayout(pairedBand, DESKTOP_STATE, true, 1300);
    const minor = result.slots.find((s) => s.slot.columnSpan === 'minor');
    expect(minor!.comfort.reason).toContain('constrained');
  });

  it('uses summary-collapsed when fit contract allows it on constrained single-column', () => {
    const result = resolveBandLayout(singleBand, PHONE_STATE, false, 400);
    expect(result.slots[0].comfort.renderMode).toBe('summary-collapsed');
  });
});

describe('resolveBandLayout — pairing decision diagnostics', () => {
  it('reports "paired" reason when pairing succeeds on desktop', () => {
    const result = resolveBandLayout(pairedBand, DESKTOP_STATE, true, 1300);
    expect(result.pairingDecision).toEqual({ allowed: true, reason: 'paired' });
  });

  it('reports "single-occupant" for single-slot bands', () => {
    const result = resolveBandLayout(singleBand, DESKTOP_STATE, false, 1300);
    expect(result.pairingDecision).toEqual({
      allowed: false,
      reason: 'single-occupant',
    });
  });

  it('reports "state-denies-pairing" on tablet-portrait entry band', () => {
    const result = resolveBandLayout(pairedBand, TABLET_PORTRAIT_STATE, true, 900);
    expect(result.pairingDecision).toEqual({
      allowed: false,
      reason: 'state-denies-pairing',
    });
  });

  it('reports "state-denies-pairing" on phone entry band', () => {
    const result = resolveBandLayout(pairedBand, PHONE_STATE, true, 400);
    expect(result.pairingDecision).toEqual({
      allowed: false,
      reason: 'state-denies-pairing',
    });
  });

  it('reports "comfort-forced-stack" when desktop paired width falls below minimum', () => {
    const result = resolveBandLayout(pairedBand, DESKTOP_STATE, true, 600);
    expect(result.pairingDecision.allowed).toBe(false);
    expect(result.pairingDecision.reason).toBe('comfort-forced-stack');
  });

  it('reports "prohibited-pairing" for occupants on each other\'s restriction list', () => {
    const prohibitedBand: ShellBand = {
      id: 'band-prohibited',
      semanticRole: 'people-culture',
      recipe: 'feature-pair',
      slots: [
        { id: 's1', occupantId: 'people-culture-public', role: 'primary', columnSpan: 'major' },
        { id: 's2', occupantId: 'hb-kudos', role: 'secondary', columnSpan: 'minor' },
      ],
      maxDominantOccupants: 1,
    };
    const result = resolveBandLayout(prohibitedBand, DESKTOP_STATE, false, 1300);
    expect(result.pairingDecision).toEqual({
      allowed: false,
      reason: 'prohibited-pairing',
    });
  });

  it('slot comfort.reason mirrors the band-level pairing reason when stacked', () => {
    const result = resolveBandLayout(pairedBand, TABLET_PORTRAIT_STATE, true, 900);
    expect(result.pairingDecision.reason).toBe('state-denies-pairing');
    for (const slot of result.slots) {
      expect(slot.comfort.reason).toBe('state-denies-pairing');
    }
  });

  it('reports fit-contract-denies-pairing when an occupant contract disallows pairing', () => {
    const contractDeniedBand: ShellBand = {
      id: 'band-contract-denied',
      semanticRole: 'communications-newsroom',
      recipe: 'feature-pair',
      slots: [
        { id: 's1', occupantId: 'people-culture-public', role: 'primary', columnSpan: 'major' },
        { id: 's2', occupantId: 'leadership-message', role: 'secondary', columnSpan: 'minor' },
      ],
      maxDominantOccupants: 1,
    };
    const result = resolveBandLayout(contractDeniedBand, DESKTOP_STATE, false, 1300);
    expect(result.columns).toBe(1);
    expect(result.pairingDecision.reason).toBe('fit-contract-denies-pairing');
  });
});

describe('isProminenceAllowed', () => {
  it('allows anchor in primary entry band', () => {
    expect(isProminenceAllowed('anchor', 'primary', true)).toBe(true);
  });

  it('rejects contextual in primary entry band', () => {
    expect(isProminenceAllowed('contextual', 'primary', true)).toBe(false);
  });

  it('rejects supporting in primary entry band', () => {
    expect(isProminenceAllowed('supporting', 'primary', true)).toBe(false);
  });

  it('allows supporting in primary non-entry band', () => {
    expect(isProminenceAllowed('supporting', 'primary', false)).toBe(true);
  });

  it('allows contextual in secondary any band', () => {
    expect(isProminenceAllowed('contextual', 'secondary', false)).toBe(true);
    expect(isProminenceAllowed('contextual', 'secondary', true)).toBe(true);
  });

  it('allows anchor in any role', () => {
    expect(isProminenceAllowed('anchor', 'primary', false)).toBe(true);
    expect(isProminenceAllowed('anchor', 'secondary', false)).toBe(true);
    expect(isProminenceAllowed('anchor', 'compact', false)).toBe(true);
  });
});
