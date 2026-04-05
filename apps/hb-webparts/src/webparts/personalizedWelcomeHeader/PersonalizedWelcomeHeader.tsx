/**
 * PersonalizedWelcomeHeader — Signature personalized greeting
 * Phase 15-04 — Top-band signature redesign
 *
 * The greeting is a defining product element — not a utility label.
 * It must immediately communicate that this homepage knows who you are
 * and was built for you. Lives within the unified top-band container
 * alongside the hero, not in its own isolated card.
 */
import * as React from 'react';
import { HbcHomepageMetadataRow, HbcHomepageEyebrow, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { hedrickLogo } from '@hbc/ui-kit/branding';
import { normalizeWelcomeHeaderConfig } from '../../homepage/helpers/topBandConfig.js';
import { resolveWelcomeMessage } from '../../homepage/helpers/welcomeMessage.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { PersonalizedWelcomeHeaderConfig } from '../../homepage/webparts/topBandContracts.js';
import { HP_SPACE, HP_TEXT_OPACITY } from '../../homepage/tokens.js';

export interface PersonalizedWelcomeHeaderProps {
  identity: HomepageIdentityInput;
  config?: Partial<PersonalizedWelcomeHeaderConfig>;
  now?: Date;
}

const ALERT_VARIANT_MAP = {
  none: 'neutral',
  info: 'info',
  warning: 'warning',
  critical: 'critical',
} as const;

/** Brand lockup row: restrained horizontal mark preceding the eyebrow */
const brandLockupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
};

/** Brand logo: small horizontal wordmark */
const brandLogoStyle: React.CSSProperties = {
  height: 22,
  width: 'auto',
  opacity: 0.75,
  objectFit: 'contain',
};

/** Greeting prefix: "Good morning," — warm, understated */
const greetingPrefixStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '1rem',
  fontWeight: 400,
  lineHeight: 1.3,
  letterSpacing: '-0.005em',
  opacity: 0.7,
};

/** Name emphasis: "Jordan." — signature-level, commanding */
const greetingNameStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: '-0.025em',
  color: 'rgb(34, 83, 145)',
};

/** Decorative accent bar beside the greeting */
const greetingAccentStyle: React.CSSProperties = {
  width: 4,
  alignSelf: 'stretch',
  borderRadius: 2,
  background: 'linear-gradient(180deg, rgb(34, 83, 145) 0%, rgba(229, 126, 70, 0.6) 100%)',
  flexShrink: 0,
};

/** Support text: concise orientation for the day */
const supportLineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'rgba(0, 0, 0, 0.65)',
  maxWidth: '38ch',
};

/** Context line: date or operational context */
const contextLineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  opacity: HP_TEXT_OPACITY.secondary,
  fontWeight: 500,
  letterSpacing: '0.01em',
};

/** Alert container: premium treatment for priority signals */
const alertContainerStyle: React.CSSProperties = {
  marginTop: HP_SPACE.xl,
  padding: `${HP_SPACE.lg}px ${HP_SPACE.xl}px`,
  background: 'rgba(34, 83, 145, 0.05)',
  borderRadius: 8,
  borderLeft: '3px solid rgba(34, 83, 145, 0.3)',
};

export function PersonalizedWelcomeHeader({ identity, config, now = new Date() }: PersonalizedWelcomeHeaderProps): React.JSX.Element {
  const normalized = normalizeWelcomeHeaderConfig(config);
  const message = resolveWelcomeMessage(identity, now);
  const hasAlert = normalized.alertSeverity !== 'none' && (normalized.alertTitle || normalized.alertMessage);

  return (
    <div data-hbc-homepage="welcome-header" style={{ display: 'flex', flexDirection: 'column', gap: HP_SPACE.xl, height: '100%' }}>
      {/* Brand lockup */}
      <div style={brandLockupStyle}>
        <img src={hedrickLogo} alt="Hedrick Brothers" style={brandLogoStyle} />
        <HbcHomepageEyebrow tone="muted">HB Central</HbcHomepageEyebrow>
      </div>

      {/* Signature greeting with accent bar */}
      <div style={{ display: 'flex', gap: HP_SPACE.xl, alignItems: 'flex-start' }}>
        <div style={greetingAccentStyle} aria-hidden="true" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: HP_SPACE.md }}>
          <h2 style={{ margin: 0 }}>
            <span style={greetingPrefixStyle}>{message.greeting},</span>
            <span style={greetingNameStyle}>{message.firstName}.</span>
          </h2>

          {normalized.supportLine ? (
            <p style={supportLineStyle}>{normalized.supportLine}</p>
          ) : null}
        </div>
      </div>

      {/* Context and alert — pushed toward bottom for visual balance */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: HP_SPACE.md }}>
        {normalized.contextLine ? (
          <p style={contextLineStyle}>{normalized.contextLine}</p>
        ) : null}

        {hasAlert ? (
          <section aria-label="High priority alert" role="status" style={alertContainerStyle}>
            <HbcHomepageMetadataRow>
              <HbcStatusBadge label={normalized.alertTitle ?? 'Important update'} variant={ALERT_VARIANT_MAP[normalized.alertSeverity ?? 'none']} />
            </HbcHomepageMetadataRow>
            {normalized.alertMessage ? (
              <p style={{ margin: `${HP_SPACE.sm}px 0 0`, fontSize: '0.8125rem', lineHeight: 1.5 }}>
                {normalized.alertMessage}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
