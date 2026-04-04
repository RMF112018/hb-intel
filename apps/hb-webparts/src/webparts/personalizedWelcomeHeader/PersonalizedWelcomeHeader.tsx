import * as React from 'react';
import { HbcCard, HbcStatusBadge, HBC_HOMEPAGE_BRAND_FOUNDATION, HBC_HOMEPAGE_TYPOGRAPHY } from '@hbc/ui-kit/homepage';
import { normalizeWelcomeHeaderConfig } from '../../homepage/helpers/topBandConfig.js';
import { resolveWelcomeMessage } from '../../homepage/helpers/welcomeMessage.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { PersonalizedWelcomeHeaderConfig } from '../../homepage/webparts/topBandContracts.js';

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

export function PersonalizedWelcomeHeader({ identity, config, now = new Date() }: PersonalizedWelcomeHeaderProps): React.JSX.Element {
  const normalized = normalizeWelcomeHeaderConfig(config);
  const message = resolveWelcomeMessage(identity, now);
  const hasAlert = normalized.alertSeverity !== 'none' && (normalized.alertTitle || normalized.alertMessage);

  return (
    <HbcCard header={<h2 style={{ margin: 0 }}>{message.headline}</h2>}>
      <div
        style={{
          borderLeft: `4px solid ${HBC_HOMEPAGE_BRAND_FOUNDATION.primaryBlue.hex}`,
          paddingInlineStart: 12,
          display: 'grid',
          gap: 8,
        }}
      >
        {normalized.supportLine ? <p style={{ ...(HBC_HOMEPAGE_TYPOGRAPHY.body as React.CSSProperties), margin: 0 }}>{normalized.supportLine}</p> : null}
        {normalized.contextLine ? <p style={{ margin: 0, opacity: 0.8 }}>{normalized.contextLine}</p> : null}

        {hasAlert ? (
          <section aria-label="High priority alert" role="status">
            <HbcStatusBadge label={normalized.alertTitle ?? 'Important update'} variant={ALERT_VARIANT_MAP[normalized.alertSeverity ?? 'none']} />
            {normalized.alertMessage ? <p style={{ margin: '6px 0 0' }}>{normalized.alertMessage}</p> : null}
          </section>
        ) : null}
      </div>
    </HbcCard>
  );
}
