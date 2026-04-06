/**
 * HbcDiscoverySurface — Search, suggestion, and wayfinding surface
 * Phase 17-03 — Shared primitive system rebuild
 *
 * Purpose-built surface for search input, suggestion lists, quick paths,
 * promoted destinations, and category shelves. Warm-tinted with inviting,
 * active discovery behavior.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Search, ArrowRight } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import type { LucideIcon } from 'lucide-react';
import styles from './discovery-surface.module.css';

export interface DiscoveryQuickPath {
  id: string;
  label: string;
  icon?: LucideIcon;
  href: string;
}

export interface DiscoveryCategoryItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  href: string;
}

export interface DiscoveryCategory {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: DiscoveryCategoryItem[];
}

export interface DiscoveryPromotedItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  href: string;
}

export interface HbcDiscoverySurfaceProps {
  /** Search input slot — render your own input or use the built-in shell */
  searchSlot?: React.ReactNode;
  /** Placeholder text for the built-in search shell */
  searchPlaceholder?: string;
  quickPaths?: DiscoveryQuickPath[];
  categories?: DiscoveryCategory[];
  promoted?: DiscoveryPromotedItem[];
  className?: string;
  'aria-label'?: string;
}

export function HbcDiscoverySurface({
  searchSlot,
  searchPlaceholder = 'Search tools, forms, policies, spaces…',
  quickPaths,
  categories,
  promoted,
  className,
  'aria-label': ariaLabel = 'Search and discovery',
}: HbcDiscoverySurfaceProps): React.JSX.Element {
  return (
    <section
      aria-label={ariaLabel}
      className={clsx(styles.root, className)}
      data-hbc-premium="discovery-surface"
    >
      {/* Search area */}
      <div className={styles.searchArea}>
        {searchSlot ?? (
          <div className={styles.searchInput}>
            <span className={styles.searchIcon} aria-hidden="true">
              <Search size={18} strokeWidth={2} />
            </span>
            <span style={{ color: 'rgba(26,26,26,0.40)', fontSize: '0.875rem' }}>
              {searchPlaceholder}
            </span>
          </div>
        )}
      </div>

      {/* Quick paths */}
      {quickPaths && quickPaths.length > 0 ? (
        <>
          <Separator.Root className={styles.separator} decorative />
          <div className={styles.quickPaths}>
            {quickPaths.map((qp) => {
              const QpIcon = qp.icon;
              return (
                <motion.a
                  key={qp.id}
                  href={qp.href}
                  className={styles.quickPath}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                >
                  {QpIcon ? (
                    <span className={styles.quickPathIcon} aria-hidden="true">
                      <QpIcon size={14} strokeWidth={2} />
                    </span>
                  ) : null}
                  <span>{qp.label}</span>
                </motion.a>
              );
            })}
          </div>
        </>
      ) : null}

      {/* Categories */}
      {categories && categories.length > 0 ? (
        <>
          <Separator.Root className={styles.separator} decorative />
          <div className={styles.categories}>
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.id}>
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryTitle}>
                      {CatIcon ? (
                        <span className={styles.categoryTitleIcon} aria-hidden="true">
                          <CatIcon size={12} strokeWidth={2.5} />
                        </span>
                      ) : null}
                      <span>{cat.label}</span>
                    </div>
                  </div>
                  <div className={styles.categoryItems}>
                    {cat.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <a key={item.id} href={item.href} className={styles.categoryItem}>
                          {ItemIcon ? (
                            <span className={styles.categoryItemIcon} aria-hidden="true">
                              <ItemIcon size={14} strokeWidth={2} />
                            </span>
                          ) : null}
                          <span className={styles.categoryItemLabel}>{item.label}</span>
                          <ArrowRight size={12} className={styles.categoryItemArrow} aria-hidden="true" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {/* Promoted destinations */}
      {promoted && promoted.length > 0 ? (
        <>
          <Separator.Root className={styles.separator} decorative />
          <div className={styles.promoted}>
            {promoted.map((p) => {
              const PIcon = p.icon;
              return (
                <motion.a
                  key={p.id}
                  href={p.href}
                  className={styles.promotedItem}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.12 }}
                >
                  {PIcon ? (
                    <span className={styles.promotedIcon} aria-hidden="true">
                      <PIcon size={16} strokeWidth={2} />
                    </span>
                  ) : null}
                  <span className={styles.promotedLabel}>{p.label}</span>
                </motion.a>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}
