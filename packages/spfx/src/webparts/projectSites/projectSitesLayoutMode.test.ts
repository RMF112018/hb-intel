import React from 'react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import {
  PROJECT_SITES_MODE_RESPONSIBILITIES,
  resolveProjectSitesContainerState,
  resolveProjectSitesDisplayClass,
  resolveProjectSitesHeightClass,
  resolveProjectSitesLayoutMode,
  useProjectSitesContainerState,
} from './projectSitesLayoutMode.js';

describe('projectSitesLayoutMode', () => {
  it('resolves wide mode at 1180+ width when height is not short', () => {
    expect(resolveProjectSitesLayoutMode({ width: 1180, height: 700 })).toBe('wide');
    expect(resolveProjectSitesLayoutMode({ width: 1600, height: 900 })).toBe('wide');
  });

  it('resolves medium mode between 820 and 1179 width when height is not short', () => {
    expect(resolveProjectSitesLayoutMode({ width: 820, height: 700 })).toBe('medium');
    expect(resolveProjectSitesLayoutMode({ width: 1000, height: 800 })).toBe('medium');
    expect(resolveProjectSitesLayoutMode({ width: 1179, height: 700 })).toBe('medium');
  });

  it('resolves compact mode below 820 width', () => {
    expect(resolveProjectSitesLayoutMode({ width: 819, height: 700 })).toBe('compact');
    expect(resolveProjectSitesLayoutMode({ width: 375, height: 760 })).toBe('compact');
  });

  it('forces compact mode for short-height states even when width is wide', () => {
    expect(resolveProjectSitesLayoutMode({ width: 1600, height: 559 })).toBe('compact');

    const state = resolveProjectSitesContainerState({ width: 1600, height: 559 });
    expect(state.mode).toBe('compact');
    expect(state.isShortHeight).toBe(true);
    expect(state.heightClass).toBe('short');
    // Short-height preserves the underlying display class so later
    // work can distinguish "compact-because-narrow" from
    // "compact-because-short".
    expect(state.displayClass).toBe('wide-desktop');
  });

  it('derives display classes from width thresholds', () => {
    expect(resolveProjectSitesDisplayClass(375)).toBe('phone');
    expect(resolveProjectSitesDisplayClass(819)).toBe('phone');
    expect(resolveProjectSitesDisplayClass(820)).toBe('tablet');
    expect(resolveProjectSitesDisplayClass(1179)).toBe('tablet');
    expect(resolveProjectSitesDisplayClass(1180)).toBe('desktop');
    expect(resolveProjectSitesDisplayClass(1599)).toBe('desktop');
    expect(resolveProjectSitesDisplayClass(1600)).toBe('wide-desktop');
    expect(resolveProjectSitesDisplayClass(2400)).toBe('wide-desktop');
  });

  it('derives height classes from the short-height threshold', () => {
    expect(resolveProjectSitesHeightClass(400)).toBe('short');
    expect(resolveProjectSitesHeightClass(559)).toBe('short');
    expect(resolveProjectSitesHeightClass(560)).toBe('standard');
    expect(resolveProjectSitesHeightClass(1080)).toBe('standard');
  });

  it('resolveProjectSitesContainerState exposes orthogonal display/height axes', () => {
    const state = resolveProjectSitesContainerState({ width: 1320, height: 900 });
    expect(state.mode).toBe('wide');
    expect(state.displayClass).toBe('desktop');
    expect(state.heightClass).toBe('standard');
    expect(state.isShortHeight).toBe(false);
  });
});

describe('PROJECT_SITES_MODE_RESPONSIBILITIES', () => {
  it('defines a responsibility entry for every public mode', () => {
    expect(Object.keys(PROJECT_SITES_MODE_RESPONSIBILITIES).sort()).toEqual([
      'compact',
      'medium',
      'wide',
    ]);
  });

  it('pins control-band, card-density, grid, and sparse strategies per mode', () => {
    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.wide.controlBand).toBe('inline-row');
    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.medium.controlBand).toBe('two-lane');
    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.compact.controlBand).toBe(
      'stacked-disclosure',
    );

    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.wide.cardDensity).toBe('comfortable');
    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.medium.cardDensity).toBe('regular');
    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.compact.cardDensity).toBe('condensed');

    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.wide.grid).toBe('multi-column-auto-fill');
    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.medium.grid).toBe('balanced-auto-fill');
    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.compact.grid).toBe('single-column');

    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.wide.sparse).toBe('bounded-card-width');
    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.medium.sparse).toBe('natural-flow');
    expect(PROJECT_SITES_MODE_RESPONSIBILITIES.compact.sparse).toBe('single-column');
  });
});

