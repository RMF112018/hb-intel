/**
 * HbcButton — Branded button with 4 variants + touch auto-scale
 * PH4.6 §Step 6 | Blueprint §1d
 * V2.1 Dec 31: detect (pointer: coarse) → auto-bump size by one tier
 */
import * as React from 'react';
import { Button, Spinner, mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import {
  HBC_ACCENT_ORANGE,
  HBC_ACCENT_ORANGE_HOVER,
  HBC_ACCENT_ORANGE_PRESSED,
  HBC_DANGER_HOVER,
  HBC_DANGER_PRESSED,
  HBC_HEADER_TEXT,
  HBC_STATUS_COLORS,
  HBC_SURFACE_LIGHT,
} from '../theme/tokens.js';
import { TRANSITION_FAST } from '../theme/animations.js';
import { HBC_RADIUS_MD } from '../theme/radii.js';
import { DENSITY_BREAKPOINTS } from '../theme/density.js';
import type { HbcButtonProps, ButtonSize } from './types.js';

const SIZE_STYLES: Record<ButtonSize, { height: string; fontSize: string; padding: string }> = {
  sm: { height: '28px', fontSize: '0.75rem', padding: '0 12px' },
  md: { height: '36px', fontSize: '0.875rem', padding: '0 16px' },
  lg: { height: '44px', fontSize: '1rem', padding: '0 24px' },
};

const useStyles = makeStyles({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontWeight: '600',
    border: 'none',
    borderRadius: HBC_RADIUS_MD,
    cursor: 'pointer',
    transitionProperty: 'background-color, box-shadow, opacity',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: HBC_SURFACE_LIGHT['border-focus'],
      outlineOffset: '2px',
    },
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  primary: {
    backgroundColor: HBC_ACCENT_ORANGE,
    color: HBC_HEADER_TEXT,
    ':hover:not(:disabled)': {
      backgroundColor: HBC_ACCENT_ORANGE_HOVER,
    },
    ':active:not(:disabled)': {
      backgroundColor: HBC_ACCENT_ORANGE_PRESSED,
    },
  },
  secondary: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover:not(:disabled)': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover:not(:disabled)': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  danger: {
    backgroundColor: HBC_STATUS_COLORS.error,
    color: HBC_HEADER_TEXT,
    ':hover:not(:disabled)': {
      backgroundColor: HBC_DANGER_HOVER,
    },
    ':active:not(:disabled)': {
      backgroundColor: HBC_DANGER_PRESSED,
    },
  },
  fullWidth: {
    width: '100%',
  },
  iconAfter: {
    flexDirection: 'row-reverse',
  },
});

/** V2.1 Dec 31: auto-bump size for coarse pointer (touch) devices */
function useTouchSize(requestedSize: ButtonSize): ButtonSize {
  const [isCoarse, setIsCoarse] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: coarse)');
    setIsCoarse(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsCoarse(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isCoarse) return requestedSize;
  if (requestedSize === 'sm') return 'md';
  if (requestedSize === 'md') return 'lg';
  return 'lg'; // lg stays lg but gets min 56px touch target
}

export const HbcButton: React.FC<HbcButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'before',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  className,
  type = 'button',
}) => {
  const styles = useStyles();
  const effectiveSize = useTouchSize(size);
  const sizeStyle = SIZE_STYLES[effectiveSize];

  // For lg on coarse pointer: ensure touch-tier min touch target per HBC_DENSITY_TOKENS
  const minHeight = effectiveSize === 'lg' ? `${DENSITY_BREAKPOINTS.touch}px` : undefined;

  return (
    <button
      data-hbc-ui="button"
      data-hbc-variant={variant}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={mergeClasses(
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        iconPosition === 'after' && styles.iconAfter,
        className,
      )}
      style={{
        height: sizeStyle.height,
        fontSize: sizeStyle.fontSize,
        padding: sizeStyle.padding,
        minHeight,
      }}
    >
      {loading ? (
        <Spinner size="tiny" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};

export type { HbcButtonProps, ButtonVariant, ButtonSize } from './types.js';
