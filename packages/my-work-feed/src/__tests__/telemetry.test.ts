import { FeedTelemetry } from '../telemetry/feedTelemetry.js';
import type { MyWorkTelemetryEvent } from '../telemetry/feedTelemetry.js';

describe('FeedTelemetry', () => {
  afterEach(() => {
    FeedTelemetry._clearForTesting();
  });

  it('does not throw with default no-op sink', () => {
    expect(() => {
      FeedTelemetry.emit({
        type: 'aggregation-complete',
        payload: { totalItems: 10, durationMs: 100, degradedSourceCount: 0 },
      });
    }).not.toThrow();
  });

  it('routes events to custom sink', () => {
    const events: MyWorkTelemetryEvent[] = [];
    FeedTelemetry.setSink((e) => events.push(e));

    FeedTelemetry.emit({
      type: 'dedupe',
      payload: {
        survivorWorkItemId: 'w-1',
        mergedWorkItemId: 'w-2',
        dedupeKey: 'key-1',
        mergeReason: 'test',
      },
    });

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('dedupe');
  });

  it('routes multiple event types', () => {
    const events: MyWorkTelemetryEvent[] = [];
    FeedTelemetry.setSink((e) => events.push(e));

    FeedTelemetry.emit({
      type: 'source-error',
      payload: { source: 'bic-next-move', error: 'timeout' },
    });
    FeedTelemetry.emit({
      type: 'supersession',
      payload: {
        supersededWorkItemId: 'w-1',
        supersededByWorkItemId: 'w-2',
        reason: 'higher truth',
      },
    });

    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('source-error');
    expect(events[1].type).toBe('supersession');
  });

  it('swallows sink errors without throwing', () => {
    FeedTelemetry.setSink(() => {
      throw new Error('Sink exploded');
    });

    expect(() => {
      FeedTelemetry.emit({
        type: 'aggregation-complete',
        payload: { totalItems: 5, durationMs: 50, degradedSourceCount: 1 },
      });
    }).not.toThrow();
  });

  describe('event schema validation', () => {
    it('aggregation-complete payload has totalItems and degradedSourceCount', () => {
      const events: MyWorkTelemetryEvent[] = [];
      FeedTelemetry.setSink((e) => events.push(e));

      FeedTelemetry.emit({
        type: 'aggregation-complete',
        payload: { totalItems: 10, durationMs: 100, degradedSourceCount: 2 },
      });

      expect(events).toHaveLength(1);
      const payload = events[0].payload as { totalItems: number; degradedSourceCount: number };
      expect(typeof payload.totalItems).toBe('number');
      expect(typeof payload.degradedSourceCount).toBe('number');
    });

    it('dedupe event payload has survivorWorkItemId and mergedWorkItemId', () => {
      const events: MyWorkTelemetryEvent[] = [];
      FeedTelemetry.setSink((e) => events.push(e));

      FeedTelemetry.emit({
        type: 'dedupe',
        payload: { survivorWorkItemId: 'w-1', mergedWorkItemId: 'w-2', dedupeKey: 'key', mergeReason: 'dup' },
      });

      const payload = events[0].payload as { survivorWorkItemId: string; mergedWorkItemId: string };
      expect(typeof payload.survivorWorkItemId).toBe('string');
      expect(typeof payload.mergedWorkItemId).toBe('string');
    });

    it('supersession event has supersededWorkItemId and supersededByWorkItemId', () => {
      const events: MyWorkTelemetryEvent[] = [];
      FeedTelemetry.setSink((e) => events.push(e));

      FeedTelemetry.emit({
        type: 'supersession',
        payload: { supersededWorkItemId: 'w-old', supersededByWorkItemId: 'w-new', reason: 'higher truth' },
      });

      const payload = events[0].payload as { supersededWorkItemId: string; supersededByWorkItemId: string };
      expect(typeof payload.supersededWorkItemId).toBe('string');
      expect(typeof payload.supersededByWorkItemId).toBe('string');
    });

    it('source-error event has source and error fields', () => {
      const events: MyWorkTelemetryEvent[] = [];
      FeedTelemetry.setSink((e) => events.push(e));

      FeedTelemetry.emit({
        type: 'source-error',
        payload: { source: 'bic-next-move', error: 'timeout' },
      });

      const payload = events[0].payload as { source: string; error: string };
      expect(typeof payload.source).toBe('string');
      expect(typeof payload.error).toBe('string');
    });

    it('events arrive in emission order', () => {
      const events: MyWorkTelemetryEvent[] = [];
      FeedTelemetry.setSink((e) => events.push(e));

      FeedTelemetry.emit({ type: 'source-error', payload: { source: 'bic-next-move', error: 'err' } });
      FeedTelemetry.emit({ type: 'dedupe', payload: { survivorWorkItemId: 'w-1', mergedWorkItemId: 'w-2', dedupeKey: 'k', mergeReason: 'r' } });
      FeedTelemetry.emit({ type: 'aggregation-complete', payload: { totalItems: 5, durationMs: 50, degradedSourceCount: 0 } });

      expect(events.map((e) => e.type)).toEqual(['source-error', 'dedupe', 'aggregation-complete']);
    });
  });

  it('_clearForTesting resets to no-op sink', () => {
    const events: MyWorkTelemetryEvent[] = [];
    FeedTelemetry.setSink((e) => events.push(e));

    FeedTelemetry.emit({
      type: 'aggregation-complete',
      payload: { totalItems: 1, durationMs: 10, degradedSourceCount: 0 },
    });
    expect(events).toHaveLength(1);

    FeedTelemetry._clearForTesting();

    FeedTelemetry.emit({
      type: 'aggregation-complete',
      payload: { totalItems: 2, durationMs: 20, degradedSourceCount: 0 },
    });
    // Still 1 — no-op sink doesn't push
    expect(events).toHaveLength(1);
  });
});
