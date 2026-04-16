/**
 * Read-only lookup adapter that backs the Article Publisher's
 * governed `AssetLibrarySearchFn` seam with a concrete
 * tenant-safe source.
 *
 * Binding identity
 * ----------------
 * Target site:    caller-supplied `hostSiteUrl` (Publisher mount
 *                 passes `PUBLISHER_LIST_HOST_SITE_URL` — the
 *                 HBCentral absolute site URL).
 * Target list:    SharePoint document library looked up by title
 *                 (`getbytitle('Site Assets')` by default). The
 *                 library title is overrideable via
 *                 `AssetLibrarySearchOptions.listTitle` so a
 *                 curated successor library can replace the
 *                 default without changing the UI seam.
 * Folder scope:   optional `folderServerRelativeUrl` narrows the
 *                 query to a single folder inside the library,
 *                 enabling a governed subset of assets.
 *
 * Why title binding. Matches the repo's current lookup-adapter
 * norm (`projectsLookupSource.ts`, `projectSpotlightListSource`
 * both use `getbytitle(...)`); title drift surfaces as a labeled
 * read failure, which the `AssetLibraryBrowser` error state
 * already renders honestly to the author. Upgrading to GUID
 * binding via `@hbc/sharepoint-platform`'s `buildListItemsEndpoint`
 * is deferred until the tenant list identity is pinned under the
 * platform package.
 *
 * What this is not. Not a general media platform. Not a Graph
 * binding. Not a mount wiring (that is Prompt-02). Not a provider
 * for unsupported destinations. The provider is the
 * Project-Spotlight-only authoritative asset search source.
 */
import { fetchListItemsJson } from '@hbc/sharepoint-platform';
import { escapeODataString } from './odataEscape.js';
import type {
  AssetLibrarySearchFn,
  AssetLookupEntry,
} from '../../webparts/articlePublisher/sharedChrome/assetLibrarySource.js';

/** SharePoint document-library title used by default. */
export const ASSET_LIBRARY_DEFAULT_LIST_TITLE = 'Site Assets';

/** Upper bound on results returned from a single search query. */
export const DEFAULT_ASSET_LIBRARY_LIMIT = 20;

/**
 * Image file extensions the provider will surface. Anything
 * outside this set is filtered out at the REST layer via the
 * built-in `File_x0020_Type` column so non-image library assets
 * never reach the authoring UI.
 */
export const ASSET_LIBRARY_IMAGE_FILE_TYPES: readonly string[] = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
];

/**
 * Raw SharePoint row shape returned from the REST query.
 * Only fields in `$select` are guaranteed to be present.
 */
export interface RawAssetLibraryItem {
  readonly Id?: number | string;
  readonly UniqueId?: string;
  readonly Title?: string;
  readonly FileLeafRef?: string;
  readonly FileRef?: string;
  readonly FileDirRef?: string;
  readonly EncodedAbsUrl?: string;
  readonly File_x0020_Type?: string;
}

export interface AssetLibrarySearchOptions {
  /** Absolute site URL that hosts the target library. */
  readonly hostSiteUrl: string;
  /** Optional override of the library title. Defaults to `'Site Assets'`. */
  readonly listTitle?: string;
  /**
   * Optional server-relative folder URL inside the library, used
   * to scope the search to a curated subset (e.g. `/sites/HBCentral/SiteAssets/ArticleImages`).
   * When omitted, the search spans the whole library.
   */
  readonly folderServerRelativeUrl?: string;
  /** Upper bound on results returned. Defaults to 20. */
  readonly maxResults?: number;
}

/**
 * Map a raw Site-Assets row to an `AssetLookupEntry`.
 *
 * Returns `null` when the row cannot yield a usable absolute
 * image URL — callers strip nulls so the authoring UI never
 * receives a broken card. Exported for unit testing.
 */
