/**
 * HomepageOperationalAwarenessCluster — Operational featured/secondary layout
 *
 * Uses HbcHomepageSurfaceCard with 'operational' surface class for featured
 * content (gets brand left-border accent) and standard cards for secondary.
 * Visually distinct from CuratedContentCluster through the operational
 * surface treatment.
 */
import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageSectionShell } from '@hbc/ui-kit/homepage';
import { HP_SPACE } from '../tokens.js';

export interface HomepageOperationalAwarenessClusterProps {
  heading: string;
  featured?: React.ReactNode;
  secondary?: React.ReactNode[];
}

const featuredStyle: React.CSSProperties = {
  marginTop: HP_SPACE.lg,
};

const secondaryGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.lg,
  marginTop: HP_SPACE.xl,
};

export function HomepageOperationalAwarenessCluster({
  heading,
  featured,
  secondary = [],
}: HomepageOperationalAwarenessClusterProps): React.JSX.Element {
  return (
    <HbcHomepageSectionShell title={heading}>
      {featured ? (
        <div aria-label={`${heading} — featured`} style={featuredStyle}>
          <HbcHomepageSurfaceCard surface="operational">
            {featured}
          </HbcHomepageSurfaceCard>
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
