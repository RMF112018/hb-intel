import { describe, it, expect } from 'vitest';
import {
  HBC_DENSITY_TOKENS,
  HBC_FIELD_READABILITY,
  HBC_FIELD_INTERACTION_ASSUMPTIONS,
  detectDensityTier,
} from '../density.js';

describe('Density system tokens (density.ts)', () => {
  it('HBC_DENSITY_TOKENS has all 3 tiers', () => {
    expect(HBC_DENSITY_TOKENS.compact).toBeDefined();
    expect(HBC_DENSITY_TOKENS.comfortable).toBeDefined();
    expect(HBC_DENSITY_TOKENS.touch).toBeDefined();
  });

  it('each tier has all 9 required properties', () => {
    const requiredProps = [
      'rowHeightMin', 'touchTargetMin', 'bodyTextMinPx', 'labelTextMinPx',
      'statusTextMinPx', 'tapSpacingMin', 'textContrastMin', 'interactiveContrastMin', 'usage',
    ];
    for (const tier of ['compact', 'comfortable', 'touch'] as const) {
      for (const prop of requiredProps) {
        expect(HBC_DENSITY_TOKENS[tier]).toHaveProperty(prop);
      }
    }
  });

  it('touch tier meets field-readability minimums', () => {
    const touch = HBC_DENSITY_TOKENS.touch;
    expect(touch.touchTargetMin).toBeGreaterThanOrEqual(44);
    expect(touch.bodyTextMinPx).toBeGreaterThanOrEqual(15);
    expect(touch.textContrastMin).toBeGreaterThanOrEqual(7);
    expect(touch.tapSpacingMin).toBeGreaterThanOrEqual(16);
    expect(touch.rowHeightMin).toBeGreaterThanOrEqual(48);
  });

  it('HBC_FIELD_READABILITY has all 8 constraint categories', () => {
    const categories = [
      'touchTargetSize', 'bodyTextMin', 'labelTextMin', 'statusBadgeTextMin',
      'textContrastRatio', 'interactiveElementContrast', 'tapSpacing', 'rowHeightMin',
    ];
    for (const cat of categories) {
      expect(HBC_FIELD_READABILITY[cat as keyof typeof HBC_FIELD_READABILITY]).toBeDefined();
    }
    expect(Object.keys(HBC_FIELD_READABILITY)).toHaveLength(8);
  });

  it('HBC_FIELD_INTERACTION_ASSUMPTIONS has 5 assumptions', () => {
    expect(HBC_FIELD_INTERACTION_ASSUMPTIONS).toHaveLength(5);
    for (const assumption of HBC_FIELD_INTERACTION_ASSUMPTIONS) {
      expect(assumption).toHaveProperty('label');
      expect(assumption).toHaveProperty('description');
      expect(assumption).toHaveProperty('designImplication');
    }
  });

  it('detectDensityTier returns valid DensityTier', () => {
    const tier = detectDensityTier();
    expect(['compact', 'comfortable', 'touch']).toContain(tier);
  });
});
