/**
 * Single source of truth for the Article Publisher webpart ID.
 *
 * SPFx packaging pins this in the manifest's `id`; the mount map keys
 * against the same value so a mismatch throws loudly at boot.
 *
 * This GUID is the stable deployment identity of the Article
 * Publisher on HBCentral and must not be changed. It originated under
 * the earlier Project Spotlight Publisher name and was preserved
 * across the rebrand so installed instances keep resolving — the
 * product identity is the current Article Publisher, the GUID is its
 * lineage.
 */
export const ARTICLE_PUBLISHER_WEBPART_ID =
  '1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10' as const;
