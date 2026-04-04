import * as React from 'react';

export interface HomepageCuratedContentClusterProps {
  heading: string;
  featured?: React.ReactNode;
  secondary?: React.ReactNode[];
}

export function HomepageCuratedContentCluster({ heading, featured, secondary = [] }: HomepageCuratedContentClusterProps): React.JSX.Element {
  return (
    <section aria-label={heading}>
      <h2 style={{ margin: 0 }}>{heading}</h2>
      {featured ? (
        <div aria-label="featured-item" style={{ marginTop: 10, padding: 12, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8 }}>
          {featured}
        </div>
      ) : null}
      {secondary.length > 0 ? (
        <div aria-label="secondary-items" style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {secondary.map((node, index) => (
            <div key={index} style={{ padding: 10, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8 }}>
              {node}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
