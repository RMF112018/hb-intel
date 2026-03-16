import { describe, it, expect } from 'vitest';
import {
  hbcBrandRamp,
  HBC_STATUS_COLORS,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_RAMP_GRAY,
  HBC_SURFACE_LIGHT,
  HBC_SURFACE_FIELD,
  HBC_ACCENT_ORANGE_HOVER,
  HBC_ACCENT_ORANGE_PRESSED,
} from '../tokens.js';

describe('Color tokens (tokens.ts)', () => {
  it('brand ramp has all 16 shades (10–160)', () => {
    const expectedShades = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
    for (const shade of expectedShades) {
      expect(hbcBrandRamp[shade as keyof typeof hbcBrandRamp]).toBeDefined();
    }
  });

  it('HBC_STATUS_COLORS has all 12 semantic statuses', () => {
    const expected = [
      'success', 'warning', 'error', 'info', 'neutral',
      'onTrack', 'atRisk', 'critical', 'pending', 'inProgress', 'completed', 'draft',
    ];
    for (const key of expected) {
      expect(HBC_STATUS_COLORS[key as keyof typeof HBC_STATUS_COLORS]).toBeDefined();
    }
  });

  it('each status ramp has 5 lightness stops (10/30/50/70/90)', () => {
    const ramps = [HBC_STATUS_RAMP_GREEN, HBC_STATUS_RAMP_RED, HBC_STATUS_RAMP_AMBER, HBC_STATUS_RAMP_INFO, HBC_STATUS_RAMP_GRAY];
    for (const ramp of ramps) {
      expect(Object.keys(ramp)).toHaveLength(5);
      expect(ramp[10]).toBeDefined();
      expect(ramp[30]).toBeDefined();
      expect(ramp[50]).toBeDefined();
      expect(ramp[70]).toBeDefined();
      expect(ramp[90]).toBeDefined();
    }
  });

  it('surface tokens light and field have matching keys', () => {
    const lightKeys = Object.keys(HBC_SURFACE_LIGHT).sort();
    const fieldKeys = Object.keys(HBC_SURFACE_FIELD).sort();
    expect(lightKeys).toEqual(fieldKeys);
  });

  it('interactive state tokens are defined', () => {
    expect(HBC_ACCENT_ORANGE_HOVER).toBeDefined();
    expect(HBC_ACCENT_ORANGE_PRESSED).toBeDefined();
  });
});
