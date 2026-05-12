/**
 * Phase 06 Prompt 04 — Project Home analytics card contract.
 *
 * Locks the three preview analytics cards inserted into both Project Home
 * render paths: their state/sample-data markers, exact preview-copy
 * strings, source-label override, span overrides at four 12-/10-column
 * modes plus tabletLandscape footprint-fallback, and the static
 * `echarts-for-react`-not-imported guard scoped to PCC analytics +
 * Project Home source.
 *
 * Mocks `echarts/core` so jsdom doesn't spin up real ECharts during
 * Project Home renders.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';

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

import { PccApp } from '../PccApp';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import {
  PCC_ANALYTICS_PREVIEW_DESCRIPTION,
  PCC_ANALYTICS_PREVIEW_LABEL,
} from '../analytics/pccAnalyticsA11y';
import {
  PROJECT_HOME_ANALYTICS_VIEW_MODELS,
  type PccProjectHomeAnalyticsCardKey,
} from '../surfaces/projectHome/projectHomeAnalytics';
import type { PccResponsiveMode } from '../layout/footprints';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const ANALYTICS_KEYS: readonly PccProjectHomeAnalyticsCardKey[] = [
  'actionExposureMix',
  'projectHealthTrend',
  'readinessApprovalRollup',
];

const ANALYTICS_TITLE_BY_KEY: Readonly<Record<PccProjectHomeAnalyticsCardKey, string>> = {
  actionExposureMix: 'Action Exposure Mix',
  projectHealthTrend: 'Project Health Trend',
  readinessApprovalRollup: 'Readiness / Approval Rollup',
};

const ANALYTICS_ID_BY_KEY: Readonly<Record<PccProjectHomeAnalyticsCardKey, string>> = {
  actionExposureMix: 'pcc-project-home-action-exposure-mix',
  projectHealthTrend: 'pcc-project-home-project-health-trend',
  readinessApprovalRollup: 'pcc-project-home-readiness-approval-rollup',
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic project sample';

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

describe('Project Home analytics cards — fixture path rendering', () => {
  it('renders all three analytics card titles without a read-model client', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    for (const key of ANALYTICS_KEYS) {
      expect(grid!.textContent).toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });

  it('emits the canonical analytics card markers for each card on the fixture path', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
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

  it('renders the verbatim preview-copy strings inside each analytics card explanation', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const explanation = body!.querySelector('[data-pcc-analytics-card-sample-explanation]');
      expect(explanation, `explanation block for ${id}`).not.toBeNull();
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_LABEL);
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_DESCRIPTION);
    }
  });

  it('overrides the source label to "Source: deterministic project sample" on each analytics card', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const sourceLabel = body!.querySelector('[data-pcc-analytics-card-source-label]');
      expect(sourceLabel?.textContent?.trim()).toBe(SAMPLE_SOURCE_LABEL);
    }
  });

  it('renders the fallback summary list outside the chart canvas for each analytics card', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const summaryRows = body!.querySelectorAll('[data-pcc-analytics-card-summary-row]');
      expect(summaryRows.length, `${id} should have summary rows`).toBe(
        PROJECT_HOME_ANALYTICS_VIEW_MODELS[key].summary.length,
      );
      for (const row of Array.from(summaryRows)) {
        expect(row.closest('[data-pcc-analytics-chart]')).toBeNull();
      }
    }
  });

  it('every analytics card article is a direct child of [data-pcc-bento-grid]', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.parentElement).toBe(grid);
    }
  });
});

describe('Project Home analytics cards — read-model path rendering', () => {
  it('renders all three analytics card titles when a read-model client is supplied', async () => {
    const { container, findByText } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    await findByText('Lifecycle Timeline');
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    for (const key of ANALYTICS_KEYS) {
      expect(grid!.textContent).toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });

  it('analytics cards emit the same preview/sample-data markers on the read-model path', async () => {
    const { container, findByText } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    await findByText('Lifecycle Timeline');
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      expect(body!.getAttribute('data-pcc-analytics-card-state')).toBe('preview');
      expect(body!.getAttribute('data-pcc-analytics-card-sample-data')).toBe('true');
    }
  });
});

describe('Project Home analytics cards — adjacency in the bento grid', () => {
  function readDirectCardTitlesInOrder(grid: HTMLElement): string[] {
    return Array.from(grid.children)
      .filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
      )
      .map((card) => card.querySelector('h2,h3,h4')?.textContent?.trim() ?? '');
  }

  it('places Action Exposure Mix and Project Health Trend between Site Health Summary and Approvals & Checkpoints on the fixture path (Phase 08 Prompt 09 re-centered second-row analytics pair)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const titles = readDirectCardTitlesInOrder(grid);
    const idx = (t: string) => titles.indexOf(t);
    expect(idx('Site Health Summary')).toBeLessThan(idx('Action Exposure Mix'));
    expect(idx('Action Exposure Mix')).toBeLessThan(idx('Project Health Trend'));
    expect(idx('Project Health Trend')).toBeLessThan(idx('Approvals & Checkpoints'));
  });

  it('places Readiness / Approval Rollup between Approvals & Checkpoints and Missing Configurations on the fixture path', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const titles = readDirectCardTitlesInOrder(grid);
    const idx = (t: string) => titles.indexOf(t);
    expect(idx('Approvals & Checkpoints')).toBeLessThan(idx('Readiness / Approval Rollup'));
    expect(idx('Readiness / Approval Rollup')).toBeLessThan(idx('Missing Configurations'));
  });

  it('keeps Lifecycle Timeline below the analytics cluster on the read-model path', async () => {
    const { container, findByText } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    await findByText('Lifecycle Timeline');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    await waitFor(() => {
      const titles = readDirectCardTitlesInOrder(grid);
      const idx = (t: string) => titles.indexOf(t);
      expect(idx('Lifecycle Timeline')).toBeGreaterThan(idx('Recent Activity'));
      expect(idx('Lifecycle Timeline')).toBeGreaterThan(idx('Readiness / Approval Rollup'));
    });
  });
});

describe('Project Home analytics cards — span overrides', () => {
  const TWELVE_COL_SPAN: Readonly<Record<PccProjectHomeAnalyticsCardKey, number>> = {
    actionExposureMix: 4,
    projectHealthTrend: 4,
    readinessApprovalRollup: 4,
  };
  const STANDARD_LAPTOP_SPAN: Readonly<Record<PccProjectHomeAnalyticsCardKey, number>> = {
    actionExposureMix: 3,
    projectHealthTrend: 3,
    readinessApprovalRollup: 4,
  };

  function assertOverrides(
    expectedByKey: Readonly<Record<PccProjectHomeAnalyticsCardKey, number>>,
    mode: PccResponsiveMode,
  ): void {
    const { container } = render(<PccApp forceMode={mode} />);
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

  it('falls back to footprint behavior at tabletLandscape (no analytics span override declared)', () => {
    const { container } = render(<PccApp forceMode="tabletLandscape" />);
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.getAttribute('data-pcc-span-source')).toBe('footprint');
      expect(article.hasAttribute('data-pcc-span-override-mode')).toBe(false);
    }
  });
});

describe('PCC analytics + Project Home — does not import echarts-for-react', () => {
  it('no PCC analytics or Project Home source file (excluding tests) imports the echarts-for-react module', () => {
    const roots = [
      join(import.meta.dirname, '..', 'analytics'),
      join(import.meta.dirname, '..', 'surfaces', 'projectHome'),
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
      `expected zero echarts-for-react imports under analytics/ and surfaces/projectHome/, got ${failures.join(', ')}`,
    ).toHaveLength(0);
  });
});
