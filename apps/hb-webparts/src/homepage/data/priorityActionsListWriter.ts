/**
 * SharePoint write seam for Priority Actions lists.
 *
 * Owns the authoritative write paths consumed by the Priority Actions
 * Rail Admin webpart. Shares list descriptors with the read seams so
 * field names cannot drift.
 *
 * After successful writes, the in-memory cache used by
 * `usePriorityActionsData` is invalidated so the next public render
 * sees the new values.
 *
 * Schema authority:
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md
 */
import { fetchRequestDigest } from '@hbc/sharepoint-platform';
import {
  PRIORITY_ACTIONS_CONFIG_FIELDS as CF,
  PRIORITY_ACTIONS_CONFIG_LIST_TITLE,
} from './priorityActionsConfigListDescriptor.js';
import {
  PRIORITY_ACTIONS_ITEMS_FIELDS as IF,
  PRIORITY_ACTIONS_ITEMS_LIST_TITLE,
} from './priorityActionsItemsListDescriptor.js';
import { invalidatePriorityActionsCache } from './usePriorityActionsData.js';
import type {
  PriorityActionsConfigDraft,
  PriorityActionsItemDraft,
  PriorityActionsWriteCommand,
} from './priorityActionsContracts.js';

/* ── Result types ────────────────────────────────────────────────── */

export type PriorityActionsWriteResult =
  | { ok: true; itemId: number }
  | { ok: false; error: string };

/* ── Helpers ─────────────────────────────────────────────────────── */

