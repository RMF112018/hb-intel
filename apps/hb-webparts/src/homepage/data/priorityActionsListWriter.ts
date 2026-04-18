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
import {
  isGovernedPriorityIconKey,
  isNonIncreasingCaps,
  isValidBreakpointCap,
  normalizeActionKey,
  normalizeAudienceKeys,
  normalizeAudienceMode,
  normalizeBreakpointCap,
  normalizeGroupFields,
  normalizeIconKey,
  normalizeOptionalText,
  normalizeRequiredText,
  parseUtcDate,
} from './priorityActionsGovernance.js';
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

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

interface NormalizedConfigDraft extends PriorityActionsConfigDraft {}
interface NormalizedItemDraft extends PriorityActionsItemDraft {}

function normalizeConfigDraftForWrite(draft: PriorityActionsConfigDraft): NormalizedConfigDraft {
  return {
    ...draft,
    title: normalizeRequiredText(draft.title),
    bandKey: normalizeRequiredText(draft.bandKey),
    headingText: normalizeOptionalText(draft.headingText),
    overflowLabel: normalizeRequiredText(draft.overflowLabel),
    adminNotes: normalizeOptionalText(draft.adminNotes),
    maxVisibleDesktop: normalizeBreakpointCap(draft.maxVisibleDesktop, 5),
    maxVisibleLaptop: normalizeBreakpointCap(draft.maxVisibleLaptop, 5),
    maxVisibleTabletLandscape: normalizeBreakpointCap(draft.maxVisibleTabletLandscape, 4),
    maxVisibleTabletPortrait: normalizeBreakpointCap(draft.maxVisibleTabletPortrait, 4),
    maxVisiblePhone: normalizeBreakpointCap(draft.maxVisiblePhone, 4),
  };
}

function validateConfigWriteCandidate(draft: PriorityActionsConfigDraft): string | undefined {
  if (!draft.title.trim()) {
    return 'Config name is required.';
  }

  if (!draft.bandKey.trim()) {
    return 'Band key is required.';
  }

  if (!draft.overflowLabel.trim()) {
    return 'Overflow label is required.';
  }

  const caps = [
    draft.maxVisibleDesktop,
    draft.maxVisibleLaptop,
    draft.maxVisibleTabletLandscape,
    draft.maxVisibleTabletPortrait,
    draft.maxVisiblePhone,
  ];

  if (!caps.every(isValidBreakpointCap)) {
    return 'All breakpoint caps must be integers from 1 to 20.';
  }

  if (!isNonIncreasingCaps(caps)) {
    return 'Breakpoint caps must be non-increasing from desktop to phone.';
  }

  return undefined;
}

