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
