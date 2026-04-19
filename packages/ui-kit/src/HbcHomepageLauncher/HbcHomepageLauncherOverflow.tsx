/**
 * HbcHomepageLauncherOverflow — governed launcher drawer expansion.
 *
 * Overflow is a single bottom drawer pattern across all display classes.
 * The trigger remains inline in the launcher row and opens a tile-based
 * all-tools surface with focus management and keyboard dismissal.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
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
import { HbcHomepageLauncherIcon } from './HbcHomepageLauncherIcon.js';
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

function DrawerTile({ tile }: { tile: HomepageLauncherTileModel }): React.JSX.Element {
  const shouldOpenInNewTab = tile.openInNewTab ?? Boolean(tile.external);
  const isExternal = Boolean(tile.external);
  const computedAriaLabel = tile.ariaLabel ?? (tile.description ? `${tile.title}. ${tile.description}` : tile.title);
  const linkProps = shouldOpenInNewTab
    ? { href: tile.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: tile.href };

  return (
    <motion.a
      {...linkProps}
      aria-label={computedAriaLabel}
      title={tile.title}
      className={clsx(launcherTile({ family: 'primary' }), styles.drawerTile)}
      data-hbc-ui="homepage-launcher-drawer-tile"
      data-hbc-launcher-tile-id={tile.id}
      data-hbc-launcher-tile-service-key={tile.serviceKey}
      data-hbc-launcher-tile-group-key={tile.groupKey}
      data-hbc-launcher-tile-icon-key={tile.iconKey}
      data-hbc-launcher-tile-icon-source={tile.iconAssetSrc ? 'asset' : tile.icon ? 'lucide' : undefined}
      data-hbc-launcher-tile-variant={tile.variant ?? 'primary'}
      data-hbc-launcher-tile-external={isExternal ? 'true' : undefined}
      data-hbc-launcher-tile-new-tab={shouldOpenInNewTab ? 'true' : undefined}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.14 }}
    >
      <HbcHomepageLauncherIcon tile={tile} />
      <span className={styles.drawerTileTitle}>{tile.title}</span>
      {shouldOpenInNewTab ? <span className={styles.visuallyHidden}>(opens in new tab)</span> : null}
    </motion.a>
  );
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
  const groupedItems = React.useMemo(() => resolveOverflowGroups(items), [items]);
  const { refs, context } = useFloating({
    open,
    onOpenChange: setOpen,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

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
        aria-haspopup="dialog"
        aria-expanded={open}
        {...getReferenceProps()}
      >
        <span className={clsx(styles.tileIcon, styles.tileIconCompliant, styles.triggerIcon)} aria-hidden="true">
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
              <>
                <motion.div
                  className={styles.sheetBackdrop}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  aria-hidden="true"
                />
                <motion.div
                  ref={refs.setFloating}
                  className={styles.sheetSurface}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  {...getFloatingProps()}
                  aria-label={`${label} all tools`}
                  data-hbc-homepage-launcher-sheet-content="all-tools"
                >
                  <div className={styles.sheetHeader}>
                    <span className={styles.sheetTitle}>{label}</span>
                    <span className={styles.overflowHeaderCount} aria-hidden="true">
                      {items.length}
                    </span>
                    <button
                      type="button"
                      className={styles.sheetClose}
                      onClick={() => setOpen(false)}
                      aria-label="Close overflow"
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
                            <DrawerTile key={tile.id} tile={tile} />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </motion.div>
              </>
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
