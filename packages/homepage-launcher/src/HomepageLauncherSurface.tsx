import * as React from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronLeft, ChevronRight, Layers, X } from 'lucide-react';
import { HOMEPAGE_LAUNCHER_SURFACE_ID, HOMEPAGE_LAUNCHER_VERSION } from './constants.js';
import type {
  HomepageLauncherCapGovernance,
  HomepageLauncherDrawerSource,
  HomepageLauncherHandheldMode,
  HomepageLauncherOverflowMode,
  HomepageLauncherSurfaceProps,
  HomepageLauncherTileModel,
} from './types.js';
import styles from './homepage-launcher-surface.module.css';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReducedMotion(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return prefersReducedMotion;
}

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
      className={clsx(styles.tile, isOverflowTile ? styles.tileOverflow : styles.tilePrimary)}
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
          <img src={tile.iconAssetSrc} alt="" className={styles.tileIconAsset} />
        ) : Icon ? (
          <Icon />
        ) : (
          <Layers />
        )}
      </span>
      <span className={styles.tileTitle}>{tile.title}</span>
      {shouldOpenInNewTab ? <span className={styles.visuallyHidden}>(opens in new tab)</span> : null}
    </a>
  );
}

export function HomepageLauncherSurface(props: HomepageLauncherSurfaceProps): React.JSX.Element {
  const { primary, overflow = [], overflowLabel = 'More tools', className, shortHeight = false } = props;
  const reducedMotion = usePrefersReducedMotion();
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
  const descriptionId = React.useId();
  const railRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const [drawerOverflowState, setDrawerOverflowState] = React.useState({
    hasLeftOverflow: false,
    hasRightOverflow: false,
  });

  const closeDrawer = React.useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => {
      if (triggerRef.current) {
        triggerRef.current.focus();
      } else {
        previousFocusRef.current?.focus();
      }
      previousFocusRef.current = null;
    });
  }, []);

  const openDrawer = React.useCallback(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
      return;
    }
    dialogRef.current?.focus();
  }, [open]);

  React.useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const syncDrawerOverflowState = React.useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0);
    const hasLeftOverflow = rail.scrollLeft > 1;
    const hasRightOverflow = rail.scrollLeft < maxScrollLeft - 1;
    setDrawerOverflowState((previous) => {
      if (
        previous.hasLeftOverflow === hasLeftOverflow &&
        previous.hasRightOverflow === hasRightOverflow
      ) {
        return previous;
      }
      return { hasLeftOverflow, hasRightOverflow };
    });
  }, []);

  React.useEffect(() => {
    if (!open) {
      setDrawerOverflowState({
        hasLeftOverflow: false,
        hasRightOverflow: false,
      });
      return;
    }

    const rail = railRef.current;
    if (!rail) return;

    const animationFrame = window.requestAnimationFrame(syncDrawerOverflowState);
    rail.addEventListener('scroll', syncDrawerOverflowState, { passive: true });

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => syncDrawerOverflowState());
      resizeObserver.observe(rail);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      rail.removeEventListener('scroll', syncDrawerOverflowState);
      resizeObserver?.disconnect();
    };
  }, [open, syncDrawerOverflowState, drawerItems.length]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusableNodes = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((node) => !node.hasAttribute('disabled'));

      if (focusableNodes.length === 0) {
        event.preventDefault();
        return;
      }

      const firstNode = focusableNodes[0]!;
      const lastNode = focusableNodes[focusableNodes.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      const isShift = event.shiftKey;

      if (!isShift && active === lastNode) {
        event.preventDefault();
        firstNode.focus();
      } else if (isShift && active === firstNode) {
        event.preventDefault();
        lastNode.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, closeDrawer]);

  const handleRailKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.currentTarget !== event.target) return;
      const rail = railRef.current;
      if (!rail) return;
      const pageDelta = Math.max(Math.round(rail.clientWidth * 0.75), 96);
      const behavior = reducedMotion ? 'auto' : 'smooth';
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        rail.scrollBy({ left: pageDelta, behavior });
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        rail.scrollBy({ left: -pageDelta, behavior });
      } else if (event.key === 'Home') {
        event.preventDefault();
        rail.scrollTo({ left: 0, behavior });
      } else if (event.key === 'End') {
        event.preventDefault();
        rail.scrollTo({ left: rail.scrollWidth, behavior });
      }
    },
    [reducedMotion],
  );

  const handleRailWheel = React.useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    rail.scrollBy({ left: event.deltaY });
  }, []);

  const handleDrawerEdgeNavigate = React.useCallback(
    (direction: 'left' | 'right') => {
      const rail = railRef.current;
      if (!rail) return;
      const pageDelta = Math.max(Math.round(rail.clientWidth * 0.72), 96);
      const delta = direction === 'right' ? pageDelta : -pageDelta;
      rail.scrollBy({
        left: delta,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    },
    [reducedMotion],
  );

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
      data-hbc-homepage-launcher-display-class={handheld ? 'handheld-toolbox' : 'desktop-priority-rail'}
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
              ref={triggerRef}
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
              onClick={openDrawer}
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
          <div className={styles.drawerBackdrop} aria-hidden="true" onClick={closeDrawer} />
          <div
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
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
                ref={closeButtonRef}
                type="button"
                className={styles.drawerClose}
                onClick={closeDrawer}
                aria-label={`Close ${triggerLabel}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </header>
            <p id={descriptionId} className={styles.visuallyHidden}>
              Company Tools drawer. Use arrow keys or swipe to move across launcher tiles.
            </p>
            <div className={styles.drawerBody} data-hbc-ui="homepage-launcher-overflow-sections">
              {drawerOverflowState.hasLeftOverflow ? (
                <button
                  type="button"
                  className={styles.drawerEdgeControlLeft}
                  aria-label="Scroll launcher tools left"
                  onClick={() => handleDrawerEdgeNavigate('left')}
                >
                  <ChevronLeft size={14} aria-hidden="true" />
                </button>
              ) : null}
              {drawerOverflowState.hasRightOverflow ? (
                <button
                  type="button"
                  className={styles.drawerEdgeControlRight}
                  aria-label="Scroll launcher tools right"
                  onClick={() => handleDrawerEdgeNavigate('right')}
                >
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              ) : null}
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
