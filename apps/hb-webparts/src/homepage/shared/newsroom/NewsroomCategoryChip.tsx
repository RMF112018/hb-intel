/**
 * NewsroomCategoryChip — editorial category badge for newsroom content.
 * Wave 04 — CSS-module premium surface architecture.
 *
 * Compact chip with editorial color mapping per category.
 * Dynamic category colors applied via inline style (bg/text/border
 * vary per category); structural styling via CSS module.
 */
import * as React from 'react';
import { NR_CATEGORY_COLORS } from './NewsroomPalette.js';
import s from './newsroom-surface.module.css';

export interface NewsroomCategoryChipProps {
  category: string;
  size?: 'sm' | 'md';
}

const FALLBACK_COLORS = {
  bg: 'rgba(34, 83, 145, 0.08)',
  text: '#225391',
  border: 'rgba(34, 83, 145, 0.15)',
};

export function NewsroomCategoryChip({ category, size = 'sm' }: NewsroomCategoryChipProps): React.JSX.Element {
  const colors = NR_CATEGORY_COLORS[category] ?? FALLBACK_COLORS;

  return (
    <span
      className={size === 'sm' ? s.chipSm : s.chipMd}
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {category}
    </span>
  );
}
