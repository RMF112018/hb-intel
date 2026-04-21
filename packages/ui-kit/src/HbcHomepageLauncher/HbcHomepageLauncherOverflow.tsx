/**
 * HbcHomepageLauncherOverflow — Company Tools drawer.
 *
 * Renders a single-row horizontal overflow tray inside the bottom drawer.
 * Grouped/category section rendering is intentionally removed.
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
} from '@floating-ui/react';
import type {
  HbcHomepageLauncherOverflowProps,
  HomepageLauncherTileModel,
} from './types.js';
import { launcherTile } from './variants.js';
import { HbcHomepageLauncherTile } from './HbcHomepageLauncherTile.js';
import styles from './homepage-launcher.module.css';

const DRAWER_CATEGORY_LABEL = 'Company Tools';

function DrawerOverflow({
  items,
  label,
  overflowMode,
  triggerMode = 'tile',
  className,
}: {
  items: HomepageLauncherTileModel[];
  label: string;
  overflowMode?: 'sheet' | 'more-tools';
  triggerMode?: 'tile' | 'linear-handheld';
  className?: string;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dialogId = React.useId();
  const titleId = React.useId();
  const drawerItems = React.useMemo(() => [...items], [items]);
  const totalTools = drawerItems.length;
  const { refs, context } = useFloating({ open, onOpenChange: setOpen });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const closeSheet = React.useCallback(() => setOpen(false), []);
  const handheldLinearTrigger = triggerMode === 'linear-handheld';
  const triggerLabel = handheldLinearTrigger ? 'HB Toolbox' : label;
  const resolvedOverflowMode = handheldLinearTrigger ? 'sheet' : (overflowMode ?? 'more-tools');

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
          !handheldLinearTrigger && resolvedOverflowMode === 'more-tools'
            ? styles.overflowTileMoreToolsDesktop
            : undefined,
          handheldLinearTrigger ? styles.overflowTileLinearHandheld : undefined,
          className,
        )}
        data-hbc-ui="homepage-launcher-overflow-trigger"
        data-hbc-homepage-launcher-overflow-variant="secondary-overflow-entry"
        data-hbc-launcher-tile-variant="secondary-overflow-entry"
        data-hbc-overflow-mode={resolvedOverflowMode}
        data-hbc-homepage-launcher-sheet-content="all-tools"
        data-hbc-launcher-tile-family="row"
        data-hbc-launcher-tile-geometry="icon-forward-square"
        data-hbc-launcher-tile-size-contract="row"
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
            {totalTools}
          </span>
          <ChevronDown
            size={handheldLinearTrigger ? 12 : 14}
            className={handheldLinearTrigger ? styles.overflowTriggerChevronLinear : undefined}
            aria-hidden="true"
          />
        </span>
      </motion.button>
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
                className={clsx(
                  styles.sheetSurface,
                  !handheldLinearTrigger && resolvedOverflowMode === 'more-tools'
                    ? styles.sheetSurfaceDesktop
                    : undefined,
                )}
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
                data-hbc-launcher-drawer-display-class={
                  handheldLinearTrigger ? 'handheld-sheet' : 'desktop-company-tools'
                }
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
                    aria-label={`${totalTools} tools`}
                  >
                    {totalTools}
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
                  data-hbc-ui="homepage-launcher-overflow-tray"
                >
                  <div className={styles.drawerRailRoot}>
                    <div
                      className={styles.drawerTileGrid}
                      data-hbc-ui="homepage-launcher-drawer-rail"
                      data-hbc-launcher-drawer-layout="single-row-tray"
                      role="list"
                      aria-label="Company tools"
                      data-hbc-launcher-drawer-scroll="horizontal"
                      data-hbc-launcher-overflow-grouping="none"
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
                  <p
                    className={styles.drawerOverflowHint}
                    data-hbc-homepage-launcher-overflow-hint="single-row"
                  >
                    Swipe horizontally to see more tools.
                  </p>
                </div>
              </motion.div>
            </div>
          </FloatingFocusManager>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function HbcHomepageLauncherOverflow({
  items,
  label = 'More tools',
  overflowMode = 'more-tools',
  triggerMode = 'tile',
  className,
}: HbcHomepageLauncherOverflowProps): React.JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <DrawerOverflow
      items={items}
      label={label}
      overflowMode={overflowMode}
      triggerMode={triggerMode}
      className={className}
    />
  );
}
