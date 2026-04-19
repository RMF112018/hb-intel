/**
 * HbcHomepageLauncher — type contracts.
 *
 * Premium homepage launcher tile family with explicit tile variants.
 */
import type { LucideIcon } from 'lucide-react';

export type HomepageLauncherDeviceClass =
  | 'ultrawide'
  | 'desktop'
  | 'tablet-landscape'
  | 'tablet-portrait'
  | 'phone';

export type HomepageLauncherOverflowMode = 'sheet';
export type HomepageLauncherHandheldMode = 'standard' | 'single-entry-all-tools';
export type HomepageLauncherDrawerSource = 'all-tools';
export type HomepageLauncherCapGovernance = 'binding-visible-cap' | 'all-tools-drawer';

export type HomepageLauncherTileVariant =
  | 'primary'
  | 'secondary-overflow-entry'
  | 'mobile-entry';

export interface HomepageLauncherTileModel {
  id: string;
  serviceKey: string;
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  iconKey?: string;
  groupKey?: string;
  groupTitle?: string;
  external?: boolean;
  openInNewTab?: boolean;
  ariaLabel?: string;
  variant?: HomepageLauncherTileVariant;
}

export interface HbcHomepageLauncherProps {
  title?: string;
  primary: HomepageLauncherTileModel[];
  overflow?: HomepageLauncherTileModel[];
  overflowLabel?: string;
  deviceClass: HomepageLauncherDeviceClass;
  overflowMode?: HomepageLauncherOverflowMode;
  handheldMode?: HomepageLauncherHandheldMode;
  drawerSource?: HomepageLauncherDrawerSource;
  capGovernance?: HomepageLauncherCapGovernance;
  shortHeight?: boolean;
  className?: string;
  'aria-label'?: string;
}

export interface HbcHomepageLauncherTileProps {
  tile: HomepageLauncherTileModel;
  className?: string;
}

export interface HbcHomepageLauncherOverflowProps {
  items: HomepageLauncherTileModel[];
  label?: string;
  className?: string;
}

/**
 * Backward-compatible aliases retained for downstream imports while the
 * launcher family shifts from chip to tile semantics.
 */
export type HomepageLauncherChipModel = HomepageLauncherTileModel;
export interface HbcHomepageLauncherChipProps {
  chip: HomepageLauncherTileModel;
  className?: string;
}
