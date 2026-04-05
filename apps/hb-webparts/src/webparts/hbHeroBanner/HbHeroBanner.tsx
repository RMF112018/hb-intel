import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageCta, HbcHomepageMetadataRow, HbcHomepageEyebrow, useHomepageReducedMotion } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeHeroBannerConfig } from '../../homepage/helpers/topBandConfig.js';
import type { HbHeroBannerConfig } from '../../homepage/webparts/topBandContracts.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HP_SPACE, HP_RADIUS, HP_HERO } from '../../homepage/tokens.js';
import interactiveStyles from '../../homepage/homepage-interactive.module.css';

export interface HbHeroBannerProps {
  config?: Partial<HbHeroBannerConfig>;
}

/** Hero headline: display-level typography for flagship authority */
const heroHeadlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.75rem',
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
};

/** Hero supporting copy: lighter weight, comfortable reading rhythm */
const heroMessageStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontSize: '0.9375rem',
  fontWeight: 400,
  lineHeight: 1.6,
  opacity: 0.92,
  maxWidth: '52ch',
};

/** CTA row: flex layout for primary + optional secondary CTA */
const ctaRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: HP_SPACE.xl,
  marginTop: HP_SPACE['2xl'],
};

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

  const hasCta = Boolean(normalized.cta);
  const hasSecondaryCta = Boolean(normalized.secondaryCta);

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
          padding: `${HP_SPACE['3xl']}px ${HP_SPACE['3xl']}px`,
        }}
      >
        {normalized.eyebrow ? (
          <HbcHomepageEyebrow tone="on-dark">{normalized.eyebrow}</HbcHomepageEyebrow>
        ) : null}

        <h2 style={heroHeadlineStyle}>{normalized.headline}</h2>

        {normalized.message ? (
          <p style={heroMessageStyle}>{normalized.message}</p>
        ) : null}

        {(hasCta || hasSecondaryCta) ? (
          <div style={ctaRowStyle}>
            {normalized.cta ? (
              <HbcHomepageCta
                label={normalized.cta.label}
                href={normalized.cta.href}
                variant="button"
                size="large"
                arrow
                external={normalized.cta.openInNewTab}
              />
            ) : null}
            {normalized.secondaryCta ? (
              <HbcHomepageCta
                label={normalized.secondaryCta.label}
                href={normalized.secondaryCta.href}
                variant="link"
                arrow
                external={normalized.secondaryCta.openInNewTab}
                className={interactiveStyles.heroCtaOnDark}
              />
            ) : null}
          </div>
        ) : null}
      </section>

      {normalized.metadata ? (
        <HbcHomepageMetadataRow separated>
          <span>{normalized.metadata}</span>
        </HbcHomepageMetadataRow>
      ) : null}
    </HbcHomepageSurfaceCard>
  );
}
