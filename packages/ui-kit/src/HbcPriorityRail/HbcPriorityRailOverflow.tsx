/**
 * HbcPriorityRailOverflow — Strategy-aware overflow system.
 *
 * Three distinct interaction models, all with:
 *   - explicit keyboard dismissal (Escape)
 *   - focus return to the trigger on close
 *   - tall-list safety via @radix-ui/react-scroll-area
 *
 * Strategies:
 *   - inline-disclosure — in-flow expandable region (accordion).
 *   - menu             — anchored floating menu with collision handling
 *                        and outside-click dismissal (@floating-ui/react).
 *   - sheet            — modal bottom-sheet overlay with a focus trap and
 *                        explicit close affordance (@floating-ui/react).
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, X } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import * as ScrollArea from '@radix-ui/react-scroll-area';
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
import { HbcPriorityRailAction } from './HbcPriorityRailAction.js';
import type { HbcPriorityRailOverflowProps, PriorityRailActionModel } from './types.js';
import styles from './priority-rail.module.css';

const INLINE_SCROLLABLE_THRESHOLD = 8;
const MENU_SCROLLABLE_THRESHOLD = 6;
const SHEET_SCROLLABLE_THRESHOLD = 6;

function renderActionList(
  items: readonly PriorityRailActionModel[],
  showBadges: boolean,
  compact: boolean,
): React.JSX.Element {
  return (
    <>
      {items.map((action, i) => (
        <React.Fragment key={action.id}>
          {i > 0 ? <Separator.Root className={styles.itemSeparator} decorative /> : null}
          <HbcPriorityRailAction action={action} showBadge={showBadges} compact={compact} />
        </React.Fragment>
      ))}
    </>
  );
}

function ScrollableList({
  children,
  maxHeight,
}: {
  children: React.ReactNode;
  maxHeight: number;
}): React.JSX.Element {
  return (
    <ScrollArea.Root className={styles.overflowScrollRoot} style={{ maxHeight }}>
      <ScrollArea.Viewport className={styles.overflowScrollViewport}>{children}</ScrollArea.Viewport>
      <ScrollArea.Scrollbar className={styles.overflowScrollbar} orientation="vertical">
        <ScrollArea.Thumb className={styles.overflowScrollbarThumb} />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

/* ── Inline disclosure ────────────────────────────────────────── */

function InlineOverflow({
  items,
  label,
  showBadges,
  className,
}: {
  items: readonly PriorityRailActionModel[];
  label: string;
  showBadges: boolean;
  className?: string;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const list = renderActionList(items, showBadges, false);
  const scrollable = items.length > INLINE_SCROLLABLE_THRESHOLD;

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.overflowTrigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>
          {label} ({items.length})
        </span>
        <ChevronDown
          size={14}
          className={clsx(styles.overflowChevron, open && styles.overflowChevronOpen)}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            className={clsx(styles.overflowPanel, styles.overflowPanelInline)}
            role="region"
            aria-label={`${label} overflow actions`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                close();
              }
            }}
          >
            {scrollable ? <ScrollableList maxHeight={320}>{list}</ScrollableList> : list}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ── Anchored menu ────────────────────────────────────────────── */

function MenuOverflow({
  items,
  label,
  showBadges,
  className,
}: {
  items: readonly PriorityRailActionModel[];
  label: string;
  showBadges: boolean;
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
      offset(6),
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

  const list = renderActionList(items, showBadges, true);
  const scrollable = items.length > MENU_SCROLLABLE_THRESHOLD;

  return (
    <div className={className}>
      <button
        ref={refs.setReference}
        type="button"
        className={styles.overflowTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        {...getReferenceProps()}
      >
        <span>
          {label} ({items.length})
        </span>
        <ChevronDown
          size={14}
          className={clsx(styles.overflowChevron, open && styles.overflowChevronOpen)}
          aria-hidden="true"
        />
      </button>
      <FloatingPortal>
        <AnimatePresence>
          {open ? (
            <FloatingFocusManager context={context} modal={false} returnFocus>
              <motion.div
                ref={refs.setFloating}
                className={clsx(styles.overflowPanel, styles.overflowFloatingMenu)}
                style={floatingStyles}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                {...getFloatingProps()}
                aria-label={`${label} overflow actions`}
                aria-labelledby={undefined}
              >
                {scrollable ? <ScrollableList maxHeight={maxHeight}>{list}</ScrollableList> : list}
              </motion.div>
            </FloatingFocusManager>
          ) : null}
        </AnimatePresence>
      </FloatingPortal>
    </div>
  );
}

/* ── Modal sheet ──────────────────────────────────────────────── */

function SheetOverflow({
  items,
  label,
  showBadges,
  className,
}: {
  items: readonly PriorityRailActionModel[];
  label: string;
  showBadges: boolean;
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

  const list = renderActionList(items, showBadges, true);
  const scrollable = items.length > SHEET_SCROLLABLE_THRESHOLD;

  return (
    <div className={className}>
      <button
        ref={refs.setReference}
        type="button"
        className={styles.overflowTrigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        {...getReferenceProps()}
      >
        <span>
          {label} ({items.length})
        </span>
        <ChevronDown
          size={14}
          className={clsx(styles.overflowChevron, open && styles.overflowChevronOpen)}
          aria-hidden="true"
        />
      </button>
      <FloatingPortal>
        <AnimatePresence>
          {open ? (
            <>
              <motion.div
                className={styles.overflowSheetBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                aria-hidden="true"
              />
              <FloatingFocusManager context={context} modal returnFocus>
                <motion.div
                  ref={refs.setFloating}
                  className={clsx(styles.overflowPanel, styles.overflowSheetSurface)}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  {...getFloatingProps()}
                  aria-label={`${label} overflow actions`}
                  aria-labelledby={undefined}
                >
                  <div className={styles.overflowSheetHeader}>
                    <div className={styles.overflowSheetTitle}>{label}</div>
                    <button
                      type="button"
                      className={styles.overflowClose}
                      onClick={() => setOpen(false)}
                      aria-label="Close overflow"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className={styles.overflowSheetBody}>
                    {scrollable ? <ScrollableList maxHeight={420}>{list}</ScrollableList> : list}
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

/* ── Public entry ─────────────────────────────────────────────── */

export function HbcPriorityRailOverflow({
  items,
  label = 'More tools',
  strategy = 'inline-disclosure',
  showBadges = true,
  className,
}: HbcPriorityRailOverflowProps): React.JSX.Element | null {
  if (items.length === 0) return null;

  if (strategy === 'menu') {
    return <MenuOverflow items={items} label={label} showBadges={showBadges} className={className} />;
  }
  if (strategy === 'sheet') {
    return <SheetOverflow items={items} label={label} showBadges={showBadges} className={className} />;
  }
  return <InlineOverflow items={items} label={label} showBadges={showBadges} className={className} />;
}
