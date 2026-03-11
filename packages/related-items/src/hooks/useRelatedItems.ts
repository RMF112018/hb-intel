/**
 * useRelatedItems — D-SF14-T01, D-01
 *
 * Hook for loading, enriching, and caching related items for a source record.
 *
 * TODO: SF14-T04 — Implement data fetching, offline caching via @hbc/session-state,
 * and role-aware filtering.
 */
import type { IRelatedItem } from '../types/index.js';

export interface UseRelatedItemsResult {
  items: IRelatedItem[];
  loading: boolean;
  error: Error | null;
}

export function useRelatedItems(
  _sourceRecordType: string,
  _sourceRecordId: string,
): UseRelatedItemsResult {
  // TODO: SF14-T04
  return { items: [], loading: false, error: null };
}
