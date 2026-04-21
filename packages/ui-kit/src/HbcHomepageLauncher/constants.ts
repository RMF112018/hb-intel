/**
 * HbcHomepageLauncher — surface constants.
 *
 * `HBC_HOMEPAGE_LAUNCHER_VERSION` is pinned to the `hb-intel-homepage.sppkg`
 * manifest / package-solution version so the hosted DOM can be inspected
 * directly to prove the deployed package matches the intended build.
 * Bump this in lockstep with `apps/hb-homepage/config/package-solution.json`.
 */
export const HBC_HOMEPAGE_LAUNCHER_VERSION = '1.1.66.0';
export const HBC_HOMEPAGE_LAUNCHER_SURFACE_ID = 'homepage-launcher';
export const HBC_HOMEPAGE_LAUNCHER_HANDHELD_MODE_RULE =
  'phone-or-short-height-single-entry-all-tools' as const;

/**
 * Visible primary-tile count per device class.
 *
 * Standard desktop hosted width must fit at least 7 primary tiles + the
 * `More Tools` tile (8 cells total). The launcher tile size ramp in
 * `homepage-launcher.module.css` is sized to keep 8 desktop cells inside
 * a 1180–1280-px SP-hosted content width without overflow.
 */
export const HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT: Record<
  'ultrawide' | 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'phone',
  number
> = {
  ultrawide: 8,
  desktop: 7,
  'tablet-landscape': 5,
  'tablet-portrait': 4,
  phone: 3,
};