function optionalString(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function configListEndpoint(siteUrl: string): string {
  return `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(PRIORITY_ACTIONS_CONFIG_LIST_TITLE)}')/items`;
}

function itemsListEndpoint(siteUrl: string): string {
  return `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(PRIORITY_ACTIONS_ITEMS_LIST_TITLE)}')/items`;
}

/* ── Field mapping: config ───────────────────────────────────────── */

export function mapConfigDraftToFields(draft: PriorityActionsConfigDraft): Record<string, unknown> {
  return {
    [CF.Title]: draft.title.trim(),
    [CF.BandKey]: draft.bandKey.trim(),
    [CF.Enabled]: draft.enabled,
    [CF.IsActive]: draft.isActive,
    [CF.HeadingText]: optionalString(draft.headingText),
    [CF.OverflowLabel]: draft.overflowLabel.trim() || 'More tools',
    [CF.ShowHeading]: draft.showHeading,
    [CF.StickyAfterHero]: draft.stickyAfterHero,
    [CF.ShowBadges]: draft.showBadges,
    [CF.DesktopLayoutMode]: draft.desktopLayoutMode,
    [CF.TabletLayoutMode]: draft.tabletLayoutMode,
    [CF.MobileLayoutMode]: draft.mobileLayoutMode,
    [CF.MaxVisibleDesktop]: draft.maxVisibleDesktop,
    [CF.MaxVisibleLaptop]: draft.maxVisibleLaptop,
    [CF.MaxVisibleTabletLandscape]: draft.maxVisibleTabletLandscape,
    [CF.MaxVisibleTabletPortrait]: draft.maxVisibleTabletPortrait,
    [CF.MaxVisiblePhone]: draft.maxVisiblePhone,
    [CF.OpenExternalInNewTabByDefault]: draft.openExternalInNewTabByDefault,
    [CF.AdminNotes]: optionalString(draft.adminNotes),
  };
}

/* ── Field mapping: item ─────────────────────────────────────────── */

export function mapItemDraftToFields(
  draft: PriorityActionsItemDraft,
  bandKey: string,
): Record<string, unknown> {
  return {
    [IF.Title]: draft.title.trim(),
    [IF.BandKey]: bandKey.trim(),
    [IF.ActionKey]: draft.actionKey.trim(),
    [IF.ItemStatus]: 'Enabled',
    [IF.ActionDescription]: optionalString(draft.description),
    [IF.Href]: draft.href.trim(),
    [IF.IconKey]: optionalString(draft.iconKey),
    [IF.BadgeLabel]: optionalString(draft.badgeLabel),
    [IF.BadgeVariant]: draft.badgeVariant,
    [IF.Priority]: draft.priority,
    [IF.GroupKey]: optionalString(draft.groupKey),
    [IF.GroupTitle]: optionalString(draft.groupTitle),
    [IF.SortOrder]: draft.sortOrder,
    [IF.OverflowOnly]: draft.overflowOnly,
    [IF.MobilePriority]: draft.mobilePriority,
    [IF.AudienceMode]: draft.audienceMode,
    [IF.AudienceKeys]: draft.audienceKeys.length > 0 ? draft.audienceKeys.join('\n') : null,
    [IF.IsExternal]: draft.isExternal,
    [IF.OpenInNewTab]: draft.openInNewTab,
    [IF.VisibleDesktop]: draft.visibleDesktop,
    [IF.VisibleLaptop]: draft.visibleLaptop,
    [IF.VisibleTabletLandscape]: draft.visibleTabletLandscape,
    [IF.VisibleTabletPortrait]: draft.visibleTabletPortrait,
    [IF.VisiblePhone]: draft.visiblePhone,
    [IF.StartsAtUtc]: optionalString(draft.startsAtUtc),
    [IF.EndsAtUtc]: optionalString(draft.endsAtUtc),
    [IF.AdminNotes]: null,
  };
}

/* ── Config writer ───────────────────────────────────────────────── */

export async function savePriorityRailBandConfig(
  siteUrl: string,
  configId: number | undefined,
  draft: PriorityActionsConfigDraft,
): Promise<PriorityActionsWriteResult> {
  if (!siteUrl) {
    return { ok: false, error: 'No SharePoint site URL available for write.' };
  }
  if (!draft.title.trim()) {
    return { ok: false, error: 'Config name is required.' };
  }

  const fields = mapConfigDraftToFields(draft);

  try {
    const digest = await fetchRequestDigest(siteUrl);

    if (typeof configId === 'number') {
      const mergeUrl = `${configListEndpoint(siteUrl)}(${configId})`;
      const response = await fetch(mergeUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
          'X-HTTP-Method': 'MERGE',
          'If-Match': '*',
        },
        body: JSON.stringify(fields),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return { ok: false, error: `Config MERGE failed (${response.status}). ${detail.slice(0, 240)}`.trim() };
      }
      invalidatePriorityActionsCache();
      return { ok: true, itemId: configId };
    }

    const response = await fetch(configListEndpoint(siteUrl), {
      method: 'POST',
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'X-RequestDigest': digest,
      },
      body: JSON.stringify(fields),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { ok: false, error: `Config POST failed (${response.status}). ${detail.slice(0, 240)}`.trim() };
    }
    const created = (await response.json()) as { Id?: number };
    invalidatePriorityActionsCache();
    return { ok: true, itemId: typeof created.Id === 'number' ? created.Id : -1 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown config write failure.' };
  }
}

/* ── Item writer ─────────────────────────────────────────────────── */

export async function savePriorityRailItem(
  siteUrl: string,
  itemId: number | undefined,
  draft: PriorityActionsItemDraft,
  bandKey: string,
): Promise<PriorityActionsWriteResult> {
  if (!siteUrl) {
    return { ok: false, error: 'No SharePoint site URL available for write.' };
  }
  if (!draft.title.trim() || !draft.href.trim()) {
    return { ok: false, error: 'Title and URL are required.' };
  }

  const fields = mapItemDraftToFields(draft, bandKey);

  try {
    const digest = await fetchRequestDigest(siteUrl);

    if (typeof itemId === 'number') {
      const mergeUrl = `${itemsListEndpoint(siteUrl)}(${itemId})`;
      const response = await fetch(mergeUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
          'X-HTTP-Method': 'MERGE',
          'If-Match': '*',
        },
        body: JSON.stringify(fields),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return { ok: false, error: `Item MERGE failed (${response.status}). ${detail.slice(0, 240)}`.trim() };
      }
      invalidatePriorityActionsCache();
      return { ok: true, itemId };
    }

    const response = await fetch(itemsListEndpoint(siteUrl), {
      method: 'POST',
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'X-RequestDigest': digest,
      },
      body: JSON.stringify(fields),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { ok: false, error: `Item POST failed (${response.status}). ${detail.slice(0, 240)}`.trim() };
    }
    const created = (await response.json()) as { Id?: number };
    invalidatePriorityActionsCache();
    return { ok: true, itemId: typeof created.Id === 'number' ? created.Id : -1 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown item write failure.' };
  }
}

/* ── Batch item save ─────────────────────────────────────────────── */

export async function savePriorityRailItems(
  siteUrl: string,
  items: Array<{ itemId: number | undefined; draft: PriorityActionsItemDraft }>,
  bandKey: string,
): Promise<PriorityActionsWriteResult[]> {
  const results: PriorityActionsWriteResult[] = [];
  for (const { itemId, draft } of items) {
    results.push(await savePriorityRailItem(siteUrl, itemId, draft, bandKey));
  }
  return results;
}

/* ── Reorder ─────────────────────────────────────────────────────── */

export async function reorderPriorityRailItems(
  siteUrl: string,
  orderedItemIds: Array<{ itemId: number; sortOrder: number }>,
): Promise<PriorityActionsWriteResult[]> {
  if (!siteUrl) {
    return [{ ok: false, error: 'No SharePoint site URL available for write.' }];
  }

  const results: PriorityActionsWriteResult[] = [];

  try {
    const digest = await fetchRequestDigest(siteUrl);

    for (const { itemId, sortOrder } of orderedItemIds) {
      const mergeUrl = `${itemsListEndpoint(siteUrl)}(${itemId})`;
      const response = await fetch(mergeUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
          'X-HTTP-Method': 'MERGE',
          'If-Match': '*',
        },
        body: JSON.stringify({ [IF.SortOrder]: sortOrder }),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        results.push({ ok: false, error: `Reorder MERGE failed for item ${itemId} (${response.status}). ${detail.slice(0, 240)}`.trim() });
      } else {
        results.push({ ok: true, itemId });
      }
    }

    invalidatePriorityActionsCache();
  } catch (err) {
    results.push({ ok: false, error: err instanceof Error ? err.message : 'Unknown reorder failure.' });
  }

  return results;
}

