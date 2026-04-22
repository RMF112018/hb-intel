import * as React from 'react';
import { clsx } from 'clsx';
import { ChevronDown, Layers, X } from 'lucide-react';
import {
  HOMEPAGE_LAUNCHER_SURFACE_ID,
  HOMEPAGE_LAUNCHER_VERSION,
} from './constants.js';
import type {
  HomepageLauncherCapGovernance,
  HomepageLauncherDrawerSource,
  HomepageLauncherHandheldMode,
  HomepageLauncherOverflowMode,
  HomepageLauncherSurfaceProps,
  HomepageLauncherTileModel,
} from './types.js';
import styles from './homepage-launcher-surface.module.css';

function resolveHandheldMode(props: HomepageLauncherSurfaceProps): HomepageLauncherHandheldMode {
  if (props.handheldMode) return props.handheldMode;
  return props.deviceClass === 'phone' || props.shortHeight ? 'single-entry-all-tools' : 'standard';
}

function resolveOverflowMode(
  props: HomepageLauncherSurfaceProps,
  handheldMode: HomepageLauncherHandheldMode,
): HomepageLauncherOverflowMode {
  if (handheldMode === 'single-entry-all-tools') return 'sheet';
  return props.overflowMode ?? 'more-tools';
}

function resolveDrawerSource(props: HomepageLauncherSurfaceProps): HomepageLauncherDrawerSource {
  return props.drawerSource ?? 'all-tools';
}

function resolveCapGovernance(
  props: HomepageLauncherSurfaceProps,
  handheldMode: HomepageLauncherHandheldMode,
): HomepageLauncherCapGovernance {
  if (props.capGovernance) return props.capGovernance;
  return handheldMode === 'single-entry-all-tools' ? 'all-tools-drawer' : 'binding-visible-cap';
}

function Tile({ tile, family = 'row' }: { tile: HomepageLauncherTileModel; family?: 'row' | 'drawer' }) {
  const Icon = tile.icon;
  const shouldOpenInNewTab = tile.openInNewTab ?? Boolean(tile.external);
  const isOverflowTile = tile.variant === 'secondary-overflow-entry';

  return (
    <a
      href={tile.href}
      target={shouldOpenInNewTab ? '_blank' : undefined}
      rel={shouldOpenInNewTab ? 'noopener noreferrer' : undefined}
      className={clsx(
        styles.tile,
        isOverflowTile ? styles.tileOverflow : styles.tilePrimary,
      )}
      data-hbc-ui="homepage-launcher-tile"
      data-hbc-launcher-tile-id={tile.id}
      data-hbc-launcher-tile-service-key={tile.serviceKey}
      data-hbc-launcher-tile-icon-key={tile.iconKey}
      data-hbc-launcher-tile-variant={tile.variant ?? 'primary'}
      data-hbc-launcher-tile-family={family}
      data-hbc-launcher-tile-geometry="icon-forward-square"
      data-hbc-launcher-tile-size-contract={family}
      aria-label={tile.ariaLabel ?? tile.title}
      title={tile.title}
    >
      <span className={styles.tileIcon} aria-hidden="true">
        {tile.iconAssetSrc ? (
          <img
            src={tile.iconAssetSrc}
            alt=""
            className={styles.tileIconAsset}
          />
        ) : Icon ? (
          <Icon />
        ) : (
          <Layers />
        )}
      </span>
      <span className={styles.tileTitle}>{tile.title}</span>
      {shouldOpenInNewTab ? (
        <span className={styles.visuallyHidden}>(opens in new tab)</span>
      ) : null}
    </a>
  );
}

