import type { HomepageLauncherDeviceClass } from './types.js';

export const HOMEPAGE_LAUNCHER_SURFACE_ID = 'homepage-launcher';
export const HOMEPAGE_LAUNCHER_VERSION = '1.1.74.0';
export const HOMEPAGE_LAUNCHER_HANDHELD_MODE_RULE =
  'phone-or-short-height-single-entry-all-tools' as const;

export const HOMEPAGE_LAUNCHER_VISIBLE_COUNT: Record<HomepageLauncherDeviceClass, number> = {
  ultrawide: 8,
  desktop: 7,
  'tablet-landscape': 5,
  'tablet-portrait': 4,
  phone: 3,
};
