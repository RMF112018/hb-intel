/**
 * HbcPremiumSurface — Variant-driven premium surface container
 * Phase 16-02 — Shared premium primitive rebuild
 *
 * Replaces the mild card-variant approach with a cva-driven system
 * that produces materially distinct surfaces per homepage zone.
 * Each variant has its own background, border, shadow, radius,
 * padding, and interactive behavior — not just a weight tier.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import styles from './surface.module.css';

const surface = cva(styles.base, {
  variants: {
    intent: {
      signature: styles.signature,
      command: styles.command,
      editorial: styles.editorial,
      operational: styles.operational,
      discovery: styles.discovery,
    },
    elevation: {
      flat: styles.elevFlat,
      raised: styles.elevRaised,
      prominent: styles.elevProminent,
    },
    interactive: {
      true: styles.interactive,
    },
  },
  defaultVariants: {
    intent: 'editorial',
    elevation: 'raised',
  },
});

export type SurfaceIntent = 'signature' | 'command' | 'editorial' | 'operational' | 'discovery';
export type SurfaceElevation = 'flat' | 'raised' | 'prominent';

export interface HbcPremiumSurfaceProps
  extends Omit<VariantProps<typeof surface>, 'interactive'> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  /** Optional header region */
  header?: React.ReactNode;
  /** Optional footer region */
  footer?: React.ReactNode;
  'aria-label'?: string;
}

export function HbcPremiumSurface({
  children,
  intent,
  elevation,
  interactive: isInteractive,
  header,
  footer,
  className,
  'aria-label': ariaLabel,
}: HbcPremiumSurfaceProps): React.JSX.Element {
  const Wrapper = isInteractive ? motion.div : 'div';
  const motionProps = isInteractive
    ? { whileHover: { y: -2, transition: { duration: 0.15 } } }
    : {};

  return (
    <Wrapper
      className={clsx(surface({ intent, elevation, interactive: isInteractive || undefined }), className)}
      data-hbc-premium="surface"
      data-hbc-intent={intent ?? 'editorial'}
      aria-label={ariaLabel}
      {...motionProps}
    >
      {header ? <div className={styles.header}>{header}</div> : null}
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </Wrapper>
  );
}
