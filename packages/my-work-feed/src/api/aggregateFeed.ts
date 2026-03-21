/**
 * Aggregation Pipeline — SF29-T03
 * Async orchestration composing registry, normalization, and telemetry modules.
 */

import type {
  IMyWorkItem,
  IMyWorkQuery,
  IMyWorkRuntimeContext,
  IMyWorkRegistryEntry,
  IMyWorkFeedResult,
  IMyWorkQueueHealth,
  MyWorkSource,
  MyWorkSyncStatus,
} from '../types/index.js';
import { MyWorkRegistry } from '../registry/MyWorkRegistry.js';
import { assignLane } from '../normalization/projectFeed.js';
import { dedupeItems } from '../normalization/dedupeItems.js';
import { applySupersession } from '../normalization/supersession.js';
import { rankItems } from '../normalization/rankItems.js';
import { projectFeedResult } from '../normalization/projectFeed.js';
import { FeedTelemetry } from '../telemetry/feedTelemetry.js';

export interface IAggregateOptions {
  query: IMyWorkQuery;
  context: IMyWorkRuntimeContext;
  nowIso?: string;
}

export interface ISourceLoadOutcome {
  source: MyWorkSource;
  items: IMyWorkItem[];
  freshness: MyWorkSyncStatus;
  error?: string;
}

export async function loadSources(
  entries: IMyWorkRegistryEntry[],
  query: IMyWorkQuery,
  context: IMyWorkRuntimeContext,
): Promise<ISourceLoadOutcome[]> {
  const results = await Promise.allSettled(
    entries.map(async (entry): Promise<ISourceLoadOutcome> => {
      const items = await entry.adapter.load(query, context);
      return { source: entry.source, items, freshness: 'live' };
    }),
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    const source = entries[i].source;
    const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
    FeedTelemetry.emit({ type: 'source-error', payload: { source, error: errorMsg } });
    return { source, items: [], freshness: 'partial' as const, error: errorMsg };
  });
}

export function buildQueueHealth(
  outcomes: ISourceLoadOutcome[],
  supersededCount: number,
): IMyWorkQueueHealth {
  const failedOutcomes = outcomes.filter((o) => o.error);
  const degradedSourceCount = failedOutcomes.length;
  // UIF-011: Collect the specific source keys that failed so callers can render named detail.
  const degradedSources = failedOutcomes.map((o) => o.source);
  const allFailed = outcomes.length > 0 && degradedSourceCount === outcomes.length;
  const anyFailed = degradedSourceCount > 0;

  let freshness: MyWorkSyncStatus;
  if (allFailed) {
    freshness = 'cached';
  } else if (anyFailed) {
    freshness = 'partial';
  } else {
    freshness = 'live';
  }

  return {
    freshness,
    lastSyncAtIso: new Date().toISOString(),
    hiddenSupersededCount: supersededCount,
    degradedSourceCount,
    ...(anyFailed ? { degradedSources, warningMessage: `${degradedSourceCount} source(s) failed to load` } : {}),
  };
}

export async function aggregateFeed(options: IAggregateOptions): Promise<IMyWorkFeedResult> {
  const { query, context, nowIso = new Date().toISOString() } = options;
  const startTime = Date.now();

  // 1. Source eligibility
  const enabledEntries = MyWorkRegistry.getEnabledSources(context);

  // 2. Source load
  const outcomes = await loadSources(enabledEntries, query, context);

  // 3. Normalization — flat-map items, assign lane
  const allItems: IMyWorkItem[] = outcomes.flatMap((o) =>
    o.items.map((item) => ({ ...item, lane: assignLane(item) })),
  );

  // 4. Dedupe
  const dedupeResult = dedupeItems(allItems);
  for (const event of dedupeResult.mergeEvents) {
    FeedTelemetry.emit({ type: 'dedupe', payload: event });
  }

  // 5. Supersession
  const supersessionResult = applySupersession(dedupeResult.canonical);
  for (const event of supersessionResult.supersessionEvents) {
    FeedTelemetry.emit({ type: 'supersession', payload: event });
  }

  // 6. Ranking — build source weights from registry
  const sourceWeights = new Map<MyWorkSource, number>();
  for (const entry of enabledEntries) {
    sourceWeights.set(entry.source, entry.rankingWeight ?? 0.5);
  }
  const ranked = rankItems(supersessionResult.active, { nowIso, sourceWeights });

  // 7. Projection — query filters and counts
  const queueHealth = buildQueueHealth(outcomes, supersessionResult.superseded.length);
  const healthState = {
    freshness: queueHealth.freshness,
    hiddenSupersededCount: queueHealth.hiddenSupersededCount,
    degradedSourceCount: queueHealth.degradedSourceCount,
    // UIF-011: Surface degraded source keys for expandable indicator rendering.
    ...(queueHealth.degradedSources ? { degradedSources: queueHealth.degradedSources } : {}),
    warningMessage: queueHealth.warningMessage,
  };
  const result = projectFeedResult(ranked, query, healthState, nowIso);

  // 8. Telemetry
  FeedTelemetry.emit({
    type: 'aggregation-complete',
    payload: {
      totalItems: result.items.length,
      durationMs: Date.now() - startTime,
      degradedSourceCount: queueHealth.degradedSourceCount,
    },
  });

  return result;
}
