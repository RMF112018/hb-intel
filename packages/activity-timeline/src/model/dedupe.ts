/**
 * SF28-T03 — Projection-only deduplication.
 *
 * Marks duplicate events in the timeline projection without discarding
 * raw evidence. Per L-07: dedupe and correlation are permitted only as
 * read-model hygiene; raw event evidence is never silently discarded.
 *
 * Governing: SF28-T03, L-07 (dedup boundary)
 */

import type { IActivityEvent, IActivityDedupeState, ActivityDedupeReason } from '../types/index.js';

/** Default dedup time window in milliseconds (5 minutes). */
const DEFAULT_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Build a dedup key from event attributes for grouping.
 */
function buildDedupeKey(event: IActivityEvent): string {
  return `${event.primaryRef.recordId}::${event.actor.initiatedByUpn}::${event.type}`;
}

/**
 * Apply projection-only deduplication to a list of events.
 *
 * Events within the time threshold sharing the same record+actor+type
 * are marked with a `dedupe` state. The first (earliest) event in each
 * group is the survivor; later duplicates get `projectionAction: 'suppressed'`.
 *
 * Raw evidence is always retained (`rawEvidenceRetained: true`).
 *
 * @param events - Events sorted by timestampIso descending (newest first)
 * @param thresholdMs - Time window for dedup grouping (default 5 min)
 * @returns Events with dedupe state populated where applicable
 */
export function applyDeduplication(
  events: IActivityEvent[],
  thresholdMs: number = DEFAULT_THRESHOLD_MS,
): IActivityEvent[] {
  if (events.length <= 1) return events;

  // Track the earliest timestamp per dedup key
  const earliestByKey = new Map<string, number>();

  // First pass: find the earliest timestamp for each key
  for (const event of events) {
    if (event.dedupe) continue; // Already deduplicated
    const key = buildDedupeKey(event);
    const ts = new Date(event.timestampIso).getTime();
    const existing = earliestByKey.get(key);
    if (existing === undefined || ts < existing) {
      earliestByKey.set(key, ts);
    }
  }

  // Second pass: mark duplicates
  return events.map((event) => {
    if (event.dedupe) return event; // Already has dedupe state

    const key = buildDedupeKey(event);
    const ts = new Date(event.timestampIso).getTime();
    const earliest = earliestByKey.get(key);

    if (earliest === undefined || ts === earliest) {
      return event; // This is the survivor
    }

    // Check if within threshold of earliest
    if (ts - earliest <= thresholdMs) {
      const dedupeState: IActivityDedupeState = {
        rawEvidenceRetained: true,
        projectionAction: 'suppressed',
        reason: 'duplicate-within-threshold',
      };
      return { ...event, dedupe: dedupeState };
    }

    return event;
  });
}

/**
 * Mark a single event as deduplicated with a specific reason.
 *
 * Utility for manual dedup marking (e.g., merge-parent-child).
 */
export function markDeduped(
  event: IActivityEvent,
  reason: ActivityDedupeReason,
  action: 'suppressed' | 'merged' = 'suppressed',
): IActivityEvent {
  return {
    ...event,
    dedupe: {
      rawEvidenceRetained: true,
      projectionAction: action,
      reason,
    },
  };
}
