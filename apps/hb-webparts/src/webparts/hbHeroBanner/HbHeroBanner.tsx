/**
 * HbHeroBanner — Flagship editorial hero for the homepage top band
 * Phase 17-04 — Structural rebuild with P17 surface family
 *
 * Rebuilt on HbcSignatureHeroSurface for full-width, motion-choreographed
 * hero rendering. Uses HbcPremiumCta for CTA hierarchy, lucide icons for
 * accents, and cva-driven surface variants. Designed for full-bleed
 * placement with supportsFullBleed manifest support.
 */
import * as React from 'react';
import {
  HbcSignatureHeroSurface,
  HbcPremiumCta,
  Calendar,
} from '@hbc/ui-kit/homepage';
import { hedrickLogo } from '@hbc/ui-kit/branding';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeHeroBannerConfig } from '../../homepage/helpers/topBandConfig.js';
import type { HbHeroBannerConfig } from '../../homepage/webparts/topBandContracts.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';

export interface HbHeroBannerProps {
  config?: Partial<HbHeroBannerConfig>;
}

export function HbHeroBanner({ config }: HbHeroBannerProps): React.JSX.Element {
  const normalized = normalizeHeroBannerConfig(config);
  const isConfigured = Boolean(config) && Boolean(config?.headline?.trim());

  if (!isConfigured) {
    const message = resolveAuthoringMessage('hbHeroBanner', config ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  return (
    <HbcSignatureHeroSurface
      background="brand"
      backgroundImage={normalized.background?.src}
      aria-label="HB Central hero banner"
      brand={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={hedrickLogo} alt="Hedrick Brothers" style={{ height: 24, width: 'auto' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, opacity: 0.85 }}>HB Central</span>
        </div>
      }
      eyebrow={normalized.eyebrow}
      editorial={
        <>
          <h2 style={{
            margin: 0,
            fontSize: '2.25rem',
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            maxWidth: '22ch',
          }}>
            {normalized.headline}
          </h2>
          {normalized.message ? (
            <p style={{
              margin: 0,
              fontSize: '0.9375rem',
              fontWeight: 400,
              lineHeight: 1.6,
              opacity: 0.88,
              maxWidth: '48ch',
            }}>
              {normalized.message}
            </p>
          ) : null}
        </>
      }
      ctas={
        <>
          {normalized.cta ? (
            <HbcPremiumCta
              label={normalized.cta.label}
              href={normalized.cta.href}
              variant="onDark"
              size="lg"
              arrow
              external={normalized.cta.openInNewTab}
            />
          ) : null}
          {normalized.secondaryCta ? (
            <HbcPremiumCta
              label={normalized.secondaryCta.label}
              href={normalized.secondaryCta.href}
              variant="ghost"
              size="md"
              arrow
              external={normalized.secondaryCta.openInNewTab}
            />
          ) : null}
        </>
      }
      metadata={normalized.metadata ? (
        <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>
          <Calendar size={12} aria-hidden="true" style={{ marginRight: 6, verticalAlign: -1 }} />
          {normalized.metadata}
        </span>
      ) : undefined}
    />
  );
}
