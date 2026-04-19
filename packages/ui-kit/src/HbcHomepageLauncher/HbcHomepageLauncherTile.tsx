/**
 * HbcHomepageLauncherTile — one launcher tile with icon + label anatomy.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import type { HbcHomepageLauncherTileProps } from './types.js';
import { launcherTile } from './variants.js';
import { HbcHomepageLauncherIcon } from './HbcHomepageLauncherIcon.js';
import styles from './homepage-launcher.module.css';

function resolveFamily(
  variant: HbcHomepageLauncherTileProps['tile']['variant'],
): 'primary' | 'secondaryOverflowEntry' | 'mobileEntry' {
  if (variant === 'secondary-overflow-entry') return 'secondaryOverflowEntry';
  if (variant === 'mobile-entry') return 'mobileEntry';
  return 'primary';
}

export function HbcHomepageLauncherTile({
  tile,
  family = 'row',
  className,
}: HbcHomepageLauncherTileProps): React.JSX.Element {
  const shouldOpenInNewTab = tile.openInNewTab ?? Boolean(tile.external);
  const isExternal = Boolean(tile.external);
  const prefersReducedMotion = useReducedMotion();
  const linkProps = shouldOpenInNewTab
    ? { href: tile.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: tile.href };
  const tileFamily = family === 'drawer' ? 'drawer' : resolveFamily(tile.variant);
  const computedAriaLabel = tile.ariaLabel ?? (tile.description ? `${tile.title}. ${tile.description}` : tile.title);

  return (
    <motion.a
      {...linkProps}
      aria-label={computedAriaLabel}
      title={tile.title}
      className={clsx(launcherTile({ family: tileFamily }), className)}
      data-hbc-ui="homepage-launcher-tile"
      data-hbc-ui-legacy="homepage-launcher-chip"
      data-hbc-launcher-tile-id={tile.id}
      data-hbc-launcher-tile-service-key={tile.serviceKey}
      data-hbc-launcher-tile-group-key={tile.groupKey}
      data-hbc-launcher-tile-icon-key={tile.iconKey}
      data-hbc-launcher-tile-icon-source={tile.iconAssetSrc ? 'asset' : tile.icon ? 'lucide' : undefined}
      data-hbc-launcher-tile-variant={tile.variant ?? 'primary'}
      data-hbc-launcher-tile-external={isExternal ? 'true' : undefined}
      data-hbc-launcher-tile-new-tab={shouldOpenInNewTab ? 'true' : undefined}
      data-hbc-launcher-tile-family={family}
      data-hbc-launcher-tile-geometry="icon-forward-square"
      data-hbc-chip-id={tile.id}
      data-hbc-chip-service-key={tile.serviceKey}
      data-hbc-chip-group-key={tile.groupKey}
      data-hbc-chip-icon-key={tile.iconKey}
      data-hbc-chip-external={isExternal ? 'true' : undefined}
      data-hbc-chip-new-tab={shouldOpenInNewTab ? 'true' : undefined}
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.14 }}
    >
      <HbcHomepageLauncherIcon tile={tile} surface={family === 'drawer' ? 'drawer' : 'row'} />
      <span className={styles.tileContent}>
        <span className={clsx(styles.tileTitle, family === 'drawer' ? styles.drawerTileTitle : undefined)}>
          {tile.title}
        </span>
      </span>
      {shouldOpenInNewTab ? (
        <span className={styles.visuallyHidden}>(opens in new tab)</span>
      ) : null}
    </motion.a>
  );
}
