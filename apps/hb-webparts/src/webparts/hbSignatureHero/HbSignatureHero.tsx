/**
 * HbSignatureHero — Canonical flagship homepage hero
 * Phase 16-03 — Unified signature hero with design breakout
 * Phase 18-01 — Canonicalized as the single homepage top-band surface
 * Phase 18-02 — Rebuilt as minimal premium identity surface
 * Phase 18-03 — Premium background system (charcoal base + authored image)
 * Phase 18-04 — Accessibility, authoring safety, and doctrine hardening
 *
 * This is the canonical homepage hero for HB Central. All flagship
 * homepage compositions must use this component.
 *
 * Content is intentionally locked to three identity elements:
 *   1. Company logo / brand lockup
 *   2. Tagline: "Build with GRIT."
 *   3. Personalized welcome message
 *
 * Authoring safety: The hero has no "unconfigured" or "empty" state
 * because all primary content is locked. The logo is a static asset,
 * the tagline is hardcoded, and the greeting falls back to "Good
 * {time-of-day}, there." when identity is unavailable. The optional
 * `backgroundImage` degrades to the charcoal textured fallback.
 *
 * Accessibility: WCAG 2.1 AA contrast verified against charcoal base.
 * All typography uses rem units for zoom resilience. Reduced-motion
 * media query disables all animation. No interactive elements.
 *
 * No gradient wash. No editorial furniture. No CTA clutter.
 */
import * as React from 'react';
import { motion } from '@hbc/ui-kit/homepage';
import { hedrickLogo } from '@hbc/ui-kit/branding';
import { resolveWelcomeMessage } from '../../homepage/helpers/welcomeMessage.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import styles from './signature-hero.module.css';

export interface HbSignatureHeroProps {
  identity: HomepageIdentityInput;
  /** Optional authored background image URL (wide, low-clutter photography preferred). */
  backgroundImage?: string;
  now?: Date;
}

/** Subtle reveal animation for content regions */
const revealVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

export function HbSignatureHero({
  identity,
  backgroundImage,
  now = new Date(),
}: HbSignatureHeroProps): React.JSX.Element {
  const message = resolveWelcomeMessage(identity, now);

  return (
    <section
      aria-label="HB Central homepage hero"
      className={styles.hero}
      data-hbc-premium="signature-hero"
    >
      {/* Background image layer (when authored image is provided) */}
      {backgroundImage ? (
        <>
          <div
            className={styles.backgroundImage}
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
          <div className={styles.backgroundScrim} aria-hidden="true" />
        </>
      ) : null}

      {/* Decorative layer — ambient depth and materiality */}
      <div className={styles.ambientLayer} aria-hidden="true">
        <div className={styles.vignette} />
        <div className={styles.warmShift} />
        <div className={styles.edgeHighlight} />
        <div className={styles.grain} />
      </div>

      {/* Content layer */}
      <div className={styles.contentLayer}>
        {/* Brand lockup */}
        <motion.div
          className={styles.brandLockup}
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <img src={hedrickLogo} alt="Hedrick Brothers" className={styles.brandLogo} />
          <span className={styles.brandLabel}>HB Central</span>
        </motion.div>

        {/* Identity block: tagline + greeting */}
        <div className={styles.identityBlock}>
          {/* Tagline */}
          <motion.p
            className={styles.tagline}
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            custom={0.12}
          >
            Build with GRIT.
          </motion.p>

          {/* Personalized greeting */}
          <motion.div
            className={styles.greetingBlock}
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            custom={0.24}
          >
            <span className={styles.greetingPrefix}>{message.greeting},</span>
            <span className={styles.greetingName}>{message.firstName}.</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
