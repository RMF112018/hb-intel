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
  const compliantIcon = true;
  // Sized to dominate the square tile (~40% of tile width). CSS provides the
  // real bounding box via `--hbc-hl-icon-size`; these props seed the SVG default.
  const iconSize = surface === 'drawer' ? 52 : 44;
  const iconStrokeWidth = surface === 'drawer' ? 2.1 : 2.2;

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
        <Icon size={iconSize} strokeWidth={iconStrokeWidth} />
      ) : null}
    </span>
  );
}
