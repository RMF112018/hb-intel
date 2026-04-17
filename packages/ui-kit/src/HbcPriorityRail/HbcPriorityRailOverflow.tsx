/**
 * HbcPriorityRailOverflow — Expandable overflow section.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { HbcPriorityRailAction } from './HbcPriorityRailAction.js';
import * as Separator from '@radix-ui/react-separator';
import type { HbcPriorityRailOverflowProps } from './types.js';
import styles from './priority-rail.module.css';

export function HbcPriorityRailOverflow({
  items,
  label = 'More tools',
  showBadges = true,
  className,
}: HbcPriorityRailOverflowProps): React.JSX.Element | null {
  const [open, setOpen] = React.useState(false);

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <button
        type="button"
        className={styles.overflowTrigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
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
            className={styles.overflowPanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {items.map((action, i) => (
              <React.Fragment key={action.id}>
                {i > 0 ? <Separator.Root className={styles.itemSeparator} decorative /> : null}
                <HbcPriorityRailAction action={action} showBadge={showBadges} />
              </React.Fragment>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
