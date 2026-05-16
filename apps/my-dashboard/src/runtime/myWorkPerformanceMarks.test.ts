import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MY_WORK_MARK, markMyWork, measureMyWork } from './myWorkPerformanceMarks.js';

describe('myWorkPerformanceMarks — helper contract', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('markMyWork', () => {
    it('invokes performance.mark with the supplied name when the API is available', () => {
      const markSpy = vi
        .spyOn(performance, 'mark')
        .mockImplementation(() => ({}) as PerformanceMark);
      markMyWork('my-dashboard:test:mark');
      expect(markSpy).toHaveBeenCalledTimes(1);
      expect(markSpy.mock.calls[0]?.[0]).toBe('my-dashboard:test:mark');
    });

    it('forwards a safe detail payload via the mark init dict', () => {
      const markSpy = vi
        .spyOn(performance, 'mark')
        .mockImplementation(() => ({}) as PerformanceMark);
      markMyWork('my-dashboard:test:mark-with-detail', { routeId: 'home', durationMs: 42 });
      expect(markSpy).toHaveBeenCalledWith('my-dashboard:test:mark-with-detail', {
        detail: { routeId: 'home', durationMs: 42 },
      });
    });

    it('is a silent no-op when globalThis.performance is absent', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'performance');
      try {
        Object.defineProperty(globalThis, 'performance', {
          value: undefined,
          configurable: true,
          writable: true,
        });
        expect(() => markMyWork('my-dashboard:test:no-perf')).not.toThrow();
      } finally {
        if (originalDescriptor) {
          Object.defineProperty(globalThis, 'performance', originalDescriptor);
        }
      }
    });

    it('swallows a throw from performance.mark', () => {
      vi.spyOn(performance, 'mark').mockImplementation(() => {
        throw new Error('boom');
      });
      expect(() => markMyWork('my-dashboard:test:throws')).not.toThrow();
    });
  });

  describe('measureMyWork', () => {
    it('invokes performance.measure with start/end marks when both APIs are available', () => {
      const measureSpy = vi
        .spyOn(performance, 'measure')
        .mockImplementation(() => ({}) as PerformanceMeasure);
      measureMyWork(
        'my-dashboard:test:duration',
        'my-dashboard:test:start',
        'my-dashboard:test:end',
      );
      expect(measureSpy).toHaveBeenCalledTimes(1);
      expect(measureSpy.mock.calls[0]?.[0]).toBe('my-dashboard:test:duration');
      expect(measureSpy.mock.calls[0]?.[1]).toEqual({
        start: 'my-dashboard:test:start',
        end: 'my-dashboard:test:end',
      });
    });

    it('forwards detail alongside start/end when provided', () => {
      const measureSpy = vi
        .spyOn(performance, 'measure')
        .mockImplementation(() => ({}) as PerformanceMeasure);
      measureMyWork('m', 's', 'e', { routeId: 'project-links' });
      expect(measureSpy.mock.calls[0]?.[1]).toEqual({
        start: 's',
        end: 'e',
        detail: { routeId: 'project-links' },
      });
    });

    it('is a silent no-op when performance.measure is missing', () => {
      const original = performance.measure;
      try {
        // Strip the measure API while leaving mark in place.
        (performance as unknown as { measure?: unknown }).measure = undefined;
        expect(() => measureMyWork('m', 's', 'e')).not.toThrow();
      } finally {
        (performance as unknown as { measure: typeof original }).measure = original;
      }
    });

    it('swallows a throw from performance.measure', () => {
      vi.spyOn(performance, 'measure').mockImplementation(() => {
        throw new Error('boom');
      });
      expect(() => measureMyWork('m', 's', 'e')).not.toThrow();
    });
  });

  describe('MY_WORK_MARK', () => {
    it('exposes the exact spec-stable mark names', () => {
      expect(MY_WORK_MARK.shellMounted).toBe('my-dashboard:shell:mounted');
      expect(MY_WORK_MARK.requestStart('home')).toBe('my-dashboard:request:home:start');
      expect(MY_WORK_MARK.requestEnd('home')).toBe('my-dashboard:request:home:end');
      expect(MY_WORK_MARK.requestDuration('home')).toBe('my-dashboard:request:home:duration');
      expect(MY_WORK_MARK.requestStart('project-links')).toBe(
        'my-dashboard:request:project-links:start',
      );
      expect(MY_WORK_MARK.requestStart('adobe-sign-recent-completions')).toBe(
        'my-dashboard:request:adobe-sign-recent-completions:start',
      );
      expect(MY_WORK_MARK.moduleUseful('my-projects')).toBe(
        'my-dashboard:module:my-projects:useful',
      );
      expect(MY_WORK_MARK.moduleUseful('adobe-sign-action-queue')).toBe(
        'my-dashboard:module:adobe-sign-action-queue:useful',
      );
    });
  });

  describe('integration — wraps performance behavior consistently', () => {
    beforeEach(() => {
      performance.clearMarks?.();
      performance.clearMeasures?.();
    });

    it('end-to-end: mark start, mark end, measure resolves a real entry on the timeline', () => {
      markMyWork('my-dashboard:test:e2e:start');
      markMyWork('my-dashboard:test:e2e:end');
      measureMyWork(
        'my-dashboard:test:e2e:duration',
        'my-dashboard:test:e2e:start',
        'my-dashboard:test:e2e:end',
      );
      const entries = performance.getEntriesByName('my-dashboard:test:e2e:duration', 'measure');
      expect(entries.length).toBe(1);
    });
  });
});
