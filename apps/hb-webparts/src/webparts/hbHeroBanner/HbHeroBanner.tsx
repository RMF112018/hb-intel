import * as React from 'react';
import { HbcCard, useHomepageReducedMotion } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeHeroBannerConfig } from '../../homepage/helpers/topBandConfig.js';
import type { HbHeroBannerConfig } from '../../homepage/webparts/topBandContracts.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';

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
    ? `linear-gradient(120deg, rgba(34,83,145,0.9), rgba(229,126,70,0.75)), url(${normalized.background.src})`
    : 'linear-gradient(120deg, rgba(34,83,145,0.94), rgba(28,71,124,0.92))';

  return (
    <HbcCard>
      <section
        aria-label="Hero banner"
        style={{
          background,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: reducedMotion ? 'none' : 'background-position 300ms ease',
          color: '#ffffff',
          borderRadius: 10,
          padding: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>{normalized.headline}</h2>
        {normalized.message ? <p style={{ margin: '10px 0 0' }}>{normalized.message}</p> : null}
      </section>
      {normalized.metadata ? <p style={{ margin: '10px 0 0', opacity: 0.85 }}>{normalized.metadata}</p> : null}
      {normalized.cta ? (
        <div style={{ marginTop: 12 }}>
          <a href={normalized.cta.href} rel={normalized.cta.openInNewTab ? 'noreferrer' : undefined} target={normalized.cta.openInNewTab ? '_blank' : undefined}>
            {normalized.cta.label}
          </a>
        </div>
      ) : null}
    </HbcCard>
  );
}
