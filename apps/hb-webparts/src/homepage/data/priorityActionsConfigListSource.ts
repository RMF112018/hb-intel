/**
 * SharePoint list read seam for the Priority Actions Band Config list.
 *
 * Fetches authored config rows from the canonical list, resolves the
 * active row using the documented precedence rule, and maps it into a
 * {@link PriorityActionsConfigResolved} contract.
 *
 * Active-row resolution:
 *   BandKey match → Enabled=true → IsActive=true → newest Modified → highest ID
 *
 * Schema authority:
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md
 */
import type { PriorityActionsConfigResolved } from './priorityActionsContracts.js';
import type { DesktopLayoutMode, TabletLayoutMode, MobileLayoutMode } from './priorityActionsContracts.js';
import {
  PRIORITY_ACTIONS_CONFIG_FIELDS as F,
  PRIORITY_ACTIONS_CONFIG_LIST_TITLE,
  type RawPriorityActionsConfigRow,
} from './priorityActionsConfigListDescriptor.js';

/* ── Typed helpers ───────────────────────────────────────────────── */

function readString(value: unknown, fallback: string = ''): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function readBool(value: unknown, fallback: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const n = value.trim().toLowerCase();
    return n === 'true' || n === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
}

function readInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

const VALID_DESKTOP_LAYOUTS = new Set<DesktopLayoutMode>(['rail', 'segmented', 'hybrid']);
const VALID_TABLET_LAYOUTS = new Set<TabletLayoutMode>(['grid', 'rail', 'hybrid']);
const VALID_MOBILE_LAYOUTS = new Set<MobileLayoutMode>(['grid', 'scroll', 'sheet-trigger']);

function readDesktopLayout(value: unknown): DesktopLayoutMode {
  const s = readString(value).toLowerCase() as DesktopLayoutMode;
  return VALID_DESKTOP_LAYOUTS.has(s) ? s : 'rail';
}

function readTabletLayout(value: unknown): TabletLayoutMode {
  const s = readString(value).toLowerCase() as TabletLayoutMode;
  return VALID_TABLET_LAYOUTS.has(s) ? s : 'grid';
}

function readMobileLayout(value: unknown): MobileLayoutMode {
  const s = readString(value).toLowerCase() as MobileLayoutMode;
  return VALID_MOBILE_LAYOUTS.has(s) ? s : 'sheet-trigger';
}

/* ── Row mapping ────────────────────────────────────────────────── */

export function mapConfigRow(row: RawPriorityActionsConfigRow): PriorityActionsConfigResolved {
  return {
    id: readInt(row.ID, 0),
    title: readString(row.Title, 'Homepage Priority Actions'),
    bandKey: readString(row.BandKey, 'homepage-primary'),
    enabled: readBool(row.Enabled, true),
    isActive: readBool(row.IsActive, true),
    headingText: readString(row.HeadingText),
    overflowLabel: readString(row.OverflowLabel, 'More tools'),
    showHeading: readBool(row.ShowHeading),
    stickyAfterHero: readBool(row.StickyAfterHero),
    showBadges: readBool(row.ShowBadges, true),
    desktopLayoutMode: readDesktopLayout(row.DesktopLayoutMode),
    tabletLayoutMode: readTabletLayout(row.TabletLayoutMode),
    mobileLayoutMode: readMobileLayout(row.MobileLayoutMode),
    maxVisibleDesktop: readInt(row.MaxVisibleDesktop, 5),
    maxVisibleLaptop: readInt(row.MaxVisibleLaptop, 5),
    maxVisibleTabletLandscape: readInt(row.MaxVisibleTabletLandscape, 4),
    maxVisibleTabletPortrait: readInt(row.MaxVisibleTabletPortrait, 4),
    maxVisiblePhone: readInt(row.MaxVisiblePhone, 4),
    openExternalInNewTabByDefault: readBool(row.OpenExternalInNewTabByDefault, true),
    adminNotes: readString(row.AdminNotes),
    modified: readString(row.Modified),
  };
}

/**
 * Resolve the active config row from a set of candidates for a given
 * band key. Applies the documented precedence:
 *   BandKey match → Enabled=true → IsActive=true → newest Modified → highest ID
 */
export function resolveActiveConfig(
  rows: readonly RawPriorityActionsConfigRow[],
  bandKey: string = 'homepage-primary',
): PriorityActionsConfigResolved | undefined {
  const candidates = rows
    .filter((row) => {
      const key = readString(row.BandKey);
      return key === bandKey && readBool(row.Enabled) && readBool(row.IsActive);
    })
    .slice()
    .sort((a, b) => {
      const am = readString(a.Modified);
      const bm = readString(b.Modified);
      const dateCompare = bm.localeCompare(am);
      if (dateCompare !== 0) return dateCompare;
      return readInt(b.ID, 0) - readInt(a.ID, 0);
    });

  if (candidates.length === 0) return undefined;
  return mapConfigRow(candidates[0]);
}

/* ── Network ────────────────────────────────────────────────────── */

const SELECT_FIELDS = Object.values(F).join(',');

export async function fetchPriorityActionsConfig(
  siteUrl: string,
  bandKey: string = 'homepage-primary',
): Promise<PriorityActionsConfigResolved | undefined> {
  const url =
    `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(PRIORITY_ACTIONS_CONFIG_LIST_TITLE)}')/items` +
    `?$select=${SELECT_FIELDS}` +
    `&$filter=${F.Enabled} eq 1 and ${F.IsActive} eq 1` +
    `&$orderby=${F.Modified} desc` +
    `&$top=10`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });

  if (!response.ok) {
    throw new Error(
      `Priority Actions Config list request failed: ${response.status} ${response.statusText}`,
    );
  }

  let body: { value?: unknown };
  try {
    body = (await response.json()) as { value?: unknown };
  } catch {
    throw new Error('Priority Actions Config list response was not valid JSON');
  }

  const rows: RawPriorityActionsConfigRow[] = Array.isArray(body.value)
    ? (body.value as RawPriorityActionsConfigRow[])
    : [];

  return resolveActiveConfig(rows, bandKey);
}
