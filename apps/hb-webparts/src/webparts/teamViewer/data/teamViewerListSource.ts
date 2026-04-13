/**
 * teamViewerListSource — SharePoint REST reads for TeamViewer.
 *
 * Three explicit fetch functions, each binding by GUID through
 * `buildListItemsEndpoint`. When the target list is not yet provisioned
 * (empty GUID in the registry), the function returns a typed
 * `not-provisioned` result so the hook layer can degrade to empty state
 * without ever issuing a doomed request.
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

/** Escape a string for an OData filter literal. */
function odataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Read the destination-page row for a host site + page URL combo and
 * return the bound article id. Used when no explicit `articleId` is
 * supplied via webpart properties.
 */
export async function fetchArticleIdForHostContext(
  siteUrl: string,
  hostPageUrl: string,
  options?: { signal?: AbortSignal },
): Promise<TeamViewerSourceResult<string | undefined>> {
  const list = TEAM_VIEWER_LIST_REGISTRY.articleDestinationPages;
  if (!list.isProvisioned) {
    return { status: 'not-provisioned', listKey: 'articleDestinationPages' };
  }
  try {
    const filter = `PageUrl eq ${odataString(hostPageUrl)} and PublishStatus eq 'published'`;
    const endpoint = buildListItemsEndpoint(siteUrl, list, {
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
 * Read all team-member rows bound to the given article, sorted by
 * `SortOrder` ascending. Returns raw rows; caller is responsible for
 * normalization via `teamViewerNormalization`.
 */
export async function fetchArticleTeamMemberRows(
  siteUrl: string,
  articleId: string,
  options?: { signal?: AbortSignal; top?: number },
): Promise<TeamViewerSourceResult<RawArticleTeamMemberRow[]>> {
  const list = TEAM_VIEWER_LIST_REGISTRY.articleTeamMembers;
  if (!list.isProvisioned) {
    return { status: 'not-provisioned', listKey: 'articleTeamMembers' };
  }
  try {
    const endpoint = buildListItemsEndpoint(siteUrl, list, {
      select:
        'Id,ArticleId,TeamMemberId,DisplayName,Role,Department,Company,SortOrder,GroupKey,BioSnippet,ContactLink,PersonPrincipal/EMail,PersonPrincipal/Title,PersonPrincipal/UserName,ResumeRichText,ResumeDocumentUrl,ResumeDocumentLabel',
      expand: 'PersonPrincipal',
      filter: `ArticleId eq ${odataString(articleId)}`,
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

/**
 * Accepts a transport-layer `FetchResult` and converts it into the
 * TeamViewer source result shape for consistency at the hook boundary.
 * Kept small; provided so callers that already speak the platform
 * result shape don't need to hand-map.
 */
export function fromFetchResult<T>(fr: FetchResult<T>): TeamViewerSourceResult<T> {
  if (fr.ok) return { status: 'ok', value: fr.value };
  return { status: 'error', error: toError(fr.error) };
}
