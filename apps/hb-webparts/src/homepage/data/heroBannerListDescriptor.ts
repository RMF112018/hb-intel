/**
 * Hero Banner Config — canonical SharePoint list descriptor.
 *
 * Single source of truth for the `Hero Banner Config` list name and
 * field internal names, shared by the public read seam
 * (`heroBannerListSource`) and the forthcoming Hero Banner Admin app.
 * Keeping field names in one module keeps the read and write paths in
 * lockstep and eliminates ad-hoc SharePoint field references inside
 * the presentational surface.
 *
 * Hosting: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
 *
 * List shape: a small governance list holding one or more authored
 * rows. The public homepage reads the most recently modified row
 * where `Enabled === true`. The admin app authors rows; in the
 * default operating model only one row is enabled at a time.
 */

export const HERO_BANNER_LIST_TITLE = 'Hero Banner Config';

/**
 * Map semantic field names (used by contracts) to SharePoint internal
 * column names. Internal names are PascalCase — not `field_N` — so
 * both the admin app and the read seam can author/query the list
 * with a single stable vocabulary.
 */
export const HERO_BANNER_LIST_FIELDS = {
  Title: 'Title',
  Message: 'Message',
  Eyebrow: 'Eyebrow',
  MetadataLine: 'MetadataLine',
  BackgroundImageUrl: 'BackgroundImageUrl',
  PrimaryCtaLabel: 'PrimaryCtaLabel',
  PrimaryCtaUrl: 'PrimaryCtaUrl',
  PrimaryCtaOpenInNewTab: 'PrimaryCtaOpenInNewTab',
  SecondaryCtaLabel: 'SecondaryCtaLabel',
  SecondaryCtaUrl: 'SecondaryCtaUrl',
  SecondaryCtaOpenInNewTab: 'SecondaryCtaOpenInNewTab',
  Enabled: 'Enabled',
  Modified: 'Modified',
} as const;

export type HeroBannerListFieldKey = keyof typeof HERO_BANNER_LIST_FIELDS;

/**
 * Raw row shape as returned by the SharePoint REST API using the
 * internal names above. All fields are untrusted until passed through
 * `mapHeroBannerListRow` in `heroBannerListSource`.
 */
export interface RawHeroBannerListItem {
  Title?: unknown;
  Message?: unknown;
  Eyebrow?: unknown;
  MetadataLine?: unknown;
  BackgroundImageUrl?: unknown;
  PrimaryCtaLabel?: unknown;
  PrimaryCtaUrl?: unknown;
  PrimaryCtaOpenInNewTab?: unknown;
  SecondaryCtaLabel?: unknown;
  SecondaryCtaUrl?: unknown;
  SecondaryCtaOpenInNewTab?: unknown;
  Enabled?: unknown;
  Modified?: unknown;
}
