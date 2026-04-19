/**
 * HbcHomepageLauncherChip — one branded horizontal capsule with an
 * icon-left / title-right anatomy. One dominant click target. No
 * description, no badge, no numbering, no corner chip, no trailing
 * arrow. Premium motion on hover (icon translates) and tap (scale).
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import type { HbcHomepageLauncherChipProps } from './types.js';
import styles from './homepage-launcher.module.css';

export function HbcHomepageLauncherChip({
  chip,
  className,
}: HbcHomepageLauncherChipProps): React.JSX.Element {
  // Launcher icon identity is resolved upstream by adapter governance.
  // This surface intentionally renders the resolved icon + text label pair.
  const Icon = chip.icon;
  const shouldOpenInNewTab = chip.openInNewTab ?? Boolean(chip.external);
  const isExternal = Boolean(chip.external);
  const prefersReducedMotion = useReducedMotion();
  const linkProps = shouldOpenInNewTab
    ? { href: chip.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: chip.href };

  return (
    <motion.a
      {...linkProps}
      aria-label={chip.ariaLabel ?? chip.title}
      title={chip.title}
      className={clsx(styles.chip, className)}
      data-hbc-ui="homepage-launcher-chip"
      data-hbc-chip-id={chip.id}
      data-hbc-chip-service-key={chip.serviceKey}
      data-hbc-chip-group-key={chip.groupKey}
      data-hbc-chip-icon-key={chip.iconKey}
      data-hbc-chip-external={isExternal ? 'true' : undefined}
      data-hbc-chip-new-tab={shouldOpenInNewTab ? 'true' : undefined}
      data-hbc-chip-width-mode="variable"
      whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12 }}
    >
      {Icon ? (
        <span className={styles.chipIcon} aria-hidden="true">
          <Icon size={18} strokeWidth={2.25} />
        </span>
      ) : null}
      <span className={styles.chipTitle}>{chip.title}</span>
      {shouldOpenInNewTab ? (
        <span className={styles.visuallyHidden}>(opens in new tab)</span>
      ) : null}
    </motion.a>
  );
}
