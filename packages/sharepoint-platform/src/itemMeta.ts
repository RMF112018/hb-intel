/**
 * Generic item-meta lookup by field value.
 *
 * Given a list descriptor, a field InternalName, and a value, fetch
 * the first matching item and extract `{ itemId, etag }`. Uses the
 * minimalmetadata Accept header so the response carries the
 * `@odata.etag` field needed for If-Match writes.
 */
import {
  buildListItemsEndpoint,
  type SharePointListDescriptor,
} from './listDescriptor.js';

export interface ItemMeta {
  itemId: number;
  etag: string;
}

/** Escape a literal string for OData `$filter` use. */
function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Look up the live SharePoint list item id and etag for the first
 * item where `fieldName eq value`. Returns `undefined` when no item
 * matches. Throws on non-OK HTTP responses.
 */
export async function fetchItemMetaByFieldValue(
  siteUrl: string,
  descriptor: SharePointListDescriptor,
  fieldName: string,
  value: string,
): Promise<ItemMeta | undefined> {
  if (!value.trim()) return undefined;

  const url = buildListItemsEndpoint(siteUrl, descriptor, {
    select: `Id`,
    filter: `${fieldName} eq '${escapeODataString(value)}'`,
    top: 1,
  });

  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=minimalmetadata' },
  });

  if (!response.ok) {
    throw new Error(
      `List lookup by ${fieldName} failed: ${response.status} ${response.statusText}`,
    );
  }

  interface RawItem {
    Id: number;
    '@odata.etag'?: string;
    'odata.etag'?: string;
  }
  const body = (await response.json()) as { value?: RawItem[] };
  const raw = body.value?.[0];
  if (!raw) return undefined;

  const etag = raw['@odata.etag'] ?? raw['odata.etag'] ?? '*';
  return { itemId: raw.Id, etag };
}
