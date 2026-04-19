/**
 * HbcHomepageLauncherOverflow — governed secondary tile command layer.
 *
 * Two interaction modes:
 *   - `menu`  — anchored floating menu for desktop/tablet. Uses
 *               @floating-ui/react for placement, flip, shift, and
 *               size-bounded height. Click-outside + Escape dismiss.
 *   - `sheet` — bottom-sheet modal for phone / short-height. Focus
 *               trapped; Escape + backdrop dismiss.
 *
 * The trigger is an inline secondary launcher tile with a count badge.
 */
import * as React from 'react';
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
  autoUpdate,
  offset,
  flip,
  shift,
  size,
} from '@floating-ui/react';
import type {
  HbcHomepageLauncherOverflowProps,
  HomepageLauncherTileModel,
} from './types.js';
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

function MenuItem({ tile }: { tile: HomepageLauncherTileModel }): React.JSX.Element {
  const Icon = tile.icon;
  const shouldOpenInNewTab = tile.openInNewTab ?? Boolean(tile.external);
  const isExternal = Boolean(tile.external);
  const linkProps = shouldOpenInNewTab
    ? { href: tile.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: tile.href };
  return (
    <a
      {...linkProps}
      role="menuitem"
      aria-label={tile.ariaLabel ?? tile.title}
      title={tile.title}
      className={styles.menuItem}
      data-hbc-ui="homepage-launcher-overflow-item"
      data-hbc-launcher-tile-id={tile.id}
      data-hbc-launcher-tile-service-key={tile.serviceKey}
      data-hbc-launcher-tile-group-key={tile.groupKey}
      data-hbc-launcher-tile-icon-key={tile.iconKey}
      data-hbc-launcher-tile-variant={tile.variant ?? 'secondary-overflow-entry'}
      data-hbc-launcher-tile-external={isExternal ? 'true' : undefined}
      data-hbc-launcher-tile-new-tab={shouldOpenInNewTab ? 'true' : undefined}
      data-hbc-chip-id={tile.id}
      data-hbc-chip-service-key={tile.serviceKey}
      data-hbc-chip-group-key={tile.groupKey}
      data-hbc-chip-icon-key={tile.iconKey}
      data-hbc-chip-external={isExternal ? 'true' : undefined}
      data-hbc-chip-new-tab={shouldOpenInNewTab ? 'true' : undefined}
    >
      {Icon ? (
        <span className={styles.menuItemIcon} aria-hidden="true">
          <Icon size={14} strokeWidth={2.25} />
        </span>
      ) : null}
      <span className={styles.menuItemTitle}>{tile.title}</span>
      {shouldOpenInNewTab ? <span className={styles.visuallyHidden}>(opens in new tab)</span> : null}
    </a>
  );
}

