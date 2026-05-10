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

// Imports below run after the mocks above are installed.
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccAnalyticsCard } from './PccAnalyticsCard';
import { PCC_ANALYTICS_PREVIEW_DESCRIPTION, PCC_ANALYTICS_PREVIEW_LABEL } from './pccAnalyticsA11y';
import {
  PCC_ANALYTICS_FIXTURE_DEGRADED,
  PCC_ANALYTICS_FIXTURE_PREVIEW,
  PCC_ANALYTICS_FIXTURE_READY,
} from './pccAnalyticsFixtures';
import type { PccAnalyticsViewModel } from './pccAnalyticsTypes';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function renderCard(
  viewModel: PccAnalyticsViewModel,
  extras: {
    spanOverrides?: Record<string, number>;
    action?: React.ReactNode;
    forceAnimationDisabled?: boolean;
  } = {},
) {
  return render(
    <PccBentoGrid forceMode="desktop">
      <PccAnalyticsCard
        viewModel={viewModel}
        spanOverrides={extras.spanOverrides as never}
        action={extras.action}
        forceAnimationDisabled={extras.forceAnimationDisabled ?? true}
      />
    </PccBentoGrid>,
  );
}

function getCardBody(container: HTMLElement): HTMLElement {
  const body = container.querySelector('[data-pcc-analytics-card]');
  if (!(body instanceof HTMLElement)) throw new Error('Expected analytics card body');
  return body;
}

function getLastSetOptionArg(): Record<string, unknown> {
  const calls = setOptionMock.mock.calls as readonly [Record<string, unknown>, ...unknown[]][];
  if (calls.length === 0) throw new Error('setOption was not called');
  return calls[calls.length - 1]![0];
}

describe('PccAnalyticsCard — render states', () => {
  it('renders the ready fixture with state and source markers', () => {
    const { container } = renderCard(PCC_ANALYTICS_FIXTURE_READY);
    const body = getCardBody(container);
    expect(body.getAttribute('data-pcc-analytics-card')).toBe('pcc-analytics-fixture-ready');
    expect(body.getAttribute('data-pcc-analytics-card-state')).toBe('ready');
    expect(body.getAttribute('data-pcc-analytics-card-sample-data')).toBe('false');
    // No preview/degraded explanation on the ready path.
    expect(container.querySelector('[data-pcc-analytics-card-sample-explanation]')).toBeNull();
  });

  it('renders the preview fixture with sample-data marker and the verbatim explanation copy', () => {
    const { container } = renderCard(PCC_ANALYTICS_FIXTURE_PREVIEW);
    const body = getCardBody(container);
    expect(body.getAttribute('data-pcc-analytics-card-state')).toBe('preview');
    expect(body.getAttribute('data-pcc-analytics-card-sample-data')).toBe('true');
    const explanation = container.querySelector('[data-pcc-analytics-card-sample-explanation]');
    expect(explanation).not.toBeNull();
    expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_LABEL);
    expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_DESCRIPTION);
  });

  it('renders the degraded fixture with sample-data marker and visible explanation', () => {
    const { container } = renderCard(PCC_ANALYTICS_FIXTURE_DEGRADED);
    const body = getCardBody(container);
    expect(body.getAttribute('data-pcc-analytics-card-state')).toBe('degraded');
    expect(body.getAttribute('data-pcc-analytics-card-sample-data')).toBe('true');
    const explanation = container.querySelector('[data-pcc-analytics-card-sample-explanation]');
    expect(explanation).not.toBeNull();
    expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_LABEL);
  });
});

