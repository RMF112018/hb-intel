import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageMetadataRow, HbcHomepageEyebrow, HbcStatusBadge } from '@hbc/ui-kit/homepage';
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

/** Greeting prefix: heading-level size, normal weight for "Good morning," */
const greetingPrefixStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '1.125rem',
  fontWeight: 400,
  lineHeight: 1.3,
  letterSpacing: '-0.005em',
  opacity: 0.8,
};

/** Name emphasis: display-level size, bold weight for "Avery." */
const greetingNameStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '1.75rem',
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
};

/** Brand lockup row: restrained horizontal mark preceding the eyebrow */
const brandLockupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
};

/** Brand logo: small horizontal wordmark, premium restraint */
const brandLogoStyle: React.CSSProperties = {
  height: 20,
  width: 'auto',
  opacity: 0.7,
  objectFit: 'contain',
};

/** Alert container: subtle tinted background for visual separation */
const alertContainerStyle: React.CSSProperties = {
  marginTop: HP_SPACE.md,
  padding: `${HP_SPACE.md}px ${HP_SPACE.xl}px`,
  background: 'rgba(34, 83, 145, 0.04)',
  borderRadius: 6,
};

export function PersonalizedWelcomeHeader({ identity, config, now = new Date() }: PersonalizedWelcomeHeaderProps): React.JSX.Element {
  const normalized = normalizeWelcomeHeaderConfig(config);
  const message = resolveWelcomeMessage(identity, now);
  const hasAlert = normalized.alertSeverity !== 'none' && (normalized.alertTitle || normalized.alertMessage);

  return (
    <HbcHomepageSurfaceCard surface="welcome">
      <div style={{ display: 'grid', gap: HP_SPACE.md }}>
        <div style={brandLockupStyle}>
          <img src={hedrickLogo} alt="Hedrick Brothers" style={brandLogoStyle} />
          <HbcHomepageEyebrow tone="muted">HB Central</HbcHomepageEyebrow>
        </div>

        <h2 style={{ margin: 0 }}>
          <span style={greetingPrefixStyle}>{message.greeting},</span>
          <span style={greetingNameStyle}>{message.firstName}.</span>
        </h2>

        {normalized.supportLine ? (
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
            {normalized.supportLine}
          </p>
        ) : null}

        {normalized.contextLine ? (
          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, opacity: HP_TEXT_OPACITY.secondary }}>
            {normalized.contextLine}
          </p>
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
    </HbcHomepageSurfaceCard>
  );
}
