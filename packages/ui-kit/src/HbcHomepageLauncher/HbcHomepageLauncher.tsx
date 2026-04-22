/**
 * HbcHomepageLauncher — premium horizontal launcher tile family.
 *
 * Destructive replacement for the prior vertical tile grid. The band
 * renders a single row of premium tiles, one dominant
 * click target each, governed by a binding visible-count matrix per
 * device class (see `HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT`). Overflow
 * flows into a governed bottom drawer sheet across display classes.
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
  HomepageLauncherCapGovernance,
  HomepageLauncherDrawerSource,
  HbcHomepageLauncherProps,
  HomepageLauncherHandheldMode,
  HomepageLauncherOverflowMode,
} from './types.js';
import { launcherBand, launcherRoot } from './variants.js';
import styles from './homepage-launcher.module.css';

function resolveOverflowMode(
  props: HbcHomepageLauncherProps,
  handheldMode: HomepageLauncherHandheldMode,
): HomepageLauncherOverflowMode {
  if (handheldMode === 'single-entry-all-tools') return 'sheet';
  return props.overflowMode ?? 'more-tools';
}

function resolveHandheldMode(
  props: HbcHomepageLauncherProps,
): HomepageLauncherHandheldMode {
  if (props.handheldMode) return props.handheldMode;
  return props.deviceClass === 'phone' || props.shortHeight
    ? 'single-entry-all-tools'
    : 'standard';
}

function resolveDrawerSource(
  props: HbcHomepageLauncherProps,
  _handheldMode: HomepageLauncherHandheldMode,
): HomepageLauncherDrawerSource {
  if (props.drawerSource) return props.drawerSource;
  return 'all-tools';
}

function resolveCapGovernance(
  props: HbcHomepageLauncherProps,
  handheldMode: HomepageLauncherHandheldMode,
): HomepageLauncherCapGovernance {
  if (props.capGovernance) return props.capGovernance;
  return handheldMode === 'single-entry-all-tools' ? 'all-tools-drawer' : 'binding-visible-cap';
}

export function HbcHomepageLauncher(
  props: HbcHomepageLauncherProps,
): React.JSX.Element {
  const {
    title,
    primary,
    overflow = [],
    overflowLabel = 'More tools',
    deviceClass,
    shortHeight = false,
    className,
    'aria-label': ariaLabel,
  } = props;
  const handheldMode = resolveHandheldMode(props);
  const overflowMode = resolveOverflowMode(props, handheldMode);
  const handheldSingleEntry = handheldMode === 'single-entry-all-tools';
  const drawerSource = resolveDrawerSource(props, handheldMode);
  const capGovernance = resolveCapGovernance(props, handheldMode);
  const renderedPrimary = handheldSingleEntry ? [] : primary;
  const hasOverflow = overflow.length > 0;
  const drawerItems = handheldSingleEntry ? overflow : [...renderedPrimary, ...overflow];
  const visibleCount = handheldSingleEntry ? (hasOverflow ? 1 : 0) : renderedPrimary.length;
  const visibleTileCount = handheldSingleEntry
    ? visibleCount
    : renderedPrimary.length + (hasOverflow ? 1 : 0);
  const rootStyle = {
    '--hbc-hl-visible-tiles': String(Math.max(visibleTileCount, 1)),
  } as React.CSSProperties;

  return (
    <section
      aria-label={ariaLabel ?? title ?? 'Homepage launcher'}
      className={clsx(launcherRoot(), className)}
      data-hbc-ui={HBC_HOMEPAGE_LAUNCHER_SURFACE_ID}
      data-hbc-homepage-launcher="root"
      data-hbc-homepage-launcher-row-primitive="tile-family"
      data-hbc-homepage-launcher-version={HBC_HOMEPAGE_LAUNCHER_VERSION}
      data-hbc-homepage-launcher-device-class={deviceClass}
      data-hbc-homepage-launcher-visible-count={visibleCount}
      data-hbc-homepage-launcher-overflow-count={overflow.length}
      data-hbc-homepage-launcher-overflow-mode={overflowMode}
      data-hbc-homepage-launcher-handheld-mode={handheldMode}
      data-hbc-homepage-launcher-drawer-source={drawerSource}
      data-hbc-homepage-launcher-cap-governance={capGovernance}
      data-hbc-homepage-launcher-all-tools-count={handheldSingleEntry ? overflow.length : undefined}
      data-hbc-homepage-launcher-short-height={shortHeight ? 'true' : 'false'}
      data-hbc-homepage-launcher-drawer-category="company-tools"
      data-hbc-homepage-launcher-surface-grammar="flagship-utility-v1"
      data-hbc-homepage-launcher-display-class={
        handheldSingleEntry ? 'handheld-toolbox' : 'desktop-priority-rail'
      }
      style={rootStyle}
    >
      <div className={launcherBand()} role="list">
        <div
          className={styles.bandScroller}
          data-hbc-launcher-band-mode={handheldMode}
          data-hbc-launcher-band-surface="flat"
        >
          {renderedPrimary.map((tile) => (
            <div
              key={tile.id}
              role="listitem"
              data-hbc-launcher-tile-slot={tile.id}
              style={{ display: 'contents' }}
            >
              <HbcHomepageLauncherTile tile={tile} />
            </div>
          ))}
          {hasOverflow ? (
            <div role="listitem" data-hbc-launcher-tile-slot="overflow" style={{ display: 'contents' }}>
              <HbcHomepageLauncherOverflow
                items={drawerItems}
                label={overflowLabel}
                overflowMode={overflowMode}
                triggerMode={handheldSingleEntry ? 'linear-handheld' : 'tile'}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
