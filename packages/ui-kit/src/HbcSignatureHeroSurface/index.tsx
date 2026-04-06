/**
 * HbcSignatureHeroSurface — Full-width flagship opening surface
 * Phase 17-03 — Shared primitive system rebuild
 *
 * Purpose-built surface for the homepage top band. Provides structured
 * slots for brand lockup, greeting, editorial headline, CTAs, metadata,
 * and operational signals. Designed for full-bleed placement with
 * motion-choreographed reveal and ambient decoration.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import styles from './signature-hero-surface.module.css';

const heroSurface = cva(styles.root, {
  variants: {
    background: {
      brand: styles.bgBrand,
      subtle: styles.bgSubtle,
    },
    layout: {
      full: '',
      compact: styles.compact,
    },
  },
  defaultVariants: {
    background: 'brand',
    layout: 'full',
  },
});

export type HeroBackground = 'brand' | 'subtle';
export type HeroLayout = 'full' | 'compact';

export interface HbcSignatureHeroSurfaceProps extends VariantProps<typeof heroSurface> {
  /** Brand lockup slot (logo + label) */
  brand?: React.ReactNode;
  /** Eyebrow text or node above the main content */
  eyebrow?: React.ReactNode;
  /** Left-column greeting slot */
  greeting?: React.ReactNode;
  /** Right-column editorial content (headline, message) */
  editorial?: React.ReactNode;
  /** CTA buttons */
  ctas?: React.ReactNode;
  /** Bottom-left context and alert area */
  context?: React.ReactNode;
  /** Bottom-right metadata */
  metadata?: React.ReactNode;
  /** Optional background image URL for gradient overlay */
  backgroundImage?: string;
  /** Accessible label for the hero section */
  'aria-label'?: string;
  className?: string;
}

const revealVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

export function HbcSignatureHeroSurface({
  brand,
  eyebrow,
  greeting,
  editorial,
  ctas,
  context,
  metadata,
  background,
  layout,
  backgroundImage,
  'aria-label': ariaLabel = 'Homepage hero',
  className,
}: HbcSignatureHeroSurfaceProps): React.JSX.Element {
  const bgStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(34,83,145,0.92) 0%, rgba(28,71,124,0.85) 40%, rgba(229,126,70,0.70) 100%), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <section
      aria-label={ariaLabel}
      className={clsx(heroSurface({ background, layout }), className)}
      style={bgStyle}
      data-hbc-premium="signature-hero-surface"
    >
      {/* Ambient decoration */}
      <div className={styles.ambientLayer} aria-hidden="true">
        <div className={styles.glowTopRight} />
        <div className={styles.glowBottomLeft} />
      </div>

      {/* Content */}
      <div className={styles.contentLayer}>
        {/* Top row */}
        {(brand || eyebrow) ? (
          <motion.div
            className={styles.topRow}
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            {brand ? <div className={styles.brandSlot}>{brand}</div> : null}
            {eyebrow ? <span className={styles.eyebrowSlot}>{eyebrow}</span> : null}
          </motion.div>
        ) : null}

        {/* Main content */}
        <div className={styles.mainContent}>
          {greeting ? (
            <motion.div
              className={styles.greetingSlot}
              variants={revealVariants}
              initial="hidden"
              animate="visible"
              custom={0.1}
            >
              {greeting}
            </motion.div>
          ) : null}
          <motion.div
            className={styles.editorialSlot}
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            <AnimatePresence>{editorial}</AnimatePresence>
            {ctas ? <div className={styles.ctaRow}>{ctas}</div> : null}
          </motion.div>
        </div>

        {/* Bottom row */}
        {(context || metadata) ? (
          <motion.div
            className={styles.bottomRow}
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            custom={0.3}
          >
            <div className={styles.bottomLeft}>{context}</div>
            {metadata}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
