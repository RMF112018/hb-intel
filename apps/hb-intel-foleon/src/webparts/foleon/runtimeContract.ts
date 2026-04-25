/**
 * Stable webpart identity for the Foleon surface.
 *
 * SPFx packaging pins this in the manifest's `id`; mount binds against
 * the same value so a mismatch throws loudly at boot.
 */
export const FOLEON_WEBPART_ID = '2160edb3-675e-4451-92bb-8345f9d1c71e' as const;

export const FOLEON_PACKAGE_VERSION = '1.0.16.0' as const;
