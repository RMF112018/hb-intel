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

export type HomepageLauncherOverflowMode = 'menu' | 'sheet';

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
  mode: HomepageLauncherOverflowMode;
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
