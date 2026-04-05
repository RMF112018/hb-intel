import * as React from 'react';
import { HbcCard, useHomepageReducedMotion } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeHeroBannerConfig } from '../../homepage/helpers/topBandConfig.js';
import type { HbHeroBannerConfig } from '../../homepage/webparts/topBandContracts.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HP_SPACE, HP_RADIUS, HP_HERO, HP_TEXT_OPACITY, hpHeadingReset, hpContentParagraph, hpCtaLink } from '../../homepage/tokens.js';

export interface HbHeroBannerProps {
  config?: Partial<HbHeroBannerConfig>;
}

export function HbHeroBanner({ config }: HbHeroBannerProps): React.JSX.Element {
  const reducedMotion = useHomepageReducedMotion();
  const normalized = normalizeHeroBannerConfig(config);
  const isConfigured = Boolean(config) && Boolean(config?.headline?.trim());

  if (!isConfigured) {
    const message = resolveAuthoringMessage('hbHeroBanner', config ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const background = normalized.background?.src
    ? `${HP_HERO.gradientWithImage}, url(${normalized.background.src})`
    : HP_HERO.gradientFallback;

  return (
    <HbcCard>
      <section
        aria-label="Hero banner"
        style={{
          background,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: reducedMotion ? 'none' : 'background-position 300ms ease',
          color: HP_HERO.textColor,
          borderRadius: HP_RADIUS.hero,
          padding: HP_SPACE['3xl'],
        }}
      >
        <h2 style={hpHeadingReset}>{normalized.headline}</h2>
        {normalized.message ? <p style={hpContentParagraph}>{normalized.message}</p> : null}
      </section>
      {normalized.metadata ? <p style={{ margin: `${HP_SPACE.lg}px 0 0`, opacity: HP_TEXT_OPACITY.muted }}>{normalized.metadata}</p> : null}
      {normalized.cta ? (
        <div style={{ marginTop: HP_SPACE.xl }}>
          <a href={normalized.cta.href} style={hpCtaLink} rel={normalized.cta.openInNewTab ? 'noreferrer' : undefined} target={normalized.cta.openInNewTab ? '_blank' : undefined}>
            {normalized.cta.label} →
          </a>
        </div>
      ) : null}
    </HbcCard>
  );
}
