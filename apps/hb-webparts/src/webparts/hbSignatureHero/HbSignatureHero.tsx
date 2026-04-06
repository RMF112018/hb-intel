/**
 * HbSignatureHero — Canonical flagship homepage hero (rebuilt from zero)
 *
 * Phase 01-02 — Complete structural rebuild as premium identity plate.
 *
 * This is the canonical homepage hero for HB Central. All flagship
 * homepage compositions must use this component.
 *
 * Composition model:
 *   CSS Grid with a single content region anchored bottom-left.
 *   The hero occupies the full available width of a SharePoint
 *   full-width section. Content sits within a constrained column
 *   that leaves intentional negative space on the right, creating
 *   asymmetric visual balance across the full canvas.
 *
 * Locked content:
 *   1. Company logo — subtle, supporting
 *   2. Personalized greeting — warm entry line, refined
 *   3. Tagline: "Build with GRIT." — primary typographic statement
 *
 * Background system:
 *   - Authored photography (optional) with gradient scrim for readability
 *   - Fallback: deep charcoal field with material grain texture
 *   - No gradient wash, no glow effects, no decorative overlays
 *
 * Accessibility:
 *   - WCAG 2.1 AA contrast verified against charcoal base
 *   - All typography uses rem units for zoom resilience
 *   - prefers-reduced-motion disables all animation
 *   - No interactive elements
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

/**
 * Reveal choreography — content fades up from below with a soft ease.
 * The brand lockup, tagline, and greeting enter as a staggered sequence
 * so the eye settles naturally down the hierarchy.
 */
const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
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
      className={styles.surface}
      data-hbc-premium="signature-hero"
    >
      {/* ── Background ── */}
      {backgroundImage ? (
        <div
          className={styles.photo}
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      {/* ── Content ── */}
      <div className={styles.content}>
        {/* Brand lockup — subtle top anchor */}
        <motion.div
          className={styles.lockup}
          variants={reveal}
          initial="hidden"
          animate="show"
          custom={0}
        >
          <img
            src={hedrickLogo}
            alt="Hedrick Brothers"
            className={styles.logo}
          />
        </motion.div>

        {/* Identity cluster — greeting + tagline */}
        <div className={styles.identity}>
          <motion.div
            className={styles.greeting}
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={0.1}
          >
            <span className={styles.greetingLine}>
              {message.greeting},
            </span>
            <span className={styles.greetingName}>
              {message.firstName}.
            </span>
          </motion.div>

          <motion.h1
            className={styles.tagline}
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={0.2}
          >
            Build with GRIT.
          </motion.h1>
        </div>
      </div>
    </section>
  );
}
