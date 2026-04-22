import type { LucideIcon } from 'lucide-react';

export type HomepageLauncherDeviceClass =
  | 'ultrawide'
  | 'desktop'
  | 'tablet-landscape'
  | 'tablet-portrait'
  | 'phone';

export type HomepageLauncherOverflowMode = 'sheet' | 'more-tools';
export type HomepageLauncherHandheldMode = 'standard' | 'single-entry-all-tools';
export type HomepageLauncherDrawerSource = 'all-tools';
export type HomepageLauncherCapGovernance = 'binding-visible-cap' | 'all-tools-drawer';
export type HomepageLauncherOverflowTriggerMode = 'tile' | 'linear-handheld';
export type HomepageLauncherTileVariant = 'primary' | 'secondary-overflow-entry' | 'mobile-entry';
export type HomepageLauncherTileFamily = 'row' | 'drawer';
export type HomepageLauncherIconPresentation = 'standard' | 'compliant';
export type HomepageLauncherIconAssetStrategy = 'img-filter-white';

export interface HomepageLauncherTileModel {
  id: string;
  serviceKey: string;
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  iconAssetSrc?: string;
  iconAssetStrategy?: HomepageLauncherIconAssetStrategy;
  iconPresentation?: HomepageLauncherIconPresentation;
  iconKey?: string;
  groupKey?: string;
  groupTitle?: string;
  external?: boolean;
  openInNewTab?: boolean;
  ariaLabel?: string;
  variant?: HomepageLauncherTileVariant;
}

export interface HomepageLauncherOverflowSectionModel {
  key: string;
  title: string;
  items: HomepageLauncherTileModel[];
}

export interface HomepageLauncherSurfaceProps {
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
