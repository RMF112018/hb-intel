import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccDashboardCard } from '../layout/PccDashboardCard';
import {
  FOOTPRINT_COLUMN_SPANS,
  FOOTPRINT_MIN_COLUMN_SPANS,
  resolveFootprintColumnSpan,
  PCC_CARD_FOOTPRINTS,
} from '../layout/footprints';
import { PccProjectHome } from '../surfaces/projectHome/PccProjectHome';

describe('PccBentoGrid footprint contract', () => {
  it('renders one card per footprint and each carries data-pcc-footprint', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
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
      expect(declaredSpan, `declared column span for '${footprint}' should be > 0`).toBeGreaterThan(
        0,
      );
      expect(declaredSpan).toBe(resolveFootprintColumnSpan('desktop', footprint));
    }
  });

  it('enforces protected minimum spans on constrained modes', () => {
    const { container } = render(
      <PccBentoGrid forceMode="tabletPortrait">
        {PCC_CARD_FOOTPRINTS.map((footprint) => (
          <PccDashboardCard key={footprint} footprint={footprint} title={footprint}>
            <p>content for {footprint}</p>
          </PccDashboardCard>
        ))}
      </PccBentoGrid>,
    );
    for (const footprint of PCC_CARD_FOOTPRINTS) {
      const card = container.querySelector(`[data-pcc-footprint="${footprint}"]`);
      const declaredSpan = Number(card?.getAttribute('data-pcc-column-span'));
      expect(declaredSpan).toBeGreaterThanOrEqual(
        FOOTPRINT_MIN_COLUMN_SPANS.tabletPortrait[footprint],
      );
    }
  });

  it('does not use grid-auto-flow: dense on the bento root', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccDashboardCard footprint="standard" title="x">
          x
        </PccDashboardCard>
      </PccBentoGrid>,
    );
    const grid = container.querySelector('[data-pcc-bento-grid]') as HTMLElement | null;
    expect(grid).not.toBeNull();
    const computed = grid ? grid.style.gridAutoFlow : '';
    expect(computed).not.toContain('dense');
    expect(grid?.getAttribute('data-pcc-grid-safety')).toBe('enabled');
  });

  it('reduces column spans in narrower modes (no fixed equal-height row)', () => {
    const { container, rerender } = render(
      <PccBentoGrid forceMode="desktop">
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

  it('Project Home registry renders variable footprints with non-uniform spans (no paired-row dependency)', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome />
      </PccBentoGrid>,
    );
    const cards = Array.from(container.querySelectorAll('[data-pcc-card]')) as HTMLElement[];
    expect(cards.length).toBeGreaterThan(1);
    const footprints = new Set(cards.map((card) => card.getAttribute('data-pcc-footprint')));
    const spans = new Set(cards.map((card) => card.getAttribute('data-pcc-column-span')));
    expect(footprints.size).toBeGreaterThan(1);
    expect(spans.size).toBeGreaterThan(1);
  });

  it('emits data-pcc-row-span at or above initialMinRows on initial render (regression: tenant gridRow span 1 collapse)', () => {
    // Tenant evidence (1.0.0.3) showed cards rendering with
    // `gridRow: span 1` × 8px row unit = 8px tall, clipping content.
    // This test asserts the diagnostic attribute is wired and that the
    // initial-render row span (before any ResizeObserver fires) is at
    // least the hook's documented `initialMinRows` floor (4). Deep
    // collapse-resistance proof — including ResizeObserver behavior
    // under constrained measurements — lives in
    // `apps/project-control-center/src/layout/useBentoRowSpan.test.tsx`.
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccDashboardCard footprint="standard" title="x">
          x
        </PccDashboardCard>
      </PccBentoGrid>,
    );
    const card = container.querySelector('[data-pcc-card]') as HTMLElement | null;
    expect(card).not.toBeNull();
    const rowSpanAttr = card?.getAttribute('data-pcc-row-span');
    expect(rowSpanAttr).not.toBeNull();
    // Anchor: the hook's documented `initialMinRows` default is 4.
    // The browser-evidence regression was rowSpan === 1.
    expect(Number(rowSpanAttr)).toBeGreaterThanOrEqual(4);
    // Inline style mirrors the diagnostic attr — never `span 1`.
    expect(card?.style.gridRow).toBe(`span ${rowSpanAttr}`);
    expect(card?.style.gridRow).not.toBe('span 1');
  });

  it('supports shared hierarchy and density variants without changing surface markers', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccDashboardCard
          footprint="wide"
          hierarchy="primary"
          density="compact"
          dataActiveSurfacePanel="project-home"
          title="variant"
        >
          variant content
        </PccDashboardCard>
      </PccBentoGrid>,
    );
    const card = container.querySelector('[data-pcc-card]');
    expect(card?.getAttribute('data-pcc-card-hierarchy')).toBe('primary');
    expect(card?.getAttribute('data-pcc-card-density')).toBe('compact');
    expect(card?.getAttribute('data-pcc-active-surface-panel')).toBe('project-home');
  });

  it('gives promoted laptop-priority footprints stronger spans at smallLaptop and standardLaptop', () => {
    for (const mode of ['smallLaptop', 'standardLaptop'] as const) {
      const heroSpan = resolveFootprintColumnSpan(mode, 'hero');
      const wideSpan = resolveFootprintColumnSpan(mode, 'wide');
      const tallSpan = resolveFootprintColumnSpan(mode, 'tall');
      const standardSpan = resolveFootprintColumnSpan(mode, 'standard');

      expect(heroSpan, `${mode}: hero should remain a top-priority span`).toBeGreaterThanOrEqual(
        wideSpan,
      );
      expect(
        wideSpan,
        `${mode}: wide should outrank prior tall mapping for Priority Actions`,
      ).toBeGreaterThan(tallSpan);
      expect(
        wideSpan,
        `${mode}: wide should not be below standard supporting cards`,
      ).toBeGreaterThanOrEqual(standardSpan);
    }
  });
});
