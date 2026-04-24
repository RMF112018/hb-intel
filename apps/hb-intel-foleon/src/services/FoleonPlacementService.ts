/**
 * Read-side SharePoint service for HB_FoleonHomepagePlacements.
 *
 * Queries active placements using indexed fields first (IsActive,
 * DisplayFrom, DisplayThrough, SortRank), then resolves to registry
 * content IDs via `ContentIdCache` without broad unbounded scans.
 */
import {
  buildListItemsEndpoint,
  fetchListItemsJson,
  type SharePointListDescriptor,
  type ListItemsQuery,
} from '@hbc/sharepoint-platform';
import type {
  FoleonLayoutVariant,
  FoleonPlacementKey,
  FoleonPlacementRecord,
} from '../types/foleon-placement.types.js';

export const FOLEON_PLACEMENTS_TITLE = 'HB_FoleonHomepagePlacements' as const;

interface FoleonPlacementRawRow {
  Id?: number;
  Title?: string;
  PlacementKey?: string;
  ContentIdCache?: number;
  ContentLookupId?: number;
  IsActive?: boolean;
  DisplayFrom?: string;
  DisplayThrough?: string;
  SortRank?: number;
  LayoutVariant?: string;
}

const PLACEMENT_SELECT_FIELDS = [
  'Id',
  'Title',
  'PlacementKey',
  'ContentIdCache',
  'ContentLookupId',
  'IsActive',
  'DisplayFrom',
  'DisplayThrough',
  'SortRank',
  'LayoutVariant',
].join(',');

export interface FoleonPlacementQueryParams {
  readonly siteUrl: string;
  readonly placementsListId: string;
  readonly activeOnly?: boolean;
  readonly top?: number;
  readonly signal?: AbortSignal;
}

export async function fetchFoleonPlacements(
  params: FoleonPlacementQueryParams,
): Promise<ReadonlyArray<FoleonPlacementRecord>> {
  const descriptor: SharePointListDescriptor = {
    id: params.placementsListId,
    title: FOLEON_PLACEMENTS_TITLE,
    urlSegment: FOLEON_PLACEMENTS_TITLE,
  };
  const filter = params.activeOnly ? 'IsActive eq 1' : undefined;
  const query: ListItemsQuery = {
    select: PLACEMENT_SELECT_FIELDS,
    top: params.top ?? 50,
    ...(filter ? { filter } : {}),
  };
  const endpoint = buildListItemsEndpoint(params.siteUrl, descriptor, query);
  const rows = await fetchListItemsJson<FoleonPlacementRawRow>(endpoint, {
    signal: params.signal,
    label: FOLEON_PLACEMENTS_TITLE,
  });
  return rows
    .map(toFoleonPlacementRecord)
    .filter((row): row is FoleonPlacementRecord => row !== null);
}

export function toFoleonPlacementRecord(row: FoleonPlacementRawRow): FoleonPlacementRecord | null {
  if (typeof row.Id !== 'number') return null;
  return {
    id: row.Id,
    title: row.Title ?? '',
    placementKey: normalizePlacementKey(row.PlacementKey),
    contentIdCache: row.ContentIdCache,
    contentLookupId: row.ContentLookupId,
    isActive: !!row.IsActive,
    displayFrom: row.DisplayFrom,
    displayThrough: row.DisplayThrough,
    sortRank: typeof row.SortRank === 'number' ? row.SortRank : 0,
    layoutVariant: normalizeLayoutVariant(row.LayoutVariant),
  };
}

function normalizePlacementKey(value: string | undefined): FoleonPlacementKey {
  const allowed: ReadonlyArray<FoleonPlacementKey> = [
    'Hero',
    'Primary Card',
    'Secondary Card',
    'Carousel',
    'Archive Rail',
  ];
  return allowed.includes(value as FoleonPlacementKey)
    ? (value as FoleonPlacementKey)
    : 'Secondary Card';
}

function normalizeLayoutVariant(value: string | undefined): FoleonLayoutVariant | undefined {
  const allowed: ReadonlyArray<FoleonLayoutVariant> = [
    'Large Feature',
    'Compact Card',
    'Square Tile',
    'Text Rail',
  ];
  return allowed.includes(value as FoleonLayoutVariant)
    ? (value as FoleonLayoutVariant)
    : undefined;
}

export { PLACEMENT_SELECT_FIELDS as FOLEON_PLACEMENT_SELECT_FIELDS };
