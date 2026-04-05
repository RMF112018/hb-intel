/**
 * HomepageUtilityDenseGroup — Compact utility section grouping
 *
 * Groups utility actions/items under a sub-heading with tight grid
 * spacing. Uses homepage tokens for density control and minimum width.
 */
import * as React from 'react';
import { HP_SPACE, HP_LAYOUT, HP_BORDER, HP_RADIUS } from '../tokens.js';

export interface HomepageUtilityDenseGroupProps {
  title: string;
  children: React.ReactNode;
}

const groupStyle: React.CSSProperties = {
  minWidth: HP_LAYOUT.utilityGroupMinWidth,
  padding: HP_SPACE.lg,
  borderRadius: HP_RADIUS.card,
  border: HP_BORDER.subtle,
};

const titleStyle: React.CSSProperties = {
  margin: `0 0 ${HP_SPACE.md}px`,
  fontSize: '0.875rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.sm,
};

export function HomepageUtilityDenseGroup({ title, children }: HomepageUtilityDenseGroupProps): React.JSX.Element {
  return (
    <section aria-label={title} style={groupStyle} data-hbc-homepage="utility-dense-group">
      <h3 style={titleStyle}>{title}</h3>
      <div style={gridStyle}>{children}</div>
    </section>
  );
}