function normalizeItemDraftForWrite(draft: PriorityActionsItemDraft): { draft?: NormalizedItemDraft; error?: string } {
  const title = normalizeRequiredText(draft.title);
  const href = normalizeRequiredText(draft.href);
  const actionKey = normalizeActionKey(draft.actionKey);

  if (!title || !href) {
    return { error: 'Title and URL are required.' };
  }

  if (!actionKey) {
    return { error: 'Action key is required for stable identity.' };
  }

  if (!isGovernedPriorityIconKey(draft.iconKey)) {
    return { error: 'Icon key must use a governed Priority Actions icon value.' };
  }

  const start = parseUtcDate(draft.startsAtUtc);
  const end = parseUtcDate(draft.endsAtUtc);
  if (draft.startsAtUtc.trim().length > 0 && !start) {
    return { error: 'Start date must be a valid date/time.' };
  }
  if (draft.endsAtUtc.trim().length > 0 && !end) {
    return { error: 'End date must be a valid date/time.' };
  }
  if (start && end && start >= end) {
    return { error: 'Start date must be before end date.' };
  }

  const normalizedAudienceKeys = normalizeAudienceKeys(draft.audienceKeys);
  const normalizedAudience = normalizeAudienceMode(draft.audienceMode, normalizedAudienceKeys);
  if (normalizedAudience.mode !== 'all' && normalizedAudience.audienceKeys.length === 0) {
    return { error: `Audience mode "${normalizedAudience.mode}" requires at least one audience key.` };
  }

  const group = normalizeGroupFields(draft.groupKey, draft.groupTitle);
  if ((Boolean(draft.groupKey.trim()) || Boolean(draft.groupTitle.trim())) && (!group.groupKey || !group.groupTitle)) {
    return { error: 'Group key and group title must be set together or both left blank.' };
  }

  if (!draft.visibleDesktop
    && !draft.visibleLaptop
    && !draft.visibleTabletLandscape
    && !draft.visibleTabletPortrait
    && !draft.visiblePhone) {
    return { error: 'At least one device visibility flag must be enabled.' };
  }

  return {
    draft: {
      ...draft,
      title,
      href,
      actionKey,
      description: normalizeOptionalText(draft.description),
      iconKey: normalizeIconKey(draft.iconKey),
      badgeLabel: normalizeOptionalText(draft.badgeLabel),
      groupKey: group.groupKey,
      groupTitle: group.groupTitle,
      sortOrder: Math.max(0, Math.round(draft.sortOrder)),
      mobilePriority: Math.max(0, Math.round(draft.mobilePriority)),
      audienceMode: normalizedAudience.mode,
      audienceKeys: normalizedAudience.audienceKeys,
      startsAtUtc: start ? start.toISOString() : '',
      endsAtUtc: end ? end.toISOString() : '',
    },
  };
}

async function fetchActiveConfigRowIdsForBand(siteUrl: string, bandKey: string): Promise<number[]> {
  const escapedBandKey = escapeODataString(bandKey);
  const url =
    `${configListEndpoint(siteUrl)}` +
    `?$select=${CF.ID}` +
    `&$filter=${CF.BandKey} eq '${escapedBandKey}' and ${CF.Enabled} eq 1 and ${CF.IsActive} eq 1` +
    '&$top=25';

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json;odata=nometadata',
    },
  });

  if (!response.ok) {
    throw new Error(`Active-config check failed (${response.status}).`);
  }

  const body = (await response.json()) as { value?: Array<{ ID?: unknown }> };
  const rows = Array.isArray(body.value) ? body.value : [];
  return rows
    .map((row) => (typeof row.ID === 'number' ? row.ID : -1))
    .filter((id) => id >= 0);
}

/* ── Field mapping: config ───────────────────────────────────────── */

export function mapConfigDraftToFields(draft: PriorityActionsConfigDraft): Record<string, unknown> {
  const normalized = normalizeConfigDraftForWrite(draft);

  return {
    [CF.Title]: normalized.title,
    [CF.BandKey]: normalized.bandKey,
    [CF.Enabled]: normalized.enabled,
    [CF.IsActive]: normalized.isActive,
    [CF.HeadingText]: optionalString(normalized.headingText),
    [CF.OverflowLabel]: normalized.overflowLabel,
    [CF.ShowHeading]: normalized.showHeading,
    [CF.ShowBadges]: normalized.showBadges,
    [CF.DesktopLayoutMode]: normalized.desktopLayoutMode,
    [CF.TabletLayoutMode]: normalized.tabletLayoutMode,
    [CF.MobileLayoutMode]: normalized.mobileLayoutMode,
    [CF.MaxVisibleDesktop]: normalized.maxVisibleDesktop,
    [CF.MaxVisibleLaptop]: normalized.maxVisibleLaptop,
    [CF.MaxVisibleTabletLandscape]: normalized.maxVisibleTabletLandscape,
    [CF.MaxVisibleTabletPortrait]: normalized.maxVisibleTabletPortrait,
    [CF.MaxVisiblePhone]: normalized.maxVisiblePhone,
    [CF.OpenExternalInNewTabByDefault]: normalized.openExternalInNewTabByDefault,
    [CF.AdminNotes]: optionalString(normalized.adminNotes),
  };
}

