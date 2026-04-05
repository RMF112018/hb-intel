import * as React from 'react';
import { HP_SPACE, HP_LAYOUT } from '../tokens.js';

export interface HomepageUtilityDenseGroupProps {
  title: string;
  children: React.ReactNode;
}

export function HomepageUtilityDenseGroup({ title, children }: HomepageUtilityDenseGroupProps): React.JSX.Element {
  return (
    <section aria-label={title} style={{ minWidth: HP_LAYOUT.utilityGroupMinWidth }}>
      <h3 style={{ margin: `0 0 ${HP_SPACE.md}px` }}>{title}</h3>
      <div style={{ display: 'grid', gap: HP_SPACE.sm }}>{children}</div>
    </section>
  );
}
