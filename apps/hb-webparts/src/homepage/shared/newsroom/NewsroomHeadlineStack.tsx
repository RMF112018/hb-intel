/**
 * NewsroomHeadlineStack — subordinate supporting headline rail.
 * Wave 04 — CSS-module premium surface architecture.
 *
 * Compact secondary story list with category chips, byline/date
 * metadata, and optional CTA links. Hover and focus-visible states
 * handled entirely by CSS module.
 */
import * as React from 'react';
import {
  motion,
  Clock,
  FileText,
} from '@hbc/ui-kit/homepage';
import type { ResponsiveTier } from '../useResponsiveTier.js';
import { NewsroomCategoryChip } from './NewsroomCategoryChip.js';
import { getNrRailMotion } from './NewsroomPalette.js';
import type { CompanyPulseItem } from '../../webparts/communicationsContracts.js';
import s from './newsroom-surface.module.css';

export interface NewsroomHeadlineStackProps {
  items: CompanyPulseItem[];
  tier: ResponsiveTier;
  reducedMotion: boolean;
  header?: string;
}

/* ── Headline item ────────────────────────────────────────────── */

function HeadlineItem({ item }: { item: CompanyPulseItem }): React.JSX.Element {
  const Tag = item.cta?.href ? 'a' : 'div';
  const tagProps = item.cta?.href ? { href: item.cta.href } : {};

  return (
    <Tag {...tagProps} className={s.headlineItem}>
      <span className={s.headlineIcon} aria-hidden="true">
        <FileText size={14} strokeWidth={2} />
      </span>

      <div className={s.headlineContent}>
        <span className={s.headlineTitle}>{item.title}</span>

        <div className={s.headlineMeta}>
          {item.category ? (
            <NewsroomCategoryChip category={item.category} size="sm" />
          ) : null}
          {item.byline ? <span>{item.byline}</span> : null}
          {item.publishDate ? (
            <span className={s.featuredDate}>
              <Clock size={10} aria-hidden="true" className={s.headlineDateIcon} />
              {item.publishDate}
            </span>
          ) : null}
        </div>
      </div>
    </Tag>
  );
}

/* ── Component ────────────────────────────────────────────────── */

export function NewsroomHeadlineStack({ items, tier, reducedMotion, header }: NewsroomHeadlineStackProps): React.JSX.Element | null {
  if (items.length === 0) return null;

  const railMotion = getNrRailMotion(reducedMotion);
  const isMobile = tier === 'mobile';

  return (
    <motion.div
      className={isMobile ? s.railMobile : s.rail}
      {...railMotion}
    >
      {header ? <h4 className={s.railHeader}>{header}</h4> : null}

      {items.map((item, i) => (
        <React.Fragment key={item.id}>
          {i > 0 ? <hr className={s.railDivider} /> : null}
          <HeadlineItem item={item} />
        </React.Fragment>
      ))}
    </motion.div>
  );
}
