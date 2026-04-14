/**
 * SharePoint write seam for the tenant `HB Article Destination Pages` list.
 *
 * **Binding model — one-row authoritative state.** The tenant list
 * stores exactly one row per `ArticleId`; this writer upserts that
 * row. There is no prior-binding lineage table. Regeneration
 * (`decideRepublishAction → 'regenerate'`) supersedes the single row
 * in place: the new `BindingId` + new `PageId` / `PageUrl` / `PageName`
 * overwrite the prior identity on the same SharePoint item. The
 * durable lineage / audit record for the supersession lives in
 * `HB Article Workflow History`, whose ActionNote the orchestrator
 * stamps with the prior identity before merging the new row.
 *
 * Mirrors the structural pattern established by
 * `heroBannerListWriter`: a title-bound list endpoint
 * (`getbytitle(...)`) plus the platform's request-digest primitive
 * for CSRF. When tenant GUIDs become available the list binding can
 * be swapped to `buildListItemsEndpoint` without changing callers.
 *
 * Authority:
 *   architecture doc 03 §E — binding-row field set (tenant list: HB Article Destination Pages).
 *   architecture doc 06 — binding lifecycle.
 *   operating-charter rule 6 — publish/republish mediated by bindings.
 */

import { fetchRequestDigest } from '@hbc/sharepoint-platform';
import type { PublisherPageBindingRow } from './publisherContracts';
import type { PublisherListDescriptor } from './publisherListDescriptors';
import { PUBLISHER_LISTS } from './publisherListDescriptors';

export interface PageBindingUpsertInput {
  readonly row: PublisherPageBindingRow;
}

export type PageBindingUpsertOutcome =
  | {
      readonly ok: true;
      readonly bindingId: string;
      readonly wasCreated: boolean;
      readonly itemId: number;
    }
  | {
      readonly ok: false;
      readonly reason: 'digestFailed' | 'lookupFailed' | 'writeFailed' | 'unexpectedShape';
      readonly message: string;
      readonly status?: number;
    };

export interface PageBindingWriter {
  upsert(input: PageBindingUpsertInput): Promise<PageBindingUpsertOutcome>;
}

export interface SharePointPageBindingWriterDeps {
  readonly descriptor?: PublisherListDescriptor;
  readonly fetchImpl?: typeof fetch;
  readonly fetchRequestDigestImpl?: typeof fetchRequestDigest;
}

interface LookupRecord {
  readonly Id: number;
  readonly ArticleId?: string;
}

function listItemsEndpoint(descriptor: PublisherListDescriptor): string {
  return `${descriptor.hostSiteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(descriptor.displayName)}')/items`;
}

/**
 * Project the typed binding row into the raw SP field bag used by both
 * POST (insert) and MERGE (update). `null` is emitted for optional
 * fields that are unset so MERGE clears the cell rather than leaving
 * stale content.
 */
export function mapBindingRowToListFields(
  row: PublisherPageBindingRow,
): Record<string, unknown> {
  return {
    BindingId: row.BindingId,
    ArticleId: row.ArticleId,
    Title: row.Title,
    TargetSiteUrl: row.TargetSiteUrl,
    PageTemplateKey: row.PageTemplateKey,
    PublishStatus: row.PublishStatus,
    PageId: row.PageId ?? null,
    PageName: row.PageName ?? null,
    PageUrl: row.PageUrl ? { Url: row.PageUrl, Description: row.PageUrl } : null,
    PageShellVersion: row.PageShellVersion ?? null,
    RenderVersion: row.RenderVersion ?? null,
    SyncStatus: row.SyncStatus ?? null,
    LastSyncDateUtc: row.LastSyncDateUtc ?? null,
    LastSyncMessage: row.LastSyncMessage ?? null,
    PublishedDateUtc: row.PublishedDateUtc ?? null,
  };
}

export function createSharePointPageBindingWriter(
  deps: SharePointPageBindingWriterDeps = {},
): PageBindingWriter {
  const descriptor = deps.descriptor ?? PUBLISHER_LISTS.pageBindings;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const digestImpl = deps.fetchRequestDigestImpl ?? fetchRequestDigest;

  async function findExistingItemId(articleId: string): Promise<number | undefined> {
    const url =
      `${listItemsEndpoint(descriptor)}` +
      `?$select=Id,ArticleId&$filter=${encodeURIComponent(`ArticleId eq '${articleId.replace(/'/g, "''")}'`)}&$top=1`;
    const res = await fetchImpl(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json;odata=nometadata' },
    });
    if (!res.ok) return undefined;
    const body = (await res.json().catch(() => undefined)) as
      | { value?: LookupRecord[] }
      | undefined;
    const match = body?.value?.[0];
    return match && typeof match.Id === 'number' ? match.Id : undefined;
  }

  return {
    async upsert({ row }) {
      let digest: string;
      try {
        digest = await digestImpl(descriptor.hostSiteUrl);
      } catch (err) {
        return {
          ok: false,
          reason: 'digestFailed',
          message: err instanceof Error ? err.message : 'Digest fetch failed',
        };
      }

      let existingId: number | undefined;
      try {
        existingId = await findExistingItemId(row.ArticleId);
      } catch (err) {
        return {
          ok: false,
          reason: 'lookupFailed',
          message: err instanceof Error ? err.message : 'Binding lookup failed',
        };
      }

      const body = mapBindingRowToListFields(row);

      if (existingId !== undefined) {
        const patchUrl = `${listItemsEndpoint(descriptor)}(${existingId})`;
        const res = await fetchImpl(patchUrl, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json;odata=nometadata',
            'Content-Type': 'application/json;odata=nometadata',
            'X-RequestDigest': digest,
            'If-Match': '*',
            'X-HTTP-Method': 'MERGE',
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          return {
            ok: false,
            reason: 'writeFailed',
            message: `Binding MERGE failed (status ${res.status}).`,
            status: res.status,
          };
        }
        return {
          ok: true,
          bindingId: row.BindingId,
          wasCreated: false,
          itemId: existingId,
        };
      }

      const postUrl = listItemsEndpoint(descriptor);
      const res = await fetchImpl(postUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return {
          ok: false,
          reason: 'writeFailed',
          message: `Binding POST failed (status ${res.status}).`,
          status: res.status,
        };
      }
      const created = (await res.json().catch(() => undefined)) as
        | { Id?: number }
        | undefined;
      if (!created || typeof created.Id !== 'number') {
        return {
          ok: false,
          reason: 'unexpectedShape',
          message: 'Binding POST returned no Id.',
        };
      }
      return {
        ok: true,
        bindingId: row.BindingId,
        wasCreated: true,
        itemId: created.Id,
      };
    },
  };
}
