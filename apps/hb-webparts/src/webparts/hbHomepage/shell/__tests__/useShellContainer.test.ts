import { describe, expect, it } from 'vitest';
import { resolveEntryStateWithReason } from '../breakpointPolicy.js';
import {
  SHELL_WIDTH_ACCOUNTING_RULE,
  SHELL_WIDTH_SOURCE,
  resolveUsableShellWidth,
  toSharedEntryStateSnapshot,
} from '../useShellContainer.js';

describe('useShellContainer measurement helpers', () => {
  it('exposes stable width-truth diagnostics markers', () => {
    expect(SHELL_WIDTH_SOURCE).toBe('entry-stack-outer-envelope');
    expect(SHELL_WIDTH_ACCOUNTING_RULE).toBe(
      'authoritative-minus-shell-inline-inset',
    );
  });

  it('computes usable width from authoritative width minus shell insets', () => {
    expect(resolveUsableShellWidth(1600, 40)).toBe(1560);
  });

  it('clamps usable width at zero when insets exceed authoritative width', () => {
    expect(resolveUsableShellWidth(20, 100)).toBe(0);
  });

  it('projects a launcher-safe shared entry-state snapshot', () => {
    const resolved = resolveEntryStateWithReason({ width: 1600, height: 900 });
    expect(
      toSharedEntryStateSnapshot({
        entryState: resolved.state,
        entryStateReason: resolved.reason,
        shortHeightConstrained: resolved.shortHeightConstrained,
      }),
    ).toEqual({
      entryState: resolved.state,
      entryStateReason: 'width-match',
      shortHeightConstrained: false,
    });
  });
});

describe('usable-width entry-state edges', () => {
  it('crosses the 1600 threshold only when accounting leaves usable width below 1600', () => {
    const atBoundary = resolveEntryStateWithReason({
      width: resolveUsableShellWidth(1640, 40),
      height: 900,
    });
    expect(atBoundary.state.id).toBe('ultrawide-desktop');

    const belowBoundary = resolveEntryStateWithReason({
      width: resolveUsableShellWidth(1639, 40),
      height: 900,
    });
    expect(belowBoundary.state.id).toBe('standard-laptop');
  });

  it('crosses the 1180 threshold only when accounting leaves usable width below 1180', () => {
    const atBoundary = resolveEntryStateWithReason({
      width: resolveUsableShellWidth(1220, 40),
      height: 900,
    });
    expect(atBoundary.state.id).toBe('standard-laptop');

    const belowBoundary = resolveEntryStateWithReason({
      width: resolveUsableShellWidth(1219, 40),
      height: 900,
    });
    expect(belowBoundary.state.id).toBe('tablet-landscape');
  });

  it('keeps ultrawide-desktop when usable width stays at or above 1600', () => {
    const usableWidth = resolveUsableShellWidth(1640, 40);
    const resolved = resolveEntryStateWithReason({ width: usableWidth, height: 900 });
    expect(usableWidth).toBe(1600);
    expect(resolved.state.id).toBe('ultrawide-desktop');
    expect(resolved.reason).toBe('width-match');
  });

  it('drops to standard-laptop when shell insets reduce usable width below 1600', () => {
    const usableWidth = resolveUsableShellWidth(1600, 40);
    const resolved = resolveEntryStateWithReason({ width: usableWidth, height: 900 });
    expect(usableWidth).toBe(1560);
    expect(resolved.state.id).toBe('standard-laptop');
    expect(resolved.reason).toBe('width-match');
  });

  it('drops to tablet-landscape when shell insets reduce usable width below 1180', () => {
    const usableWidth = resolveUsableShellWidth(1180, 40);
    const resolved = resolveEntryStateWithReason({ width: usableWidth, height: 900 });
    expect(usableWidth).toBe(1140);
    expect(resolved.state.id).toBe('tablet-landscape');
  });

  it('keeps short-height override coherent under usable-width accounting', () => {
    const usableWidth = resolveUsableShellWidth(760, 60);
    const resolved = resolveEntryStateWithReason({ width: usableWidth, height: 420 });
    expect(usableWidth).toBe(700);
    expect(resolved.state.id).toBe('phone-landscape');
    expect(resolved.reason).toBe('short-height-override');
    expect(resolved.shortHeightConstrained).toBe(true);
  });
});
