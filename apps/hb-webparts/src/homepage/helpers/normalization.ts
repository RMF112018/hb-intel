import type { HomepageCuratedListItem } from '../models/contentModels.js';

/**
 * @deprecated Scaffold-era generic normalizer. Zero imports in the codebase.
 * Zone-specific normalizers in topBandConfig, utilityConfig, communicationsConfig,
 * operationalAwarenessConfig, and discoveryConfig handle their own deduplication
 * and trimming. Retained for historical reference only.
 */
export function normalizeCuratedListItems(rawItems: HomepageCuratedListItem[], maxItems: number): HomepageCuratedListItem[] {
  const seen = new Set<string>();
  const normalized: HomepageCuratedListItem[] = [];

  for (const item of rawItems) {
    const title = item.title.trim();
    if (!title || seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    normalized.push({
      ...item,
      title,
      summary: item.summary?.trim() || undefined,
    });

    if (normalized.length >= maxItems) {
      break;
    }
  }

  return normalized;
}
