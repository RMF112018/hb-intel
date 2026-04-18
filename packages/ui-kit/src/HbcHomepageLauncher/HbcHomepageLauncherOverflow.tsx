/**
 * HbcHomepageLauncherOverflow — governed secondary command layer.
 *
 * Two interaction modes:
 *   - `menu`  — anchored floating menu for desktop/tablet. Uses
 *               @floating-ui/react for placement, flip, shift, and
 *               size-bounded height. Click-outside + Escape dismiss.
 *   - `sheet` — bottom-sheet modal for phone / short-height. Focus
 *               trapped; Escape + backdrop dismiss.
 *
 * The trigger is a discrete "More tools" capsule with a count badge —
 * it is deliberately distinguishable from the primary chips so the
 * hierarchy reads as "primary row + escape hatch", not "one more chip".
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
  HomepageLauncherChipModel,
} from './types.js';
import styles from './homepage-launcher.module.css';

function MenuItem({ chip }: { chip: HomepageLauncherChipModel }): React.JSX.Element {
  const Icon = chip.icon;
  const isExternal = Boolean(chip.external);
  const linkProps = isExternal
    ? { href: chip.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: chip.href };
  return (
    <a
      {...linkProps}
      role="menuitem"
      className={styles.menuItem}
      data-hbc-ui="homepage-launcher-overflow-item"
      data-hbc-chip-id={chip.id}
    >
      {Icon ? (
        <span className={styles.menuItemIcon} aria-hidden="true">
          <Icon size={14} strokeWidth={2.25} />
        </span>
      ) : null}
      <span>{chip.title}</span>
      {isExternal ? <span className={styles.visuallyHidden}>(opens in new tab)</span> : null}
    </a>
  );
}

function MenuOverflow({
  items,
  label,
  className,
}: {
  items: HomepageLauncherChipModel[];
  label: string;
  className?: string;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [maxHeight, setMaxHeight] = React.useState<number>(360);

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
        className={styles.overflowTrigger}
        data-hbc-ui="homepage-launcher-overflow-trigger"
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
                {items.map((chip) => (
                  <MenuItem key={chip.id} chip={chip} />
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
  items: HomepageLauncherChipModel[];
  label: string;
  className?: string;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
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
        className={styles.overflowTrigger}
        data-hbc-ui="homepage-launcher-overflow-trigger"
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
                    {items.map((chip) => (
                      <MenuItem key={chip.id} chip={chip} />
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
