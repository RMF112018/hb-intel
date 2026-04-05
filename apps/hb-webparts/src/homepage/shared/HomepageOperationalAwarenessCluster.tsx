import * as React from 'react';
import { hpHeadingReset, hpFeaturedContainer, hpSecondaryGrid, hpSecondaryCard } from '../tokens.js';

export interface HomepageOperationalAwarenessClusterProps {
  heading: string;
  featured?: React.ReactNode;
  secondary?: React.ReactNode[];
}

export function HomepageOperationalAwarenessCluster({
  heading,
  featured,
  secondary = [],
}: HomepageOperationalAwarenessClusterProps): React.JSX.Element {
  return (
    <section aria-label={heading}>
      <h2 style={hpHeadingReset}>{heading}</h2>
      {featured ? (
        <div aria-label={`${heading} — featured`} style={hpFeaturedContainer}>
          {featured}
        </div>
      ) : null}
      {secondary.length > 0 ? (
        <div aria-label={`${heading} — more items`} style={hpSecondaryGrid}>
          {secondary.map((node, index) => (
            <div key={index} style={hpSecondaryCard}>
              {node}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
