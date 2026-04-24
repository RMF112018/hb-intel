/**
 * Write-side SharePoint service for HB_FoleonInteractionEvents.
 *
 * Writes interaction events directly to the list. When the Azure
 * Functions backend ships, this seam flips to `POST /api/foleon/events`
 * without consumer changes.
 */
import {
  fetchRequestDigest,
  type SharePointListDescriptor,
} from '@hbc/sharepoint-platform';
import type { FoleonInteractionEvent } from '../types/foleon-event.types.js';

export const FOLEON_EVENTS_TITLE = 'HB_FoleonInteractionEvents' as const;

export interface FoleonTelemetryParams {
  readonly siteUrl: string;
  readonly eventsListId: string;
}

export async function logFoleonEvent(
  params: FoleonTelemetryParams,
  event: FoleonInteractionEvent,
): Promise<void> {
  const descriptor: SharePointListDescriptor = {
    id: params.eventsListId,
    title: FOLEON_EVENTS_TITLE,
    urlSegment: FOLEON_EVENTS_TITLE,
  };
  const endpoint = `${params.siteUrl}/_api/web/lists(guid'${descriptor.id}')/items`;
  const digest = await fetchRequestDigest(params.siteUrl);
  const body = {
    Title: `${event.eventType} ${event.foleonDocId ?? ''}`.trim(),
    EventId: event.eventId,
    EventType: event.eventType,
    FoleonDocId: event.foleonDocId ?? null,
    ContentRegistryItemId: event.contentRegistryItemId ?? null,
    PageContext: event.pageContext ?? null,
    SearchQuery: event.searchQuery ?? null,
    EventTimestamp: event.eventTimestamp,
    SessionId: event.sessionId ?? null,
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `${FOLEON_EVENTS_TITLE} write failed: ${response.status} ${response.statusText}`,
    );
  }
}

export function createFoleonEventId(): string {
  const cryptoRef = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoRef?.randomUUID) return cryptoRef.randomUUID();
  return `fol-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(16)}`;
}
