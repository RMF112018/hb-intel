import { describe, it, expect } from 'vitest';
import {
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XL,
  HBC_SPACE_XXL,
  hbcSpacing,
  hbcGrid,
  hbcMediaQuery,
} from '../grid.js';

describe('Spacing & Grid (grid.ts)', () => {
  it('6 spacing constants follow 4px base scale', () => {
    expect(HBC_SPACE_XS).toBe(4);
    expect(HBC_SPACE_SM).toBe(8);
    expect(HBC_SPACE_MD).toBe(16);
    expect(HBC_SPACE_LG).toBe(24);
    expect(HBC_SPACE_XL).toBe(32);
    expect(HBC_SPACE_XXL).toBe(48);
  });

  it('hbcSpacing object contains all 6 keys', () => {
    expect(hbcSpacing.xs).toBe(HBC_SPACE_XS);
    expect(hbcSpacing.sm).toBe(HBC_SPACE_SM);
    expect(hbcSpacing.md).toBe(HBC_SPACE_MD);
    expect(hbcSpacing.lg).toBe(HBC_SPACE_LG);
    expect(hbcSpacing.xl).toBe(HBC_SPACE_XL);
    expect(hbcSpacing.xxl).toBe(HBC_SPACE_XXL);
  });

  it('hbcGrid has 12 columns and 4px base unit', () => {
    expect(hbcGrid.columns).toBe(12);
    expect(hbcGrid.baseUnit).toBe(4);
  });

  it('hbcMediaQuery returns valid media query string', () => {
    const mq = hbcMediaQuery('mobile');
    expect(mq).toMatch(/^@media \(min-width: \d+px\)$/);
  });
});
