/**
 * @hbc/ui-kit/branding — Shared Brand Asset Registry
 *
 * Canonical brand assets for the HB Intel platform. Consuming apps import
 * from `@hbc/ui-kit/branding` and their bundler (Vite) resolves the image
 * files to hashed URLs at build time.
 *
 * Only stable, reusable corporate brand assets belong here. Homepage-specific
 * editorial imagery and rotating content should remain app-local.
 */

import gritLogo from './assets/grit-logo.jpg';
import hbIconBlueBg from './assets/hb-icon-blue-bg.jpg';
import hbLogoIcon from './assets/hb-logo-icon.jpg';
import hedrickLogo from './assets/hedrick-logo.png';

export { gritLogo, hbIconBlueBg, hbLogoIcon, hedrickLogo };

/**
 * Branded registry object for iteration and lookup patterns.
 * Keys are camelCase constant names; values resolve to asset paths at build time.
 */
export const brandAssets = {
  gritLogo,
  hbIconBlueBg,
  hbLogoIcon,
  hedrickLogo,
} as const;

export type BrandAssetKey = keyof typeof brandAssets;
