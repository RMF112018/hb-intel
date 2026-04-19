import * as React from 'react';
import { clsx } from 'clsx';
import type {
  HomepageLauncherIconSurface,
  HomepageLauncherTileModel,
} from './types.js';
import styles from './homepage-launcher.module.css';

export interface HbcHomepageLauncherIconProps {
  tile: HomepageLauncherTileModel;
  surface?: HomepageLauncherIconSurface;
  className?: string;
}

export function HbcHomepageLauncherIcon({
  tile,
  surface = 'row',
  className,
}: HbcHomepageLauncherIconProps): React.JSX.Element | null {
  const Icon = tile.icon;
  if (!Icon && !tile.iconAssetSrc) return null;
  const compliantIcon = surface === 'drawer'
    || tile.iconPresentation === 'compliant'
    || Boolean(tile.iconAssetSrc);

  return (
    <span
      className={clsx(
        styles.tileIcon,
        compliantIcon ? styles.tileIconCompliant : undefined,
        surface === 'drawer' ? styles.tileIconDrawer : undefined,
        className,
      )}
      aria-hidden="true"
    >
      {tile.iconAssetSrc ? (
        <img
          src={tile.iconAssetSrc}
          alt=""
          className={styles.tileAsset}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : Icon ? (
        <Icon size={18} strokeWidth={2.1} />
      ) : null}
    </span>
  );
}
