/**
 * HbcHomepageLauncherOverflow — Company Tools drawer.
 *
 * Total rebuild: a single-category bottom sheet with one premium launcher
 * tile grid. No per-tile grouping; every overflow tool surfaces under the
 * `Company Tools` category. Content-driven height, horizontally centered
 * grid, fully opaque surface. Focus trap, Escape, and return-focus behavior
 * are provided by Floating UI.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronDown, Layers, X } from 'lucide-react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
  FloatingPortal,
} from '@floating-ui/react';
import type {
  HbcHomepageLauncherOverflowProps,
  HomepageLauncherDrawerCompactMode,
  HomepageLauncherTileModel,
} from './types.js';
import { launcherTile } from './variants.js';
import { HbcHomepageLauncherTile } from './HbcHomepageLauncherTile.js';
import styles from './homepage-launcher.module.css';

const DRAWER_CATEGORY_LABEL = 'Company Tools';
const DRAWER_TILE_SIZE_MIN = 86;
const DRAWER_TILE_SIZE_MAX = 126;
const DRAWER_RAIL_GAP_WIDE = 14;
const DRAWER_RAIL_GAP_COMPACT = 12;
const DRAWER_RAIL_GAP_TIGHT = 10;

function resolveDrawerRailMetrics(availableWidth: number, itemCount: number): {
  tileSize: number;
  railGap: number;
  iconSize: number;
  captionSize: number;
  compactMode: 'comfortable' | 'compact' | 'tight';
} {
  const safeItemCount = Math.max(1, itemCount);
  const targetTileSize = Math.floor(
    (availableWidth - (safeItemCount - 1) * DRAWER_RAIL_GAP_WIDE) / safeItemCount,
  );
  const tileSize = Math.max(
    DRAWER_TILE_SIZE_MIN,
    Math.min(DRAWER_TILE_SIZE_MAX, Number.isFinite(targetTileSize) ? targetTileSize : DRAWER_TILE_SIZE_MAX),
  );
  const compactMode =
    tileSize <= 94 ? 'tight' : tileSize <= 106 ? 'compact' : 'comfortable';
  const railGap =
    compactMode === 'tight'
      ? DRAWER_RAIL_GAP_TIGHT
      : compactMode === 'compact'
        ? DRAWER_RAIL_GAP_COMPACT
        : DRAWER_RAIL_GAP_WIDE;
  const iconSize = Math.max(30, Math.min(54, Math.round(tileSize * 0.42)));
  const captionSize =
    compactMode === 'tight' ? 10 : compactMode === 'compact' ? 10.5 : 11;

  return {
    tileSize,
    railGap,
    iconSize,
    captionSize,
    compactMode,
  };
}

function DrawerOverflow({
  items,
  label,
  triggerMode = 'tile',
  className,
}: {
  items: HomepageLauncherTileModel[];
  label: string;
  triggerMode?: 'tile' | 'linear-handheld';
  className?: string;
}): React.JSX.Element {
  const supportsScrollArea = typeof ResizeObserver !== 'undefined';
  const [open, setOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dialogId = React.useId();
  const titleId = React.useId();
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const drawerItems = React.useMemo(() => [...items], [items]);
  const [drawerCompactMode, setDrawerCompactMode] =
    React.useState<HomepageLauncherDrawerCompactMode>('comfortable');
  const [drawerRailVars, setDrawerRailVars] = React.useState<React.CSSProperties>(() => ({
    '--hbc-hl-drawer-tile-size': `${DRAWER_TILE_SIZE_MAX}px`,
    '--hbc-hl-drawer-rail-gap': `${DRAWER_RAIL_GAP_WIDE}px`,
    '--hbc-hl-drawer-icon-size': '54px',
    '--hbc-hl-drawer-caption-size': '0.6875rem',
  } as React.CSSProperties));
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = React.useState(false);
  const [canScrollForward, setCanScrollForward] = React.useState(false);
  const { refs, context } = useFloating({ open, onOpenChange: setOpen });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const closeSheet = React.useCallback(() => setOpen(false), []);
  const handheldLinearTrigger = triggerMode === 'linear-handheld';
  const triggerLabel = handheldLinearTrigger ? 'HB Toolbox' : label;
  const updateDrawerRailState = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const {
      tileSize,
      railGap,
      iconSize,
      captionSize,
      compactMode,
    } = resolveDrawerRailMetrics(viewport.clientWidth, drawerItems.length);
    setDrawerCompactMode(compactMode);
    setDrawerRailVars({
      '--hbc-hl-drawer-tile-size': `${tileSize}px`,
      '--hbc-hl-drawer-rail-gap': `${railGap}px`,
      '--hbc-hl-drawer-icon-size': `${iconSize}px`,
      '--hbc-hl-drawer-caption-size': `${captionSize / 16}rem`,
    } as React.CSSProperties);
    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const hasOverflow = maxScrollLeft > 2;
    const hasMoreForward = viewport.scrollLeft < maxScrollLeft - 2;
    setHasHorizontalOverflow(hasOverflow);
    setCanScrollForward(hasOverflow && hasMoreForward);
  }, [drawerItems.length]);
  const handleViewportKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key !== 'ArrowRight' &&
        event.key !== 'ArrowLeft' &&
        event.key !== 'Home' &&
        event.key !== 'End'
      ) {
        return;
      }
      const viewport = viewportRef.current;
      if (!viewport) return;
      event.preventDefault();
      if (event.key === 'Home') {
        viewport.scrollTo({ left: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        updateDrawerRailState();
        return;
      }
      if (event.key === 'End') {
        viewport.scrollTo({
          left: viewport.scrollWidth,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
        updateDrawerRailState();
        return;
      }
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const step = Math.max(48, viewport.clientWidth * 0.3);
      viewport.scrollBy({ left: step * direction, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      updateDrawerRailState();
    },
    [prefersReducedMotion, updateDrawerRailState],
  );

  React.useEffect(() => {
    if (!supportsScrollArea) return;
    if (!open) {
      setHasHorizontalOverflow(false);
      setCanScrollForward(false);
      return;
    }
    const viewport = viewportRef.current;
    if (!viewport) return;
    updateDrawerRailState();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateDrawerRailState);
      return () => window.removeEventListener('resize', updateDrawerRailState);
    }
    const resizeObserver = new ResizeObserver(() => updateDrawerRailState());
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, [open, drawerItems.length, supportsScrollArea, updateDrawerRailState]);

  const surfaceTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.26, ease: 'easeOut' as const };
  const backdropTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.2 };

  return (
    <>
      <motion.button
        ref={refs.setReference}
        type="button"
        className={clsx(
          launcherTile({ family: 'secondaryOverflowEntry' }),
          styles.overflowTile,
          handheldLinearTrigger ? styles.overflowTileLinearHandheld : undefined,
          className,
        )}
        data-hbc-ui="homepage-launcher-overflow-trigger"
        data-hbc-homepage-launcher-overflow-variant="secondary-overflow-entry"
        data-hbc-launcher-tile-variant="secondary-overflow-entry"
        data-hbc-overflow-mode="sheet"
        data-hbc-homepage-launcher-sheet-content="all-tools"
        data-hbc-launcher-tile-family="row"
        data-hbc-launcher-tile-geometry="icon-forward-square"
        data-hbc-homepage-launcher-overflow-shape={handheldLinearTrigger ? 'linear-handheld' : 'tile'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.14 }}
        {...getReferenceProps()}
      >
        <span
          className={clsx(
            handheldLinearTrigger ? styles.overflowTriggerInlineContent : undefined,
          )}
        >
          <span
            className={clsx(styles.tileIcon, styles.tileIconCompliant, styles.triggerIcon)}
            aria-hidden="true"
          >
            <Layers strokeWidth={2.2} />
          </span>
          <span className={styles.overflowTriggerLabel}>{triggerLabel}</span>
          <span
            className={clsx(
              styles.overflowTriggerCount,
              handheldLinearTrigger ? styles.overflowTriggerCountLinear : undefined,
            )}
            aria-hidden="true"
          >
            {items.length}
          </span>
          <ChevronDown
            size={handheldLinearTrigger ? 12 : 14}
            className={handheldLinearTrigger ? styles.overflowTriggerChevronLinear : undefined}
            aria-hidden="true"
          />
        </span>
      </motion.button>
      <FloatingPortal>
        <AnimatePresence>
          {open ? (
            <FloatingFocusManager context={context} modal returnFocus>
              <div className={styles.sheetLayer} data-hbc-homepage-launcher-sheet-root="true">
                <motion.div
                  className={styles.sheetBackdrop}
                  data-hbc-homepage-launcher-sheet-backdrop="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={backdropTransition}
                  onClick={closeSheet}
                  aria-hidden="true"
                />
                <motion.div
                  id={dialogId}
                  ref={refs.setFloating}
                  className={styles.sheetSurface}
                  initial={{ y: prefersReducedMotion ? 0 : '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: prefersReducedMotion ? 0 : '100%' }}
                  transition={surfaceTransition}
                  {...getFloatingProps()}
                  aria-labelledby={titleId}
                  data-hbc-homepage-launcher-sheet-content="all-tools"
                  data-hbc-launcher-drawer-opaque="true"
                  data-hbc-launcher-drawer-elevation="3"
                  data-hbc-launcher-drawer-category="company-tools"
                >
                  <header className={styles.sheetHeader}>
                    <div className={styles.sheetHeading}>
                      <span
                        id={titleId}
                        className={styles.sheetTitle}
                        data-hbc-launcher-drawer-category-label="true"
                      >
                        {DRAWER_CATEGORY_LABEL}
                      </span>
                    </div>
                    <span
                      className={styles.sheetHeaderCount}
                      aria-label={`${items.length} tools`}
                    >
                      {items.length}
                    </span>
                    <button
                      type="button"
                      className={styles.sheetClose}
                      onClick={closeSheet}
                      aria-label={`Close ${triggerLabel}`}
                    >
                      <X size={16} strokeWidth={2.4} aria-hidden="true" />
                    </button>
                  </header>
                  <div
                    className={styles.drawerBody}
                    data-hbc-ui="homepage-launcher-overflow-section"
                    data-hbc-overflow-category-key="company-tools"
                    data-hbc-overflow-category-size={drawerItems.length}
                  >
                    {supportsScrollArea ? (
                      <ScrollArea.Root
                        className={styles.drawerRailRoot}
                        type="auto"
                        data-hbc-ui="homepage-launcher-drawer-rail-root"
                      >
                        <ScrollArea.Viewport
                          ref={viewportRef}
                          className={styles.drawerRailViewport}
                          data-hbc-ui="homepage-launcher-drawer-rail-viewport"
                          onScroll={updateDrawerRailState}
                          onKeyDown={handleViewportKeyDown}
                          tabIndex={0}
                          aria-label="Company tools row"
                        >
                          <div
                            className={styles.drawerTileRail}
                            data-hbc-ui="homepage-launcher-drawer-rail"
                            data-hbc-launcher-drawer-layout="single-row-centered"
                            data-hbc-launcher-drawer-density={drawerCompactMode}
                            data-hbc-launcher-drawer-overflow={hasHorizontalOverflow ? 'true' : 'false'}
                            role="list"
                            aria-label="Company Tools"
                            style={drawerRailVars}
                          >
                            {drawerItems.map((tile) => (
                              <div key={tile.id} role="listitem" className={styles.drawerRailItem}>
                                <HbcHomepageLauncherTile
                                  tile={tile}
                                  family="drawer"
                                  className={styles.drawerTile}
                                />
                              </div>
                            ))}
                          </div>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar
                          className={styles.drawerRailScrollbar}
                          orientation="horizontal"
                        >
                          <ScrollArea.Thumb className={styles.drawerRailScrollbarThumb} />
                        </ScrollArea.Scrollbar>
                      </ScrollArea.Root>
                    ) : (
                      <div
                        className={styles.drawerRailRoot}
                        data-hbc-ui="homepage-launcher-drawer-rail-root"
                      >
                        <div
                          ref={viewportRef}
                          className={styles.drawerRailViewport}
                          data-hbc-ui="homepage-launcher-drawer-rail-viewport"
                          onScroll={updateDrawerRailState}
                          onKeyDown={handleViewportKeyDown}
                          tabIndex={0}
                          aria-label="Company tools row"
                        >
                          <div
                            className={styles.drawerTileRail}
                            data-hbc-ui="homepage-launcher-drawer-rail"
                            data-hbc-launcher-drawer-layout="single-row-centered"
                            data-hbc-launcher-drawer-density={drawerCompactMode}
                            data-hbc-launcher-drawer-overflow={hasHorizontalOverflow ? 'true' : 'false'}
                            role="list"
                            aria-label="Company Tools"
                            style={drawerRailVars}
                          >
                            {drawerItems.map((tile) => (
                              <div key={tile.id} role="listitem" className={styles.drawerRailItem}>
                                <HbcHomepageLauncherTile
                                  tile={tile}
                                  family="drawer"
                                  className={styles.drawerTile}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <p
                      className={styles.drawerOverflowHint}
                      data-hbc-ui="homepage-launcher-drawer-overflow-hint"
                      data-hbc-launcher-drawer-overflow-active={canScrollForward ? 'true' : 'false'}
                    >
                      {canScrollForward ? 'Scroll to view more company tools' : 'All tools in view'}
                    </p>
                  </div>
                </motion.div>
              </div>
            </FloatingFocusManager>
          ) : null}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
}

export function HbcHomepageLauncherOverflow({
  items,
  label = 'More tools',
  triggerMode = 'tile',
  className,
}: HbcHomepageLauncherOverflowProps): React.JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <DrawerOverflow items={items} label={label} triggerMode={triggerMode} className={className} />
  );
}
