/**
 * React hook that resolves Priority Actions config and items from the
 * hosted SharePoint lists, with cache + graceful fallback when SPFx
 * context is absent or queries fail.
 *
 * Mirrors the pattern used by `useHeroBannerData` /
 * `useToolLauncherData` so behavior stays consistent across the
 * homepage data seams.
 */
import { useEffect, useRef, useState } from 'react';
import { getSiteUrl, getPriorityActionsListHostUrl } from './spContext.js';
import { fetchPriorityActionsConfig } from './priorityActionsConfigListSource.js';
import { fetchPriorityActionsItems } from './priorityActionsItemsListSource.js';
import type { PriorityActionsConfigResolved, PriorityActionsItemNormalized } from './priorityActionsContracts.js';
import { normalizeItemRows, filterByAudience, filterBySchedule } from './priorityActionsNormalization.js';
import type { RawPriorityActionsItemRow } from './priorityActionsItemsListDescriptor.js';

export interface PriorityActionsDataResult {
  config: PriorityActionsConfigResolved | undefined;
  items: PriorityActionsItemNormalized[];
  isLoading: boolean;
  error: string | undefined;
}

interface CacheEntry {
  siteUrl: string;
  bandKey: string;
  config: PriorityActionsConfigResolved | undefined;
  rawItems: RawPriorityActionsItemRow[];
  fetchedAt: number;
}

let _cache: CacheEntry | undefined;
const CACHE_TTL_MS = 5 * 60 * 1000;
const FALLBACK_CONFIG: PriorityActionsConfigResolved = {
  id: 0,
  title: 'Homepage Priority Actions',
  bandKey: 'homepage-primary',
  enabled: true,
  isActive: true,
  headingText: 'Priority Actions',
  overflowLabel: 'More tools',
  showHeading: true,
  showBadges: false,
  desktopLayoutMode: 'rail',
  tabletLayoutMode: 'rail',
  mobileLayoutMode: 'sheet-trigger',
  maxVisibleDesktop: 7,
  maxVisibleLaptop: 7,
  maxVisibleTabletLandscape: 5,
  maxVisibleTabletPortrait: 4,
  maxVisiblePhone: 3,
  openExternalInNewTabByDefault: true,
  adminNotes: 'Fallback launcher config for non-SPFx hosts.',
  modified: '1970-01-01T00:00:00.000Z',
};