export function HomepageLauncherSurface(props: HomepageLauncherSurfaceProps): React.JSX.Element {
  const {
    primary,
    overflow = [],
    overflowLabel = 'More tools',
    className,
    shortHeight = false,
  } = props;
  const handheldMode = resolveHandheldMode(props);
  const overflowMode = resolveOverflowMode(props, handheldMode);
  const drawerSource = resolveDrawerSource(props);
  const capGovernance = resolveCapGovernance(props, handheldMode);
  const handheld = handheldMode === 'single-entry-all-tools';
  const renderedPrimary = handheld ? [] : primary;
  const drawerItems = handheld ? overflow : [...primary, ...overflow];
  const hasOverflow = drawerItems.length > 0;
  const visibleCount = handheld ? (hasOverflow ? 1 : 0) : renderedPrimary.length;
  const [open, setOpen] = React.useState(false);
  const dialogId = React.useId();
  const titleId = React.useId();
  const railRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open]);

  const handleRailKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return;
    const rail = railRef.current;
    if (!rail) return;
    const pageDelta = Math.max(Math.round(rail.clientWidth * 0.75), 96);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      rail.scrollBy({ left: pageDelta, behavior: 'smooth' });
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      rail.scrollBy({ left: -pageDelta, behavior: 'smooth' });
    } else if (event.key === 'Home') {
      event.preventDefault();
      rail.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (event.key === 'End') {
      event.preventDefault();
      rail.scrollTo({ left: rail.scrollWidth, behavior: 'smooth' });
    }
  }, []);

  const handleRailWheel = React.useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    rail.scrollBy({ left: event.deltaY });
  }, []);

  const triggerLabel = handheld ? 'HB Toolbox' : overflowLabel;

  return (
    <section
      className={clsx(styles.surface, className)}
      data-hbc-ui={HOMEPAGE_LAUNCHER_SURFACE_ID}
      data-hbc-homepage-launcher="root"
      data-hbc-homepage-launcher-row-primitive="tile-family"
      data-hbc-homepage-launcher-version={HOMEPAGE_LAUNCHER_VERSION}
      data-hbc-homepage-launcher-device-class={props.deviceClass}
      data-hbc-homepage-launcher-visible-count={visibleCount}
      data-hbc-homepage-launcher-overflow-count={overflow.length}
      data-hbc-homepage-launcher-overflow-mode={overflowMode}
      data-hbc-homepage-launcher-handheld-mode={handheldMode}
      data-hbc-homepage-launcher-drawer-source={drawerSource}
      data-hbc-homepage-launcher-cap-governance={capGovernance}
      data-hbc-homepage-launcher-short-height={shortHeight ? 'true' : 'false'}
      data-hbc-homepage-launcher-surface-grammar="flagship-utility-v1"
      data-hbc-homepage-launcher-display-class={
        handheld ? 'handheld-toolbox' : 'desktop-priority-rail'
      }
      aria-label={props['aria-label'] ?? 'Homepage launcher'}
    >
      <div className={styles.row} role="list" data-hbc-launcher-band-mode={handheldMode}>
        {renderedPrimary.map((tile) => (
          <div key={tile.id} role="listitem" style={{ display: 'contents' }}>
            <Tile tile={tile} />
          </div>
        ))}
        {hasOverflow ? (
          <div role="listitem" style={{ display: 'contents' }}>
            <button
              type="button"
              className={clsx(
                styles.tile,
                styles.tileOverflow,
                styles.overflowButton,
                handheld ? styles.handheldTrigger : undefined,
              )}
              data-hbc-ui="homepage-launcher-overflow-trigger"
              data-hbc-homepage-launcher-overflow-variant="secondary-overflow-entry"
              data-hbc-launcher-tile-variant="secondary-overflow-entry"
              data-hbc-homepage-launcher-overflow-shape={handheld ? 'linear-handheld' : 'tile'}
              data-hbc-homepage-launcher-sheet-content="all-tools"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={dialogId}
              onClick={() => setOpen(true)}
            >
              <span className={styles.tileIcon} aria-hidden="true">
                <Layers />
              </span>
              {handheld ? (
                <>
                  <span className={styles.handheldLabel}>{triggerLabel}</span>
                  <span
                    className={styles.handheldCount}
                    data-hbc-homepage-launcher-overflow-count-badge="handheld"
                    aria-hidden="true"
                  >
                    {drawerItems.length}
                  </span>
                  <ChevronDown size={12} aria-hidden="true" />
                </>
              ) : (
                <span className={styles.tileTitle}>{triggerLabel}</span>
              )}
            </button>
          </div>
        ) : null}
      </div>

      {open ? (
        <div className={styles.drawerLayer} data-hbc-homepage-launcher-sheet-root="true">
          <div className={styles.drawerBackdrop} aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={styles.drawer}
            data-hbc-homepage-launcher-sheet-content="all-tools"
            data-hbc-launcher-drawer-opaque="true"
            data-hbc-launcher-drawer-elevation="3"
            data-hbc-launcher-drawer-category="company-tools"
            data-hbc-launcher-drawer-display-class={handheld ? 'handheld-sheet' : 'desktop-company-tools'}
          >
            <header className={styles.drawerHeader}>
              <span id={titleId} className={styles.drawerTitle} data-hbc-launcher-drawer-category-label="true">
                Company Tools
              </span>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setOpen(false)}
                aria-label={`Close ${triggerLabel}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </header>
            <div className={styles.drawerBody} data-hbc-ui="homepage-launcher-overflow-sections">
              <div
                ref={railRef}
                className={styles.drawerRail}
                data-hbc-ui="homepage-launcher-drawer-rail"
                data-hbc-launcher-drawer-layout="single-row-tray"
                data-hbc-launcher-drawer-scroll="horizontal"
                data-hbc-launcher-overflow-grouping="none"
                role="list"
                tabIndex={0}
                onKeyDown={handleRailKeyDown}
                onWheel={handleRailWheel}
                aria-label="Company tools"
              >
                {drawerItems.map((tile) => (
                  <span key={`${tile.id}-drawer`} className={styles.drawerTileSlot} role="listitem">
                    <Tile tile={{ ...tile, variant: 'primary' }} family="drawer" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
