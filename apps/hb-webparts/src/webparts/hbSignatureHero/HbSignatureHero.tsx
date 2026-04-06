/**
 * HbSignatureHero — Canonical flagship homepage hero
 * Phase 16-03 — Unified signature hero with design breakout
 * Phase 18-01 — Canonicalized as the single homepage top-band surface
 *
 * This is the canonical homepage hero for HB Central. All flagship
 * homepage compositions must use this component. The split-path pattern
 * (separate `hbHeroBanner` + `personalizedWelcomeHeader`) is retired
 * for flagship homepage use.
 *
 * Merges the personalized greeting and hero content into ONE integrated
 * premium surface. The greeting is no longer a separate adjacent card —
 * it lives inside the hero as the leading personal moment before the
 * editorial content. Uses motion for reveal choreography, lucide for
 * icon accents, and cva for internal region variants.
 *
 * Composition:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [brand lockup]                        [eyebrow]   │
 *   │                                                     │
 *   │  Good morning,                                      │
 *   │  Jordan.              HEADLINE                      │
 *   │  support line         message copy                  │
 *   │                       [CTA primary] [CTA secondary] │
 *   │  [context] [alert]                     [metadata]   │
 *   └─────────────────────────────────────────────────────┘
 */
import * as React from 'react';
import {
  motion,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  HbcPremiumBadge,
} from '@hbc/ui-kit/homepage';
import { hedrickLogo } from '@hbc/ui-kit/branding';
import { normalizeWelcomeHeaderConfig } from '../../homepage/helpers/topBandConfig.js';
import { normalizeHeroBannerConfig } from '../../homepage/helpers/topBandConfig.js';
import { resolveWelcomeMessage } from '../../homepage/helpers/welcomeMessage.js';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { PersonalizedWelcomeHeaderConfig } from '../../homepage/webparts/topBandContracts.js';
import type { HbHeroBannerConfig } from '../../homepage/webparts/topBandContracts.js';
import styles from './signature-hero.module.css';

export interface HbSignatureHeroProps {
  identity: HomepageIdentityInput;
  welcomeConfig?: Partial<PersonalizedWelcomeHeaderConfig>;
  heroConfig?: Partial<HbHeroBannerConfig>;
  now?: Date;
}

const ALERT_STATUS_MAP = {
  none: 'neutral',
  info: 'info',
  warning: 'warning',
  critical: 'critical',
} as const;

/** Subtle reveal animation for content regions */
const revealVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

export function HbSignatureHero({
  identity,
  welcomeConfig,
  heroConfig,
  now = new Date(),
}: HbSignatureHeroProps): React.JSX.Element {
  const welcome = normalizeWelcomeHeaderConfig(welcomeConfig);
  const hero = normalizeHeroBannerConfig(heroConfig);
  const message = resolveWelcomeMessage(identity, now);
  const isConfigured = Boolean(heroConfig) && Boolean(heroConfig?.headline?.trim());

  if (!isConfigured) {
    const authMsg = resolveAuthoringMessage('hbHeroBanner', heroConfig ? 'invalid' : 'noData');
    return <HomepageEmptyState title={authMsg.title} description={authMsg.description} />;
  }

  const hasAlert = welcome.alertSeverity !== 'none' && (welcome.alertTitle || welcome.alertMessage);
  const hasCta = Boolean(hero.cta);
  const hasSecondaryCta = Boolean(hero.secondaryCta);

  const background = hero.background?.src
    ? `linear-gradient(135deg, rgba(34,83,145,0.92) 0%, rgba(28,71,124,0.85) 40%, rgba(229,126,70,0.70) 100%), url(${hero.background.src})`
    : 'linear-gradient(135deg, rgba(34,83,145,0.95) 0%, rgba(28,71,124,0.90) 45%, rgba(229,126,70,0.75) 100%)';

  return (
    <section
      aria-label="HB Central homepage hero"
      className={styles.hero}
      style={{ background, backgroundSize: 'cover', backgroundPosition: 'center' }}
      data-hbc-premium="signature-hero"
    >
      {/* Decorative layer — ambient glow elements */}
      <div className={styles.ambientLayer} aria-hidden="true">
        <div className={styles.glowTopRight} />
        <div className={styles.glowBottomLeft} />
        <div className={styles.edgeHighlight} />
      </div>

      {/* Content layer */}
      <div className={styles.contentLayer}>
        {/* Top row: brand lockup + eyebrow */}
        <motion.div
          className={styles.topRow}
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <div className={styles.brandLockup}>
            <img src={hedrickLogo} alt="Hedrick Brothers" className={styles.brandLogo} />
            <span className={styles.brandLabel}>HB Central</span>
          </div>
          {hero.eyebrow ? (
            <span className={styles.eyebrow}>{hero.eyebrow}</span>
          ) : null}
        </motion.div>

        {/* Main content: two-column greeting + editorial */}
        <div className={styles.mainContent}>
          {/* Left column: personalized greeting */}
          <motion.div
            className={styles.greetingColumn}
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            custom={0.1}
          >
            <div className={styles.greetingBlock}>
              <span className={styles.greetingPrefix}>{message.greeting},</span>
              <span className={styles.greetingName}>{message.firstName}.</span>
            </div>
            {welcome.supportLine ? (
              <p className={styles.supportLine}>{welcome.supportLine}</p>
            ) : null}
          </motion.div>

          {/* Right column: editorial headline + message + CTAs */}
          <motion.div
            className={styles.editorialColumn}
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            <h2 className={styles.headline}>{hero.headline}</h2>
            {hero.message ? (
              <p className={styles.heroMessage}>{hero.message}</p>
            ) : null}
            {(hasCta || hasSecondaryCta) ? (
              <div className={styles.ctaRow}>
                {hero.cta ? (
                  <motion.a
                    href={hero.cta.href}
                    className={styles.ctaPrimary}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    {...(hero.cta.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span>{hero.cta.label}</span>
                    {hero.cta.openInNewTab
                      ? <ExternalLink size={14} aria-hidden="true" />
                      : <ArrowRight size={14} aria-hidden="true" />}
                  </motion.a>
                ) : null}
                {hero.secondaryCta ? (
                  <a
                    href={hero.secondaryCta.href}
                    className={styles.ctaSecondary}
                    {...(hero.secondaryCta.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span>{hero.secondaryCta.label}</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </div>

        {/* Bottom row: context/alert + metadata */}
        <motion.div
          className={styles.bottomRow}
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          custom={0.3}
        >
          <div className={styles.bottomLeft}>
            {welcome.contextLine ? (
              <span className={styles.contextLine}>
                <Calendar size={12} aria-hidden="true" />
                {welcome.contextLine}
              </span>
            ) : null}
            {hasAlert ? (
              <div className={styles.alertChip}>
                <AlertTriangle size={12} aria-hidden="true" />
                <HbcPremiumBadge
                  label={welcome.alertTitle ?? 'Alert'}
                  status={ALERT_STATUS_MAP[welcome.alertSeverity ?? 'none']}
                  size="sm"
                />
                {welcome.alertMessage ? (
                  <span className={styles.alertText}>{welcome.alertMessage}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          {hero.metadata ? (
            <span className={styles.metadata}>{hero.metadata}</span>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
