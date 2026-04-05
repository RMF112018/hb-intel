import * as React from 'react';
import { HomepageRailShell } from './HomepageRailShell.js';
import { HomepageSectionShell } from './HomepageSectionShell.js';
import { HP_LAYOUT, HP_SPACE } from '../tokens.js';
import topBandStyles from '../homepage-interactive.module.css';

export interface HomepageTopBandPairProps {
  welcome: React.ReactNode;
  hero: React.ReactNode;
}

export function HomepageTopBandPair({ welcome, hero }: HomepageTopBandPairProps): React.JSX.Element {
  return (
    <div className={topBandStyles.topBandSection}>
      <HomepageSectionShell title="Homepage Top Band" subtitle="Signature greeting and authored hero region">
        <HomepageRailShell label="top-band-pair">
          <div style={{ flex: HP_LAYOUT.welcomeFlex, minWidth: HP_LAYOUT.welcomeMinWidth }}>{welcome}</div>
          <div style={{ flex: HP_LAYOUT.heroFlex, minWidth: HP_LAYOUT.heroMinWidth, gap: HP_SPACE.xl }}>{hero}</div>
        </HomepageRailShell>
      </HomepageSectionShell>
    </div>
  );
}
