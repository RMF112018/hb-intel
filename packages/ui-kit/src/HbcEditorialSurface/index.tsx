/**
 * HbcEditorialSurface — Magazine-like editorial content surface
 * Phase 17-03 — Shared primitive system rebuild
 *
 * Purpose-built surface for leadership messages, company pulse,
 * people and culture, and curated editorial content. Features a
 * featured/secondary rhythm with warm accent hierarchy and Radix
 * separator for visual cadence.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import * as Separator from '@radix-ui/react-separator';
import type { LucideIcon } from 'lucide-react';
import styles from './editorial-surface.module.css';

export interface EditorialFeaturedItem {
  eyebrow?: string;
  title: string;
  excerpt?: string;
  meta?: React.ReactNode;
  cta?: React.ReactNode;
  media?: React.ReactNode;
}

export interface EditorialSecondaryItem {
  id: string;
  title: string;
  meta?: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
}

export interface HbcEditorialSurfaceProps {
  title: string;
  icon?: LucideIcon;
  headerAction?: React.ReactNode;
  featured?: EditorialFeaturedItem;
  items?: EditorialSecondaryItem[];
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function HbcEditorialSurface({
  title,
  icon: HeaderIcon,
  headerAction,
  featured,
  items,
  children,
  className,
  'aria-label': ariaLabel,
}: HbcEditorialSurfaceProps): React.JSX.Element {
  return (
    <section
      aria-label={ariaLabel ?? title}
      className={clsx(styles.root, className)}
      data-hbc-premium="editorial-surface"
    >
      {/* Header */}
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

      {/* Content */}
      <div className={styles.content}>
        {/* Featured item */}
        {featured ? (
          <motion.div
            className={styles.featured}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {featured.eyebrow ? (
              <span className={styles.featuredEyebrow}>{featured.eyebrow}</span>
            ) : null}
            <h3 className={styles.featuredTitle}>{featured.title}</h3>
            {featured.excerpt ? (
              <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
            ) : null}
            {featured.media ? (
              <div className={styles.featuredMedia}>{featured.media}</div>
            ) : null}
            {featured.meta ? (
              <div className={styles.featuredMeta}>{featured.meta}</div>
            ) : null}
            {featured.cta ? (
              <div className={styles.featuredCta}>{featured.cta}</div>
            ) : null}
          </motion.div>
        ) : null}

        {/* Secondary items */}
        {items && items.length > 0 ? (
          <>
            {featured ? <Separator.Root className={styles.itemSeparator} decorative /> : null}
            <div className={styles.secondaryList}>
              {items.map((item, i) => {
                const ItemIcon = item.icon;
                const Tag = item.href ? 'a' : 'div';
                const tagProps = item.href
                  ? { href: item.href }
                  : { role: 'button' as const, tabIndex: 0, onClick: item.onClick };

                return (
                  <React.Fragment key={item.id}>
                    {i > 0 ? <Separator.Root className={styles.itemSeparator} decorative /> : null}
                    <Tag className={styles.secondaryItem} {...tagProps}>
                      {ItemIcon ? (
                        <span className={styles.secondaryIcon} aria-hidden="true">
                          <ItemIcon size={14} strokeWidth={2} />
                        </span>
                      ) : null}
                      <div className={styles.secondaryContent}>
                        <span className={styles.secondaryTitle}>{item.title}</span>
                        {item.meta ? (
                          <span className={styles.secondaryMeta}>{item.meta}</span>
                        ) : null}
                      </div>
                    </Tag>
                  </React.Fragment>
                );
              })}
            </div>
          </>
        ) : null}

        {/* Custom children */}
        {children}
      </div>
    </section>
  );
}
