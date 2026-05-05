import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { useBentoRowSpan } from './useBentoRowSpan';
import { PCC_BENTO_GRID_GAP_PX, PCC_BENTO_GRID_ROW_UNIT_PX } from './footprints';

/**
 * Captured state for the latest mocked `ResizeObserver`. Tests fire the
 * callback manually so React state updates land synchronously inside
 * `act()`. Uses a small harness component (per
 * `feedback_hook_ref_test_via_harness_component.md`) so the hook's ref
 * attaches to a real DOM element via the normal React commit flow,
 * rather than mutating `result.current.ref.current` from `renderHook`.
 */
type CapturedObserver = {
  callback: ResizeObserverCallback;
  target: Element | null;
};

let observers: CapturedObserver[] = [];

beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    'ResizeObserver',
    class MockResizeObserver {
      private readonly cb: ResizeObserverCallback;
      constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
        observers.push({ callback: cb, target: null });
      }
      observe(target: Element): void {
        const captured = observers[observers.length - 1];
        if (captured) {
          captured.target = target;
        }
      }
      unobserve(): void {}
      disconnect(): void {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

interface ITestHarnessProps {
  initialMinRows?: number;
}

function TestHarness({ initialMinRows }: ITestHarnessProps) {
  const { ref, rowSpan, measuredHeight } = useBentoRowSpan(initialMinRows);
  return <div ref={ref} data-test-row-span={rowSpan} data-test-measured-height={measuredHeight} />;
}

function fireObservation(opts: { observedHeight: number; intrinsicHeight?: number }): void {
  const captured = observers[observers.length - 1];
  if (!captured?.target) {
    throw new Error('ResizeObserver mock was never observe()d on a target');
  }
  if (typeof opts.intrinsicHeight === 'number') {
    Object.defineProperty(captured.target, 'scrollHeight', {
      configurable: true,
      value: opts.intrinsicHeight,
    });
  }
  const entry = {
    target: captured.target,
    contentRect: { height: opts.observedHeight } as DOMRectReadOnly,
    contentBoxSize: [{ blockSize: opts.observedHeight, inlineSize: 0 }],
    borderBoxSize: [{ blockSize: opts.observedHeight, inlineSize: 0 }],
    devicePixelContentBoxSize: [{ blockSize: opts.observedHeight, inlineSize: 0 }],
  } as unknown as ResizeObserverEntry;
  act(() => {
    captured.callback([entry], {} as ResizeObserver);
  });
}

describe('useBentoRowSpan collapse resistance', () => {
  it('initial rowSpan equals initialMinRows (default 4)', () => {
    const { container } = render(<TestHarness />);
    const node = container.querySelector('[data-test-row-span]');
    expect(node).not.toBeNull();
    // The default `initialMinRows` is the hook's documented contract.
    expect(node?.getAttribute('data-test-row-span')).toBe('4');
  });

  it('does not collapse below initialMinRows when ResizeObserver reports a constrained 8px height', () => {
    // Reproduces the production failure: parent grid cell is 8px,
    // ResizeObserver reports the clipped body height. With the prior
    // `Math.max(1, ...)` guard this drove rowSpan to 1 and stuck the
    // card at 8px tall. The floor must hold at `initialMinRows` so the
    // cell never collapses.
    const { container } = render(<TestHarness />);
    fireObservation({ observedHeight: 8, intrinsicHeight: 0 });
    const node = container.querySelector('[data-test-row-span]');
    expect(Number(node?.getAttribute('data-test-row-span'))).toBeGreaterThanOrEqual(4);
  });

  it('grows rowSpan to match intrinsic scrollHeight even when ResizeObserver reports a constrained 8px box', () => {
    // Even when ResizeObserver reports a constrained 8px box, if the
    // node's `scrollHeight` is 240px (intrinsic content extent), the
    // span should recover and grow accordingly. This is the loop-break
    // mechanism: `scrollHeight` ignores the parent's `overflow: hidden`
    // clip and lets the hook see the real content size.
    const { container } = render(<TestHarness />);
    fireObservation({ observedHeight: 8, intrinsicHeight: 240 });
    const node = container.querySelector('[data-test-row-span]');
    // Expected lower bound is computed from the public constants —
    // never a hardcoded magic number (per
    // feedback_test_magic_number_canonical_anchor.md). With 240px
    // intrinsic + 16px gap divided by (8px row + 16px gap) the ceiling
    // is 11.
    const expectedSpan = Math.ceil(
      (240 + PCC_BENTO_GRID_GAP_PX) / (PCC_BENTO_GRID_ROW_UNIT_PX + PCC_BENTO_GRID_GAP_PX),
    );
    expect(Number(node?.getAttribute('data-test-row-span'))).toBe(expectedSpan);
    expect(Number(node?.getAttribute('data-test-measured-height'))).toBe(240);
  });

  it('honors a non-default initialMinRows as the floor', () => {
    // Custom minimum: with `initialMinRows = 6`, even a constrained
    // observation cannot drop rowSpan below 6.
    const { container } = render(<TestHarness initialMinRows={6} />);
    fireObservation({ observedHeight: 8, intrinsicHeight: 0 });
    const node = container.querySelector('[data-test-row-span]');
    expect(Number(node?.getAttribute('data-test-row-span'))).toBeGreaterThanOrEqual(6);
  });

  it('keeps the floor when both observed and intrinsic heights are zero', () => {
    const { container } = render(<TestHarness initialMinRows={5} />);
    fireObservation({ observedHeight: 0, intrinsicHeight: 0 });
    const node = container.querySelector('[data-test-row-span]');
    expect(Number(node?.getAttribute('data-test-row-span'))).toBeGreaterThanOrEqual(5);
    expect(Number(node?.getAttribute('data-test-measured-height'))).toBe(0);
  });
});
