/**
 * Phase 06 Prompt 07 — Estimating & Preconstruction analytics card contract.
 *
 * Locks the two preview analytics cards inserted into the
 * Estimating & Preconstruction primary dashboard: estimating-only
 * rendering, exact 5-card direct-child order, per-card markers, verbatim
 * preview-copy strings, source-label override, fallback summary outside
 * the chart canvas, span overrides at four 12-/10-column modes plus
 * tabletLandscape footprint-fallback, registry-driven module rows still
 * visible, no Project Intelligence regression, zero card-level active-
 * panel marker, and the static `echarts-for-react`-not-imported guard
 * scoped to PCC analytics + the Phase 05 dashboard surface.
 *
 * Mocks `echarts/core` so jsdom doesn't spin up real ECharts during the
 * dashboard renders.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const { setOptionMock, resizeMock, disposeMock, initMock } = vi.hoisted(() => {
  const setOptionMock = vi.fn();
  const resizeMock = vi.fn();
  const disposeMock = vi.fn();
  const initMock = vi.fn(() => ({
    setOption: setOptionMock,
    resize: resizeMock,
    dispose: disposeMock,
  }));
  return { setOptionMock, resizeMock, disposeMock, initMock };
});

vi.mock('echarts/core', () => ({
  use: vi.fn(),
  registerTheme: vi.fn(),
  init: initMock,
}));
vi.mock('echarts/charts', () => ({ BarChart: {}, LineChart: {}, PieChart: {} }));
vi.mock('echarts/components', () => ({
  DatasetComponent: {},
  GridComponent: {},
  LegendComponent: {},
  TooltipComponent: {},
}));
vi.mock('echarts/renderers', () => ({ SVGRenderer: {} }));

import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccPrimaryDashboardSurface } from '../surfaces/phase05Dashboard/PccPrimaryDashboardSurface';
import {
  PCC_ANALYTICS_PREVIEW_DESCRIPTION,
  PCC_ANALYTICS_PREVIEW_LABEL,
} from '../analytics/pccAnalyticsA11y';
import {
  ESTIMATING_PRECONSTRUCTION_ANALYTICS_VIEW_MODELS,
  type PccEstimatingPreconstructionAnalyticsCardKey,
} from '../surfaces/phase05Dashboard/estimatingPreconstructionAnalytics';
import type { PccPrimaryTabId } from '@hbc/models/pcc';
import type { PccResponsiveMode } from '../layout/footprints';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const ANALYTICS_KEYS: readonly PccEstimatingPreconstructionAnalyticsCardKey[] = [
  'handoffContinuityPreview',
  'estimateExposurePreview',
];

const ANALYTICS_TITLE_BY_KEY: Readonly<
  Record<PccEstimatingPreconstructionAnalyticsCardKey, string>
> = {
  handoffContinuityPreview: 'Handoff Continuity Preview',
  estimateExposurePreview: 'Estimate Exposure Preview',
};

const ANALYTICS_ID_BY_KEY: Readonly<Record<PccEstimatingPreconstructionAnalyticsCardKey, string>> =
  {
    handoffContinuityPreview: 'pcc-estimating-handoff-continuity-preview',
    estimateExposurePreview: 'pcc-estimating-estimate-exposure-preview',
  };

const SAMPLE_SOURCE_LABEL = 'Source: deterministic preconstruction sample';

function renderEstimating(mode: PccResponsiveMode = 'desktop') {
  return render(
    <PccBentoGrid forceMode={mode}>
      <PccPrimaryDashboardSurface activePrimaryTabId="estimating-preconstruction" />
    </PccBentoGrid>,
  );
}

function renderOtherTab(tabId: PccPrimaryTabId, mode: PccResponsiveMode = 'desktop') {
  return render(
    <PccBentoGrid forceMode={mode}>
      <PccPrimaryDashboardSurface activePrimaryTabId={tabId} />
    </PccBentoGrid>,
  );
}

function readDirectCardTitlesInOrder(grid: HTMLElement): string[] {
  return Array.from(grid.children)
    .filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    )
    .map((card) => card.querySelector('h2,h3,h4')?.textContent?.trim() ?? '');
}

function getCardArticle(container: HTMLElement, id: string): HTMLElement {
  const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
  if (!(body instanceof HTMLElement)) {
    throw new Error(`Analytics card body for ${id} not found`);
  }
  const article = body.closest('[data-pcc-card]');
  if (!(article instanceof HTMLElement)) {
    throw new Error(`Article ancestor for ${id} not found`);
  }
  return article;
}

describe('Estimating & Preconstruction analytics — title rendering', () => {
  it('renders both analytics card titles in the bento grid', () => {
    const { container } = renderEstimating();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    expect(grid!.textContent).toContain(ANALYTICS_TITLE_BY_KEY.handoffContinuityPreview);
    expect(grid!.textContent).toContain(ANALYTICS_TITLE_BY_KEY.estimateExposurePreview);
  });
});

describe('Estimating & Preconstruction analytics — exact 5-card direct order', () => {
  it('renders Estimating & Preconstruction → Module status → 2 analytics → Select a module when no module is active', () => {
    const { container } = renderEstimating();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const titles = readDirectCardTitlesInOrder(grid);
    expect(titles).toEqual([
      'Estimating & Preconstruction',
      'Module status',
      'Handoff Continuity Preview',
      'Estimate Exposure Preview',
      'Select a module',
    ]);
  });
});

describe('Estimating & Preconstruction analytics — unrelated dashboards remain unchanged', () => {
  // Phase 06 Prompt 10 — cost-time now renders 6 cards (3 of its own
  // analytics). The remaining unrelated 3-card primary dashboards are
  // core-tools and systems-administration. Iterate those.
  for (const tabId of ['core-tools', 'systems-administration'] as const) {
    it(`'${tabId}' renders zero estimating analytics cards and exactly 3 direct dashboard cards`, () => {
      const { container } = renderOtherTab(tabId);
      const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
      const directCards = Array.from(grid.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
      );
      expect(directCards).toHaveLength(3);
      expect(grid.querySelectorAll('[data-pcc-analytics-card]')).toHaveLength(0);
      expect(grid.textContent).not.toContain('Handoff Continuity Preview');
      expect(grid.textContent).not.toContain('Estimate Exposure Preview');
    });
  }
});

describe('Estimating & Preconstruction analytics — per-card markers', () => {
  it('emits the canonical analytics card markers for each Estimating analytics card', () => {
    const { container } = renderEstimating();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      expect(body, `card body for ${id} should render`).not.toBeNull();
      expect(body!.getAttribute('data-pcc-analytics-card-state')).toBe('preview');
      expect(body!.getAttribute('data-pcc-analytics-card-sample-data')).toBe('true');
      const chart = body!.querySelector(`[data-pcc-analytics-chart="${id}"]`);
      expect(chart, `chart container for ${id} should render`).not.toBeNull();
      expect(chart!.getAttribute('data-pcc-analytics-sample-data')).toBe('true');
    }
  });
});

describe('Estimating & Preconstruction analytics — verbatim preview copy and source label', () => {
  it('renders the verbatim preview-copy strings inside each analytics card explanation', () => {
    const { container } = renderEstimating();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const explanation = body!.querySelector('[data-pcc-analytics-card-sample-explanation]');
      expect(explanation, `explanation block for ${id}`).not.toBeNull();
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_LABEL);
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_DESCRIPTION);
    }
  });

  it('overrides the source label to "Source: deterministic preconstruction sample" on each analytics card', () => {
    const { container } = renderEstimating();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const sourceLabel = body!.querySelector('[data-pcc-analytics-card-source-label]');
      expect(sourceLabel?.textContent?.trim()).toBe(SAMPLE_SOURCE_LABEL);
    }
  });
});

describe('Estimating & Preconstruction analytics — fallback summary outside chart and direct-child invariant', () => {
  it('renders the summary list with no row nested inside the chart canvas', () => {
    const { container } = renderEstimating();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const summaryRows = body!.querySelectorAll('[data-pcc-analytics-card-summary-row]');
      expect(summaryRows.length, `${id} should have summary rows`).toBe(
        ESTIMATING_PRECONSTRUCTION_ANALYTICS_VIEW_MODELS[key].summary.length,
      );
      for (const row of Array.from(summaryRows)) {
        expect(row.closest('[data-pcc-analytics-chart]')).toBeNull();
      }
    }
  });

  it('every analytics card article is a direct child of [data-pcc-bento-grid]', () => {
    const { container } = renderEstimating();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.parentElement).toBe(grid);
    }
  });
});

describe('Estimating & Preconstruction analytics — span overrides', () => {
  const TWELVE_COL_SPAN: Readonly<Record<PccEstimatingPreconstructionAnalyticsCardKey, number>> = {
    handoffContinuityPreview: 6,
    estimateExposurePreview: 6,
  };
  const STANDARD_LAPTOP_SPAN: Readonly<
    Record<PccEstimatingPreconstructionAnalyticsCardKey, number>
  > = {
    handoffContinuityPreview: 5,
    estimateExposurePreview: 5,
  };

  function assertOverrides(
    expectedByKey: Readonly<Record<PccEstimatingPreconstructionAnalyticsCardKey, number>>,
    mode: PccResponsiveMode,
  ): void {
    const { container } = renderEstimating(mode);
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.getAttribute('data-pcc-column-span'), `${key} column span at ${mode}`).toBe(
        String(expectedByKey[key]),
      );
      expect(article.getAttribute('data-pcc-span-source')).toBe('override');
      expect(article.getAttribute('data-pcc-span-override-mode')).toBe(mode);
    }
  }

  it('applies the 12-column matrix at desktop', () => {
    assertOverrides(TWELVE_COL_SPAN, 'desktop');
  });

  it('applies the 12-column matrix at largeLaptop', () => {
    assertOverrides(TWELVE_COL_SPAN, 'largeLaptop');
  });

  it('applies the 12-column matrix at ultrawide', () => {
    assertOverrides(TWELVE_COL_SPAN, 'ultrawide');
  });

  it('applies the 10-column matrix at standardLaptop', () => {
    assertOverrides(STANDARD_LAPTOP_SPAN, 'standardLaptop');
  });

  it('falls back to footprint behavior at tabletLandscape (no estimating analytics override declared)', () => {
    const { container } = renderEstimating('tabletLandscape');
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.getAttribute('data-pcc-span-source')).toBe('footprint');
      expect(article.hasAttribute('data-pcc-span-override-mode')).toBe(false);
    }
  });
});

describe('Estimating & Preconstruction analytics — registry rows preserved and posture invariants', () => {
  it('keeps the existing Estimating module rows visible (registry unchanged)', () => {
    const { container } = renderEstimating();
    expect(container.textContent).toContain('Future estimating modules');
    expect(container.textContent).toContain('Preconstruction Handoff');
    expect(container.textContent).toContain('Estimate Assumptions / Alternates / Exclusions');
  });

  it('does not contain "Project Intelligence" anywhere in the Estimating dashboard', () => {
    const { container } = renderEstimating();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.textContent ?? '').not.toContain('Project Intelligence');
  });

  it('renders zero card-level [data-pcc-active-surface-panel] markers (shell owns the active panel)', () => {
    const { container } = renderEstimating();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.querySelectorAll('[data-pcc-card][data-pcc-active-surface-panel]')).toHaveLength(0);
  });
});

describe('Phase 05 dashboard + PCC analytics — does not import echarts-for-react', () => {
  it('no PCC analytics or phase05Dashboard source file (excluding tests) imports the echarts-for-react module', () => {
    const roots = [
      join(import.meta.dirname, '..', 'analytics'),
      join(import.meta.dirname, '..', 'surfaces', 'phase05Dashboard'),
    ];
    const failures: string[] = [];
    const importPattern = /(?:from|require\(|import\()\s*['"]echarts-for-react['"]/;

    function walk(dir: string): void {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.isFile()) continue;
        if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) continue;
        if (!/\.(tsx?|css)$/.test(entry.name)) continue;
        const content = readFileSync(full, 'utf8');
        if (importPattern.test(content)) {
          failures.push(full);
        }
      }
    }

    for (const root of roots) walk(root);
    expect(
      failures,
      `expected zero echarts-for-react imports under analytics/ and surfaces/phase05Dashboard/, got ${failures.join(', ')}`,
    ).toHaveLength(0);
  });
});
