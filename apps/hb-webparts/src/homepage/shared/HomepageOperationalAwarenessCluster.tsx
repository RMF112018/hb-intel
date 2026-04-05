/**
 * HomepageOperationalAwarenessCluster — Premium operational intelligence layout
 * Phase 15-08 — Operational intelligence redesign
 *
 * Now supports two operational variants with distinct visual character:
 * - 'strategic' — project/portfolio: cool-toned, dashboard-adjacent, structured
 * - 'safety' — safety/field: urgency-aware, field-oriented, culturally important
 *
 * Each variant uses different section accents, featured container treatments,
 * and visual framing to prevent operational surfaces from looking like
 * editorial cards with status badges.
 */
import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageSectionShell } from '@hbc/ui-kit/homepage';
import type { SectionAccent } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_RADIUS } from '../tokens.js';

export type OperationalVariant = 'strategic' | 'safety';

export interface HomepageOperationalAwarenessClusterProps {
  heading: string;
  /** Operational variant controlling visual character */
  variant?: OperationalVariant;
  featured?: React.ReactNode;
  secondary?: React.ReactNode[];
}

/** Featured container styles per variant */
const FEATURED_STYLES: Record<OperationalVariant, React.CSSProperties> = {
  strategic: {
    marginTop: HP_SPACE.xl,
    padding: HP_SPACE['2xl'],
    background: 'rgba(34, 83, 145, 0.04)',
    borderRadius: HP_RADIUS.card,
    borderLeft: '4px solid rgba(34, 83, 145, 0.35)',
    borderTop: '1px solid rgba(34, 83, 145, 0.08)',
    borderRight: '1px solid rgba(34, 83, 145, 0.08)',
    borderBottom: '1px solid rgba(34, 83, 145, 0.08)',
  },
  safety: {
    marginTop: HP_SPACE.xl,
    padding: HP_SPACE['2xl'],
    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.03) 0%, rgba(229, 126, 70, 0.03) 100%)',
    borderRadius: HP_RADIUS.card,
    borderLeft: '4px solid rgba(220, 38, 38, 0.35)',
    borderTop: '1px solid rgba(220, 38, 38, 0.08)',
    borderRight: '1px solid rgba(220, 38, 38, 0.08)',
    borderBottom: '1px solid rgba(220, 38, 38, 0.08)',
  },
};

const secondaryGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
  marginTop: HP_SPACE.xl,
};

export function HomepageOperationalAwarenessCluster({
  heading,
  variant = 'strategic',
  featured,
  secondary = [],
}: HomepageOperationalAwarenessClusterProps): React.JSX.Element {
  const accent: SectionAccent = variant === 'safety' ? 'warm' : 'brand';
  const featuredContainerStyle = FEATURED_STYLES[variant];

  return (
    <HbcHomepageSectionShell title={heading} accent={accent}>
      {featured ? (
        <div aria-label={`${heading} — featured`} style={featuredContainerStyle}>
          {featured}
        </div>
      ) : null}
      {secondary.length > 0 ? (
        <div aria-label={`${heading} — more items`} style={secondaryGridStyle}>
          {secondary.map((node, index) => (
            <HbcHomepageSurfaceCard key={index} surface="operational">
              {node}
            </HbcHomepageSurfaceCard>
          ))}
        </div>
      ) : null}
    </HbcHomepageSectionShell>
  );
}
