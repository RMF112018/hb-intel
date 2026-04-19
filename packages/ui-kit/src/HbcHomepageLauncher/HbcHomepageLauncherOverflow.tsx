/**
 * HbcHomepageLauncherOverflow — governed launcher drawer expansion.
 *
 * Overflow is a single bottom drawer pattern across all display classes.
 * The trigger remains inline in the launcher row and opens a tile-based
 * all-tools surface with focus management and keyboard dismissal.
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

interface OverflowGroup {
  key: string;
  title?: string;
  items: HomepageLauncherTileModel[];
}

function resolveOverflowGroups(items: HomepageLauncherTileModel[]): OverflowGroup[] {
  const byKey = new Map<string, OverflowGroup>();
  for (const tile of items) {
    const normalizedGroupKey = tile.groupKey?.trim().toLowerCase() || '__ungrouped';
    const groupTitle = tile.groupTitle?.trim() || undefined;
    const existing = byKey.get(normalizedGroupKey);
    if (existing) {
      existing.items.push(tile);
      if (!existing.title && groupTitle) existing.title = groupTitle;
      continue;
    }
    byKey.set(normalizedGroupKey, {
      key: normalizedGroupKey,
      title:
        normalizedGroupKey === '__ungrouped'
          ? undefined
          : (groupTitle ?? tile.groupKey?.trim()),
      items: [tile],
    });
  }

  const groups = Array.from(byKey.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => {
      if (a.key === '__ungrouped') return 1;
      if (b.key === '__ungrouped') return -1;
      return (a.title ?? a.key).localeCompare(b.title ?? b.key);
    });
  return groups;
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
  const descriptionId = React.useId();
  const groupedItems = React.useMemo(() => resolveOverflowGroups(items), [items]);
  const { refs, context } = useFloating({
    open,
    onOpenChange: setOpen,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const closeSheet = React.useCallback(() => setOpen(false), []);
  const surfaceTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: 'easeOut' as const };
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
          className={clsx(
            styles.tileIcon,
            styles.tileIconCompliant,
            styles.tileIconDrawer,
            styles.triggerIcon,
          )}
          aria-hidden="true"
        >
          <Layers size={16} strokeWidth={2.2} />
        </span>
        <span className={styles.overflowTriggerLabel}>{label}</span>
        <span className={styles.overflowTriggerCount} aria-hidden="true">
          {items.length}
        </span>
        <ChevronDown size={12} aria-hidden="true" />
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
                  aria-describedby={descriptionId}
                  data-hbc-homepage-launcher-sheet-content="all-tools"
                >
                  <div className={styles.sheetHeader}>
                    <div className={styles.sheetHeading}>
                      <span id={titleId} className={styles.sheetTitle}>{label}</span>
                      <span id={descriptionId} className={styles.sheetSubtitle}>
                        Launcher tools grouped for quick scan and keyboard-safe access.
                      </span>
                    </div>
                    <span className={styles.overflowHeaderCount} aria-hidden="true">
                      {items.length}
                    </span>
                    <button
                      type="button"
                      className={styles.sheetClose}
                      onClick={closeSheet}
                      aria-label={`Close ${label}`}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className={styles.drawerBody}>
                    {groupedItems.map((group) => (
                      <section
                        key={group.key}
                        className={styles.drawerGroup}
                        data-hbc-ui="homepage-launcher-overflow-group"
                        data-hbc-overflow-group-key={group.key}
                        data-hbc-overflow-group-size={group.items.length}
                      >
                        {group.title ? (
                          <h3 className={styles.overflowGroupTitle}>{group.title}</h3>
                        ) : null}
                        <div className={styles.drawerTileGrid}>
                          {group.items.map((tile) => (
                            <HbcHomepageLauncherTile
                              key={tile.id}
                              tile={tile}
                              family="drawer"
                              className={styles.drawerTile}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
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
