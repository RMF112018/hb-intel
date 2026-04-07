/**
 * NewsroomCategoryChip — editorial category badge for newsroom content.
 * Wave 02 — CompanyPulse newsroom primitives.
 *
 * Compact chip with editorial color mapping per category. Uses the
 * newsroom palette (blue-led authority) instead of the generic
 * HbcPremiumBadge warm-accent styling.
 */
import * as React from 'react';
import { NR_CATEGORY_COLORS, NR_PALETTE } from './NewsroomPalette.js';

export interface NewsroomCategoryChipProps {
  category: string;
  size?: 'sm' | 'md';
}

export function NewsroomCategoryChip({ category, size = 'sm' }: NewsroomCategoryChipProps): React.JSX.Element {
  const colors = NR_CATEGORY_COLORS[category] ?? {
    bg: NR_PALETTE.eyebrowBg,
    text: NR_PALETTE.eyebrow,
    border: `rgba(34, 83, 145, 0.15)`,
  };

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: size === 'sm' ? '2px 8px' : '3px 10px',
    fontSize: size === 'sm' ? '0.625rem' : '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    lineHeight: 1.4,
    borderRadius: 4,
    background: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap',
  };

  return <span style={style}>{category}</span>;
}
