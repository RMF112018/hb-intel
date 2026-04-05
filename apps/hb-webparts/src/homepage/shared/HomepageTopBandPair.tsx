/**
 * HomepageTopBandPair — Top-band flex layout for welcome + hero
 * Phase 12B-05 — Flagship composition without section-shell heading
 *
 * The top band IS the homepage's visual anchor — it does not need a
 * labeling section shell above it. Uses a clean accessible <section>
 * with flex layout for the two top-band columns.
 */
import * as React from 'react';
import { HP_SPACE, HP_LAYOUT, hpZoneSection } from '../tokens.js';
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

const railStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: HP_SPACE['2xl'],
  alignItems: 'flex-start',
};

export function HomepageTopBandPair({ welcome, hero }: HomepageTopBandPairProps): React.JSX.Element {
  return (
    <section
      aria-label="Homepage top band"
      className={topBandStyles.topBandSection}
      style={hpZoneSection('topBand')}
      data-hbc-homepage="top-band"
    >
      <div style={railStyle}>
        <div style={welcomeStyle}>{welcome}</div>
        <div style={heroStyle}>{hero}</div>
      </div>
    </section>
  );
}
