/**
 * Activity timeline governance event adapter — D-SF14-T07, D-09
 *
 * Typed no-op adapter ready for @hbc/activity-timeline when it ships.
 * In DEV mode, events are logged to console.info for observability.
 */

/** Shape of a governance event for the activity timeline. */
export interface IGovernanceTimelineEvent {
  readonly eventType: 'relationship-created' | 'relationship-removed' | 'relationship-updated' | 'ai-suggestion-accepted' | 'ai-suggestion-dismissed';
  readonly sourceRecordType: string;
  readonly targetRecordType: string;
  readonly changedBy: string;
  readonly timestamp: string;
  readonly details?: Record<string, unknown>;
}

/**
 * Emit a governance event to the activity timeline.
 *
 * Currently a no-op in production. In DEV mode, logs the event
 * to console.info for integration testing and observability.
 *
 * Ready to wire to `@hbc/activity-timeline` when available.
 */
export function emitGovernanceEvent(event: IGovernanceTimelineEvent): void {
  if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'development') {
    // eslint-disable-next-line no-console
    console.info('[related-items] governance event:', event);
  }
}
