/**
 * HbHeroBanner — Flagship editorial hero for the homepage top band
 * Phase 15-04 — Top-band signature redesign
 *
 * The hero is the homepage's visual authority surface. It uses a
 * layered gradient composition with stronger internal hierarchy:
 * large display headline, measured supporting copy, clear CTA
 * hierarchy, and deliberate negative space.
 *
 * Lives within the unified top-band container alongside the welcome
 * greeting. Together they form the homepage's signature opening.
 */
import * as React from 'react';
import { HbcHomepageCta, HbcHomepageMetadataRow, HbcHomepageEyebrow, useHomepageReducedMotion } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeHeroBannerConfig } from '../../homepage/helpers/topBandConfig.js';
import type { HbHeroBannerConfig } from '../../homepage/webparts/topBandContracts.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HP_SPACE, HP_RADIUS, HP_HERO } from '../../homepage/tokens.js';
import interactiveStyles from '../../homepage/homepage-interactive.module.css';

export interface HbHeroBannerProps {
  config?: Partial<HbHeroBannerConfig>;
}

/** Hero container: layered gradient with generous interior spacing */
const heroContainerStyle = (background: string, reducedMotion: boolean): React.CSSProperties => ({
  background,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: reducedMotion ? 'none' : 'background-position 300ms ease',
  color: HP_HERO.textColor,
  borderRadius: HP_RADIUS.hero,
  padding: `${HP_SPACE['4xl']}px ${HP_SPACE['3xl']}px`,
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE.xl,
  height: '100%',
  position: 'relative' as const,
  overflow: 'hidden' as const,
});

/** Decorative edge highlight — subtle inner glow at top */
const edgeHighlightStyle: React.CSSProperties = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  height: 3,
  background: 'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(229,126,70,0.4) 50%, rgba(255,255,255,0.15) 100%)',
  pointerEvents: 'none' as const,
};

/** Hero headline: display-level typography for flagship authority */
const heroHeadlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: '-0.025em',
  maxWidth: '22ch',
};

/** Hero supporting copy: comfortable reading rhythm with measured width */
const heroMessageStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 400,
  lineHeight: 1.6,
  opacity: 0.88,
  maxWidth: '48ch',
};

/** CTA row: clear hierarchy between primary and secondary actions */
const ctaRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: HP_SPACE.xl,
  marginTop: 'auto',
  paddingTop: HP_SPACE.md,
};

/** Metadata: pushed to bottom, subdued but present */
const metadataStyle: React.CSSProperties = {
  paddingTop: HP_SPACE.md,
  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
  marginTop: HP_SPACE.md,
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
    <section
      aria-label="Hero banner"
      style={heroContainerStyle(background, reducedMotion)}
      data-hbc-homepage="hero-banner"
    >
      <div style={edgeHighlightStyle} aria-hidden="true" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: HP_SPACE.md, position: 'relative' as const }}>
        {normalized.eyebrow ? (
          <HbcHomepageEyebrow tone="on-dark">{normalized.eyebrow}</HbcHomepageEyebrow>
        ) : null}

        <h2 style={heroHeadlineStyle}>{normalized.headline}</h2>

        {normalized.message ? (
          <p style={heroMessageStyle}>{normalized.message}</p>
        ) : null}
      </div>

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

      {normalized.metadata ? (
        <div style={metadataStyle}>
          <HbcHomepageMetadataRow separated>
            <span style={{ opacity: 0.7 }}>{normalized.metadata}</span>
          </HbcHomepageMetadataRow>
        </div>
      ) : null}
    </section>
  );
}
