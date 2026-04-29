/**
 * @hbc/ui-kit/branding — Shared Brand Asset Registry
 *
 * Canonical brand assets for the HB Intel platform. Consuming apps import
 * from `@hbc/ui-kit/branding` and their bundler (Vite) resolves image assets
 * to build-time URLs.
 *
 * Stable, reusable corporate brand assets belong here. App-local editorial or
 * campaign imagery should remain outside this registry.
 */

import gritLogo from './assets/grit-logo.jpg';
import hbConstructionIcon from './assets/hb-construction-icon.png';
import hbConstructionIconWhite from './assets/hb-construction-icon-white.png';
import hbConstructionLogoCentered from './assets/hb-construction-logo-centered.png';
import hbConstructionLogoCenteredReverse from './assets/hb-construction-logo-centered-reverse.png';
import hbConstructionLogoLeft from './assets/hb-construction-logo-left.png';
import hbConstructionLogoLeftReverse from './assets/hb-construction-logo-left-reverse.png';
import hbDevelopmentLogo from './assets/hb-development-logo.png';
import hbDevelopmentLogoReverse from './assets/hb-development-logo-reverse.png';
import hbEnvironmentalIcon from './assets/hb-environmental-icon.png';
import hbEnvironmentalLogo from './assets/hb-environmental-logo.png';
import hbEnvironmentalLogoReverse from './assets/hb-environmental-logo-reverse.png';
import hbIconBlueBg from './assets/hb-icon-blue-bg.jpg';
import hbLogoIcon from './assets/hb-logo-icon.jpg';
import hedrickLogo from './assets/hedrick-logo.png';
import reefArchesLogoPng from './assets/reef-arches-logo.png';

export {
  gritLogo,
  hbConstructionIcon,
  hbConstructionIconWhite,
  hbConstructionLogoCentered,
  hbConstructionLogoCenteredReverse,
  hbConstructionLogoLeft,
  hbConstructionLogoLeftReverse,
  hbDevelopmentLogo,
  hbDevelopmentLogoReverse,
  hbEnvironmentalIcon,
  hbEnvironmentalLogo,
  hbEnvironmentalLogoReverse,
  hbIconBlueBg,
  hbLogoIcon,
  hedrickLogo,
  reefArchesLogoPng,
};

/**
 * Branded registry object for iteration and lookup patterns.
 * Keys are stable camelCase names; values resolve to asset paths at build time.
 */
export const brandAssets = {
  gritLogo,
  hbConstructionIcon,
  hbConstructionIconWhite,
  hbConstructionLogoCentered,
  hbConstructionLogoCenteredReverse,
  hbConstructionLogoLeft,
  hbConstructionLogoLeftReverse,
  hbDevelopmentLogo,
  hbDevelopmentLogoReverse,
  hbEnvironmentalIcon,
  hbEnvironmentalLogo,
  hbEnvironmentalLogoReverse,
  hbIconBlueBg,
  hbLogoIcon,
  hedrickLogo,
  reefArchesLogoPng,
} as const;

export type BrandAssetKey = keyof typeof brandAssets;
