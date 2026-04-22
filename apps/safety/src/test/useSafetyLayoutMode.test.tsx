/**
 * Phase-04 audit G-02 foundation — hook integration.
 *
 * Verifies useSafetyLayoutMode reacts to simulated ResizeObserver entries
 * at the documented thresholds. We stub ResizeObserver at the window level,
 * capture the callback the hook registers, and drive size changes through
 * it to assert the mode attribute update path end-to-end through React.
 */
import { useRef, type ReactNode } from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  SAFETY_LAYOUT_THRESHOLDS,
  useSafetyLayoutMode,
  type SafetyLayoutMode,
} from '../responsive/safetyBreakpoints.js';

interface FakeEntry {
  readonly contentRect: { readonly width: number };
  readonly target: Element;
}

type ObserverCallback = (entries: FakeEntry[], observer: unknown) => void;

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  readonly callback: ObserverCallback;
  target: Element | null = null;

  constructor(cb: ObserverCallback) {
    this.callback = cb;
    FakeResizeObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.target = el;
  }

  unobserve(): void {
    this.target = null;
  }

  disconnect(): void {
    this.target = null;
  }

  emit(width: number): void {
    if (!this.target) return;
    this.callback(
      [{ contentRect: { width }, target: this.target }],
      this,
    );
  }
}

function Harness({ onMode }: { onMode: (m: SafetyLayoutMode) => void }): ReactNode {
  const ref = useRef<HTMLDivElement | null>(null);
  const mode = useSafetyLayoutMode(ref);
  onMode(mode);
  return <div ref={ref} data-testid="content" data-safety-mode={mode} />;
}

describe('useSafetyLayoutMode — ResizeObserver-driven transitions', () => {
  let originalRO: typeof ResizeObserver | undefined;

  beforeEach(() => {
    originalRO = (globalThis as unknown as { ResizeObserver?: typeof ResizeObserver })
      .ResizeObserver;
    FakeResizeObserver.instances = [];
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
      FakeResizeObserver;
  });

  afterEach(() => {
    if (originalRO === undefined) {
      delete (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver;
    } else {
      (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = originalRO;
    }
  });

  it('registers a ResizeObserver against the passed ref and drives mode updates', () => {
    const seen: SafetyLayoutMode[] = [];
    const { getByTestId, rerender } = render(<Harness onMode={(m) => seen.push(m)} />);

    expect(FakeResizeObserver.instances).toHaveLength(1);
    const observer = FakeResizeObserver.instances[0]!;
    expect(observer.target).toBe(getByTestId('content'));

    // Drive each documented threshold and assert the rendered attribute
    // matches the resolved mode. We use act() so React commits the update.
    const cases: Array<[number, SafetyLayoutMode]> = [
      [SAFETY_LAYOUT_THRESHOLDS.compact - 1, 'minimal'],
      [SAFETY_LAYOUT_THRESHOLDS.compact, 'compact'],
      [SAFETY_LAYOUT_THRESHOLDS.medium, 'medium'],
      [SAFETY_LAYOUT_THRESHOLDS.wide, 'wide'],
    ];

    for (const [width, expected] of cases) {
      act(() => {
        observer.emit(width);
      });
      rerender(<Harness onMode={(m) => seen.push(m)} />);
      expect(getByTestId('content').getAttribute('data-safety-mode')).toBe(expected);
    }
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<Harness onMode={() => {}} />);
    expect(FakeResizeObserver.instances).toHaveLength(1);
    const observer = FakeResizeObserver.instances[0]!;
    const disconnectSpy = vi.spyOn(observer, 'disconnect');
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
