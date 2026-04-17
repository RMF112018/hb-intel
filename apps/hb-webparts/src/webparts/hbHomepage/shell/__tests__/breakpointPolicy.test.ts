import { describe, it, expect } from 'vitest';
import {
  SHELL_ENTRY_STATES,
  SHORT_HEIGHT_THRESHOLD_PX,
  isFirstLanePairingAllowed,
  resolveEntryState,
  resolveEntryStateWithReason,
} from '../breakpointPolicy.js';

describe('resolveEntryState', () => {
  it('resolves ultrawide-desktop at 1800px', () => {
    const state = resolveEntryState({ width: 1800 });
    expect(state.id).toBe('ultrawide-desktop');
    expect(state.firstLaneColumns).toBe(2);
    expect(state.firstLanePairingAllowed).toBe(true);
  });

  it('resolves standard-laptop at 1300px (primary baseline)', () => {
    const state = resolveEntryState({ width: 1300 });
    expect(state.id).toBe('standard-laptop');
    expect(state.firstLaneColumns).toBe(2);
    expect(state.dominanceRule).toBe('left-dominant');
  });

  it('resolves tablet-landscape at 1050px', () => {
    const state = resolveEntryState({ width: 1050 });
    expect(state.id).toBe('tablet-landscape');
    expect(state.firstLanePairingAllowed).toBe(false);
    expect(state.dominanceRule).toBe('single');
  });

  it('resolves tablet-portrait-large at 900px', () => {
    const state = resolveEntryState({ width: 900 });
    expect(state.id).toBe('tablet-portrait-large');
    expect(state.firstLaneColumns).toBe(1);
  });

  it('resolves tablet-portrait at 750px', () => {
    const state = resolveEntryState({ width: 750 });
    expect(state.id).toBe('tablet-portrait');
    expect(state.firstLanePairingAllowed).toBe(false);
  });

  it('resolves phone-portrait at 400px', () => {
    const state = resolveEntryState({ width: 400 });
    expect(state.id).toBe('phone-portrait');
    expect(state.firstLaneColumns).toBe(1);
    expect(state.dominanceRule).toBe('single');
  });

  it('resolves phone-landscape when height-constrained', () => {
    const state = resolveEntryState({ width: 700, height: 400 });
    expect(state.id).toBe('phone-landscape');
    expect(state.firstLanePairingAllowed).toBe(false);
  });

  it('does not trigger phone-landscape without height constraint', () => {
    const state = resolveEntryState({ width: 700 });
    expect(state.id).not.toBe('phone-landscape');
  });

  it('falls back to phone-portrait for very narrow widths', () => {
    const state = resolveEntryState({ width: 300 });
    expect(state.id).toBe('phone-portrait');
  });

  it('forces single-column for all tablet-portrait and phone states', () => {
    const singleColumnStates = ['tablet-portrait-large', 'tablet-portrait', 'phone-portrait', 'phone-landscape'];
    for (const id of singleColumnStates) {
      const state = SHELL_ENTRY_STATES.find((s) => s.id === id)!;
      expect(state.firstLaneColumns).toBe(1);
      expect(state.firstLanePairingAllowed).toBe(false);
    }
  });
});

describe('resolveEntryStateWithReason', () => {
  it('returns width-match for ordinary desktop widths', () => {
    const resolved = resolveEntryStateWithReason({ width: 1300, height: 900 });
    expect(resolved.state.id).toBe('standard-laptop');
    expect(resolved.reason).toBe('width-match');
    expect(resolved.shortHeightConstrained).toBe(false);
  });

  it('marks short-height-override when height is below threshold and width is wide enough', () => {
    const resolved = resolveEntryStateWithReason({ width: 700, height: 400 });
    expect(resolved.state.id).toBe('phone-landscape');
    expect(resolved.reason).toBe('short-height-override');
    expect(resolved.shortHeightConstrained).toBe(true);
  });

  it('does not trigger short-height-override when height is exactly threshold', () => {
    const resolved = resolveEntryStateWithReason({
      width: 700,
      height: SHORT_HEIGHT_THRESHOLD_PX,
    });
    expect(resolved.reason).toBe('width-match');
    expect(resolved.shortHeightConstrained).toBe(false);
  });

  it('does not trigger short-height-override when width is below phone-landscape minimum', () => {
    const resolved = resolveEntryStateWithReason({ width: 400, height: 400 });
    expect(resolved.state.id).toBe('phone-portrait');
    expect(resolved.reason).toBe('width-match');
    expect(resolved.shortHeightConstrained).toBe(false);
  });

  it('uses fallback-below-narrowest when width is below every declared state', () => {
    const resolved = resolveEntryStateWithReason({ width: 100 });
    expect(resolved.state.id).toBe('phone-portrait');
    expect(resolved.reason).toBe('fallback-below-narrowest');
    expect(resolved.shortHeightConstrained).toBe(false);
  });

  it('exposes SHORT_HEIGHT_THRESHOLD_PX as the governing constant', () => {
    expect(SHORT_HEIGHT_THRESHOLD_PX).toBe(500);
  });

  it('resolveEntryState back-compat wrapper returns only the state', () => {
    const state = resolveEntryState({ width: 1300 });
    const resolved = resolveEntryStateWithReason({ width: 1300 });
    expect(state).toBe(resolved.state);
  });
});

describe('isFirstLanePairingAllowed', () => {
  it('allows pairing for ultrawide-desktop', () => {
    expect(isFirstLanePairingAllowed('ultrawide-desktop')).toBe(true);
  });

  it('allows pairing for standard-laptop', () => {
    expect(isFirstLanePairingAllowed('standard-laptop')).toBe(true);
  });

  it('denies pairing for tablet-landscape', () => {
    expect(isFirstLanePairingAllowed('tablet-landscape')).toBe(false);
  });

  it('denies pairing for tablet-portrait', () => {
    expect(isFirstLanePairingAllowed('tablet-portrait')).toBe(false);
  });

  it('denies pairing for phone-portrait', () => {
    expect(isFirstLanePairingAllowed('phone-portrait')).toBe(false);
  });
});
