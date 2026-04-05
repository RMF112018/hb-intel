/**
 * HomepageCuratedContentCluster — Editorial featured/secondary layout
 * Phase 15-07 — Editorial communications redesign
 *
 * Now supports three editorial variants with distinct visual character:
 * - 'news' — editorial digest: warm accent, magazine-like hierarchy
 * - 'executive' — leadership voice: brand accent, formal gravitas
 * - 'celebration' — people recognition: warm-tinted, celebratory energy
 *
 * Each variant uses different section accents, featured container
 * treatments, and secondary card styling to prevent visual interchangeability.
 */
import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageSectionShell } from '@hbc/ui-kit/homepage';
import type { SectionAccent } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_RADIUS } from '../tokens.js';

export type EditorialVariant = 'news' | 'executive' | 'celebration';

export interface HomepageCuratedContentClusterProps {
  heading: string;
  /** Editorial variant controlling visual character */
  variant?: EditorialVariant;
  featured?: React.ReactNode;
  secondary?: React.ReactNode[];
}

/** Variant → section accent mapping */
const VARIANT_ACCENT: Record<EditorialVariant, SectionAccent> = {
  news: 'warm',
  executive: 'brand',
  celebration: 'warm',
};

/** Featured container styles per variant */
const FEATURED_STYLES: Record<EditorialVariant, React.CSSProperties> = {
  news: {
    marginTop: HP_SPACE.xl,
    padding: HP_SPACE['2xl'],
    background: 'rgba(229, 126, 70, 0.03)',
    borderRadius: HP_RADIUS.editorial,
    borderLeft: '4px solid rgba(229, 126, 70, 0.35)',
  },
  executive: {
    marginTop: HP_SPACE.xl,
    padding: `${HP_SPACE['2xl']}px ${HP_SPACE['2xl']}px ${HP_SPACE['2xl']}px ${HP_SPACE['3xl']}px`,
    background: 'rgba(34, 83, 145, 0.03)',
    borderRadius: HP_RADIUS.editorial,
    borderLeft: '4px solid rgba(34, 83, 145, 0.30)',
  },
  celebration: {
    marginTop: HP_SPACE.xl,
    padding: HP_SPACE['2xl'],
    background: 'linear-gradient(135deg, rgba(229, 126, 70, 0.04) 0%, rgba(229, 126, 70, 0.01) 100%)',
    borderRadius: HP_RADIUS.editorial,
    border: '1px solid rgba(229, 126, 70, 0.15)',
  },
};

const secondaryGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
  marginTop: HP_SPACE.xl,
};

export function HomepageCuratedContentCluster({
  heading,
  variant = 'news',
  featured,
  secondary = [],
}: HomepageCuratedContentClusterProps): React.JSX.Element {
  const accent = VARIANT_ACCENT[variant];
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
            <HbcHomepageSurfaceCard key={index} surface="editorial">
              {node}
            </HbcHomepageSurfaceCard>
          ))}
        </div>
      ) : null}
    </HbcHomepageSectionShell>
  );
}
