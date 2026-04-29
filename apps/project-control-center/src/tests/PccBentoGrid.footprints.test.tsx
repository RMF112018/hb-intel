import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccDashboardCard } from '../layout/PccDashboardCard';
import {
  FOOTPRINT_COLUMN_SPANS,
  PCC_CARD_FOOTPRINTS,
} from '../layout/footprints';

describe('PccBentoGrid footprint contract', () => {
  it('renders one card per footprint and each carries data-pcc-footprint', () => {
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        {PCC_CARD_FOOTPRINTS.map((footprint) => (
          <PccDashboardCard key={footprint} footprint={footprint} title={footprint}>
            <p>content for {footprint}</p>
          </PccDashboardCard>
        ))}
      </PccBentoGrid>,
    );
    for (const footprint of PCC_CARD_FOOTPRINTS) {
      const card = container.querySelector(`[data-pcc-footprint="${footprint}"]`);
      expect(card, `card for footprint '${footprint}' should render`).not.toBeNull();
      const declaredSpan = Number(card?.getAttribute('data-pcc-column-span'));
      expect(declaredSpan, `declared column span for '${footprint}' should be > 0`).toBeGreaterThan(0);
      expect(declaredSpan).toBe(FOOTPRINT_COLUMN_SPANS.wideDesktop[footprint]);
    }
  });

  it('does not use grid-auto-flow: dense on the bento root', () => {
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccDashboardCard footprint="standard" title="x">
          x
        </PccDashboardCard>
      </PccBentoGrid>,
    );
    const grid = container.querySelector('[data-pcc-bento-grid]') as HTMLElement | null;
    expect(grid).not.toBeNull();
    const computed = grid ? grid.style.gridAutoFlow : '';
    expect(computed).not.toContain('dense');
  });

  it('reduces column spans in narrower modes (no fixed equal-height row)', () => {
    const { container, rerender } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccDashboardCard footprint="hero" title="hero">
          hero
        </PccDashboardCard>
      </PccBentoGrid>,
    );
    const wideCard = container.querySelector('[data-pcc-footprint="hero"]');
    const wideSpan = Number(wideCard?.getAttribute('data-pcc-column-span'));

    rerender(
      <PccBentoGrid forceMode="phone">
        <PccDashboardCard footprint="hero" title="hero">
          hero
        </PccDashboardCard>
      </PccBentoGrid>,
    );
    const phoneCard = container.querySelector('[data-pcc-footprint="hero"]');
    const phoneSpan = Number(phoneCard?.getAttribute('data-pcc-column-span'));

    expect(wideSpan).toBeGreaterThan(phoneSpan);
    expect(phoneSpan).toBe(1);
  });
});
