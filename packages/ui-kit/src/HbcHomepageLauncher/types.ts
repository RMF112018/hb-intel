/**
 * HbcHomepageLauncher — type contracts.
 *
 * A compact, branded horizontal chip band that replaces the earlier
 * vertical tile grid beneath the homepage hero. Premium Quick-Links
 * derivative — one dominant click target per chip, no metadata band,
 * no corner chip, no numbering, no trailing arrow.
 */
import type { LucideIcon } from 'lucide-react';

export type HomepageLauncherDeviceClass =
  | 'ultrawide'
  | 'desktop'
  | 'tablet-landscape'
  | 'tablet-portrait'
  | 'phone';

export type HomepageLauncherOverflowMode = 'menu' | 'sheet';

export interface HomepageLauncherChipModel {
  id: string;
  title: string;
  href: string;
  icon?: LucideIcon;
  external?: boolean;
}

export interface HbcHomepageLauncherProps {
  title?: string;
  primary: HomepageLauncherChipModel[];
  overflow?: HomepageLauncherChipModel[];
  overflowLabel?: string;
  deviceClass: HomepageLauncherDeviceClass;
  overflowMode?: HomepageLauncherOverflowMode;
  shortHeight?: boolean;
  className?: string;
  'aria-label'?: string;
}

export interface HbcHomepageLauncherChipProps {
  chip: HomepageLauncherChipModel;
  className?: string;
}

export interface HbcHomepageLauncherOverflowProps {
  items: HomepageLauncherChipModel[];
  label?: string;
  mode: HomepageLauncherOverflowMode;
  className?: string;
}
