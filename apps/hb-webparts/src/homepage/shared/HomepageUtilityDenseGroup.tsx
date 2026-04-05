/**
 * HomepageUtilityDenseGroup — Premium command group shell
 * Phase 15-05 — Command and utility surface overhaul
 *
 * Groups utility actions under a deliberate heading with urgency-aware
 * accent treatment. Each group feels like a purposeful command section,
 * not a generic card with links.
 */
import * as React from 'react';
import { HP_SPACE, HP_LAYOUT, HP_RADIUS } from '../tokens.js';

export interface HomepageUtilityDenseGroupProps {
  title: string;
  /** Urgency accent for the group header */
  accent?: 'brand' | 'urgent' | 'neutral';
  children: React.ReactNode;
}

const groupStyle: React.CSSProperties = {
  minWidth: HP_LAYOUT.utilityGroupMinWidth,
  padding: 0,
  borderRadius: HP_RADIUS.command,
  background: 'rgba(34, 83, 145, 0.02)',
  border: '1px solid rgba(34, 83, 145, 0.08)',
  overflow: 'hidden',
};

/** Brand accent header — default for non-urgent groups */
const headerBrandStyle: React.CSSProperties = {
  margin: 0,
  padding: `${HP_SPACE.md}px ${HP_SPACE.xl}px`,
  fontSize: '0.75rem',
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  color: 'rgb(34, 83, 145)',
  background: 'rgba(34, 83, 145, 0.05)',
  borderBottom: '2px solid rgba(34, 83, 145, 0.12)',
};

/** Urgent accent header — for groups containing critical/warning items */
const headerUrgentStyle: React.CSSProperties = {
  ...headerBrandStyle,
  color: '#8b1a1a',
  background: 'rgba(220, 38, 38, 0.05)',
  borderBottom: '2px solid rgba(220, 38, 38, 0.20)',
};

/** Neutral accent header */
const headerNeutralStyle: React.CSSProperties = {
  ...headerBrandStyle,
  color: '#605e5c',
  background: 'rgba(0, 0, 0, 0.02)',
  borderBottom: '2px solid rgba(0, 0, 0, 0.06)',
};

const ACCENT_STYLES = {
  brand: headerBrandStyle,
  urgent: headerUrgentStyle,
  neutral: headerNeutralStyle,
} as const;

const contentStyle: React.CSSProperties = {
  display: 'grid',
  gap: 1,
  padding: `${HP_SPACE.sm}px 0`,
};

export function HomepageUtilityDenseGroup({ title, accent = 'brand', children }: HomepageUtilityDenseGroupProps): React.JSX.Element {
  return (
    <section aria-label={title} style={groupStyle} data-hbc-homepage="utility-dense-group">
      <h3 style={ACCENT_STYLES[accent]}>{title}</h3>
      <div style={contentStyle}>{children}</div>
    </section>
  );
}
