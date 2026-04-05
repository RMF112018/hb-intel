/**
 * HomepageTopBandPair — Top-band flex layout for welcome + hero
 *
 * Uses HbcHomepageSectionShell for accessible structure and
 * HomepageRailShell for the flex layout of the two top-band columns.
 */
import * as React from 'react';
import { HbcHomepageSectionShell } from '@hbc/ui-kit/homepage';
import { HomepageRailShell } from './HomepageRailShell.js';
import { HP_LAYOUT, hpZoneSection } from '../tokens.js';
import topBandStyles from '../homepage-interactive.module.css';

export interface HomepageTopBandPairProps {
  welcome: React.ReactNode;
  hero: React.ReactNode;
}

const welcomeStyle: React.CSSProperties = {
  flex: HP_LAYOUT.welcomeFlex,
  minWidth: HP_LAYOUT.welcomeMinWidth,
};

const heroStyle: React.CSSProperties = {
  flex: HP_LAYOUT.heroFlex,
  minWidth: HP_LAYOUT.heroMinWidth,
};

export function HomepageTopBandPair({ welcome, hero }: HomepageTopBandPairProps): React.JSX.Element {
  return (
    <div className={topBandStyles.topBandSection} style={hpZoneSection('topBand')}>
      <HbcHomepageSectionShell
        title="Homepage Top Band"
        subtitle="Signature greeting and authored hero region"
      >
        <HomepageRailShell label="top-band-pair">
          <div style={welcomeStyle}>{welcome}</div>
          <div style={heroStyle}>{hero}</div>
        </HomepageRailShell>
      </HbcHomepageSectionShell>
    </div>
  );
}
