/**
 * HbcHomepageLauncherTile — one launcher tile with icon + label anatomy.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import type { HbcHomepageLauncherTileProps } from './types.js';
import { launcherTile } from './variants.js';
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
  className,
}: HbcHomepageLauncherTileProps): React.JSX.Element {
  const Icon = tile.icon;
  const shouldOpenInNewTab = tile.openInNewTab ?? Boolean(tile.external);
  const isExternal = Boolean(tile.external);
  const prefersReducedMotion = useReducedMotion();
  const linkProps = shouldOpenInNewTab
    ? { href: tile.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: tile.href };
  const tileFamily = resolveFamily(tile.variant);

  return (
    <motion.a
      {...linkProps}
      aria-label={tile.ariaLabel ?? tile.title}
      title={tile.title}
      className={clsx(launcherTile({ family: tileFamily }), className)}
      data-hbc-ui="homepage-launcher-tile"
      data-hbc-ui-legacy="homepage-launcher-chip"
      data-hbc-launcher-tile-id={tile.id}
      data-hbc-launcher-tile-service-key={tile.serviceKey}
      data-hbc-launcher-tile-group-key={tile.groupKey}
      data-hbc-launcher-tile-icon-key={tile.iconKey}
      data-hbc-launcher-tile-variant={tile.variant ?? 'primary'}
      data-hbc-launcher-tile-external={isExternal ? 'true' : undefined}
      data-hbc-launcher-tile-new-tab={shouldOpenInNewTab ? 'true' : undefined}
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
      {Icon ? (
        <span className={styles.tileIcon} aria-hidden="true">
          <Icon size={18} strokeWidth={2.1} />
        </span>
      ) : null}
      <span className={styles.tileContent}>
        <span className={styles.tileTitle}>{tile.title}</span>
        {tile.description ? <span className={styles.tileSubtitle}>{tile.description}</span> : null}
      </span>
      {shouldOpenInNewTab ? (
        <span className={styles.visuallyHidden}>(opens in new tab)</span>
      ) : null}
    </motion.a>
  );
}
