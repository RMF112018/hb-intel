import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccApp } from './PccApp';

describe('PccApp shell', () => {
  it('renders the slim project intelligence header with the eyebrow subtitle', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const header = container.querySelector('[data-pcc-header]');
    expect(header, 'header should render').not.toBeNull();
    expect(header?.textContent).toContain('Project overview');
  });

  it('renders the persistent project-context band with project identity, source confidence, pills, and active surface', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const band = container.querySelector('[data-pcc-context-band]');
    expect(band, 'project-context band should render').not.toBeNull();
    expect(band?.querySelector('[data-pcc-context-project]')?.textContent).toBe(
      'Project Control Center',
    );
    expect(band?.getAttribute('data-pcc-source-confidence')).toBe('preview');
    expect(band?.querySelector('[data-pcc-pill-row]')?.textContent).toContain('Reference');
    expect(band?.querySelector('[data-pcc-active-surface-context]')?.textContent).toContain(
      'Project Home',
    );
  });

  it('renders the orange navigation rail with every PCC MVP surface from @hbc/models/pcc', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
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
    const { container } = render(<PccApp forceMode="desktop" />);
    const active = container.querySelector('[data-pcc-surface-id="project-home"]');
    expect(active?.getAttribute('data-pcc-surface-active')).toBe('true');
  });

  it('renders the bento grid with mode marker', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid, 'bento grid should render').not.toBeNull();
    expect(grid?.getAttribute('data-pcc-mode')).toBe('standardLaptop');
  });
});
