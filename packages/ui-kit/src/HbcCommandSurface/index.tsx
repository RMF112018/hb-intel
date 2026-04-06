/**
 * HbcCommandSurface — Dense, efficient command surface
 * Phase 17-03 — Shared primitive system rebuild
 *
 * Purpose-built surface for urgent actions, approvals, and task queues.
 * Dense but premium interaction with urgency-aware visual treatment.
 * Uses Radix separator for item hierarchy and motion for hover feedback.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import type { LucideIcon } from 'lucide-react';
import styles from './command-surface.module.css';

const commandSurface = cva(styles.root, {
  variants: {
    urgency: {
      default: styles.urgencyDefault,
      high: styles.urgencyHigh,
      critical: styles.urgencyCritical,
    },
  },
  defaultVariants: {
    urgency: 'default',
  },
});

export type CommandUrgency = 'default' | 'high' | 'critical';

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface HbcCommandSurfaceProps extends VariantProps<typeof commandSurface> {
  title: string;
  icon?: LucideIcon;
  headerAction?: React.ReactNode;
  items: CommandItem[];
  className?: string;
  'aria-label'?: string;
}

export function HbcCommandSurface({
  title,
  icon: HeaderIcon,
  headerAction,
  items,
  urgency,
  className,
  'aria-label': ariaLabel,
}: HbcCommandSurfaceProps): React.JSX.Element {
  return (
    <section
      aria-label={ariaLabel ?? title}
      className={clsx(commandSurface({ urgency }), className)}
      data-hbc-premium="command-surface"
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          {HeaderIcon ? (
            <span className={styles.headerIcon} aria-hidden="true">
              <HeaderIcon size={16} strokeWidth={2} />
            </span>
          ) : null}
          <span>{title}</span>
        </div>
        {headerAction ? <div className={styles.headerAction}>{headerAction}</div> : null}
      </div>

      <Separator.Root className={styles.separator} decorative />

      <div className={styles.items} role="list">
        {items.map((item, i) => {
          const IconComponent = item.icon;
          const Tag = item.href ? 'a' : 'div';
          const linkProps = item.href
            ? { href: item.href }
            : { role: 'button', tabIndex: 0, onClick: item.onClick };

          return (
            <React.Fragment key={item.id}>
              {i > 0 ? <Separator.Root className={styles.itemSeparator} decorative /> : null}
              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.12 }}>
                <Tag className={styles.item} {...linkProps}>
                  {IconComponent ? (
                    <span className={styles.itemIcon} aria-hidden="true">
                      <IconComponent size={16} strokeWidth={2} />
                    </span>
                  ) : null}
                  <div className={styles.itemContent}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    {item.description ? (
                      <span className={styles.itemDescription}>{item.description}</span>
                    ) : null}
                  </div>
                  {item.badge ? <span className={styles.itemBadge}>{item.badge}</span> : null}
                  <ArrowRight size={12} className={styles.itemArrow} aria-hidden="true" />
                </Tag>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