/* ── Field mapping: item ─────────────────────────────────────────── */

export function mapItemDraftToFields(
  draft: PriorityActionsItemDraft,
  bandKey: string,
): Record<string, unknown> {
  const normalizedAudienceKeys = normalizeAudienceKeys(draft.audienceKeys);
  const normalizedAudience = normalizeAudienceMode(draft.audienceMode, normalizedAudienceKeys);
  const normalizedGroup = normalizeGroupFields(draft.groupKey, draft.groupTitle);
  const normalizedIcon = normalizeIconKey(draft.iconKey);
  const normalizedStartsAt = parseUtcDate(draft.startsAtUtc);
  const normalizedEndsAt = parseUtcDate(draft.endsAtUtc);

  return {
    [IF.Title]: normalizeRequiredText(draft.title),
    [IF.BandKey]: bandKey.trim(),
    [IF.ActionKey]: normalizeActionKey(draft.actionKey),
    [IF.ItemStatus]: 'Enabled',
    [IF.ActionDescription]: optionalString(normalizeOptionalText(draft.description)),
    [IF.Href]: normalizeRequiredText(draft.href),
    [IF.IconKey]: optionalString(normalizedIcon),
    [IF.BadgeLabel]: optionalString(normalizeOptionalText(draft.badgeLabel)),
    [IF.BadgeVariant]: draft.badgeVariant,
    [IF.Priority]: draft.priority,
    [IF.GroupKey]: optionalString(normalizedGroup.groupKey),
    [IF.GroupTitle]: optionalString(normalizedGroup.groupTitle),
    [IF.SortOrder]: Math.max(0, Math.round(draft.sortOrder)),
    [IF.OverflowOnly]: draft.overflowOnly,
    [IF.MobilePriority]: Math.max(0, Math.round(draft.mobilePriority)),
    [IF.AudienceMode]: normalizedAudience.mode,
    [IF.AudienceKeys]: normalizedAudience.audienceKeys.length > 0 ? normalizedAudience.audienceKeys.join('\n') : null,
    [IF.IsExternal]: draft.isExternal,
    [IF.OpenInNewTab]: draft.openInNewTab,
    [IF.VisibleDesktop]: draft.visibleDesktop,
    [IF.VisibleLaptop]: draft.visibleLaptop,
    [IF.VisibleTabletLandscape]: draft.visibleTabletLandscape,
    [IF.VisibleTabletPortrait]: draft.visibleTabletPortrait,
    [IF.VisiblePhone]: draft.visiblePhone,
    [IF.StartsAtUtc]: normalizedStartsAt ? normalizedStartsAt.toISOString() : null,
    [IF.EndsAtUtc]: normalizedEndsAt ? normalizedEndsAt.toISOString() : null,
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

  const normalized = normalizeConfigDraftForWrite(draft);
  const validationError = validateConfigWriteCandidate(normalized);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  try {
    if (normalized.enabled && normalized.isActive) {
      const activeConfigIds = await fetchActiveConfigRowIdsForBand(siteUrl, normalized.bandKey);
      const conflicts = typeof configId === 'number'
        ? activeConfigIds.filter((id) => id !== configId)
        : activeConfigIds;
      if (conflicts.length > 0) {
        return { ok: false, error: 'Multiple active config rows exist for this band. Resolve duplicates before saving.' };
      }
    }

    const fields = mapConfigDraftToFields(normalized);
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

  const normalizedResult = normalizeItemDraftForWrite(draft);
  if (!normalizedResult.draft) {
    return { ok: false, error: normalizedResult.error ?? 'Invalid action draft.' };
  }

  if (!bandKey.trim()) {
    return { ok: false, error: 'Band key is required.' };
  }

  const fields = mapItemDraftToFields(normalizedResult.draft, bandKey);

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
        body: JSON.stringify({ [IF.SortOrder]: Math.max(0, Math.round(sortOrder)) }),
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
