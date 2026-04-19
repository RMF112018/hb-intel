/**
 * HbcHomepageLauncher — premium horizontal launcher tile family.
 *
 * Destructive replacement for the prior vertical tile grid. The band
 * renders a single row of premium tiles, one dominant
 * click target each, governed by a binding visible-count matrix per
 * device class (see `HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT`). Overflow
 * flows into an anchored menu (desktop/tablet) or a bottom sheet
 * (phone / short-height).
 *
 * Hosted parity markers — the surface exposes its package version,
 * device class, visible/overflow counts, and overflow mode on the
 * root node so a one-glance DOM inspection proves the deployed
 * bundle matches the source tree.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { HbcHomepageLauncherTile } from './HbcHomepageLauncherTile.js';
import { HbcHomepageLauncherOverflow } from './HbcHomepageLauncherOverflow.js';
import {
  HBC_HOMEPAGE_LAUNCHER_SURFACE_ID,
  HBC_HOMEPAGE_LAUNCHER_VERSION,
} from './constants.js';
import type {
  HbcHomepageLauncherProps,
  HomepageLauncherOverflowMode,
} from './types.js';
import { launcherBand, launcherRoot } from './variants.js';
import styles from './homepage-launcher.module.css';

function resolveOverflowMode(
  props: HbcHomepageLauncherProps,
): HomepageLauncherOverflowMode {
  if (props.overflowMode) return props.overflowMode;
  if (props.shortHeight) return 'sheet';
  return props.deviceClass === 'phone' ? 'sheet' : 'menu';
}

export function HbcHomepageLauncher(
  props: HbcHomepageLauncherProps,
): React.JSX.Element {
  const {
    title = 'Priority Actions',
    primary,
    overflow = [],
    overflowLabel = 'More tools',
    deviceClass,
    shortHeight = false,
    className,
    'aria-label': ariaLabel,
  } = props;
  const overflowMode = resolveOverflowMode(props);
  const hasOverflow = overflow.length > 0;

  return (
    <section
      aria-label={ariaLabel ?? title}
      className={clsx(launcherRoot(), className)}
      data-hbc-ui={HBC_HOMEPAGE_LAUNCHER_SURFACE_ID}
      data-hbc-homepage-launcher="root"
      data-hbc-homepage-launcher-row-primitive="tile-family"
      data-hbc-homepage-launcher-version={HBC_HOMEPAGE_LAUNCHER_VERSION}
      data-hbc-homepage-launcher-device-class={deviceClass}
      data-hbc-homepage-launcher-visible-count={primary.length}
      data-hbc-homepage-launcher-overflow-count={overflow.length}
      data-hbc-homepage-launcher-overflow-mode={overflowMode}
      data-hbc-homepage-launcher-short-height={shortHeight ? 'true' : 'false'}
    >
      <div className={launcherBand()} role="list">
        <div className={styles.bandScroller}>
          {primary.map((tile) => (
            <div
              key={tile.id}
              role="listitem"
              data-hbc-launcher-tile-slot={tile.id}
              style={{ display: 'contents' }}
            >
              <HbcHomepageLauncherTile tile={tile} />
            </div>
          ))}
        </div>
        {hasOverflow ? (
          <HbcHomepageLauncherOverflow
            items={overflow}
            label={overflowLabel}
            mode={overflowMode}
          />
        ) : null}
      </div>
    </section>
  );
}
