/**
 * SF28-T03 — Activity storage adapter interface.
 *
 * Append-only contract for persisting normalized activity events.
 * Same interface for SharePoint MVP and future Azure event store
 * — consumers depend on the interface, not the concrete storage.
 *
 * Governing: SF28-T03, L-02 (append-only), L-04 (storage strategy)
 */

import type {
  IActivityEvent,
  IActivityStorageRecord,
  IActivityTimelineQuery,
  IActivityTimelinePage,
  IActivitySourceHealthState,
} from '../types/index.js';

/**
 * Append-only storage adapter for activity events.
 *
 * Implementations: InMemoryStorageAdapter (dev/test),
 * SharePointStorageAdapter (MVP), AzureEventStoreAdapter (future).
 */
export interface IActivityStorageAdapter {
  /** Storage system identifier (e.g., 'in-memory', 'sharepoint-list', 'azure-event-store') */
  readonly storageSystemId: string;

  /** Append an immutable normalized event. Returns the storage record with metadata. */
  append(event: IActivityEvent): Promise<IActivityStorageRecord>;

  /** Query events matching criteria. Returns paginated results. */
  query(query: IActivityTimelineQuery): Promise<IActivityTimelinePage>;

  /** Health/availability status of the storage system. */
  getHealth(): IActivitySourceHealthState;
}