describe('PccAnalyticsCard — fallback content lives outside the chart', () => {
  it('renders the summary list with one row per summary item, none nested inside the chart canvas', () => {
    const { container } = renderCard(PCC_ANALYTICS_FIXTURE_READY);
    const summaryRows = container.querySelectorAll('[data-pcc-analytics-card-summary-row]');
    expect(summaryRows).toHaveLength(PCC_ANALYTICS_FIXTURE_READY.summary.length);
    for (const row of Array.from(summaryRows)) {
      expect(row.closest('[data-pcc-analytics-chart]')).toBeNull();
    }
  });

  it('exposes the state and source labels visibly in the body', () => {
    const { container } = renderCard(PCC_ANALYTICS_FIXTURE_READY);
    const stateLabel = container.querySelector('[data-pcc-analytics-card-state-label]');
    const sourceLabel = container.querySelector('[data-pcc-analytics-card-source-label]');
    expect(stateLabel?.textContent?.trim()).toBe(PCC_ANALYTICS_FIXTURE_READY.stateLabel);
    expect(sourceLabel?.textContent?.trim()).toBe(PCC_ANALYTICS_FIXTURE_READY.sourceLabel);
  });

  it('encodes summary tone as a data attribute (non-color-only signal)', () => {
    const { container } = renderCard(PCC_ANALYTICS_FIXTURE_READY);
    const tones = Array.from(
      container.querySelectorAll('[data-pcc-analytics-card-summary-tone]'),
    ).map((node) => node.getAttribute('data-pcc-analytics-card-summary-tone'));
    expect(tones).toEqual(PCC_ANALYTICS_FIXTURE_READY.summary.map((s) => s.tone ?? 'neutral'));
  });
});

describe('PccAnalyticsCard — bento + span override pass-through', () => {
  it('renders PccDashboardCard as the outermost element so the article is a direct bento child', () => {
    const { container } = renderCard(PCC_ANALYTICS_FIXTURE_READY);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    const article = container.querySelector('[data-pcc-card]');
    expect(grid).not.toBeNull();
    expect(article).not.toBeNull();
    expect(article!.parentElement).toBe(grid);
  });

  it('forwards spanOverrides to PccDashboardCard and emits override markers', () => {
    const { container } = renderCard(PCC_ANALYTICS_FIXTURE_READY, {
      spanOverrides: { desktop: 5 },
    });
    const article = container.querySelector('[data-pcc-card]');
    expect(article?.getAttribute('data-pcc-column-span')).toBe('5');
    expect(article?.getAttribute('data-pcc-span-source')).toBe('override');
    expect(article?.getAttribute('data-pcc-span-override-mode')).toBe('desktop');
  });

  it('renders the action slot inside the card article', () => {
    const { container } = renderCard(PCC_ANALYTICS_FIXTURE_READY, {
      action: <button data-test-marker="">Open</button>,
    });
    const button = container.querySelector('[data-test-marker]');
    expect(button).not.toBeNull();
    expect(button!.closest('[data-pcc-card]')).not.toBeNull();
  });
});

describe('PccAnalyticsCard — animation policy', () => {
  it('forceAnimationDisabled produces animation: false in the final ECharts option', () => {
    renderCard(PCC_ANALYTICS_FIXTURE_READY, { forceAnimationDisabled: true });
    expect(getLastSetOptionArg().animation).toBe(false);
  });

  it('reduced-motion matchMedia produces animation: false even when forceAnimationDisabled is false', () => {
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }));
    vi.stubGlobal('matchMedia', matchMedia);
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });

    renderCard(PCC_ANALYTICS_FIXTURE_READY, { forceAnimationDisabled: false });
    expect(getLastSetOptionArg().animation).toBe(false);
  });
});

describe('PccAnalyticsCard — robustness', () => {
  it('renders an unsupported chart kind via the safe fallback (no series, no throw)', () => {
    const matrixViewModel: PccAnalyticsViewModel = {
      ...PCC_ANALYTICS_FIXTURE_READY,
      id: 'pcc-analytics-matrix-fixture',
      chartKind: 'matrix',
      dataset: [{ row: 'A', col: 'B', value: 1 }],
    };
    expect(() => renderCard(matrixViewModel)).not.toThrow();
    const arg = getLastSetOptionArg();
    expect(arg.series).toBeUndefined();
    expect(arg.color).toBeDefined();
  });

  it('renders an empty dataset without throwing and still surfaces the summary list', () => {
    const emptyViewModel: PccAnalyticsViewModel = {
      ...PCC_ANALYTICS_FIXTURE_READY,
      id: 'pcc-analytics-empty-fixture',
      dataset: [],
    };
    const { container } = renderCard(emptyViewModel);
    const rows = container.querySelectorAll('[data-pcc-analytics-card-summary-row]');
    expect(rows).toHaveLength(emptyViewModel.summary.length);
    const arg = getLastSetOptionArg();
    expect(arg.series).toBeUndefined();
  });
});
