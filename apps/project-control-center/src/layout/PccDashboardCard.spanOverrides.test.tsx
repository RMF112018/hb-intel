import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PccBentoGrid } from './PccBentoGrid';
import { PccDashboardCard, type PccDashboardCardProps } from './PccDashboardCard';
import {
  PCC_RESPONSIVE_COLUMNS,
  resolveDashboardCardColumnSpan,
  type PccResponsiveMode,
} from './footprints';

/**
 * Phase 06 Prompt 01 — Span Override Foundation.
 *
 * Tests render through `<PccBentoGrid forceMode={mode}>` because
 * `usePccBentoContext` throws outside the bento context. `forceMode` keeps
 * the test deterministic and avoids the container-query hook in jsdom.
 *
 * Note: span overrides are mode-keyed and re-evaluated each render. If the
 * host narrows from `desktop` to e.g. `tabletLandscape`, an override keyed
 * to `desktop` no longer matches and the resolver returns the footprint
 * default for the new mode. This is the intended behavior — overrides do
 * not "stick" across modes.
 */
function renderCard(
  props: Partial<PccDashboardCardProps> = {},
  mode: PccResponsiveMode = 'desktop',
  children: ReactNode = <div>body</div>,
) {
  const merged: PccDashboardCardProps = { children, ...props };
  return render(
    <PccBentoGrid forceMode={mode}>
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

describe('PccDashboardCard span overrides — render path', () => {
  it('no override: footprint span and source="footprint"; no override-mode attribute', () => {
    const { container } = renderCard({ footprint: 'standard' }, 'desktop');
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-column-span')).toBe('4');
    expect(card.getAttribute('data-pcc-span-source')).toBe('footprint');
    expect(card.hasAttribute('data-pcc-span-override-mode')).toBe(false);
  });

  it('matching mode override wins over footprint default', () => {
    const { container } = renderCard(
      { footprint: 'standard', spanOverrides: { desktop: 5 } },
      'desktop',
    );
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-column-span')).toBe('5');
    expect(card.getAttribute('data-pcc-span-source')).toBe('override');
    expect(card.getAttribute('data-pcc-span-override-mode')).toBe('desktop');
    expect((card.style.gridColumn ?? '').trim()).toBe('span 5');
  });

  it('override above active columns clamps to the column count', () => {
    const { container } = renderCard(
      { footprint: 'standard', spanOverrides: { desktop: 99 } },
      'desktop',
    );
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-column-span')).toBe(String(PCC_RESPONSIVE_COLUMNS.desktop));
    expect(card.getAttribute('data-pcc-span-source')).toBe('override');
    expect(card.getAttribute('data-pcc-span-override-mode')).toBe('desktop');
  });

  it('override of 0 clamps to 1', () => {
    const { container } = renderCard(
      { footprint: 'standard', spanOverrides: { desktop: 0 } },
      'desktop',
    );
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-column-span')).toBe('1');
    expect(card.getAttribute('data-pcc-span-source')).toBe('override');
  });

  it('negative override clamps to 1', () => {
    const { container } = renderCard(
      { footprint: 'standard', spanOverrides: { desktop: -3 } },
      'desktop',
    );
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-column-span')).toBe('1');
    expect(card.getAttribute('data-pcc-span-source')).toBe('override');
  });

  it('decimal override is integer-truncated (4.7 → 4)', () => {
    const { container } = renderCard(
      { footprint: 'standard', spanOverrides: { desktop: 4.7 } },
      'desktop',
    );
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-column-span')).toBe('4');
    expect(card.getAttribute('data-pcc-span-source')).toBe('override');
  });

  it('NaN override falls back to footprint source', () => {
    const { container } = renderCard(
      { footprint: 'standard', spanOverrides: { desktop: Number.NaN } },
      'desktop',
    );
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-column-span')).toBe('4');
    expect(card.getAttribute('data-pcc-span-source')).toBe('footprint');
    expect(card.hasAttribute('data-pcc-span-override-mode')).toBe(false);
  });

  it('Infinity override falls back to footprint source', () => {
    const { container } = renderCard(
      { footprint: 'standard', spanOverrides: { desktop: Number.POSITIVE_INFINITY } },
      'desktop',
    );
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-column-span')).toBe('4');
    expect(card.getAttribute('data-pcc-span-source')).toBe('footprint');
    expect(card.hasAttribute('data-pcc-span-override-mode')).toBe(false);
  });

  it('override on a non-matching mode does not affect the active mode', () => {
    // Active mode is tabletPortrait (column count 2). The desktop override
    // does not match and must be ignored — footprint behavior must stand.
    const { container } = renderCard(
      { footprint: 'standard', spanOverrides: { desktop: 5 } },
      'tabletPortrait',
    );
    const card = getCard(container);
    // tabletPortrait.standard footprint resolves via Math.max(1, 2) = 2.
    expect(card.getAttribute('data-pcc-column-span')).toBe('2');
    expect(card.getAttribute('data-pcc-span-source')).toBe('footprint');
    expect(card.hasAttribute('data-pcc-span-override-mode')).toBe(false);
  });

  it('override can intentionally resolve below the footprint default and minimum', () => {
    // hero footprint at desktop has default = 8 and minimum = 8. An
    // override of 3 must win — this is the foundational reason for the
    // resolver: composition-driven layouts can intentionally place a
    // hero-footprint card at 3 columns.
    const { container } = renderCard(
      { footprint: 'hero', spanOverrides: { desktop: 3 } },
      'desktop',
    );
    const card = getCard(container);
    expect(card.getAttribute('data-pcc-column-span')).toBe('3');
    expect(card.getAttribute('data-pcc-span-source')).toBe('override');
    expect(card.getAttribute('data-pcc-span-override-mode')).toBe('desktop');
  });

  it('min-inline-size remains footprint-derived regardless of override', () => {
    // desktop.compact min-inline-size is 200px. Overriding the column span
    // does not change the footprint-derived min-inline-size.
    const { container } = renderCard(
      { footprint: 'compact', spanOverrides: { desktop: 5 } },
      'desktop',
    );
    const card = getCard(container);
    expect(card.style.minInlineSize).toBe('200px');
  });

  it('all pre-existing data-pcc-* markers remain present alongside the new span markers', () => {
    const { container } = renderCard(
      {
        title: 'Markers',
        hierarchy: 'primary',
        footprint: 'standard',
        density: 'comfortable',
        dataActiveSurfacePanel: 'project-home',
        spanOverrides: { desktop: 5 },
      },
      'desktop',
    );
    const card = getCard(container);
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
      'data-pcc-card-tier-source',
      'data-pcc-card-region-source',
      'data-pcc-heading-level',
      'data-pcc-span-source',
      'data-pcc-span-override-mode',
    ];
    for (const attr of requiredAttrs) {
      expect(card.hasAttribute(attr)).toBe(true);
    }
    // Spot-check key resolved values stay aligned with the override.
    expect(card.getAttribute('data-pcc-column-span')).toBe('5');
    expect(card.getAttribute('data-pcc-span-source')).toBe('override');
    expect(card.getAttribute('data-pcc-span-override-mode')).toBe('desktop');
  });
});

describe('resolveDashboardCardColumnSpan — pure helper', () => {
  it('returns footprint span when no overrides are supplied', () => {
    expect(resolveDashboardCardColumnSpan('desktop', 'standard', 12)).toEqual({
      columnSpan: 4,
      source: 'footprint',
    });
  });

  it('returns footprint span when overrides has no matching mode key', () => {
    expect(resolveDashboardCardColumnSpan('desktop', 'standard', 12, {})).toEqual({
      columnSpan: 4,
      source: 'footprint',
    });
  });

  it('matching mode override wins over footprint default', () => {
    expect(resolveDashboardCardColumnSpan('desktop', 'standard', 12, { desktop: 5 })).toEqual({
      columnSpan: 5,
      source: 'override',
      overrideMode: 'desktop',
    });
  });

  it('override above column count clamps high', () => {
    const result = resolveDashboardCardColumnSpan('desktop', 'standard', 12, { desktop: 99 });
    expect(result.columnSpan).toBe(12);
    expect(result.source).toBe('override');
  });

  it('override of 0 clamps low to 1', () => {
    const result = resolveDashboardCardColumnSpan('desktop', 'standard', 12, { desktop: 0 });
    expect(result.columnSpan).toBe(1);
    expect(result.source).toBe('override');
  });

  it('decimal override is integer-truncated', () => {
    const result = resolveDashboardCardColumnSpan('desktop', 'standard', 12, { desktop: 3.9 });
    expect(result.columnSpan).toBe(3);
    expect(result.source).toBe('override');
  });

  it('NaN override falls back to footprint source', () => {
    const result = resolveDashboardCardColumnSpan('desktop', 'standard', 12, {
      desktop: Number.NaN,
    });
    expect(result.columnSpan).toBe(4);
    expect(result.source).toBe('footprint');
    expect(result.overrideMode).toBeUndefined();
  });

  it('override below footprint minimum is honored (intentional-below-minimum)', () => {
    // hero footprint at desktop has min = 8. Override of 3 must produce 3.
    const result = resolveDashboardCardColumnSpan('desktop', 'hero', 12, { desktop: 3 });
    expect(result.columnSpan).toBe(3);
    expect(result.source).toBe('override');
    expect(result.overrideMode).toBe('desktop');
  });
});

describe('PccBentoGrid CSS — no grid-auto-flow declared', () => {
  it('PccBentoGrid.module.css does not declare grid-auto-flow', () => {
    // `import.meta.url` resolves to a non-file scheme under this Vitest
    // runtime (Vite-transformed modules), so use `import.meta.dirname`
    // (Node 20+) which yields the package-relative on-disk directory.
    const cssPath = join(import.meta.dirname, 'PccBentoGrid.module.css');
    const cssSource = readFileSync(cssPath, 'utf8');
    expect(cssSource).not.toMatch(/grid-auto-flow/);
  });
});
