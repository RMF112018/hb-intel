/**
 * PersonalizedWelcomeHeader — Signature personalized greeting
 * Phase 17-04 — Structural rebuild with P17 surface family
 *
 * Rebuilt with motion reveal choreography, lucide icons for contextual
 * accents, and HbcPremiumBadge for alert severity. The greeting is
 * designed to integrate into the unified top-band experience via
 * HbcSignatureHeroSurface rather than standing as an isolated card.
 */
import * as React from 'react';
import {
  motion,
  HbcPremiumBadge,
  Calendar,
  AlertTriangle,
} from '@hbc/ui-kit/homepage';
import { hedrickLogo } from '@hbc/ui-kit/branding';
import { normalizeWelcomeHeaderConfig } from '../../homepage/helpers/topBandConfig.js';
import { resolveWelcomeMessage } from '../../homepage/helpers/welcomeMessage.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { PersonalizedWelcomeHeaderConfig } from '../../homepage/webparts/topBandContracts.js';

export interface PersonalizedWelcomeHeaderProps {
  identity: HomepageIdentityInput;
  config?: Partial<PersonalizedWelcomeHeaderConfig>;
  now?: Date;
}

const ALERT_STATUS_MAP = {
  none: 'neutral',
  info: 'info',
  warning: 'warning',
  critical: 'critical',
} as const;

const revealVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

export function PersonalizedWelcomeHeader({ identity, config, now = new Date() }: PersonalizedWelcomeHeaderProps): React.JSX.Element {
  const normalized = normalizeWelcomeHeaderConfig(config);
  const message = resolveWelcomeMessage(identity, now);
  const hasAlert = normalized.alertSeverity !== 'none' && (normalized.alertTitle || normalized.alertMessage);

  return (
    <div
      data-hbc-premium="welcome-header"
      style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}
    >
      {/* Brand lockup */}
      <motion.div
        variants={revealVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <img src={hedrickLogo} alt="Hedrick Brothers" style={{ height: 22, width: 'auto', opacity: 0.75 }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' as const, color: 'rgba(34,83,145,0.60)' }}>
          HB Central
        </span>
      </motion.div>

      {/* Signature greeting */}
      <motion.div
        variants={revealVariants}
        initial="hidden"
        animate="visible"
        custom={0.1}
        style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 4,
            alignSelf: 'stretch',
            borderRadius: 2,
            background: 'linear-gradient(180deg, rgb(34, 83, 145) 0%, rgba(229, 126, 70, 0.6) 100%)',
            flexShrink: 0,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ margin: 0 }}>
            <span style={{ display: 'block', fontSize: '1rem', fontWeight: 400, lineHeight: 1.3, opacity: 0.7 }}>
              {message.greeting},
            </span>
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', color: 'rgb(34, 83, 145)' }}>
              {message.firstName}.
            </span>
          </h2>
          {normalized.supportLine ? (
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, color: 'rgba(0, 0, 0, 0.65)', maxWidth: '38ch' }}>
              {normalized.supportLine}
            </p>
          ) : null}
        </div>
      </motion.div>

      {/* Context and alert — pushed toward bottom */}
      <motion.div
        variants={revealVariants}
        initial="hidden"
        animate="visible"
        custom={0.2}
        style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {normalized.contextLine ? (
          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, opacity: 0.75, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} aria-hidden="true" style={{ opacity: 0.6 }} />
            {normalized.contextLine}
          </p>
        ) : null}

        {hasAlert ? (
          <section
            aria-label="High priority alert"
            role="status"
            style={{
              padding: '10px 14px',
              background: 'rgba(34, 83, 145, 0.05)',
              borderRadius: 8,
              borderLeft: '3px solid rgba(34, 83, 145, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AlertTriangle size={14} aria-hidden="true" style={{ color: 'rgba(34,83,145,0.55)', flexShrink: 0 }} />
            <HbcPremiumBadge
              label={normalized.alertTitle ?? 'Important update'}
              status={ALERT_STATUS_MAP[normalized.alertSeverity ?? 'none']}
              size="sm"
            />
            {normalized.alertMessage ? (
              <span style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'rgba(0,0,0,0.65)' }}>
                {normalized.alertMessage}
              </span>
            ) : null}
          </section>
        ) : null}
      </motion.div>
    </div>
  );
}
