/**
 * SharePoint write seam for the `Hero Banner Config` list.
 *
 * Owns the authoritative upsert path consumed by the Hero Banner
 * Admin app. The public homepage reader (`heroBannerListSource`) and
 * this writer share `heroBannerListDescriptor`, so field names cannot
 * drift between read and write. After a successful write, the
 * in-memory cache used by `useHeroBannerData` is invalidated so the
 * next public render sees the new values.
 *
 * Operating model:
 *   - One row is intended to be active at any time (Enabled=true).
 *   - When an enabled row exists, it is MERGE-updated in place.
 *   - When no enabled row exists, a new item is POSTed with
 *     Enabled=true so the public read picks it up immediately.
 */
import { fetchRequestDigest } from '@hbc/sharepoint-platform';
import {
  HERO_BANNER_LIST_FIELDS,
  HERO_BANNER_LIST_TITLE,
  type RawHeroBannerListItem,
} from './heroBannerListDescriptor.js';
import { invalidateHeroBannerCache } from './useHeroBannerData.js';

export interface HeroBannerDraft {
  headline: string;
  message?: string;
  eyebrow?: string;
  metadata?: string;
  backgroundImageUrl?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  primaryCtaOpenInNewTab?: boolean;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  secondaryCtaOpenInNewTab?: boolean;
  enabled: boolean;
}

export type HeroBannerSaveResult =
  | { ok: true; itemId: number }
  | { ok: false; error: string };

function optionalString(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

/**
 * Map a typed admin draft into the raw SharePoint field bag used by
 * both POST (new item) and MERGE (update item). SharePoint treats
 * missing keys as "don't change"; we emit explicit `null` so MERGE
 * clears fields the admin cleared in the form.
 */
export function mapDraftToListFields(draft: HeroBannerDraft): Record<string, unknown> {
  return {
    [HERO_BANNER_LIST_FIELDS.Title]: draft.headline.trim(),
    [HERO_BANNER_LIST_FIELDS.Message]: optionalString(draft.message),
    [HERO_BANNER_LIST_FIELDS.Eyebrow]: optionalString(draft.eyebrow),
    [HERO_BANNER_LIST_FIELDS.MetadataLine]: optionalString(draft.metadata),
    [HERO_BANNER_LIST_FIELDS.BackgroundImageUrl]: optionalString(draft.backgroundImageUrl),
    [HERO_BANNER_LIST_FIELDS.PrimaryCtaLabel]: optionalString(draft.primaryCtaLabel),
    [HERO_BANNER_LIST_FIELDS.PrimaryCtaUrl]: optionalString(draft.primaryCtaUrl),
    [HERO_BANNER_LIST_FIELDS.PrimaryCtaOpenInNewTab]: Boolean(draft.primaryCtaOpenInNewTab),
    [HERO_BANNER_LIST_FIELDS.SecondaryCtaLabel]: optionalString(draft.secondaryCtaLabel),
    [HERO_BANNER_LIST_FIELDS.SecondaryCtaUrl]: optionalString(draft.secondaryCtaUrl),
    [HERO_BANNER_LIST_FIELDS.SecondaryCtaOpenInNewTab]: Boolean(draft.secondaryCtaOpenInNewTab),
    [HERO_BANNER_LIST_FIELDS.Enabled]: draft.enabled,
  };
}

function listItemsEndpoint(siteUrl: string): string {
  return `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(HERO_BANNER_LIST_TITLE)}')/items`;
}

async function findEnabledItemId(siteUrl: string): Promise<number | undefined> {
  const url =
    `${listItemsEndpoint(siteUrl)}` +
    `?$select=Id,${HERO_BANNER_LIST_FIELDS.Enabled},${HERO_BANNER_LIST_FIELDS.Modified}` +
    `&$filter=${HERO_BANNER_LIST_FIELDS.Enabled} eq 1` +
    `&$orderby=${HERO_BANNER_LIST_FIELDS.Modified} desc` +
    `&$top=1`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });
  if (!response.ok) {
    throw new Error(`Hero Banner lookup failed: ${response.status} ${response.statusText}`);
  }
  const body = (await response.json()) as { value?: Array<RawHeroBannerListItem & { Id?: number }> };
  const first = Array.isArray(body.value) ? body.value[0] : undefined;
  return typeof first?.Id === 'number' ? first.Id : undefined;
}

/**
 * Upsert the authoritative Hero Banner row.
 *
 * The admin draft is mapped once and sent either as a MERGE (existing
 * enabled row) or as a POST (new row). On success the public cache
 * is invalidated so the next homepage render re-reads the list.
 */
export async function saveHeroBannerConfig(
  siteUrl: string,
  draft: HeroBannerDraft,
): Promise<HeroBannerSaveResult> {
  if (!siteUrl) {
    return { ok: false, error: 'No SharePoint site URL available for write.' };
  }
  if (!draft.headline.trim()) {
    return { ok: false, error: 'Headline is required.' };
  }

  const fields = mapDraftToListFields(draft);

  try {
    const digest = await fetchRequestDigest(siteUrl);
    const existingId = await findEnabledItemId(siteUrl);

    if (typeof existingId === 'number') {
      const mergeUrl = `${listItemsEndpoint(siteUrl)}(${existingId})`;
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
        return {
          ok: false,
          error: `SharePoint rejected the MERGE (${response.status}). ${detail.slice(0, 240)}`.trim(),
        };
      }
      invalidateHeroBannerCache();
      return { ok: true, itemId: existingId };
    }

    const response = await fetch(listItemsEndpoint(siteUrl), {
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
      return {
        ok: false,
        error: `SharePoint rejected the POST (${response.status}). ${detail.slice(0, 240)}`.trim(),
      };
    }
    const created = (await response.json()) as { Id?: number };
    invalidateHeroBannerCache();
    return { ok: true, itemId: typeof created.Id === 'number' ? created.Id : -1 };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown write failure.',
    };
  }
}
