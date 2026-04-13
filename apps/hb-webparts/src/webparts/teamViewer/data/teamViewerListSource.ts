/**
 * teamViewerListSource — SharePoint REST reads against the HBCentral
 * publisher control plane.
 *
 * Every fetch in this module targets the `listHostUrl` parameter, which
 * the binding resolver guarantees is always the canonical HBCentral
 * URL (or an explicit dev-harness override). Render hosts
 * (`/sites/CompanyPulse`, `/sites/ProjectSpotlight`) are never
 * passed here. Destination-page lookups accept the render host + page
 * URL as filter keys ONLY — the list read itself still hits HBCentral.
 */
import {
  buildListItemsEndpoint,
  fetchListItemsJson,
  type FetchResult,
} from '@hbc/sharepoint-platform';
import {
  TEAM_VIEWER_LIST_REGISTRY,
  type TeamViewerListKey,
} from './teamViewerListRegistry.js';
import type { RawArticleTeamMemberRow } from './teamViewerNormalization.js';

export type TeamViewerSourceResult<T> =
  | { status: 'ok'; value: T }
  | { status: 'not-provisioned'; listKey: TeamViewerListKey }
  | { status: 'error'; error: Error };

interface RawDestinationPageRow {
  ArticleId?: unknown;
  TargetSiteUrl?: unknown;
  PageUrl?: unknown;
  PageId?: unknown;
  BindingId?: unknown;
  PublishStatus?: unknown;
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

/** Escape a value for inclusion in an OData filter string literal. */
function odataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** Remove trailing slashes so OData equality matches exact list values. */
function normalizeUrlForFilter(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Resolve the bound `ArticleId` for the current render host + page URL.
 *
 * The read itself targets `listHostUrl` (always HBCentral). The render
 * host and page URL are used only as OData filter keys so a single
 * HBCentral control plane can serve multiple consumer hosts
 * deterministically.
 *
 * Returns:
 *   - `ok` with `value: string` when a single published binding matches;
 *   - `ok` with `value: undefined` when no binding matches (empty state);
 *   - `not-provisioned` when the destination-pages list GUID is blank;
 *   - `error` on transport failure.
 */
export async function fetchArticleIdForRenderContext(
  params: {
    listHostUrl: string;
    renderSiteUrl: string;
    renderPageUrl: string;
  },
  options?: { signal?: AbortSignal },
): Promise<TeamViewerSourceResult<string | undefined>> {
  const list = TEAM_VIEWER_LIST_REGISTRY.articleDestinationPages;
  if (!list.isProvisioned) {
    return { status: 'not-provisioned', listKey: 'articleDestinationPages' };
  }
  try {
    const site = normalizeUrlForFilter(params.renderSiteUrl);
    const page = normalizeUrlForFilter(params.renderPageUrl);
    const filter =
      `TargetSiteUrl eq ${odataString(site)}` +
      ` and PageUrl eq ${odataString(page)}` +
      ` and PublishStatus eq 'published'`;
    const endpoint = buildListItemsEndpoint(params.listHostUrl, list, {
      select: 'ArticleId,TargetSiteUrl,PageUrl,BindingId',
      filter,
      top: 1,
    });
    const rows = await fetchListItemsJson<RawDestinationPageRow>(endpoint, {
      signal: options?.signal,
      label: `HB Article Destination Pages (${list.id})`,
    });
    const articleId =
      rows.length > 0 && typeof rows[0].ArticleId === 'string' && rows[0].ArticleId.trim()
        ? rows[0].ArticleId.trim()
        : undefined;
    return { status: 'ok', value: articleId };
  } catch (err) {
    return { status: 'error', error: toError(err) };
  }
}

/**
 * Resolve the bound `ArticleId` for a caller-supplied destination key.
 * Filters `HB Article Destination Pages` by `BindingId eq <key>` on
 * HBCentral.
 */
export async function fetchArticleIdForDestinationKey(
  params: { listHostUrl: string; destinationKey: string },
  options?: { signal?: AbortSignal },
): Promise<TeamViewerSourceResult<string | undefined>> {
  const list = TEAM_VIEWER_LIST_REGISTRY.articleDestinationPages;
  if (!list.isProvisioned) {
    return { status: 'not-provisioned', listKey: 'articleDestinationPages' };
  }
  try {
    const endpoint = buildListItemsEndpoint(params.listHostUrl, list, {
      select: 'ArticleId,BindingId,PublishStatus',
      filter: `BindingId eq ${odataString(params.destinationKey)} and PublishStatus eq 'published'`,
      top: 1,
    });
    const rows = await fetchListItemsJson<RawDestinationPageRow>(endpoint, {
      signal: options?.signal,
      label: `HB Article Destination Pages (${list.id})`,
    });
    const articleId =
      rows.length > 0 && typeof rows[0].ArticleId === 'string' && rows[0].ArticleId.trim()
        ? rows[0].ArticleId.trim()
        : undefined;
    return { status: 'ok', value: articleId };
  } catch (err) {
    return { status: 'error', error: toError(err) };
  }
}

/**
 * Read all team-member rows bound to `articleId`, sorted by
 * `SortOrder` ascending. Always targets the HBCentral list host.
 * Normalization happens at the hook boundary.
 */
export async function fetchArticleTeamMemberRows(
  params: { listHostUrl: string; articleId: string },
  options?: { signal?: AbortSignal; top?: number },
): Promise<TeamViewerSourceResult<RawArticleTeamMemberRow[]>> {
  const list = TEAM_VIEWER_LIST_REGISTRY.articleTeamMembers;
  if (!list.isProvisioned) {
    return { status: 'not-provisioned', listKey: 'articleTeamMembers' };
  }
  try {
    const endpoint = buildListItemsEndpoint(params.listHostUrl, list, {
      select:
        'Id,ArticleId,TeamMemberId,DisplayName,Role,Department,Company,SortOrder,GroupKey,BioSnippet,ContactLink,PersonPrincipal/EMail,PersonPrincipal/Title,PersonPrincipal/UserName,ResumeRichText,ResumeDocumentUrl,ResumeDocumentLabel',
      expand: 'PersonPrincipal',
      filter: `ArticleId eq ${odataString(params.articleId)}`,
      top: options?.top ?? 200,
    });
    const rows = await fetchListItemsJson<RawArticleTeamMemberRow>(endpoint, {
      signal: options?.signal,
      label: `HB Article Team Members (${list.id})`,
    });
    return { status: 'ok', value: rows };
  } catch (err) {
    return { status: 'error', error: toError(err) };
  }
}

export function fromFetchResult<T>(fr: FetchResult<T>): TeamViewerSourceResult<T> {
  if (fr.ok) return { status: 'ok', value: fr.value };
  return { status: 'error', error: toError(fr.error) };
}
