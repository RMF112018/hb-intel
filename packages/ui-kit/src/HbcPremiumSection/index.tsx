/**
 * HbcPremiumSection — Premium section header with icon and separator
 * Phase 16-02 — Shared premium primitive rebuild
 *
 * Replaces the mild HbcHomepageSectionShell with a stronger section
 * treatment that uses lucide icons, Radix separator, and cva variants
 * for zone-aware header presentation.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import * as Separator from '@radix-ui/react-separator';
import type { LucideIcon } from 'lucide-react';
import styles from './section.module.css';

const sectionHeader = cva(styles.headerBase, {
  variants: {
    accent: {
      brand: styles.accentBrand,
      warm: styles.accentWarm,
      neutral: styles.accentNeutral,
      danger: styles.accentDanger,
    },
  },
  defaultVariants: {
    accent: 'brand',
  },
});

export type PremiumSectionAccent = 'brand' | 'warm' | 'neutral' | 'danger';

export interface HbcPremiumSectionProps extends VariantProps<typeof sectionHeader> {
  title: string;
  subtitle?: string;
  /** Lucide icon for the section (rendered in the header) */
  icon?: LucideIcon;
  /** Trailing action slot (e.g., "See all" CTA) */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function HbcPremiumSection({
  title,
  subtitle,
  icon: IconComponent,
  accent,
  headerAction,
  children,
  className,
}: HbcPremiumSectionProps): React.JSX.Element {
  return (
    <section aria-label={title} className={clsx(styles.root, className)} data-hbc-premium="section">
      <div className={clsx(sectionHeader({ accent }))}>
        <div className={styles.titleGroup}>
          {IconComponent ? (
            <span className={styles.titleIcon} aria-hidden="true">
              <IconComponent size={18} strokeWidth={2} />
            </span>
          ) : null}
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
        </div>
        {headerAction}
      </div>
      <Separator.Root className={styles.separator} decorative />
      <div className={styles.content}>{children}</div>
    </section>
  );
}
