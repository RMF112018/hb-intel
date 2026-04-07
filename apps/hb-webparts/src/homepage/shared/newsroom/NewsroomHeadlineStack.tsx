/**
 * NewsroomHeadlineStack — subordinate supporting headline rail.
 * Wave 02 — CompanyPulse newsroom primitives.
 *
 * Compact secondary story list with category chips, byline/date
 * metadata, and optional CTA links. Visually subordinate to the
 * featured story zone — uses the newsroom rail background tint
 * and restrained typography.
 *
 * Modeled on ProjectPortfolioSpotlight's supporting rail pattern
 * but tuned for editorial headlines (no thumbnails, stronger
 * headline density, category-first scanning).
 */
import * as React from 'react';
import {
  motion,
  Clock,
  FileText,
} from '@hbc/ui-kit/homepage';
import type { ResponsiveTier } from '../useResponsiveTier.js';
import { NewsroomCategoryChip } from './NewsroomCategoryChip.js';
import { NR_PALETTE, getNrRailMotion } from './NewsroomPalette.js';
import type { CompanyPulseItem } from '../../webparts/communicationsContracts.js';

export interface NewsroomHeadlineStackProps {
  items: CompanyPulseItem[];
  tier: ResponsiveTier;
  reducedMotion: boolean;
  header?: string;
}

/* ── Style helpers ────────────────────────────────────────────── */

function getRailStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    background: NR_PALETTE.railBg,
    padding: tier === 'mobile' ? '12px 16px 16px' : '16px 20px 20px',
    gap: 0,
  };
}

const headlineItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '12px 8px',
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
  borderRadius: 6,
  transition: 'background-color 150ms ease',
};

const headlineItemHoverStyle: React.CSSProperties = {
  ...headlineItemStyle,
  background: NR_PALETTE.railHover,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: NR_PALETTE.itemDivider,
  border: 'none',
  margin: 0,
};

/* ── Headline item ────────────────────────────────────────────── */

function HeadlineItem({ item }: { item: CompanyPulseItem }): React.JSX.Element {
  const [hovered, setHovered] = React.useState(false);

  const Tag = item.cta?.href ? 'a' : 'div';
  const tagProps = item.cta?.href
    ? { href: item.cta.href }
    : {};

  return (
    <Tag
      {...tagProps}
      style={hovered ? headlineItemHoverStyle : headlineItemStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 6,
          background: NR_PALETTE.eyebrowBg,
          color: NR_PALETTE.eyebrow,
          flexShrink: 0,
          marginTop: 2,
        }}
        aria-hidden="true"
      >
        <FileText size={14} strokeWidth={2} />
      </span>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            lineHeight: 1.3,
            color: NR_PALETTE.text1,
          }}
        >
          {item.title}
        </span>

        {/* Metadata: category + byline/date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.6875rem',
            color: NR_PALETTE.text3,
            flexWrap: 'wrap',
          }}
        >
          {item.category ? (
            <NewsroomCategoryChip category={item.category} size="sm" />
          ) : null}
          {item.byline ? (
            <span>{item.byline}</span>
          ) : null}
          {item.publishDate ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Clock size={10} aria-hidden="true" style={{ opacity: 0.5 }} />
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

  return (
    <motion.div
      style={getRailStyle(tier)}
      {...railMotion}
    >
      {header ? (
        <h4
          style={{
            margin: '0 0 8px 8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: NR_PALETTE.text3,
          }}
        >
          {header}
        </h4>
      ) : null}

      {items.map((item, i) => (
        <React.Fragment key={item.id}>
          {i > 0 ? <hr style={dividerStyle} /> : null}
          <HeadlineItem item={item} />
        </React.Fragment>
      ))}
    </motion.div>
  );
}