/* ── Archive ─────────────────────────────────────────────────────── */

export async function archivePriorityRailItem(
  siteUrl: string,
  itemId: number,
): Promise<PriorityActionsWriteResult> {
  if (!siteUrl) {
    return { ok: false, error: 'No SharePoint site URL available for write.' };
  }

  try {
    const digest = await fetchRequestDigest(siteUrl);
    const mergeUrl = `${itemsListEndpoint(siteUrl)}(${itemId})`;
    const response = await fetch(mergeUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'X-RequestDigest': digest,
        'X-HTTP-Method': 'MERGE',
        'If-Match': '*',
      },
      body: JSON.stringify({ [IF.ItemStatus]: 'Archived' }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { ok: false, error: `Archive MERGE failed (${response.status}). ${detail.slice(0, 240)}`.trim() };
    }
    invalidatePriorityActionsCache();
    return { ok: true, itemId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown archive failure.' };
  }
}

/* ── Command dispatcher ──────────────────────────────────────────── */

export async function executePriorityActionsCommand(
  siteUrl: string,
  command: PriorityActionsWriteCommand,
): Promise<PriorityActionsWriteResult> {
  switch (command.type) {
    case 'create-item':
      return savePriorityRailItem(siteUrl, undefined, command.draft, command.bandKey);
    case 'update-item':
      return savePriorityRailItem(siteUrl, command.itemId, command.draft as PriorityActionsItemDraft, command.bandKey);
    case 'archive-item':
      return archivePriorityRailItem(siteUrl, command.itemId);
    case 'update-config':
      return savePriorityRailBandConfig(siteUrl, command.configId, command.draft as PriorityActionsConfigDraft);
  }
}
