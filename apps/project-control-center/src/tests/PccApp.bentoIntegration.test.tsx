import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccApp } from '../PccApp';

describe('PccApp bento integration (regression)', () => {
  it('every dashboard card is a direct child of the bento grid', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid, 'bento grid should render').not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(
        card.parentElement === grid,
        `card '${card.getAttribute('data-pcc-footprint')}' must be a direct child of the bento grid`,
      ).toBe(true);
    }
  });

  it('hero / wide / standard cards under the grid have non-zero column span and inline gridColumn', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    expect(grid).not.toBeNull();
    for (const footprint of ['hero', 'wide', 'standard'] as const) {
      const card = grid.querySelector(`[data-pcc-card][data-pcc-footprint="${footprint}"]`) as HTMLElement | null;
      expect(card, `'${footprint}' demo card should render under the grid`).not.toBeNull();
      const declared = Number(card!.getAttribute('data-pcc-column-span'));
      expect(declared).toBeGreaterThan(0);
      expect(card!.style.gridColumn).toMatch(/^span \d+/);
    }
  });

  it('renders without forceMode and still mounts the bento grid', () => {
    const { container } = render(<PccApp />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
  });
});
