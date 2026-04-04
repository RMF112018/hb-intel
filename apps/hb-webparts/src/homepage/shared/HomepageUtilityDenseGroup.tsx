import * as React from 'react';

export interface HomepageUtilityDenseGroupProps {
  title: string;
  children: React.ReactNode;
}

export function HomepageUtilityDenseGroup({ title, children }: HomepageUtilityDenseGroupProps): React.JSX.Element {
  return (
    <section aria-label={title} style={{ minWidth: 220 }}>
      <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
      <div style={{ display: 'grid', gap: 6 }}>{children}</div>
    </section>
  );
}
