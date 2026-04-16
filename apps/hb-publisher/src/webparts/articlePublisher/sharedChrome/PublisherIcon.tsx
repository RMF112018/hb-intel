/**
 * PublisherIcon — thin wrapper over `lucide-react` that normalises
 * Publisher iconography to one stroke weight, one sizing system, and
 * one tint contract. The Governing SPFx Standard (§5.2) mandates
 * lucide-react as the premium icon source; this wrapper keeps the
 * first-use call sites from drifting into per-feature stroke/size
 * decisions.
 *
 * Consumers import the raw lucide icon component and pass it in:
 *
 *     import { Bold } from 'lucide-react';
 *     <PublisherIcon icon={Bold} size="md" />
 *
 * Icon components stay tree-shakable; only the icons actually used in
 * the Publisher ship in the IIFE bundle.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import type { LucideIcon, LucideProps } from 'lucide-react';
import styles from './publisherIcon.module.css';

const publisherIconVariants = cva(styles.base, {
  variants: {
    size: {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    },
    tint: {
      inherit: styles.tintInherit,
      default: styles.tintDefault,
      muted: styles.tintMuted,
      brand: styles.tintBrand,
    },
  },
  defaultVariants: {
    size: 'md',
    tint: 'inherit',
  },
});

type IconVariants = VariantProps<typeof publisherIconVariants>;

export interface PublisherIconProps
  extends Omit<LucideProps, 'ref' | 'size' | 'color'>,
    IconVariants {
  readonly icon: LucideIcon;
}

const ICON_PIXEL_SIZE: Record<NonNullable<IconVariants['size']>, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

export const PublisherIcon = React.forwardRef<SVGSVGElement, PublisherIconProps>(
  function PublisherIcon({ icon: Icon, size, tint, className, strokeWidth, ...rest }, ref) {
    const resolvedSize = size ?? 'md';
    return (
      <Icon
        ref={ref}
        className={clsx(publisherIconVariants({ size: resolvedSize, tint }), className)}
        width={ICON_PIXEL_SIZE[resolvedSize]}
        height={ICON_PIXEL_SIZE[resolvedSize]}
        strokeWidth={strokeWidth ?? 1.75}
        aria-hidden={rest['aria-hidden'] ?? true}
        focusable={rest.focusable ?? false}
        {...rest}
      />
    );
  },
);

export type { LucideIcon };
