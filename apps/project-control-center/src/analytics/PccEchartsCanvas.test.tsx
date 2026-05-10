import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const { setOptionMock, resizeMock, disposeMock, initMock, useMock, registerThemeMock } = vi.hoisted(
  () => {
    const setOptionMock = vi.fn();
    const resizeMock = vi.fn();
    const disposeMock = vi.fn();
    const initMock = vi.fn(() => ({
      setOption: setOptionMock,
      resize: resizeMock,
      dispose: disposeMock,
    }));
    const useMock = vi.fn();
    const registerThemeMock = vi.fn();
    return { setOptionMock, resizeMock, disposeMock, initMock, useMock, registerThemeMock };
  },
);

vi.mock('echarts/core', () => ({
  use: useMock,
  registerTheme: registerThemeMock,
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

// Imported after mocks so the component sees the mocked echarts surface.
import { PccEchartsCanvas } from './PccEchartsCanvas';
import type { EChartsOption } from './pccAnalyticsEcharts';

afterEach(() => {
  // Clean up React tree first so unmount-driven `dispose` calls land
  // before mock counters are cleared. clearAllMocks last so the next
  // test starts with all mock call counts at 0.
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const baseOption: EChartsOption = { animation: true, series: [] };

const baseProps = {
  chartId: 'pcc-analytics-test-chart',
  state: 'ready' as const,
  sampleData: false,
  option: baseOption,
  accessibilitySummary: 'Test chart accessibility summary.',
};

function findContainer(node: Element): HTMLElement {
  const el = node.querySelector('[data-pcc-analytics-chart]');
  if (!(el instanceof HTMLElement)) throw new Error('Expected analytics chart container');
  return el;
}

function getLastSetOptionArg(): Record<string, unknown> {
  const calls = setOptionMock.mock.calls as unknown as readonly (readonly unknown[])[];
  if (calls.length === 0) throw new Error('setOption was not called');
  return calls[calls.length - 1]![0] as Record<string, unknown>;
}

describe('PccEchartsCanvas — markers and accessibility', () => {
  it('emits the expected data attributes plus role="img" + aria-label', () => {
    const { container } = render(
      <PccEchartsCanvas
        {...baseProps}
        state="preview"
        sampleData
        accessibilitySummary="Sample chart summary"
      />,
    );
    const el = findContainer(container);
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Sample chart summary');
    expect(el.getAttribute('data-pcc-analytics-chart')).toBe('pcc-analytics-test-chart');
    expect(el.getAttribute('data-pcc-analytics-state')).toBe('preview');
    expect(el.getAttribute('data-pcc-analytics-sample-data')).toBe('true');
    expect(el.getAttribute('data-pcc-analytics-animation')).toBe('enabled');
  });
});

describe('PccEchartsCanvas — initialization', () => {
  it('initializes ECharts once with SVG renderer + pcc-analytics theme', () => {
    render(<PccEchartsCanvas {...baseProps} />);
    expect(initMock).toHaveBeenCalledTimes(1);
    const initArgs = initMock.mock.calls[0] as unknown as readonly unknown[];
    expect(initArgs[1]).toBe('pcc-analytics');
    expect(initArgs[2]).toEqual({ renderer: 'svg' });
  });

  it('calls setOption with the provided option (preserving animation)', () => {
    render(<PccEchartsCanvas {...baseProps} option={{ animation: true, series: [] }} />);
    const arg = getLastSetOptionArg();
    expect(arg.animation).toBe(true);
  });
});

describe('PccEchartsCanvas — animation overlay (one-way off)', () => {
  it('forceAnimationDisabled forces animation false even when option.animation is unset', () => {
    render(<PccEchartsCanvas {...baseProps} option={{ series: [] }} forceAnimationDisabled />);
    const arg = getLastSetOptionArg();
    expect(arg.animation).toBe(false);
    const el = findContainer(document.body);
    expect(el.getAttribute('data-pcc-analytics-animation')).toBe('disabled');
  });

  it('forceAnimationDisabled forces animation false when option.animation is true', () => {
    render(
      <PccEchartsCanvas
        {...baseProps}
        option={{ animation: true, series: [] }}
        forceAnimationDisabled
      />,
    );
    const arg = getLastSetOptionArg();
    expect(arg.animation).toBe(false);
  });

  it('preserves option.animation === false when forceAnimationDisabled is unset (no flip back to true)', () => {
    render(<PccEchartsCanvas {...baseProps} option={{ animation: false, series: [] }} />);
    const arg = getLastSetOptionArg();
    expect(arg.animation).toBe(false);
    const el = findContainer(document.body);
    expect(el.getAttribute('data-pcc-analytics-animation')).toBe('disabled');
  });

  it('keeps option.animation === true when neither override is active', () => {
    render(<PccEchartsCanvas {...baseProps} option={{ animation: true, series: [] }} />);
    const arg = getLastSetOptionArg();
    expect(arg.animation).toBe(true);
  });
});

describe('PccEchartsCanvas — resize behavior', () => {
  let observed: Element | null = null;
  let resizeCallback: ResizeObserverCallback | null = null;

  beforeEach(() => {
    observed = null;
    resizeCallback = null;
  });

  it('uses ResizeObserver when available and triggers resize on observation', () => {
    class FakeResizeObserver implements ResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        resizeCallback = cb;
      }
      observe(target: Element): void {
        observed = target;
      }
      unobserve(): void {}
      disconnect(): void {}
    }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);

    render(<PccEchartsCanvas {...baseProps} />);
    expect(observed).not.toBeNull();
    expect(resizeMock).not.toHaveBeenCalled();
    // Trigger the observer callback.
    resizeCallback!([], {} as ResizeObserver);
    expect(resizeMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to window resize when ResizeObserver is unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    render(<PccEchartsCanvas {...baseProps} />);
    expect(resizeMock).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('resize'));
    expect(resizeMock).toHaveBeenCalledTimes(1);
  });
});

describe('PccEchartsCanvas — disposal', () => {
  it('disposes the ECharts instance on unmount', () => {
    const { unmount } = render(<PccEchartsCanvas {...baseProps} />);
    expect(disposeMock).not.toHaveBeenCalled();
    unmount();
    expect(disposeMock).toHaveBeenCalledTimes(1);
  });
});

describe('PccAnalytics source — does not import echarts-for-react', () => {
  it('no PCC analytics source file (excluding tests) imports the echarts-for-react module', () => {
    const analyticsDir = join(import.meta.dirname, '.');
    const failures: string[] = [];
    // Match real import / require / dynamic-import statements only —
    // legitimate prose mentions in TODO comments must not trip the
    // guard (per stored convention to strip comments before scanning).
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

    walk(analyticsDir);
    expect(
      failures,
      `expected zero echarts-for-react imports under analytics/, got ${failures.join(', ')}`,
    ).toHaveLength(0);
  });
});
