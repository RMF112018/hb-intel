import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PccBentoGrid } from './PccBentoGrid';
import { PccDashboardCard, type PccDashboardCardProps } from './PccDashboardCard';

/**
 * Acceptance harness for the shared PCC card primitive.
 *
 * Tests render through `<PccBentoGrid forceMode="desktop">` because
 * `usePccBentoContext` (PccBentoGrid.tsx) throws when the card is rendered
 * outside the bento context. `forceMode` keeps the test deterministic and
 * avoids the container-query-driven breakpoint hook in jsdom.
 *
 * `useBentoRowSpan` reads `ResizeObserver` defensively and is a no-op when
 * it is undefined (jsdom's default), so the card renders with the hook's
 * documented minimum row span without any global stub here.
 */
function renderCard(
  props: Partial<PccDashboardCardProps> = {},
  children: ReactNode = <div>body</div>,
) {
  const merged: PccDashboardCardProps = { children, ...props };
  return render(
    <PccBentoGrid forceMode="desktop">
      <PccDashboardCard {...merged} />
    </PccBentoGrid>,
  );
}

function getCard(container: HTMLElement): HTMLElement {
  const article = container.querySelector('[data-pcc-card]');
  if (!(article instanceof HTMLElement)) {
    throw new Error('Expected a [data-pcc-card] article in the rendered tree');
  }
  return article;
}

