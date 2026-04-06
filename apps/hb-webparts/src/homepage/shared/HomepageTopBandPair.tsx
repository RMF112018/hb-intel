/**
 * HomepageTopBandPair — Legacy split-path top-band composition shell
 * Phase 12B-05 — Initial flagship composition
 * Phase 15-04 — Top-band signature redesign
 * Phase 18-01 — Superseded by HbSignatureHero for flagship homepage use
 *
 * @deprecated Phase 18-01 canonicalized {@link HbSignatureHero} as the
 * single flagship homepage top-band surface. This split-path composition
 * (separate welcome + hero slots) is no longer the homepage flagship
 * pattern. Retained for potential non-flagship or archival use.
 */
import * as React from 'react';
import { HP_SPACE, HP_LAYOUT, HP_RADIUS } from '../tokens.js';
import topBandStyles from '../homepage-interactive.module.css';

export interface HomepageTopBandPairProps {
  welcome: React.ReactNode;
  hero: React.ReactNode;
}

/** Unified top-band container — shared brand background creates cohesion */
const containerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(34, 83, 145, 0.06) 0%, rgba(229, 126, 70, 0.03) 60%, rgba(34, 83, 145, 0.04) 100%)',
  borderRadius: HP_RADIUS.signature,
  padding: `${HP_SPACE['3xl']}px ${HP_SPACE['2xl']}px`,
  borderBottom: '3px solid rgba(34, 83, 145, 0.15)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

/** Decorative brand accent — subtle geometric element in the background */
const accentStyle: React.CSSProperties = {
  position: 'absolute' as const,
  top: -60,
  right: -40,
  width: 200,
  height: 200,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(229, 126, 70, 0.06) 0%, transparent 70%)',
  pointerEvents: 'none' as const,
};

const railStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: HP_SPACE['2xl'],
  alignItems: 'stretch',
  position: 'relative' as const,
};

const welcomeStyle: React.CSSProperties = {
  flex: HP_LAYOUT.welcomeFlex,
  minWidth: HP_LAYOUT.welcomeMinWidth,
  display: 'flex',
  flexDirection: 'column',
};

const heroStyle: React.CSSProperties = {
  flex: HP_LAYOUT.heroFlex,
  minWidth: HP_LAYOUT.heroMinWidth,
  display: 'flex',
  flexDirection: 'column',
};

export function HomepageTopBandPair({ welcome, hero }: HomepageTopBandPairProps): React.JSX.Element {
  return (
    <section
      aria-label="Homepage top band"
      className={topBandStyles.topBandSection}
      style={containerStyle}
      data-hbc-homepage="top-band"
    >
      <div style={accentStyle} aria-hidden="true" />
      <div style={railStyle}>
        <div style={welcomeStyle}>{welcome}</div>
        <div style={heroStyle}>{hero}</div>
      </div>
    </section>
  );
}
