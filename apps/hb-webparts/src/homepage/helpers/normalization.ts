import type { HomepageCuratedListItem } from '../models/contentModels.js';

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
