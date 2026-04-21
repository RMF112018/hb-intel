/**
 * HbcPremiumCta — Premium call-to-action with motion interaction
 * Phase 16-02 — Shared premium primitive rebuild
 *
 * Replaces the mild link/button CTA with a motion-enhanced,
 * cva-driven system that produces distinct CTA treatments per context.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import styles from './cta.module.css';

const ctaVariants = cva(styles.base, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      ghost: styles.ghost,
      onDark: styles.onDark,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
  },
  defaultVariants: {
    variant: 'ghost',
    size: 'md',
  },
});

export type PremiumCtaVariant = 'primary' | 'secondary' | 'ghost' | 'onDark';
export type PremiumCtaSize = 'sm' | 'md' | 'lg';

export interface HbcPremiumCtaProps extends VariantProps<typeof ctaVariants> {
  label: string;
  href: string;
  /** Show trailing arrow indicator */
  arrow?: boolean;
  /** Open in new tab */
  external?: boolean;
  className?: string;
}

export function HbcPremiumCta({
  label,
  href,
  variant,
  size,
  arrow = false,
  external = false,
  className,
}: HbcPremiumCtaProps): React.JSX.Element {
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.a
      href={href}
      className={clsx(ctaVariants({ variant, size }), className)}
      data-hbc-premium="cta"
      whileHover={prefersReducedMotion ? undefined : { x: arrow ? 2 : 0 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.15 }}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span>{label}</span>
      {arrow && !external ? (
        <ArrowRight size={iconSize} className={styles.arrowIcon} aria-hidden="true" />
      ) : null}
      {external ? (
        <ExternalLink size={iconSize} className={styles.arrowIcon} aria-hidden="true" />
      ) : null}
    </motion.a>
  );
}
