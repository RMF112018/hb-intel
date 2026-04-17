import React from 'react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import {
  resolveProjectSitesContainerState,
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
});