export function mapRawAssetRow(
  row: RawAssetLibraryItem,
  opts: { readonly hostSiteUrl: string; readonly source: string },
): AssetLookupEntry | null {
  const imageUrl = resolveImageUrl(row, opts.hostSiteUrl);
  if (!imageUrl) return null;

  const fileName = row.FileLeafRef?.trim();
  const title = row.Title?.trim() || fileName;
  if (!title) return null;

  const rawId = row.UniqueId?.trim() || toStringId(row.Id);
  if (!rawId) return null;

  const suggestedAltText = row.Title?.trim() || undefined;

  return {
    assetId: rawId,
    imageUrl,
    title,
    source: opts.source,
    suggestedAltText,
  };
}

function resolveImageUrl(
  row: RawAssetLibraryItem,
  hostSiteUrl: string,
): string | undefined {
  const encoded = row.EncodedAbsUrl?.trim();
  if (encoded) return encoded;

  const fileRef = row.FileRef?.trim();
  if (!fileRef) return undefined;
  try {
    const origin = new URL(hostSiteUrl).origin;
    return `${origin}${fileRef.startsWith('/') ? '' : '/'}${fileRef}`;
  } catch {
    return undefined;
  }
}

function toStringId(id: RawAssetLibraryItem['Id']): string | undefined {
  if (typeof id === 'number' && Number.isFinite(id)) return String(id);
  if (typeof id === 'string') {
    const trimmed = id.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

/**
 * Build an `AssetLibrarySearchFn` bound to the given host site
 * and library.
 *
 * Query behavior:
 *   - Empty/whitespace query returns `[]` without firing a
 *     request (matches `projectsLookupSource`).
 *   - Non-empty query builds a case-insensitive substring filter
 *     against `Title` and `FileLeafRef`, combined with an
 *     image-type guard (`File_x0020_Type eq 'jpg' | 'png' | …`).
 *   - Results are sorted by filename for a stable visual order.
 *   - Network/non-OK failures propagate as labeled throws; the
 *     caller's `AssetLibraryBrowser` error state already renders
 *     them honestly.
 */
export function createAssetLibrarySearch(
  options: AssetLibrarySearchOptions,
): AssetLibrarySearchFn {
  const listTitle = options.listTitle ?? ASSET_LIBRARY_DEFAULT_LIST_TITLE;
  const maxResults = options.maxResults ?? DEFAULT_ASSET_LIBRARY_LIMIT;
  const base = options.hostSiteUrl.replace(/\/$/, '');
  const endpointRoot =
    `${base}/_api/web/lists/getbytitle('${encodeURIComponent(listTitle)}')/items`;
  const select =
    '$select=Id,UniqueId,Title,FileLeafRef,FileRef,FileDirRef,EncodedAbsUrl,File_x0020_Type';
  const folderServerRelativeUrl = options.folderServerRelativeUrl?.replace(
    /\/$/,
    '',
  );

  const imageTypeClause = ASSET_LIBRARY_IMAGE_FILE_TYPES.map(
    (ext) => `File_x0020_Type eq '${ext}'`,
  ).join(' or ');

  return async (query, signal) => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const escaped = escapeODataString(trimmed);
    const searchClause =
      `(substringof('${escaped}',Title)` +
      ` or substringof('${escaped}',FileLeafRef))`;
    const clauses: string[] = [searchClause, `(${imageTypeClause})`];
    if (folderServerRelativeUrl) {
      const escapedFolder = escapeODataString(folderServerRelativeUrl);
      clauses.push(`FileDirRef eq '${escapedFolder}'`);
    }
    const filter = clauses.join(' and ');
    const url =
      `${endpointRoot}?${select}` +
      `&$filter=${encodeURIComponent(filter)}` +
      `&$orderby=FileLeafRef` +
      `&$top=${maxResults}`;

    const rows = await fetchListItemsJson<RawAssetLibraryItem>(url, {
      signal,
      label: `${listTitle} library`,
    });

    const entries: AssetLookupEntry[] = [];
    for (const row of rows) {
      const entry = mapRawAssetRow(row, {
        hostSiteUrl: options.hostSiteUrl,
        source: listTitle,
      });
      if (entry) entries.push(entry);
    }
    return entries;
  };
}
