/**
 * SharePoint list read seam for the Hero Banner Config list.
 *
 * Fetches authored rows from the canonical `Hero Banner Config` list
 * at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`,
 * filters to `Enabled === true`, picks the most recently modified
 * row, and maps it into a partial {@link HbHeroBannerConfig}. The
 * presentational Hero Banner surface (`HbHeroBanner`) then runs the
 * result through `normalizeHeroBannerConfig` so it never touches raw
 * SharePoint fields directly.
 *
 * Fallback: when the list query fails or returns no enabled row, the
 * function returns `undefined`, which lets the consumer fall back to
 * manifest/property-pane config exactly like the other homepage data
 * seams (see `useProjectSpotlightData`, `useToolLauncherData`).
 */
import type { HbHeroBannerConfig } from '../webparts/topBandContracts.js';
import type { HomepageCtaLink, HomepageMediaSlot } from '../models/contentModels.js';
import {
  HERO_BANNER_LIST_FIELDS,
  HERO_BANNER_LIST_TITLE,
  type RawHeroBannerListItem,
} from './heroBannerListDescriptor.js';

/* ── Typed helpers ───────────────────────────────────────────────── */

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readBool(value: unknown): boolean {
  // SharePoint returns booleans as true/false, but list REST can also
  // return the string "1"/"0" or "true"/"false" depending on
  // authoring route. Be tolerant of both.
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return false;
}

function readCta(
  labelRaw: unknown,
  urlRaw: unknown,
  openInNewTabRaw: unknown,
): HomepageCtaLink | undefined {
  const label = readString(labelRaw);
  const href = readString(urlRaw);
  if (!label || !href) return undefined;
  return {
    label,
    href,
    openInNewTab: readBool(openInNewTabRaw) || undefined,
  };
}

function readBackground(urlRaw: unknown, altFallback: string): HomepageMediaSlot | undefined {
  const src = readString(urlRaw);
  if (!src) return undefined;
  return { src, alt: altFallback };
}

/* ── Row mapping ────────────────────────────────────────────────── */

/**
 * Translate a raw SharePoint row into the partial config shape the
 * public surface expects. Exported so unit tests can exercise the
 * contract mapping deterministically without a live list.
 */
export function mapHeroBannerListRow(
  row: RawHeroBannerListItem,
): Partial<HbHeroBannerConfig> | undefined {
  const enabled = readBool(row.Enabled);
  if (!enabled) return undefined;

  const headline = readString(row.Title);
  if (!headline) return undefined;

  return {
    headline,
    message: readString(row.Message),
    eyebrow: readString(row.Eyebrow),
    metadata: readString(row.MetadataLine),
    background: readBackground(row.BackgroundImageUrl, headline),
    cta: readCta(row.PrimaryCtaLabel, row.PrimaryCtaUrl, row.PrimaryCtaOpenInNewTab),
    secondaryCta: readCta(
      row.SecondaryCtaLabel,
      row.SecondaryCtaUrl,
      row.SecondaryCtaOpenInNewTab,
    ),
    enabled: true,
  };
}

/**
 * Pick the effective row from the raw list response. Enabled rows
 * are sorted newest-first by `Modified` and the first is returned.
 * Returns undefined when no enabled row exists.
 */
export function selectEffectiveHeroBannerRow(
  rows: readonly RawHeroBannerListItem[],
): Partial<HbHeroBannerConfig> | undefined {
  const candidates = rows
    .filter((row) => readBool(row.Enabled) && readString(row.Title))
    .slice()
    .sort((a, b) => {
      const am = typeof a.Modified === 'string' ? a.Modified : '';
      const bm = typeof b.Modified === 'string' ? b.Modified : '';
      return bm.localeCompare(am);
    });
  for (const row of candidates) {
    const mapped = mapHeroBannerListRow(row);
    if (mapped) return mapped;
  }
  return undefined;
}

/* ── Network ────────────────────────────────────────────────────── */

const SELECT_FIELDS = [
  HERO_BANNER_LIST_FIELDS.Title,
  HERO_BANNER_LIST_FIELDS.Message,
  HERO_BANNER_LIST_FIELDS.Eyebrow,
  HERO_BANNER_LIST_FIELDS.MetadataLine,
  HERO_BANNER_LIST_FIELDS.BackgroundImageUrl,
  HERO_BANNER_LIST_FIELDS.PrimaryCtaLabel,
  HERO_BANNER_LIST_FIELDS.PrimaryCtaUrl,
  HERO_BANNER_LIST_FIELDS.PrimaryCtaOpenInNewTab,
  HERO_BANNER_LIST_FIELDS.SecondaryCtaLabel,
  HERO_BANNER_LIST_FIELDS.SecondaryCtaUrl,
  HERO_BANNER_LIST_FIELDS.SecondaryCtaOpenInNewTab,
  HERO_BANNER_LIST_FIELDS.Enabled,
  HERO_BANNER_LIST_FIELDS.Modified,
].join(',');

/**
 * Fetch the effective Hero Banner config from the canonical list.
 * Returns `undefined` if no enabled row exists; throws on network
 * or parse failures so the caller can treat that as the fallback
 * trigger separately from "hosted config intentionally disabled".
 */
export async function fetchHeroBannerListConfig(
  siteUrl: string,
): Promise<Partial<HbHeroBannerConfig> | undefined> {
  const url =
    `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(HERO_BANNER_LIST_TITLE)}')/items` +
    `?$select=${SELECT_FIELDS}` +
    `&$filter=${HERO_BANNER_LIST_FIELDS.Enabled} eq 1` +
    `&$orderby=${HERO_BANNER_LIST_FIELDS.Modified} desc` +
    `&$top=5`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });

  if (!response.ok) {
    throw new Error(
      `Hero Banner list request failed: ${response.status} ${response.statusText}`,
    );
  }

  let body: { value?: unknown };
  try {
    body = (await response.json()) as { value?: unknown };
  } catch {
    throw new Error('Hero Banner list response was not valid JSON');
  }

  const rawValue = body.value;
  const rows: RawHeroBannerListItem[] = Array.isArray(rawValue)
    ? (rawValue as RawHeroBannerListItem[])
    : [];

  return selectEffectiveHeroBannerRow(rows);
}
