/**
 * HbcPriorityRailOverflow — Expandable overflow section.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, X } from 'lucide-react';
import { HbcPriorityRailAction } from './HbcPriorityRailAction.js';
import * as Separator from '@radix-ui/react-separator';
import type { HbcPriorityRailOverflowProps } from './types.js';
import styles from './priority-rail.module.css';

function strategyPanelClass(strategy: NonNullable<HbcPriorityRailOverflowProps['strategy']>): string {
  switch (strategy) {
    case 'menu':
      return styles.overflowPanelMenu;
    case 'sheet':
      return styles.overflowPanelSheet;
    case 'inline-disclosure':
    default:
      return styles.overflowPanelInline;
  }
}

export function HbcPriorityRailOverflow({
  items,
  label = 'More tools',
  strategy = 'inline-disclosure',
  showBadges = true,
  className,
}: HbcPriorityRailOverflowProps): React.JSX.Element | null {
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <button
        type="button"
        className={styles.overflowTrigger}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup={strategy === 'menu' ? 'menu' : strategy === 'sheet' ? 'dialog' : undefined}
      >
        <span>{label} ({items.length})</span>
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
            className={clsx(styles.overflowPanel, strategyPanelClass(strategy))}
            role={strategy === 'menu' ? 'menu' : strategy === 'sheet' ? 'dialog' : 'region'}
            aria-label={`${label} overflow actions`}
            aria-modal={strategy === 'sheet' ? false : undefined}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false);
              }
            }}
          >
            {strategy === 'sheet' ? (
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
            ) : null}

            <div className={strategy === 'sheet' ? styles.overflowSheetBody : undefined}>
              {items.map((action, i) => (
                <React.Fragment key={action.id}>
                  {i > 0 ? <Separator.Root className={styles.itemSeparator} decorative /> : null}
                  <HbcPriorityRailAction action={action} showBadge={showBadges} compact={strategy === 'sheet'} />
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
