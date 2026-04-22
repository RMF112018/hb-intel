/**
 * @deprecated Legacy compatibility surface.
 *
 * Flagship homepage launcher authority is @hbc/homepage-launcher.
 * This module remains only for compatibility and should not be used
 * for new homepage launcher integrations.
 */
export { HbcHomepageLauncher } from './HbcHomepageLauncher.js';
export { HbcHomepageLauncherTile } from './HbcHomepageLauncherTile.js';
export { HbcHomepageLauncherChip } from './HbcHomepageLauncherChip.js';
export { HbcHomepageLauncherOverflow } from './HbcHomepageLauncherOverflow.js';
export {
  HBC_HOMEPAGE_LAUNCHER_SURFACE_ID,
  HBC_HOMEPAGE_LAUNCHER_HANDHELD_MODE_RULE,
  HBC_HOMEPAGE_LAUNCHER_VERSION,
  HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT,
} from './constants.js';
export type {
  HbcHomepageLauncherProps,
  HbcHomepageLauncherTileProps,
  HomepageLauncherTileModel,
  HomepageLauncherTileVariant,
  HbcHomepageLauncherChipProps,
  HbcHomepageLauncherOverflowProps,
  HomepageLauncherChipModel,
  HomepageLauncherDeviceClass,
  HomepageLauncherDrawerSource,
  HomepageLauncherCapGovernance,
  HomepageLauncherHandheldMode,
  HomepageLauncherOverflowMode,
  HomepageLauncherOverflowSectionModel,
} from './types.js';
