import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccApp } from '../PccApp';
import {
  PCC_RESPONSIVE_MODES,
  resolveResponsiveMode,
  type PccResponsiveMode,
} from '../layout/footprints';

// Temporary mapping: rail variants for the new 8-mode contract preserve
// today's behavior at equivalent screen sizes. The vertical rail is removed
// in `Prompt_04_Shell_Recomposition_And_Rail_Removal.md`; this map exits
// alongside the rail.
const EXPECTED_RAIL_VARIANT: Record<PccResponsiveMode, string> = {
  phone: 'hamburger',
  tabletPortrait: 'topStrip',
  tabletLandscape: 'iconOnly',
  smallLaptop: 'expanded',
  standardLaptop: 'expanded',
  largeLaptop: 'expanded',
  desktop: 'expanded',
  ultrawide: 'expanded',
};

describe('PccShell responsive behaviour', () => {
  for (const mode of PCC_RESPONSIVE_MODES) {
    it(`renders the '${mode}' mode with the expected rail variant`, () => {
      const { container } = render(<PccApp forceMode={mode} />);
      const grid = container.querySelector('[data-pcc-bento-grid]');
      expect(grid?.getAttribute('data-pcc-mode')).toBe(mode);

      const rail = container.querySelector('[data-pcc-rail]');
      expect(rail).not.toBeNull();
      expect(rail?.getAttribute('data-pcc-rail-variant')).toBe(EXPECTED_RAIL_VARIANT[mode]);
      expect(rail?.getAttribute('data-pcc-mode')).toBe(mode);

      const header = container.querySelector('[data-pcc-header]');
      expect(header?.getAttribute('data-pcc-mode')).toBe(mode);
    });
  }
});

describe('resolveResponsiveMode 8-mode boundary contract', () => {
  // Mirrors `wave-b1/docs/04_BREAKPOINT_POLICY_SPECIFICATION.md` mandatory
  // boundary table. Every off-by-one boundary listed in the spec is asserted.
  const cases: Array<[number, PccResponsiveMode]> = [
    [479, 'phone'],
    [480, 'tabletPortrait'],
    [768, 'tabletPortrait'],
    [769, 'tabletLandscape'],
    [1024, 'tabletLandscape'],
    [1025, 'smallLaptop'],
    [1180, 'smallLaptop'],
    [1181, 'standardLaptop'],
    [1440, 'standardLaptop'],
    [1441, 'largeLaptop'],
    [1599, 'largeLaptop'],
    [1600, 'desktop'],
    [1919, 'desktop'],
    [1920, 'ultrawide'],
  ];

  it.each(cases)('width %d resolves to %s', (width, expected) => {
    expect(resolveResponsiveMode(width)).toBe(expected);
  });
});
