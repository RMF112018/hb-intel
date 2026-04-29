import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { PCC_RESPONSIVE_MODES, type PccResponsiveMode } from '../layout/footprints';

const EXPECTED_RAIL_VARIANT: Record<PccResponsiveMode, string> = {
  wideDesktop: 'expanded',
  standardDesktop: 'expanded',
  tabletLandscape: 'iconOnly',
  tabletPortrait: 'topStrip',
  phone: 'hamburger',
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
