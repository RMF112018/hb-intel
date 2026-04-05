/**
 * HomepageCuratedContentCluster — Editorial featured/secondary layout
 *
 * Uses HbcHomepageSurfaceCard with 'editorial' surface class for featured
 * content and 'supporting' weight cards for secondary items. Provides
 * stronger visual hierarchy between featured and secondary content.
 */
import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageSectionShell } from '@hbc/ui-kit/homepage';
import { HP_SPACE } from '../tokens.js';

export interface HomepageCuratedContentClusterProps {
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

export function HomepageCuratedContentCluster({
  heading,
  featured,
  secondary = [],
}: HomepageCuratedContentClusterProps): React.JSX.Element {
  return (
    <HbcHomepageSectionShell title={heading}>
      {featured ? (
        <div aria-label={`${heading} — featured`} style={featuredStyle}>
          <HbcHomepageSurfaceCard surface="editorial">
            {featured}
          </HbcHomepageSurfaceCard>
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
