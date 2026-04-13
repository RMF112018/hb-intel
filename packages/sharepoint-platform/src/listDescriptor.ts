/**
 * Generic SharePoint list descriptor and endpoint builders.
 *
 * Consumers supply descriptors that bind by list GUID. This package
 * deliberately exposes no "fetch by list title" or "fetch by list
 * name" API — GUID binding is the only correct way to survive title
 * drift and URL-segment divergence.
 */

export interface SharePointListDescriptor {
  /** Live SharePoint list GUID. Authoritative binding identifier. */
  id: string;
  /** Live list title. For logging / fallback only — never bind by title. */
  title: string;
  /** URL segment (visible folder in the SharePoint URL). Logging only. */
  urlSegment: string;
  /** Optional human-readable description of the list's purpose. */
  purpose?: string;
  /**
   * Critical custom field InternalNames that domain guardrails may
   * verify against the live schema.
   */
  criticalFieldInternalNames?: ReadonlyArray<string>;
}

export interface ListItemsQuery {
  select?: string;
  expand?: string;
  filter?: string;
  top?: number;
}

/**
 * Build the REST endpoint for fetching items from a list by GUID.
 * Always prefer this over `getbytitle(...)` so title drift cannot
 * cross-bind callers to the wrong list.
 */
export function buildListItemsEndpoint(
  siteUrl: string,
  descriptor: SharePointListDescriptor,
  query?: ListItemsQuery,
): string {
  const params: string[] = [];
  if (query?.select) params.push(`$select=${query.select}`);
  if (query?.expand) params.push(`$expand=${query.expand}`);
  if (query?.filter) params.push(`$filter=${encodeURIComponent(query.filter)}`);
  if (typeof query?.top === 'number') params.push(`$top=${query.top}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return `${siteUrl}/_api/web/lists(guid'${descriptor.id}')/items${qs}`;
}

/**
 * Build the REST endpoint for fetching the field metadata of a list
 * by GUID. When `filter` is supplied, also selects `InternalName`
 * to match the shape the guardrails expect.
 */
export function buildListFieldsEndpoint(
  siteUrl: string,
  descriptor: SharePointListDescriptor,
  filter?: string,
): string {
  const qs = filter
    ? `?$filter=${encodeURIComponent(filter)}&$select=InternalName`
    : '';
  return `${siteUrl}/_api/web/lists(guid'${descriptor.id}')/fields${qs}`;
}