describe('PccDashboardCard tier / region / heading contract', () => {
  it('default props resolve to tier2 + operational region', () => {
    const { container } = renderCard({ title: 'Default' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card.getAttribute('data-pcc-card-region')).toBe('operational');
  });

  it("hierarchy='primary' (no explicit tier) resolves to tier1 + command region", () => {
    const { container } = renderCard({ hierarchy: 'primary', title: 'Primary' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier1');
    expect(card.getAttribute('data-pcc-card-region')).toBe('command');
  });

  it("hierarchy='supporting' (no explicit tier) resolves to tier3 + reference region", () => {
    const { container } = renderCard({ hierarchy: 'supporting', title: 'Supporting' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
  });

  it('explicit tier overrides hierarchy', () => {
    const { container } = renderCard({
      hierarchy: 'primary',
      tier: 'tier3',
      title: 'Override',
    });
    const card = getCard(container);
    // Explicit tier wins; region default flows from the resolved tier.
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
  });

  it('explicit region overrides tier-derived default', () => {
    const { container } = renderCard({ tier: 'tier2', region: 'detail', title: 'Region' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    // Without the explicit region, tier2 would default to 'operational'.
    expect(card.getAttribute('data-pcc-card-region')).toBe('detail');
  });

  it('headingLevel={2} renders an h2 for the visible title', () => {
    const { container } = renderCard({ headingLevel: 2, title: 'Heading two' });
    const heading = container.querySelector('h2');
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toBe('Heading two');
  });

  it('tier1 default heading renders h2', () => {
    const { container } = renderCard({ tier: 'tier1', title: 'Command' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier1');
    expect(container.querySelector('h2')?.textContent).toBe('Command');
    expect(container.querySelector('h3')).toBeNull();
  });

  it('tier2 default heading renders h3', () => {
    const { container } = renderCard({ tier: 'tier2', title: 'Operational' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(container.querySelector('h3')?.textContent).toBe('Operational');
    expect(container.querySelector('h2')).toBeNull();
  });

  it('card with title uses aria-labelledby pointing at the rendered heading id', () => {
    const { container } = renderCard({ title: 'Labelled' });
    const card = getCard(container);
    const labelledBy = card.getAttribute('aria-labelledby');
    expect(labelledBy).not.toBeNull();
    expect(labelledBy).not.toBe('');
    // aria-label must NOT be present when aria-labelledby is in use.
    expect(card.hasAttribute('aria-label')).toBe(false);
    const heading = container.querySelector('h3');
    expect(heading?.id).toBe(labelledBy);
  });

  it('card without title falls back to aria-label and omits aria-labelledby', () => {
    const { container } = renderCard({ ariaLabel: 'Region label' });
    const card = getCard(container);
    expect(card.hasAttribute('aria-labelledby')).toBe(false);
    expect(card.getAttribute('aria-label')).toBe('Region label');
  });

  it('preserves all existing data-pcc-* markers on the card', () => {
    const { container } = renderCard({
      title: 'Markers',
      hierarchy: 'primary',
      footprint: 'standard',
      density: 'comfortable',
      dataActiveSurfacePanel: 'project-home',
    });
    const card = getCard(container);
    // Existing markers (must remain present) — assertion 11 of the
    // acceptance matrix is about presence, not exact values, so we
    // verify each attribute is on the article element.
    const requiredAttrs = [
      'data-pcc-card',
      'data-pcc-footprint',
      'data-pcc-card-hierarchy',
      'data-pcc-card-density',
      'data-pcc-mode',
      'data-pcc-column-span',
      'data-pcc-row-span',
      'data-pcc-measured-height',
      'data-pcc-active-surface-panel',
      'data-pcc-card-tier',
      'data-pcc-card-region',
      // Source markers introduced in Wave 15A wave-b3 Prompt 01.
      'data-pcc-card-tier-source',
      'data-pcc-card-region-source',
      'data-pcc-heading-level',
    ];
    for (const attr of requiredAttrs) {
      expect(card.hasAttribute(attr)).toBe(true);
    }
    // Spot-check the legacy hierarchy marker is unchanged.
    expect(card.getAttribute('data-pcc-card-hierarchy')).toBe('primary');
  });
});

describe('PccDashboardCard contract source markers', () => {
  it("explicit tier prop emits tier-source='explicit'", () => {
    const { container } = renderCard({ tier: 'tier2', title: 'Explicit tier' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card.getAttribute('data-pcc-card-tier-source')).toBe('explicit');
  });

  it("hierarchy='primary' (no explicit tier) emits tier-source='hierarchy'", () => {
    const { container } = renderCard({ hierarchy: 'primary', title: 'Hierarchy primary' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier1');
    expect(card.getAttribute('data-pcc-card-tier-source')).toBe('hierarchy');
  });

  it("hierarchy='supporting' (no explicit tier) emits tier-source='hierarchy'", () => {
    const { container } = renderCard({ hierarchy: 'supporting', title: 'Hierarchy supporting' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-tier-source')).toBe('hierarchy');
  });

  it("default props (no tier, no non-standard hierarchy) emit tier-source='default'", () => {
    const { container } = renderCard({ title: 'Default tier' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card.getAttribute('data-pcc-card-tier-source')).toBe('default');
  });

  it("explicit tier overrides non-standard hierarchy and emits tier-source='explicit'", () => {
    const { container } = renderCard({
      hierarchy: 'primary',
      tier: 'tier3',
      title: 'Override',
    });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-tier-source')).toBe('explicit');
  });

  it("explicit region prop emits region-source='explicit'", () => {
    const { container } = renderCard({ region: 'detail', title: 'Explicit region' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-region')).toBe('detail');
    expect(card.getAttribute('data-pcc-card-region-source')).toBe('explicit');
  });

  it("region omitted emits region-source='resolved'", () => {
    const { container } = renderCard({ tier: 'tier1', title: 'Resolved region' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-card-region')).toBe('command');
    expect(card.getAttribute('data-pcc-card-region-source')).toBe('resolved');
  });

  it('emits resolved heading level marker for tier1 default (h2)', () => {
    const { container } = renderCard({ tier: 'tier1', title: 'Tier1 heading' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-heading-level')).toBe('2');
  });

  it('emits resolved heading level marker for tier2 default (h3)', () => {
    const { container } = renderCard({ tier: 'tier2', title: 'Tier2 heading' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-heading-level')).toBe('3');
  });

  it('emits resolved heading level marker for tier3 default (h3)', () => {
    const { container } = renderCard({ tier: 'tier3', title: 'Tier3 heading' });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-heading-level')).toBe('3');
  });

  it('explicit headingLevel={4} overrides tier-derived default', () => {
    const { container } = renderCard({
      tier: 'tier1',
      headingLevel: 4,
      title: 'Explicit heading',
    });
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-heading-level')).toBe('4');
    expect(container.querySelector('h4')?.textContent).toBe('Explicit heading');
    expect(container.querySelector('h2')).toBeNull();
  });
});
