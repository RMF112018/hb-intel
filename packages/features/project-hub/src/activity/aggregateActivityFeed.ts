/**
 * Phase 3 Stage 3.2 — Activity feed aggregation.
 *
 * Loads events from all enabled adapters, merges, deduplicates,
 * sorts, filters, and computes counts.
 *
 * Governing: P3-D1 §5 (Query Contract)
 */

import type {
  IActivityQuery,
  IActivityRuntimeContext,
  IActivityFeedResult,
  IProjectActivityEvent,
} from '@hbc/models';
import { ProjectActivityRegistry } from './ProjectActivityRegistry.js';

/**
 * Aggregate activity events from all enabled source adapters.
 *
 * @param query - Activity query with projectId and optional filters
 * @param context - Runtime context (projectId, userUpn)
 * @returns Aggregated, sorted, deduplicated feed result
 */
export async function aggregateActivityFeed(
  query: IActivityQuery,
  context: IActivityRuntimeContext,
): Promise<IActivityFeedResult> {
  const enabledSources = ProjectActivityRegistry.getEnabledSources(context);

  // Load from all enabled adapters in parallel
  const results = await Promise.allSettled(
    enabledSources.map((source) => source.adapter.loadRecentActivity(query)),
  );

  // Merge all successful results
  const allEvents: IProjectActivityEvent[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allEvents.push(...result.value);
    }
  }

  // Deduplicate by eventId
  const seen = new Set<string>();
  const deduplicated = allEvents.filter((event) => {
    if (seen.has(event.eventId)) return false;
    seen.add(event.eventId);
    return true;
  });

  // Apply query filters
  let filtered = deduplicated;

  if (query.categories && query.categories.length > 0) {
    const categorySet = new Set(query.categories);
    filtered = filtered.filter((e) => categorySet.has(e.category));
  }

  if (query.sourceModules && query.sourceModules.length > 0) {
    const moduleSet = new Set(query.sourceModules);
    filtered = filtered.filter((e) => moduleSet.has(e.sourceModule));
  }

  if (query.significance && query.significance.length > 0) {
    const sigSet = new Set(query.significance);
    filtered = filtered.filter((e) => sigSet.has(e.significance));
  }

  if (query.since) {
    const sinceTime = new Date(query.since).getTime();
    filtered = filtered.filter((e) => new Date(e.occurredAt).getTime() >= sinceTime);
  }

  // Sort by occurredAt descending (most recent first)
  filtered.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  // Compute counts
  const totalCount = filtered.length;
  const criticalCount = filtered.filter((e) => e.significance === 'critical').length;
  const notableCount = filtered.filter((e) => e.significance === 'notable').length;

  // Apply limit
  const limit = query.limit ?? 25;
  const hasMore = filtered.length > limit;
  const events = filtered.slice(0, limit);

  return {
    events,
    totalCount,
    criticalCount,
    notableCount,
    hasMore,
    lastRefreshedIso: new Date().toISOString(),
  };
}
