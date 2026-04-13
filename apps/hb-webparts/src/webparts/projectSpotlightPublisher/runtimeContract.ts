/**
 * Single source of truth for the Project Spotlight Publisher webpart ID.
 *
 * SPFx packaging pins this in the manifest's `id`; the mount map keys
 * against the same value so a mismatch throws loudly at boot.
 */
export const PROJECT_SPOTLIGHT_PUBLISHER_WEBPART_ID =
  '1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10' as const;