type ResizeObserverCallback = ConstructorParameters<typeof ResizeObserver>[0];

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverMock.instances.push(this);
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  emit(width: number, height: number): void {
    this.callback(
      [{ contentRect: { width, height } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
}

describe('useProjectSitesContainerState', () => {
  const originalResizeObserver = globalThis.ResizeObserver;
  const originalInnerHeight = window.innerHeight;
  const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
  let measuredWidth = 1320;
  let measuredHeight = 900;

  function Harness({ onRender }: { onRender: (mode: string) => void }) {
    const ref = React.useRef<HTMLElement | null>(null);
    const state = useProjectSitesContainerState(ref);
    React.useEffect(() => {
      onRender(state.mode);
    }, [onRender, state.mode]);
    return React.createElement('section', {
      ref,
      'data-testid': 'project-sites-root',
      'data-mode': state.mode,
    });
  }

  beforeEach(() => {
    measuredWidth = 1320;
    measuredHeight = 900;
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 900,
    });
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: measuredWidth,
      height: measuredHeight,
      top: 0,
      right: measuredWidth,
      bottom: measuredHeight,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })) as typeof HTMLElement.prototype.getBoundingClientRect;
    ResizeObserverMock.instances = [];
    globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('keeps wide mode on wide container even when observed content height shrinks', async () => {
    const onRender = vi.fn();
    const { getByTestId } = render(React.createElement(Harness, { onRender }));

    await waitFor(() => {
      expect(getByTestId('project-sites-root')).toHaveAttribute('data-mode', 'wide');
    });

    const observer = ResizeObserverMock.instances[0];
    expect(observer).toBeDefined();

    // Simulate content-height contraction caused by filtering down results.
    act(() => {
      observer.emit(1320, 180);
      observer.emit(1320, 120);
    });

    expect(getByTestId('project-sites-root')).toHaveAttribute('data-mode', 'wide');
  });

  it('suppresses rerenders for repeated ResizeObserver callbacks with no effective change', async () => {
    const onRender = vi.fn();
    render(React.createElement(Harness, { onRender }));

    await waitFor(() => {
      expect(onRender).toHaveBeenCalled();
    });

    const observer = ResizeObserverMock.instances[0];
    expect(observer).toBeDefined();

    const baselineRenderCount = onRender.mock.calls.length;
    act(() => {
      observer.emit(1320, 700);
      observer.emit(1320, 500);
      observer.emit(1320, 300);
    });

    expect(onRender.mock.calls.length).toBe(baselineRenderCount);
  });

  it('propagates viewport short-height to compact mode without a container-width tick', async () => {
    const onRender = vi.fn();
    const { getByTestId } = render(React.createElement(Harness, { onRender }));

    await waitFor(() => {
      expect(getByTestId('project-sites-root')).toHaveAttribute('data-mode', 'wide');
    });

    // Viewport becomes short (e.g. SharePoint host iframe shrinks or an
    // on-screen keyboard opens). No ResizeObserver tick is emitted — the
    // hook must still pick up the height change from a window resize
    // event using the measured container width.
    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 480,
      });
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(getByTestId('project-sites-root')).toHaveAttribute('data-mode', 'compact');
    });
  });

  it('suppresses rerenders when width and viewport height are unchanged', async () => {
    measuredWidth = 600;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 480 });

    const onRender = vi.fn();
    const { getByTestId } = render(React.createElement(Harness, { onRender }));

    await waitFor(() => {
      expect(getByTestId('project-sites-root')).toHaveAttribute('data-mode', 'compact');
    });

    const observer = ResizeObserverMock.instances[0];
    const baselineRenderCount = onRender.mock.calls.length;

    // Repeated narrow short-height observer ticks (feature prompts can
    // emit frequent content-height churn in this state) must not cause
    // additional rerenders.
    act(() => {
      observer.emit(600, 200);
      observer.emit(600, 180);
      observer.emit(600, 160);
    });

    expect(onRender.mock.calls.length).toBe(baselineRenderCount);
  });
});
