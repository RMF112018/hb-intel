/**
 * HbcHomepageLauncher — surface constants.
 *
 * `HBC_HOMEPAGE_LAUNCHER_VERSION` is pinned to the `hb-intel-homepage.sppkg`
 * manifest / package-solution version so the hosted DOM can be inspected
 * directly to prove the deployed package matches the intended build.
 * Bump this in lockstep with `apps/hb-homepage/config/package-solution.json`.
 */
export const HBC_HOMEPAGE_LAUNCHER_VERSION = '1.1.30.0';
export const HBC_HOMEPAGE_LAUNCHER_SURFACE_ID = 'homepage-launcher';

/** Visible primary-chip count per device class. Binding per doctrine. */
export const HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT: Record<
  'ultrawide' | 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'phone',
  number
> = {
  ultrawide: 6,
  desktop: 5,
  'tablet-landscape': 4,
  'tablet-portrait': 4,
  phone: 3,
};
