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
  HomepageLauncherTileModel,
} from './types.js';
import { launcherTile } from './variants.js';
import { HbcHomepageLauncherTile } from './HbcHomepageLauncherTile.js';
import styles from './homepage-launcher.module.css';

const DRAWER_CATEGORY_LABEL = 'Company Tools';

function sortTilesAlphabetically(
  items: readonly HomepageLauncherTileModel[],
): HomepageLauncherTileModel[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}

function DrawerOverflow({
  items,
  label,
  className,
}: {
  items: HomepageLauncherTileModel[];
  label: string;
  className?: string;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dialogId = React.useId();
  const titleId = React.useId();
  const sortedItems = React.useMemo(() => sortTilesAlphabetically(items), [items]);
  const { refs, context } = useFloating({ open, onOpenChange: setOpen });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const closeSheet = React.useCallback(() => setOpen(false), []);
  const surfaceTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.26, ease: 'easeOut' as const };
  const backdropTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.2 };

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className={clsx(
          launcherTile({ family: 'secondaryOverflowEntry' }),
          styles.overflowTile,
          className,
        )}
        data-hbc-ui="homepage-launcher-overflow-trigger"
        data-hbc-homepage-launcher-overflow-variant="secondary-overflow-entry"
        data-hbc-launcher-tile-variant="secondary-overflow-entry"
        data-hbc-overflow-mode="sheet"
        data-hbc-homepage-launcher-sheet-content="all-tools"
        data-hbc-launcher-tile-family="row"
        data-hbc-launcher-tile-geometry="icon-forward-square"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        {...getReferenceProps()}
      >
        <span
          className={clsx(styles.tileIcon, styles.tileIconCompliant, styles.triggerIcon)}
          aria-hidden="true"
        >
          <Layers strokeWidth={2.2} />
        </span>
        <span className={styles.overflowTriggerLabel}>{label}</span>
        <span className={styles.overflowTriggerCount} aria-hidden="true">
          {items.length}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
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
                      aria-label={`Close ${label}`}
                    >
                      <X size={16} strokeWidth={2.4} aria-hidden="true" />
                    </button>
                  </header>
                  <div
                    className={styles.drawerBody}
                    data-hbc-ui="homepage-launcher-overflow-section"
                    data-hbc-overflow-category-key="company-tools"
                    data-hbc-overflow-category-size={sortedItems.length}
                  >
                    <div
                      className={styles.drawerTileGrid}
                      data-hbc-ui="homepage-launcher-drawer-grid"
                    >
                      {sortedItems.map((tile) => (
                        <HbcHomepageLauncherTile
                          key={tile.id}
                          tile={tile}
                          family="drawer"
                          className={styles.drawerTile}
                        />
                      ))}
                    </div>
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
  className,
}: HbcHomepageLauncherOverflowProps): React.JSX.Element | null {
  if (items.length === 0) return null;
  return <DrawerOverflow items={items} label={label} className={className} />;
}
