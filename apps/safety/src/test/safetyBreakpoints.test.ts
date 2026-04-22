/**
 * Phase-04 audit G-02 foundation — responsive seam.
 *
 * Pure mode-resolution tests against the thresholds exported from
 * safetyBreakpoints. These assert the mode contract directly, without
 * hooks or DOM, so the mapping from observed width → mode is locked.
 */
import { describe, expect, it } from 'vitest';
import {
  SAFETY_LAYOUT_THRESHOLDS,
  resolveSafetyLayoutMode,
} from '../responsive/safetyBreakpoints.js';

describe('Safety responsive contract — resolveSafetyLayoutMode', () => {
  it('declares the compact / medium / wide thresholds as a readonly contract', () => {
    expect(SAFETY_LAYOUT_THRESHOLDS.compact).toBeLessThan(SAFETY_LAYOUT_THRESHOLDS.medium);
    expect(SAFETY_LAYOUT_THRESHOLDS.medium).toBeLessThan(SAFETY_LAYOUT_THRESHOLDS.wide);
  });

  it('maps widths below the compact threshold to "minimal"', () => {
    expect(resolveSafetyLayoutMode(0)).toBe('minimal');
    expect(resolveSafetyLayoutMode(SAFETY_LAYOUT_THRESHOLDS.compact - 1)).toBe('minimal');
  });

  it('maps widths at/above compact but below medium to "compact"', () => {
    expect(resolveSafetyLayoutMode(SAFETY_LAYOUT_THRESHOLDS.compact)).toBe('compact');
    expect(resolveSafetyLayoutMode(SAFETY_LAYOUT_THRESHOLDS.medium - 1)).toBe('compact');
  });

  it('maps widths at/above medium but below wide to "medium"', () => {
    expect(resolveSafetyLayoutMode(SAFETY_LAYOUT_THRESHOLDS.medium)).toBe('medium');
    expect(resolveSafetyLayoutMode(SAFETY_LAYOUT_THRESHOLDS.wide - 1)).toBe('medium');
  });

  it('maps widths at/above wide to "wide"', () => {
    expect(resolveSafetyLayoutMode(SAFETY_LAYOUT_THRESHOLDS.wide)).toBe('wide');
    expect(resolveSafetyLayoutMode(4096)).toBe('wide');
  });

  it('is stable on threshold boundaries — the resolver returns exactly one mode per width', () => {
    const samples = [0, 100, 480, 540, 700, 840, 1000, 1100, 1440, 2560];
    const seen = new Set<string>();
    for (const w of samples) {
      const mode = resolveSafetyLayoutMode(w);
      expect(['minimal', 'compact', 'medium', 'wide']).toContain(mode);
      seen.add(`${w}->${mode}`);
    }
    // Sanity: the function is deterministic — calling twice returns the same result.
    for (const w of samples) {
      expect(resolveSafetyLayoutMode(w)).toBe(resolveSafetyLayoutMode(w));
    }
  });
});
