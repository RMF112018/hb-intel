/**
 * HbSignatureHero — Canonical flagship homepage hero (rebuilt from zero)
 *
 * Phase 01-02 — Complete structural rebuild as premium identity plate.
 *
 * This is the canonical homepage hero for HB Central. All flagship
 * homepage compositions must use this component.
 *
 * Composition model:
 *   Two-zone flex row — text-left / logo-right.
 *   The hero occupies the full available width of a SharePoint
 *   full-width section. Text content (greeting + tagline) anchors
 *   on the left as the primary focal point. The full-color company
 *   logo sits on the right, creating a premium branded masthead.
 *
 * Locked content:
 *   1. Personalized greeting — warm entry line, refined (left)
 *   2. Tagline: "Build with GRIT." — primary typographic statement (left)
 *   3. Company logo — full-color, balanced (right)
 *
 * Background system:
 *   - Default: repo-controlled banner_home_7.png (center-cropped)
 *   - Override: authored photography URL via backgroundImage prop
 *   - Readability scrim overlay for text contrast
 *   - Fallback: deep charcoal field with material grain texture (when image fails)
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

/** Default banner filename deployed alongside JS/CSS in the .sppkg ClientSideAssets. */
const DEFAULT_BANNER = 'banner_home_7.png';

export interface HbSignatureHeroProps {
  identity: HomepageIdentityInput;
  /** Optional authored background image URL (wide, low-clutter photography preferred). */
  backgroundImage?: string;
  /** CDN base URL for static assets (injected by SPFx shell at runtime). */
  assetBaseUrl?: string;
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
  assetBaseUrl,
  now = new Date(),
}: HbSignatureHeroProps): React.JSX.Element {
  const message = resolveWelcomeMessage(identity, now);
  const heroBackground = backgroundImage ?? (assetBaseUrl ? assetBaseUrl + DEFAULT_BANNER : undefined);

  return (
    <section
      aria-label="HB Central homepage hero"
      className={styles.surface}
      data-hbc-premium="signature-hero"
    >
      {/* ── Background ── */}
      {heroBackground ? (
        <div
          className={styles.photo}
          style={{ backgroundImage: `url(${heroBackground})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.brighten} aria-hidden="true" />

      {/* ── Content — text-left / logo-right ── */}
      <div className={styles.content}>
        {/* Left zone: greeting + tagline */}
        <div className={styles.textZone}>
          <motion.div
            className={styles.greeting}
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={0}
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
            custom={0.1}
          >
            Build with GRIT.
          </motion.h1>
        </div>

        {/* Right zone: full-color logo */}
        <motion.div
          className={styles.logoZone}
          variants={reveal}
          initial="hidden"
          animate="show"
          custom={0.2}
        >
          <img
            src={hedrickLogo}
            alt="Hedrick Brothers"
            className={styles.logo}
          />
        </motion.div>
      </div>
    </section>
  );
}
