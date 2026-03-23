/**
 * SF28-T03 — In-memory activity storage adapter for dev/test.
 *
 * Append-only in-memory store with query support.
 * Not for production — use SharePoint or Azure adapters.
 */

import type {
  IActivityEvent,
  IActivityStorageRecord,
  IActivityTimelineQuery,
  IActivityTimelinePage,
  IActivitySourceHealthState,
} from '../types/index.js';
import { ACTIVITY_TIMELINE_PAGE_SIZE_DEFAULT, ACTIVITY_TIMELINE_GROUPING_DEFAULT } from '../types/index.js';
import type { IActivityStorageAdapter } from './IActivityStorageAdapter.js';

export class InMemoryStorageAdapter implements IActivityStorageAdapter {
  readonly storageSystemId = 'in-memory';
  private records: IActivityStorageRecord[] = [];

  async append(event: IActivityEvent): Promise<IActivityStorageRecord> {
    const record: IActivityStorageRecord = {
      event,
      storedAt: new Date().toISOString(),
      storageSystem: this.storageSystemId,
      syncStateAtStorage: event.syncState,
    };
    this.records.push(record);
    return record;
  }

  async query(query: IActivityTimelineQuery): Promise<IActivityTimelinePage> {
    let events = this.records
      .map((r) => r.event)
      .filter((e) => e.primaryRef.projectId === query.projectId || query.mode === 'workspace');

    // Apply filters
    if (query.eventTypes && query.eventTypes.length > 0) {
      const typeSet = new Set(query.eventTypes);
      events = events.filter((e) => typeSet.has(e.type));
    }

    if (query.actorUpns && query.actorUpns.length > 0) {
      const upnSet = new Set(query.actorUpns);
      events = events.filter((e) => upnSet.has(e.actor.initiatedByUpn));
    }

    if (query.sourceModules && query.sourceModules.length > 0) {
      const moduleSet = new Set(query.sourceModules);
      events = events.filter((e) => moduleSet.has(e.context.sourceModuleKey));
    }

    if (query.since) {
      const sinceMs = new Date(query.since).getTime();
      events = events.filter((e) => new Date(e.timestampIso).getTime() >= sinceMs);
    }

    if (query.until) {
      const untilMs = new Date(query.until).getTime();
      events = events.filter((e) => new Date(e.timestampIso).getTime() <= untilMs);
    }

    if (query.excludeSystemEvents) {
      events = events.filter((e) => e.actor.type !== 'system');
    }

    // Sort by timestamp descending
    events.sort((a, b) =>
      new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime(),
    );

    const limit = query.limit ?? ACTIVITY_TIMELINE_PAGE_SIZE_DEFAULT;
    const hasMore = events.length > limit;
    const pageEvents = events.slice(0, limit);

    return {
      events: pageEvents,
      grouping: ACTIVITY_TIMELINE_GROUPING_DEFAULT,
      pageSize: limit,
      hasMore,
      cursor: hasMore ? pageEvents[pageEvents.length - 1]?.eventId ?? null : null,
    };
  }

  getHealth(): IActivitySourceHealthState {
    return {
      sourceIdentity: this.storageSystemId,
      lastSuccessfulLoad: new Date().toISOString(),
      consecutiveFailures: 0,
      degradationReason: null,
      confidence: 'trusted-authoritative',
    };
  }

  /** Clear all records (test utility) */
  clear(): void {
    this.records = [];
  }

  /** Get total record count (test utility) */
  size(): number {
    return this.records.length;
  }
}
