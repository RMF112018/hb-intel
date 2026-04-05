import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageCta, HbcHomepageMetadataRow, useHomepageReducedMotion } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeHeroBannerConfig } from '../../homepage/helpers/topBandConfig.js';
import type { HbHeroBannerConfig } from '../../homepage/webparts/topBandContracts.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HP_SPACE, HP_RADIUS, HP_HERO, hpHeadingReset, hpContentParagraph } from '../../homepage/tokens.js';

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
    <HbcHomepageSurfaceCard surface="hero">
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
      {normalized.metadata ? (
        <HbcHomepageMetadataRow>
          <span>{normalized.metadata}</span>
        </HbcHomepageMetadataRow>
      ) : null}
      {normalized.cta ? (
        <div style={{ marginTop: HP_SPACE.xl }}>
          <HbcHomepageCta
            label={normalized.cta.label}
            href={normalized.cta.href}
            variant="link"
            arrow
            external={normalized.cta.openInNewTab}
          />
        </div>
      ) : null}
    </HbcHomepageSurfaceCard>
  );
}
