import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccApp } from './PccApp';

describe('PccApp shell', () => {
  it('renders the project intelligence header with placeholder copy', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const header = container.querySelector('[data-pcc-header]');
    expect(header, 'header should render').not.toBeNull();
    expect(header?.textContent).toContain('Project Control Center Preview');
    expect(header?.textContent).toContain('Wave 2');
  });

  it('renders the orange navigation rail with every PCC MVP surface from @hbc/models/pcc', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const rail = container.querySelector('[data-pcc-rail]');
    expect(rail, 'rail should render').not.toBeNull();
    for (const id of PCC_MVP_SURFACE_IDS) {
      const surface = PCC_MVP_SURFACES[id];
      const item = rail?.querySelector(`[data-pcc-surface-id="${id}"]`);
      expect(item, `rail entry for ${id} should render`).not.toBeNull();
      expect(item?.textContent).toContain(surface.displayName);
    }
  });

  it('marks project-home as the active surface by default', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const active = container.querySelector('[data-pcc-surface-id="project-home"]');
    expect(active?.getAttribute('data-pcc-surface-active')).toBe('true');
  });

  it('renders the bento grid with mode marker', () => {
    const { container } = render(<PccApp forceMode="standardDesktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid, 'bento grid should render').not.toBeNull();
    expect(grid?.getAttribute('data-pcc-mode')).toBe('standardDesktop');
  });
});
