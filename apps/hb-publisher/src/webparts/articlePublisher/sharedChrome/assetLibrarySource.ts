/**
 * Asset-library search contract used by ImageAssetField's governed
 * acquisition flow. The Publisher ships the primitive + UX seam
 * here; the concrete tenant-safe lookup (SharePoint SiteAssets,
 * an HBCentral Images list, or a curated asset adapter) is wired
 * in by the SPFx mount boundary through the `searchAssets` prop.
 *
 * The shape mirrors the same pattern used by ProjectPicker's
 * `ProjectLookupSearchFn`: an async, optionally-cancellable
 * function that takes a query string and returns hydrated entries.
 *
 * When no `searchAssets` function is provided, consumers fall back
 * to a subordinate "Advanced: paste a custom URL" path — the URL
 * field is no longer the primary interaction.
 */

export interface AssetLookupEntry {
  /** Stable identifier for the asset (tenant list id, UUID, or URL hash). */
  readonly assetId: string;
  /** Absolute https URL the article row will persist. */
  readonly imageUrl: string;
  /** Editorial display name, rendered as the card title. */
  readonly title: string;
  /** Origin label ("Site Assets", "Brand Library", …). Optional. */
  readonly source?: string;
  /**
   * Suggested alt text for the asset when the library carries
   * curated descriptions. Consumers still surface alt-text as a
   * required field; this only seeds the input.
   */
  readonly suggestedAltText?: string;
}

export type AssetLibrarySearchFn = (
  query: string,
  signal?: AbortSignal,
) => Promise<AssetLookupEntry[]>;
