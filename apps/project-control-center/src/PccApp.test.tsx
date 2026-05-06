import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccApp } from './PccApp';

describe('PccApp shell', () => {
  it('renders the project hero band with the primary title "Project Control Center"', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const hero = container.querySelector('[data-pcc-project-hero-band]');
    expect(hero, 'hero band should render').not.toBeNull();
    const primary = hero?.querySelector('[data-pcc-hero-primary-title]');
    expect(primary?.textContent).toBe('Project Control Center');
  });

  it('renders the hero band with active-surface secondary title and mode marker', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const hero = container.querySelector('[data-pcc-project-hero-band]');
    expect(hero, 'hero band should render').not.toBeNull();
    expect(hero?.getAttribute('data-pcc-mode')).toBe('desktop');
    const secondary = hero?.querySelector('[data-pcc-hero-secondary-title]');
    expect(secondary?.textContent).toBe('Project Home');
  });

  it('renders horizontal tabs with every PCC MVP surface from @hbc/models/pcc', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]');
    expect(tablist, 'tablist should render').not.toBeNull();
    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = tablist?.querySelector(`[data-pcc-tab-id="${id}"]`);
      expect(tab, `tab for ${id} should render`).not.toBeNull();
      // Tab labels are PCC-local overrides (not PCC_MVP_SURFACES.displayName).
      // Just confirm the tab renders for the surface id; surface display name
      // appears inside the active panel, not on the tab.
      void PCC_MVP_SURFACES;
    }
  });

  it('marks project-home as the active tab by default', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const active = container.querySelector('[data-pcc-tab-id="project-home"]');
    expect(active?.getAttribute('data-pcc-tab-active')).toBe('true');
    expect(active?.getAttribute('aria-selected')).toBe('true');
  });

  it('renders the bento grid with mode marker', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid, 'bento grid should render').not.toBeNull();
    expect(grid?.getAttribute('data-pcc-mode')).toBe('standardLaptop');
  });
});
