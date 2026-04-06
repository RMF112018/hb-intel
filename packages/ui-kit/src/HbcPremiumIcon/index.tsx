/**
 * HbcPremiumIcon — Lucide-based icon container with premium styling
 * Phase 16-02 — Shared premium primitive rebuild
 *
 * Replaces the text-character/Unicode HbcHomepageIconFrame with real
 * SVG icons from lucide-react. Supports size and tint variants via cva.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './icon.module.css';

const iconFrame = cva(styles.base, {
  variants: {
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
      xl: styles.xl,
    },
    tint: {
      brand: styles.tintBrand,
      warm: styles.tintWarm,
      accent: styles.tintAccent,
      neutral: styles.tintNeutral,
      subtle: styles.tintSubtle,
      danger: styles.tintDanger,
      success: styles.tintSuccess,
    },
  },
  defaultVariants: {
    size: 'md',
    tint: 'brand',
  },
});

export type PremiumIconSize = 'sm' | 'md' | 'lg' | 'xl';
export type PremiumIconTint = 'brand' | 'warm' | 'accent' | 'neutral' | 'subtle' | 'danger' | 'success';

export interface HbcPremiumIconProps extends VariantProps<typeof iconFrame> {
  /** Lucide icon component (e.g., Shield, DollarSign, Users) */
  icon: LucideIcon;
  /** Accessible label — renders role="img" with aria-label when provided */
  label?: string;
  className?: string;
}

/** Map icon size variant to lucide icon pixel size */
const ICON_SIZE_MAP: Record<string, number> = {
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
};

export function HbcPremiumIcon({
  icon: IconComponent,
  size,
  tint,
  label,
  className,
}: HbcPremiumIconProps): React.JSX.Element {
  const iconPx = ICON_SIZE_MAP[size ?? 'md'];

  return (
    <span
      className={clsx(iconFrame({ size, tint }), className)}
      data-hbc-premium="icon"
      {...(label
        ? { role: 'img' as const, 'aria-label': label }
        : { 'aria-hidden': 'true' as const })}
    >
      <IconComponent size={iconPx} strokeWidth={2} />
    </span>
  );
}
