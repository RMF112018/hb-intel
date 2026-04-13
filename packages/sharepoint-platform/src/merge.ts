/**
 * Generic list-item MERGE (partial update) using the SharePoint REST
 * `X-HTTP-Method: MERGE` + `If-Match` convention. Transactional
 * against the supplied etag so concurrent writes cannot silently
 * overwrite each other.
 */
import {
  buildListItemsEndpoint,
  type SharePointListDescriptor,
} from './listDescriptor.js';
import type { WriteResult } from './results.js';

export async function mergeItemById(
  siteUrl: string,
  descriptor: SharePointListDescriptor,
  itemId: number,
  etag: string,
  digest: string,
  fields: Record<string, unknown>,
): Promise<WriteResult> {
  const url = `${buildListItemsEndpoint(siteUrl, descriptor)}(${itemId})`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': etag,
    },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    return {
      ok: false,
      error:
        `SharePoint rejected the MERGE (${response.status}). ${errorBody ? `Details: ${errorBody.slice(0, 240)}` : ''}`.trim(),
    };
  }
  return { ok: true };
}
