/**
 * HbcLauncherSurface — Grouped tool launcher surface
 * Phase 17-03 — Shared primitive system rebuild
 *
 * Purpose-built surface for grouped tools, primary launcher tiles,
 * and icon-led destinations. Supports grid and list layouts with
 * grouped categories and rich hover/affordance behavior.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import * as Separator from '@radix-ui/react-separator';
import { Slot } from '@radix-ui/react-slot';
import type { LucideIcon } from 'lucide-react';
import styles from './launcher-surface.module.css';

const launcherSurface = cva(styles.root, {
  variants: {
    layout: {
      grid: styles.layoutGrid,
      list: styles.layoutList,
    },
  },
  defaultVariants: {
    layout: 'grid',
  },
});

export type LauncherLayout = 'grid' | 'list';
export type LauncherTileTint = 'brand' | 'warm' | 'neutral' | 'accent' | 'danger';

const tintMap: Record<LauncherTileTint, string> = {
  brand: styles.tileIconBrand,
  warm: styles.tileIconWarm,
  neutral: styles.tileIconNeutral,
  accent: styles.tileIconAccent,
  danger: styles.tileIconDanger,
};

export interface LauncherTile {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  tint?: LauncherTileTint;
  href?: string;
  onClick?: () => void;
}

export interface LauncherGroup {
  id: string;
  label: string;
  icon?: LucideIcon;
  tiles: LauncherTile[];
}

export interface HbcLauncherSurfaceProps extends VariantProps<typeof launcherSurface> {
  groups: LauncherGroup[];
  className?: string;
  'aria-label'?: string;
}

export function HbcLauncherSurface({
  groups,
  layout,
  className,
  'aria-label': ariaLabel = 'Tool launcher',
}: HbcLauncherSurfaceProps): React.JSX.Element {
  return (
    <nav
      aria-label={ariaLabel}
      className={clsx(launcherSurface({ layout }), className)}
      data-hbc-premium="launcher-surface"
    >
      {groups.map((group, gi) => {
        const GroupIcon = group.icon;
        return (
          <div key={group.id} className={styles.group}>
            <div className={styles.groupHeader}>
              {GroupIcon ? (
                <span className={styles.groupIcon} aria-hidden="true">
                  <GroupIcon size={13} strokeWidth={2.5} />
                </span>
              ) : null}
              <span className={styles.groupLabel}>{group.label}</span>
            </div>
            {gi > 0 ? <Separator.Root className={styles.groupSeparator} decorative /> : null}
            <div className={styles.tiles} role="list">
              {group.tiles.map((tile) => {
                const TileIcon = tile.icon;
                const tintClass = tintMap[tile.tint ?? 'brand'];
                const isLink = Boolean(tile.href);

                return (
                  <motion.div
                    key={tile.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    role="listitem"
                  >
                    <Slot className={styles.tile}>
                      {isLink ? (
                        <a href={tile.href}>
                          <span className={clsx(styles.tileIcon, tintClass)} aria-hidden="true">
                            <TileIcon size={18} strokeWidth={2} />
                          </span>
                          <span className={styles.tileContent}>
                            <span className={styles.tileLabel}>{tile.label}</span>
                            {tile.description ? (
                              <span className={styles.tileDescription}>{tile.description}</span>
                            ) : null}
                          </span>
                        </a>
                      ) : (
                        <button type="button" onClick={tile.onClick}>
                          <span className={clsx(styles.tileIcon, tintClass)} aria-hidden="true">
                            <TileIcon size={18} strokeWidth={2} />
                          </span>
                          <span className={styles.tileContent}>
                            <span className={styles.tileLabel}>{tile.label}</span>
                            {tile.description ? (
                              <span className={styles.tileDescription}>{tile.description}</span>
                            ) : null}
                          </span>
                        </button>
                      )}
                    </Slot>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
