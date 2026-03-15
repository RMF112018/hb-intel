/**
 * FeedTelemetry — SF29-T03
 * Pluggable telemetry sink for aggregation pipeline events.
 * Default sink is no-op. Consumers wire a real sink at app startup.
 */

import type { MyWorkSource } from '../types/index.js';

export interface IDedupeEvent {
  survivorWorkItemId: string;
  mergedWorkItemId: string;
  dedupeKey: string;
  mergeReason: string;
}

export interface ISupersessionEvent {
  supersededWorkItemId: string;
  supersededByWorkItemId: string;
  reason: string;
}

export type MyWorkTelemetryEvent =
  | { type: 'dedupe'; payload: IDedupeEvent }
  | { type: 'supersession'; payload: ISupersessionEvent }
  | { type: 'source-error'; payload: { source: MyWorkSource; error: string } }
  | { type: 'aggregation-complete'; payload: { totalItems: number; durationMs: number; degradedSourceCount: number } };

export type MyWorkTelemetrySink = (event: MyWorkTelemetryEvent) => void;

const _noopSink: MyWorkTelemetrySink = () => {};
let _sink: MyWorkTelemetrySink = _noopSink;

function setSink(sink: MyWorkTelemetrySink): void {
  _sink = sink;
}

function emit(event: MyWorkTelemetryEvent): void {
  try {
    _sink(event);
  } catch {
    // Telemetry must never throw — swallow sink errors silently.
  }
}

function _clearForTesting(): void {
  _sink = _noopSink;
}

export const FeedTelemetry = {
  setSink,
  emit,
  _clearForTesting,
} as const;
