/**
 * RelatedItemsApi — D-SF14-T01, D-01
 *
 * Batched API surface for fetching related item summaries with BIC enrichment.
 * Routes through Azure Functions in SPFx mode.
 *
 * TODO: SF14-T03 — Implement batched /api/related-items/summaries endpoint.
 */
import type { IRelatedItem } from '../types/index.js';

export const RelatedItemsApi = {
  /**
   * Fetch related items for a given source record.
   * TODO: SF14-T03 — Implement batched fetch with BIC enrichment and hybrid routing.
   */
  async getRelatedItems(
    _sourceRecordType: string,
    _sourceRecordId: string,
  ): Promise<IRelatedItem[]> {
    return [];
  },
} as const;

export type IRelatedItemsApi = typeof RelatedItemsApi;
