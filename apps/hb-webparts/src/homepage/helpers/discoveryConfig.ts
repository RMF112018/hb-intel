import { isVisibleForAudience } from './visibility.js';
import {
  DEFAULT_SMART_SEARCH_WAYFINDING_CONFIG,
  type DiscoveryCategory,
  type DiscoveryQuickPath,
  type DiscoveryResourceItem,
  type SmartSearchWayfindingConfig,
} from '../webparts/discoveryContracts.js';

export interface NormalizedDiscoveryResource extends DiscoveryResourceItem {
  categoryId: string;
  searchableText: string;
}

export interface NormalizedDiscoveryCategoryGroup {
  id: string;
  title: string;
  description?: string;
  resources: NormalizedDiscoveryResource[];
}

export interface NormalizedSmartSearchWayfinding {
  heading: string;
  searchPlaceholder: string;
  quickPaths: DiscoveryQuickPath[];
  promotedResources: NormalizedDiscoveryResource[];
  categoryGroups: NormalizedDiscoveryCategoryGroup[];
  hasResources: boolean;
  strategyLabel: string;
}

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

function byOrderThenTitle(a: { order?: number; title: string }, b: { order?: number; title: string }): number {
  const aOrder = Number.isFinite(a.order) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
  const bOrder = Number.isFinite(b.order) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }
  return a.title.localeCompare(b.title);
}

function normalizeQuickPaths(
  quickPaths: DiscoveryQuickPath[] | undefined,
  activeAudience: string | undefined,
): DiscoveryQuickPath[] {
  const seen = new Set<string>();

  return (quickPaths ?? [])
    .filter((path) => hasText(path.id) && hasText(path.title) && hasText(path.href))
    .filter((path) => isVisibleForAudience(path.audiences, activeAudience))
    .map((path) => ({
      ...path,
      id: path.id.trim(),
      title: path.title.trim(),
      href: path.href.trim(),
      description: hasText(path.description) ? path.description.trim() : undefined,
      iconKey: hasText(path.iconKey) ? path.iconKey.trim() : undefined,
    }))
    .filter((path) => {
      if (seen.has(path.id)) {
        return false;
      }
      seen.add(path.id);
      return true;
    })
    .sort(byOrderThenTitle);
}

function normalizeResources(
  resources: DiscoveryResourceItem[] | undefined,
  activeAudience: string | undefined,
): NormalizedDiscoveryResource[] {
  const seen = new Set<string>();

  return (resources ?? [])
    .filter((item) => hasText(item.id) && hasText(item.title) && hasText(item.href))
    .filter((item) => isVisibleForAudience(item.audiences, activeAudience))
    .map((item) => ({
      ...item,
      id: item.id.trim(),
      title: item.title.trim(),
      href: item.href.trim(),
      description: hasText(item.description) ? item.description.trim() : undefined,
      iconKey: hasText(item.iconKey) ? item.iconKey.trim() : undefined,
      categoryId: hasText(item.categoryId) ? item.categoryId.trim() : 'general',
      keywords: (item.keywords ?? []).filter(hasText).map((keyword) => keyword.trim().toLowerCase()),
      searchableText: [
        item.title,
        item.description,
        item.categoryId,
        ...(item.keywords ?? []),
      ]
        .filter(hasText)
        .map((part) => part.trim().toLowerCase())
        .join(' '),
    }))
    .filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    })
    .sort(byOrderThenTitle);
}

function normalizeCategories(categories: DiscoveryCategory[] | undefined): Map<string, DiscoveryCategory> {
  const map = new Map<string, DiscoveryCategory>();

  for (const category of categories ?? []) {
    if (!hasText(category.id) || !hasText(category.title)) {
      continue;
    }

    map.set(category.id.trim(), {
      id: category.id.trim(),
      title: category.title.trim(),
      description: hasText(category.description) ? category.description.trim() : undefined,
      order: category.order,
    });
  }

  return map;
}

function queryMatches(resource: NormalizedDiscoveryResource, query: string): boolean {
  if (!query) {
    return true;
  }

  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens.every((token) => resource.searchableText.includes(token));
}

export function normalizeSmartSearchWayfindingConfig(
  input: Partial<SmartSearchWayfindingConfig> | undefined,
  activeAudience?: string,
  query = '',
): NormalizedSmartSearchWayfinding {
  const heading = hasText(input?.heading)
    ? input.heading.trim()
    : DEFAULT_SMART_SEARCH_WAYFINDING_CONFIG.heading;
  const searchPlaceholder = hasText(input?.searchPlaceholder)
    ? input.searchPlaceholder.trim()
    : DEFAULT_SMART_SEARCH_WAYFINDING_CONFIG.searchPlaceholder;
  const maxPromotedItems =
    Number.isFinite(input?.maxPromotedItems) && (input?.maxPromotedItems ?? 0) > 0
      ? (input?.maxPromotedItems as number)
      : DEFAULT_SMART_SEARCH_WAYFINDING_CONFIG.maxPromotedItems;
  const maxResultsPerCategory =
    Number.isFinite(input?.maxResultsPerCategory) && (input?.maxResultsPerCategory ?? 0) > 0
      ? (input?.maxResultsPerCategory as number)
      : DEFAULT_SMART_SEARCH_WAYFINDING_CONFIG.maxResultsPerCategory;

  const normalizedQuery = query.trim().toLowerCase();
  const quickPaths = normalizeQuickPaths(input?.quickPaths, activeAudience);
  const categories = normalizeCategories(input?.categories);
  const resources = normalizeResources(input?.resources, activeAudience).filter((resource) =>
    queryMatches(resource, normalizedQuery),
  );

  const promotedResources = resources.filter((resource) => resource.promoted).slice(0, maxPromotedItems);

  const grouped = new Map<string, NormalizedDiscoveryResource[]>();
  for (const resource of resources) {
    const categoryId = categories.has(resource.categoryId) ? resource.categoryId : 'general';
    if (!grouped.has(categoryId)) {
      grouped.set(categoryId, []);
    }
    grouped.get(categoryId)?.push(resource);
  }

  const categoryGroups = [...grouped.entries()]
    .map(([categoryId, categoryResources]) => {
      const category = categories.get(categoryId);
      const title = category?.title ?? 'General Resources';
      const description = category?.description;
      return {
        id: categoryId,
        title,
        description,
        resources: categoryResources.slice(0, maxResultsPerCategory),
        order: category?.order,
      };
    })
    .sort((a, b) => byOrderThenTitle(a, b))
    .map(({ order: _order, ...group }) => group);

  const strategyLabel =
    input?.strategy?.futureSearchEnhancement === 'planned'
      ? 'Curated-first discovery with planned search enhancement'
      : 'Curated-first discovery';

  return {
    heading,
    searchPlaceholder,
    quickPaths,
    promotedResources,
    categoryGroups,
    hasResources: resources.length > 0,
    strategyLabel,
  };
}
