import * as React from 'react';
import { HomepageRailShell } from './HomepageRailShell.js';
import { HomepageSectionShell } from './HomepageSectionShell.js';

export interface HomepageTopBandPairProps {
  welcome: React.ReactNode;
  hero: React.ReactNode;
}

export function HomepageTopBandPair({ welcome, hero }: HomepageTopBandPairProps): React.JSX.Element {
  return (
    <HomepageSectionShell title="Homepage Top Band" subtitle="Signature greeting and authored hero region">
      <HomepageRailShell label="top-band-pair">
        <div style={{ flex: '1 1 280px', minWidth: 280 }}>{welcome}</div>
        <div style={{ flex: '2 1 440px', minWidth: 320 }}>{hero}</div>
      </HomepageRailShell>
    </HomepageSectionShell>
  );
}
