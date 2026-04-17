/**
 * SharePoint list read seam for the Priority Actions Band Items list.
 *
 * Fetches action item rows from the canonical list, filtered by band
 * key and enabled status. Returns raw rows for the normalization layer
 * to process.
 *
 * Schema authority:
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md
 */
import {
  PRIORITY_ACTIONS_ITEMS_FIELDS as F,
  PRIORITY_ACTIONS_ITEMS_LIST_TITLE,
  type RawPriorityActionsItemRow,
} from './priorityActionsItemsListDescriptor.js';

/* ── Network ────────────────────────────────────────────────────── */

const SELECT_FIELDS = Object.values(F).join(',');

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

export async function fetchPriorityActionsItems(
  siteUrl: string,
  bandKey: string = 'homepage-primary',
): Promise<RawPriorityActionsItemRow[]> {
  const escapedBandKey = escapeODataString(bandKey);
  const url =
    `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(PRIORITY_ACTIONS_ITEMS_LIST_TITLE)}')/items` +
    `?$select=${SELECT_FIELDS}` +
    `&$filter=${F.BandKey} eq '${escapedBandKey}' and ${F.ItemStatus} eq 'Enabled'` +
    `&$orderby=${F.SortOrder} asc` +
    `&$top=500`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });

  if (!response.ok) {
    throw new Error(
      `Priority Actions Items list request failed: ${response.status} ${response.statusText}`,
    );
  }

  let body: { value?: unknown };
  try {
    body = (await response.json()) as { value?: unknown };
  } catch {
    throw new Error('Priority Actions Items list response was not valid JSON');
  }

  return Array.isArray(body.value) ? (body.value as RawPriorityActionsItemRow[]) : [];
}