function MenuOverflow({
  items,
  label,
  className,
}: {
  items: HomepageLauncherTileModel[];
  label: string;
  className?: string;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [maxHeight, setMaxHeight] = React.useState<number>(360);
  const groupedItems = React.useMemo(() => resolveOverflowGroups(items), [items]);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-end',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ fallbackPlacements: ['top-end', 'bottom-start', 'top-start'] }),
      shift({ padding: 8 }),
      size({
        apply({ availableHeight }) {
          setMaxHeight(Math.max(200, Math.min(480, availableHeight - 12)));
        },
        padding: 8,
      }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <div className={className}>
      <button
        ref={refs.setReference}
        type="button"
        className={styles.overflowTile}
        data-hbc-ui="homepage-launcher-overflow-trigger"
        data-hbc-homepage-launcher-overflow-variant="secondary-overflow-entry"
        data-hbc-overflow-mode="menu"
        aria-haspopup="menu"
        aria-expanded={open}
        {...getReferenceProps()}
      >
        <Layers size={14} strokeWidth={2.25} aria-hidden="true" />
        <span className={styles.overflowTriggerLabel}>{label}</span>
        <span className={styles.overflowTriggerCount} aria-hidden="true">
          {items.length}
        </span>
        <ChevronDown size={12} aria-hidden="true" />
      </button>
      <FloatingPortal>
        <AnimatePresence>
          {open ? (
            <FloatingFocusManager context={context} modal={false} returnFocus>
              <motion.div
                ref={refs.setFloating}
                className={styles.menuSurface}
                style={{ ...floatingStyles, maxHeight }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                {...getFloatingProps()}
                aria-label={`${label} overflow`}
              >
                <div className={styles.overflowHeader} data-hbc-ui="homepage-launcher-overflow-header">
                  <span className={styles.overflowHeaderTitle}>{label}</span>
                  <span className={styles.overflowHeaderCount} aria-hidden="true">{items.length}</span>
                </div>
                {groupedItems.map((group) => (
                  <div
                    key={group.key}
                    className={styles.overflowGroup}
                    data-hbc-ui="homepage-launcher-overflow-group"
                    data-hbc-overflow-group-key={group.key}
                    data-hbc-overflow-group-size={group.items.length}
                  >
                    {group.title ? (
                      <div className={styles.overflowGroupTitle}>{group.title}</div>
                    ) : null}
                    {group.items.map((chip) => (
                      <MenuItem key={chip.id} tile={chip} />
                    ))}
                  </div>
                ))}
              </motion.div>
            </FloatingFocusManager>
          ) : null}
        </AnimatePresence>
      </FloatingPortal>
    </div>
  );
}

function SheetOverflow({
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
    <div className={className}>
      <button
        ref={refs.setReference}
        type="button"
        className={styles.overflowTile}
        data-hbc-ui="homepage-launcher-overflow-trigger"
        data-hbc-homepage-launcher-overflow-variant="mobile-entry"
        data-hbc-overflow-mode="sheet"
        aria-haspopup="dialog"
        aria-expanded={open}
        {...getReferenceProps()}
      >
        <Layers size={14} strokeWidth={2.25} aria-hidden="true" />
        <span className={styles.overflowTriggerLabel}>{label}</span>
        <span className={styles.overflowTriggerCount} aria-hidden="true">
          {items.length}
        </span>
        <ChevronDown size={12} aria-hidden="true" />
      </button>
      <FloatingPortal>
        <AnimatePresence>
          {open ? (
            <>
              <motion.div
                className={styles.sheetBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                aria-hidden="true"
              />
              <FloatingFocusManager context={context} modal returnFocus>
                <motion.div
                  ref={refs.setFloating}
                  className={styles.sheetSurface}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  {...getFloatingProps()}
                  aria-label={`${label} overflow`}
                >
                  <div className={styles.sheetHeader}>
                    <span className={styles.sheetTitle}>{label}</span>
                    <button
                      type="button"
                      className={styles.sheetClose}
                      onClick={() => setOpen(false)}
                      aria-label="Close overflow"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className={styles.sheetBody}>
                    {groupedItems.map((group) => (
                      <div
                        key={group.key}
                        className={styles.overflowGroup}
                        data-hbc-ui="homepage-launcher-overflow-group"
                        data-hbc-overflow-group-key={group.key}
                        data-hbc-overflow-group-size={group.items.length}
                      >
                        {group.title ? (
                          <div className={styles.overflowGroupTitle}>{group.title}</div>
                        ) : null}
                        {group.items.map((chip) => (
                          <MenuItem key={chip.id} tile={chip} />
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FloatingFocusManager>
            </>
          ) : null}
        </AnimatePresence>
      </FloatingPortal>
    </div>
  );
}

export function HbcHomepageLauncherOverflow({
  items,
  label = 'More tools',
  mode,
  className,
}: HbcHomepageLauncherOverflowProps): React.JSX.Element | null {
  if (items.length === 0) return null;
  return mode === 'sheet' ? (
    <SheetOverflow items={items} label={label} className={className} />
  ) : (
    <MenuOverflow items={items} label={label} className={className} />
  );
}
