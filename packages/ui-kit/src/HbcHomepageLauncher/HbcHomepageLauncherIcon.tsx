import * as React from 'react';
import { clsx } from 'clsx';
import type { HomepageLauncherTileModel } from './types.js';
import styles from './homepage-launcher.module.css';

export interface HbcHomepageLauncherIconProps {
  tile: HomepageLauncherTileModel;
  className?: string;
}

export function HbcHomepageLauncherIcon({
  tile,
  className,
}: HbcHomepageLauncherIconProps): React.JSX.Element | null {
  const Icon = tile.icon;
  if (!Icon && !tile.iconAssetSrc) return null;
  const compliantIcon = tile.iconPresentation === 'compliant' || Boolean(tile.iconAssetSrc);

  return (
    <span
      className={clsx(styles.tileIcon, compliantIcon ? styles.tileIconCompliant : undefined, className)}
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