const FALLBACK_ITEMS: PriorityActionsItemNormalized[] = [
  {
    id: 1,
    actionKey: 'hb-projects',
    title: 'HB Projects',
    href: '/sites/HBIntel/SitePages/projects.aspx',
    description: 'Project dashboard',
    iconKey: 'project',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: 'operations',
    groupTitle: 'Operations',
    sortOrder: 1,
    overflowOnly: false,
    mobilePriority: 1,
    audienceMode: 'all',
    audienceKeys: [],
    isExternal: false,
    openInNewTab: false,
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 2,
    actionKey: 'procore',
    title: 'Procore',
    href: 'https://app.procore.com',
    description: 'Construction platform',
    iconKey: 'field',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: 'operations',
    groupTitle: 'Operations',
    sortOrder: 2,
    overflowOnly: false,
    mobilePriority: 2,
    audienceMode: 'all',
    audienceKeys: [],
    isExternal: true,
    openInNewTab: true,
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 3,
    actionKey: 'document-crunch',
    title: 'Document Crunch',
    href: '/sites/HBIntel/SitePages/document-crunch.aspx',
    description: 'Contract intelligence',
    iconKey: 'document',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: 'compliance',
    groupTitle: 'Compliance',
    sortOrder: 3,
    overflowOnly: false,
    mobilePriority: 3,
    audienceMode: 'all',
    audienceKeys: [],
    isExternal: false,
    openInNewTab: false,
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 4,
    actionKey: 'hb-university',
    title: 'HB University',
    href: '/sites/HBIntel/SitePages/university.aspx',
    description: 'Learning hub',
    iconKey: 'team',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: 'people',
    groupTitle: 'People',
    sortOrder: 4,
    overflowOnly: false,
    mobilePriority: 4,
    audienceMode: 'all',
    audienceKeys: [],
    isExternal: false,
    openInNewTab: false,
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 5,
    actionKey: 'hh2',
    title: 'HH2',
    href: 'https://secure.hh2.com',
    description: 'Field payroll',
    iconKey: 'finance',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: 'finance',
    groupTitle: 'Finance',
    sortOrder: 5,
    overflowOnly: false,
    mobilePriority: 5,
    audienceMode: 'all',
    audienceKeys: [],
    isExternal: true,
    openInNewTab: true,
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 6,
    actionKey: 'bamboohr',
    title: 'BambooHR',
    href: 'https://app.bamboohr.com',
    description: 'People operations',
    iconKey: 'hr',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: 'people',
    groupTitle: 'People',
    sortOrder: 6,
    overflowOnly: false,
    mobilePriority: 6,
    audienceMode: 'all',
    audienceKeys: [],
    isExternal: true,
    openInNewTab: true,
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 7,
    actionKey: 'safety-reporting',
    title: 'Safety Reporting',
    href: '/sites/HBIntel/SitePages/safety.aspx',
    description: 'Safety workflows',
    iconKey: 'safety',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: 'safety',
    groupTitle: 'Safety',
    sortOrder: 7,
    overflowOnly: true,
    mobilePriority: 7,
    audienceMode: 'all',
    audienceKeys: [],
    isExternal: false,
    openInNewTab: false,
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
];

export function invalidatePriorityActionsCache(): void {
  _cache = undefined;
}

function cacheHit(siteUrl: string, bandKey: string): CacheEntry | undefined {
  if (!_cache) return undefined;
  if (_cache.siteUrl !== siteUrl || _cache.bandKey !== bandKey) return undefined;
  if (Date.now() - _cache.fetchedAt >= CACHE_TTL_MS) return undefined;
  return _cache;
}

function deriveItems(
  rawItems: RawPriorityActionsItemRow[],
  activeAudience: string | undefined,
): PriorityActionsItemNormalized[] {
  let items = normalizeItemRows(rawItems);
  items = filterByAudience(items, activeAudience);
  items = filterBySchedule(items);
  return items;
}

function deriveFallbackItems(
  activeAudience: string | undefined,
): PriorityActionsItemNormalized[] {
  let items = [...FALLBACK_ITEMS];
  items = filterByAudience(items, activeAudience);
  items = filterBySchedule(items);
  return items;
}

function supportsHostedListFetch(siteUrl: string | undefined): boolean {
  if (!siteUrl) return false;
  try {
    const host = new URL(siteUrl).hostname.toLowerCase();
    if (!host.endsWith('.sharepoint.com')) return false;
    if (host === 'example.sharepoint.com') return false;
    return true;
  } catch {
    return false;
  }
}

export interface UsePriorityActionsDataOptions {
  bandKey?: string;
  activeAudience?: string;
}

export function usePriorityActionsData(
  options: UsePriorityActionsDataOptions = {},
): PriorityActionsDataResult {
  const { bandKey = 'homepage-primary', activeAudience } = options;
  const hostingSiteUrl = getSiteUrl();
  // Fetch the canonical list host only when running in a SharePoint host.
  // Non-SPFx hosts (dev harness, docs previews) render a stable fallback
  // launcher so runtime markers remain auditable.
  const canFetchHostedLists = supportsHostedListFetch(hostingSiteUrl);
  const siteUrl = canFetchHostedLists ? getPriorityActionsListHostUrl() : undefined;

  const [result, setResult] = useState<PriorityActionsDataResult>(() => {
    if (siteUrl) {
      const hit = cacheHit(siteUrl, bandKey);
      if (hit) {
        return {
          config: hit.config,
          items: deriveItems(hit.rawItems, activeAudience),
          isLoading: false,
          error: undefined,
        };
      }
      return { config: undefined, items: [], isLoading: true, error: undefined };
    }
    return {
      config: FALLBACK_CONFIG,
      items: deriveFallbackItems(activeAudience),
      isLoading: false,
      error: undefined,
    };
  });

  const abortRef = useRef<AbortController | undefined>();

  useEffect(() => {
    if (!siteUrl) {
      setResult({
        config: FALLBACK_CONFIG,
        items: deriveFallbackItems(activeAudience),
        isLoading: false,
        error: undefined,
      });
      return;
    }
    if (cacheHit(siteUrl, bandKey)) return;

    const controller = new AbortController();
    abortRef.current = controller;
    let cancelled = false;

    (async () => {
      try {
        const [config, rawItems] = await Promise.all([
          fetchPriorityActionsConfig(siteUrl, bandKey),
          fetchPriorityActionsItems(siteUrl, bandKey),
        ]);
        if (cancelled) return;
        _cache = { siteUrl, bandKey, config, rawItems, fetchedAt: Date.now() };
        setResult({
          config,
          items: deriveItems(rawItems, activeAudience),
          isLoading: false,
          error: undefined,
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load Priority Actions data';
        setResult({ config: undefined, items: [], isLoading: false, error: message });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [siteUrl, bandKey, activeAudience]);

  return result;
}
